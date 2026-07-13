<?php

namespace Tests\Feature\Child;

use App\Enums\ContentStatus;
use App\Models\Activity;
use App\Models\ChildProfile;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Skill;
use App\Models\Subject;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MathematicsEngineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
    }

    /**
     * @return array{0: User, 1: ChildProfile}
     */
    private function loginAsChild(): array
    {
        $parent = User::factory()->create()->assignRole('parent');
        $child = ChildProfile::factory()->create([
            'parent_id' => $parent->id,
            'pin_hash' => Hash::make('4242'),
        ]);

        $this->actingAs($parent)
            ->post(route('parent.children.authenticate', $child), ['pin' => '4242']);

        return [$parent, $child];
    }

    private function publishedLesson(): Lesson
    {
        $subject = Subject::factory()->create();
        $skill = Skill::factory()->create(['subject_id' => $subject->id]);
        $course = Course::factory()->create(['skill_id' => $skill->id, 'status' => ContentStatus::Published]);
        $unit = Unit::factory()->create(['course_id' => $course->id, 'status' => ContentStatus::Published]);

        return Lesson::factory()->create(['unit_id' => $unit->id, 'status' => ContentStatus::Published]);
    }

    public function test_child_sees_only_subjects_with_published_lessons(): void
    {
        [, $child] = $this->loginAsChild();

        $lesson = $this->publishedLesson();
        Subject::factory()->create(); // a subject with no published content

        $response = $this->get(route('child.subjects.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Child/Subjects')
            ->has('subjects', 2)
        );
    }

    public function test_draft_lesson_is_not_visible_to_a_child(): void
    {
        [, $child] = $this->loginAsChild();

        $subject = Subject::factory()->create();
        $skill = Skill::factory()->create(['subject_id' => $subject->id]);
        $course = Course::factory()->create(['skill_id' => $skill->id, 'status' => ContentStatus::Published]);
        $unit = Unit::factory()->create(['course_id' => $course->id, 'status' => ContentStatus::Published]);
        $draftLesson = Lesson::factory()->create(['unit_id' => $unit->id, 'status' => ContentStatus::Draft]);

        $response = $this->get(route('child.lessons.show', $draftLesson));

        $response->assertNotFound();
    }

    public function test_child_can_answer_a_multiple_choice_question_correctly(): void
    {
        [, $child] = $this->loginAsChild();

        $lesson = $this->publishedLesson();
        $activity = Activity::factory()->create(['lesson_id' => $lesson->id, 'type' => 'multiple_choice']);
        $question = Question::factory()->create(['activity_id' => $activity->id, 'type' => 'multiple_choice', 'points' => 10]);
        $correctOption = QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $playResponse = $this->get(route('child.activities.play', $activity));
        $playResponse->assertOk();
        $playResponse->assertInertia(fn ($page) => $page->has('question'));

        $answerResponse = $this->post(route('child.activities.answer', $activity), [
            'option_id' => $correctOption->id,
        ]);
        $answerResponse->assertRedirect(route('child.activities.play', $activity));

        $this->assertDatabaseHas('question_attempts', [
            'question_id' => $question->id,
            'is_correct' => true,
            'points_earned' => 10,
        ]);

        // The request right after answering shows a feedback screen first.
        $feedbackResponse = $this->get(route('child.activities.play', $activity));
        $feedbackResponse->assertInertia(fn ($page) => $page
            ->has('feedback')
            ->where('feedback.is_correct', true)
        );

        $summaryResponse = $this->get(route('child.activities.play', $activity));
        $summaryResponse->assertInertia(fn ($page) => $page
            ->has('summary')
            ->where('summary.correct_count', 1)
            ->where('summary.points_earned', 10)
        );

        $this->assertDatabaseHas('activity_attempts', [
            'child_profile_id' => $child->id,
            'activity_id' => $activity->id,
            'correct_count' => 1,
        ]);
    }

    public function test_child_can_answer_a_multiple_choice_question_incorrectly(): void
    {
        $this->loginAsChild();

        $lesson = $this->publishedLesson();
        $activity = Activity::factory()->create(['lesson_id' => $lesson->id, 'type' => 'multiple_choice']);
        $question = Question::factory()->create(['activity_id' => $activity->id, 'type' => 'multiple_choice', 'points' => 10]);
        QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        $wrongOption = QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $this->post(route('child.activities.answer', $activity), ['option_id' => $wrongOption->id]);

        $this->assertDatabaseHas('question_attempts', [
            'question_id' => $question->id,
            'is_correct' => false,
            'points_earned' => 0,
        ]);
    }

    public function test_number_input_question_is_graded_by_value(): void
    {
        $this->loginAsChild();

        $lesson = $this->publishedLesson();
        $activity = Activity::factory()->create(['lesson_id' => $lesson->id, 'type' => 'number_input']);
        $question = Question::factory()->create([
            'activity_id' => $activity->id,
            'type' => 'number_input',
            'correct_answer' => ['value' => '7'],
            'points' => 5,
        ]);

        $this->post(route('child.activities.answer', $activity), ['answer_text' => '7']);

        $this->assertDatabaseHas('question_attempts', [
            'question_id' => $question->id,
            'is_correct' => true,
        ]);
    }

    public function test_activity_attempt_completes_after_all_questions_answered(): void
    {
        $this->loginAsChild();

        $lesson = $this->publishedLesson();
        $activity = Activity::factory()->create(['lesson_id' => $lesson->id, 'type' => 'multiple_choice']);

        $questions = Question::factory()->count(2)->create(['activity_id' => $activity->id, 'type' => 'multiple_choice']);
        foreach ($questions as $question) {
            QuestionOption::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        }

        foreach ($questions as $question) {
            $option = $question->options()->first();
            $this->post(route('child.activities.answer', $activity), ['option_id' => $option->id]);
        }

        $this->assertDatabaseHas('activity_attempts', [
            'activity_id' => $activity->id,
            'total_questions' => 2,
            'correct_count' => 2,
        ]);

        $attempt = \App\Models\ActivityAttempt::query()->where('activity_id', $activity->id)->sole();
        $this->assertNotNull($attempt->completed_at);
    }

    public function test_unsupported_question_format_is_not_playable(): void
    {
        $this->loginAsChild();

        $lesson = $this->publishedLesson();
        $activity = Activity::factory()->create(['lesson_id' => $lesson->id, 'type' => 'drag_drop']);

        $response = $this->get(route('child.activities.play', $activity));

        $response->assertNotFound();
    }

    public function test_child_cannot_play_an_activity_under_an_unpublished_lesson(): void
    {
        $this->loginAsChild();

        $subject = Subject::factory()->create();
        $skill = Skill::factory()->create(['subject_id' => $subject->id]);
        $course = Course::factory()->create(['skill_id' => $skill->id, 'status' => ContentStatus::Draft]);
        $unit = Unit::factory()->create(['course_id' => $course->id, 'status' => ContentStatus::Draft]);
        $lesson = Lesson::factory()->create(['unit_id' => $unit->id, 'status' => ContentStatus::Draft]);
        $activity = Activity::factory()->create(['lesson_id' => $lesson->id, 'type' => 'multiple_choice']);

        $response = $this->get(route('child.activities.play', $activity));

        $response->assertNotFound();
    }
}

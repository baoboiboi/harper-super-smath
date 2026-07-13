<?php

namespace Tests\Feature\Child;

use App\Enums\ContentStatus;
use App\Models\ChildProfile;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Skill;
use App\Models\Subject;
use App\Models\TypingExercise;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TypingEngineTest extends TestCase
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

    public function test_child_sees_typing_exercise_on_lesson_page(): void
    {
        $this->loginAsChild();

        $lesson = $this->publishedLesson();
        TypingExercise::factory()->create(['lesson_id' => $lesson->id, 'title' => 'Home Row Warm-Up']);

        $response = $this->get(route('child.lessons.show', $lesson));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('typingExercises', 1)
            ->where('typingExercises.0.title', 'Home Row Warm-Up')
        );
    }

    public function test_child_can_complete_a_typing_exercise_and_results_are_recorded(): void
    {
        [, $child] = $this->loginAsChild();

        $lesson = $this->publishedLesson();
        $exercise = TypingExercise::factory()->create([
            'lesson_id' => $lesson->id,
            'target_text' => 'cat',
            'points' => 10,
        ]);

        $playResponse = $this->get(route('child.typing-exercises.play', $exercise));
        $playResponse->assertOk();
        $playResponse->assertInertia(fn ($page) => $page->where('exercise.target_text', 'cat'));

        $completeResponse = $this->post(route('child.typing-exercises.complete', $exercise), [
            'typed_text' => 'cat',
            'elapsed_seconds' => 6,
        ]);
        $completeResponse->assertRedirect(route('child.typing-exercises.play', $exercise));

        $this->assertDatabaseHas('typing_sessions', [
            'child_profile_id' => $child->id,
            'typing_exercise_id' => $exercise->id,
            'typed_text' => 'cat',
            'accuracy_percent' => 100,
            'points_earned' => 10,
        ]);

        $summaryResponse = $this->get(route('child.typing-exercises.play', $exercise));
        $summaryResponse->assertInertia(fn ($page) => $page
            ->has('summary')
            ->where('summary.accuracy_percent', 100)
        );
    }

    public function test_partial_accuracy_earns_partial_points(): void
    {
        $this->loginAsChild();

        $lesson = $this->publishedLesson();
        $exercise = TypingExercise::factory()->create([
            'lesson_id' => $lesson->id,
            'target_text' => 'cat',
            'points' => 10,
        ]);

        // 2 of 3 characters correct = 67% accuracy -> 7 points (round(10 * 0.67)).
        $this->post(route('child.typing-exercises.complete', $exercise), [
            'typed_text' => 'cbt',
            'elapsed_seconds' => 6,
        ]);

        $this->assertDatabaseHas('typing_sessions', [
            'typing_exercise_id' => $exercise->id,
            'accuracy_percent' => 67,
            'points_earned' => 7,
        ]);
    }

    public function test_typing_exercise_under_a_draft_lesson_is_not_playable(): void
    {
        $this->loginAsChild();

        $subject = Subject::factory()->create();
        $skill = Skill::factory()->create(['subject_id' => $subject->id]);
        $course = Course::factory()->create(['skill_id' => $skill->id, 'status' => ContentStatus::Draft]);
        $unit = Unit::factory()->create(['course_id' => $course->id, 'status' => ContentStatus::Draft]);
        $lesson = Lesson::factory()->create(['unit_id' => $unit->id, 'status' => ContentStatus::Draft]);
        $exercise = TypingExercise::factory()->create(['lesson_id' => $lesson->id]);

        $response = $this->get(route('child.typing-exercises.play', $exercise));

        $response->assertNotFound();
    }

    public function test_curriculum_manager_can_create_a_typing_exercise(): void
    {
        $manager = User::factory()->create()->assignRole('curriculum_manager');
        $lesson = Lesson::factory()->create();

        $response = $this->actingAs($manager)->post(route('admin.curriculum.typing-exercises.store'), [
            'lesson_id' => $lesson->id,
            'type' => 'word_typing',
            'title' => 'Animal Words',
            'target_text' => 'cat dog bird',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('typing_exercises', ['title' => 'Animal Words']);
    }

    public function test_non_curriculum_user_cannot_create_a_typing_exercise(): void
    {
        $parent = User::factory()->create()->assignRole('parent');
        $lesson = Lesson::factory()->create();

        $response = $this->actingAs($parent)->post(route('admin.curriculum.typing-exercises.store'), [
            'lesson_id' => $lesson->id,
            'type' => 'word_typing',
            'title' => 'Animal Words',
            'target_text' => 'cat dog bird',
        ]);

        $response->assertForbidden();
    }
}

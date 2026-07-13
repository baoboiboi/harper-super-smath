<?php

namespace Tests\Feature\Admin\Curriculum;

use App\Models\Activity;
use App\Models\Course;
use App\Models\GradeLevel;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\Skill;
use App\Models\Subject;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CurriculumManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_curriculum_manager_can_create_a_subject(): void
    {
        $manager = User::factory()->create()->assignRole('curriculum_manager');

        $response = $this->actingAs($manager)->post(route('admin.curriculum.subjects.store'), [
            'name' => 'Mathematics',
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('subjects', ['name' => 'Mathematics', 'slug' => 'mathematics']);
    }

    public function test_user_without_curriculum_permission_cannot_view_subjects(): void
    {
        $parent = User::factory()->create()->assignRole('parent');

        $response = $this->actingAs($parent)->get(route('admin.curriculum.subjects.index'));

        $response->assertForbidden();
    }

    public function test_finance_manager_without_curriculum_permission_cannot_create_a_subject(): void
    {
        $finance = User::factory()->create()->assignRole('finance_manager');

        $response = $this->actingAs($finance)->post(route('admin.curriculum.subjects.store'), [
            'name' => 'Mathematics',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('subjects', ['name' => 'Mathematics']);
    }

    public function test_creating_a_skill_requires_an_existing_subject(): void
    {
        $manager = User::factory()->create()->assignRole('curriculum_manager');

        $response = $this->actingAs($manager)->post(route('admin.curriculum.skills.store'), [
            'subject_id' => 999,
            'name' => 'Addition',
        ]);

        $response->assertSessionHasErrors('subject_id');
    }

    public function test_full_curriculum_hierarchy_can_be_authored_end_to_end(): void
    {
        $manager = User::factory()->create()->assignRole('curriculum_manager');
        $this->actingAs($manager);

        $this->post(route('admin.curriculum.subjects.store'), ['name' => 'Mathematics'])->assertRedirect();
        $subject = Subject::sole();

        $this->post(route('admin.curriculum.grade-levels.store'), ['name' => 'Grade 1'])->assertRedirect();
        $gradeLevel = GradeLevel::sole();

        $this->post(route('admin.curriculum.skills.store'), [
            'subject_id' => $subject->id,
            'grade_level_id' => $gradeLevel->id,
            'name' => 'Addition',
        ])->assertRedirect();
        $skill = Skill::sole();

        $this->post(route('admin.curriculum.courses.store'), [
            'skill_id' => $skill->id,
            'title' => 'Addition Foundations',
            'status' => 'draft',
        ])->assertRedirect();
        $course = Course::sole();

        $this->post(route('admin.curriculum.units.store'), [
            'course_id' => $course->id,
            'title' => 'Numbers 1-10',
            'status' => 'draft',
        ])->assertRedirect();
        $unit = Unit::sole();

        $this->post(route('admin.curriculum.lessons.store'), [
            'unit_id' => $unit->id,
            'title' => 'Adding with Pictures',
            'difficulty' => 1,
            'status' => 'draft',
        ])->assertRedirect();
        $lesson = Lesson::sole();

        $this->post(route('admin.curriculum.activities.store'), [
            'lesson_id' => $lesson->id,
            'type' => 'multiple_choice',
            'title' => 'Warm Up',
        ])->assertRedirect();
        $activity = Activity::sole();

        $this->post(route('admin.curriculum.questions.store'), [
            'activity_id' => $activity->id,
            'type' => 'multiple_choice',
            'prompt' => '1 + 1 = ?',
        ])->assertRedirect();
        $question = Question::sole();

        $this->post(route('admin.curriculum.question-options.store'), [
            'question_id' => $question->id,
            'label' => '2',
            'is_correct' => true,
        ])->assertRedirect();

        $this->assertDatabaseHas('question_options', [
            'question_id' => $question->id,
            'label' => '2',
            'is_correct' => true,
        ]);

        $editorResponse = $this->get(route('admin.curriculum.lessons.show', $lesson));
        $editorResponse->assertOk();
    }

    public function test_deleting_a_subject_cascades_to_its_descendants(): void
    {
        $manager = User::factory()->create()->assignRole('curriculum_manager');

        $subject = Subject::factory()->create();
        $skill = Skill::factory()->create(['subject_id' => $subject->id]);
        $course = Course::factory()->create(['skill_id' => $skill->id]);
        $unit = Unit::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['unit_id' => $unit->id]);
        $activity = Activity::factory()->create(['lesson_id' => $lesson->id]);
        $question = Question::factory()->create(['activity_id' => $activity->id]);

        $this->actingAs($manager)->delete(route('admin.curriculum.subjects.destroy', $subject))
            ->assertRedirect();

        $this->assertDatabaseMissing('subjects', ['id' => $subject->id]);
        $this->assertDatabaseMissing('skills', ['id' => $skill->id]);
        $this->assertDatabaseMissing('courses', ['id' => $course->id]);
        $this->assertDatabaseMissing('units', ['id' => $unit->id]);
        $this->assertDatabaseMissing('lessons', ['id' => $lesson->id]);
        $this->assertDatabaseMissing('activities', ['id' => $activity->id]);
        $this->assertDatabaseMissing('questions', ['id' => $question->id]);
    }
}

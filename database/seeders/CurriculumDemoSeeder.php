<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\Activity;
use App\Models\Course;
use App\Models\GradeLevel;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Skill;
use App\Models\Subject;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class CurriculumDemoSeeder extends Seeder
{
    /**
     * Seeds the Subject -> Grade Level -> Skill -> Course -> Unit -> Lesson ->
     * Activity -> Question -> Options example hierarchy, for local development only.
     */
    public function run(): void
    {
        $mathematics = Subject::create([
            'name' => 'Mathematics',
            'icon' => '🔢',
            'description' => 'Number sense, arithmetic, and problem solving.',
        ]);

        $grade1 = GradeLevel::create(['name' => 'Grade 1']);

        $addition = Skill::create([
            'subject_id' => $mathematics->id,
            'grade_level_id' => $grade1->id,
            'name' => 'Addition',
            'description' => 'Combining numbers to find a total.',
        ]);

        $course = Course::create([
            'skill_id' => $addition->id,
            'title' => 'Addition Foundations',
            'status' => ContentStatus::Published,
            'published_at' => now(),
        ]);

        $unit = Unit::create([
            'course_id' => $course->id,
            'title' => 'Numbers 1-10',
            'status' => ContentStatus::Published,
            'published_at' => now(),
        ]);

        $lesson = Lesson::create([
            'unit_id' => $unit->id,
            'title' => 'Adding with Pictures',
            'description' => 'Count pictures to find the sum of two small numbers.',
            'learning_objective' => 'Add two numbers within 10 using visual counting.',
            'difficulty' => 1,
            'estimated_minutes' => 5,
            'points_available' => 20,
            'status' => ContentStatus::Published,
            'published_at' => now(),
        ]);

        $activity = Activity::create([
            'lesson_id' => $lesson->id,
            'type' => 'visual_counting',
            'title' => 'Visual Counting Activity',
            'instructions' => 'Count the pictures, then choose the correct total.',
            'points' => 20,
        ]);

        $question = Question::create([
            'activity_id' => $activity->id,
            'type' => 'multiple_choice',
            'prompt' => '🍎🍎 + 🍎 = ?',
            'hint' => 'Count all the apples together.',
            'explanation' => '2 apples plus 1 apple makes 3 apples.',
            'points' => 20,
        ]);

        foreach ([2, 3, 4, 5] as $value) {
            QuestionOption::create([
                'question_id' => $question->id,
                'label' => (string) $value,
                'value' => (string) $value,
                'is_correct' => $value === 3,
            ]);
        }
    }
}

<?php

namespace Tests\Feature\Child;

use App\Enums\ContentStatus;
use App\Models\Artwork;
use App\Models\ChildProfile;
use App\Models\Course;
use App\Models\DrawingPrompt;
use App\Models\Lesson;
use App\Models\Skill;
use App\Models\Subject;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DrawingEngineTest extends TestCase
{
    use RefreshDatabase;

    private const ONE_PIXEL_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
        Storage::fake('public');
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

    public function test_child_can_view_the_free_draw_page(): void
    {
        $this->loginAsChild();

        $response = $this->get(route('child.draw'));

        $response->assertOk();
    }

    public function test_child_can_save_a_free_draw_artwork(): void
    {
        [, $child] = $this->loginAsChild();

        $response = $this->post(route('child.artworks.store'), [
            'title' => 'My Sunset',
            'image' => self::ONE_PIXEL_PNG,
            'drawing_prompt_id' => null,
        ]);

        $response->assertRedirect(route('child.gallery'));

        $artwork = Artwork::query()->where('child_profile_id', $child->id)->sole();
        $this->assertEquals('My Sunset', $artwork->title);
        $this->assertNull($artwork->drawing_prompt_id);
        Storage::disk('public')->assertExists($artwork->image_path);
    }

    public function test_child_can_save_artwork_from_a_guided_drawing_prompt(): void
    {
        $this->loginAsChild();

        $subject = Subject::factory()->create();
        $skill = Skill::factory()->create(['subject_id' => $subject->id]);
        $course = Course::factory()->create(['skill_id' => $skill->id, 'status' => ContentStatus::Published]);
        $unit = Unit::factory()->create(['course_id' => $course->id, 'status' => ContentStatus::Published]);
        $lesson = Lesson::factory()->create(['unit_id' => $unit->id, 'status' => ContentStatus::Published]);
        $prompt = DrawingPrompt::factory()->create(['lesson_id' => $lesson->id]);

        $playResponse = $this->get(route('child.drawing-prompts.play', $prompt));
        $playResponse->assertOk();
        $playResponse->assertInertia(fn ($page) => $page->where('prompt.template_text', 'A'));

        $this->post(route('child.artworks.store'), [
            'title' => $prompt->title,
            'image' => self::ONE_PIXEL_PNG,
            'drawing_prompt_id' => $prompt->id,
        ]);

        $this->assertDatabaseHas('artworks', [
            'drawing_prompt_id' => $prompt->id,
        ]);
    }

    public function test_coloring_page_prompt_is_not_playable(): void
    {
        $this->loginAsChild();

        $subject = Subject::factory()->create();
        $skill = Skill::factory()->create(['subject_id' => $subject->id]);
        $course = Course::factory()->create(['skill_id' => $skill->id, 'status' => ContentStatus::Published]);
        $unit = Unit::factory()->create(['course_id' => $course->id, 'status' => ContentStatus::Published]);
        $lesson = Lesson::factory()->create(['unit_id' => $unit->id, 'status' => ContentStatus::Published]);
        $prompt = DrawingPrompt::factory()->create(['lesson_id' => $lesson->id, 'type' => 'coloring_page']);

        $response = $this->get(route('child.drawing-prompts.play', $prompt));

        $response->assertNotFound();
    }

    public function test_child_can_delete_their_own_artwork(): void
    {
        [, $child] = $this->loginAsChild();
        $artwork = Artwork::factory()->create(['child_profile_id' => $child->id]);

        $response = $this->delete(route('child.artworks.destroy', $artwork));

        $response->assertRedirect(route('child.gallery'));
        $this->assertDatabaseMissing('artworks', ['id' => $artwork->id]);
    }

    public function test_child_cannot_delete_another_childs_artwork(): void
    {
        $this->loginAsChild();
        $otherChild = ChildProfile::factory()->create();
        $artwork = Artwork::factory()->create(['child_profile_id' => $otherChild->id]);

        $response = $this->delete(route('child.artworks.destroy', $artwork));

        $response->assertNotFound();
        $this->assertDatabaseHas('artworks', ['id' => $artwork->id]);
    }

    public function test_parent_can_view_their_own_childs_gallery(): void
    {
        $parent = User::factory()->create()->assignRole('parent');
        $child = ChildProfile::factory()->create(['parent_id' => $parent->id]);
        Artwork::factory()->create(['child_profile_id' => $child->id, 'title' => 'Rainbow']);

        $response = $this->actingAs($parent)->get(route('parent.children.gallery', $child));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('artworks', 1)
            ->where('artworks.0.title', 'Rainbow')
        );
    }

    public function test_parent_cannot_view_another_parents_child_gallery(): void
    {
        $parentA = User::factory()->create()->assignRole('parent');
        $parentB = User::factory()->create()->assignRole('parent');
        $childOfB = ChildProfile::factory()->create(['parent_id' => $parentB->id]);

        $response = $this->actingAs($parentA)->get(route('parent.children.gallery', $childOfB));

        $response->assertForbidden();
    }

    public function test_curriculum_manager_can_create_a_drawing_prompt(): void
    {
        $manager = User::factory()->create()->assignRole('curriculum_manager');
        $lesson = Lesson::factory()->create();

        $response = $this->actingAs($manager)->post(route('admin.curriculum.drawing-prompts.store'), [
            'lesson_id' => $lesson->id,
            'type' => 'trace_number',
            'title' => 'Trace the Number 7',
            'template_text' => '7',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('drawing_prompts', ['title' => 'Trace the Number 7']);
    }
}

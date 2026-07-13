<?php

namespace App\Http\Controllers\Child;

use App\Http\Controllers\Controller;
use App\Http\Requests\Child\SaveArtworkRequest;
use App\Models\Artwork;
use App\Models\ChildProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ArtworkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Child/Draw');
    }

    public function index(Request $request): Response
    {
        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        $artworks = $childProfile->artworks()->latest()->get();

        return Inertia::render('Child/Gallery', [
            'artworks' => $artworks->map(fn (Artwork $artwork) => [
                'id' => $artwork->id,
                'title' => $artwork->title,
                'url' => $artwork->imageUrl(),
                'created_at' => $artwork->created_at,
            ]),
        ]);
    }

    public function store(SaveArtworkRequest $request): RedirectResponse
    {
        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        [, $encoded] = explode(',', $request->validated('image'), 2);
        $path = 'artwork/'.$childProfile->id.'/'.Str::uuid().'.png';

        Storage::disk('public')->put($path, base64_decode($encoded));

        $childProfile->artworks()->create([
            'drawing_prompt_id' => $request->validated('drawing_prompt_id'),
            'title' => $request->validated('title'),
            'image_path' => $path,
        ]);

        return redirect()->route('child.gallery')->with('status', 'Artwork saved!');
    }

    public function destroy(Request $request, Artwork $artwork): RedirectResponse
    {
        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        abort_unless($artwork->child_profile_id === $childProfile->id, 404);

        $artwork->delete();

        return redirect()->route('child.gallery')->with('status', 'Artwork deleted.');
    }
}

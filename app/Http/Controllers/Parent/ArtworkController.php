<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\ChildProfile;
use Inertia\Inertia;
use Inertia\Response;

class ArtworkController extends Controller
{
    public function index(ChildProfile $childProfile): Response
    {
        $this->authorize('view', $childProfile);

        return Inertia::render('Parent/ChildGallery', [
            'child' => $childProfile->only(['id', 'name', 'avatar']),
            'artworks' => $childProfile->artworks()->latest()->get()->map(fn (Artwork $artwork) => [
                'id' => $artwork->id,
                'title' => $artwork->title,
                'url' => $artwork->imageUrl(),
                'created_at' => $artwork->created_at,
            ]),
        ]);
    }
}

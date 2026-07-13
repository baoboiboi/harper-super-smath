<?php

namespace App\Http\Controllers\Child;

use App\Enums\DrawingPromptType;
use App\Http\Controllers\Controller;
use App\Models\DrawingPrompt;
use App\Models\Lesson;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DrawingPlayController extends Controller
{
    public function show(DrawingPrompt $drawingPrompt): Response
    {
        $available = Lesson::query()
            ->publiclyAvailable()
            ->whereKey($drawingPrompt->lesson_id)
            ->exists();

        // Coloring pages need real pre-made line-art assets we don't have yet.
        if (! $available || $drawingPrompt->type === DrawingPromptType::ColoringPage) {
            throw new NotFoundHttpException();
        }

        return Inertia::render('Child/DrawingPlay', [
            'prompt' => [
                'id' => $drawingPrompt->id,
                'lesson_id' => $drawingPrompt->lesson_id,
                'title' => $drawingPrompt->title,
                'type' => $drawingPrompt->type->value,
                'instructions' => $drawingPrompt->instructions,
                'template_text' => $drawingPrompt->template_text,
            ],
        ]);
    }
}

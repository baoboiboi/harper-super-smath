<?php

namespace App\Http\Controllers\Child;

use App\Http\Controllers\Controller;
use App\Http\Requests\Child\SubmitGameResultRequest;
use App\Models\ChildProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GameController extends Controller
{
    /**
     * Maps a game's config key to its Inertia page component.
     *
     * @var array<string, string>
     */
    private const COMPONENTS = [
        'number-match' => 'Child/Games/NumberMatch',
        'memory-match' => 'Child/Games/MemoryMatch',
        'pattern-builder' => 'Child/Games/PatternBuilder',
        'word-builder' => 'Child/Games/WordBuilder',
    ];

    public function index(Request $request): Response
    {
        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        $bestScores = $childProfile->gameSessions()
            ->selectRaw('game_key, MAX(score) as best_score')
            ->groupBy('game_key')
            ->pluck('best_score', 'game_key');

        $games = collect(config('games'))->map(fn (array $game, string $key) => [
            'key' => $key,
            'name' => $game['name'],
            'icon' => $game['icon'],
            'description' => $game['description'],
            'best_score' => $bestScores->get($key),
        ])->values();

        return Inertia::render('Child/Games', [
            'games' => $games,
            'status' => session('status'),
        ]);
    }

    public function play(string $gameKey): Response
    {
        $component = self::COMPONENTS[$gameKey] ?? null;

        if (! $component || ! config("games.{$gameKey}")) {
            throw new NotFoundHttpException();
        }

        return Inertia::render($component, [
            'game' => array_merge(['key' => $gameKey], config("games.{$gameKey}")),
        ]);
    }

    public function complete(SubmitGameResultRequest $request, string $gameKey): RedirectResponse
    {
        $gameConfig = config("games.{$gameKey}");

        if (! $gameConfig) {
            throw new NotFoundHttpException();
        }

        /** @var ChildProfile $childProfile */
        $childProfile = $request->attributes->get('activeChildProfile');

        $pointsEarned = $request->validated('score') * $gameConfig['points_per_correct'];

        $childProfile->gameSessions()->create([
            'game_key' => $gameKey,
            'difficulty' => $request->validated('difficulty'),
            'score' => $request->validated('score'),
            'rounds_played' => $request->validated('rounds_played'),
            'time_spent_seconds' => $request->validated('time_spent_seconds'),
            'points_earned' => $pointsEarned,
        ]);

        return redirect()->route('child.games.index')->with('status', "Nice work! You earned {$pointsEarned} points.");
    }
}

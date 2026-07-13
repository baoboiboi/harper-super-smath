<?php

namespace App\Services;

class TypingGrader
{
    /**
     * @return array{wpm: int, accuracy_percent: int, error_count: int, key_stats: array<string, array{attempts: int, correct: int}>}
     */
    public function grade(string $targetText, string $typedText, int $elapsedSeconds): array
    {
        $targetChars = mb_str_split($targetText);
        $typedChars = mb_str_split($typedText);

        $correct = 0;
        $keyStats = [];

        foreach ($targetChars as $index => $char) {
            $keyStats[$char] ??= ['attempts' => 0, 'correct' => 0];
            $keyStats[$char]['attempts']++;

            if (($typedChars[$index] ?? null) === $char) {
                $correct++;
                $keyStats[$char]['correct']++;
            }
        }

        $totalChars = count($targetChars);
        $accuracy = $totalChars > 0 ? (int) round(($correct / $totalChars) * 100) : 0;

        $minutes = max($elapsedSeconds, 1) / 60;
        $wpm = (int) round((count($typedChars) / 5) / $minutes);

        return [
            'wpm' => $wpm,
            'accuracy_percent' => $accuracy,
            'error_count' => $totalChars - $correct,
            'key_stats' => $keyStats,
        ];
    }
}

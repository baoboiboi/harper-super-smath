<?php

namespace Tests\Unit;

use App\Services\TypingGrader;
use Tests\TestCase;

class TypingGraderTest extends TestCase
{
    public function test_perfect_typing_scores_full_accuracy(): void
    {
        $result = (new TypingGrader())->grade('cat', 'cat', 6);

        $this->assertEquals(100, $result['accuracy_percent']);
        $this->assertEquals(0, $result['error_count']);
    }

    public function test_mistakes_reduce_accuracy_and_are_counted(): void
    {
        $result = (new TypingGrader())->grade('cat', 'cbt', 6);

        $this->assertEquals(67, $result['accuracy_percent']);
        $this->assertEquals(1, $result['error_count']);
    }

    public function test_wpm_is_calculated_from_elapsed_time(): void
    {
        // 10 characters = 2 "words" (5 chars/word), typed in 60 seconds = 2 WPM.
        $result = (new TypingGrader())->grade('0123456789', '0123456789', 60);

        $this->assertEquals(2, $result['wpm']);
    }

    public function test_key_stats_track_attempts_and_correctness_per_character(): void
    {
        $result = (new TypingGrader())->grade('aab', 'aXb', 6);

        $this->assertEquals(['attempts' => 2, 'correct' => 1], $result['key_stats']['a']);
        $this->assertEquals(['attempts' => 1, 'correct' => 1], $result['key_stats']['b']);
    }
}

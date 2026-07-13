<?php

namespace App\Services;

use App\Enums\QuestionFormat;
use App\Models\Question;

class QuestionGrader
{
    /**
     * Format families this engine can render and grade today. drag_drop,
     * match_pairs, sort, and timed_challenge need interaction models that
     * don't fit the current is_correct-per-option schema and are left for
     * a later pass — see CLAUDE.md.
     *
     * @var list<QuestionFormat>
     */
    private const CHOICE_FORMATS = [
        QuestionFormat::MultipleChoice,
        QuestionFormat::SelectImage,
        QuestionFormat::VisualCounting,
    ];

    private const VALUE_FORMATS = [
        QuestionFormat::NumberInput,
        QuestionFormat::FillBlank,
        QuestionFormat::WordProblem,
    ];

    public static function isPlayable(QuestionFormat $format): bool
    {
        return in_array($format, [...self::CHOICE_FORMATS, ...self::VALUE_FORMATS], true);
    }

    public static function isChoiceBased(QuestionFormat $format): bool
    {
        return in_array($format, self::CHOICE_FORMATS, true);
    }

    public function grade(Question $question, ?int $optionId, ?string $answerText): bool
    {
        if (self::isChoiceBased($question->type)) {
            return $optionId !== null
                && $question->options()->whereKey($optionId)->where('is_correct', true)->exists();
        }

        $expected = $question->correct_answer['value'] ?? null;

        if ($expected === null || $answerText === null) {
            return false;
        }

        return $this->normalize((string) $expected) === $this->normalize($answerText);
    }

    private function normalize(string $value): string
    {
        $value = trim(mb_strtolower($value));

        return is_numeric($value) ? (string) (float) $value : $value;
    }
}

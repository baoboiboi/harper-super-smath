<?php

namespace App\Enums;

enum QuestionFormat: string
{
    case MultipleChoice = 'multiple_choice';
    case NumberInput = 'number_input';
    case DragDrop = 'drag_drop';
    case MatchPairs = 'match_pairs';
    case Sort = 'sort';
    case SelectImage = 'select_image';
    case FillBlank = 'fill_blank';
    case VisualCounting = 'visual_counting';
    case TimedChallenge = 'timed_challenge';
    case WordProblem = 'word_problem';
}

<?php

namespace App\Enums;

enum TypingExerciseType: string
{
    case LetterRecognition = 'letter_recognition';
    case HomeRow = 'home_row';
    case KeyPractice = 'key_practice';
    case WordTyping = 'word_typing';
    case SentenceTyping = 'sentence_typing';
    case TimedChallenge = 'timed_challenge';
}

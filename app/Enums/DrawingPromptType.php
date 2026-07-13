<?php

namespace App\Enums;

enum DrawingPromptType: string
{
    case TraceLetter = 'trace_letter';
    case TraceNumber = 'trace_number';
    case TraceShape = 'trace_shape';
    case ColoringPage = 'coloring_page';
}

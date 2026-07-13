<?php

namespace App\Enums;

enum ContentStatus: string
{
    case Draft = 'draft';
    case UnderReview = 'under_review';
    case Published = 'published';
    case Archived = 'archived';
}

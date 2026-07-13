<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PublicPageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Public/Home');
    }

    public function about(): Response
    {
        return Inertia::render('Public/About');
    }

    public function howItWorks(): Response
    {
        return Inertia::render('Public/HowItWorks');
    }

    public function subjects(): Response
    {
        return Inertia::render('Public/Subjects');
    }

    public function pricing(): Response
    {
        return Inertia::render('Public/Pricing');
    }

    public function safety(): Response
    {
        return Inertia::render('Public/Safety');
    }

    public function faq(): Response
    {
        return Inertia::render('Public/Faq');
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Contact');
    }

    public function terms(): Response
    {
        return Inertia::render('Public/Terms');
    }

    public function privacy(): Response
    {
        return Inertia::render('Public/Privacy');
    }
}

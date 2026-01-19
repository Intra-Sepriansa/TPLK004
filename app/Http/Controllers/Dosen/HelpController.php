<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\HelpFaq;
use App\Models\HelpTroubleshooting;
use App\Models\HelpFeedback;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HelpController extends Controller
{
    /**
     * Get all FAQs grouped by category
     */
    public function faqs()
    {
        $faqs = HelpFaq::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->groupBy('category');

        $categories = $faqs->map(function ($items, $category) {
            return [
                'id' => Str::slug($category),
                'name' => $category,
                'faqs' => $items->map(function ($faq) {
                    return [
                        'id' => 'faq' . $faq->id,
                        'question' => $faq->question,
                        'answer' => $faq->answer,
                        'helpful' => $faq->helpful_count,
                        'notHelpful' => $faq->not_helpful_count,
                    ];
                })->values()
            ];
        })->values();

        return response()->json($categories);
    }

    /**
     * Get all troubleshooting guides
     */
    public function troubleshooting()
    {
        $guides = HelpTroubleshooting::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(function ($guide) {
                return [
                    'id' => 'guide' . $guide->id,
                    'title' => $guide->title,
                    'description' => $guide->description,
                    'category' => $guide->category,
                    'steps' => json_decode($guide->steps, true),
                ];
            });

        return response()->json($guides);
    }

    /**
     * Get contact information
     */
    public function contact()
    {
        return response()->json([
            'email' => 'support@unpam.ac.id',
            'phone' => '021-7412566',
            'hours' => 'Senin - Jumat, 08:00 - 16:00 WIB',
            'responseTime' => '< 24 jam',
        ]);
    }

    /**
     * Submit feedback
     */
    public function submitFeedback(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'category' => 'nullable|string',
        ]);

        $dosen = auth()->guard('dosen')->user();

        $feedback = HelpFeedback::create([
            'user_type' => 'dosen',
            'user_id' => $dosen->id,
            'user_name' => $dosen->nama,
            'user_email' => $dosen->email,
            'category' => $validated['category'] ?? 'general',
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'ticketId' => 'TKT-' . str_pad($feedback->id, 6, '0', STR_PAD_LEFT),
        ]);
    }

    /**
     * Mark FAQ as helpful
     */
    public function markFaqHelpful($id)
    {
        $faq = HelpFaq::findOrFail($id);
        $faq->increment('helpful_count');

        return response()->json(['success' => true]);
    }

    /**
     * Mark FAQ as not helpful
     */
    public function markFaqNotHelpful($id)
    {
        $faq = HelpFaq::findOrFail($id);
        $faq->increment('not_helpful_count');

        return response()->json(['success' => true]);
    }

    /**
     * Search help content
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');

        $faqs = HelpFaq::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('question', 'like', "%{$query}%")
                    ->orWhere('answer', 'like', "%{$query}%");
            })
            ->get();

        $troubleshooting = HelpTroubleshooting::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->get();

        return response()->json([
            'faqs' => $faqs,
            'troubleshooting' => $troubleshooting,
        ]);
    }
}

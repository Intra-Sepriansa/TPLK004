<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SmartNotificationService;
use App\Models\NotificationTemplate;
use App\Models\NotificationCampaign;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(
        private SmartNotificationService $notificationService
    ) {}

    public function templates()
    {
        $templates = NotificationTemplate::withCount('campaigns')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Notifications/Templates', [
            'templates' => $templates,
        ]);
    }

    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:notification_templates,slug',
            'type' => 'required|in:email,push,sms,in_app',
            'subject' => 'nullable|string',
            'body' => 'required|string',
            'variables' => 'nullable|array',
        ]);

        $template = NotificationTemplate::create($validated);

        return redirect()->back()->with('success', 'Template created successfully');
    }

    public function updateTemplate(Request $request, NotificationTemplate $template)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'subject' => 'nullable|string',
            'body' => 'string',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return redirect()->back()->with('success', 'Template updated successfully');
    }

    public function campaigns()
    {
        $campaigns = NotificationCampaign::with('template')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Notifications/Campaigns', [
            'campaigns' => $campaigns,
        ]);
    }

    public function storeCampaign(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'template_id' => 'required|exists:notification_templates,id',
            'target_type' => 'required|in:all,role,class,custom',
            'target_filters' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
        ]);

        $campaign = $this->notificationService->createCampaign($validated);

        return redirect()->back()->with('success', 'Campaign created successfully');
    }

    public function sendCampaign(NotificationCampaign $campaign)
    {
        if ($campaign->status !== 'draft' && $campaign->status !== 'scheduled') {
            return redirect()->back()->with('error', 'Campaign cannot be sent');
        }

        $this->notificationService->sendCampaign($campaign);

        return redirect()->back()->with('success', 'Campaign sent successfully');
    }

    public function campaignStats(NotificationCampaign $campaign)
    {
        $stats = $this->notificationService->getNotificationStats($campaign);

        return Inertia::render('Admin/Notifications/CampaignStats', [
            'campaign' => $campaign->load('template'),
            'stats' => $stats,
        ]);
    }

    public function logs(Request $request)
    {
        $query = NotificationLog::with(['campaign', 'recipient'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $logs = $query->paginate(50);

        return Inertia::render('Admin/Notifications/Logs', [
            'logs' => $logs,
            'filters' => $request->only(['status', 'type']),
        ]);
    }

    public function sendTest(Request $request, NotificationTemplate $template)
    {
        $validated = $request->validate([
            'recipient_email' => 'required|email',
            'test_data' => 'nullable|array',
        ]);

        $testUser = auth()->user();
        
        $this->notificationService->sendNotification(
            $testUser,
            $template->slug,
            $validated['test_data'] ?? [],
            $template->type
        );

        return redirect()->back()->with('success', 'Test notification sent');
    }
}

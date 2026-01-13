<?php

namespace Tests\Unit;

use App\Services\ScheduleService;
use PHPUnit\Framework\TestCase;

/**
 * Property-based tests for ScheduleService
 * Feature: academic-schedule-reminder
 */
class ScheduleServiceTest extends TestCase
{
    private ScheduleService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ScheduleService();
    }

    /**
     * Property 1: SKS-based Meeting Calculation
     * For any course with valid SKS (2 or 3), the total meetings, UTS meeting, 
     * and UAS meeting SHALL be calculated correctly.
     * 
     * Validates: Requirements 2.2, 2.3, 7.3, 7.4
     */
    public function test_sks_2_calculates_correct_meetings(): void
    {
        $sks = 2;
        
        $this->assertEquals(14, $this->service->calculateTotalMeetings($sks));
        $this->assertEquals(7, $this->service->calculateUtsMeeting($sks));
        $this->assertEquals(14, $this->service->calculateUasMeeting($sks));
    }

    public function test_sks_3_calculates_correct_meetings(): void
    {
        $sks = 3;
        
        $this->assertEquals(21, $this->service->calculateTotalMeetings($sks));
        $this->assertEquals(14, $this->service->calculateUtsMeeting($sks));
        $this->assertEquals(21, $this->service->calculateUasMeeting($sks));
    }

    public function test_invalid_sks_throws_exception(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->service->calculateTotalMeetings(1);
    }

    public function test_invalid_sks_4_throws_exception(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->service->calculateTotalMeetings(4);
    }

    /**
     * Property 1 continued: UTS is always at half of total meetings
     */
    public function test_uts_is_half_of_total_meetings(): void
    {
        foreach ([2, 3] as $sks) {
            $total = $this->service->calculateTotalMeetings($sks);
            $uts = $this->service->calculateUtsMeeting($sks);
            
            $this->assertEquals($total / 2, $uts, "UTS should be at half of total meetings for SKS {$sks}");
        }
    }

    /**
     * Property 1 continued: UAS is always equal to total meetings
     */
    public function test_uas_equals_total_meetings(): void
    {
        foreach ([2, 3] as $sks) {
            $total = $this->service->calculateTotalMeetings($sks);
            $uas = $this->service->calculateUasMeeting($sks);
            
            $this->assertEquals($total, $uas, "UAS should equal total meetings for SKS {$sks}");
        }
    }

    /**
     * Property 6: Exam Countdown Calculation
     * For any course with calculated exam date, the countdown days SHALL equal 
     * the difference between exam date and current date.
     * 
     * Validates: Requirements 5.1, 5.2, 6.3
     */
    public function test_countdown_days_calculation(): void
    {
        $today = now()->startOfDay();
        
        // Test future date
        $futureDate = $today->copy()->addDays(10);
        $this->assertEquals(10, $this->service->getCountdownDays($futureDate));
        
        // Test today
        $this->assertEquals(0, $this->service->getCountdownDays($today));
        
        // Test past date
        $pastDate = $today->copy()->subDays(5);
        $this->assertEquals(-5, $this->service->getCountdownDays($pastDate));
    }

    /**
     * Property 7: Reminder Threshold Logic
     * For any exam with countdown days:
     * - If days <= 7 AND days > 3: isWarning = true, isCritical = false
     * - If days <= 3: isWarning = true, isCritical = true
     * - If days > 7: isWarning = false, isCritical = false
     * 
     * Validates: Requirements 5.3, 5.4
     */
    public function test_alert_level_no_warning_when_more_than_7_days(): void
    {
        $result = $this->service->getAlertLevel(10);
        
        $this->assertFalse($result['isWarning']);
        $this->assertFalse($result['isCritical']);
    }

    public function test_alert_level_warning_when_7_days(): void
    {
        $result = $this->service->getAlertLevel(7);
        
        $this->assertTrue($result['isWarning']);
        $this->assertFalse($result['isCritical']);
    }

    public function test_alert_level_warning_when_5_days(): void
    {
        $result = $this->service->getAlertLevel(5);
        
        $this->assertTrue($result['isWarning']);
        $this->assertFalse($result['isCritical']);
    }

    public function test_alert_level_critical_when_3_days(): void
    {
        $result = $this->service->getAlertLevel(3);
        
        $this->assertTrue($result['isWarning']);
        $this->assertTrue($result['isCritical']);
    }

    public function test_alert_level_critical_when_1_day(): void
    {
        $result = $this->service->getAlertLevel(1);
        
        $this->assertTrue($result['isWarning']);
        $this->assertTrue($result['isCritical']);
    }

    public function test_alert_level_critical_when_0_days(): void
    {
        $result = $this->service->getAlertLevel(0);
        
        $this->assertTrue($result['isWarning']);
        $this->assertTrue($result['isCritical']);
    }

    public function test_alert_level_no_alert_when_negative_days(): void
    {
        $result = $this->service->getAlertLevel(-1);
        
        $this->assertFalse($result['isWarning']);
        $this->assertFalse($result['isCritical']);
    }

    /**
     * Property test: Alert levels are consistent across all valid day ranges
     */
    public function test_alert_levels_consistency(): void
    {
        // Test range > 7 days
        for ($days = 8; $days <= 30; $days++) {
            $result = $this->service->getAlertLevel($days);
            $this->assertFalse($result['isWarning'], "Days {$days} should not be warning");
            $this->assertFalse($result['isCritical'], "Days {$days} should not be critical");
        }

        // Test range 4-7 days (warning only)
        for ($days = 4; $days <= 7; $days++) {
            $result = $this->service->getAlertLevel($days);
            $this->assertTrue($result['isWarning'], "Days {$days} should be warning");
            $this->assertFalse($result['isCritical'], "Days {$days} should not be critical");
        }

        // Test range 0-3 days (warning and critical)
        for ($days = 0; $days <= 3; $days++) {
            $result = $this->service->getAlertLevel($days);
            $this->assertTrue($result['isWarning'], "Days {$days} should be warning");
            $this->assertTrue($result['isCritical'], "Days {$days} should be critical");
        }
    }
}

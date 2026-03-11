<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int $mahasiswa_course_id
 * @property int $meeting_number
 * @property string $title
 * @property string $content
 * @property array<array-key, mixed>|null $blocks
 * @property array<array-key, mixed>|null $tags
 * @property bool $is_pinned
 * @property bool $is_favorite
 * @property int $word_count
 * @property int $reading_time
 * @property string|null $ai_summary
 * @property array<array-key, mixed>|null $ai_keywords
 * @property array<array-key, mixed>|null $links
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property-read \App\Models\MahasiswaCourse $course
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote forCourse(int $courseId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote orderByMeeting(string $direction = 'asc')
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote search(string $keyword)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereAiKeywords($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereAiSummary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereBlocks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereIsFavorite($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereIsPinned($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereLinks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereMahasiswaCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereMeetingNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereReadingTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereTags($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicNote whereWordCount($value)
 */
	class AcademicNote extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int $mahasiswa_course_id
 * @property int|null $meeting_number
 * @property string $title
 * @property string|null $description
 * @property string $category
 * @property string $priority
 * @property \Illuminate\Support\Carbon|null $deadline
 * @property string $status
 * @property string $schedule_type
 * @property \Illuminate\Support\Carbon|null $publish_at
 * @property array<array-key, mixed>|null $recurring_pattern
 * @property array<array-key, mixed>|null $reminders
 * @property array<array-key, mixed>|null $dependencies
 * @property array<array-key, mixed>|null $attachments
 * @property int|null $estimated_hours
 * @property bool $ai_generated
 * @property int|null $template_id
 * @property array<array-key, mixed>|null $metadata
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MahasiswaCourse $course
 * @property-read int|null $days_remaining
 * @property-read bool $is_overdue
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask completed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask inProgress()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask overdue()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask pending()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask upcoming(int $days = 7)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereAiGenerated($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereDeadline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereDependencies($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereEstimatedHours($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereMahasiswaCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereMeetingNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask wherePublishAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereRecurringPattern($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereReminders($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereScheduleType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereTemplateId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicTask whereUpdatedAt($value)
 */
	class AcademicTask extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $user_type
 * @property string $action
 * @property string|null $model_type
 * @property int|null $model_id
 * @property array<array-key, mixed>|null $old_values
 * @property array<array-key, mixed>|null $new_values
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereAction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereModelId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereModelType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereNewValues($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereOldValues($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereUserAgent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AdminActivityLog whereUserType($value)
 */
	class AdminActivityLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $event_type
 * @property string $user_type
 * @property int $user_id
 * @property string|null $session_id
 * @property array<array-key, mixed>|null $properties
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property string|null $device_type
 * @property string|null $browser
 * @property string|null $os
 * @property \Illuminate\Support\Carbon $created_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereBrowser($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereDeviceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereEventType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereOs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereProperties($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereSessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereUserAgent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AnalyticsEvent whereUserType($value)
 */
	class AnalyticsEvent extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $anomaly_type
 * @property string $subject_type
 * @property int $subject_id
 * @property string $severity
 * @property string $description
 * @property array<array-key, mixed>|null $evidence
 * @property string $status
 * @property int|null $resolved_by
 * @property string|null $resolution_notes
 * @property \Illuminate\Support\Carbon|null $resolved_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $resolver
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $subject
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly bySeverity(string $severity)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly critical()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly unresolved()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereAnomalyType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereEvidence($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereResolutionNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereResolvedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereResolvedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereSeverity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereSubjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereSubjectType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Anomaly whereUpdatedAt($value)
 */
	class Anomaly extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $notifiable_type
 * @property int|null $notifiable_id
 * @property string $title
 * @property string $message
 * @property string $type
 * @property string $priority
 * @property array<array-key, mixed>|null $data
 * @property array<array-key, mixed>|null $metadata
 * @property string|null $action_url
 * @property \Illuminate\Support\Carbon|null $read_at
 * @property \Illuminate\Support\Carbon|null $scheduled_at
 * @property int|null $created_by
 * @property string|null $created_by_type
 * @property int|null $created_by_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $type_color
 * @property-read string $type_icon
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification forUser(string $type, int $id)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification scheduled()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification unread()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereActionUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereCreatedById($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereCreatedByType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereData($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereNotifiableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereNotifiableType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereScheduledAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AppNotification whereUpdatedAt($value)
 */
	class AppNotification extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $attendance_session_id
 * @property int $mahasiswa_id
 * @property int|null $attendance_token_id
 * @property \Illuminate\Support\Carbon $scanned_at
 * @property string $status
 * @property numeric|null $grade_points
 * @property numeric|null $distance_m
 * @property string|null $selfie_path
 * @property numeric|null $latitude
 * @property numeric|null $longitude
 * @property numeric|null $accuracy
 * @property string|null $address
 * @property string|null $ai_processing_step
 * @property bool|null $face_detected
 * @property numeric|null $face_match_score
 * @property bool|null $is_live_photo
 * @property bool|null $spoofing_detected
 * @property numeric|null $image_quality_score
 * @property numeric|null $ai_confidence
 * @property string|null $ai_recommendation
 * @property bool $is_suspicious
 * @property numeric|null $risk_score
 * @property array<array-key, mixed>|null $fraud_flags
 * @property array<array-key, mixed>|null $ai_analysis_json
 * @property \Illuminate\Support\Carbon|null $ai_processed_at
 * @property string|null $device_os
 * @property string|null $device_model
 * @property string|null $device_type
 * @property string|null $browser
 * @property string|null $user_agent
 * @property string|null $platform
 * @property string|null $screen_resolution
 * @property string|null $timezone
 * @property string|null $ip_address
 * @property string|null $device_fingerprint
 * @property bool $is_device_trusted
 * @property string|null $note
 * @property int|null $override_by
 * @property string|null $override_reason
 * @property string|null $original_status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FraudAlert> $fraudAlerts
 * @property-read int|null $fraud_alerts_count
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @property-read \App\Models\SelfieVerification|null $selfieVerification
 * @property-read \App\Models\AttendanceSession $session
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereAccuracy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereAiAnalysisJson($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereAiConfidence($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereAiProcessedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereAiProcessingStep($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereAiRecommendation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereAttendanceSessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereAttendanceTokenId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereBrowser($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereDeviceFingerprint($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereDeviceModel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereDeviceOs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereDeviceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereDistanceM($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereFaceDetected($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereFaceMatchScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereFraudFlags($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereGradePoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereImageQualityScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereIsDeviceTrusted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereIsLivePhoto($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereIsSuspicious($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereOriginalStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereOverrideBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereOverrideReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog wherePlatform($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereRiskScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereScannedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereScreenResolution($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereSelfiePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereSpoofingDetected($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereTimezone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceLog whereUserAgent($value)
 */
	class AttendanceLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int $attendance_session_id
 * @property string $type
 * @property string $reason
 * @property string|null $attachment
 * @property string $status
 * @property int|null $approved_by
 * @property \Illuminate\Support\Carbon|null $approved_at
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property string|null $rejection_reason
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Dosen|null $approver
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendancePermitComment> $comments
 * @property-read int|null $comments_count
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @property-read \App\Models\AttendanceSession $session
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereAttachment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereAttendanceSessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereRejectionReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereReviewedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermit whereUpdatedAt($value)
 */
	class AttendancePermit extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $attendance_permit_id
 * @property string $sender_type
 * @property int $sender_id
 * @property string $sender_name
 * @property string $message
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\AttendancePermit $permit
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment whereAttendancePermitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment whereSenderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment whereSenderName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment whereSenderType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendancePermitComment whereUpdatedAt($value)
 */
	class AttendancePermitComment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property int $meeting_number
 * @property string|null $title
 * @property \Illuminate\Support\Carbon $start_at
 * @property \Illuminate\Support\Carbon $end_at
 * @property bool $is_active
 * @property int|null $created_by
 * @property int|null $created_by_dosen_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MataKuliah $course
 * @property-read \App\Models\Dosen|null $dosen
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FraudAlert> $fraudAlerts
 * @property-read int|null $fraud_alerts_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceLog> $logs
 * @property-read int|null $logs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereCreatedByDosenId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereEndAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereMeetingNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereStartAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceSession whereUpdatedAt($value)
 */
	class AttendanceSession extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int $current_streak
 * @property int $longest_streak
 * @property \Illuminate\Support\Carbon|null $last_attendance_date
 * @property \Illuminate\Support\Carbon|null $streak_start_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak whereCurrentStreak($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak whereLastAttendanceDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak whereLongestStreak($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak whereStreakStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceStreak whereUpdatedAt($value)
 */
	class AttendanceStreak extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $attendance_session_id
 * @property string $token
 * @property \Illuminate\Support\Carbon $expires_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\AttendanceSession $session
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceToken newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceToken newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceToken query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceToken whereAttendanceSessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceToken whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceToken whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceToken whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceToken whereToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceToken whereUpdatedAt($value)
 */
	class AttendanceToken extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property string $type
 * @property string $title
 * @property string $message
 * @property bool $is_read
 * @property \Illuminate\Support\Carbon|null $read_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning whereIsRead($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceWarning whereUpdatedAt($value)
 */
	class AttendanceWarning extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $audit_log_id
 * @property string $action_type
 * @property string|null $description
 * @property int $actor_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $actor
 * @property-read \App\Models\AuditLog $auditLog
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditAction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditAction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditAction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditAction whereActionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditAction whereActorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditAction whereAuditLogId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditAction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditAction whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditAction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditAction whereUpdatedAt($value)
 */
	class AuditAction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $event_type
 * @property string $message
 * @property int|null $mahasiswa_id
 * @property int|null $attendance_session_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $severity
 * @property string $status
 * @property int $security_score
 * @property string $threat_level
 * @property array<array-key, mixed>|null $device_info
 * @property array<array-key, mixed>|null $network_info
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AuditAction> $auditActions
 * @property-read int|null $audit_actions_count
 * @property-read \App\Models\Mahasiswa|null $mahasiswa
 * @property-read \App\Models\AttendanceSession|null $session
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereAttendanceSessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereDeviceInfo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereEventType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereNetworkInfo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereSecurityScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereSeverity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereThreatLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereUpdatedAt($value)
 */
	class AuditLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $description
 * @property string|null $icon
 * @property string $color
 * @property string|null $category
 * @property int $points
 * @property int $badge_level
 * @property string|null $requirement_type
 * @property int $requirement_value
 * @property array<array-key, mixed>|null $criteria
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Mahasiswa> $mahasiswas
 * @property-read int|null $mahasiswas_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereBadgeLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereCriteria($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge wherePoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereRequirementType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereRequirementValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereUpdatedAt($value)
 */
	class Badge extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $title
 * @property string $description
 * @property string $type
 * @property string $category
 * @property int $target_value
 * @property int $reward_points
 * @property string|null $reward_badge_id
 * @property \Illuminate\Support\Carbon|null $starts_at
 * @property \Illuminate\Support\Carbon|null $ends_at
 * @property bool $is_active
 * @property array<array-key, mixed>|null $requirements
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ChallengeProgress> $progress
 * @property-read int|null $progress_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge byType(string $type)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereEndsAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereRequirements($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereRewardBadgeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereRewardPoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereStartsAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereTargetValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Challenge whereUpdatedAt($value)
 */
	class Challenge extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $challenge_id
 * @property int $mahasiswa_id
 * @property int $current_value
 * @property bool $is_completed
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Challenge $challenge
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress whereChallengeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress whereCurrentValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress whereIsCompleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChallengeProgress whereUpdatedAt($value)
 */
	class ChallengeProgress extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $type
 * @property string|null $name
 * @property string|null $description
 * @property string|null $avatar_url
 * @property int|null $course_id
 * @property string $created_by_type
 * @property int $created_by_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Course|null $course
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $creator
 * @property-read \App\Models\Message|null $latestMessage
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Message> $messages
 * @property-read int|null $messages_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ConversationParticipant> $participants
 * @property-read int|null $participants_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation forUser($user)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation group()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation personal()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation whereAvatarUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation whereCreatedById($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation whereCreatedByType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Conversation whereUpdatedAt($value)
 */
	class Conversation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $conversation_id
 * @property string $participant_type
 * @property int $participant_id
 * @property string $role
 * @property \Illuminate\Support\Carbon $joined_at
 * @property \Illuminate\Support\Carbon|null $last_read_at
 * @property bool $is_muted
 * @property bool $is_pinned
 * @property bool $is_archived
 * @property bool $is_blocked
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Conversation $conversation
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $participant
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereConversationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereIsArchived($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereIsBlocked($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereIsMuted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereIsPinned($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereJoinedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereLastReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereParticipantId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereParticipantType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConversationParticipant whereUpdatedAt($value)
 */
	class ConversationParticipant extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceSession> $sessions
 * @property-read int|null $sessions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereUpdatedAt($value)
 */
	class Course extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property string $title
 * @property string $type
 * @property string $url
 * @property int|null $size
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MahasiswaCourse $course
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereUrl($value)
 */
	class CourseMaterial extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_course_id
 * @property int $meeting_number
 * @property \Illuminate\Support\Carbon|null $scheduled_date
 * @property bool $is_completed
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MahasiswaCourse $course
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting completed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting pending()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting whereIsCompleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting whereMahasiswaCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting whereMeetingNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting whereScheduledDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMeeting whereUpdatedAt($value)
 */
	class CourseMeeting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int $course_id
 * @property string $content
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MahasiswaCourse $course
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseNote newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseNote newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseNote query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseNote whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseNote whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseNote whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseNote whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseNote whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseNote whereUpdatedAt($value)
 */
	class CourseNote extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property \Illuminate\Support\Carbon $date
 * @property string $metric_type
 * @property string|null $dimension
 * @property string|null $dimension_value
 * @property numeric $value
 * @property array<array-key, mixed>|null $metadata
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric forDate($date)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric forDimension(string $dimension, ?string $value = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric forMetricType(string $type)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric whereDimension($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric whereDimensionValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric whereMetricType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DailyMetric whereValue($value)
 */
	class DailyMetric extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $digest_id
 * @property string $announcement_title
 * @property string $announcement_content
 * @property string $announcement_type
 * @property string $priority_level
 * @property bool $is_pinned
 * @property \Illuminate\Support\Carbon|null $announced_date
 * @property int $display_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\WeeklyLearningDigest $digest
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement whereAnnouncedDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement whereAnnouncementContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement whereAnnouncementTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement whereAnnouncementType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement whereDigestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement whereDisplayOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement whereIsPinned($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement wherePriorityLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAnnouncement whereUpdatedAt($value)
 */
	class DigestAnnouncement extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $digest_id
 * @property string $assignment_title
 * @property string|null $assignment_description
 * @property string $assignment_type
 * @property string|null $mentari_assignment_url
 * @property \Illuminate\Support\Carbon $deadline_date
 * @property \Illuminate\Support\Carbon|null $submission_start_date
 * @property int $max_score
 * @property string|null $submission_format
 * @property string|null $file_size_limit
 * @property string|null $detailed_instructions
 * @property string|null $grading_criteria
 * @property bool $is_mandatory
 * @property bool $is_late_submission_allowed
 * @property int $late_penalty_percentage
 * @property int $total_submissions
 * @property numeric $submission_rate
 * @property int $display_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\WeeklyLearningDigest $digest
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereAssignmentDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereAssignmentTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereAssignmentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereDeadlineDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereDetailedInstructions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereDigestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereDisplayOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereFileSizeLimit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereGradingCriteria($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereIsLateSubmissionAllowed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereIsMandatory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereLatePenaltyPercentage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereMaxScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereMentariAssignmentUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereSubmissionFormat($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereSubmissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereSubmissionStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereTotalSubmissions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestAssignment whereUpdatedAt($value)
 */
	class DigestAssignment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $digest_id
 * @property string $topic_title
 * @property string|null $topic_description
 * @property string|null $mentari_forum_url
 * @property int $total_posts
 * @property int $total_participants
 * @property string|null $key_points
 * @property string|null $best_contributions
 * @property \Illuminate\Support\Carbon|null $discussion_date
 * @property bool $is_active
 * @property int $display_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\WeeklyLearningDigest $digest
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereBestContributions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereDigestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereDiscussionDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereDisplayOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereKeyPoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereMentariForumUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereTopicDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereTopicTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereTotalParticipants($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereTotalPosts($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestForumDiscussion whereUpdatedAt($value)
 */
	class DigestForumDiscussion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $digest_id
 * @property string $material_title
 * @property string|null $material_description
 * @property string $material_type
 * @property string|null $mentari_material_url
 * @property string|null $file_name
 * @property string|null $file_size
 * @property string|null $duration
 * @property string|null $topics_covered
 * @property string|null $learning_objectives
 * @property bool $is_downloadable
 * @property bool $requires_password
 * @property string|null $access_notes
 * @property \Illuminate\Support\Carbon|null $upload_date
 * @property int $display_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\WeeklyLearningDigest $digest
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereAccessNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereDigestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereDisplayOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereIsDownloadable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereLearningObjectives($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereMaterialDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereMaterialTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereMaterialType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereMentariMaterialUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereRequiresPassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereTopicsCovered($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestLearningMaterial whereUploadDate($value)
 */
	class DigestLearningMaterial extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $digest_id
 * @property string $contact_name
 * @property string|null $contact_role
 * @property string $contact_type
 * @property string $contact_value
 * @property string|null $available_hours
 * @property string|null $response_time
 * @property string|null $notes
 * @property int $display_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\WeeklyLearningDigest $digest
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereAvailableHours($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereContactName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereContactRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereContactType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereContactValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereDigestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereDisplayOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereResponseTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestSupportContact whereUpdatedAt($value)
 */
	class DigestSupportContact extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $digest_id
 * @property string $event_title
 * @property string|null $event_description
 * @property string $event_type
 * @property \Illuminate\Support\Carbon $event_date
 * @property string|null $event_time
 * @property int|null $duration_minutes
 * @property string|null $platform
 * @property string|null $meeting_link
 * @property string|null $meeting_id
 * @property string|null $meeting_password
 * @property bool $is_mandatory
 * @property int|null $max_participants
 * @property string|null $preparation_notes
 * @property int $display_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\WeeklyLearningDigest $digest
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereDigestId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereDisplayOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereDurationMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereEventDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereEventDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereEventTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereEventTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereEventType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereIsMandatory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereMaxParticipants($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereMeetingId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereMeetingLink($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereMeetingPassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule wherePlatform($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule wherePreparationNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DigestUpcomingSchedule whereUpdatedAt($value)
 */
	class DigestUpcomingSchedule extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $reader_type
 * @property int $reader_id
 * @property string $guide_id
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $reader
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationBookmark newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationBookmark newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationBookmark query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationBookmark whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationBookmark whereGuideId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationBookmark whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationBookmark whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationBookmark whereReaderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationBookmark whereReaderType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationBookmark whereUpdatedAt($value)
 */
	class DocumentationBookmark extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $reader_type
 * @property int $reader_id
 * @property string $guide_id
 * @property bool|null $helpful
 * @property int|null $rating
 * @property string|null $comment
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $reader
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback whereComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback whereGuideId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback whereHelpful($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback whereReaderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback whereReaderType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationFeedback whereUpdatedAt($value)
 */
	class DocumentationFeedback extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $reader_type
 * @property int $reader_id
 * @property string $guide_id
 * @property string|null $title
 * @property string|null $version
 * @property int|null $size_kb
 * @property \Illuminate\Support\Carbon|null $downloaded_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $reader
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload whereDownloadedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload whereGuideId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload whereReaderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload whereReaderType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload whereSizeKb($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationOfflineDownload whereVersion($value)
 */
	class DocumentationOfflineDownload extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $reader_type
 * @property int $reader_id
 * @property string $guide_id
 * @property array<array-key, mixed> $completed_sections
 * @property bool $is_completed
 * @property \Illuminate\Support\Carbon|null $last_read_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $reader
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress whereCompletedSections($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress whereGuideId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress whereIsCompleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress whereLastReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress whereReaderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress whereReaderType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DocumentationProgress whereUpdatedAt($value)
 */
	class DocumentationProgress extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $user_id
 * @property string $nidn
 * @property string $nama
 * @property string|null $jenis_kelamin
 * @property string|null $fakultas
 * @property string|null $program_studi
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $avatar_url
 * @property string $password
 * @property array<array-key, mixed>|null $settings
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $last_activity_at
 * @property string $theme_preference
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Conversation> $conversations
 * @property-read int|null $conversations_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MataKuliah> $courses
 * @property-read int|null $courses_count
 * @property-read string $initials
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MataKuliah> $mataKuliah
 * @property-read int|null $mata_kuliah_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Message> $messages
 * @property-read int|null $messages_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \App\Models\UserOnlineStatus|null $onlineStatus
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SelfieVerification> $selfieVerifications
 * @property-read int|null $selfie_verifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceSession> $sessions
 * @property-read int|null $sessions_count
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereAvatarUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereFakultas($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereJenisKelamin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereLastActivityAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereNama($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereNidn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereProgramStudi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereSettings($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereThemePreference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Dosen whereUserId($value)
 */
	class Dosen extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int|null $attendance_log_id
 * @property int|null $attendance_session_id
 * @property string $alert_type
 * @property string $severity
 * @property string $description
 * @property array<array-key, mixed>|null $evidence
 * @property string $status
 * @property int|null $reviewed_by
 * @property string|null $review_notes
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\AttendanceLog|null $attendanceLog
 * @property-read string $type
 * @property-read \App\Models\Mahasiswa|null $mahasiswa
 * @property-read \App\Models\User|null $reviewer
 * @property-read \App\Models\AttendanceSession|null $session
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereAlertType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereAttendanceLogId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereAttendanceSessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereEvidence($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereReviewNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereReviewedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereReviewedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereSeverity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FraudAlert whereUpdatedAt($value)
 */
	class FraudAlert extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $group_id
 * @property int $user_id
 * @property string $activity_type
 * @property array<array-key, mixed>|null $activity_metadata
 * @property int $points
 * @property \Illuminate\Support\Carbon $created_at
 * @property-read \App\Models\GaGroup $group
 * @property-read \App\Models\Mahasiswa $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaActivityLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaActivityLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaActivityLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaActivityLog whereActivityMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaActivityLog whereActivityType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaActivityLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaActivityLog whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaActivityLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaActivityLog wherePoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaActivityLog whereUserId($value)
 */
	class GaActivityLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $group_id
 * @property int $reporter_id
 * @property string $description
 * @property array<array-key, mixed>|null $involved_members
 * @property string $status
 * @property string|null $resolution_notes
 * @property int|null $resolved_by
 * @property \Illuminate\Support\Carbon|null $resolved_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\GaGroup $group
 * @property-read \App\Models\Mahasiswa $reporter
 * @property-read \App\Models\Dosen|null $resolver
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereInvolvedMembers($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereReporterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereResolutionNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereResolvedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereResolvedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaConflictReport whereUpdatedAt($value)
 */
	class GaConflictReport extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $group_id
 * @property int $uploaded_by
 * @property string $filename
 * @property string $original_name
 * @property string $file_path
 * @property string $file_type
 * @property int $file_size
 * @property string $mime_type
 * @property string|null $thumbnail_path
 * @property \Illuminate\Support\Carbon $uploaded_at
 * @property-read string $file_size_formatted
 * @property-read \App\Models\GaGroup $group
 * @property-read \App\Models\Mahasiswa $uploader
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereFileType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereFilename($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereMimeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereOriginalName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereThumbnailPath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereUploadedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaFile whereUploadedBy($value)
 */
	class GaFile extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $assignment_id
 * @property string $name
 * @property int $leader_id
 * @property int|null $slot_number
 * @property bool $is_locked
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaActivityLog> $activityLogs
 * @property-read int|null $activity_logs_count
 * @property-read \App\Models\GroupAssignment $assignment
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaConflictReport> $conflictReports
 * @property-read int|null $conflict_reports_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaFile> $files
 * @property-read int|null $files_count
 * @property-read int $member_count
 * @property-read float $progress
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaInvitation> $invitations
 * @property-read int|null $invitations_count
 * @property-read \App\Models\Mahasiswa $leader
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaGroupMember> $members
 * @property-read int|null $members_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaMessage> $messages
 * @property-read int|null $messages_count
 * @property-read \App\Models\GaSubmission|null $submission
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaTask> $tasks
 * @property-read int|null $tasks_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup whereAssignmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup whereIsLocked($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup whereLeaderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup whereSlotNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroup whereUpdatedAt($value)
 */
	class GaGroup extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $group_id
 * @property int $student_id
 * @property bool $is_leader
 * @property \Illuminate\Support\Carbon $joined_at
 * @property-read \App\Models\GaGroup $group
 * @property-read \App\Models\Mahasiswa $student
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroupMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroupMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroupMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroupMember whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroupMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroupMember whereIsLeader($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroupMember whereJoinedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaGroupMember whereStudentId($value)
 */
	class GaGroupMember extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $submission_id
 * @property int $student_id
 * @property numeric $base_grade
 * @property numeric $adjustment
 * @property numeric|null $peer_evaluation_score
 * @property numeric|null $contribution_score
 * @property numeric $final_grade
 * @property string|null $grading_notes
 * @property-read \App\Models\Mahasiswa $student
 * @property-read \App\Models\GaSubmission $submission
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade whereAdjustment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade whereBaseGrade($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade whereContributionScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade whereFinalGrade($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade whereGradingNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade wherePeerEvaluationScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade whereStudentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaIndividualGrade whereSubmissionId($value)
 */
	class GaIndividualGrade extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $group_id
 * @property int $inviter_id
 * @property int $invitee_id
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $responded_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\GaGroup $group
 * @property-read \App\Models\Mahasiswa $invitee
 * @property-read \App\Models\Mahasiswa $inviter
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation whereInviteeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation whereInviterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation whereRespondedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaInvitation whereUpdatedAt($value)
 */
	class GaInvitation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $group_id
 * @property int $sender_id
 * @property string|null $content
 * @property string $type
 * @property int|null $reply_to_id
 * @property int|null $attachment_id
 * @property bool $is_edited
 * @property bool $is_deleted
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\GaFile|null $attachment
 * @property-read \App\Models\GaGroup $group
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaMessageReaction> $reactions
 * @property-read int|null $reactions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaMessageRead> $reads
 * @property-read int|null $reads_count
 * @property-read GaMessage|null $replyTo
 * @property-read \App\Models\Mahasiswa $sender
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereAttachmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereIsDeleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereIsEdited($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereReplyToId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereSenderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessage whereUpdatedAt($value)
 */
	class GaMessage extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $message_id
 * @property int $user_id
 * @property string $emoji
 * @property \Illuminate\Support\Carbon $created_at
 * @property-read \App\Models\GaMessage $message
 * @property-read \App\Models\Mahasiswa $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageReaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageReaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageReaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageReaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageReaction whereEmoji($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageReaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageReaction whereMessageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageReaction whereUserId($value)
 */
	class GaMessageReaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $message_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $read_at
 * @property-read \App\Models\GaMessage $message
 * @property-read \App\Models\Mahasiswa $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageRead newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageRead newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageRead query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageRead whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageRead whereMessageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageRead whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaMessageRead whereUserId($value)
 */
	class GaMessageRead extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $assignment_id
 * @property int $evaluator_id
 * @property int $evaluated_id
 * @property int $contribution_score
 * @property int $communication_score
 * @property int $reliability_score
 * @property int $quality_score
 * @property string|null $comments
 * @property \Illuminate\Support\Carbon $submitted_at
 * @property-read \App\Models\GroupAssignment $assignment
 * @property-read \App\Models\Mahasiswa $evaluated
 * @property-read \App\Models\Mahasiswa $evaluator
 * @property-read float $average_score
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation whereAssignmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation whereComments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation whereCommunicationScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation whereContributionScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation whereEvaluatedId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation whereEvaluatorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation whereQualityScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation whereReliabilityScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaPeerEvaluation whereSubmittedAt($value)
 */
	class GaPeerEvaluation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $group_id
 * @property int $assignment_id
 * @property int $submitted_by
 * @property string|null $submission_notes
 * @property \Illuminate\Support\Carbon $submitted_at
 * @property bool $is_late
 * @property int $late_duration_minutes
 * @property numeric|null $grade
 * @property string|null $grading_notes
 * @property \Illuminate\Support\Carbon|null $graded_at
 * @property int|null $graded_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\GroupAssignment $assignment
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaFile> $files
 * @property-read int|null $files_count
 * @property-read \App\Models\Dosen|null $grader
 * @property-read \App\Models\GaGroup $group
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaIndividualGrade> $individualGrades
 * @property-read int|null $individual_grades_count
 * @property-read \App\Models\Mahasiswa $submitter
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereAssignmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereGrade($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereGradedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereGradedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereGradingNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereIsLate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereLateDurationMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereSubmissionNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereSubmittedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereSubmittedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaSubmission whereUpdatedAt($value)
 */
	class GaSubmission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $group_id
 * @property string $title
 * @property string|null $description
 * @property int $created_by
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $deadline
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property int|null $completed_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Mahasiswa> $assignees
 * @property-read int|null $assignees_count
 * @property-read \App\Models\Mahasiswa|null $completedByUser
 * @property-read \App\Models\Mahasiswa $creator
 * @property-read \App\Models\GaGroup $group
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereCompletedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereDeadline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GaTask whereUpdatedAt($value)
 */
	class GaTask extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $dosen_id
 * @property int $course_id
 * @property string $title
 * @property string|null $description
 * @property string $formation_mode
 * @property string $grading_mode
 * @property int $min_members
 * @property int $max_members
 * @property \Illuminate\Support\Carbon|null $formation_deadline
 * @property \Illuminate\Support\Carbon|null $submission_deadline
 * @property int $max_file_size_mb
 * @property array<array-key, mixed>|null $allowed_file_types
 * @property array<array-key, mixed>|null $features
 * @property numeric|null $peer_evaluation_weight
 * @property numeric $contribution_threshold
 * @property bool $allow_resubmission
 * @property int|null $random_group_count
 * @property int|null $random_group_size
 * @property int|null $self_form_group_count
 * @property int|null $self_form_group_size
 * @property bool $is_locked
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaConflictReport> $conflictReports
 * @property-read int|null $conflict_reports_count
 * @property-read \App\Models\MataKuliah $course
 * @property-read \App\Models\Dosen $dosen
 * @property-read bool $is_overdue
 * @property-read int $submitted_groups_count
 * @property-read int $total_groups_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaGroup> $groups
 * @property-read int|null $groups_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaPeerEvaluation> $peerEvaluations
 * @property-read int|null $peer_evaluations_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GaSubmission> $submissions
 * @property-read int|null $submissions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereAllowResubmission($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereAllowedFileTypes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereContributionThreshold($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereDosenId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereFeatures($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereFormationDeadline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereFormationMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereGradingMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereIsLocked($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereMaxFileSizeMb($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereMaxMembers($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereMinMembers($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment wherePeerEvaluationWeight($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereRandomGroupCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereRandomGroupSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereSelfFormGroupCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereSelfFormGroupSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereSubmissionDeadline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroupAssignment whereUpdatedAt($value)
 */
	class GroupAssignment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $category
 * @property string $question
 * @property string $answer
 * @property int $order
 * @property bool $is_active
 * @property int $helpful_count
 * @property int $not_helpful_count
 * @property int $view_count
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereAnswer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereHelpfulCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereNotHelpfulCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereQuestion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFaq whereViewCount($value)
 */
	class HelpFaq extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $user_type
 * @property int $user_id
 * @property string $user_name
 * @property string $user_email
 * @property string $category
 * @property string $subject
 * @property string $message
 * @property string $status
 * @property string|null $admin_response
 * @property \Illuminate\Support\Carbon|null $responded_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereAdminResponse($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereRespondedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereSubject($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereUserEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereUserName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpFeedback whereUserType($value)
 */
	class HelpFeedback extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $title
 * @property string $description
 * @property string $category
 * @property string $steps
 * @property int $order
 * @property bool $is_active
 * @property int $view_count
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting whereSteps($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HelpTroubleshooting whereViewCount($value)
 */
	class HelpTroubleshooting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $type
 * @property string $filename
 * @property int $total_rows
 * @property int $success_count
 * @property int $error_count
 * @property int $skip_count
 * @property array<array-key, mixed>|null $errors
 * @property string $status
 * @property int $imported_by
 * @property \Illuminate\Support\Carbon|null $started_at
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $status_label
 * @property-read float $success_rate
 * @property-read string $type_label
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereErrorCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereErrors($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereFilename($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereImportedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereSkipCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereStartedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereSuccessCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereTotalRows($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ImportLog whereUpdatedAt($value)
 */
	class ImportLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $mahasiswa_id
 * @property string $type
 * @property numeric $amount
 * @property string|null $description
 * @property string $category
 * @property \Illuminate\Support\Carbon $period_date
 * @property string $status
 * @property int|null $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $creator
 * @property-read \App\Models\Mahasiswa|null $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas wherePeriodDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kas whereUpdatedAt($value)
 */
	class Kas extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property numeric $amount_due
 * @property int $weeks_overdue
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $sent_at
 * @property \Illuminate\Support\Carbon|null $acknowledged_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $kas_id
 * @property string $channel
 * @property string|null $scheduled_at
 * @property string|null $metadata
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereAcknowledgedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereAmountDue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereChannel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereKasId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereScheduledAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereSentAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasReminder whereWeeksOverdue($value)
 */
	class KasReminder extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property numeric $total_balance
 * @property numeric $total_income
 * @property numeric $total_expense
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasSummary newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasSummary newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasSummary query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasSummary whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasSummary whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasSummary whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasSummary whereTotalBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasSummary whereTotalExpense($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasSummary whereTotalIncome($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasSummary whereUpdatedAt($value)
 */
	class KasSummary extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $kas_voting_id
 * @property int $mahasiswa_id
 * @property string $vote
 * @property string|null $comment
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @property-read \App\Models\KasVoting $voting
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVote newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVote newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVote query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVote whereComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVote whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVote whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVote whereKasVotingId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVote whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVote whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVote whereVote($value)
 */
	class KasVote extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $title
 * @property string $description
 * @property numeric $amount
 * @property string $category
 * @property string $status
 * @property int $created_by
 * @property \Illuminate\Support\Carbon $voting_deadline
 * @property int $min_votes
 * @property numeric $approval_threshold
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $creator
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\KasVote> $votes
 * @property-read int|null $votes_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereApprovalThreshold($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereMinVotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KasVoting whereVotingDeadline($value)
 */
	class KasVoting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int $rank
 * @property int $points
 * @property int $streak
 * @property numeric $attendance_rate
 * @property int $badges_count
 * @property string $period
 * @property \Illuminate\Support\Carbon $snapshot_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot forPeriod(string $period)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot latest()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot whereAttendanceRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot whereBadgesCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot wherePeriod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot wherePoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot whereRank($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot whereSnapshotDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot whereStreak($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaderboardSnapshot whereUpdatedAt($value)
 */
	class LeaderboardSnapshot extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $level_number
 * @property string $name
 * @property int $min_points
 * @property int $max_points
 * @property string|null $icon
 * @property string $color
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereLevelNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereMaxPoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereMinPoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereUpdatedAt($value)
 */
	class Level extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nim
 * @property string $nama
 * @property string|null $email
 * @property string|null $fakultas
 * @property string|null $kelas
 * @property int|null $semester
 * @property string|null $jenis_kelamin
 * @property string $password
 * @property int $total_points
 * @property int $current_level
 * @property string|null $avatar_url
 * @property string|null $phone
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $last_activity_at
 * @property string $theme_preference
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceLog> $attendanceLogs
 * @property-read int|null $attendance_logs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceWarning> $attendanceWarnings
 * @property-read int|null $attendance_warnings_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MahasiswaCourse> $courses
 * @property-read int|null $courses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FraudAlert> $fraudAlerts
 * @property-read int|null $fraud_alerts_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StudyGroupMember> $studyGroupMemberships
 * @property-read int|null $study_group_memberships_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereAvatarUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereCurrentLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereFakultas($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereJenisKelamin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereKelas($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereLastActivityAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereNama($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereNim($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereSemester($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereThemePreference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereTotalPoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Mahasiswa whereUpdatedAt($value)
 */
	class Mahasiswa extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int $badge_id
 * @property \Illuminate\Support\Carbon $earned_at
 * @property string|null $earned_reason
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Badge $badge
 * @property-read string $badge_description
 * @property-read string|null $badge_image
 * @property-read string $badge_name
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaBadge newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaBadge newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaBadge query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaBadge whereBadgeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaBadge whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaBadge whereEarnedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaBadge whereEarnedReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaBadge whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaBadge whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaBadge whereUpdatedAt($value)
 */
	class MahasiswaBadge extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property string $name
 * @property int $sks 2 or 3 only
 * @property int $total_meetings
 * @property int $current_meeting
 * @property int $uts_meeting
 * @property int $uas_meeting
 * @property string $schedule_day
 * @property \Illuminate\Support\Carbon $schedule_time
 * @property string $mode
 * @property int|null $period_group
 * @property \Illuminate\Support\Carbon|null $start_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property bool $is_favorite
 * @property int $study_time_hours
 * @property string $difficulty_level
 * @property string|null $ai_recommendation
 * @property string $color
 * @property string|null $ruangan
 * @property-read string $effective_mode
 * @property-read string $effective_mode_name
 * @property-read string $effective_schedule_day
 * @property-read string $effective_schedule_day_name
 * @property-read bool $is_after_uts
 * @property-read bool $is_uas_critical
 * @property-read bool $is_uas_warning
 * @property-read bool $is_uts_critical
 * @property-read bool $is_uts_warning
 * @property-read string $mode_name
 * @property-read float $progress
 * @property-read string $schedule_day_name
 * @property-read string|null $uas_date
 * @property-read int|null $uas_days_remaining
 * @property-read string|null $uts_date
 * @property-read int|null $uts_days_remaining
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CourseMaterial> $materials
 * @property-read int|null $materials_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CourseMeeting> $meetings
 * @property-read int|null $meetings_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AcademicNote> $notes
 * @property-read int|null $notes_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StudyGroup> $studyGroups
 * @property-read int|null $study_groups_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AcademicTask> $tasks
 * @property-read int|null $tasks_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereAiRecommendation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereCurrentMeeting($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereDifficultyLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereIsFavorite($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse wherePeriodGroup($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereRuangan($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereScheduleDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereScheduleTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereSks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereStudyTimeHours($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereTotalMeetings($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereUasMeeting($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MahasiswaCourse whereUtsMeeting($value)
 */
	class MahasiswaCourse extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nama
 * @property string|null $kode
 * @property int $sks
 * @property string|null $kelas
 * @property int|null $dosen_id
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceSession> $attendanceSessions
 * @property-read int|null $attendance_sessions_count
 * @property-read \App\Models\Dosen|null $dosen
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceSession> $sessions
 * @property-read int|null $sessions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\WeeklyLearningDigest> $weeklyDigests
 * @property-read int|null $weekly_digests_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah whereDosenId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah whereKelas($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah whereKode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah whereNama($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah whereSks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MataKuliah whereUpdatedAt($value)
 */
	class MataKuliah extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $conversation_id
 * @property string $sender_type
 * @property int $sender_id
 * @property string|null $content
 * @property string $type
 * @property int|null $reply_to_id
 * @property int|null $forwarded_from_id
 * @property \Illuminate\Support\Carbon|null $edited_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MessageAttachment> $attachments
 * @property-read int|null $attachments_count
 * @property-read \App\Models\Conversation $conversation
 * @property-read Message|null $forwardedFrom
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PinnedMessage> $pinnedIn
 * @property-read int|null $pinned_in_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MessageReaction> $reactions
 * @property-read int|null $reactions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Message> $replies
 * @property-read int|null $replies_count
 * @property-read Message|null $replyTo
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $sender
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StarredMessage> $starredBy
 * @property-read int|null $starred_by_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message notDeleted()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message search(string $keyword)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereConversationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereEditedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereForwardedFromId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereReplyToId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereSenderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereSenderType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message withType(string $type)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message withoutTrashed()
 */
	class Message extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $message_id
 * @property string $file_name
 * @property string $file_path
 * @property string $file_type
 * @property int $file_size
 * @property string $mime_type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $formatted_size
 * @property-read bool $is_audio
 * @property-read bool $is_document
 * @property-read bool $is_image
 * @property-read bool $is_video
 * @property-read string $url
 * @property-read \App\Models\Message $message
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment whereFileType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment whereMessageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment whereMimeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageAttachment whereUpdatedAt($value)
 */
	class MessageAttachment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $message_id
 * @property string $reactor_type
 * @property int $reactor_id
 * @property string $emoji
 * @property \Illuminate\Support\Carbon $created_at
 * @property-read \App\Models\Message $message
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $reactor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageReaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageReaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageReaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageReaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageReaction whereEmoji($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageReaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageReaction whereMessageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageReaction whereReactorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MessageReaction whereReactorType($value)
 */
	class MessageReaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetodeAbsensi newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetodeAbsensi newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetodeAbsensi query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetodeAbsensi whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetodeAbsensi whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MetodeAbsensi whereUpdatedAt($value)
 */
	class MetodeAbsensi extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $academic_note_id
 * @property int $mahasiswa_id
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @property-read \App\Models\AcademicNote $note
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteCollaborator newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteCollaborator newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteCollaborator query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteCollaborator whereAcademicNoteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteCollaborator whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteCollaborator whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteCollaborator whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteCollaborator whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteCollaborator whereUpdatedAt($value)
 */
	class NoteCollaborator extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $academic_note_id
 * @property string $content
 * @property int $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $creator
 * @property-read \App\Models\AcademicNote $note
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteVersion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteVersion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteVersion query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteVersion whereAcademicNoteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteVersion whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteVersion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteVersion whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteVersion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NoteVersion whereUpdatedAt($value)
 */
	class NoteVersion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int|null $template_id
 * @property string $target_type
 * @property array<array-key, mixed>|null $target_filters
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $scheduled_at
 * @property \Illuminate\Support\Carbon|null $sent_at
 * @property int $total_recipients
 * @property int $sent_count
 * @property int $opened_count
 * @property int $clicked_count
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\NotificationLog> $logs
 * @property-read int|null $logs_count
 * @property-read \App\Models\NotificationTemplate|null $template
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereClickedCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereOpenedCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereScheduledAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereSentAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereSentCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereTargetFilters($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereTargetType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereTemplateId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereTotalRecipients($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationCampaign whereUpdatedAt($value)
 */
	class NotificationCampaign extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $campaign_id
 * @property string $recipient_type
 * @property int $recipient_id
 * @property string $type
 * @property string|null $subject
 * @property string $body
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $sent_at
 * @property \Illuminate\Support\Carbon|null $opened_at
 * @property \Illuminate\Support\Carbon|null $clicked_at
 * @property string|null $error_message
 * @property array<array-key, mixed>|null $metadata
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\NotificationCampaign|null $campaign
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $recipient
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereCampaignId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereClickedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereErrorMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereOpenedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereRecipientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereRecipientType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereSentAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereSubject($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationLog whereUpdatedAt($value)
 */
	class NotificationLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $type
 * @property string|null $subject
 * @property string $body
 * @property array<array-key, mixed>|null $variables
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\NotificationCampaign> $campaigns
 * @property-read int|null $campaigns_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate whereSubject($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NotificationTemplate whereVariables($value)
 */
	class NotificationTemplate extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $conversation_id
 * @property int $message_id
 * @property string $pinned_by_type
 * @property int $pinned_by_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Conversation $conversation
 * @property-read \App\Models\Message $message
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $pinnedBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PinnedMessage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PinnedMessage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PinnedMessage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PinnedMessage whereConversationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PinnedMessage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PinnedMessage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PinnedMessage whereMessageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PinnedMessage wherePinnedById($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PinnedMessage wherePinnedByType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PinnedMessage whereUpdatedAt($value)
 */
	class PinnedMessage extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int $points
 * @property string $type
 * @property string $source
 * @property string $description
 * @property int|null $reference_id
 * @property string|null $reference_type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory wherePoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory whereReferenceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory whereReferenceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory whereSource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PointHistory whereUpdatedAt($value)
 */
	class PointHistory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $prediction_type
 * @property string $subject_type
 * @property int $subject_id
 * @property \Illuminate\Support\Carbon $prediction_date
 * @property numeric $predicted_value
 * @property numeric $confidence_score
 * @property array<array-key, mixed>|null $factors
 * @property numeric|null $actual_value
 * @property \Illuminate\Support\Carbon|null $verified_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $subject
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction whereActualValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction whereConfidenceScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction whereFactors($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction wherePredictedValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction wherePredictionDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction wherePredictionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction whereSubjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction whereSubjectType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Prediction whereVerifiedAt($value)
 */
	class Prediction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $description
 * @property string $type
 * @property int $cost_points
 * @property int|null $stock
 * @property string|null $image_url
 * @property bool $is_available
 * @property array<array-key, mixed>|null $metadata
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\RewardRedemption> $redemptions
 * @property-read int|null $redemptions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward available()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereCostPoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereIsAvailable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereStock($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Reward whereUpdatedAt($value)
 */
	class Reward extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $reward_id
 * @property int $mahasiswa_id
 * @property int $points_spent
 * @property string $status
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $approved_at
 * @property \Illuminate\Support\Carbon|null $delivered_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @property-read \App\Models\Reward $reward
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption whereApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption whereDeliveredAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption wherePointsSpent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption whereRewardId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RewardRedemption whereUpdatedAt($value)
 */
	class RewardRedemption extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property int $dosen_id
 * @property string $ruangan
 * @property string $hari
 * @property \Illuminate\Support\Carbon $jam_mulai
 * @property \Illuminate\Support\Carbon $jam_selesai
 * @property string $semester
 * @property bool $is_active
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Course $course
 * @property-read \App\Models\Dosen $dosen
 * @property-read string $duration
 * @property-read string $time_range
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule forCourse(int $courseId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule forDay(string $day)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereDosenId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereHari($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereJamMulai($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereJamSelesai($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereRuangan($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereSemester($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereUpdatedAt($value)
 */
	class Schedule extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int $course_id
 * @property int $reminder_minutes
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MahasiswaCourse $course
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduleReminder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduleReminder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduleReminder query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduleReminder whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduleReminder whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduleReminder whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduleReminder whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduleReminder whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduleReminder whereReminderMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduleReminder whereUpdatedAt($value)
 */
	class ScheduleReminder extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $attendance_log_id
 * @property string $status
 * @property int|null $verified_by
 * @property string|null $verified_by_type
 * @property string|null $verified_by_name
 * @property \Illuminate\Support\Carbon|null $verified_at
 * @property string|null $rejection_reason
 * @property string|null $note
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\AttendanceLog $attendanceLog
 * @property-read \App\Models\User|null $verifier
 * @property-read \App\Models\Dosen|null $verifierDosen
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SelfieViewRequest> $viewRequests
 * @property-read int|null $view_requests_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereAttendanceLogId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereRejectionReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereVerifiedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereVerifiedByName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieVerification whereVerifiedByType($value)
 */
	class SelfieVerification extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $selfie_verification_id
 * @property int $requested_by
 * @property int $mahasiswa_id
 * @property string $reason
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $responded_at
 * @property string|null $response_note
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read mixed $created_at_formatted
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @property-read \App\Models\User $requestedBy
 * @property-read \App\Models\SelfieVerification $selfieVerification
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest whereRequestedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest whereRespondedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest whereResponseNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest whereSelfieVerificationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SelfieViewRequest whereUpdatedAt($value)
 */
	class SelfieViewRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $dosen_id
 * @property int $course_id
 * @property string $name
 * @property string|null $description
 * @property string $category
 * @property array<array-key, mixed>|null $tags
 * @property \Illuminate\Support\Carbon $default_start_time
 * @property \Illuminate\Support\Carbon $default_end_time
 * @property int $duration_minutes
 * @property int $qr_refresh_interval
 * @property int $allow_late_minutes
 * @property int $grace_period_minutes
 * @property bool $require_selfie
 * @property string $selfie_verification_level
 * @property bool $require_location
 * @property int $location_radius_meters
 * @property bool $anti_spoofing
 * @property int $max_attempts
 * @property array<array-key, mixed>|null $default_days
 * @property bool $auto_activate
 * @property string|null $auto_activate_time
 * @property bool $auto_deactivate
 * @property string|null $auto_deactivate_time
 * @property bool $send_reminder
 * @property int $reminder_minutes_before
 * @property bool $is_active
 * @property bool $is_draft
 * @property bool $is_favorite
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MataKuliah|null $course
 * @property-read \App\Models\Dosen|null $dosen
 * @property-read string $days_label
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereAllowLateMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereAntiSpoofing($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereAutoActivate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereAutoActivateTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereAutoDeactivate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereAutoDeactivateTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereDefaultDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereDefaultEndTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereDefaultStartTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereDosenId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereDurationMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereGracePeriodMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereIsDraft($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereIsFavorite($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereLocationRadiusMeters($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereMaxAttempts($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereQrRefreshInterval($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereReminderMinutesBefore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereRequireLocation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereRequireSelfie($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereSelfieVerificationLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereSendReminder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereTags($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SessionTemplate whereUpdatedAt($value)
 */
	class SessionTemplate extends \Eloquent {}
}

namespace App\Models{
/**
 * @property string $key
 * @property string $value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereValue($value)
 */
	class Setting extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $backup_name
 * @property string|null $backup_description
 * @property array<array-key, mixed> $settings_data
 * @property int|null $created_by
 * @property int $file_size
 * @property int $settings_count
 * @property bool $is_auto_backup
 * @property bool $can_restore
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $creator
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereBackupDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereBackupName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereCanRestore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereIsAutoBackup($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereSettingsCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereSettingsData($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingBackup whereUpdatedAt($value)
 */
	class SettingBackup extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $setting_key
 * @property string|null $setting_label
 * @property string|null $old_value
 * @property string|null $new_value
 * @property string $change_type
 * @property int|null $changed_by
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory whereChangeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory whereChangedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory whereNewValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory whereOldValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory whereSettingKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory whereSettingLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SettingHistory whereUserAgent($value)
 */
	class SettingHistory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $message_id
 * @property string $user_type
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Message $message
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StarredMessage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StarredMessage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StarredMessage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StarredMessage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StarredMessage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StarredMessage whereMessageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StarredMessage whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StarredMessage whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StarredMessage whereUserType($value)
 */
	class StarredMessage extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_id
 * @property int $mata_kuliah_id
 * @property int $total_sessions
 * @property int $present_count
 * @property int $late_count
 * @property int $permit_count
 * @property int $absent_count
 * @property numeric $attendance_percentage
 * @property numeric $activity_score
 * @property string $risk_status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @property-read \App\Models\MataKuliah $mataKuliah
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereAbsentCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereActivityScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereAttendancePercentage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereLateCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereMataKuliahId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore wherePermitCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore wherePresentCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereRiskStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereTotalSessions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentActivityScore whereUpdatedAt($value)
 */
	class StudentActivityScore extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $mahasiswa_course_id
 * @property string $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MahasiswaCourse $course
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StudyGroupMember> $members
 * @property-read int|null $members_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroup newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroup newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroup query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroup whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroup whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroup whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroup whereMahasiswaCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroup whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroup whereUpdatedAt($value)
 */
	class StudyGroup extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $study_group_id
 * @property int $mahasiswa_id
 * @property bool $is_admin
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @property-read \App\Models\StudyGroup $studyGroup
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroupMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroupMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroupMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroupMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroupMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroupMember whereIsAdmin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroupMember whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroupMember whereStudyGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudyGroupMember whereUpdatedAt($value)
 */
	class StudyGroupMember extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property bool $is_template
 * @property string $schedule_type
 * @property \Illuminate\Support\Carbon|null $publish_at
 * @property array<array-key, mixed>|null $recurring_pattern
 * @property string $collaboration_type
 * @property array<array-key, mixed>|null $collaboration_settings
 * @property int|null $estimated_hours
 * @property bool $ai_generated
 * @property numeric|null $bobot_nilai
 * @property int|null $template_id
 * @property int $course_id
 * @property string $judul
 * @property string $deskripsi
 * @property array<array-key, mixed>|null $learning_objectives
 * @property string|null $instruksi
 * @property string $jenis
 * @property \Illuminate\Support\Carbon $deadline
 * @property int $allow_late_submission
 * @property int $late_penalty_percent
 * @property int $late_penalty_days
 * @property int $max_grade
 * @property string $prioritas
 * @property string $status
 * @property string|null $lampiran_url
 * @property string|null $lampiran_nama
 * @property string $created_by_type
 * @property int $created_by_id
 * @property string|null $edited_by_type
 * @property int|null $edited_by_id
 * @property \Illuminate\Support\Carbon|null $edited_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TugasAttachment> $attachments
 * @property-read int|null $attachments_count
 * @property-read \App\Models\MataKuliah $course
 * @property-read \App\Models\User|null $creator
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TugasDependency> $dependencies
 * @property-read int|null $dependencies_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TugasDiskusi> $diskusi
 * @property-read int|null $diskusi_count
 * @property-read \App\Models\User|null $editor
 * @property-read string $creator_name
 * @property-read int $days_until_deadline
 * @property-read string|null $editor_name
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TugasDependency> $prerequisiteFor
 * @property-read int|null $prerequisite_for_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TugasRead> $reads
 * @property-read int|null $reads_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TugasReminder> $reminders
 * @property-read int|null $reminders_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TugasSubmission> $submissions
 * @property-read int|null $submissions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereAiGenerated($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereAllowLateSubmission($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereBobotNilai($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereCollaborationSettings($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereCollaborationType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereCreatedById($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereCreatedByType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereDeadline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereDeskripsi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereEditedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereEditedById($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereEditedByType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereEstimatedHours($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereInstruksi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereIsTemplate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereJenis($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereJudul($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereLampiranNama($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereLampiranUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereLatePenaltyDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereLatePenaltyPercent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereLearningObjectives($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereMaxGrade($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas wherePrioritas($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas wherePublishAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereRecurringPattern($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereScheduleType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereTemplateId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tugas whereUpdatedAt($value)
 */
	class Tugas extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $tugas_id
 * @property string $file_name
 * @property string $file_path
 * @property string|null $file_type
 * @property int|null $file_size
 * @property string|null $uploaded_by_type
 * @property int|null $uploaded_by_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Tugas $tugas
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment whereFileType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment whereTugasId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment whereUploadedById($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasAttachment whereUploadedByType($value)
 */
	class TugasAttachment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $tugas_id
 * @property int $depends_on_tugas_id
 * @property \Illuminate\Support\Carbon $created_at
 * @property-read \App\Models\Tugas $dependency
 * @property-read \App\Models\Tugas $tugas
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDependency newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDependency newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDependency query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDependency whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDependency whereDependsOnTugasId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDependency whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDependency whereTugasId($value)
 */
	class TugasDependency extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $tugas_id
 * @property string $sender_type
 * @property int $sender_id
 * @property string $pesan
 * @property string|null $lampiran_url
 * @property string|null $lampiran_nama
 * @property string $visibility
 * @property string|null $recipient_type
 * @property int|null $recipient_id
 * @property int|null $reply_to_id
 * @property bool $is_pinned
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string|null $recipient_name
 * @property-read string|null $sender_avatar
 * @property-read string $sender_name
 * @property-read \Illuminate\Database\Eloquent\Collection<int, TugasDiskusi> $replies
 * @property-read int|null $replies_count
 * @property-read TugasDiskusi|null $replyTo
 * @property-read \App\Models\Tugas $tugas
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereIsPinned($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereLampiranNama($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereLampiranUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi wherePesan($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereRecipientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereRecipientType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereReplyToId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereSenderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereSenderType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereTugasId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasDiskusi whereVisibility($value)
 */
	class TugasDiskusi extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $tugas_id
 * @property int $mahasiswa_id
 * @property \Illuminate\Support\Carbon $read_at
 * @property-read \App\Models\Mahasiswa|null $mahasiswa
 * @property-read \App\Models\Tugas $tugas
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasRead newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasRead newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasRead query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasRead whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasRead whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasRead whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasRead whereTugasId($value)
 */
	class TugasRead extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $tugas_id
 * @property string $type
 * @property int $value
 * @property string $unit
 * @property bool $enabled
 * @property \Illuminate\Support\Carbon|null $sent_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property-read \App\Models\Tugas $tugas
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder whereEnabled($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder whereSentAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder whereTugasId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasReminder whereValue($value)
 */
	class TugasReminder extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $tugas_id
 * @property int $mahasiswa_id
 * @property string|null $content
 * @property string|null $file_path
 * @property string|null $file_name
 * @property string $status
 * @property numeric|null $grade
 * @property string|null $grade_letter
 * @property string|null $feedback
 * @property int|null $graded_by
 * @property \Illuminate\Support\Carbon|null $graded_at
 * @property \Illuminate\Support\Carbon $submitted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Dosen|null $grader
 * @property-read \App\Models\Mahasiswa $mahasiswa
 * @property-read \App\Models\Tugas $tugas
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereFeedback($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereGrade($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereGradeLetter($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereGradedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereGradedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereMahasiswaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereSubmittedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereTugasId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasSubmission whereUpdatedAt($value)
 */
	class TugasSubmission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string|null $description
 * @property string|null $category
 * @property array<array-key, mixed> $fields
 * @property int $usage_count
 * @property bool $is_favorite
 * @property \Illuminate\Support\Carbon|null $last_used_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereFields($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereIsFavorite($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereLastUsedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereUsageCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TugasTemplate whereUserId($value)
 */
	class TugasTemplate extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $learner_type
 * @property int $learner_id
 * @property string $tutorial_id
 * @property bool $completed
 * @property bool $skipped
 * @property int $current_step
 * @property \Illuminate\Support\Carbon|null $started_at
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $learner
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereCompleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereCurrentStep($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereLearnerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereLearnerType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereSkipped($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereStartedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereTutorialId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TutorialCompletion whereUpdatedAt($value)
 */
	class TutorialCompletion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $avatar_url
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property \Illuminate\Support\Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $last_activity_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAvatarUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastActivityAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorRecoveryCodes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorSecret($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $user_type
 * @property int $user_id
 * @property bool $is_online
 * @property \Illuminate\Support\Carbon|null $last_seen_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserOnlineStatus newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserOnlineStatus newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserOnlineStatus query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserOnlineStatus whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserOnlineStatus whereIsOnline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserOnlineStatus whereLastSeenAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserOnlineStatus whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserOnlineStatus whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserOnlineStatus whereUserType($value)
 */
	class UserOnlineStatus extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $preferable_type
 * @property int $preferable_id
 * @property string $category
 * @property array<array-key, mixed> $settings
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent $preferable
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserPreference newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserPreference newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserPreference query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserPreference whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserPreference whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserPreference whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserPreference wherePreferableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserPreference wherePreferableType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserPreference whereSettings($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserPreference whereUpdatedAt($value)
 */
	class UserPreference extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $class_label
 * @property int $week_number
 * @property string $semester
 * @property \Illuminate\Support\Carbon $week_start_date
 * @property \Illuminate\Support\Carbon $week_end_date
 * @property string|null $description
 * @property bool $has_structured_task
 * @property int $forum_posts_required
 * @property string|null $mentari_course_url
 * @property string|null $mentari_course_id
 * @property bool $is_published
 * @property \Illuminate\Support\Carbon|null $published_at
 * @property int|null $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DigestAnnouncement> $announcements
 * @property-read int|null $announcements_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DigestAssignment> $assignments
 * @property-read int|null $assignments_count
 * @property-read \App\Models\User|null $creator
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DigestForumDiscussion> $forumDiscussions
 * @property-read int|null $forum_discussions_count
 * @property-read float $completion_percentage
 * @property-read int $total_items
 * @property-read string $week_range
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DigestLearningMaterial> $learningMaterials
 * @property-read int|null $learning_materials_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MataKuliah> $mataKuliahs
 * @property-read int|null $mata_kuliahs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DigestSupportContact> $supportContacts
 * @property-read int|null $support_contacts_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DigestUpcomingSchedule> $upcomingSchedules
 * @property-read int|null $upcoming_schedules_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest currentWeek()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest forCourse(int $courseId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest forSemester(string $semester)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest published()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereClassLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereForumPostsRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereHasStructuredTask($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereIsPublished($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereMentariCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereMentariCourseUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest wherePublishedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereSemester($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereWeekEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereWeekNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WeeklyLearningDigest whereWeekStartDate($value)
 */
	class WeeklyLearningDigest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zona newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zona newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zona query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zona whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zona whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zona whereUpdatedAt($value)
 */
	class Zona extends \Eloquent {}
}


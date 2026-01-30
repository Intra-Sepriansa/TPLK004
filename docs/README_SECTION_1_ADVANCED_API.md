# 📚 ADVANCED API DOCUMENTATION

> **Tambahkan section ini setelah line 3360 di README.md**

---

## 🔌 Complete API Reference

### Base URL
```
Production: https://tplk004.com/api
Development: http://localhost:8000/api
```

### Authentication

All API requests require authentication using Bearer tokens.

```http
Authorization: Bearer {your-token-here}
```

#### Get API Token

```http
POST /api/auth/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "1|abc123...",
    "type": "Bearer",
    "expires_in": 3600
  }
}
```

---

### 📊 Dashboard API

#### Get Dashboard Statistics

```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_students": 1250,
    "total_sessions": 450,
    "attendance_rate": 87.5,
    "active_sessions": 12,
    "today_attendance": 340,
    "pending_verifications": 23
  }
}
```

#### Get Attendance Trends

```http
GET /api/dashboard/trends?period=week
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: `day`, `week`, `month`, `year`
- `start_date`: YYYY-MM-DD (optional)
- `end_date`: YYYY-MM-DD (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "datasets": [
      {
        "label": "Present",
        "data": [85, 92, 88, 90, 87]
      },
      {
        "label": "Late",
        "data": [10, 5, 8, 7, 9]
      },
      {
        "label": "Absent",
        "data": [5, 3, 4, 3, 4]
      }
    ]
  }
}
```

---

### 👥 Student Management API

#### List All Students

```http
GET /api/students?page=1&per_page=20&search=john
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)
- `search`: Search by name or NIM
- `kelas`: Filter by class
- `sort_by`: `nama`, `nim`, `created_at`
- `sort_order`: `asc`, `desc`

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "nim": "2024010001",
        "nama": "John Doe",
        "email": "john@example.com",
        "kelas": "06TPLK004",
        "fakultas": "Ilmu Komputer",
        "attendance_rate": 92.5,
        "total_points": 1250,
        "level": 4,
        "badges_count": 12,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1250,
    "per_page": 20,
    "last_page": 63
  }
}
```

#### Get Student Detail

```http
GET /api/students/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nim": "2024010001",
    "nama": "John Doe",
    "email": "john@example.com",
    "phone": "+62812345678",
    "kelas": "06TPLK004",
    "fakultas": "Ilmu Komputer",
    "avatar_url": "https://example.com/avatars/1.jpg",
    "attendance_stats": {
      "total_sessions": 50,
      "present": 45,
      "late": 3,
      "absent": 2,
      "rate": 92.5
    },
    "gamification": {
      "total_points": 1250,
      "level": 4,
      "level_name": "Teladan",
      "badges": 12,
      "current_streak": 7
    },
    "recent_attendance": [
      {
        "date": "2024-01-20",
        "course": "Pemrograman Web",
        "status": "present",
        "check_in_time": "08:05:00"
      }
    ]
  }
}
```

#### Create Student

```http
POST /api/students
Authorization: Bearer {token}
Content-Type: application/json

{
  "nim": "2024010100",
  "nama": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "kelas": "06TPLK004",
  "fakultas": "Ilmu Komputer",
  "phone": "+62812345679"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": 1251,
    "nim": "2024010100",
    "nama": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

#### Update Student

```http
PUT /api/students/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nama": "Jane Smith Updated",
  "email": "jane.new@example.com",
  "phone": "+62812345680"
}
```

#### Delete Student

```http
DELETE /api/students/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

#### Bulk Import Students

```http
POST /api/students/import
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: students.xlsx
```

**Excel Format:**
| NIM | Nama | Email | Kelas | Fakultas | Phone |
|-----|------|-------|-------|----------|-------|
| 2024010001 | John Doe | john@example.com | 06TPLK004 | Ilmu Komputer | +62812345678 |

**Response:**
```json
{
  "success": true,
  "message": "Import completed",
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {
        "row": 10,
        "nim": "2024010010",
        "error": "Duplicate NIM"
      }
    ]
  }
}
```

---

### 📅 Attendance Session API

#### List Sessions

```http
GET /api/sessions?status=active&date=2024-01-20
Authorization: Bearer {token}
```

**Query Parameters:**
- `status`: `active`, `closed`, `scheduled`
- `date`: YYYY-MM-DD
- `course_id`: Filter by course
- `dosen_id`: Filter by lecturer

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "course": {
        "id": 1,
        "nama": "Pemrograman Web",
        "kode": "TI101"
      },
      "dosen": {
        "id": 1,
        "nama": "Dr. Ahmad Fauzi",
        "nidn": "0412018901"
      },
      "session_date": "2024-01-20",
      "start_time": "08:00:00",
      "end_time": "10:00:00",
      "status": "active",
      "qr_code": "https://example.com/qr/abc123.png",
      "token": "ABC123XYZ",
      "location": {
        "latitude": -6.2088,
        "longitude": 106.8456,
        "radius": 100,
        "address": "Gedung A, Lantai 2"
      },
      "stats": {
        "total_students": 40,
        "present": 35,
        "late": 3,
        "absent": 2
      }
    }
  ]
}
```

#### Create Session

```http
POST /api/sessions
Authorization: Bearer {token}
Content-Type: application/json

{
  "course_id": 1,
  "session_date": "2024-01-20",
  "start_time": "08:00:00",
  "end_time": "10:00:00",
  "location": {
    "latitude": -6.2088,
    "longitude": 106.8456,
    "radius": 100,
    "address": "Gedung A, Lantai 2"
  },
  "notes": "Pertemuan ke-5: React Hooks"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "id": 451,
    "token": "XYZ789ABC",
    "qr_code": "https://example.com/qr/xyz789.png",
    "expires_at": "2024-01-20T10:00:00Z"
  }
}
```

#### Activate Session

```http
POST /api/sessions/{id}/activate
Authorization: Bearer {token}
```

#### Close Session

```http
POST /api/sessions/{id}/close
Authorization: Bearer {token}
```

#### Regenerate QR Code

```http
POST /api/sessions/{id}/regenerate-qr
Authorization: Bearer {token}
```

---

### ✅ Attendance Submission API

#### Submit Attendance

```http
POST /api/attendance/submit
Authorization: Bearer {token}
Content-Type: multipart/form-data

token: ABC123XYZ
location: {"latitude": -6.2088, "longitude": 106.8456, "accuracy": 10}
selfie: [file]
device_info: {"model": "iPhone 13", "os": "iOS 16"}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance submitted successfully",
  "data": {
    "id": 1234,
    "status": "present",
    "check_in_time": "08:05:23",
    "points_earned": 10,
    "badges_unlocked": [
      {
        "id": 1,
        "name": "Early Bird I",
        "points": 50
      }
    ],
    "streak": {
      "current": 8,
      "record": 15
    }
  }
}
```

**Error Responses:**

```json
// Invalid token
{
  "success": false,
  "error": "INVALID_TOKEN",
  "message": "QR code is invalid or expired"
}

// Outside geofence
{
  "success": false,
  "error": "LOCATION_INVALID",
  "message": "You are outside the allowed area",
  "data": {
    "your_location": {"lat": -6.2100, "lng": 106.8500},
    "required_location": {"lat": -6.2088, "lng": 106.8456},
    "distance": 150,
    "max_distance": 100
  }
}

// Face not detected
{
  "success": false,
  "error": "FACE_NOT_DETECTED",
  "message": "No face detected in selfie. Please try again."
}

// Already submitted
{
  "success": false,
  "error": "ALREADY_SUBMITTED",
  "message": "You have already submitted attendance for this session"
}
```

---

### 🎮 Gamification API

#### Get User Badges

```http
GET /api/gamification/badges
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_badges": 36,
    "unlocked": 12,
    "locked": 24,
    "badges": [
      {
        "id": 1,
        "name": "Streak Master",
        "description": "Hadir berturut-turut",
        "category": "streak",
        "level": 1,
        "icon": "/images/badges/streak_master.png",
        "color": "orange",
        "points": 50,
        "requirement": "3 hari streak",
        "is_unlocked": true,
        "unlocked_at": "2024-01-15T10:30:00Z",
        "progress": {
          "current": 3,
          "required": 3,
          "percentage": 100
        }
      },
      {
        "id": 2,
        "name": "Streak Master II",
        "description": "Hadir berturut-turut",
        "category": "streak",
        "level": 2,
        "icon": "/images/badges/streak_master_2.png",
        "color": "orange",
        "points": 100,
        "requirement": "5 hari streak",
        "is_unlocked": false,
        "progress": {
          "current": 3,
          "required": 5,
          "percentage": 60
        }
      }
    ]
  }
}
```

#### Get Leaderboard

```http
GET /api/gamification/leaderboard?period=week&limit=100
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: `day`, `week`, `month`, `all`
- `limit`: Number of results (default: 50, max: 100)
- `kelas`: Filter by class

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "updated_at": "2024-01-20T15:30:00Z",
    "my_rank": 15,
    "leaderboard": [
      {
        "rank": 1,
        "student": {
          "id": 1,
          "nim": "2024010001",
          "nama": "John Doe",
          "avatar_url": "https://example.com/avatars/1.jpg"
        },
        "points": 1250,
        "level": 5,
        "badges": 18,
        "attendance_rate": 98.5,
        "streak": 15
      }
    ]
  }
}
```

---

### 📊 Analytics & Reports API

#### Get Attendance Report

```http
GET /api/reports/attendance?start_date=2024-01-01&end_date=2024-01-31&format=json
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date`: YYYY-MM-DD (required)
- `end_date`: YYYY-MM-DD (required)
- `format`: `json`, `pdf`, `excel`, `csv`
- `course_id`: Filter by course
- `student_id`: Filter by student
- `group_by`: `day`, `week`, `month`, `course`, `student`

**Response (JSON):**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "summary": {
      "total_sessions": 50,
      "total_attendances": 1850,
      "average_rate": 92.5,
      "present": 1700,
      "late": 100,
      "absent": 50
    },
    "by_course": [
      {
        "course": "Pemrograman Web",
        "sessions": 10,
        "attendance_rate": 95.0
      }
    ],
    "by_student": [
      {
        "student": "John Doe",
        "nim": "2024010001",
        "attendance_rate": 98.0
      }
    ]
  }
}
```

**Response (PDF/Excel/CSV):**
Returns file download with appropriate Content-Type header.

---

### 🔔 Notifications API

#### Get Notifications

```http
GET /api/notifications?unread=true&page=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unread_count": 5,
    "notifications": [
      {
        "id": "uuid-123",
        "type": "attendance_reminder",
        "title": "Sesi Absensi Aktif",
        "message": "Jangan lupa absen untuk mata kuliah Pemrograman Web",
        "data": {
          "session_id": 451,
          "course": "Pemrograman Web",
          "expires_at": "2024-01-20T10:00:00Z"
        },
        "read_at": null,
        "created_at": "2024-01-20T08:00:00Z"
      }
    ]
  }
}
```

#### Mark as Read

```http
POST /api/notifications/{id}/read
Authorization: Bearer {token}
```

#### Mark All as Read

```http
POST /api/notifications/read-all
Authorization: Bearer {token}
```

---

### 🔍 Search API

#### Global Search

```http
GET /api/search?q=john&type=students,courses
Authorization: Bearer {token}
```

**Query Parameters:**
- `q`: Search query (required, min 3 characters)
- `type`: Comma-separated types: `students`, `courses`, `sessions`, `dosen`
- `limit`: Results per type (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 1,
        "nim": "2024010001",
        "nama": "John Doe",
        "kelas": "06TPLK004"
      }
    ],
    "courses": [
      {
        "id": 1,
        "kode": "TI101",
        "nama": "Pemrograman Web"
      }
    ]
  }
}
```

---

### 📈 Rate Limiting

All API endpoints are rate-limited to prevent abuse:

| Endpoint Type | Rate Limit |
|---------------|------------|
| Authentication | 5 requests/minute |
| Read Operations | 60 requests/minute |
| Write Operations | 30 requests/minute |
| File Uploads | 10 requests/minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642680000
```

**Rate Limit Exceeded Response:**
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

---

### 🔒 API Security

#### API Key Authentication (Alternative)

For server-to-server communication:

```http
GET /api/endpoint
X-API-Key: your-api-key-here
```

#### Webhook Signatures

All webhook payloads are signed with HMAC-SHA256:

```
X-Signature: sha256=abc123...
```

Verify signature:
```php
$signature = hash_hmac('sha256', $payload, $secret);
if (!hash_equals($signature, $_SERVER['HTTP_X_SIGNATURE'])) {
    throw new Exception('Invalid signature');
}
```

---

### 📝 API Response Format

All API responses follow this standard format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-20T15:30:00Z",
    "version": "1.0.0"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "errors": {
    "field_name": ["Validation error message"]
  },
  "meta": {
    "timestamp": "2024-01-20T15:30:00Z",
    "version": "1.0.0"
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful, no response body |
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Maintenance mode |

---


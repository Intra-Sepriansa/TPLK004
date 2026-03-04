# PROMPT: Detail Audit Keamanan Admin - Ultra Advanced Complete

## 🎯 TUJUAN UTAMA
Membuat halaman Detail Audit Keamanan yang sangat lengkap dan inovatif dengan fitur real-time security monitoring, threat analysis, forensic investigation, dan compliance tracking. Halaman ini harus 100% match dengan design system dashboard admin, sangat responsif di mobile, dan memiliki inovasi signifikan dalam security audit management.

## 🚨 ATURAN KRUSIAL (WAJIB DIIKUTI)

### Design System Consistency
1. **WAJIB** match 100% dengan dashboard admin (warna, typography, spacing, borders, shadows)
2. **HAPUS** container wrapper pada icon header (icon langsung tanpa background container)
3. **HAPUS** semua animasi floating/bouncing pada icon
4. **SAMAKAN** warna icon dengan warna container card
5. **GUNAKAN** back button style yang konsisten seperti menu lain
6. **NO DATA DUMMY** - semua data harus real dari backend

### Mobile Responsiveness (SANGAT KRUSIAL)
1. Header harus rapi dan clean di mobile view
2. Tabs navigation harus scrollable horizontal di mobile
3. Cards harus stack vertical di mobile dengan spacing optimal
4. Charts harus responsive dan readable di layar kecil
5. Timeline harus optimized untuk mobile scrolling
6. Action buttons harus accessible dengan thumb-friendly size
7. Modal/drawer harus full-screen di mobile untuk better UX

### Code Quality
1. Gunakan TypeScript dengan proper typing
2. Implementasi Framer Motion untuk smooth animations
3. Gunakan Tailwind CSS untuk styling
4. Implementasi proper error handling
5. Optimasi performance dengan lazy loading dan memoization


## 📊 STRUKTUR HALAMAN

### 1. Header Section (Gradient Background - Match Dashboard)
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]                                    [Export] [Share]│
│                                                               │
│  [Icon]  Token Duplikat #12345                               │
│          Intra Sepriansa                                     │
│          2024001 • 2024-03-04 14:30:25                      │
│                                                               │
│  [Security Score: 45/100] [Threat Level: HIGH]              │
└─────────────────────────────────────────────────────────────┘
```

**Fitur Header:**
- Animated gradient background (indigo → purple → pink)
- Icon header TANPA container wrapper
- Security score badge dengan color coding
- Threat level indicator (LOW/MEDIUM/HIGH/CRITICAL)
- Quick action buttons (Export, Share, Flag, Resolve)
- Real-time status indicator

### 2. Tabs Navigation (6 Tabs)
```
[Overview] [Timeline] [Forensics] [Impact] [Actions] [Related]
```

**Tab Descriptions:**
- **Overview**: Security summary, event details, quick stats
- **Timeline**: Chronological event sequence with visualization
- **Forensics**: Deep technical analysis, device fingerprint, network trace
- **Impact**: Affected systems, users, sessions, risk assessment
- **Actions**: Incident response, remediation steps, escalation
- **Related**: Related events, pattern detection, correlation analysis


## 🎨 TAB 1: OVERVIEW

### Security Summary Dashboard
```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│ [Icon] Security Score│ [Icon] Threat Level  │ [Icon] Risk Category │
│       45/100         │       HIGH           │    Authentication    │
│  ▓▓▓▓▓░░░░░ Critical │  🔴 Immediate Action │   Token Security     │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

### Event Details Card
- **Event Type Badge**: Token Duplikat (dengan icon dan color coding)
- **Event ID**: #12345 (copyable)
- **Timestamp**: 2024-03-04 14:30:25 WIB (dengan relative time: "2 jam yang lalu")
- **Event Message**: Full description dengan syntax highlighting
- **Severity Level**: Visual indicator dengan progress bar
- **Status**: Open/Investigating/Resolved dengan color badge

### User & Context Information
```
┌─────────────────────────────────────────────────────────────┐
│ 👤 User Identity                                            │
│    Nama: Intra Sepriansa                                    │
│    NIM: 2024001                                             │
│    Kelas: TI-4A                                             │
│    Email: intra@example.com                                 │
│    Role: Mahasiswa                                          │
│                                                              │
│ 📚 Session Context                                          │
│    Mata Kuliah: Pemrograman Web                            │
│    Pertemuan: 8                                             │
│    Dosen: Dr. Ahmad                                         │
│    Waktu Sesi: 2024-03-04 13:00-15:00                      │
│                                                              │
│ 🌍 Location & Network                                       │
│    IP Address: 192.168.1.100                               │
│    Location: Bandung, Indonesia                             │
│    ISP: Telkom Indonesia                                    │
│    Geofence Status: ✓ Inside Campus Zone                   │
└─────────────────────────────────────────────────────────────┘
```

### Quick Stats Grid (4 Cards)
1. **Previous Incidents**: Count of similar events from this user
2. **Pattern Match**: Percentage match with known attack patterns
3. **Response Time**: Time since event occurred
4. **Similar Events**: Count of related events in last 24h


## 🕐 TAB 2: TIMELINE

### Interactive Event Timeline
```
┌─────────────────────────────────────────────────────────────┐
│ Timeline Visualization                    [Filter] [Export]  │
│                                                               │
│ 14:30:25 ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│          │ Token Duplikat Detected                          │
│          │ User: Intra Sepriansa                            │
│          │ Device: iPhone 13 Pro                            │
│          │                                                   │
│ 14:29:50 ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│          │ Token Generated                                  │
│          │ Session: Pemrograman Web #8                      │
│          │                                                   │
│ 14:29:45 ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│          │ User Login Success                               │
│          │ IP: 192.168.1.100                                │
└─────────────────────────────────────────────────────────────┘
```

**Fitur Timeline:**
- Chronological event sequence dengan visual connector
- Expandable event details dengan click
- Color-coded events berdasarkan severity
- Time gap indicators (menunjukkan jarak waktu antar event)
- Zoom in/out untuk melihat detail atau overview
- Filter by event type, severity, time range
- Export timeline as PDF/PNG

### Event Sequence Analysis
- **Attack Chain Detection**: Identifikasi sequence yang mencurigakan
- **Time Pattern Analysis**: Deteksi pola waktu yang tidak normal
- **Velocity Analysis**: Kecepatan aksi yang mencurigakan
- **Anomaly Highlights**: Event yang keluar dari pola normal

### Timeline Statistics
```
┌──────────────────┬──────────────────┬──────────────────┐
│ Total Events: 15 │ Suspicious: 3    │ Duration: 45min  │
└──────────────────┴──────────────────┴──────────────────┘
```


## 🔬 TAB 3: FORENSICS

### Device Fingerprint Analysis
```
┌─────────────────────────────────────────────────────────────┐
│ 📱 Device Information                                        │
│                                                               │
│ Device ID: d4f5e6a7-b8c9-1234-5678-9abcdef01234            │
│ Device Name: iPhone 13 Pro                                  │
│ OS: iOS 17.2.1                                              │
│ Browser: Safari 17.2                                        │
│ Screen: 1170x2532 (390x844 viewport)                       │
│ Timezone: Asia/Jakarta (UTC+7)                              │
│ Language: id-ID, en-US                                      │
│                                                               │
│ 🔐 Security Features                                         │
│ ✓ Touch ID Enabled                                          │
│ ✓ Passcode Set                                              │
│ ✓ Find My iPhone Active                                     │
│ ✗ Jailbreak Detected: No                                    │
│                                                               │
│ 📊 Device Trust Score: 85/100                               │
│ ▓▓▓▓▓▓▓▓▓░ Trusted Device                                   │
└─────────────────────────────────────────────────────────────┘
```

### Network Analysis
```
┌─────────────────────────────────────────────────────────────┐
│ 🌐 Network Forensics                                         │
│                                                               │
│ IP Address: 192.168.1.100                                   │
│ IP Type: Private (Campus Network)                           │
│ MAC Address: 00:1A:2B:3C:4D:5E                             │
│ Hostname: student-device-001                                │
│                                                               │
│ ISP: Telkom Indonesia                                       │
│ ASN: AS17974                                                │
│ Location: Bandung, West Java, Indonesia                     │
│ Coordinates: -6.9175, 107.6191                              │
│                                                               │
│ Connection Type: WiFi (Campus-Student)                      │
│ Signal Strength: -45 dBm (Excellent)                        │
│ Connection Speed: 100 Mbps                                  │
│                                                               │
│ 🛡️ Security Checks                                          │
│ ✓ VPN Detected: No                                          │
│ ✓ Proxy Detected: No                                        │
│ ✓ Tor Exit Node: No                                         │
│ ✓ Known Malicious IP: No                                    │
└─────────────────────────────────────────────────────────────┘
```

### Request Headers & Metadata
```json
{
  "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1...)",
  "accept_language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "accept_encoding": "gzip, deflate, br",
  "referer": "https://tplk.app/student/dashboard",
  "origin": "https://tplk.app",
  "sec_fetch_site": "same-origin",
  "sec_fetch_mode": "cors",
  "sec_fetch_dest": "empty"
}
```

### Behavioral Analysis
- **Mouse Movement Pattern**: Heatmap visualization
- **Typing Speed**: Average WPM dan consistency
- **Navigation Pattern**: Page flow analysis
- **Interaction Timing**: Click/tap timing analysis
- **Scroll Behavior**: Scroll speed dan pattern


## 💥 TAB 4: IMPACT ANALYSIS

### Affected Systems Dashboard
```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│ [Icon] Users Affected│ [Icon] Sessions      │ [Icon] Data Exposed  │
│         1            │         1            │      Minimal         │
│   Direct Impact      │   Active Session     │   No Breach          │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

### Risk Assessment Matrix
```
┌─────────────────────────────────────────────────────────────┐
│ Risk Assessment                                              │
│                                                               │
│ Likelihood: HIGH     ████████░░ 80%                         │
│ Impact: MEDIUM       ██████░░░░ 60%                         │
│ Overall Risk: HIGH   ███████░░░ 70%                         │
│                                                               │
│ Risk Factors:                                                │
│ • Token reuse detected (Critical)                           │
│ • Multiple devices from same user (High)                    │
│ • Unusual time pattern (Medium)                             │
│ • Location mismatch (Low)                                   │
└─────────────────────────────────────────────────────────────┘
```

### Affected Resources
```
┌─────────────────────────────────────────────────────────────┐
│ 📚 Affected Sessions                                         │
│                                                               │
│ 1. Pemrograman Web - Pertemuan 8                            │
│    Status: Compromised                                       │
│    Action: Attendance Invalidated                            │
│    Time: 2024-03-04 13:00-15:00                             │
│                                                               │
│ 👥 Affected Users                                            │
│                                                               │
│ 1. Intra Sepriansa (2024001)                                │
│    Impact: Account Flagged                                   │
│    Action Required: Re-verification                          │
│    Status: Under Investigation                               │
└─────────────────────────────────────────────────────────────┘
```

### Compliance Impact
```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Compliance & Policy Violations                            │
│                                                               │
│ ⚠️ Academic Integrity Policy                                │
│    Severity: High                                            │
│    Article: 3.2 - Token Sharing Prohibition                 │
│    Penalty: Warning + Attendance Void                        │
│                                                               │
│ ⚠️ IT Security Policy                                       │
│    Severity: Medium                                          │
│    Article: 5.1 - Device Authentication                     │
│    Action: Device Re-registration Required                   │
└─────────────────────────────────────────────────────────────┘
```

### Financial Impact (if applicable)
- Estimated cost of incident response
- Potential penalty/fine
- Resource allocation for remediation


## 🎯 TAB 5: ACTIONS & RESPONSE

### Incident Response Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Incident Status: OPEN                    [Change Status ▼]  │
│ Assigned To: Security Team               [Reassign]         │
│ Priority: HIGH                           [Change Priority]   │
│ Created: 2024-03-04 14:30:25                                │
│ Last Updated: 2024-03-04 14:35:10                           │
└─────────────────────────────────────────────────────────────┘
```

### Quick Actions Panel
```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│ [Icon] Block User    │ [Icon] Void Attendance│ [Icon] Flag Device  │
│   Suspend Account    │   Cancel Absensi     │   Block Device      │
│   [Execute]          │   [Execute]          │   [Execute]         │
└──────────────────────┴──────────────────────┴──────────────────────┘

┌──────────────────────┬──────────────────────┬──────────────────────┐
│ [Icon] Send Warning  │ [Icon] Escalate      │ [Icon] Resolve      │
│   Email Notification │   To Academic Team   │   Close Incident    │
│   [Execute]          │   [Execute]          │   [Execute]         │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

### Recommended Actions (AI-Powered)
```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendations                                        │
│                                                               │
│ Based on similar incidents, we recommend:                    │
│                                                               │
│ 1. ⚡ IMMEDIATE (Do Now)                                    │
│    • Invalidate current attendance record                   │
│    • Send warning notification to student                   │
│    • Flag device for monitoring                             │
│                                                               │
│ 2. 📋 SHORT-TERM (Within 24h)                               │
│    • Schedule meeting with student                          │
│    • Review student's attendance history                    │
│    • Check for pattern with other students                  │
│                                                               │
│ 3. 🎯 LONG-TERM (This Week)                                 │
│    • Update token generation algorithm                      │
│    • Implement additional device verification               │
│    • Conduct security awareness training                    │
└─────────────────────────────────────────────────────────────┘
```

### Action History Log
```
┌─────────────────────────────────────────────────────────────┐
│ Action Timeline                                              │
│                                                               │
│ 14:35:10 - Admin (You)                                      │
│ ├─ Changed status to "Investigating"                        │
│ └─ Added note: "Reviewing device fingerprint"              │
│                                                               │
│ 14:32:45 - System                                           │
│ ├─ Sent notification to student                             │
│ └─ Email delivered successfully                             │
│                                                               │
│ 14:30:25 - System                                           │
│ └─ Incident created automatically                           │
└─────────────────────────────────────────────────────────────┘
```

### Add Action/Note Form
```
┌─────────────────────────────────────────────────────────────┐
│ Add Action or Note                                           │
│                                                               │
│ Action Type: [Dropdown: Note/Warning/Block/Escalate/Resolve]│
│                                                               │
│ Description:                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │                                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Notify: [✓] Student  [✓] Dosen  [ ] Academic Team          │
│                                                               │
│ [Cancel]                                    [Submit Action]  │
└─────────────────────────────────────────────────────────────┘
```

### Escalation Path
- Level 1: Security Admin (Current)
- Level 2: Academic Coordinator
- Level 3: Dean's Office
- Level 4: Rector's Office


## 🔗 TAB 6: RELATED EVENTS

### Pattern Detection Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Pattern Analysis                                          │
│                                                               │
│ Pattern Match: 85% similarity with known attack pattern     │
│ Pattern ID: PTN-2024-0042 (Token Sharing Attack)           │
│                                                               │
│ Common Characteristics:                                      │
│ • Same token used from multiple devices                     │
│ • Short time interval between uses                          │
│ • Different IP addresses                                    │
│ • Similar user agent strings                                │
└─────────────────────────────────────────────────────────────┘
```

### Related Events List
```
┌─────────────────────────────────────────────────────────────┐
│ Related Security Events (Last 7 Days)                       │
│                                                               │
│ [Filter: All Types ▼] [Sort: Recent ▼] [Search...]         │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 Token Duplikat #12344                                │ │
│ │ Intra Sepriansa • 2024-03-03 10:15:30                  │ │
│ │ Same user, different device                             │ │
│ │ [View Details →]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🟡 Geofence Violation #12340                           │ │
│ │ Intra Sepriansa • 2024-03-02 14:20:15                  │ │
│ │ Location outside campus zone                            │ │
│ │ [View Details →]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🟠 Suspicious Activity #12335                          │ │
│ │ Intra Sepriansa • 2024-03-01 09:45:00                  │ │
│ │ Unusual login time pattern                              │ │
│ │ [View Details →]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Correlation Graph
```
┌─────────────────────────────────────────────────────────────┐
│ Event Correlation Network                                    │
│                                                               │
│         [Event A] ──────┐                                    │
│                         │                                    │
│         [Event B] ──────┼───── [Current Event]              │
│                         │                                    │
│         [Event C] ──────┘                                    │
│                                                               │
│ Correlation Strength:                                        │
│ • Event A: 95% (Same user, same pattern)                    │
│ • Event B: 80% (Same device, different user)                │
│ • Event C: 65% (Same time window, different location)       │
└─────────────────────────────────────────────────────────────┘
```

### User Behavior Profile
```
┌─────────────────────────────────────────────────────────────┐
│ 👤 User Security Profile: Intra Sepriansa                   │
│                                                               │
│ Risk Score: 65/100 (MEDIUM-HIGH)                            │
│ ▓▓▓▓▓▓▓░░░ Requires Monitoring                              │
│                                                               │
│ Historical Data (Last 30 Days):                             │
│ • Total Events: 8                                           │
│ • Security Incidents: 4                                     │
│ • Warnings Issued: 2                                        │
│ • Violations: 1                                             │
│                                                               │
│ Behavioral Indicators:                                       │
│ 🔴 High: Token sharing pattern detected                     │
│ 🟡 Medium: Irregular login times                            │
│ 🟢 Low: Consistent device usage                             │
│                                                               │
│ Trend: ↗️ Increasing risk (Last 7 days)                     │
└─────────────────────────────────────────────────────────────┘
```

### Similar Incidents Across System
```
┌─────────────────────────────────────────────────────────────┐
│ System-Wide Pattern Detection                               │
│                                                               │
│ Similar incidents in last 24 hours: 12                      │
│ Affected users: 8                                           │
│ Common factor: Same course (Pemrograman Web)                │
│                                                               │
│ Possible Coordinated Attack: 75% probability                │
│ Recommendation: Investigate course-wide                      │
└─────────────────────────────────────────────────────────────┘
```


## 🚀 INOVASI SIGNIFIKAN

### 1. Real-Time Security Monitoring
```typescript
// WebSocket connection untuk real-time updates
const securityChannel = Echo.channel('security-audit.' + auditLog.id);

securityChannel.listen('SecurityEventUpdated', (event) => {
    // Update UI secara real-time
    updateSecurityScore(event.newScore);
    addTimelineEvent(event.newEvent);
    showNotification('Security event updated');
});
```

**Fitur:**
- Live security score updates
- Real-time threat level changes
- Instant notification untuk related events
- Live action log updates
- Real-time correlation detection

### 2. AI-Powered Threat Analysis
```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Security Assistant                                     │
│                                                               │
│ Analysis Complete:                                           │
│                                                               │
│ Threat Classification: Token Sharing Attack                 │
│ Confidence: 92%                                             │
│                                                               │
│ Attack Vector:                                               │
│ User likely shared token via screenshot or messaging app.   │
│ Token was used on different device within 30 seconds.       │
│                                                               │
│ Recommended Response:                                        │
│ 1. Invalidate current session immediately                   │
│ 2. Require device re-verification                           │
│ 3. Issue formal warning to student                          │
│ 4. Monitor for repeat behavior                              │
│                                                               │
│ Similar Cases: 15 incidents in last month                   │
│ Success Rate: 87% resolved with warning                     │
└─────────────────────────────────────────────────────────────┘
```

### 3. Interactive Forensic Visualization
- **Device Fingerprint Heatmap**: Visual representation of device characteristics
- **Network Topology Map**: Show connection path and hops
- **Geolocation Map**: Interactive map dengan geofence overlay
- **Timeline Gantt Chart**: Visual timeline dengan event clustering
- **Correlation Graph**: Interactive node-link diagram

### 4. Automated Response Workflows
```
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Automated Response Rules                                  │
│                                                               │
│ Rule: Token Duplicate Detection                             │
│ Trigger: When token used from 2+ devices                    │
│                                                               │
│ Automated Actions:                                           │
│ ✓ Invalidate attendance record                              │
│ ✓ Send warning email to student                             │
│ ✓ Flag device for monitoring                                │
│ ✓ Create incident ticket                                    │
│ ✓ Notify security team                                      │
│                                                               │
│ Manual Review Required: Yes                                  │
│ Escalation: After 3rd occurrence                            │
│                                                               │
│ [Edit Rule] [Disable] [View History]                        │
└─────────────────────────────────────────────────────────────┘
```

### 5. Predictive Risk Scoring
```typescript
interface RiskFactors {
    historicalViolations: number;      // Weight: 30%
    deviceTrustScore: number;          // Weight: 20%
    behavioralAnomalies: number;       // Weight: 25%
    networkRiskScore: number;          // Weight: 15%
    timePatternScore: number;          // Weight: 10%
}

// Calculate dynamic risk score
const calculateRiskScore = (factors: RiskFactors): number => {
    return (
        factors.historicalViolations * 0.30 +
        factors.deviceTrustScore * 0.20 +
        factors.behavioralAnomalies * 0.25 +
        factors.networkRiskScore * 0.15 +
        factors.timePatternScore * 0.10
    );
};
```

### 6. Compliance & Audit Trail
- **Immutable Log**: Blockchain-inspired audit trail
- **Digital Signatures**: Cryptographic verification of actions
- **Chain of Custody**: Track who accessed/modified incident
- **Compliance Reports**: Auto-generate reports untuk audit
- **Evidence Preservation**: Secure storage of forensic data

### 7. Collaborative Investigation
```
┌─────────────────────────────────────────────────────────────┐
│ 👥 Investigation Team                                        │
│                                                               │
│ Lead Investigator: Admin User (You)                         │
│ Team Members:                                                │
│ • Security Officer - Viewing                                │
│ • Academic Coordinator - Notified                           │
│                                                               │
│ [Add Team Member] [Share Access] [Request Review]           │
│                                                               │
│ Team Chat:                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Security Officer: "Checking device history..."          │ │
│ │ You: "Found 3 similar incidents last week"              │ │
│ │ Academic Coordinator: "Student has clean record"        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Type message...]                              [Send]        │
└─────────────────────────────────────────────────────────────┘
```

### 8. Export & Reporting
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Export Options                                            │
│                                                               │
│ Format:                                                      │
│ [ ] PDF Report (Executive Summary)                          │
│ [ ] PDF Report (Full Technical Details)                     │
│ [ ] Excel Spreadsheet (Data Analysis)                       │
│ [ ] JSON (Raw Data)                                         │
│ [ ] CSV (Timeline Export)                                   │
│                                                               │
│ Include:                                                     │
│ [✓] Event Details                                           │
│ [✓] Timeline                                                │
│ [✓] Forensic Data                                           │
│ [✓] Impact Analysis                                         │
│ [✓] Action History                                          │
│ [✓] Related Events                                          │
│                                                               │
│ [Cancel]                                        [Export]     │
└─────────────────────────────────────────────────────────────┘
```


## 📱 MOBILE RESPONSIVENESS (SANGAT KRUSIAL)

### Mobile Header Design
```
┌─────────────────────────────────┐
│ [←] Detail Audit      [⋮ Menu] │
│                                 │
│ [Icon] Token Duplikat          │
│ #12345                         │
│                                 │
│ Intra Sepriansa                │
│ 2024001                        │
│ 2024-03-04 14:30               │
│                                 │
│ [Score: 45] [Level: HIGH]      │
└─────────────────────────────────┘
```

**Mobile Header Features:**
- Compact layout dengan essential info only
- Hamburger menu untuk actions (Export, Share, etc)
- Collapsible sections untuk save space
- Sticky header saat scroll
- Touch-friendly button sizes (min 44x44px)

### Mobile Tabs Navigation
```
┌─────────────────────────────────┐
│ ← Overview Timeline Forensics → │
└─────────────────────────────────┘
```

**Mobile Tabs Features:**
- Horizontal scrollable tabs
- Active tab indicator yang jelas
- Swipe gesture untuk switch tabs
- Tab labels yang concise
- Smooth scroll animation

### Mobile Card Layout
```
┌─────────────────────────────────┐
│ Security Score                  │
│ ┌─────────────────────────────┐ │
│ │ 45/100                      │ │
│ │ ▓▓▓▓▓░░░░░                  │ │
│ │ Critical                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Threat Level                    │
│ ┌─────────────────────────────┐ │
│ │ HIGH                        │ │
│ │ 🔴 Immediate Action         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Mobile Card Features:**
- Full-width cards dengan proper padding
- Stack vertically dengan consistent spacing
- Collapsible sections untuk long content
- Touch-friendly interactive elements
- Optimized font sizes untuk readability

### Mobile Timeline
```
┌─────────────────────────────────┐
│ Timeline                        │
│                                 │
│ ● 14:30:25                     │
│ │ Token Duplikat               │
│ │ Intra Sepriansa              │
│ │ [Expand ▼]                   │
│ │                              │
│ ● 14:29:50                     │
│ │ Token Generated              │
│ │ [Expand ▼]                   │
│ │                              │
│ ● 14:29:45                     │
│   User Login                   │
│   [Expand ▼]                   │
└─────────────────────────────────┘
```

**Mobile Timeline Features:**
- Vertical timeline dengan compact design
- Expandable event details
- Infinite scroll untuk long timelines
- Pull-to-refresh untuk updates
- Smooth scroll animation

### Mobile Actions Panel
```
┌─────────────────────────────────┐
│ Quick Actions                   │
│                                 │
│ ┌─────────────┬───────────────┐ │
│ │ [Icon]      │ [Icon]        │ │
│ │ Block User  │ Void Attend   │ │
│ └─────────────┴───────────────┘ │
│                                 │
│ ┌─────────────┬───────────────┐ │
│ │ [Icon]      │ [Icon]        │ │
│ │ Send Warn   │ Escalate      │ │
│ └─────────────┴───────────────┘ │
│                                 │
│ [View All Actions]              │
└─────────────────────────────────┘
```

**Mobile Actions Features:**
- Grid layout 2 columns untuk actions
- Large touch targets
- Icon + label untuk clarity
- Bottom sheet untuk additional actions
- Confirmation dialogs untuk critical actions

### Mobile Forensics View
```
┌─────────────────────────────────┐
│ Device Info                     │
│ ┌─────────────────────────────┐ │
│ │ 📱 iPhone 13 Pro            │ │
│ │ iOS 17.2.1                  │ │
│ │ [View Details →]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ Network Info                    │
│ ┌─────────────────────────────┐ │
│ │ 🌐 192.168.1.100            │ │
│ │ Bandung, Indonesia          │ │
│ │ [View Details →]            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Mobile Forensics Features:**
- Collapsible sections dengan summary
- Tap to expand full details
- Horizontal scroll untuk wide tables
- Pinch-to-zoom untuk maps/charts
- Copy-to-clipboard untuk technical data

### Mobile Responsive Breakpoints
```css
/* Mobile First Approach */
.container {
    /* Base: Mobile (< 640px) */
    padding: 1rem;
    
    /* Tablet (≥ 640px) */
    @media (min-width: 640px) {
        padding: 1.5rem;
    }
    
    /* Desktop (≥ 1024px) */
    @media (min-width: 1024px) {
        padding: 2rem;
    }
}

/* Grid Responsive */
.grid {
    grid-template-columns: 1fr;           /* Mobile: 1 column */
    
    @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);  /* Tablet: 2 columns */
    }
    
    @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);  /* Desktop: 3 columns */
    }
}
```

### Mobile Gestures Support
- **Swipe Left/Right**: Switch between tabs
- **Pull Down**: Refresh data
- **Long Press**: Show context menu
- **Pinch**: Zoom charts/maps
- **Double Tap**: Quick action (e.g., expand/collapse)

### Mobile Performance Optimization
```typescript
// Lazy load heavy components
const ForensicsTab = lazy(() => import('./ForensicsTab'));
const TimelineChart = lazy(() => import('./TimelineChart'));

// Virtual scrolling untuk long lists
<VirtualList
    items={relatedEvents}
    itemHeight={80}
    renderItem={(event) => <EventCard event={event} />}
/>

// Image optimization
<img
    src={deviceIcon}
    loading="lazy"
    srcSet={`${deviceIcon} 1x, ${deviceIcon2x} 2x`}
    alt="Device"
/>
```


## 🎨 DESIGN SYSTEM IMPLEMENTATION

### Color Palette (Match Dashboard Admin)
```typescript
const securityColors = {
    // Severity Levels
    critical: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
    },
    high: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'text-orange-600 dark:text-orange-400',
    },
    medium: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        icon: 'text-amber-600 dark:text-amber-400',
    },
    low: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
    },
    safe: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
    },
};

// Event Type Colors
const eventColors = {
    token_expired: 'amber',
    token_duplicate: 'red',
    geofence_violation: 'rose',
    login_failed: 'orange',
    login_success: 'emerald',
    suspicious_activity: 'purple',
    attendance_success: 'green',
    selfie_uploaded: 'blue',
};
```

### Typography
```css
/* Headers */
.header-title {
    @apply text-3xl font-bold text-neutral-900 dark:text-white;
}

.section-title {
    @apply text-xl font-bold text-neutral-900 dark:text-white;
}

.card-title {
    @apply text-lg font-semibold text-neutral-800 dark:text-neutral-100;
}

/* Body Text */
.body-text {
    @apply text-sm text-neutral-600 dark:text-neutral-300;
}

.body-text-small {
    @apply text-xs text-neutral-500 dark:text-neutral-400;
}

/* Monospace (Technical Data) */
.mono-text {
    @apply font-mono text-sm text-neutral-700 dark:text-neutral-200;
}
```

### Spacing System
```typescript
const spacing = {
    section: 'space-y-6',      // Between major sections
    card: 'space-y-4',         // Inside cards
    element: 'space-y-2',      // Between elements
    inline: 'gap-2',           // Inline elements
    grid: 'gap-6',             // Grid gaps
};
```

### Border Radius
```css
.rounded-card {
    @apply rounded-3xl;        /* Main cards */
}

.rounded-element {
    @apply rounded-2xl;        /* Nested elements */
}

.rounded-button {
    @apply rounded-xl;         /* Buttons */
}

.rounded-badge {
    @apply rounded-lg;         /* Badges */
}
```

### Shadows
```css
.shadow-card {
    @apply shadow-xl shadow-neutral-200/50 dark:shadow-black/20;
}

.shadow-card-hover {
    @apply hover:shadow-2xl hover:shadow-indigo-500/10;
}

.shadow-button {
    @apply shadow-lg shadow-indigo-500/30;
}
```

### Glassmorphism Effect
```css
.glass-card {
    @apply bg-white/40 dark:bg-neutral-900/40 
           backdrop-blur-xl 
           border border-white/20 dark:border-white/5;
}

.glass-button {
    @apply bg-white/10 
           backdrop-blur-md 
           border border-white/20;
}
```


## 🎭 ANIMATIONS & INTERACTIONS

### Framer Motion Variants
```typescript
// Container Animation
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

// Item Animation
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
};

// Card Hover Animation
const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        scale: 1.02,
        y: -5,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
};

// Tab Switch Animation
const tabContentVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3 },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2 },
    },
};
```

### Micro-interactions
```typescript
// Button Click Feedback
<motion.button
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.05 }}
    className="..."
>
    Execute Action
</motion.button>

// Card Hover Effect
<motion.div
    whileHover="hover"
    onHoverStart={() => setHoveredCard('security')}
    onHoverEnd={() => setHoveredCard(null)}
    variants={cardVariants}
>
    {/* Card content */}
</motion.div>

// Icon Rotation on Hover
<motion.div
    whileHover={{ rotate: 10, scale: 1.1 }}
    transition={{ type: 'spring', stiffness: 300 }}
>
    <ShieldIcon />
</motion.div>
```

### Loading States
```typescript
// Skeleton Loading
const SkeletonCard = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
        <div className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
    </div>
);

// Spinner Loading
const LoadingSpinner = () => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
    />
);
```

### Transition Effects
```typescript
// Page Transition
<AnimatePresence mode="wait">
    {activeTab === 'overview' && (
        <motion.div
            key="overview"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabContentVariants}
        >
            {/* Tab content */}
        </motion.div>
    )}
</AnimatePresence>

// Stagger Children
<motion.div variants={containerVariants} initial="hidden" animate="visible">
    {items.map((item, index) => (
        <motion.div key={index} variants={itemVariants}>
            {item}
        </motion.div>
    ))}
</motion.div>
```


## 💻 IMPLEMENTATION EXAMPLE

### Main Component Structure
```typescript
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    ArrowLeft, Shield, Clock, User, MapPin, Activity,
    AlertCircle, CheckCircle, XCircle, Download, Share2,
    AlertTriangle, ShieldCheck, Eye, Terminal, Layers,
    FileText, Globe, Smartphone, Cpu, Database, TrendingUp,
    BarChart3, Zap, Flag, Lock, Unlock, Mail, Bell
} from 'lucide-react';

interface AuditLog {
    id: number;
    event_type: string;
    message: string;
    created_at: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    security_score: number;
    threat_level: 'critical' | 'high' | 'medium' | 'low';
    mahasiswa?: {
        id: number;
        nama: string;
        nim: string;
        email: string;
        kelas: string;
    };
    session?: {
        id: number;
        meeting_number: number;
        course: {
            nama: string;
            kode: string;
            dosen: { nama: string };
        };
    };
    device_info?: {
        device_id: string;
        device_name: string;
        os: string;
        browser: string;
        screen_resolution: string;
        timezone: string;
        language: string;
    };
    network_info?: {
        ip_address: string;
        location: string;
        isp: string;
        connection_type: string;
    };
    metadata?: any;
}

interface RelatedEvent {
    id: number;
    event_type: string;
    message: string;
    created_at: string;
    severity: string;
}

interface ActionLog {
    id: number;
    action_type: string;
    description: string;
    actor: string;
    created_at: string;
}

interface PageProps {
    auditLog: AuditLog;
    relatedEvents: RelatedEvent[];
    actionHistory: ActionLog[];
    riskAssessment: {
        likelihood: number;
        impact: number;
        overall_risk: number;
        risk_factors: Array<{ factor: string; severity: string }>;
    };
    patternAnalysis: {
        pattern_match: number;
        pattern_id: string;
        similar_incidents: number;
    };
}

export default function AuditDetail({
    auditLog,
    relatedEvents,
    actionHistory,
    riskAssessment,
    patternAnalysis,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<
        'overview' | 'timeline' | 'forensics' | 'impact' | 'actions' | 'related'
    >('overview');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Event type configuration
    const eventTypeConfig = {
        token_expired: {
            label: 'Token Expired',
            color: 'amber',
            icon: Clock,
        },
        token_duplicate: {
            label: 'Token Duplikat',
            color: 'red',
            icon: AlertTriangle,
        },
        geofence_violation: {
            label: 'Pelanggaran Zona',
            color: 'rose',
            icon: MapPin,
        },
        login_failed: {
            label: 'Login Gagal',
            color: 'orange',
            icon: XCircle,
        },
        login_success: {
            label: 'Login Berhasil',
            color: 'emerald',
            icon: CheckCircle,
        },
        suspicious_activity: {
            label: 'Aktivitas Mencurigakan',
            color: 'purple',
            icon: AlertCircle,
        },
    };

    const config = eventTypeConfig[auditLog.event_type] || {
        label: auditLog.event_type,
        color: 'slate',
        icon: Activity,
    };

    const Icon = config.icon;

    // Severity colors
    const severityColors = {
        critical: 'red',
        high: 'orange',
        medium: 'amber',
        low: 'blue',
    };

    // Handle actions
    const handleExport = () => {
        window.open(`/admin/audit/${auditLog.id}/export`, '_blank');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        // Show toast notification
    };

    const handleAction = (actionType: string) => {
        if (confirm(`Are you sure you want to ${actionType}?`)) {
            router.post(`/admin/audit/${auditLog.id}/action`, {
                action_type: actionType,
            });
        }
    };

    return (
        <AppLayout>
            <Head title={`Audit Log #${auditLog.id}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen"
            >
                {/* Header */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        {/* Back Button */}
                        <Link
                            href="/admin/audit"
                            className="absolute -top-2 sm:-top-4 -left-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors backdrop-blur-md"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 pt-8">
                            {/* Title Section */}
                            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                                {/* Icon - NO CONTAINER */}
                                <Icon className="h-16 w-16 sm:h-20 sm:w-20 text-white flex-shrink-0" />
                                
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm">
                                            {config.label}
                                        </span>
                                        <span className="text-xs text-indigo-100 font-mono">
                                            #{auditLog.id}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                        {auditLog.mahasiswa?.nama || 'System Event'}
                                    </h1>
                                    <p className="mt-1 text-indigo-100 flex flex-wrap items-center gap-2 text-sm">
                                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded">
                                            {auditLog.mahasiswa?.nim || 'SYSTEM'}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/50" />
                                        <span className="opacity-90">
                                            {auditLog.created_at}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Actions - Desktop */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="hidden sm:flex gap-2"
                            >
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-black/20"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Export</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-black/20"
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span>Share</span>
                                </button>
                            </motion.div>
                        </div>

                        {/* Security Badges */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold">
                                Score: {auditLog.security_score}/100
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold uppercase">
                                {auditLog.threat_level}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Mobile Actions */}
                <div className="sm:hidden flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold"
                    >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                    </button>
                </div>

                {/* Tabs Navigation */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-x-auto scrollbar-hide"
                >
                    <div className="flex p-1 gap-1 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-md w-fit border border-white/10 min-w-full sm:min-w-0">
                        {[
                            { id: 'overview', label: 'Overview', icon: Eye },
                            { id: 'timeline', label: 'Timeline', icon: Clock },
                            { id: 'forensics', label: 'Forensics', icon: Terminal },
                            { id: 'impact', label: 'Impact', icon: TrendingUp },
                            { id: 'actions', label: 'Actions', icon: Zap },
                            { id: 'related', label: 'Related', icon: Layers },
                        ].map((tab) => (
                            <motion.button
                                key={tab.id}
                                layout
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'text-indigo-700 dark:text-indigo-300 shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                                }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                                        transition={{
                                            type: 'spring',
                                            bounce: 0.2,
                                            duration: 0.6,
                                        }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <tab.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            auditLog={auditLog}
                            hoveredCard={hoveredCard}
                            setHoveredCard={setHoveredCard}
                        />
                    )}
                    {activeTab === 'timeline' && (
                        <TimelineTab auditLog={auditLog} />
                    )}
                    {activeTab === 'forensics' && (
                        <ForensicsTab auditLog={auditLog} />
                    )}
                    {activeTab === 'impact' && (
                        <ImpactTab
                            auditLog={auditLog}
                            riskAssessment={riskAssessment}
                        />
                    )}
                    {activeTab === 'actions' && (
                        <ActionsTab
                            auditLog={auditLog}
                            actionHistory={actionHistory}
                            onAction={handleAction}
                        />
                    )}
                    {activeTab === 'related' && (
                        <RelatedTab
                            auditLog={auditLog}
                            relatedEvents={relatedEvents}
                            patternAnalysis={patternAnalysis}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </AppLayout>
    );
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
};
```


## 📋 BACKEND REQUIREMENTS

### Controller Method
```php
// app/Http/Controllers/Admin/AuditController.php

public function show($id)
{
    $auditLog = AuditLog::with([
        'mahasiswa',
        'session.course.dosen',
    ])->findOrFail($id);

    // Get related events (same user, last 7 days)
    $relatedEvents = AuditLog::where('mahasiswa_id', $auditLog->mahasiswa_id)
        ->where('id', '!=', $auditLog->id)
        ->where('created_at', '>=', now()->subDays(7))
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();

    // Get action history
    $actionHistory = AuditAction::where('audit_log_id', $auditLog->id)
        ->with('actor')
        ->orderBy('created_at', 'desc')
        ->get();

    // Calculate risk assessment
    $riskAssessment = $this->calculateRiskAssessment($auditLog);

    // Pattern analysis
    $patternAnalysis = $this->analyzePattern($auditLog);

    return Inertia::render('admin/audit-detail', [
        'auditLog' => $auditLog,
        'relatedEvents' => $relatedEvents,
        'actionHistory' => $actionHistory,
        'riskAssessment' => $riskAssessment,
        'patternAnalysis' => $patternAnalysis,
    ]);
}

private function calculateRiskAssessment($auditLog)
{
    // Calculate likelihood based on historical data
    $historicalViolations = AuditLog::where('mahasiswa_id', $auditLog->mahasiswa_id)
        ->where('severity', 'high')
        ->count();
    
    $likelihood = min(100, ($historicalViolations * 20) + 40);

    // Calculate impact based on event type
    $impactScores = [
        'token_duplicate' => 80,
        'geofence_violation' => 60,
        'suspicious_activity' => 70,
        'login_failed' => 40,
    ];
    
    $impact = $impactScores[$auditLog->event_type] ?? 50;

    // Overall risk
    $overallRisk = ($likelihood + $impact) / 2;

    // Risk factors
    $riskFactors = [];
    
    if ($historicalViolations > 0) {
        $riskFactors[] = [
            'factor' => 'Previous violations detected',
            'severity' => 'high',
        ];
    }

    if ($auditLog->event_type === 'token_duplicate') {
        $riskFactors[] = [
            'factor' => 'Token reuse detected',
            'severity' => 'critical',
        ];
    }

    return [
        'likelihood' => $likelihood,
        'impact' => $impact,
        'overall_risk' => $overallRisk,
        'risk_factors' => $riskFactors,
    ];
}

private function analyzePattern($auditLog)
{
    // Find similar events
    $similarIncidents = AuditLog::where('event_type', $auditLog->event_type)
        ->where('created_at', '>=', now()->subDays(30))
        ->count();

    // Pattern matching logic
    $patternMatch = 0;
    $patternId = null;

    if ($auditLog->event_type === 'token_duplicate') {
        $patternMatch = 85;
        $patternId = 'PTN-2024-0042';
    }

    return [
        'pattern_match' => $patternMatch,
        'pattern_id' => $patternId,
        'similar_incidents' => $similarIncidents,
    ];
}

public function executeAction(Request $request, $id)
{
    $validated = $request->validate([
        'action_type' => 'required|string',
        'description' => 'nullable|string',
        'notify' => 'nullable|array',
    ]);

    $auditLog = AuditLog::findOrFail($id);

    // Execute action based on type
    switch ($validated['action_type']) {
        case 'block_user':
            $this->blockUser($auditLog->mahasiswa_id);
            break;
        case 'void_attendance':
            $this->voidAttendance($auditLog->session_id, $auditLog->mahasiswa_id);
            break;
        case 'flag_device':
            $this->flagDevice($auditLog->device_info['device_id']);
            break;
        case 'send_warning':
            $this->sendWarning($auditLog->mahasiswa_id);
            break;
        case 'escalate':
            $this->escalateIncident($auditLog->id);
            break;
        case 'resolve':
            $this->resolveIncident($auditLog->id);
            break;
    }

    // Log action
    AuditAction::create([
        'audit_log_id' => $auditLog->id,
        'action_type' => $validated['action_type'],
        'description' => $validated['description'],
        'actor_id' => auth()->id(),
    ]);

    // Send notifications if requested
    if (isset($validated['notify'])) {
        $this->sendNotifications($auditLog, $validated['notify']);
    }

    return redirect()->back()->with('success', 'Action executed successfully');
}
```

### Database Schema
```php
// Migration for audit_actions table
Schema::create('audit_actions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('audit_log_id')->constrained()->onDelete('cascade');
    $table->string('action_type');
    $table->text('description')->nullable();
    $table->foreignId('actor_id')->constrained('users');
    $table->timestamps();
});

// Add columns to audit_logs table
Schema::table('audit_logs', function (Blueprint $table) {
    $table->string('severity')->default('medium');
    $table->string('status')->default('open');
    $table->integer('security_score')->default(50);
    $table->string('threat_level')->default('medium');
    $table->json('device_info')->nullable();
    $table->json('network_info')->nullable();
});
```


## 🔔 REAL-TIME FEATURES

### WebSocket Integration
```typescript
// Setup Echo listener for real-time updates
useEffect(() => {
    const channel = Echo.channel(`security-audit.${auditLog.id}`);

    channel.listen('SecurityEventUpdated', (event: any) => {
        // Update security score
        setSecurityScore(event.newScore);
        
        // Update threat level
        setThreatLevel(event.newThreatLevel);
        
        // Show notification
        toast.success('Security event updated');
    });

    channel.listen('RelatedEventDetected', (event: any) => {
        // Add new related event
        setRelatedEvents(prev => [event.newEvent, ...prev]);
        
        // Show notification
        toast.info('New related event detected');
    });

    channel.listen('ActionExecuted', (event: any) => {
        // Add to action history
        setActionHistory(prev => [event.action, ...prev]);
        
        // Update status if changed
        if (event.newStatus) {
            setStatus(event.newStatus);
        }
    });

    return () => {
        channel.stopListening('SecurityEventUpdated');
        channel.stopListening('RelatedEventDetected');
        channel.stopListening('ActionExecuted');
    };
}, [auditLog.id]);
```

### Backend Broadcasting
```php
// app/Events/SecurityEventUpdated.php
class SecurityEventUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $auditLogId;
    public $newScore;
    public $newThreatLevel;

    public function __construct($auditLogId, $newScore, $newThreatLevel)
    {
        $this->auditLogId = $auditLogId;
        $this->newScore = $newScore;
        $this->newThreatLevel = $newThreatLevel;
    }

    public function broadcastOn()
    {
        return new Channel('security-audit.' . $this->auditLogId);
    }

    public function broadcastAs()
    {
        return 'SecurityEventUpdated';
    }
}

// Trigger event when audit log is updated
event(new SecurityEventUpdated($auditLog->id, $newScore, $newThreatLevel));
```


## ✅ CHECKLIST IMPLEMENTASI

### Design & UI
- [ ] Header dengan gradient background (indigo → purple → pink)
- [ ] Icon header TANPA container wrapper
- [ ] HAPUS animasi floating/bouncing pada icon
- [ ] Warna icon match dengan warna container card
- [ ] Back button style konsisten dengan menu lain
- [ ] Security score badge dengan color coding
- [ ] Threat level indicator dengan visual yang jelas
- [ ] Responsive layout untuk mobile (stack vertical)
- [ ] Touch-friendly button sizes (min 44x44px)
- [ ] Glassmorphism effect pada cards

### Tabs Implementation
- [ ] 6 tabs: Overview, Timeline, Forensics, Impact, Actions, Related
- [ ] Horizontal scrollable tabs di mobile
- [ ] Active tab indicator dengan smooth animation
- [ ] Swipe gesture untuk switch tabs (mobile)
- [ ] Tab content dengan AnimatePresence
- [ ] Lazy loading untuk heavy components

### Overview Tab
- [ ] Security summary dashboard (3 cards)
- [ ] Event details card dengan syntax highlighting
- [ ] User & context information
- [ ] Quick stats grid (4 cards)
- [ ] All cards dengan hover effects
- [ ] Mobile: stack vertical dengan proper spacing

### Timeline Tab
- [ ] Interactive event timeline dengan visual connector
- [ ] Expandable event details
- [ ] Color-coded events berdasarkan severity
- [ ] Time gap indicators
- [ ] Filter by event type, severity, time range
- [ ] Export timeline as PDF/PNG
- [ ] Mobile: vertical timeline dengan compact design

### Forensics Tab
- [ ] Device fingerprint analysis
- [ ] Network analysis dengan geolocation
- [ ] Request headers & metadata (JSON viewer)
- [ ] Behavioral analysis
- [ ] Device trust score visualization
- [ ] Mobile: collapsible sections dengan summary

### Impact Tab
- [ ] Affected systems dashboard
- [ ] Risk assessment matrix dengan progress bars
- [ ] Affected resources list
- [ ] Compliance impact section
- [ ] Financial impact (if applicable)
- [ ] Mobile: full-width cards dengan proper padding

### Actions Tab
- [ ] Incident response dashboard
- [ ] Quick actions panel (6 action buttons)
- [ ] AI-powered recommendations
- [ ] Action history log dengan timeline
- [ ] Add action/note form
- [ ] Escalation path visualization
- [ ] Mobile: grid 2 columns untuk actions

### Related Tab
- [ ] Pattern detection dashboard
- [ ] Related events list dengan filter & search
- [ ] Correlation graph (interactive)
- [ ] User behavior profile
- [ ] Similar incidents across system
- [ ] Mobile: optimized list view

### Animations
- [ ] Container stagger animation
- [ ] Item fade-in animation
- [ ] Card hover effects
- [ ] Tab switch animation
- [ ] Loading states (skeleton & spinner)
- [ ] Micro-interactions pada buttons
- [ ] Smooth transitions

### Real-Time Features
- [ ] WebSocket connection untuk live updates
- [ ] Real-time security score updates
- [ ] Live threat level changes
- [ ] Instant notification untuk related events
- [ ] Live action log updates
- [ ] Real-time correlation detection

### Mobile Optimization
- [ ] Responsive header dengan compact layout
- [ ] Horizontal scrollable tabs
- [ ] Stack vertical cards di mobile
- [ ] Touch-friendly interactive elements
- [ ] Collapsible sections untuk long content
- [ ] Bottom sheet untuk additional actions
- [ ] Pull-to-refresh functionality
- [ ] Optimized font sizes untuk readability

### Performance
- [ ] Lazy loading untuk heavy components
- [ ] Virtual scrolling untuk long lists
- [ ] Image optimization dengan lazy loading
- [ ] Memoization untuk expensive calculations
- [ ] Debounce untuk search inputs
- [ ] Code splitting untuk tabs

### Backend Integration
- [ ] Controller method untuk show audit detail
- [ ] Risk assessment calculation
- [ ] Pattern analysis logic
- [ ] Execute action endpoint
- [ ] Export functionality
- [ ] Real-time broadcasting setup
- [ ] Database migrations

### Testing
- [ ] Test responsive layout di berbagai devices
- [ ] Test all tab switches
- [ ] Test all action buttons
- [ ] Test real-time updates
- [ ] Test export functionality
- [ ] Test mobile gestures
- [ ] Test loading states
- [ ] Test error handling


## 🎯 KESIMPULAN

Halaman Detail Audit Keamanan ini dirancang dengan fokus pada:

1. **Security-First Approach**: Comprehensive security monitoring dengan real-time threat detection
2. **Forensic Capabilities**: Deep technical analysis untuk investigation
3. **Actionable Intelligence**: AI-powered recommendations dan automated response
4. **Mobile Excellence**: Sangat responsif dengan UX yang optimal di mobile
5. **Design Consistency**: 100% match dengan dashboard admin design system
6. **Innovation**: Fitur-fitur inovatif seperti pattern detection, risk scoring, dan collaborative investigation

### Key Differentiators
- Real-time security monitoring dengan WebSocket
- AI-powered threat analysis dan recommendations
- Interactive forensic visualization
- Automated response workflows
- Predictive risk scoring
- Collaborative investigation tools
- Comprehensive audit trail dengan blockchain-inspired immutability

### Mobile-First Considerations
- Touch-friendly interface dengan proper sizing
- Optimized layout untuk small screens
- Gesture support untuk better UX
- Performance optimization untuk mobile networks
- Offline capability untuk critical features

### Next Steps
1. Implement backend API endpoints
2. Setup WebSocket broadcasting
3. Create frontend components dengan TypeScript
4. Implement real-time features
5. Add comprehensive testing
6. Optimize performance
7. Deploy dan monitor

---

**PENTING**: Pastikan semua fitur diimplementasikan dengan kualitas tinggi, testing menyeluruh, dan perhatian detail pada mobile responsiveness. Halaman ini adalah critical security feature yang harus reliable dan performant.


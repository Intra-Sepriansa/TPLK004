# Requirements Document: Mobile Student Dashboard

## Introduction

The Mobile Student Dashboard is a Flutter-based mobile application designed for university students (mahasiswa) to manage their attendance, view their academic profile, and interact with the university's attendance system. The application provides secure authentication, real-time attendance tracking via QR codes and selfies, comprehensive attendance history, and a user-friendly dashboard interface. The system integrates with a Laravel backend API and supports both online and offline modes with local caching.

## Glossary

- **Student**: A university student (mahasiswa) who uses the mobile application
- **NIM**: Nomor Induk Mahasiswa (Student Identification Number)
- **Prodi**: Program Studi (Study Program/Major)
- **Mata_Kuliah**: Course or subject
- **Absen**: Attendance record
- **Check_In**: The time when a student marks attendance arrival
- **Check_Out**: The time when a student marks attendance departure
- **Auth_Token**: Bearer token used for authenticated API requests
- **Mobile_App**: The Flutter mobile application
- **Backend_API**: The Laravel API server at `/api/mobile/mahasiswa/`
- **QR_Scanner**: Component for scanning QR codes for attendance
- **Selfie_Camera**: Component for capturing selfie photos for attendance
- **Dashboard**: The home screen showing student information and attendance status
- **Attendance_Record**: A single attendance entry with date, course, status, and times
- **Session**: A class session for which attendance is recorded
- **Secure_Storage**: flutter_secure_storage for storing sensitive data
- **Local_Cache**: Locally stored data for offline access

## Requirements

### Requirement 1: Student Authentication

**User Story:** As a student, I want to securely log in to the application using my NIM and password, so that I can access my attendance data and profile information.

#### Acceptance Criteria

1. WHEN a student enters valid NIM and password THEN THE Mobile_App SHALL authenticate with the Backend_API and receive an Auth_Token
2. WHEN authentication succeeds THEN THE Mobile_App SHALL store the Auth_Token in Secure_Storage
3. WHEN a student enters invalid credentials THEN THE Mobile_App SHALL display a clear error message and prevent login
4. WHEN the NIM field is empty THEN THE Mobile_App SHALL display a validation error message
5. WHEN the password field is empty THEN THE Mobile_App SHALL display a validation error message
6. WHEN the login request fails due to network error THEN THE Mobile_App SHALL display a network error message with retry option
7. WHEN the Auth_Token expires THEN THE Mobile_App SHALL automatically log out the student and redirect to login screen
8. WHERE biometric authentication is enabled, WHEN a student has previously logged in THEN THE Mobile_App SHALL offer biometric authentication as an alternative login method
9. WHEN biometric authentication succeeds THEN THE Mobile_App SHALL retrieve the stored Auth_Token from Secure_Storage and authenticate the student
10. WHEN the student logs out THEN THE Mobile_App SHALL remove the Auth_Token from Secure_Storage

### Requirement 2: Token Management and Security

**User Story:** As a student, I want my authentication session to be secure and automatically refreshed, so that I don't have to log in repeatedly while maintaining security.

#### Acceptance Criteria

1. WHEN the Mobile_App makes an authenticated API request THEN THE Mobile_App SHALL include the Auth_Token in the Authorization header as "Bearer {token}"
2. WHEN the Backend_API returns a 401 Unauthorized response THEN THE Mobile_App SHALL attempt to refresh the Auth_Token
3. IF token refresh succeeds THEN THE Mobile_App SHALL retry the original request with the new Auth_Token
4. IF token refresh fails THEN THE Mobile_App SHALL log out the student and redirect to login screen
5. WHEN storing the Auth_Token THEN THE Mobile_App SHALL use Secure_Storage to prevent unauthorized access
6. WHEN the application starts THEN THE Mobile_App SHALL check for a valid Auth_Token in Secure_Storage
7. IF a valid Auth_Token exists THEN THE Mobile_App SHALL navigate directly to the Dashboard
8. IF no valid Auth_Token exists THEN THE Mobile_App SHALL navigate to the login screen

### Requirement 3: Dashboard Display

**User Story:** As a student, I want to see a comprehensive dashboard with my profile information and today's attendance status, so that I can quickly understand my current attendance situation.

#### Acceptance Criteria

1. WHEN the Dashboard loads THEN THE Mobile_App SHALL display a welcome header with the student's name
2. WHEN the Dashboard loads THEN THE Mobile_App SHALL display a profile card showing avatar, NIM, Prodi, and semester
3. WHEN the Dashboard loads THEN THE Mobile_App SHALL fetch and display today's attendance status from the Backend_API
4. WHEN today's attendance exists THEN THE Mobile_App SHALL display "Sudah Absen" with Check_In and Check_Out times
5. WHEN today's attendance does not exist THEN THE Mobile_App SHALL display "Belum Absen"
6. WHEN the Dashboard loads THEN THE Mobile_App SHALL display the last 3 Attendance_Records from history
7. WHEN displaying recent attendance THEN THE Mobile_App SHALL show date, Mata_Kuliah name, and attendance status for each record
8. WHEN the Dashboard loads THEN THE Mobile_App SHALL display quick action buttons for "Scan QR" and "Ambil Selfie"
9. WHEN the student pulls down on the Dashboard THEN THE Mobile_App SHALL refresh all dashboard data from the Backend_API
10. WHILE dashboard data is loading THEN THE Mobile_App SHALL display shimmer loading states
11. IF dashboard data loading fails THEN THE Mobile_App SHALL display an error state with retry button

### Requirement 4: API Integration

**User Story:** As a student, I want the application to communicate reliably with the backend server, so that my data is always up-to-date and accurate.

#### Acceptance Criteria

1. WHEN making API requests THEN THE Mobile_App SHALL use the base path `/api/mobile/mahasiswa/`
2. WHEN authenticating THEN THE Mobile_App SHALL POST to `/api/mobile/mahasiswa/login` with NIM and password
3. WHEN fetching profile data THEN THE Mobile_App SHALL GET from `/api/mobile/mahasiswa/profile` with Auth_Token
4. WHEN fetching today's attendance THEN THE Mobile_App SHALL GET from `/api/mobile/mahasiswa/attendance/today` with Auth_Token
5. WHEN fetching attendance history THEN THE Mobile_App SHALL GET from `/api/mobile/mahasiswa/attendance/history?page={page}` with Auth_Token
6. WHEN an API request fails with network error THEN THE Mobile_App SHALL display appropriate error message
7. WHEN an API request fails with server error (5xx) THEN THE Mobile_App SHALL display server error message with retry option
8. WHEN an API request fails with client error (4xx) THEN THE Mobile_App SHALL display appropriate error message based on error code
9. WHEN making API requests THEN THE Mobile_App SHALL use HTTPS for all communications
10. WHEN API response is received THEN THE Mobile_App SHALL validate the response structure before processing

### Requirement 5: Bottom Navigation

**User Story:** As a student, I want to easily navigate between different sections of the app while preserving my place in each section, so that I can efficiently access different features.

#### Acceptance Criteria

1. WHEN the Mobile_App displays the main interface THEN THE Mobile_App SHALL show a bottom navigation bar with 5 tabs
2. THE bottom navigation SHALL include tabs for: Home, Scan QR, Selfie, Riwayat, and Profil
3. WHEN a student taps a navigation tab THEN THE Mobile_App SHALL switch to that screen
4. WHEN switching between tabs THEN THE Mobile_App SHALL preserve the state of each screen using IndexedStack
5. WHEN returning to a previously visited tab THEN THE Mobile_App SHALL restore the scroll position and data state
6. WHEN a tab is active THEN THE Mobile_App SHALL highlight that tab in the navigation bar
7. WHILE on any tab THEN THE Mobile_App SHALL keep the bottom navigation visible

### Requirement 6: Attendance History Screen

**User Story:** As a student, I want to view my complete attendance history with filtering and search capabilities, so that I can track my attendance patterns and find specific records.

#### Acceptance Criteria

1. WHEN the Riwayat screen loads THEN THE Mobile_App SHALL fetch and display paginated Attendance_Records from the Backend_API
2. WHEN displaying attendance records THEN THE Mobile_App SHALL show date, Mata_Kuliah, status, Check_In time, and Check_Out time for each record
3. WHEN the student scrolls to the bottom of the list THEN THE Mobile_App SHALL load the next page of Attendance_Records
4. WHEN the student pulls down on the list THEN THE Mobile_App SHALL refresh the attendance history from the Backend_API
5. WHEN no attendance records exist THEN THE Mobile_App SHALL display an empty state with helpful message
6. WHEN the student applies a date range filter THEN THE Mobile_App SHALL display only Attendance_Records within that date range
7. WHEN the student searches by course name THEN THE Mobile_App SHALL display only Attendance_Records matching the search query
8. WHEN the student clears filters THEN THE Mobile_App SHALL display all Attendance_Records
9. WHILE attendance history is loading THEN THE Mobile_App SHALL display loading indicators
10. IF attendance history loading fails THEN THE Mobile_App SHALL display error state with retry button

### Requirement 7: Profile Screen

**User Story:** As a student, I want to view and manage my complete profile information and app settings, so that I can keep my information current and customize my experience.

#### Acceptance Criteria

1. WHEN the Profil screen loads THEN THE Mobile_App SHALL display the student's avatar, full name, NIM, email, Prodi, and semester
2. WHEN the Profil screen loads THEN THE Mobile_App SHALL fetch the latest profile data from the Backend_API
3. WHEN the student taps the edit profile option THEN THE Mobile_App SHALL navigate to the profile editing screen
4. WHEN the student taps the logout button THEN THE Mobile_App SHALL remove the Auth_Token and navigate to login screen
5. WHEN the Profil screen displays THEN THE Mobile_App SHALL show app settings options
6. WHEN the student changes app settings THEN THE Mobile_App SHALL persist the settings locally
7. WHILE profile data is loading THEN THE Mobile_App SHALL display loading indicators
8. IF profile data loading fails THEN THE Mobile_App SHALL display error state with retry button

### Requirement 8: QR Code Attendance

**User Story:** As a student, I want to mark my attendance by scanning a QR code, so that I can quickly check in to class sessions.

#### Acceptance Criteria

1. WHEN the Scan QR screen opens THEN THE Mobile_App SHALL activate the device camera for QR code scanning
2. WHEN a QR code is detected THEN THE Mobile_App SHALL decode the QR code data
3. WHEN valid attendance QR code is scanned THEN THE Mobile_App SHALL submit the attendance to the Backend_API
4. WHEN attendance submission succeeds THEN THE Mobile_App SHALL display success feedback and update the Dashboard
5. WHEN attendance submission fails THEN THE Mobile_App SHALL display error message with retry option
6. WHEN the student taps the flash toggle THEN THE Mobile_App SHALL turn the camera flash on or off
7. WHEN the student selects an image from gallery THEN THE Mobile_App SHALL attempt to decode QR code from the image
8. WHEN invalid QR code is scanned THEN THE Mobile_App SHALL display error message
9. WHEN the camera fails to initialize THEN THE Mobile_App SHALL display error message with camera permission instructions
10. WHEN the student navigates away from QR scanner THEN THE Mobile_App SHALL release the camera resources

### Requirement 9: Selfie Attendance

**User Story:** As a student, I want to mark my attendance by taking a selfie, so that I can verify my presence with facial recognition.

#### Acceptance Criteria

1. WHEN the Selfie screen opens THEN THE Mobile_App SHALL activate the front-facing camera
2. WHEN the student taps the camera flip button THEN THE Mobile_App SHALL switch between front and back cameras
3. WHEN the student taps the capture button THEN THE Mobile_App SHALL capture a photo
4. WHEN a photo is captured THEN THE Mobile_App SHALL display a preview of the captured image
5. WHEN the student confirms the preview THEN THE Mobile_App SHALL submit the selfie to the Backend_API for attendance
6. WHEN attendance submission succeeds THEN THE Mobile_App SHALL display success feedback and update the Dashboard
7. WHEN attendance submission fails THEN THE Mobile_App SHALL display error message with retry option
8. WHEN the student retakes the photo THEN THE Mobile_App SHALL return to camera view
9. WHEN the camera fails to initialize THEN THE Mobile_App SHALL display error message with camera permission instructions
10. WHEN the student navigates away from selfie camera THEN THE Mobile_App SHALL release the camera resources

### Requirement 10: Error Handling and User Experience

**User Story:** As a student, I want clear feedback about loading states, errors, and empty states, so that I always understand what the application is doing and what actions I can take.

#### Acceptance Criteria

1. WHILE any data is loading THEN THE Mobile_App SHALL display shimmer or skeleton loading states
2. WHEN any operation fails THEN THE Mobile_App SHALL display an error message with a retry button
3. WHEN a list or screen has no data THEN THE Mobile_App SHALL display an empty state with helpful message
4. WHEN a network error occurs THEN THE Mobile_App SHALL display a network error message
5. WHEN the device is offline THEN THE Mobile_App SHALL detect offline mode and display appropriate message
6. WHEN an operation succeeds THEN THE Mobile_App SHALL display a toast notification with success message
7. WHEN an operation fails THEN THE Mobile_App SHALL display a toast notification with error message
8. WHEN form validation fails THEN THE Mobile_App SHALL display clear error messages next to invalid fields
9. WHEN the student submits a form with invalid data THEN THE Mobile_App SHALL prevent submission and highlight errors
10. WHEN the student corrects form errors THEN THE Mobile_App SHALL clear error messages for corrected fields

### Requirement 11: Local Caching and Offline Support

**User Story:** As a student, I want to access my profile and attendance data even when offline, so that I can view my information without an internet connection.

#### Acceptance Criteria

1. WHEN profile data is fetched from the Backend_API THEN THE Mobile_App SHALL cache the data in Local_Cache
2. WHEN the device is offline THEN THE Mobile_App SHALL load profile data from Local_Cache
3. WHEN attendance history is fetched THEN THE Mobile_App SHALL cache the data in Local_Cache
4. WHEN the device is offline THEN THE Mobile_App SHALL load attendance history from Local_Cache
5. WHEN displaying cached data THEN THE Mobile_App SHALL indicate that the data may not be current
6. WHEN the device comes back online THEN THE Mobile_App SHALL automatically refresh cached data
7. WHEN cached data is older than 24 hours THEN THE Mobile_App SHALL prioritize fetching fresh data
8. WHEN the student performs an action requiring network THEN THE Mobile_App SHALL display offline mode message if offline
9. WHEN Local_Cache exceeds size limit THEN THE Mobile_App SHALL remove oldest cached data
10. WHEN the student logs out THEN THE Mobile_App SHALL clear all cached data

### Requirement 12: Push Notifications

**User Story:** As a student, I want to receive push notifications for attendance reminders, so that I don't forget to mark my attendance.

#### Acceptance Criteria

1. WHEN the Mobile_App is installed THEN THE Mobile_App SHALL request push notification permissions
2. WHEN push notification permission is granted THEN THE Mobile_App SHALL register the device token with the Backend_API
3. WHEN a push notification is received THEN THE Mobile_App SHALL display the notification in the system tray
4. WHEN the student taps a notification THEN THE Mobile_App SHALL navigate to the relevant screen
5. WHEN the student disables notifications in settings THEN THE Mobile_App SHALL stop displaying push notifications
6. WHEN the student enables notifications in settings THEN THE Mobile_App SHALL resume displaying push notifications
7. WHEN the Mobile_App is in foreground and notification arrives THEN THE Mobile_App SHALL display an in-app notification
8. WHEN the Mobile_App is in background and notification arrives THEN THE Mobile_App SHALL display a system notification

### Requirement 13: Theme and Localization

**User Story:** As a student, I want to customize the app appearance with dark mode and choose my preferred language, so that I can use the app comfortably in different environments.

#### Acceptance Criteria

1. WHEN the student enables dark mode THEN THE Mobile_App SHALL apply dark theme to all screens
2. WHEN the student disables dark mode THEN THE Mobile_App SHALL apply light theme to all screens
3. WHEN the Mobile_App starts THEN THE Mobile_App SHALL load the saved theme preference
4. WHEN the student changes language to Indonesian THEN THE Mobile_App SHALL display all text in Indonesian
5. WHEN the student changes language to English THEN THE Mobile_App SHALL display all text in English
6. WHEN the Mobile_App starts THEN THE Mobile_App SHALL load the saved language preference
7. WHEN system theme changes THEN THE Mobile_App SHALL follow system theme if auto-theme is enabled
8. WHEN displaying dates and times THEN THE Mobile_App SHALL format them according to the selected language locale

### Requirement 14: Analytics and Monitoring

**User Story:** As a system administrator, I want to track app usage and monitor crashes, so that I can improve the app quality and user experience.

#### Acceptance Criteria

1. WHEN the student performs key actions THEN THE Mobile_App SHALL log analytics events
2. WHEN the Mobile_App crashes THEN THE Mobile_App SHALL send crash reports to the monitoring service
3. WHEN the Mobile_App experiences performance issues THEN THE Mobile_App SHALL log performance metrics
4. WHEN analytics data is collected THEN THE Mobile_App SHALL not include personally identifiable information
5. WHEN the student opts out of analytics THEN THE Mobile_App SHALL stop collecting analytics data
6. WHEN network requests fail THEN THE Mobile_App SHALL log error details for debugging
7. WHEN the Mobile_App starts THEN THE Mobile_App SHALL log app version and device information

### Requirement 15: Application Architecture

**User Story:** As a developer, I want the application to follow clean architecture principles, so that the codebase is maintainable, testable, and scalable.

#### Acceptance Criteria

1. THE Mobile_App SHALL organize code using feature-based folder structure
2. THE Mobile_App SHALL separate UI layer, business logic layer, and data layer
3. THE Mobile_App SHALL use dependency injection for managing dependencies
4. THE Mobile_App SHALL implement repository pattern for data access
5. THE Mobile_App SHALL implement use cases for business logic operations
6. THE Mobile_App SHALL use DTOs and models for data transfer between layers
7. THE Mobile_App SHALL use state management solution (Provider, Riverpod, or Bloc) for UI state
8. THE Mobile_App SHALL ensure UI components depend on abstractions, not concrete implementations
9. THE Mobile_App SHALL implement error handling at appropriate layers
10. THE Mobile_App SHALL use dependency inversion to make layers independent

### Requirement 16: Code Quality and Testing

**User Story:** As a developer, I want comprehensive test coverage and code quality standards, so that the application is reliable and maintainable.

#### Acceptance Criteria

1. THE Mobile_App SHALL enable null safety for all Dart code
2. THE Mobile_App SHALL implement proper error handling with try-catch blocks
3. THE Mobile_App SHALL include unit tests for all business logic use cases
4. THE Mobile_App SHALL include widget tests for all UI components
5. THE Mobile_App SHALL include integration tests for critical user flows
6. THE Mobile_App SHALL include code documentation for public APIs
7. THE Mobile_App SHALL enforce consistent code formatting using dartfmt
8. THE Mobile_App SHALL enforce linting rules using analysis_options.yaml
9. THE Mobile_App SHALL achieve minimum 80% code coverage for business logic
10. THE Mobile_App SHALL pass all linting checks before deployment

### Requirement 17: Performance Optimization

**User Story:** As a student, I want the application to be fast and responsive, so that I can complete tasks quickly without delays.

#### Acceptance Criteria

1. WHEN displaying lists THEN THE Mobile_App SHALL implement lazy loading to load items on demand
2. WHEN loading images THEN THE Mobile_App SHALL optimize and cache images to reduce bandwidth
3. WHEN rebuilding widgets THEN THE Mobile_App SHALL minimize unnecessary rebuilds using state management
4. WHEN managing state THEN THE Mobile_App SHALL use efficient state management to prevent memory leaks
5. WHEN the Mobile_App starts THEN THE Mobile_App SHALL complete startup within 3 seconds
6. WHEN displaying animations THEN THE Mobile_App SHALL maintain 60 frames per second
7. WHEN loading large lists THEN THE Mobile_App SHALL use pagination to limit memory usage
8. WHEN caching data THEN THE Mobile_App SHALL implement cache eviction to prevent excessive storage use
9. WHEN making API requests THEN THE Mobile_App SHALL implement request debouncing for search operations
10. WHEN the Mobile_App runs THEN THE Mobile_App SHALL monitor and prevent memory leaks

### Requirement 18: Security Implementation

**User Story:** As a student, I want my personal data and authentication credentials to be secure, so that my information is protected from unauthorized access.

#### Acceptance Criteria

1. WHEN storing Auth_Token THEN THE Mobile_App SHALL use Secure_Storage with encryption
2. WHEN making API requests THEN THE Mobile_App SHALL use HTTPS for all communications
3. WHEN making API requests THEN THE Mobile_App SHALL implement certificate pinning to prevent man-in-the-middle attacks
4. WHEN accepting user input THEN THE Mobile_App SHALL sanitize input to prevent injection attacks
5. WHEN displaying user-generated content THEN THE Mobile_App SHALL escape HTML to prevent XSS attacks
6. WHEN storing files THEN THE Mobile_App SHALL use secure file storage with appropriate permissions
7. WHEN logging information THEN THE Mobile_App SHALL not include sensitive data in logs
8. WHEN handling errors THEN THE Mobile_App SHALL not expose sensitive information in error messages
9. WHEN the Mobile_App is backgrounded THEN THE Mobile_App SHALL obscure sensitive information on screen
10. WHEN biometric authentication is used THEN THE Mobile_App SHALL use platform-secure biometric APIs

### Requirement 19: Image Handling

**User Story:** As a student, I want profile pictures and images to load quickly and look good, so that the app feels polished and professional.

#### Acceptance Criteria

1. WHEN displaying profile avatars THEN THE Mobile_App SHALL use cached_network_image for efficient loading
2. WHEN an image fails to load THEN THE Mobile_App SHALL display a placeholder image
3. WHEN loading images THEN THE Mobile_App SHALL show loading indicators
4. WHEN images are cached THEN THE Mobile_App SHALL implement cache expiration policies
5. WHEN uploading selfies THEN THE Mobile_App SHALL compress images to reduce file size
6. WHEN displaying images THEN THE Mobile_App SHALL use appropriate image resolutions for different screen sizes
7. WHEN the cache is full THEN THE Mobile_App SHALL remove least recently used images
8. WHEN images are displayed THEN THE Mobile_App SHALL use fade-in animations for smooth appearance

### Requirement 20: Form Validation

**User Story:** As a student, I want clear and immediate feedback when filling out forms, so that I can correct errors before submission.

#### Acceptance Criteria

1. WHEN the student enters data in a form field THEN THE Mobile_App SHALL validate the input in real-time
2. WHEN validation fails THEN THE Mobile_App SHALL display error message below the field
3. WHEN the student corrects an error THEN THE Mobile_App SHALL clear the error message
4. WHEN the student submits a form with errors THEN THE Mobile_App SHALL prevent submission and focus the first error field
5. WHEN validating NIM THEN THE Mobile_App SHALL ensure it matches the expected format
6. WHEN validating email THEN THE Mobile_App SHALL ensure it is a valid email format
7. WHEN validating password THEN THE Mobile_App SHALL ensure it meets minimum length requirements
8. WHEN all fields are valid THEN THE Mobile_App SHALL enable the submit button
9. WHEN any field is invalid THEN THE Mobile_App SHALL disable the submit button
10. WHEN the student leaves a required field empty THEN THE Mobile_App SHALL display a required field error message

class ApiEndpoints {
  // URL diisi saat build: flutter build apk --dart-define=BASE_URL=https://<DOMAIN_ATAU_IP>
  // Default otomatis untuk emulator dev (10.0.2.2 = localhost laptop)
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );
  static const String basePath = '/api/mobile/mahasiswa';

  static const String login = '$basePath/login';
  static const String fcmToken = '$basePath/fcm-token';
  static const String dashboard = '$basePath/dashboard';
  static const String profile = '$basePath/profile';
  static const String attendanceToday = '$basePath/attendance/today';
  static const String attendanceHistory = '$basePath/attendance/history';
  static const String attendanceActiveSessions = '$basePath/attendance/active-sessions';
  static const String attendanceStats = '$basePath/attendance/stats';
  static const String submitQrAttendance = '$basePath/attendance/qr';
  static const String submitSelfieAttendance = '$basePath/attendance/selfie';
  static const String forgotPassword = '/api/mobile/mahasiswa/forgot-password';

  // Kas
  static const String kasDashboard = '$basePath/kas';
  static const String kasReceiptUpload = '$basePath/kas/receipts/upload';

  // Tugas
  static const String tugasDashboard = '$basePath/tugas';
  static const String tugasDetail = '$basePath/tugas';
  static const String tugasSubmit = '$basePath/tugas';
  static const String tugasKelompokDashboard = '$basePath/tugas-kelompok';
  static const String tugasKelompokDetail = '$basePath/tugas-kelompok';
}

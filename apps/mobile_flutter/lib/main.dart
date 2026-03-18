import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'app.dart';
import 'core/di/injection.dart';
import 'core/services/push_notification_service.dart';

// Bypass SSL certificate errors (seperti CERTIFICATE_VERIFY_FAILED: IP mismatch)
class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (X509Certificate cert, String host, int port) => true;
  }
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Daftarkan bypass SSL HTTPS
  HttpOverrides.global = MyHttpOverrides();

  // Initialize Firebase
  await Firebase.initializeApp();

  // Register background message handler
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  await initializeDateFormatting('id_ID', null);
  await configureDependencies();

  // Initialize push notifications
  await PushNotificationService.instance.init();

  runApp(const ProviderScope(child: Tplk004App()));
}

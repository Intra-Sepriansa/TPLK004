import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:logger/logger.dart';

/// Top-level background handler – must be a top-level function.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('[FCM] Background message: ${message.messageId}');
}

class PushNotificationService {
  PushNotificationService._();
  static final PushNotificationService instance = PushNotificationService._();

  final _log = Logger(printer: PrettyPrinter(methodCount: 0));
  final _messaging = FirebaseMessaging.instance;
  final _localNotifications = FlutterLocalNotificationsPlugin();

  /// High-importance Android notification channel
  static const _androidChannel = AndroidNotificationChannel(
    'tplk004_high_importance',
    'Notifikasi Penting',
    description: 'Notifikasi penting seperti presensi, tugas, dan pengingat.',
    importance: Importance.high,
    playSound: true,
    enableVibration: true,
  );

  /// Call once during app startup (after Firebase.initializeApp).
  Future<void> init() async {
    // ── 1. Request permission ──────────────────────────────────
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
    debugPrint('═══════════════════════════════════════');
    debugPrint('[FCM] Permission: ${settings.authorizationStatus}');
    debugPrint('═══════════════════════════════════════');

    // ── 2. Create Android notification channel ─────────────────
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_androidChannel);

    // ── 3. Initialise flutter_local_notifications ──────────────
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const darwinInit = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    await _localNotifications.initialize(
      const InitializationSettings(
        android: androidInit,
        iOS: darwinInit,
      ),
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // ── 4. Get FCM token ───────────────────────────────────────
    if (Platform.isIOS) {
      // On iOS we need the APNs token first
      final apnsToken = await _messaging.getAPNSToken();
      debugPrint('[FCM] APNs token: $apnsToken');
    }
    final fcmToken = await _messaging.getToken();
    debugPrint('═══════════════════════════════════════');
    debugPrint('[FCM] TOKEN: $fcmToken');
    debugPrint('═══════════════════════════════════════');

    // Listen for token refresh
    _messaging.onTokenRefresh.listen((newToken) {
      debugPrint('[FCM] Token refreshed: $newToken');
      // TODO: Send newToken to your backend
    });

    // ── 5. Setup foreground message handler ─────────────────────
    FirebaseMessaging.onMessage.listen(_showForegroundNotification);

    // ── 6. Handle notification taps (background/terminated) ────
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpen);

    // Check if app was opened from a terminated state via notification
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleMessageOpen(initialMessage);
    }

    // ── 7. Set foreground notification presentation (iOS) ──────
    await _messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );
  }

  /// Show a local notification when the app is in the foreground.
  void _showForegroundNotification(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;

    _localNotifications.show(
      notification.hashCode,
      notification.title ?? 'TPLK004',
      notification.body ?? '',
      NotificationDetails(
        android: AndroidNotificationDetails(
          _androidChannel.id,
          _androidChannel.name,
          channelDescription: _androidChannel.description,
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          styleInformation: BigTextStyleInformation(
            notification.body ?? '',
            contentTitle: notification.title,
          ),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: message.data['route'],
    );
  }

  /// Handle notification tap (opens specific screen via route).
  void _onNotificationTap(NotificationResponse response) {
    final route = response.payload;
    if (route != null && route.isNotEmpty) {
      debugPrint('[FCM] Notification tapped, route: $route');
      // TODO: Navigate to route using GoRouter
    }
  }

  /// Handle message open from background/terminated state.
  void _handleMessageOpen(RemoteMessage message) {
    final route = message.data['route'];
    if (route != null) {
      debugPrint('[FCM] Message opened, route: $route');
      // TODO: Navigate to route using GoRouter
    }
  }
}

import 'dart:async';
import 'package:dio/dio.dart';

import '../network/connectivity_service.dart';
import '../storage/secure_storage.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/logging_interceptor.dart';
import 'interceptors/retry_interceptor.dart';

class ApiClient {
  static final StreamController<void> unauthorizedStream = StreamController.broadcast();
  
  final Dio dio;

  ApiClient({
    required String baseUrl,
    required SecureStorage secureStorage,
    required ConnectivityService connectivityService,
  }) : dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 30),
            receiveTimeout: const Duration(seconds: 30),
            headers: const {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        ) {
    dio.interceptors.addAll([
      AuthInterceptor(secureStorage),
      RetryInterceptor(connectivityService),
      buildLoggingInterceptor(),
    ]);
  }
}

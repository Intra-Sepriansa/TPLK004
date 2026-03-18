import 'package:dio/dio.dart';

import '../../storage/secure_storage.dart';
import '../api_client.dart';

class AuthInterceptor extends Interceptor {
  final SecureStorage secureStorage;

  AuthInterceptor(this.secureStorage);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await secureStorage.getToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      secureStorage.deleteToken();
      ApiClient.unauthorizedStream.add(null);
    }
    handler.next(err);
  }
}

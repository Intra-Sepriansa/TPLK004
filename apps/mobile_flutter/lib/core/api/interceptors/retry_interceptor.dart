import 'package:dio/dio.dart';

import '../../network/connectivity_service.dart';

class RetryInterceptor extends Interceptor {
  final ConnectivityService connectivityService;

  RetryInterceptor(this.connectivityService);

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (!await connectivityService.isConnected()) {
      handler.next(err);
      return;
    }
    handler.next(err);
  }
}

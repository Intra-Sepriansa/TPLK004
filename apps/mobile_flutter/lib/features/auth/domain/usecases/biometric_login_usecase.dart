import 'package:local_auth/local_auth.dart';

import '../../../../core/storage/secure_storage.dart';

class BiometricLoginUseCase {
  final LocalAuthentication localAuth;
  final SecureStorage secureStorage;

  BiometricLoginUseCase(this.localAuth, this.secureStorage);

  Future<bool> authenticate() async {
    final canCheck = await localAuth.canCheckBiometrics;
    final isSupported = await localAuth.isDeviceSupported();
    if (!canCheck || !isSupported) {
      return false;
    }

    final ok = await localAuth.authenticate(
      localizedReason: 'Gunakan biometrik untuk login',
      options: const AuthenticationOptions(
        stickyAuth: true,
        biometricOnly: true,
      ),
    );

    if (!ok) return false;
    final token = await secureStorage.getToken();
    return token != null && token.isNotEmpty;
  }
}

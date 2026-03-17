import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/injection.dart';
import '../../domain/entities/user.dart';
import '../../domain/usecases/check_auth_usecase.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final UserEntity? user;
  final String? errorMessage;

  const AuthState({
    required this.isLoading,
    required this.isAuthenticated,
    this.user,
    this.errorMessage,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    UserEntity? user,
    String? errorMessage,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(
    this._loginUseCase,
    this._logoutUseCase,
    this._checkAuthUseCase,
  ) : super(const AuthState(isLoading: true, isAuthenticated: false));

  final LoginUseCase _loginUseCase;
  final LogoutUseCase _logoutUseCase;
  final CheckAuthUseCase _checkAuthUseCase;

  Future<void> checkAuth() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final result = await _checkAuthUseCase();
    final token = result.$1;
    final user = result.$2;
    state = state.copyWith(
      isLoading: false,
      isAuthenticated: token != null && token.isNotEmpty,
      user: user,
      errorMessage: null,
    );
  }

  Future<bool> login({
    required String nim,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _loginUseCase(nim: nim, password: password);
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: result.$2,
        errorMessage: null,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _logoutUseCase();
    state = state.copyWith(
      isAuthenticated: false,
      user: null,
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final login = LoginUseCase(getIt());
  final logout = LogoutUseCase(getIt());
  final check = CheckAuthUseCase(getIt());
  return AuthNotifier(login, logout, check);
});

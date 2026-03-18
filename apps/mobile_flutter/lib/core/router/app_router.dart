import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/auth/presentation/screens/welcome_screen.dart';
import '../../features/kas/presentation/screens/kas_screen.dart';
import '../../features/tugas/presentation/screens/tugas_detail_screen.dart';
import '../../features/tugas/presentation/screens/tugas_kelompok_detail_screen.dart';
import '../../features/tugas/presentation/screens/tugas_kelompok_screen.dart';
import '../../features/tugas/presentation/screens/tugas_screen.dart';
import '../../shared/widgets/main_scaffold.dart';
import 'route_guards.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/app',
        builder: (context, state) => const MainScaffold(),
        redirect: (context, state) => authGuard(state, ref),
        routes: [
          GoRoute(
            path: 'kas',
            builder: (context, state) => const KasScreen(),
          ),
          GoRoute(
            path: 'tugas',
            builder: (context, state) => const TugasScreen(),
          ),
          GoRoute(
            path: 'tugas/:id',
            builder: (context, state) => TugasDetailScreen(
              id: int.tryParse(state.pathParameters['id'] ?? '') ?? 0,
            ),
          ),
          GoRoute(
            path: 'tugas-kelompok-dashboard',
            builder: (context, state) => const TugasKelompokScreen(),
          ),
          GoRoute(
            path: 'tugas-kelompok/:id',
            builder: (context, state) => TugasKelompokDetailScreen(
              id: int.tryParse(state.pathParameters['id'] ?? '') ?? 0,
            ),
          ),
        ],
      ),
    ],
  );
});

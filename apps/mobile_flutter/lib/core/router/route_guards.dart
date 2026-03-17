import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_provider.dart';

String? authGuard(GoRouterState state, Ref ref) {
  final auth = ref.read(authProvider);
  if (!auth.isAuthenticated) {
    return '/login';
  }
  return null;
}

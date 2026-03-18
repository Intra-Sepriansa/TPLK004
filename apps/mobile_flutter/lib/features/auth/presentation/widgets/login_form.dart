import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/error_state.dart';
import '../providers/auth_provider.dart';

class LoginForm extends ConsumerStatefulWidget {
  const LoginForm({super.key});

  @override
  ConsumerState<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends ConsumerState<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _nimController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;
  final _nimFocus = FocusNode();
  final _passFocus = FocusNode();
  bool _nimFocused = false;
  bool _passFocused = false;

  @override
  void initState() {
    super.initState();
    _nimFocus.addListener(() => setState(() => _nimFocused = _nimFocus.hasFocus));
    _passFocus.addListener(() => setState(() => _passFocused = _passFocus.hasFocus));
  }

  @override
  void dispose() {
    _nimController.dispose();
    _passwordController.dispose();
    _nimFocus.dispose();
    _passFocus.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await ref.read(authProvider.notifier).login(
          nim: _nimController.text.trim(),
          password: _passwordController.text,
        );
    if (!ok && mounted) {
      final error = _friendlyAuthError(ref.read(authProvider).errorMessage);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: AppColors.rose500,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  String _friendlyAuthError(String? raw) {
    if (raw == null || raw.trim().isEmpty) {
      return 'Gagal masuk, silakan coba lagi';
    }
    final msg = raw.toLowerCase();
    if (msg.contains('401') || msg.contains('unauthorized')) {
      return 'NIM atau kata sandi salah. Coba lagi.';
    }
    if (msg.contains('timeout') ||
        msg.contains('connection') ||
        msg.contains('socket') ||
        msg.contains('network') ||
        msg.contains('host')) {
      return 'Tidak bisa terhubung ke server. Periksa koneksi internet.';
    }
    return 'Gagal masuk, silakan coba lagi';
  }

  InputDecoration _buildInputDecoration({
    required String label,
    required IconData icon,
    required bool isFocused,
    Widget? suffix,
  }) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(
        color: isFocused
            ? const Color(0xFF6366F1)
            : const Color(0xFF94A3B8),
        fontSize: 14,
        fontWeight: FontWeight.w500,
      ),
      prefixIcon: Icon(
        icon,
        color: isFocused
            ? const Color(0xFF6366F1)
            : const Color(0xFF94A3B8),
        size: 20,
      ),
      suffixIcon: suffix,
      filled: true,
      fillColor: isFocused
          ? const Color(0xFFF5F3FF)
          : const Color(0xFFF8FAFC),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: Color(0xFFE2E8F0),
          width: 1,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: Color(0xFF6366F1),
          width: 1.5,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(
          color: AppColors.rose500.withOpacity(0.5),
          width: 1,
        ),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: AppColors.rose500,
          width: 1.5,
        ),
      ),
      errorStyle: const TextStyle(
        color: AppColors.rose500,
        fontSize: 11,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // NIM Field
          TextFormField(
            controller: _nimController,
            focusNode: _nimFocus,
            enabled: !auth.isLoading,
            keyboardType: TextInputType.number,
            style: TextStyle(
              color: auth.isLoading ? const Color(0xFF94A3B8) : const Color(0xFF1E293B),
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
            cursorColor: const Color(0xFF6366F1),
            decoration: _buildInputDecoration(
              label: 'NIM / Username',
              icon: Icons.badge_outlined,
              isFocused: _nimFocused,
            ),
            validator: (value) =>
                value == null || value.trim().isEmpty ? 'NIM / Username wajib diisi' : null,
            onFieldSubmitted: (_) =>
                FocusScope.of(context).requestFocus(_passFocus),
          ),

          const SizedBox(height: 16),

          // Password Field
          TextFormField(
            controller: _passwordController,
            focusNode: _passFocus,
            enabled: !auth.isLoading,
            obscureText: _obscure,
            style: TextStyle(
              color: auth.isLoading ? const Color(0xFF94A3B8) : const Color(0xFF1E293B),
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
            cursorColor: const Color(0xFF6366F1),
            decoration: _buildInputDecoration(
              label: 'Kata Sandi',
              icon: Icons.lock_outline_rounded,
              isFocused: _passFocused,
              suffix: IconButton(
                icon: Icon(
                  _obscure
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  color: const Color(0xFF94A3B8),
                  size: 20,
                ),
                onPressed: () => setState(() => _obscure = !_obscure),
              ),
            ),
            validator: (value) =>
                value == null || value.isEmpty ? 'Kata sandi wajib diisi' : null,
            onFieldSubmitted: (_) => _handleLogin(),
          ),

          const SizedBox(height: 8),

          // Forgot Password
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: auth.isLoading ? null : () => context.push('/forgot-password'),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(
                'Lupa kata sandi?',
                style: TextStyle(
                  fontSize: 12,
                  color: auth.isLoading ? const Color(0xFF94A3B8) : const Color(0xFF6366F1),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Error State
          if (auth.errorMessage != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.rose500.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.rose500.withOpacity(0.15),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppColors.rose500, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _friendlyAuthError(auth.errorMessage),
                        style: const TextStyle(
                          color: AppColors.rose500,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Login Button
          Container(
            height: 54,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF6366F1),
                  Color(0xFF818CF8),
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF6366F1).withOpacity(0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: auth.isLoading ? null : _handleLogin,
              child: auth.isLoading
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.white,
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Text(
                          'Masuk',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.3,
                          ),
                        ),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward_rounded, size: 20),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

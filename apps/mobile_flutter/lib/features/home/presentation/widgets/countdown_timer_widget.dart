import 'dart:async';

import 'package:flutter/material.dart';

/// Countdown timer widget that displays HH:MM:SS countdown to a target date.
class CountdownTimerWidget extends StatefulWidget {
  const CountdownTimerWidget({super.key, required this.targetDate});

  final DateTime targetDate;

  @override
  State<CountdownTimerWidget> createState() => _CountdownTimerWidgetState();
}

class _CountdownTimerWidgetState extends State<CountdownTimerWidget> {
  Timer? _timer;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateRemaining();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      _updateRemaining();
    });
  }

  void _updateRemaining() {
    final diff = widget.targetDate.difference(DateTime.now());
    if (mounted) {
      setState(() {
        _remaining = diff.isNegative ? Duration.zero : diff;
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_remaining == Duration.zero) {
      return const Text(
        'Sedang berlangsung!',
        style: TextStyle(
          fontWeight: FontWeight.w600,
          color: Color(0xFF10B981),
          fontSize: 14,
        ),
      );
    }

    final hours = _remaining.inHours;
    final minutes = _remaining.inMinutes.remainder(60);
    final seconds = _remaining.inSeconds.remainder(60);

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildDigit(hours.toString().padLeft(2, '0'), isDark),
        _buildSeparator(),
        _buildDigit(minutes.toString().padLeft(2, '0'), isDark),
        _buildSeparator(),
        _buildDigit(seconds.toString().padLeft(2, '0'), isDark),
      ],
    );
  }

  Widget _buildDigit(String text, bool isDark) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? Colors.white : const Color(0xFF171717),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          fontFamily: 'monospace',
          color: isDark ? const Color(0xFF171717) : Colors.white,
        ),
      ),
    );
  }

  Widget _buildSeparator() {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 2),
      child: Text(
        ':',
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: Color(0xFF9CA3AF),
        ),
      ),
    );
  }
}

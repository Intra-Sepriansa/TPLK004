import 'package:flutter/material.dart';

/// Animated counter that counts up from 0 to [value].
class AnimatedCounter extends StatelessWidget {
  const AnimatedCounter({
    super.key,
    required this.value,
    this.suffix = '',
    this.duration = const Duration(milliseconds: 1200),
    this.style,
  });

  final num value;
  final String suffix;
  final Duration duration;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: value.toDouble()),
      duration: duration,
      curve: Curves.easeOutCubic,
      builder: (context, animValue, child) {
        String display;
        if (value is int) {
          display = animValue.toInt().toString();
        } else {
          display = animValue.toStringAsFixed(1);
        }
        return Text(
          '$display$suffix',
          style: style ??
              TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w700,
              ),
        );
      },
    );
  }
}

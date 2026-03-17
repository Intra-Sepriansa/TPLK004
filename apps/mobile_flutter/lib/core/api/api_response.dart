class ApiResponse<T> {
  final bool success;
  final String? message;
  final T? data;
  final Map<String, dynamic>? meta;
  final List<dynamic>? errors;

  ApiResponse({
    required this.success,
    this.message,
    this.data,
    this.meta,
    this.errors,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json, {
    T Function(dynamic json)? fromJson,
  }) {
    return ApiResponse<T>(
      success: json['success'] == true,
      message: json['message']?.toString(),
      data: fromJson != null ? fromJson(json['data']) : json['data'] as T?,
      meta: json['meta'] as Map<String, dynamic>?,
      errors: json['errors'] as List<dynamic>?,
    );
  }
}

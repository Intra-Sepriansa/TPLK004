class LoginRequest {
  final String nim;
  final String password;

  LoginRequest({required this.nim, required this.password});

  Map<String, dynamic> toJson() => {
        'nim': nim,
        'password': password,
      };
}

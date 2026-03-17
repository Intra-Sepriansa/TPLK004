/// Enums for the unified attendance scan flow.
/// Maps directly to the web's camera phase state machine.

enum CameraPhase {
  idle,
  scanning,
  flipping,
  selfie,
  done,
}

enum ScanState {
  idle,
  scanning,
  success,
  error,
}

enum SelfieState {
  idle,
  ready,
  capturing,
  captured,
  error,
}

enum LocationState {
  idle,
  fetching,
  success,
  error,
}

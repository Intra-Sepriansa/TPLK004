import 'package:get_it/get_it.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../network/connectivity_service.dart';
import '../storage/local_storage.dart';
import '../storage/secure_storage.dart';
import '../services/fake_gps_detector.dart';
import '../services/location_service.dart';
import '../../features/auth/data/datasources/auth_remote_datasource.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/home/data/datasources/home_remote_datasource.dart';
import '../../features/home/data/repositories/home_repository_impl.dart';
import '../../features/home/domain/repositories/home_repository.dart';
import '../../features/profile/data/datasources/profile_remote_datasource.dart';
import '../../features/profile/data/repositories/profile_repository_impl.dart';
import '../../features/profile/domain/repositories/profile_repository.dart';
import '../../features/attendance/data/datasources/attendance_remote_datasource.dart';
import '../../features/attendance/data/repositories/attendance_repository_impl.dart';
import '../../features/attendance/domain/repositories/attendance_repository.dart';
import '../../features/kas/data/datasources/kas_remote_datasource.dart';
import '../../features/kas/data/repositories/kas_repository_impl.dart';
import '../../features/kas/domain/repositories/kas_repository.dart';
import '../../features/tugas/data/datasources/tugas_remote_datasource.dart';
import '../../features/tugas/data/repositories/tugas_repository_impl.dart';
import '../../features/tugas/domain/repositories/tugas_repository.dart';

final getIt = GetIt.instance;

Future<void> configureDependencies() async {
  getIt.registerLazySingleton(() => ConnectivityService());
  getIt.registerLazySingleton(() => const FlutterSecureStorage());
  getIt.registerLazySingleton(() => LocalStorage());
  getIt.registerLazySingleton(() => SecureStorage(getIt<FlutterSecureStorage>()));
  getIt.registerLazySingleton(() => LocationService());
  getIt.registerLazySingleton(() => FakeGpsDetector(getIt<LocationService>()));
  getIt.registerLazySingleton(() => ApiClient(
        baseUrl: ApiEndpoints.baseUrl,
        secureStorage: getIt<SecureStorage>(),
        connectivityService: getIt<ConnectivityService>(),
      ));

  getIt.registerLazySingleton<AuthRemoteDataSource>(
      () => AuthRemoteDataSource(getIt<ApiClient>().dio));
  getIt.registerLazySingleton<AuthRepository>(
      () => AuthRepositoryImpl(
            getIt<AuthRemoteDataSource>(),
            getIt<SecureStorage>(),
            getIt<LocalStorage>(),
          ));

  getIt.registerLazySingleton<HomeRemoteDataSource>(
      () => HomeRemoteDataSource(getIt<ApiClient>().dio));
  getIt.registerLazySingleton<HomeRepository>(
      () => HomeRepositoryImpl(getIt<HomeRemoteDataSource>()));

  getIt.registerLazySingleton<ProfileRemoteDataSource>(
      () => ProfileRemoteDataSource(getIt<ApiClient>().dio));
  getIt.registerLazySingleton<ProfileRepository>(
      () => ProfileRepositoryImpl(getIt<ProfileRemoteDataSource>()));

  getIt.registerLazySingleton<AttendanceRemoteDataSource>(
      () => AttendanceRemoteDataSource(getIt<ApiClient>().dio));
  getIt.registerLazySingleton<AttendanceRepository>(
      () => AttendanceRepositoryImpl(getIt<AttendanceRemoteDataSource>()));

  getIt.registerLazySingleton<KasRemoteDataSource>(
      () => KasRemoteDataSource(getIt<ApiClient>().dio));
  getIt.registerLazySingleton<KasRepository>(
      () => KasRepositoryImpl(getIt<KasRemoteDataSource>()));

  getIt.registerLazySingleton<TugasRemoteDataSource>(
      () => TugasRemoteDataSource(getIt<ApiClient>().dio));
  getIt.registerLazySingleton<TugasRepository>(
      () => TugasRepositoryImpl(getIt<TugasRemoteDataSource>()));
}

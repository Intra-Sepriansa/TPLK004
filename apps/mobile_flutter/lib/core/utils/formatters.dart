import 'package:intl/intl.dart';

class Formatters {
  static String dateShort(DateTime date) => DateFormat('dd MMM yyyy').format(date);
  static String timeShort(DateTime date) => DateFormat('HH:mm').format(date);
}

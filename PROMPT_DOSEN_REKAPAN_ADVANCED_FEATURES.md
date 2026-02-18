# 🚀 ADVANCED FEATURES - DAFTAR KEHADIRAN MAHASISWA
## Fitur-Fitur Canggih & AI Integration

---

## 🤖 AI-POWERED FEATURES

### 1. SMART ATTENDANCE PREDICTION

#### Predictive Model Architecture
```python
# ml/models/attendance_predictor.py
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib

class AttendancePredictor:
    def __init__(self):
        self.model = GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        
    def prepare_features(self, data):
        """
        Extract features dari historical data
        """
        features = pd.DataFrame({
            # Temporal features
            'day_of_week': data['date'].dt.dayofweek,
            'hour': data['time'].dt.hour,
            'week_of_semester': data['week_number'],
            'is_holiday': data['is_holiday'].astype(int),
            
            # Student features
            'previous_attendance_rate': data['prev_attendance_rate'],
            'consecutive_absences': data['consecutive_absences'],
            'average_lateness_minutes': data['avg_lateness'],
            'gpa': data['gpa'],
            'semester': data['semester'],
            'distance_from_campus_km': data['distance'],
            
            # Course features
            'course_difficulty': data['course_difficulty'],
            'course_popularity': data['course_popularity'],
            'time_slot_preference': data['time_slot_pref'],
            
            # Environmental features
            'weather_condition': data['weather'].map({
                'sunny': 1, 'cloudy': 2, 'rainy': 3, 'stormy': 4
            }),
            'temperature_celsius': data['temperature'],
            'traffic_index': data['traffic_index'],
            
            # Social features
            'friend_attendance_rate': data['friend_attendance'],
            'class_average_attendance': data['class_avg_attendance'],
        })
        
        return features
    
    def train(self, historical_data):
        """
        Train model dengan historical data
        """
        X = self.prepare_features(historical_data)
        y = historical_data['attended'].astype(int)
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train_scaled, y_train)
        test_score = self.model.score(X_test_scaled, y_test)
        
        print(f"Train Accuracy: {train_score:.4f}")
        print(f"Test Accuracy: {test_score:.4f}")
        
        # Save model
        joblib.dump(self.model, 'models/attendance_model.pkl')
        joblib.dump(self.scaler, 'models/scaler.pkl')
        
        return {
            'train_accuracy': train_score,
            'test_accuracy': test_score,
            'feature_importance': dict(zip(
                X.columns, 
                self.model.feature_importances_
            ))
        }
    
    def predict_attendance(self, session_data, students):
        """
        Predict attendance untuk upcoming session
        """
        features = self.prepare_features(students)
        features_scaled = self.scaler.transform(features)
        
        # Get probability predictions
        probabilities = self.model.predict_proba(features_scaled)
        
        predictions = []
        for i, student in students.iterrows():
            pred = {
                'mahasiswa_id': student['id'],
                'nama': student['nama'],
                'nim': student['nim'],
                'will_attend_probability': probabilities[i][1],
                'risk_level': self._calculate_risk_level(probabilities[i][1]),
                'recommended_action': self._get_recommendation(probabilities[i][1]),
                'contributing_factors': self._get_top_factors(features.iloc[i])
            }
            predictions.append(pred)
        
        return sorted(predictions, key=lambda x: x['will_attend_probability'])
    
    def _calculate_risk_level(self, probability):
        if probability >= 0.8:
            return 'low'
        elif probability >= 0.5:
            return 'medium'
        elif probability >= 0.3:
            return 'high'
        else:
            return 'critical'
    
    def _get_recommendation(self, probability):
        if probability < 0.3:
            return "Hubungi mahasiswa segera. Risiko tidak hadir sangat tinggi."
        elif probability < 0.5:
            return "Kirim reminder dan motivasi. Perhatian khusus diperlukan."
        elif probability < 0.8:
            return "Monitor kehadiran. Kirim reminder standar."
        else:
            return "Kemungkinan hadir tinggi. Tidak perlu tindakan khusus."
    
    def _get_top_factors(self, features, top_n=3):
        """
        Identify top contributing factors
        """
        feature_importance = self.model.feature_importances_
        feature_values = features.values
        
        contributions = feature_importance * np.abs(feature_values)
        top_indices = np.argsort(contributions)[-top_n:][::-1]
        
        return [
            {
                'factor': features.index[i],
                'value': feature_values[i],
                'importance': feature_importance[i]
            }
            for i in top_indices
        ]
```

#### Laravel Integration
```php
// app/Services/AI/AttendancePredictionService.php
namespace App\Services\AI;

use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class AttendancePredictionService
{
    private string $pythonApiUrl;
    
    public function __construct()
    {
        $this->pythonApiUrl = config('services.ml_api.url');
    }
    
    public function predictSessionAttendance(AttendanceSession $session): array
    {
        $cacheKey = "attendance_prediction_{$session->id}";
        
        return Cache::remember($cacheKey, 3600, function() use ($session) {
            // Get all students enrolled in the course
            $students = Mahasiswa::whereHas('courses', function($q) use ($session) {
                $q->where('mata_kuliah_id', $session->course_id);
            })->with(['attendanceLogs', 'academicRecords'])->get();
            
            // Prepare data for ML model
            $studentsData = $students->map(function($student) use ($session) {
                return [
                    'id' => $student->id,
                    'nama' => $student->nama,
                    'nim' => $student->nim,
                    'date' => $session->start_at->toDateString(),
                    'time' => $session->start_at->toTimeString(),
                    'week_number' => $session->meeting_number,
                    'is_holiday' => $this->isHoliday($session->start_at),
                    'prev_attendance_rate' => $this->calculateAttendanceRate($student),
                    'consecutive_absences' => $this->getConsecutiveAbsences($student),
                    'avg_lateness' => $this->getAverageLateness($student),
                    'gpa' => $student->academicRecords->last()?->gpa ?? 0,
                    'semester' => $student->semester,
                    'distance' => $student->distance_from_campus ?? 10,
                    'course_difficulty' => $session->course->difficulty_level ?? 3,
                    'course_popularity' => $this->getCoursePopularity($session->course),
                    'time_slot_pref' => $this->getTimeSlotPreference($student),
                    'weather' => $this->getWeatherForecast($session->start_at),
                    'temperature' => $this->getTemperatureForecast($session->start_at),
                    'traffic_index' => $this->getTrafficIndex($session->start_at),
                    'friend_attendance' => $this->getFriendAttendanceRate($student),
                    'class_avg_attendance' => $this->getClassAverageAttendance($session->course),
                ];
            });
            
            // Call Python ML API
            $response = Http::timeout(30)->post("{$this->pythonApiUrl}/predict", [
                'session_id' => $session->id,
                'students' => $studentsData
            ]);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            throw new \Exception('ML API request failed');
        });
    }
    
    public function getHighRiskStudents(AttendanceSession $session): array
    {
        $predictions = $this->predictSessionAttendance($session);
        
        return array_filter($predictions, function($pred) {
            return in_array($pred['risk_level'], ['high', 'critical']);
        });
    }
    
    public function sendPreventiveNotifications(AttendanceSession $session): void
    {
        $highRiskStudents = $this->getHighRiskStudents($session);
        
        foreach ($highRiskStudents as $prediction) {
            $student = Mahasiswa::find($prediction['mahasiswa_id']);
            
            // Send personalized notification
            $student->notify(new AttendanceReminderNotification([
                'session' => $session,
                'risk_level' => $prediction['risk_level'],
                'message' => $prediction['recommended_action'],
                'factors' => $prediction['contributing_factors']
            ]));
            
            // Log intervention
            \Log::info("Preventive notification sent", [
                'student_id' => $student->id,
                'session_id' => $session->id,
                'risk_level' => $prediction['risk_level']
            ]);
        }
    }
    
    private function calculateAttendanceRate(Mahasiswa $student): float
    {
        $total = $student->attendanceLogs()->count();
        if ($total === 0) return 1.0;
        
        $attended = $student->attendanceLogs()
            ->whereIn('status', ['present', 'late'])
            ->count();
        
        return $attended / $total;
    }
    
    private function getConsecutiveAbsences(Mahasiswa $student): int
    {
        $recentLogs = $student->attendanceLogs()
            ->orderBy('scanned_at', 'desc')
            ->limit(10)
            ->get();
        
        $consecutive = 0;
        foreach ($recentLogs as $log) {
            if ($log->status === 'absent') {
                $consecutive++;
            } else {
                break;
            }
        }
        
        return $consecutive;
    }
    
    private function getAverageLateness(Mahasiswa $student): float
    {
        return $student->attendanceLogs()
            ->where('status', 'late')
            ->avg('lateness_minutes') ?? 0;
    }
    
    private function isHoliday(\DateTime $date): bool
    {
        // Check against holiday calendar
        return \Cache::remember("holiday_{$date->format('Y-m-d')}", 86400, function() use ($date) {
            return Holiday::whereDate('date', $date)->exists();
        });
    }
    
    private function getWeatherForecast(\DateTime $date): string
    {
        // Integration with weather API
        $response = Http::get('https://api.openweathermap.org/data/2.5/forecast', [
            'lat' => -6.2088,  // Jakarta
            'lon' => 106.8456,
            'appid' => config('services.openweather.key')
        ]);
        
        // Parse and return weather condition
        return $response->json()['weather'][0]['main'] ?? 'sunny';
    }
}
```

#### Frontend Integration
```typescript
// resources/js/components/dosen/attendance-prediction-panel.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingDown, TrendingUp, Zap, Brain } from 'lucide-react';

interface Prediction {
  mahasiswa_id: number;
  nama: string;
  nim: string;
  will_attend_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommended_action: string;
  contributing_factors: Array<{
    factor: string;
    value: number;
    importance: number;
  }>;
}

export const AttendancePredictionPanel = ({ sessionId }: { sessionId: number }) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Prediction | null>(null);

  useEffect(() => {
    fetchPredictions();
  }, [sessionId]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/predict-attendance/${sessionId}`);
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const riskConfig = {
    critical: {
      color: 'from-red-500 to-rose-600',
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      icon: AlertTriangle,
      label: 'Kritis'
    },
    high: {
      color: 'from-orange-500 to-red-500',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-400',
      icon: TrendingDown,
      label: 'Tinggi'
    },
    medium: {
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      icon: Zap,
      label: 'Sedang'
    },
    low: {
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      icon: TrendingUp,
      label: 'Rendah'
    }
  };

  const highRiskStudents = predictions.filter(p => 
    ['high', 'critical'].includes(p.risk_level)
  );

  if (loading) {
    return <PredictionSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg"
          >
            <Brain className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              AI Prediction
            </h3>
            <p className="text-sm text-neutral-500">
              {highRiskStudents.length} mahasiswa berisiko tinggi
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchPredictions()}
          className="px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-semibold"
        >
          Refresh Prediction
        </motion.button>
      </div>

      {/* High Risk Alert */}
      {highRiskStudents.length > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1">
                Perhatian Diperlukan!
              </h4>
              <p className="text-sm text-red-600 dark:text-red-500">
                {highRiskStudents.length} mahasiswa memiliki risiko tinggi tidak hadir. 
                Pertimbangkan untuk mengirim reminder atau menghubungi mereka.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Predictions List */}
      <div className="space-y-3">
        {predictions.map((pred, index) => {
          const config = riskConfig[pred.risk_level];
          const Icon = config.icon;
          
          return (
            <motion.div
              key={pred.mahasiswa_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              onClick={() => setSelectedStudent(pred)}
              className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {pred.nama.charAt(0)}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-white truncate">
                      {pred.nama}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono">
                      {pred.nim}
                    </p>
                  </div>
                </div>

                {/* Probability & Risk */}
                <div className="flex items-center gap-3">
                  {/* Probability Bar */}
                  <div className="w-24">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-500">Hadir</span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {Math.round(pred.will_attend_probability * 100)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pred.will_attend_probability * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
                      />
                    </div>
                  </div>

                  {/* Risk Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${config.text}`} />
                    <span className={`text-xs font-semibold ${config.text}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700"
              >
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  💡 {pred.recommended_action}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <PredictionDetailModal
            prediction={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

---

## 📊 REAL-TIME ANALYTICS DASHBOARD

### Live Attendance Monitor
```typescript
// resources/js/components/dosen/live-attendance-monitor.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export const LiveAttendanceMonitor = ({ sessionId }: { sessionId: number }) => {
  const [liveStats, setLiveStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    pending_verification: 0,
    last_scan: null as any
  });

  useEffect(() => {
    // Setup Laravel Echo
    const echo = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      forceTLS: true
    });

    // Listen to attendance channel
    echo.channel(`attendance.session.${sessionId}`)
      .listen('AttendanceScanned', (e: any) => {
        setLiveStats(prev => ({
          ...prev,
          total: prev.total + 1,
          present: e.status === 'present' ? prev.present + 1 : prev.present,
          late: e.status === 'late' ? prev.late + 1 : prev.late,
          last_scan: e.mahasiswa
        }));

        // Show toast notification
        toast.success(`${e.mahasiswa.nama} telah absen!`);
      });

    return () => {
      echo.leaveChannel(`attendance.session.${sessionId}`);
    };
  }, [sessionId]);

  return (
    <motion.div className="grid grid-cols-4 gap-4">
      {/* Live counters with real-time updates */}
      <LiveCounter
        label="Total Scan"
        value={liveStats.total}
        icon={Users}
        color="blue"
      />
      <LiveCounter
        label="Hadir"
        value={liveStats.present}
        icon={CheckCircle}
        color="green"
      />
      <LiveCounter
        label="Terlambat"
        value={liveStats.late}
        icon={Clock}
        color="orange"
      />
      <LiveCounter
        label="Verifikasi"
        value={liveStats.pending_verification}
        icon={Eye}
        color="purple"
      />
    </motion.div>
  );
};
```

---

**Document Version:** 3.0.0  
**Last Updated:** 18 Februari 2026  
**Focus:** Advanced AI & Real-time Features  
**Status:** Implementation Ready

/**
 * Simple Streak Calendar Component
 * Simplified calendar with dot indicators for streak status
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import type { DailyCompletion } from '../types/streaks';

interface Props {
  streakHistory: DailyCompletion[];
  onDayPress?: (date: string) => void;
}

export const SimpleStreakCalendar: React.FC<Props> = ({
  streakHistory,
  onDayPress,
}) => {
  const markedDates = useMemo(() => {
    if (!streakHistory || streakHistory.length === 0) {
      return {};
    }

    const marks: Record<string, any> = {};

    streakHistory.forEach((day) => {
      try {
        const dayDate = parseISO(day.date);
        const dateStr = format(dayDate, 'yyyy-MM-dd');

        let dotColor = '#6B7280'; // Grey

        if (day.allExercisesCompleted) {
          dotColor = '#10B981'; // Green - maintained
        } else if (day.streakStatus === 'broken') {
          dotColor = '#EF4444'; // Red - broken
        }

        marks[dateStr] = {
          marked: true,
          dotColor,
        };
      } catch (error) {
        console.error('[CALENDAR] Error processing date:', day.date, error);
      }
    });

    return marks;
  }, [streakHistory]);

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => onDayPress?.(day.dateString)}
        theme={{
          calendarBackground: '#1F2937',
          textSectionTitleColor: '#9CA3AF',
          todayTextColor: '#3B82F6',
          dayTextColor: '#D1D5DB',
          textDisabledColor: '#4B5563',
          monthTextColor: '#FFFFFF',
        }}
      />
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>🔥 Maintained 🚀 ❌ Broken 😐 No Activity</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginVertical: 16,
  },
  legend: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
  },
});


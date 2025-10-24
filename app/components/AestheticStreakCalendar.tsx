/**
 * Aesthetic Streak Calendar Component
 * Premium calendar with strikethrough visualization for streak status
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, parseISO, startOfDay } from 'date-fns';
import type { DailyCompletion } from '../types/streaks';

interface Props {
  streakHistory: DailyCompletion[];
  onDayPress?: (date: string) => void;
}

export const AestheticStreakCalendar: React.FC<Props> = ({
  streakHistory,
  onDayPress,
}) => {
  console.log('[CALENDAR] AestheticStreakCalendar rendering');

  const markedDates = useMemo(() => {
    console.log('[CALENDAR] getMarkedDates called');
    
    const today = new Date();
    const localToday = startOfDay(today);
    
    console.log('[CALENDAR] Today (UTC):', today.toISOString());
    console.log('[CALENDAR] Today (Local):', localToday.toISOString());
    console.log('[CALENDAR] Streak history dates:', streakHistory?.map(h => h.date));

    if (!streakHistory || streakHistory.length === 0) {
      console.log('[CALENDAR] No streak history provided');
      return {};
    }

    const marks: Record<string, any> = {};

    streakHistory.forEach((day) => {
      try {
        const dayDate = parseISO(day.date);
        const dateStr = format(dayDate, 'yyyy-MM-dd');

        let color = '#6B7280'; // Grey for no activity
        let textColor = '#FFFFFF';

        if (day.allExercisesCompleted) {
          color = '#10B981'; // Green for 100% completion
          textColor = '#FFFFFF';
        } else if (day.totalCompleted > 0) {
          color = '#F59E0B'; // Yellow for partial completion
          textColor = '#000000';
        } else if (day.streakStatus === 'broken') {
          color = '#EF4444'; // Red for broken streak
          textColor = '#FFFFFF';
        }

        marks[dateStr] = {
          selected: true,
          selectedColor: color,
          selectedTextColor: textColor,
          marked: day.totalCompleted > 0,
          dotColor: color,
          customStyles: {
            container: {
              backgroundColor: color,
              borderRadius: 8,
            },
            text: {
              color: textColor,
              fontWeight: day.allExercisesCompleted ? 'bold' : 'normal',
              textDecorationLine: day.totalCompleted > 0 ? 'line-through' : 'none',
              textDecorationStyle: 'solid',
              textDecorationColor: textColor,
            },
          },
        };

        console.log(`[CALENDAR] Marked ${dateStr}:`, marks[dateStr]);
      } catch (error) {
        console.error('[CALENDAR] Error processing date:', day.date, error);
      }
    });

    console.log('[CALENDAR] Total marked dates:', Object.keys(marks).length);
    return marks;
  }, [streakHistory]);

  return (
    <View style={styles.container}>
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        onDayPress={(day) => {
          console.log('[CALENDAR] Day pressed:', day.dateString);
          onDayPress?.(day.dateString);
        }}
        theme={{
          calendarBackground: '#1F2937',
          textSectionTitleColor: '#9CA3AF',
          selectedDayBackgroundColor: '#3B82F6',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#3B82F6',
          dayTextColor: '#D1D5DB',
          textDisabledColor: '#4B5563',
          monthTextColor: '#FFFFFF',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
      />
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>100% Complete (Streak Maintained)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Partial Completion</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Streak Broken</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
          <Text style={styles.legendText}>No Activity</Text>
        </View>
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
    marginTop: 16,
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});


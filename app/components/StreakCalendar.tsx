/**
 * Main Streak Calendar Component
 * Calendar with custom day components and emoji overlays
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, parseISO, isToday, isBefore } from 'date-fns';
import type { DailyCompletion } from '../types/streaks';

interface Props {
  streakHistory: DailyCompletion[];
  onDayPress?: (date: string) => void;
}

export const StreakCalendar: React.FC<Props> = ({
  streakHistory,
  onDayPress,
}) => {
  const markedDates = useMemo(() => {
    if (!streakHistory || streakHistory.length === 0) {
      return {};
    }

    const marks: Record<string, any> = {};
    const historyMap = new Map(
      streakHistory.map(day => [day.date, day])
    );

    streakHistory.forEach((day) => {
      try {
        const dayDate = parseISO(day.date);
        const dateStr = format(dayDate, 'yyyy-MM-dd');
        
        let emoji = '';
        let color = '#374151';

        if (day.allExercisesCompleted) {
          emoji = '🔥';
          color = '#10B981';
        } else if (day.streakStatus === 'broken') {
          emoji = '❌';
          color = '#EF4444';
        } else if (day.totalCompleted > 0) {
          emoji = '⚡';
          color = '#F59E0B';
        } else {
          emoji = '😐';
          color = '#6B7280';
        }

        marks[dateStr] = {
          customStyles: {
            container: {
              backgroundColor: color,
              borderRadius: 8,
            },
            text: {
              color: '#FFFFFF',
              fontWeight: 'bold',
            },
          },
          emoji,
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
        markingType="custom"
        markedDates={markedDates}
        onDayPress={(day) => onDayPress?.(day.dateString)}
        dayComponent={({ date, state, marking }: any) => {
          const isDisabled = state === 'disabled';
          const isSelected = marking?.customStyles;
          
          return (
            <View style={styles.dayContainer}>
              <View
                style={[
                  styles.day,
                  isSelected && marking.customStyles.container,
                  isDisabled && styles.disabledDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && marking.customStyles.text,
                    isDisabled && styles.disabledText,
                  ]}
                >
                  {date?.day}
                </Text>
                {marking?.emoji && (
                  <Text style={styles.emoji}>{marking.emoji}</Text>
                )}
              </View>
            </View>
          );
        }}
        theme={{
          calendarBackground: '#1F2937',
          textSectionTitleColor: '#9CA3AF',
          monthTextColor: '#FFFFFF',
        }}
      />
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
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  emoji: {
    position: 'absolute',
    fontSize: 10,
    bottom: 2,
    right: 2,
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledText: {
    color: '#6B7280',
  },
});


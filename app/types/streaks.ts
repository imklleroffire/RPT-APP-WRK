/**
 * Streak System Type Definitions
 * Part of the comprehensive streak tracking system
 */

/**
 * Represents a single completed exercise
 */
export interface CompletedExercise {
  exerciseId: string;
  exerciseName: string;
  bundleId: string;
  bundleName: string;
  completedAt: Date;
  completed: boolean;
}

/**
 * Represents daily completion data with streak status
 */
export interface DailyCompletion {
  date: string; // YYYY-MM-DD format
  exercises: CompletedExercise[];
  totalAssigned: number;
  totalCompleted: number;
  completionRate: number; // 0-100
  streakStatus: 'maintained' | 'started' | 'broken' | 'none';
  allExercisesCompleted: boolean;
}

/**
 * Main streak data structure stored in Firestore
 */
export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  totalDaysActive: number;
  totalExercisesCompleted: number;
  averageCompletionRate: number;
  streakHistory: DailyCompletion[];
  lastUpdated: Date;
}

/**
 * Extended statistics for streak analysis
 */
export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  totalExercisesCompleted: number;
  averageCompletionRate: number;
  lastActivityDate: Date | null;
  streakStartDate: Date | null;
  daysUntilNextMilestone: number;
  nextMilestone: number;
}

/**
 * Achievement system for gamification
 */
export interface StreakAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  progress: number; // 0-100
  requirement: number;
}

/**
 * Calendar marking data for react-native-calendars
 */
export interface CalendarMarking {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dotColor?: string;
  customStyles?: {
    container?: any;
    text?: any;
  };
}


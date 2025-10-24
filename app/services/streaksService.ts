/**
 * Streaks Service - Complete Streak Calculation and Management Engine
 * Handles all streak-related operations including calculation, storage, and real-time updates
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { format, parseISO, startOfDay, differenceInDays, addDays } from 'date-fns';
import type { StreakData, DailyCompletion, CompletedExercise } from '../types/streaks';

/**
 * Singleton service for managing streaks
 */
class StreaksService {
  private static instance: StreaksService;
  private updateQueue: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  public static getInstance(): StreaksService {
    if (!StreaksService.instance) {
      StreaksService.instance = new StreaksService();
    }
    return StreaksService.instance;
  }

  /**
   * Initialize streak data for a new user
   */
  async initializeStreakData(userId: string): Promise<void> {
    console.log('[STREAKS] Initializing streak data for user:', userId);
    
    try {
      const streakRef = doc(db, 'streaks', userId);
      const streakDoc = await getDoc(streakRef);

      if (!streakDoc.exists()) {
        const initialData: Partial<StreakData> = {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          totalDaysActive: 0,
          totalExercisesCompleted: 0,
          averageCompletionRate: 0,
          streakHistory: [],
          lastUpdated: new Date(),
        };

        await setDoc(streakRef, {
          ...initialData,
          lastUpdated: Timestamp.now(),
        });
      }

      // Initialize completedExercises document
      const completedRef = doc(db, 'completedExercises', userId);
      const completedDoc = await getDoc(completedRef);

      if (!completedDoc.exists()) {
        await setDoc(completedRef, {
          userId,
          lastCompletedDate: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      console.log('[STREAKS] Initialization complete');
    } catch (error) {
      console.error('[STREAKS] Error initializing:', error);
      throw error;
    }
  }

  /**
   * Get all exercises assigned to a user
   */
  async getAssignedExercises(userId: string): Promise<any[]> {
    try {
      const bundlesQuery = query(
        collection(db, 'assignedBundles'),
        where('patientId', '==', userId)
      );

      const snapshot = await getDocs(bundlesQuery);
      const exercises: any[] = [];

      snapshot.forEach((doc) => {
        const bundle = doc.data();
        if (bundle.exercises && Array.isArray(bundle.exercises)) {
          bundle.exercises.forEach((exercise: any) => {
            exercises.push({
              ...exercise,
              bundleId: doc.id,
              bundleName: bundle.name || 'Unnamed Bundle',
            });
          });
        }
      });

      return exercises;
    } catch (error) {
      console.error('[STREAKS] Error getting assigned exercises:', error);
      return [];
    }
  }

  /**
   * Get completed exercises for a specific date
   */
  async getCompletedExercisesForDate(userId: string, date: Date): Promise<CompletedExercise[]> {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const completedRef = doc(db, 'completedExercises', userId);
      const completedDoc = await getDoc(completedRef);

      if (!completedDoc.exists()) {
        return [];
      }

      const data = completedDoc.data();
      const exercisesForDate = data[dateStr];

      if (!exercisesForDate || !Array.isArray(exercisesForDate)) {
        return [];
      }

      return exercisesForDate.map((ex: any) => ({
        ...ex,
        completedAt: this.safeParseDate(ex.completedAt),
      }));
    } catch (error) {
      console.error('[STREAKS] Error getting completed exercises:', error);
      return [];
    }
  }

  /**
   * Update completed exercises for a date and trigger recalculation
   */
  async updateCompletedExercises(
    userId: string,
    date: Date,
    exercises: CompletedExercise[]
  ): Promise<void> {
    try {
      // Convert to user's local timezone
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      const dateStr = format(localDate, 'yyyy-MM-dd');

      console.log('[STREAKS] Updating exercises for date:', dateStr);

      const completedRef = doc(db, 'completedExercises', userId);
      
      await updateDoc(completedRef, {
        [dateStr]: exercises.map(ex => ({
          ...ex,
          completedAt: Timestamp.fromDate(ex.completedAt),
        })),
        lastCompletedDate: Timestamp.fromDate(date),
        updatedAt: Timestamp.now(),
      });

      // Queue streak recalculation
      this.queueStreakUpdate(userId);
    } catch (error) {
      console.error('[STREAKS] Error updating completed exercises:', error);
      throw error;
    }
  }

  /**
   * Main streak calculation algorithm
   * Recalculates all streak data from first activity to today
   */
  async recalculateAllStreakData(userId: string): Promise<void> {
    console.log('[STREAKS] Starting full recalculation for user:', userId);

    try {
      // Get all assigned exercises
      const assignedExercises = await this.getAssignedExercises(userId);
      console.log('[STREAKS] Found assigned exercises:', assignedExercises.length);

      if (assignedExercises.length === 0) {
        console.log('[STREAKS] No assigned exercises, resetting streak data');
        await this.resetStreakData(userId);
        return;
      }

      // Get completed exercises data
      const completedRef = doc(db, 'completedExercises', userId);
      const completedDoc = await getDoc(completedRef);

      if (!completedDoc.exists()) {
        console.log('[STREAKS] No completed data found');
        await this.resetStreakData(userId);
        return;
      }

      const completedData = completedDoc.data();
      
      // Find date range
      const dateKeys = Object.keys(completedData).filter(key => 
        key.match(/^\d{4}-\d{2}-\d{2}$/)
      );

      if (dateKeys.length === 0) {
        console.log('[STREAKS] No activity dates found');
        await this.resetStreakData(userId);
        return;
      }

      const sortedDates = dateKeys.sort();
      const firstDate = parseISO(sortedDates[0]);
      const today = startOfDay(new Date());

      console.log('[STREAKS] Date range:', format(firstDate, 'yyyy-MM-dd'), 'to', format(today, 'yyyy-MM-dd'));

      // Build complete timeline
      const streakHistory: DailyCompletion[] = [];
      let currentStreak = 0;
      let longestStreak = 0;
      let totalDaysActive = 0;
      let totalExercisesCompleted = 0;
      let previousDayComplete = false;

      let currentDate = firstDate;
      while (currentDate <= today) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const completedForDate = completedData[dateStr] || [];

        const totalAssigned = assignedExercises.length;
        const totalCompleted = completedForDate.length;
        const completionRate = totalAssigned > 0 
          ? Math.round((totalCompleted / totalAssigned) * 100) 
          : 0;
        const allExercisesCompleted = totalCompleted > 0 && totalCompleted >= totalAssigned;

        // Determine streak status
        let streakStatus: 'maintained' | 'started' | 'broken' | 'none' = 'none';

        if (allExercisesCompleted) {
          if (previousDayComplete) {
            streakStatus = 'maintained';
            currentStreak++;
          } else {
            streakStatus = 'started';
            currentStreak = 1;
          }
          previousDayComplete = true;
          totalDaysActive++;
          totalExercisesCompleted += totalCompleted;
        } else {
          if (previousDayComplete && totalCompleted === 0) {
            streakStatus = 'broken';
          }
          previousDayComplete = false;
          currentStreak = 0;
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }

        streakHistory.push({
          date: dateStr,
          exercises: completedForDate.map((ex: any) => ({
            ...ex,
            completedAt: this.safeParseDate(ex.completedAt),
          })),
          totalAssigned,
          totalCompleted,
          completionRate,
          streakStatus,
          allExercisesCompleted,
        });

        currentDate = addDays(currentDate, 1);
      }

      // Calculate average completion rate
      const activeDays = streakHistory.filter(h => h.totalCompleted > 0);
      const averageCompletionRate = activeDays.length > 0
        ? Math.round(activeDays.reduce((sum, h) => sum + h.completionRate, 0) / activeDays.length)
        : 0;

      // Find last activity date
      const lastActivityEntry = streakHistory.reverse().find(h => h.totalCompleted > 0);
      const lastActivityDate = lastActivityEntry ? parseISO(lastActivityEntry.date) : null;

      // Save to Firestore
      const streakRef = doc(db, 'streaks', userId);
      await setDoc(streakRef, {
        userId,
        currentStreak,
        longestStreak,
        lastActivityDate: lastActivityDate ? Timestamp.fromDate(lastActivityDate) : null,
        totalDaysActive,
        totalExercisesCompleted,
        averageCompletionRate,
        streakHistory: streakHistory.reverse(), // Back to chronological order
        lastUpdated: Timestamp.now(),
      });

      console.log('[STREAKS] Recalculation complete:', {
        currentStreak,
        longestStreak,
        totalDaysActive,
        averageCompletionRate,
      });
    } catch (error) {
      console.error('[STREAKS] Error in recalculation:', error);
      throw error;
    }
  }

  /**
   * Reset streak data to initial state
   */
  private async resetStreakData(userId: string): Promise<void> {
    const streakRef = doc(db, 'streaks', userId);
    await setDoc(streakRef, {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      totalDaysActive: 0,
      totalExercisesCompleted: 0,
      averageCompletionRate: 0,
      streakHistory: [],
      lastUpdated: Timestamp.now(),
    });
  }

  /**
   * Get streak data for a user
   */
  async getStreakData(userId: string): Promise<StreakData | null> {
    try {
      const streakRef = doc(db, 'streaks', userId);
      const streakDoc = await getDoc(streakRef);

      if (!streakDoc.exists()) {
        return null;
      }

      const data = streakDoc.data();
      
      return {
        userId: data.userId,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        lastActivityDate: this.safeParseDate(data.lastActivityDate),
        totalDaysActive: data.totalDaysActive || 0,
        totalExercisesCompleted: data.totalExercisesCompleted || 0,
        averageCompletionRate: data.averageCompletionRate || 0,
        streakHistory: (data.streakHistory || []).map((h: any) => ({
          ...h,
          exercises: (h.exercises || []).map((ex: any) => ({
            ...ex,
            completedAt: this.safeParseDate(ex.completedAt),
          })),
        })),
        lastUpdated: this.safeParseDate(data.lastUpdated),
      };
    } catch (error) {
      console.error('[STREAKS] Error getting streak data:', error);
      return null;
    }
  }

  /**
   * Listen to real-time streak data changes
   */
  listenToStreakData(
    userId: string,
    callback: (data: StreakData | null) => void
  ): () => void {
    const streakRef = doc(db, 'streaks', userId);

    const unsubscribe = onSnapshot(streakRef, (doc) => {
      if (!doc.exists()) {
        callback(null);
        return;
      }

      const data = doc.data();
      
      const streakData: StreakData = {
        userId: data.userId,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        lastActivityDate: this.safeParseDate(data.lastActivityDate),
        totalDaysActive: data.totalDaysActive || 0,
        totalExercisesCompleted: data.totalExercisesCompleted || 0,
        averageCompletionRate: data.averageCompletionRate || 0,
        streakHistory: (data.streakHistory || []).map((h: any) => ({
          ...h,
          exercises: (h.exercises || []).map((ex: any) => ({
            ...ex,
            completedAt: this.safeParseDate(ex.completedAt),
          })),
        })),
        lastUpdated: this.safeParseDate(data.lastUpdated),
      };

      callback(streakData);
    }, (error) => {
      console.error('[STREAKS] Error in listener:', error);
      callback(null);
    });

    return unsubscribe;
  }

  /**
   * Queue a streak update with debouncing to prevent spam
   */
  private queueStreakUpdate(userId: string): void {
    // Cancel existing timeout
    const existingTimeout = this.updateQueue.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Queue new update
    const timeout = setTimeout(() => {
      this.recalculateAllStreakData(userId);
      this.updateQueue.delete(userId);
    }, 2000); // 2 second delay

    this.updateQueue.set(userId, timeout);
  }

  /**
   * Safely parse various date formats from Firestore
   */
  private safeParseDate(timestamp: any): Date {
    if (!timestamp) return new Date();
    
    // Firestore Timestamp with toDate method
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // Firestore Timestamp with seconds
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    
    // String date
    if (timestamp && typeof timestamp === 'string') {
      const parsed = new Date(timestamp);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    // Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    return new Date();
  }
}

// Export singleton instance
export const streaksService = StreaksService.getInstance();


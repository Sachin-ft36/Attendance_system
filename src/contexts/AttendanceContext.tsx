
import React, { createContext, useContext, useState } from 'react';
import { useToast } from '@/components/ui/sonner';
import { AttendanceRecord, GeoLocation, AbsenceRequest, AttendanceFilter } from '@/types/attendance';
import { useAuth } from './AuthContext';

interface AttendanceContextType {
  isLoading: boolean;
  error: string | null;
  todayAttendance: AttendanceRecord | null;
  markAttendance: () => Promise<void>;
  submitAbsence: (date: string, reason: string) => Promise<void>;
  checkAttendanceStatus: () => Promise<{ canMarkAttendance: boolean; message: string }>;
  getUserAttendance: (userId: string, filter?: AttendanceFilter) => Promise<AttendanceRecord[]>;
  getAllAttendance: (filter?: AttendanceFilter) => Promise<AttendanceRecord[]>;
  getUserLocation: () => Promise<GeoLocation>;
  isWithinCutoffTime: () => boolean;
}

// Mock attendance data for demo purposes
const generateMockAttendance = (): AttendanceRecord[] => {
  const mockAttendance: AttendanceRecord[] = [];
  const users = ['1', '2', '3'];
  
  // Generate for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    for (const userId of users) {
      const isPresentProb = Math.random();
      const status = isPresentProb > 0.8 ? 'absent' : isPresentProb > 0.6 ? 'late' : 'present';
      
      const checkInTime = status !== 'absent' 
        ? new Date(date.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))).toISOString()
        : null;
        
      const checkOutTime = checkInTime 
        ? new Date(date.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))).toISOString()
        : null;
      
      mockAttendance.push({
        id: `att-${userId}-${dateStr}`,
        userId,
        date: dateStr,
        checkInTime,
        checkOutTime,
        checkInLocation: checkInTime ? { latitude: 40.7128 + (Math.random() - 0.5) / 100, longitude: -74.0060 + (Math.random() - 0.5) / 100 } : null,
        checkOutLocation: checkOutTime ? { latitude: 40.7128 + (Math.random() - 0.5) / 100, longitude: -74.0060 + (Math.random() - 0.5) / 100 } : null,
        status,
        absenceReason: status === 'absent' ? ['Sick leave', 'Family emergency', 'Personal day'][Math.floor(Math.random() * 3)] : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  
  return mockAttendance;
};

const mockAttendanceData = generateMockAttendance();

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const { user } = useAuth();
  const toast = useToast();

  // Check if the current time is before 10 AM (cutoff time)
  const isWithinCutoffTime = (): boolean => {
    const now = new Date();
    const cutoffHour = 10;
    return now.getHours() < cutoffHour;
  };

  // Get user's current location
  const getUserLocation = async (): Promise<GeoLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(new Error(`Unable to get location: ${error.message}`));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Check if the user can mark attendance today
  const checkAttendanceStatus = async (): Promise<{ canMarkAttendance: boolean; message: string }> => {
    if (!user) {
      return { canMarkAttendance: false, message: 'You must be logged in to mark attendance' };
    }

    // Check if it's past the cutoff time
    if (!isWithinCutoffTime()) {
      return { canMarkAttendance: false, message: 'Attendance can only be marked before 10:00 AM' };
    }

    // Check if attendance is already marked for today
    const today = new Date().toISOString().split('T')[0];
    const attendance = mockAttendanceData.find(a => a.userId === user.id && a.date === today);

    if (attendance && attendance.checkInTime) {
      return { canMarkAttendance: false, message: 'You have already marked your attendance today' };
    }

    return { canMarkAttendance: true, message: 'You can mark your attendance now' };
  };

  // Mark attendance for the current user
  const markAttendance = async (): Promise<void> => {
    if (!user) {
      setError('You must be logged in to mark attendance');
      toast.error('You must be logged in to mark attendance');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if within cutoff time
      if (!isWithinCutoffTime()) {
        throw new Error('Attendance can only be marked before 10:00 AM');
      }

      // Get user location
      const location = await getUserLocation();

      // Create a new attendance record
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Check if attendance already exists for today
      const existingAttendance = mockAttendanceData.find(a => a.userId === user.id && a.date === today);
      
      if (existingAttendance && existingAttendance.checkInTime) {
        throw new Error('You have already marked your attendance today');
      }

      const newAttendance: AttendanceRecord = {
        id: `att-${user.id}-${today}`,
        userId: user.id,
        date: today,
        checkInTime: now.toISOString(),
        checkOutTime: null,
        checkInLocation: location,
        checkOutLocation: null,
        status: now.getHours() >= 9 ? 'late' : 'present',
        absenceReason: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      // In a real app, this would make an API call
      // For demo, we'll update our state
      mockAttendanceData.push(newAttendance);
      setTodayAttendance(newAttendance);
      
      toast.success('Attendance marked successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark attendance';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit absence reason
  const submitAbsence = async (date: string, reason: string): Promise<void> => {
    if (!user) {
      setError('You must be logged in to submit an absence');
      toast.error('You must be logged in to submit an absence');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create or update an attendance record for the absence
      const existingIndex = mockAttendanceData.findIndex(a => a.userId === user.id && a.date === date);
      const now = new Date().toISOString();
      
      if (existingIndex >= 0) {
        // Update existing record
        mockAttendanceData[existingIndex] = {
          ...mockAttendanceData[existingIndex],
          status: 'absent',
          absenceReason: reason,
          updatedAt: now,
        };
      } else {
        // Create new record
        const newAbsence: AttendanceRecord = {
          id: `att-${user.id}-${date}`,
          userId: user.id,
          date,
          checkInTime: null,
          checkOutTime: null,
          checkInLocation: null,
          checkOutLocation: null,
          status: 'absent',
          absenceReason: reason,
          createdAt: now,
          updatedAt: now,
        };
        
        mockAttendanceData.push(newAbsence);
      }
      
      // If it's today, update today's attendance
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        const updatedAttendance = mockAttendanceData.find(a => a.userId === user.id && a.date === date);
        if (updatedAttendance) {
          setTodayAttendance(updatedAttendance);
        }
      }
      
      toast.success('Absence reported successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit absence';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get attendance records for a specific user
  const getUserAttendance = async (userId: string, filter?: AttendanceFilter): Promise<AttendanceRecord[]> => {
    // Implement filtering logic
    let filteredAttendance = mockAttendanceData.filter(a => a.userId === userId);
    
    if (filter) {
      if (filter.startDate) {
        filteredAttendance = filteredAttendance.filter(a => a.date >= filter.startDate!);
      }
      if (filter.endDate) {
        filteredAttendance = filteredAttendance.filter(a => a.date <= filter.endDate!);
      }
      if (filter.status) {
        filteredAttendance = filteredAttendance.filter(a => a.status === filter.status);
      }
    }
    
    return filteredAttendance;
  };

  // Get all attendance records (admin only)
  const getAllAttendance = async (filter?: AttendanceFilter): Promise<AttendanceRecord[]> => {
    let filteredAttendance = [...mockAttendanceData];
    
    if (filter) {
      if (filter.startDate) {
        filteredAttendance = filteredAttendance.filter(a => a.date >= filter.startDate!);
      }
      if (filter.endDate) {
        filteredAttendance = filteredAttendance.filter(a => a.date <= filter.endDate!);
      }
      if (filter.status) {
        filteredAttendance = filteredAttendance.filter(a => a.status === filter.status);
      }
      if (filter.userId) {
        filteredAttendance = filteredAttendance.filter(a => a.userId === filter.userId);
      }
      if (filter.department) {
        // In a real app, this would filter by department
        // For the mock, we can't implement this without user department data
      }
    }
    
    return filteredAttendance;
  };

  const value = {
    isLoading,
    error,
    todayAttendance,
    markAttendance,
    submitAbsence,
    checkAttendanceStatus,
    getUserAttendance,
    getAllAttendance,
    getUserLocation,
    isWithinCutoffTime,
  };

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

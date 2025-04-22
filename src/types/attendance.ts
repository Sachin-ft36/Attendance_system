
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // ISO date string
  checkInTime: string | null; // ISO datetime string
  checkOutTime: string | null; // ISO datetime string
  checkInLocation: GeoLocation | null;
  checkOutLocation: GeoLocation | null;
  status: 'present' | 'absent' | 'late' | 'pending';
  absenceReason: string | null;
  isApproved?: boolean;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
  attendanceRate: number;
}

export interface AbsenceRequest {
  id: string;
  userId: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  userId?: string;
  department?: string;
}

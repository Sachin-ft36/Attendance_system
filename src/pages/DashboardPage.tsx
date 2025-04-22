
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/contexts/AttendanceContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    markAttendance, 
    submitAbsence, 
    checkAttendanceStatus, 
    getUserAttendance,
    todayAttendance,
    isLoading 
  } = useAttendance();
  
  const [canMarkAttendance, setCanMarkAttendance] = useState(false);
  const [attendanceStatusMessage, setAttendanceStatusMessage] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [absenceDate, setAbsenceDate] = useState<Date | undefined>(new Date());
  const [absenceReason, setAbsenceReason] = useState('');
  const [isSubmittingAbsence, setIsSubmittingAbsence] = useState(false);
  
  // Check if the user can mark attendance
  useEffect(() => {
    const checkStatus = async () => {
      const { canMarkAttendance: canMark, message } = await checkAttendanceStatus();
      setCanMarkAttendance(canMark);
      setAttendanceStatusMessage(message);
    };
    
    checkStatus();
    
    // Refresh every minute to update status
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [checkAttendanceStatus, todayAttendance]);
  
  // Load attendance history
  useEffect(() => {
    const loadAttendanceHistory = async () => {
      if (user) {
        const history = await getUserAttendance(user.id);
        setAttendanceHistory(history);
      }
    };
    
    loadAttendanceHistory();
  }, [user, getUserAttendance, todayAttendance]);
  
  const handleMarkAttendance = async () => {
    try {
      await markAttendance();
      toast.success('Attendance marked successfully');
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };
  
  const handleSubmitAbsence = async () => {
    if (!absenceDate) {
      toast.error('Please select a date');
      return;
    }
    
    if (!absenceReason.trim()) {
      toast.error('Please provide a reason for your absence');
      return;
    }
    
    setIsSubmittingAbsence(true);
    
    try {
      const dateStr = format(absenceDate, 'yyyy-MM-dd');
      await submitAbsence(dateStr, absenceReason);
      toast.success('Absence reported successfully');
      setAbsenceReason('');
    } catch (error) {
      console.error('Failed to submit absence:', error);
      toast.error('Failed to submit absence');
    } finally {
      setIsSubmittingAbsence(false);
    }
  };
  
  // Group attendance records by month
  const groupedAttendance = attendanceHistory.reduce((groups, record) => {
    const date = new Date(record.date);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[month]) {
      groups[month] = [];
    }
    
    groups[month].push(record);
    return groups;
  }, {} as Record<string, any[]>);
  
  // Sort months in reverse chronological order
  const sortedMonths = Object.keys(groupedAttendance).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Attendance Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {user?.firstName}!</CardTitle>
                <CardDescription>
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Department: {user?.department || 'Not specified'}</p>
                  <p>Position: {user?.position || 'Not specified'}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium mb-1">Today's Status</div>
                    {todayAttendance ? (
                      <div className={cn(
                        "flex items-center text-sm font-medium",
                        todayAttendance.status === 'present' ? "text-success" :
                        todayAttendance.status === 'late' ? "text-warning" :
                        "text-muted-foreground"
                      )}>
                        {todayAttendance.status === 'present' ? (
                          <Check className="mr-1 h-4 w-4" />
                        ) : todayAttendance.status === 'late' ? (
                          <CalendarIcon className="mr-1 h-4 w-4" />
                        ) : (
                          <X className="mr-1 h-4 w-4" />
                        )}
                        {todayAttendance.status === 'present' ? 'Present' :
                         todayAttendance.status === 'late' ? 'Present (Late)' :
                         todayAttendance.status === 'absent' ? 'Absent' : 'Not Marked'}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Attendance not marked yet
                      </div>
                    )}
                  </div>
                  
                  {todayAttendance?.checkInTime && (
                    <div className="flex flex-col">
                      <div className="text-sm font-medium mb-1">Check-in Time</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(todayAttendance.checkInTime), 'h:mm a')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleMarkAttendance}
                  disabled={!canMarkAttendance || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : 'Mark Attendance'}
                </Button>
              </CardFooter>
              {!canMarkAttendance && attendanceStatusMessage && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground">{attendanceStatusMessage}</p>
                </div>
              )}
            </Card>
            
            {/* Report Absence Card */}
            <Card>
              <CardHeader>
                <CardTitle>Report Absence</CardTitle>
                <CardDescription>
                  Let your manager know if you'll be absent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="absence-date">Date of Absence</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !absenceDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {absenceDate ? format(absenceDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={absenceDate}
                        onSelect={setAbsenceDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="absence-reason">Reason for Absence</Label>
                  <Textarea
                    id="absence-reason"
                    placeholder="Please provide a reason for your absence..."
                    value={absenceReason}
                    onChange={(e) => setAbsenceReason(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSubmitAbsence}
                  disabled={isSubmittingAbsence || !absenceReason.trim() || !absenceDate}
                  className="w-full"
                >
                  {isSubmittingAbsence ? 'Submitting...' : 'Submit Absence'}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right column - Attendance History */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>
                  Your past attendance records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="history" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="history" className="space-y-6">
                    {sortedMonths.length > 0 ? (
                      sortedMonths.map((month) => (
                        <div key={month} className="space-y-3">
                          <h3 className="text-md font-medium">{month}</h3>
                          <div className="space-y-2">
                            {groupedAttendance[month].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => (
                              <div key={record.id} className="bg-white border rounded-md p-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {format(new Date(record.date), 'EEEE, MMMM d')}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {record.checkInTime 
                                        ? `Checked in at ${format(new Date(record.checkInTime), 'h:mm a')}` 
                                        : 'No check-in recorded'}
                                    </span>
                                  </div>
                                  <div className={cn(
                                    "text-xs px-2 py-1 rounded-full font-medium",
                                    record.status === 'present' ? "bg-success/20 text-success" :
                                    record.status === 'late' ? "bg-warning/20 text-warning" :
                                    record.status === 'absent' ? "bg-error/20 text-error" :
                                    "bg-slate-100 text-slate-600"
                                  )}>
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </div>
                                </div>
                                
                                {record.absenceReason && (
                                  <div className="mt-2 text-sm bg-slate-50 p-2 rounded">
                                    <span className="font-medium">Reason:</span> {record.absenceReason}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No attendance records found</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="calendar">
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-muted-foreground text-center py-8">
                        Calendar view coming soon
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;


import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Check, Download, Filter, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { AttendanceRecord, AttendanceFilter } from '@/types/attendance';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { getAllAttendance, isLoading } = useAttendance();
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState<AttendanceFilter>({});
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  // Load attendance data
  useEffect(() => {
    const loadAttendanceData = async () => {
      const records = await getAllAttendance();
      setAttendanceRecords(records);
      setFilteredRecords(records);
    };
    
    loadAttendanceData();
  }, [getAllAttendance]);
  
  // Apply filters when they change
  useEffect(() => {
    let filtered = [...attendanceRecords];
    
    // Apply date range filter
    if (filter.startDate) {
      filtered = filtered.filter(record => record.date >= filter.startDate!);
    }
    
    if (filter.endDate) {
      filtered = filtered.filter(record => record.date <= filter.endDate!);
    }
    
    // Apply status filter
    if (filter.status) {
      filtered = filtered.filter(record => record.status === filter.status);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // In a real app, we would search across user details as well
      filtered = filtered.filter(record => 
        record.userId.toLowerCase().includes(query) || 
        record.status.toLowerCase().includes(query) ||
        (record.absenceReason && record.absenceReason.toLowerCase().includes(query))
      );
    }
    
    setFilteredRecords(filtered);
  }, [filter, searchQuery, attendanceRecords]);
  
  // Handle date range selection
  const handleDateRangeSelect = (range: any) => {
    setSelectedDateRange(range);
    
    if (range.from) {
      setFilter({
        ...filter,
        startDate: format(range.from, 'yyyy-MM-dd'),
        ...(range.to ? { endDate: format(range.to, 'yyyy-MM-dd') } : {})
      });
    } else {
      const { startDate, endDate, ...restFilter } = filter;
      setFilter(restFilter);
    }
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (status: string | null) => {
    if (status) {
      setFilter({ ...filter, status });
    } else {
      const { status, ...restFilter } = filter;
      setFilter(restFilter);
    }
  };
  
  // Generate attendance stats
  const stats = {
    total: filteredRecords.length,
    present: filteredRecords.filter(r => r.status === 'present').length,
    late: filteredRecords.filter(r => r.status === 'late').length,
    absent: filteredRecords.filter(r => r.status === 'absent').length,
    attendanceRate: filteredRecords.length > 0 
      ? (filteredRecords.filter(r => ['present', 'late'].includes(r.status)).length / filteredRecords.length) * 100
      : 0
  };
  
  // Download attendance report
  const downloadReport = () => {
    if (filteredRecords.length === 0) {
      toast.error('No data to download');
      return;
    }
    
    try {
      // Convert records to CSV format
      const headers = ['Date', 'User ID', 'Status', 'Check-in Time', 'Check-out Time', 'Absence Reason', 'Location'];
      
      const rows = filteredRecords.map(record => [
        record.date,
        record.userId,
        record.status,
        record.checkInTime ? format(new Date(record.checkInTime), 'h:mm a') : 'N/A',
        record.checkOutTime ? format(new Date(record.checkOutTime), 'h:mm a') : 'N/A',
        record.absenceReason || 'N/A',
        record.checkInLocation 
          ? `${record.checkInLocation.latitude.toFixed(6)}, ${record.checkInLocation.longitude.toFixed(6)}`
          : 'N/A'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create a blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          {/* Page header */}
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage and monitor employee attendance
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={downloadReport}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Records</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Present</CardDescription>
                <CardTitle className="text-3xl text-success">{stats.present}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Late</CardDescription>
                <CardTitle className="text-3xl text-warning">{stats.late}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Absent</CardDescription>
                <CardTitle className="text-3xl text-error">{stats.absent}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          
          {/* Main content */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                View and manage employee attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed View</TabsTrigger>
                  <TabsTrigger value="absences">Absences</TabsTrigger>
                </TabsList>
                
                {/* Filter section */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search records..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDateRange.from ? (
                              selectedDateRange.to ? (
                                <>
                                  {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                                  {format(selectedDateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(selectedDateRange.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={selectedDateRange.from}
                            selected={selectedDateRange}
                            onSelect={handleDateRangeSelect}
                            numberOfMonths={2}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStatusFilterChange(null)}>
                            All
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusFilterChange('present')}>
                            Present
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusFilterChange('late')}>
                            Late
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusFilterChange('absent')}>
                            Absent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {Object.keys(filter).length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Filters:</span>
                      {filter.status && (
                        <div className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs flex items-center">
                          Status: {filter.status}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => handleStatusFilterChange(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {filter.startDate && (
                        <div className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs flex items-center">
                          Date: {filter.startDate}{filter.endDate ? ` to ${filter.endDate}` : ''}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => {
                              setSelectedDateRange({ from: undefined, to: undefined });
                              const { startDate, endDate, ...restFilter } = filter;
                              setFilter(restFilter);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setFilter({});
                          setSelectedDateRange({ from: undefined, to: undefined });
                          setSearchQuery('');
                        }}
                      >
                        Clear all
                      </Button>
                    </div>
                  )}
                </div>
                
                <TabsContent value="overview" className="space-y-4">
                  {filteredRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Check-in</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.slice(0, 10).map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{format(new Date(record.date), 'yyyy-MM-dd')}</TableCell>
                            <TableCell>{record.userId}</TableCell>
                            <TableCell>
                              <div className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                record.status === 'present' ? "bg-success/20 text-success" :
                                record.status === 'late' ? "bg-warning/20 text-warning" :
                                "bg-error/20 text-error"
                              )}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.checkInTime 
                                ? format(new Date(record.checkInTime), 'h:mm a')
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {record.checkInLocation 
                                ? `${record.checkInLocation.latitude.toFixed(4)}, ${record.checkInLocation.longitude.toFixed(4)}`
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No records found</p>
                    </div>
                  )}
                  
                  {filteredRecords.length > 10 && (
                    <div className="flex justify-center">
                      <Button variant="outline" className="mt-4">
                        Load More
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="detailed" className="space-y-4">
                  {filteredRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Check-in</TableHead>
                          <TableHead>Check-out</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Absence Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{format(new Date(record.date), 'yyyy-MM-dd')}</TableCell>
                            <TableCell>{record.userId}</TableCell>
                            <TableCell>
                              <div className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                record.status === 'present' ? "bg-success/20 text-success" :
                                record.status === 'late' ? "bg-warning/20 text-warning" :
                                "bg-error/20 text-error"
                              )}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.checkInTime 
                                ? format(new Date(record.checkInTime), 'h:mm a')
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {record.checkOutTime 
                                ? format(new Date(record.checkOutTime), 'h:mm a')
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {record.checkInLocation 
                                ? `${record.checkInLocation.latitude.toFixed(4)}, ${record.checkInLocation.longitude.toFixed(4)}`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {record.absenceReason || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No records found</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="absences" className="space-y-4">
                  {filteredRecords.filter(r => r.status === 'absent').length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords
                          .filter(r => r.status === 'absent')
                          .map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{format(new Date(record.date), 'yyyy-MM-dd')}</TableCell>
                              <TableCell>{record.userId}</TableCell>
                              <TableCell>{record.absenceReason || 'No reason provided'}</TableCell>
                              <TableCell>{format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No absence records found</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;

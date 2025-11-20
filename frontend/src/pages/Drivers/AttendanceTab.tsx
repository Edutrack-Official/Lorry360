// components/AttendanceTab.tsx
import React, { useEffect, useState } from "react";
import { Calendar, Plus, Filter, Edit, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/client";

interface Attendance {
    _id: string;
    date: string;
    status: 'fullduty' | 'halfduty' | 'absent';
    lorry_id: {
        _id: string;
        registration_number: string;
        nick_name?: string;
    };
}

interface AttendanceTabProps {
    driverId: string;
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ driverId }) => {
    const navigate = useNavigate();
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [calendarView, setCalendarView] = useState<'calendar' | 'list'>('calendar');

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Filters
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        status: 'all'
    });

    useEffect(() => {
        fetchAttendanceData();
    }, [driverId]);

    const fetchAttendanceData = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);
            if (filters.status !== 'all') params.append('status', filters.status);

            const res = await api.get(`/attendance/driver/${driverId}?${params}`);
            setAttendance(res.data.data.attendance || []);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            fullduty: {
                color: 'bg-green-100 text-green-800 border-green-200',
                label: 'Full Duty',
                icon: '✅'
            },
            halfduty: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                label: 'Half Duty',
                icon: '🟡'
            },
            doubleduty: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                label: 'Double Duty',
                icon: '🔵'
            },
            absent: {
                color: 'bg-red-100 text-red-800 border-red-200',
                label: 'Absent',
                icon: '❌'
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.absent;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                <span className="text-xs">{config.icon}</span>
                <span className="hidden sm:inline">{config.label}</span>
                <span className="sm:hidden">{config.label.split(' ')[0]}</span>
            </span>
        );
    };

    const getStatusColor = (status: string) => {
        const colors = {
            fullduty: 'bg-green-500',
            halfduty: 'bg-yellow-500',
            doubleduty: 'bg-blue-500',
            absent: 'bg-red-500'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    // Calendar functions
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const getAttendanceForDate = (date: Date) => {
        return attendance.find(record =>
            new Date(record.date).toDateString() === date.toDateString()
        );
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Previous month days
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const daysInPrevMonth = getDaysInMonth(prevMonth);

        for (let i = firstDay - 1; i >= 0; i--) {
            const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
            days.push(
                <div key={`prev-${i}`} className="h-16 sm:h-20 md:h-24 p-1 border border-gray-200 bg-gray-50">
                    <div className="text-right">
                        <span className="text-gray-400 text-xs sm:text-sm">{date.getDate()}</span>
                    </div>
                </div>
            );
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const attendanceRecord = getAttendanceForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

            days.push(
                <div
                    key={day}
                    className={`h-16 sm:h-20 md:h-24 p-1 border border-gray-200 cursor-pointer transition-all ${
                        isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                    } ${isToday ? 'bg-blue-100' : ''}`}
                    onClick={() => setSelectedDate(date)}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs sm:text-sm font-medium ${
                            isToday ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                            {day}
                        </span>
                        {isToday && (
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full"></span>
                        )}
                    </div>

                    {attendanceRecord && (
                        <div className="space-y-0.5 sm:space-y-1">
                            <div className={`w-full h-1.5 sm:h-2 rounded-full ${getStatusColor(attendanceRecord.status)}`}></div>
                            <div className="text-[10px] sm:text-xs text-gray-600 truncate">
                                {attendanceRecord.lorry_id.registration_number}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Next month days
        const totalCells = 42; // 6 weeks
        const nextMonthDays = totalCells - days.length;
        for (let i = 1; i <= nextMonthDays; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
            days.push(
                <div key={`next-${i}`} className="h-16 sm:h-20 md:h-24 p-1 border border-gray-200 bg-gray-50">
                    <div className="text-right">
                        <span className="text-gray-400 text-xs sm:text-sm">{date.getDate()}</span>
                    </div>
                </div>
            );
        }

        return days;
    };

    const getSelectedDateAttendance = () => {
        if (!selectedDate) return null;
        return attendance.find(record =>
            new Date(record.date).toDateString() === selectedDate.toDateString()
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
            {/* Header */}
            <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Attendance</h2>
                        
                        <button
                            onClick={() => navigate(`/attendance/create?driver=${driverId}`)}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden xs:inline">Add</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1 flex-1 sm:flex-initial">
                            <button
                                onClick={() => setCalendarView('calendar')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex-1 sm:flex-initial ${
                                    calendarView === 'calendar'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Calendar
                            </button>
                            <button
                                onClick={() => setCalendarView('list')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex-1 sm:flex-initial ${
                                    calendarView === 'list'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                List
                            </button>
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            <Filter className="h-4 w-4" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-4 sm:mb-6 overflow-hidden"
                        >
                            <div className="space-y-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Filters</span>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="sm:hidden p-1 hover:bg-gray-200 rounded"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="fullduty">Full Duty</option>
                                        <option value="halfduty">Half Duty</option>
                                        <option value="doubleduty">Double Duty</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={fetchAttendanceData}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFilters({ start_date: '', end_date: '', status: 'all' });
                                            fetchAttendanceData();
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Calendar View */}
                {calendarView === 'calendar' && (
                    <div className="space-y-3 sm:space-y-4">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigateMonth('prev')}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                {currentDate.toLocaleDateString('en-US', { 
                                    month: window.innerWidth < 640 ? 'short' : 'long', 
                                    year: 'numeric' 
                                })}
                            </h3>

                            <button
                                onClick={() => navigateMonth('next')}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                            {/* Weekday Headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                <div key={day} className="bg-gray-50 p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-200">
                                    <span className="hidden xs:inline">{day}</span>
                                    <span className="xs:hidden">{day.charAt(0)}</span>
                                </div>
                            ))}

                            {/* Calendar Days */}
                            {renderCalendar()}
                        </div>

                        {/* Selected Date Details */}
                        {selectedDate && (
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                                    {selectedDate.toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </h4>

                                {getSelectedDateAttendance() ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs sm:text-sm text-gray-600">Status:</span>
                                            {getStatusBadge(getSelectedDateAttendance()!.status)}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    Lorry: <span className="font-medium text-gray-900">{getSelectedDateAttendance()!.lorry_id.registration_number}</span>
                                                    {getSelectedDateAttendance()!.lorry_id.nick_name && 
                                                        <span className="text-gray-500"> ({getSelectedDateAttendance()!.lorry_id.nick_name})</span>
                                                    }
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/attendance/edit/${getSelectedDateAttendance()!._id}`)}
                                                className="ml-2 p-2 text-gray-400 hover:text-blue-600 transition"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-3 sm:py-4">
                                        <p className="text-gray-500 mb-3 text-sm sm:text-base">No attendance record for this date</p>
                                        <button
                                            onClick={() => navigate(`/attendance/create?driver=${driverId}&date=${selectedDate.toISOString().split('T')[0]}`)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Attendance
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Legend */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                                <span>Full Duty</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                                <span>Half Duty</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                <span>Double Duty</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                                <span>Absent</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* List View */}
                {calendarView === 'list' && (
                    <div className="space-y-3 sm:space-y-4">
                        {attendance.length > 0 ? (
                            attendance.map((record) => (
                                <div key={record._id} className="flex items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    weekday: window.innerWidth < 640 ? 'short' : 'long',
                                                    year: 'numeric',
                                                    month: window.innerWidth < 640 ? 'short' : 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                                                Lorry: {record.lorry_id.registration_number}
                                                {record.lorry_id.nick_name && ` (${record.lorry_id.nick_name})`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                        {getStatusBadge(record.status)}
                                        <button
                                            onClick={() => navigate(`/attendance/edit/${record._id}`)}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 sm:py-12 text-gray-500">
                                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                                <p className="text-base sm:text-lg font-medium mb-2">No attendance records</p>
                                <p className="mb-4 sm:mb-6 text-sm sm:text-base px-4">Get started by adding attendance records for this driver</p>
                                <button
                                    onClick={() => navigate(`/attendance/create?driver=${driverId}`)}
                                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                                >
                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Add First Attendance
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceTab;
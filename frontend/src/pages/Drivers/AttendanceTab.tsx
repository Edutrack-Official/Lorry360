// components/AttendanceTab.tsx
import React, { useEffect, useState } from "react";
import { Calendar, Plus, Filter, ChevronLeft, ChevronRight, X, Settings, XCircle, Truck, CircleDot, Circle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/client";

interface Attendance {
    _id: string;
    date: string;
    status: 'fullduty' | 'halfduty' | 'doubleduty' | 'absent' | 'tripduty' | 'custom';
    lorry_id: {
        _id: string;
        registration_number: string;
        nick_name?: string;
    } | null;
    salary_amount?: number;
    no_of_trips?: number;
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
    const [currentDate, setCurrentDate] = useState(new Date());
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
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);
            if (filters.status !== 'all') params.append('status', filters.status);

            const res = await api.get(`/attendance/driver/${driverId}?${params.toString()}`);
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
            icon: CheckCircle2
        },
        halfduty: {
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            label: 'Half Duty',
            icon: Circle
        },
        doubleduty: {
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            label: 'Double Duty',
            icon: CircleDot
        },
        tripduty: {
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            label: 'Trip Duty',
            icon: Truck
        },
        custom: {
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            label: 'Custom',
            icon: Settings
        },
        absent: {
            color: 'bg-red-100 text-red-800 border-red-200',
            label: 'Absent',
            icon: XCircle
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.absent;
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            <IconComponent className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{config.label}</span>
            <span className="sm:hidden">{config.label.split(' ')[0]}</span>
        </span>
    );
};

    const getStatusBackground = (status: string) => {
        const backgrounds = {
            fullduty: 'bg-green-100 border-green-300', // Darker green
            halfduty: 'bg-yellow-100 border-yellow-300', // Darker yellow
            doubleduty: 'bg-blue-100 border-blue-300', // Darker blue
            tripduty: 'bg-purple-100 border-purple-300', // Darker purple
            custom: 'bg-orange-100 border-orange-300', // Darker orange
            absent: 'bg-red-100 border-red-300' // Darker red
        };
        return backgrounds[status as keyof typeof backgrounds] || 'bg-gray-50 border-gray-200';
    };

    const isFutureDate = (date: Date) => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return compareDate > todayStart;
    };

    const isPastOrTodayDate = (date: Date) => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return compareDate <= todayStart;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

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
        return attendance.find(record => {
            const recordDate = new Date(record.date);
            return recordDate.getDate() === date.getDate() &&
                recordDate.getMonth() === date.getMonth() &&
                recordDate.getFullYear() === date.getFullYear();
        });
    };

    const handleDateClick = (date: Date) => {
        if (isFutureDate(date)) {
            toast.error("Cannot add/edit attendance for future dates");
            return;
        }

        const attendanceRecord = getAttendanceForDate(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        if (attendanceRecord) {
            navigate(`/attendance/edit/${attendanceRecord._id}`);
        } else {
            navigate(`/attendance/create?driver=${driverId}&date=${dateString}`);
        }
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
                <div key={`prev-${i}`} className="aspect-square min-h-[4rem] sm:min-h-[5rem] p-2 border border-gray-200 bg-gray-50/50">
                    <span className="block text-right text-gray-400 text-xs sm:text-sm font-medium">{date.getDate()}</span>
                </div>
            );
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const attendanceRecord = getAttendanceForDate(date);
            const isTodayDate = isToday(date);
            const isPastOrToday = isPastOrTodayDate(date);
            const isFuture = isFutureDate(date);

            days.push(
                <div
                    key={day}
                    className={`aspect-square min-h-[4rem] sm:min-h-[5rem] p-2 border transition-all ${isTodayDate
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                        : isFuture
                            ? 'bg-gray-50/50 cursor-not-allowed opacity-50 border-gray-200'
                            : attendanceRecord
                                ? `${getStatusBackground(attendanceRecord.status)} cursor-pointer hover:shadow-md border`
                                : 'bg-white hover:bg-gray-50 cursor-pointer border-gray-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                    onClick={() => !isFuture && handleDateClick(date)}
                >
                    <div className="flex items-start justify-between mb-1.5">
                        <span className={`text-xs sm:text-sm font-semibold ${isTodayDate
                            ? 'text-blue-700'
                            : isFuture
                                ? 'text-gray-400'
                                : attendanceRecord
                                    ? 'text-gray-800'
                                    : 'text-gray-900'
                            }`}>
                            {day}
                        </span>
                        {isTodayDate && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        )}
                    </div>

                    {attendanceRecord ? (
                        <div className="space-y-1">
                            <div className="text-[10px] sm:text-xs text-gray-700 font-medium truncate">
                                {attendanceRecord.lorry_id?.registration_number ||
                                    (attendanceRecord.status === 'absent' ? 'Absent' : 'N/A')}
                            </div>
                            {attendanceRecord.salary_amount !== undefined && (
                                <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                    ₹{attendanceRecord.salary_amount}
                                </div>
                            )}
                        </div>
                    ) : isPastOrToday && !isFuture && (
                        <div className="flex items-center justify-center h-[calc(100%-1.5rem)]">
                            <Plus className="h-4 w-4 text-gray-400 opacity-60" />
                        </div>
                    )}
                </div>
            );
        }

        // Next month days
        const totalCells = 42;
        const nextMonthDays = totalCells - days.length;
        for (let i = 1; i <= nextMonthDays; i++) {
            days.push(
                <div key={`next-${i}`} className="aspect-square min-h-[4rem] sm:min-h-[5rem] p-2 border border-gray-200 bg-gray-50/50">
                    <span className="block text-right text-gray-400 text-xs sm:text-sm font-medium">{i}</span>
                </div>
            );
        }

        return days;
    };

    const applyFilters = () => {
        fetchAttendanceData();
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({ start_date: '', end_date: '', status: 'all' });
        setTimeout(() => fetchAttendanceData(), 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[16rem]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-5 p-3 sm:p-4 md:p-0">
            <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-5 md:p-6">
                <div className="space-y-4 mb-5 sm:mb-6">
                    {/* Title & Action Button */}
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Attendance</h2>
                        <button
                            onClick={() => navigate(`/attendance/create?driver=${driverId}`)}
                            className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            aria-label="Add attendance"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>

                    {/* View Toggle & Filter Button */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex bg-gray-100 rounded-lg p-1 flex-1 sm:flex-initial">
                            <button
                                onClick={() => setCalendarView('calendar')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-initial ${calendarView === 'calendar'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Calendar
                            </button>
                            <button
                                onClick={() => setCalendarView('list')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-initial ${calendarView === 'list'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                List
                            </button>
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${showFilters
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Filter className="h-4 w-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-5 sm:mb-6"
                        >
                            <div className="p-4 sm:p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-700">Filters</span>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="sm:hidden p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                        <input
                                            type="date"
                                            value={filters.start_date}
                                            onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                                        <input
                                            type="date"
                                            value={filters.end_date}
                                            onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="fullduty">Full Duty</option>
                                            <option value="halfduty">Half Duty</option>
                                            <option value="doubleduty">Double Duty</option>
                                            <option value="tripduty">Trip Duty</option>
                                            <option value="custom">Custom</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={applyFilters}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
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
                    <div className="space-y-4">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between gap-2">
                            <button
                                onClick={() => navigateMonth('prev')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Previous month"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>

                            <button
                                onClick={() => navigateMonth('next')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Next month"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="grid grid-cols-7">
                                {/* Weekday Headers */}
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="bg-gray-100 p-2.5 sm:p-3 text-center text-xs sm:text-sm font-bold text-gray-700 border-b border-gray-200">
                                        <span className="hidden xs:inline">{day}</span>
                                        <span className="xs:hidden">{day.charAt(0)}</span>
                                    </div>
                                ))}

                                {/* Calendar Days */}
                                {renderCalendar()}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-gray-200">
                            {[
                                { color: 'bg-green-100 border-green-300', label: 'Full Duty' },
                                { color: 'bg-yellow-100 border-yellow-300', label: 'Half Duty' },
                                { color: 'bg-blue-100 border-blue-300', label: 'Double Duty' },
                                { color: 'bg-purple-100 border-purple-300', label: 'Trip Duty' },
                                { color: 'bg-orange-100 border-orange-300', label: 'Custom' },
                                { color: 'bg-red-100 border-red-300', label: 'Absent' }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded border ${item.color}`}></div>
                                    <span className="text-xs sm:text-sm text-gray-600">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* List View */}
                {calendarView === 'list' && (
                    <div className="space-y-3">
                        {attendance.length > 0 ? (
                            attendance.map((record) => (
                                <div
                                    key={record._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                                    onClick={() => navigate(`/attendance/edit/${record._id}`)}
                                >
                                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                                                Lorry: {record.lorry_id ? (
                                                    <>
                                                        {record.lorry_id.registration_number}
                                                        {record.lorry_id.nick_name && ` (${record.lorry_id.nick_name})`}
                                                    </>
                                                ) : 'Absent'}
                                            </p>
                                            {record.salary_amount !== undefined && (
                                                <p className="text-xs text-gray-500">
                                                    Amount: ₹{record.salary_amount}
                                                    {record.no_of_trips ? ` • ${record.no_of_trips} trips` : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end sm:justify-start flex-shrink-0">
                                        {getStatusBadge(record.status)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 sm:py-12 px-4">
                                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                                <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No attendance records</p>
                                <p className="text-sm sm:text-base text-gray-500 mb-5 sm:mb-6 max-w-md mx-auto">
                                    Get started by adding attendance records for this driver
                                </p>
                                <button
                                    onClick={() => navigate(`/attendance/create?driver=${driverId}`)}
                                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
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
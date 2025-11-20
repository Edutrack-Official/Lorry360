// DriverDetails.tsx (updated)
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Users, Edit, IndianRupee, TrendingUp, Clock, MoreVertical, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/client";
import AttendanceTab from "./AttendanceTab";
import SalaryTab from "./SalaryTab";

interface Driver {
    _id: string;
    name: string;
    phone: string;
    address: string;
    salary_per_duty: number;
    status: "active" | "inactive";
    isActive: boolean;
    createdAt: string;
}

interface Salary {
    _id: string;
    advance_balance: number;
    advance_transactions: Array<any>;
    bonus: Array<any>;
    amountpaid: Array<any>;
}

const DriverDetails = () => {
    const { driverId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [driver, setDriver] = useState<Driver | null>(null);
    const [salary, setSalary] = useState<Salary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [activeTab, setActiveTab] = useState<'attendance' | 'salary'>(
        (searchParams.get('tab') as 'attendance' | 'salary') || 'attendance'
    );

    useEffect(() => {
        if (driverId) {
            fetchDriverData();
            fetchSalaryData();
        }
    }, [driverId]);

    // Update URL when tab changes
    useEffect(() => {
        if (activeTab) {
            const params = new URLSearchParams(searchParams);
            params.set('tab', activeTab);
            navigate(`/drivers/${driverId}?${params.toString()}`, { replace: true });
        }
    }, [activeTab]);

    const fetchDriverData = async () => {
        try {
            const res = await api.get(`/drivers/${driverId}`);
            setDriver(res.data.data);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch driver details");
        }
    };

    const fetchSalaryData = async () => {
        try {
            const res = await api.get(`/salary/driver/${driverId}`);
            setSalary(res.data.data);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to fetch salary data");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateSalaryStats = () => {
        if (!salary) return null;

        const totalBonus = salary.bonus.reduce((sum: number, bonus: any) => sum + bonus.amount, 0);
        const totalPaid = salary.amountpaid.reduce((sum: number, payment: any) => sum + payment.amount, 0);

        return {
            totalBonus,
            totalPaid,
            netEarnings: totalBonus + totalPaid
        };
    };

    const salaryStats = calculateSalaryStats();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!driver) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Driver not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b sticky top-0 z-10">
                <div className="px-3 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => navigate('/drivers')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <MoreVertical className="h-5 w-5" />
                            </button>

                            {showMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowMenu(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                                        <button
                                            onClick={() => {
                                                navigate(`/drivers/edit/${driverId}`);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-lg"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Driver
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg font-bold text-gray-900 truncate">{driver.name}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{driver.phone}</span>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${driver.isActive && driver.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {driver.isActive && driver.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {driver.address && (
                        <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{driver.address}</span>
                        </div>
                    )}
                </div>

                {/* Stats Cards - Mobile */}
                <div className="px-3 pb-3 grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex flex-col items-center text-center">
                            <IndianRupee className="h-5 w-5 text-blue-600 mb-1" />
                            <p className="text-[10px] text-blue-600 mb-0.5">Per Duty</p>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(driver.salary_per_duty).replace('₹', '₹')}</p>
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <div className="flex flex-col items-center text-center">
                            <TrendingUp className="h-5 w-5 text-green-600 mb-1" />
                            <p className="text-[10px] text-green-600 mb-0.5">Earnings</p>
                            <p className="text-sm font-bold text-gray-900">
                                {salaryStats ? formatCurrency(salaryStats.netEarnings).replace('₹', '₹') : '₹0'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex flex-col items-center text-center">
                            <Clock className="h-5 w-5 text-purple-600 mb-1" />
                            <p className="text-[10px] text-purple-600 mb-0.5">Advance</p>
                            <p className="text-sm font-bold text-gray-900">
                                {salary ? formatCurrency(salary.advance_balance).replace('₹', '₹') : '₹0'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs - Mobile */}
                <div className="border-t border-gray-200">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`flex-1 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendance'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500'
                                }`}
                        >
                            Attendance
                        </button>
                        <button
                            onClick={() => setActiveTab('salary')}
                            className={`flex-1 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'salary'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500'
                                }`}
                        >
                            Salary
                        </button>
                    </nav>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block space-y-6 fade-in p-6">
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/drivers')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{driver.name}</h1>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-4 w-4" />
                                            <span>{driver.phone}</span>
                                        </div>
                                        {driver.address && (
                                            <>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="line-clamp-1">{driver.address}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${driver.isActive && driver.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {driver.isActive && driver.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                            <button
                                onClick={() => navigate(`/drivers/edit/${driverId}`)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                            >
                                <Edit className="h-4 w-4" />
                                Edit Driver
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards - Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <IndianRupee className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Salary per Duty</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(driver.salary_per_duty)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Total Earnings</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {salaryStats ? formatCurrency(salaryStats.netEarnings) : formatCurrency(0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Advance Balance</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {salary ? formatCurrency(salary.advance_balance) : formatCurrency(0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs - Desktop */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('attendance')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'attendance'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Attendance
                            </button>
                            <button
                                onClick={() => setActiveTab('salary')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'salary'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Salary & Payments
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="lg:px-6 lg:pb-6">
                {activeTab === 'attendance' && (
                    <AttendanceTab driverId={driverId!} />
                )}

                {activeTab === 'salary' && (
                    <SalaryTab
                        driverId={driverId!}
                        salary={salary}
                        onUpdate={fetchSalaryData}
                        driverInfo={{
                            name: driver.name,
                            phone: driver.phone,
                            salary_per_duty: driver.salary_per_duty
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default DriverDetails;
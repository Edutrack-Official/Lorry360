import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Users, Phone, MapPin } from "lucide-react";
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
    const [activeTab, setActiveTab] = useState<'attendance' | 'salary'>(
        (searchParams.get('tab') as 'attendance' | 'salary') || 'attendance'
    );

    useEffect(() => {
        if (driverId) {
            fetchDriverData();
            fetchSalaryData();
        }
    }, [driverId]);

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
                <div className="p-4">
                    {/* Top Row */}
                    <div className="flex items-start gap-3 mb-4">
                        <button
                            onClick={() => navigate('/drivers')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            aria-label="Back to drivers"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg font-bold text-gray-900 break-words">
                                    {driver.name}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 pl-[52px]">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700">{driver.phone}</span>
                        </div>
                        
                        {driver.address && (
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-600 break-words">{driver.address}</p>
                            </div>
                        )}
                    </div>
                </div>
            
                {/* Tabs */}
                <div className="border-t border-gray-200">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`flex-1 py-3 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'attendance'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Attendance
                        </button>
                        <button
                            onClick={() => setActiveTab('salary')}
                            className={`flex-1 py-3 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'salary'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Salary
                        </button>
                    </nav>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block p-6">
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <button
                            onClick={() => navigate('/drivers')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            aria-label="Back to drivers"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 break-words mb-2">
                                    {driver.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm">{driver.phone}</span>
                                    </div>
                                    {driver.address && (
                                        <>
                                            <span className="hidden sm:inline text-gray-300">•</span>
                                            <div className="flex items-start gap-1.5">
                                                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm break-words">{driver.address}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-gray-200 pt-6">
                        <nav className="flex gap-8">
                            <button
                                onClick={() => setActiveTab('attendance')}
                                className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'attendance'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Attendance
                            </button>
                            <button
                                onClick={() => setActiveTab('salary')}
                                className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'salary'
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
// pages/ManageAttendanceForm.tsx (fixed version)
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Truck, Save, X, Clock, IndianRupee, Calculator, Edit } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/client";

// Define a type for attendance status
type AttendanceStatus = 'fullduty' | 'halfduty' | 'doubleduty' | 'absent' | 'tripduty' | 'custom';

interface Driver {
  _id: string;
  name: string;
  phone: string;
  status: "active" | "inactive";
  salary_per_duty: number;
  salary_per_trip: number;
}

interface Lorry {
  _id: string;
  registration_number: string;
  nick_name?: string;
  status: 'active' | 'maintenance' | 'inactive';
}

interface Trip {
  _id: string;
  trip_date: string;
  customer_amount: number;
}

interface Attendance {
  _id: string;
  driver_id: {
    _id: string;
    name: string;
    phone: string;
    salary_per_duty: number;
    salary_per_trip: number;
  };
  lorry_id: {
    _id: string;
    registration_number: string;
    nick_name?: string;
  } | null; // Made nullable
  date: string;
  status: AttendanceStatus;
  salary_amount: number;
  no_of_trips: number;
}

const ManageAttendanceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // attendance ID for edit mode
  const [searchParams] = useSearchParams();

  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    driver_id: searchParams.get('driver') || '',
    lorry_id: '',
    date: searchParams.get('date') || getTodayDate(),
    status: 'fullduty' as AttendanceStatus,
    salary_amount: 0,
    no_of_trips: 0
  });

  const [salaryCalculation, setSalaryCalculation] = useState({
    mode: 'auto' as 'auto' | 'manual',
    calculatedAmount: 0
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const initializeForm = async () => {
      await Promise.all([fetchDrivers(), fetchLorries()]);

      if (isEditMode) {
        await fetchAttendanceRecord();
      } else {
        setLoading(false);
      }
    };

    initializeForm();
  }, [id]);

  useEffect(() => {
    if (formData.driver_id && formData.date) {
      fetchTripsForDate();
    }
  }, [formData.driver_id, formData.date]);

  useEffect(() => {
    calculateAutoSalary();
  }, [formData.status, formData.driver_id, formData.no_of_trips, salaryCalculation.mode, drivers]);

  const fetchAttendanceRecord = async () => {
    try {
      const res = await api.get(`/attendance/${id}`);
      const attendanceData: Attendance = res.data.data;

      // Format date to YYYY-MM-DD
      const dateObj = new Date(attendanceData.date);
      const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

      setFormData({
        driver_id: typeof attendanceData.driver_id === 'object' ? attendanceData.driver_id._id : attendanceData.driver_id,
        lorry_id: attendanceData.lorry_id && typeof attendanceData.lorry_id === 'object'
          ? attendanceData.lorry_id._id
          : attendanceData.lorry_id || '',
        date: formattedDate,
        status: attendanceData.status,
        salary_amount: attendanceData.salary_amount || 0,
        no_of_trips: attendanceData.no_of_trips || 0
      });

      // Determine calculation mode based on existing data
      if (attendanceData.status === 'custom') {
        setSalaryCalculation(prev => ({ ...prev, mode: 'manual' }));
      } else {
        setSalaryCalculation(prev => ({ ...prev, mode: 'auto' }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch attendance record");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get("/drivers");
      setDrivers(res.data.data?.drivers || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch drivers");
    }
  };

  const fetchLorries = async () => {
    try {
      const res = await api.get("/lorries");
      setLorries(res.data.data?.lorries || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch lorries");
    }
  };

  const fetchTripsForDate = async () => {
    try {
      const res = await api.get(`/trips?driver_id=${formData.driver_id}&start_date=${formData.date}&end_date=${formData.date}`);
      const tripsData = res.data.data?.trips || [];
      setTrips(tripsData);

      // Auto-set number of trips for tripduty in add mode only
      if (formData.status === 'tripduty' && !isEditMode) {
        setFormData(prev => ({ ...prev, no_of_trips: tripsData.length }));
      }
    } catch (error: any) {
      console.error("Failed to fetch trips:", error);
    }
  };

  const calculateAutoSalary = () => {
    const selectedDriver = getSelectedDriver();
    if (!selectedDriver) {
      if (formData.status === 'absent') {
        setFormData(prev => ({ ...prev, salary_amount: 0 }));
      }
      return;
    }

    let calculatedAmount = 0;

    if (salaryCalculation.mode === 'auto') {
      switch (formData.status) {
        case 'fullduty':
          calculatedAmount = selectedDriver.salary_per_duty;
          break;
        case 'halfduty':
          calculatedAmount = selectedDriver.salary_per_duty / 2;
          break;
        case 'doubleduty':
          calculatedAmount = selectedDriver.salary_per_duty * 2;
          break;
        case 'tripduty':
          calculatedAmount = (selectedDriver.salary_per_trip || 0) * formData.no_of_trips;
          break;
        case 'absent':
          calculatedAmount = 0;
          break;
        case 'custom':
          // For custom, keep the manually entered amount
          calculatedAmount = formData.salary_amount;
          break;
      }
    } else {
      // Manual mode - use the manually entered amount
      calculatedAmount = formData.salary_amount;
    }

    setSalaryCalculation(prev => ({ ...prev, calculatedAmount }));

    // Auto-update form data for auto mode
    if (salaryCalculation.mode === 'auto' && formData.status !== 'custom') {
      setFormData(prev => ({ ...prev, salary_amount: calculatedAmount }));
    }
  };

  const getSelectedDriver = () => {
    return drivers.find(driver => driver._id === formData.driver_id);
  };

  const getSelectedLorry = () => {
    return lorries.find(lorry => lorry._id === formData.lorry_id);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-switch to manual mode when user manually changes salary amount
    if (field === 'salary_amount' && salaryCalculation.mode === 'auto') {
      setSalaryCalculation(prev => ({ ...prev, mode: 'manual' }));
    }
  };

  const handleStatusChange = (status: AttendanceStatus) => {
    handleChange('status', status);

    // If status is 'absent', clear lorry_id
    if (status === 'absent') {
      handleChange('lorry_id', '');
    }

    // Auto-switch mode based on status
    if (status === 'custom') {
      setSalaryCalculation(prev => ({ ...prev, mode: 'manual' }));
    } else {
      setSalaryCalculation(prev => ({ ...prev, mode: 'auto' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.driver_id) {
      newErrors.driver_id = "Please select a driver";
    }

    // Lorry is only required when status is NOT 'absent'
    // Use a type guard to check if status is 'absent'
    const isAbsent = formData.status === 'absent';
    if (!isAbsent && !formData.lorry_id) {
      newErrors.lorry_id = "Please select a lorry for this attendance type";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      // Allow today and past dates only
      if (selectedDate > today) {
        newErrors.date = "Date cannot be in the future";
      }
    }

    if (formData.salary_amount < 0) {
      newErrors.salary_amount = "Salary amount cannot be negative";
    }

    if (formData.status === 'tripduty') {
      if (!formData.no_of_trips || formData.no_of_trips <= 0) {
        newErrors.no_of_trips = "Please enter number of trips (must be greater than 0)";
      }
    }

    if (formData.status === 'tripduty' && formData.no_of_trips < 0) {
      newErrors.no_of_trips = "Number of trips cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare data - don't send lorry_id if status is 'absent'
      const submitData = {
        driver_id: formData.driver_id,
        date: formData.date,
        status: formData.status,
        salary_amount: formData.salary_amount,
        no_of_trips: formData.no_of_trips
      };

      // Only include lorry_id if status is not 'absent'
      // Use a type guard to check if status is 'absent'
      const isAbsent = formData.status === 'absent';
      if (!isAbsent && formData.lorry_id) {
        (submitData as any).lorry_id = formData.lorry_id;
      }

      if (isEditMode) {
        await api.put(`/attendance/update/${id}`, submitData);
        toast.success("Attendance record updated successfully!");
      } else {
        await api.post("/attendance/create", submitData);
        toast.success("Attendance record added successfully!");
      }

      // Navigate back to appropriate page
      const fromDriver = searchParams.get('driver') || formData.driver_id;
      if (fromDriver) {
        navigate(`/drivers/${fromDriver}?tab=attendance`);
      } else {
        navigate('/attendance');
      }
    } catch (error: any) {
      console.error("Attendance operation error:", error);
      if (error.response?.data?.error?.toLowerCase()?.includes('duplicate')) {
        toast.error("Attendance record already exists for this driver on the selected date");
      } else {
        toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'add'} attendance record`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const config = {
      fullduty: {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Full Duty',
        description: 'Driver worked full day',
      },
      halfduty: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Half Duty',
        description: 'Driver worked half day',
      },
      doubleduty: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Double Duty',
        description: 'Driver worked double shift',
      },
      tripduty: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'Trip Duty',
        description: 'Salary based on number of trips',
      },
      custom: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'Custom',
        description: 'Enter custom salary amount',
      },
      absent: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Absent',
        description: 'Driver was absent',
      }
    };
    return config[status as keyof typeof config] || config.fullduty;
  };

  const getActiveDrivers = () => {
    return drivers.filter(driver => driver.status === 'active');
  };

  const getActiveLorries = () => {
    return lorries.filter(lorry => lorry.status === 'active');
  };

  // Get available status options based on driver's salary configuration
  const getAvailableStatusOptions = () => {
    const selectedDriver = getSelectedDriver();
    if (!selectedDriver) {
      return [
        { value: 'custom' as AttendanceStatus, label: 'Custom', description: 'Enter custom salary amount' },
        { value: 'absent' as AttendanceStatus, label: 'Absent', description: 'Driver was absent' }
      ];
    }

    const hasDutySalary = selectedDriver.salary_per_duty > 0;
    const hasTripSalary = selectedDriver.salary_per_trip > 0;

    const baseOptions = [
      { value: 'custom' as AttendanceStatus, label: 'Custom', description: 'Enter custom salary amount' },
      { value: 'absent' as AttendanceStatus, label: 'Absent', description: 'Driver was absent' }
    ];

    if (hasDutySalary && hasTripSalary) {
      // Driver has both duty and trip salaries
      return [
        { value: 'fullduty' as AttendanceStatus, label: 'Full Duty', description: 'Driver worked full day' },
        { value: 'halfduty' as AttendanceStatus, label: 'Half Duty', description: 'Driver worked half day' },
        { value: 'doubleduty' as AttendanceStatus, label: 'Double Duty', description: 'Driver worked double shift' },
        { value: 'tripduty' as AttendanceStatus, label: 'Trip Duty', description: 'Salary based on number of trips' },
        ...baseOptions
      ];
    } else if (hasDutySalary) {
      // Driver has only duty salary
      return [
        { value: 'fullduty' as AttendanceStatus, label: 'Full Duty', description: 'Driver worked full day' },
        { value: 'halfduty' as AttendanceStatus, label: 'Half Duty', description: 'Driver worked half day' },
        { value: 'doubleduty' as AttendanceStatus, label: 'Double Duty', description: 'Driver worked double shift' },
        ...baseOptions
      ];
    } else if (hasTripSalary) {
      // Driver has only trip salary
      return [
        { value: 'tripduty' as AttendanceStatus, label: 'Trip Duty', description: 'Salary based on number of trips' },
        ...baseOptions
      ];
    } else {
      // Driver has no salary configured
      return baseOptions;
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

  // Check if current form status is valid for selected driver
  const isCurrentStatusValid = () => {
    const selectedDriver = getSelectedDriver();
    if (!selectedDriver) return true; // Allow any status if no driver selected
    const availableOptions = getAvailableStatusOptions();
    return availableOptions.some(option => option.value === formData.status);
  };

  // Auto-correct status when driver changes (only in add mode)
  useEffect(() => {
    if (!isEditMode && formData.driver_id && !isCurrentStatusValid()) {
      const availableOptions = getAvailableStatusOptions();
      if (availableOptions.length > 0) {
        handleStatusChange(availableOptions[0].value);
      }
    }
  }, [formData.driver_id, drivers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const availableStatusOptions = getAvailableStatusOptions();
  const selectedDriver = getSelectedDriver();

  // Use a type guard to check if status is 'absent'
  const isAbsent = formData.status === 'absent';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 h-14 sm:h-16">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center lg:justify-start flex-1 min-w-0">
              <div className="text-center lg:text-left min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {isEditMode ? "Edit Attendance" : "Add Attendance"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  {isEditMode ? "Update driver attendance record" : "Record driver attendance for the day"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Left Column - Form Fields */}
              <div className="space-y-5 sm:space-y-6">
                {/* Driver Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Select Driver <span className="text-red-500">*</span></span>
                    </div>
                  </label>
                  <select
                    value={formData.driver_id}
                    onChange={(e) => handleChange('driver_id', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${errors.driver_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    disabled={isEditMode || !!searchParams.get('driver')}
                  >
                    <option value="">Choose a driver</option>
                    {getActiveDrivers().map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} - {driver.phone}
                      </option>
                    ))}
                  </select>
                  {errors.driver_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.driver_id}</p>
                  )}

                  {/* Selected Driver Info */}
                  {selectedDriver && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 truncate">
                        {selectedDriver.name}
                      </p>
                      <p className="text-sm text-blue-700">
                        {selectedDriver.phone}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs">
                        {selectedDriver.salary_per_duty > 0 && (
                          <span>Duty: {formatCurrency(selectedDriver.salary_per_duty)}</span>
                        )}
                        {selectedDriver.salary_per_trip > 0 && (
                          <span>Trip: {formatCurrency(selectedDriver.salary_per_trip)}</span>
                        )}
                        {selectedDriver.salary_per_duty === 0 && selectedDriver.salary_per_trip === 0 && (
                          <span className="text-orange-600">No salary configured</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lorry Selection - Hidden when status is 'absent' */}
                {!isAbsent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>Select Lorry <span className="text-red-500">*</span></span>
                      </div>
                    </label>
                    <select
                      value={formData.lorry_id}
                      onChange={(e) => handleChange('lorry_id', e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${errors.lorry_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Choose a lorry</option>
                      {getActiveLorries().map((lorry) => (
                        <option key={lorry._id} value={lorry._id}>
                          {lorry.registration_number}
                          {lorry.nick_name && ` (${lorry.nick_name})`}
                        </option>
                      ))}
                    </select>
                    {errors.lorry_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.lorry_id}</p>
                    )}

                    {/* Selected Lorry Info */}
                    {formData.lorry_id && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-900 truncate">
                          {getSelectedLorry()?.registration_number}
                        </p>
                        {getSelectedLorry()?.nick_name && (
                          <p className="text-sm text-purple-700">
                            Nick Name: {getSelectedLorry()?.nick_name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Attendance Date <span className="text-red-500">*</span></span>
                    </div>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    max={getTodayDate()}
                    disabled={isEditMode}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                  {isEditMode && (
                    <p className="mt-1 text-xs text-gray-500">
                      Date cannot be changed in edit mode
                    </p>
                  )}
                </div>

                {/* Number of Trips (for tripduty) */}
                {formData.status === 'tripduty' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        <span>Number of Trips</span>
                      </div>
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="number"
                        value={formData.no_of_trips || ''}
                        onChange={(e) => handleChange('no_of_trips', parseInt(e.target.value) || 0)}
                        className={`w-32 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${errors.no_of_trips ? 'border-red-500' : 'border-gray-300'
                          }`}
                        min="0"
                        placeholder="0"
                      />
                      {/* <span className="text-sm text-gray-600">
                        Found {trips.length} trip{trips.length !== 1 ? 's' : ''} for this date
                      </span> */}
                    </div>
                    {errors.no_of_trips && (
                      <p className="mt-1 text-sm text-red-600">{errors.no_of_trips}</p>
                    )}
                  </div>
                )}

                {/* Salary Amount Input */}
                {(formData.status === 'custom' || salaryCalculation.mode === 'manual') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        <span>Salary Amount <span className="text-red-500">*</span></span>
                      </div>
                    </label>
                    <input
                      type="number"
                      value={formData.salary_amount}
                      onChange={(e) => handleChange('salary_amount', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${errors.salary_amount ? 'border-red-500' : 'border-gray-300'
                        }`}
                      min="0"
                      step="0.01"
                    />
                    {errors.salary_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.salary_amount}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Status Selection */}
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
                    Attendance Status <span className="text-red-500">*</span>
                    {selectedDriver && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({selectedDriver.salary_per_duty > 0 && selectedDriver.salary_per_trip > 0 ? 'Duty + Trip' :
                          selectedDriver.salary_per_duty > 0 ? 'Duty Only' :
                            selectedDriver.salary_per_trip > 0 ? 'Trip Only' : 'Custom Only'})
                      </span>
                    )}
                  </label>
                  <div className="space-y-2.5 sm:space-y-3">
                    {availableStatusOptions.map((option) => {
                      const config = getStatusConfig(option.value);
                      const isSelected = formData.status === option.value;

                      return (
                        <div
                          key={option.value}
                          className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                            ? `${config.color} border-current`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          onClick={() => handleStatusChange(option.value)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm sm:text-base ${isSelected ? 'text-current' : 'text-gray-900'
                                }`}>
                                {option.label}
                              </p>
                              <p className={`text-xs sm:text-sm ${isSelected ? 'text-current opacity-80' : 'text-gray-600'
                                }`}>
                                {option.description}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="w-2 h-2 bg-current rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Salary Summary */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-900 mb-3">Salary Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${getStatusConfig(formData.status).color.replace('bg-', 'text-').split(' ')[0]}`}>
                        {getStatusConfig(formData.status).label}
                      </span>
                    </div>

                    {formData.status === 'tripduty' && selectedDriver?.salary_per_trip !== undefined && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trips:</span>
                          <span className="font-medium text-gray-900">{formData.no_of_trips}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate per Trip:</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedDriver.salary_per_trip || 0)}
                          </span>
                        </div>
                      </>
                    )}

                    {['fullduty', 'halfduty', 'doubleduty'].includes(formData.status) && selectedDriver?.salary_per_duty !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Salary:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(selectedDriver.salary_per_duty || 0)}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Total Salary:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(formData.salary_amount)}
                        </span>
                      </div>
                    </div>

                    {isAbsent && (
                      <p className="text-xs text-red-500 mt-2">
                        * No salary for absent status
                      </p>
                    )}

                    {salaryCalculation.mode === 'auto' && formData.status !== 'custom' && !isAbsent && (
                      <p className="text-xs text-gray-500 mt-2">
                        * Amount calculated automatically based on status
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:flex-1 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:flex-1 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditMode ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? 'Update Attendance' : 'Add Attendance'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageAttendanceForm;
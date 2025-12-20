// import React, { useEffect, useState } from "react";
// import { useParams, Link, useNavigate, Outlet, useLocation } from "react-router-dom";
// import api from "../../api/client";
// import {
//   Truck,
//   Package,
//   ArrowLeft,
//   Plus,
//   CheckCircle2,
//   Clock,
//   PauseCircle,
//   Loader2,
//   TrendingUp,
//   TrendingDown,
//   Calendar,
//   MoreVertical,
//   Edit,
//   Trash2,
//   IndianRupee
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { motion, AnimatePresence } from "framer-motion";

// interface Lorry {
//   _id: string;
//   registration_number: string;
//   nick_name?: string;
//   status: 'active' | 'maintenance' | 'inactive';
//   owner_id: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Trip {
//   _id: string;
//   trip_number: string;
//   status: string;
//   trip_date: string;
//   profit: number;
// }

// interface Expense {
//   _id: string;
//   category: string;
//   amount: number;
//   date: string;
// }

// const LorryDetails = () => {
//   const { lorryId } = useParams<{ lorryId: string }>();
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   const [lorry, setLorry] = useState<Lorry | null>(null);
//   const [trips, setTrips] = useState<Trip[]>([]);
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showActionMenu, setShowActionMenu] = useState(false);
//   const [completedtrips, setCompletedTrips] = useState<Trip[]>([]);

//   const getActiveTab = () => {
//     const path = location.pathname;
//     if (path.includes('/expenses')) return 'expenses';
//     if (path.includes('/trips')) return 'trips';
//     return 'overview';
//   };

//   const activeTab = getActiveTab();

//   const fetchLorry = async () => {
//     try {
//       const res = await api.get(`/lorries/${lorryId}`);
//       setLorry(res.data.data);
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || "Failed to fetch lorry details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchTrips = async () => {
//     try {
//       const res = await api.get(`/trips`);
//       const allTrips = res.data.data?.trips || [];
//       const lorryTrips = allTrips.filter((trip: any) => trip.lorry_id?._id === lorryId);
//       setTrips(lorryTrips);
//       setCompletedTrips(allTrips.filter((trip: any) => 
//   trip.lorry_id?._id === lorryId && trip.status === "completed"
//     ));
//     } catch (error: any) {
//       console.error("Failed to fetch trips:", error);
//     }
//   };
  

//    const fetchExpenses = async () => {
//     try {
//       // ✅ Using the dedicated lorry endpoint
//       const res = await api.get(`/expenses/lorry/${lorryId}`);
//       const expensesData = res.data.data?.expenses || [];
//       setExpenses(expensesData.slice(0, 5));
//     } catch (error: any) {
//       console.error("Failed to fetch expenses:", error);
//     }
//   };

//   useEffect(() => {
//     if (lorryId) {
//       fetchLorry();
//       fetchTrips();
//       fetchExpenses();
//     }
//   }, [lorryId]);

  

  
//   const handleDeleteLorry = async () => {
//     if (!window.confirm(`Are you sure you want to delete ${lorry?.registration_number}? This action cannot be undone.`)) {
//       return;
//     }

//     try {
//       await api.delete(`/lorries/delete/${lorryId}`);
//       toast.success("Lorry deleted successfully");
//       navigate("/lorries");
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || "Failed to delete lorry");
//     }
//   };

//   const getStatusConfig = (status: string) => {
//     const config = {
//       active: { 
//         color: "bg-green-50 text-green-700 border-green-200",
//         icon: CheckCircle2,
//         label: "Active",
//         dotColor: "bg-green-500"
//       },
//       maintenance: { 
//         color: "bg-amber-50 text-amber-700 border-amber-200",
//         icon: Clock,
//         label: "Maintenance",
//         dotColor: "bg-amber-500"
//       },
//       inactive: { 
//         color: "bg-gray-50 text-gray-700 border-gray-200",
//         icon: PauseCircle,
//         label: "Inactive",
//         dotColor: "bg-gray-500"
//       }
//     };
//     return config[status as keyof typeof config] || config.active;
//   };

//   const getCategoryConfig = (category: string) => {
//     const config = {
//       fuel: { color: "bg-orange-50 text-orange-700 border-orange-200", label: "Fuel" },
//       maintenance: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Maintenance" },
//       repair: { color: "bg-red-50 text-red-700 border-red-200", label: "Repair" },
//       toll: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Toll" },
//       fine: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Fine" },
//       other: { color: "bg-gray-50 text-gray-700 border-gray-200", label: "Other" }
//     };
//     return config[category as keyof typeof config] || config.other;
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const calculateStats = () => {
//     console.log("trips", completedtrips)
//     const totalTrips = completedtrips.length;
//     const totalExpenses = expenses.length;
//     const totalProfit = completedtrips.reduce((sum, trip) => sum + trip.profit, 0);
//     const totalExpenseAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
//     const netProfit = totalProfit - totalExpenseAmount;

//     return {
//       totalTrips,
//       totalExpenses,
//       totalProfit,
//       totalExpenseAmount,
//       netProfit
//     };
//   };

//   // Close action menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = () => setShowActionMenu(false);
//     if (showActionMenu) {
//       document.addEventListener('click', handleClickOutside);
//       return () => document.removeEventListener('click', handleClickOutside);
//     }
//   }, [showActionMenu]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
//           <p className="text-sm text-gray-600">Loading lorry details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!lorry) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="text-center">
//           <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">Lorry not found</h3>
//           <button
//             onClick={() => navigate("/lorries")}
//             className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Back to Lorries
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const stats = calculateStats();
//   const statusConfig = getStatusConfig(lorry.status);
//   const StatusIcon = statusConfig.icon;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Mobile-First Header - Sticky */}
//       <div className="bg-white border-b top-0 z-20 shadow-sm">
//         <div className="px-4 py-2 sm:px-6">
//           {/* Top Row */}
//           <div className="flex items-center justify-between gap-3 mb-3">
//             <button
//               onClick={() => navigate("/lorries")}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ArrowLeft className="h-5 w-5 text-gray-700" />
//             </button>
            
//             <div className="flex items-center gap-2 flex-1 min-w-0">
//               <div className="flex-1 min-w-0">
//                 <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
//                   {lorry.registration_number}
//                 </h1>
//                 {lorry.nick_name && (
//                   <p className="text-xs sm:text-sm text-gray-600 truncate">{lorry.nick_name}</p>
//                 )}
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* Quick Stats Cards - Horizontal Scroll on Mobile */}
//       <div className="px-4 py-4 sm:px-6">
//         <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
//           <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 min-w-[140px] sm:min-w-0 flex-shrink-0">
//             <div className="flex items-center gap-2 mb-2">
//               <Package className="h-4 w-4 text-blue-600" />
//               <p className="text-xs text-gray-600">Completed Trips</p>
//             </div>
//             <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
//           </div>

//           <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 min-w-[140px] sm:min-w-0 flex-shrink-0">
//             <div className="flex items-center gap-2 mb-2">
//               <TrendingUp className="h-4 w-4 text-green-600" />
//               <p className="text-xs text-gray-600">Revenue</p>
//             </div>
//             <p className="text-sm sm:text-lg font-bold text-green-600">
//               {formatCurrency(stats.totalProfit)}
//             </p>
//           </div>

//           <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 min-w-[140px] sm:min-w-0 flex-shrink-0">
//             <div className="flex items-center gap-2 mb-2">
//               <TrendingDown className="h-4 w-4 text-red-600" />
//               <p className="text-xs text-gray-600">Expenses</p>
//             </div>
//             <p className="text-sm sm:text-lg font-bold text-red-600">
//               {formatCurrency(stats.totalExpenseAmount)}
//             </p>
//           </div>

//           <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 min-w-[140px] sm:min-w-0 flex-shrink-0">
//             <div className="flex items-center gap-2 mb-2">
//             <IndianRupee  className="h-4 w-4 text-blue-600" />
//               <p className="text-xs text-gray-600">Net Profit</p>
//             </div>
//             <p className={`text-sm sm:text-lg font-bold ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
//               {formatCurrency(stats.netProfit)}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Tabs Navigation */}
//       <div className="bg-white border-b sm:top-[113px] z-30">
//         <nav className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
//           <Link
//             to={`/lorries/${lorryId}/trips`}
//             className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
//               activeTab === 'trips'
//                 ? 'border-blue-500 text-blue-600'
//                 : 'border-transparent text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             <Package className="h-4 w-4" />
//             Trips
//             <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">
//               {trips.length}
//             </span>
//           </Link>
//           <Link
//             to={`/lorries/${lorryId}/expenses`}
//             className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
//               activeTab === 'expenses'
//                 ? 'border-green-500 text-green-600'
//                 : 'border-transparent text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             <IndianRupee className="h-4 w-4" />
//             Expenses
//             <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">
//               {expenses.length}
//             </span>
//           </Link>
//         </nav>
//       </div>


//           <Outlet />
        
//     </div>
//   );
// };

// export default LorryDetails;


import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import api from "../../api/client";
import {
  Truck,
  Package,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  PauseCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  IndianRupee
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Lorry {
  _id: string;
  registration_number: string;
  nick_name?: string;
  status: 'active' | 'maintenance' | 'inactive';
  owner_id: string;
  createdAt: string;
  updatedAt: string;
}

interface Trip {
  _id: string;
  trip_number: string;
  status: string;
  trip_date: string;
  profit: number;
}

interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string;
}

const LorryDetails = () => {
  const { lorryId } = useParams<{ lorryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [lorry, setLorry] = useState<Lorry | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [completedtrips, setCompletedTrips] = useState<Trip[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/expenses')) return 'expenses';
    if (path.includes('/trips')) return 'trips';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const fetchLorry = async () => {
    try {
      const res = await api.get(`/lorries/${lorryId}`);
      setLorry(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch lorry details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await api.get(`/trips`);
      const allTrips = res.data.data?.trips || [];
      const lorryTrips = allTrips.filter((trip: any) => trip.lorry_id?._id === lorryId);
      setTrips(lorryTrips);
      setCompletedTrips(allTrips.filter((trip: any) => 
        trip.lorry_id?._id === lorryId && trip.status === "completed"
      ));
    } catch (error: any) {
      console.error("Failed to fetch trips:", error);
    }
  };
  
  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses/lorry/${lorryId}`);
      const expensesData = res.data.data?.expenses || [];
      setExpenses(expensesData);
    } catch (error: any) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (lorryId) {
      fetchLorry();
      fetchTrips();
      fetchExpenses();
    }
  }, [lorryId, refreshKey]);

  const handleDeleteLorry = async () => {
    if (!window.confirm(`Are you sure you want to delete ${lorry?.registration_number}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/lorries/delete/${lorryId}`);
      toast.success("Lorry deleted successfully");
      navigate("/lorries");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete lorry");
    }
  };

  const getStatusConfig = (status: string) => {
    const config = {
      active: { 
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle2,
        label: "Active",
        dotColor: "bg-green-500"
      },
      maintenance: { 
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        label: "Maintenance",
        dotColor: "bg-amber-500"
      },
      inactive: { 
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: PauseCircle,
        label: "Inactive",
        dotColor: "bg-gray-500"
      }
    };
    return config[status as keyof typeof config] || config.active;
  };

  const getCategoryConfig = (category: string) => {
    const config = {
      fuel: { color: "bg-orange-50 text-orange-700 border-orange-200", label: "Fuel" },
      maintenance: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Maintenance" },
      repair: { color: "bg-red-50 text-red-700 border-red-200", label: "Repair" },
      toll: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Toll" },
      fine: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Fine" },
      other: { color: "bg-gray-50 text-gray-700 border-gray-200", label: "Other" }
    };
    return config[category as keyof typeof config] || config.other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateStats = () => {
    console.log("trips", completedtrips)
    const totalTrips = completedtrips.length;
    const totalExpenses = expenses.length;
    const totalProfit = completedtrips.reduce((sum, trip) => sum + trip.profit, 0);
    const totalExpenseAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalProfit - totalExpenseAmount;

    return {
      totalTrips,
      totalExpenses,
      totalProfit,
      totalExpenseAmount,
      netProfit
    };
  };

  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(false);
    if (showActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading lorry details...</p>
        </div>
      </div>
    );
  }

  if (!lorry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lorry not found</h3>
          <button
            onClick={() => navigate("/lorries")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lorries
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const statusConfig = getStatusConfig(lorry.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header - Sticky */}
      <div className="bg-white border-b top-0 z-20 shadow-sm">
        <div className="px-4 py-2 sm:px-6">
          {/* Top Row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <button
              onClick={() => navigate("/lorries")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {lorry.registration_number}
                </h1>
                {lorry.nick_name && (
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{lorry.nick_name}</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Stats Cards - Horizontal Scroll on Mobile */}
      <div className="px-4 py-4 sm:px-6">
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 min-w-[140px] sm:min-w-0 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-600">Completed Trips</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 min-w-[140px] sm:min-w-0 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600">Revenue</p>
            </div>
            <p className="text-sm sm:text-lg font-bold text-green-600">
              {formatCurrency(stats.totalProfit)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 min-w-[140px] sm:min-w-0 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-xs text-gray-600">Expenses</p>
            </div>
            <p className="text-sm sm:text-lg font-bold text-red-600">
              {formatCurrency(stats.totalExpenseAmount)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 min-w-[140px] sm:min-w-0 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
            <IndianRupee  className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-600">Net Profit</p>
            </div>
            <p className={`text-sm sm:text-lg font-bold ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b sm:top-[113px] z-30">
        <nav className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
          <Link
            to={`/lorries/${lorryId}/trips`}
            className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'trips'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="h-4 w-4" />
            Trips
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">
              {trips.length}
            </span>
          </Link>
          <Link
            to={`/lorries/${lorryId}/expenses`}
            className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'expenses'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <IndianRupee className="h-4 w-4" />
            Expenses
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">
              {expenses.length}
            </span>
          </Link>
        </nav>
      </div>

      <Outlet context={{ onRefresh: handleRefresh }} />
        
    </div>
  );
};

export default LorryDetails;
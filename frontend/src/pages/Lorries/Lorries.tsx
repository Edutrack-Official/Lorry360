// import React, { useEffect, useState } from "react";
// import api from "../../api/client";
// import {
//   Mail,
//   Power,
//   Search,
//   Truck,
//   Wrench,
//   Clock,
//   MoreVertical,
//   Edit,
//   Trash2
// } from "lucide-react";
// import { FaPlus } from "react-icons/fa6";
// import { FiEdit } from "react-icons/fi";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { motion, AnimatePresence } from "framer-motion";

// interface Lorry {
//   _id: string;
//   owner_id: { _id: string; name: string; company_name?: string };
//   registration_number: string;
//   nick_name?: string;
//   status: 'active' | 'maintenance' | 'inactive';
//   createdAt: string;
//   updatedAt: string;
// }

// const Lorries = () => {
//   const [lorries, setLorries] = useState<Lorry[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchText, setSearchText] = useState("");
//   const [filterStatus, setFilterStatus] = useState<"all" | "active" | "maintenance" | "inactive">("all");
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedLorry, setSelectedLorry] = useState<Lorry | null>(null);
//   const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

//   const navigate = useNavigate();

//   const fetchLorries = async () => {
//     try {
//       const res = await api.get("/lorries");
//       setLorries(res.data.data?.lorries || []);
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || "Failed to fetch lorries");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLorries();
//   }, []);

//   const handleToggleStatus = async (id: string, currentStatus: string) => {
//     try {
//       let newStatus: string;
      
//       switch (currentStatus) {
//         case 'active':
//           newStatus = 'maintenance';
//           break;
//         case 'maintenance':
//           newStatus = 'inactive';
//           break;
//         case 'inactive':
//           newStatus = 'active';
//           break;
//         default:
//           newStatus = 'active';
//       }

//       await api.patch(`/lorries/status/${id}`, { status: newStatus });
//       toast.success(`Status updated to ${newStatus}`);
//       setShowActionMenu(null);
//       fetchLorries();
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || "Failed to update status");
//     }
//   };

//   const handleDeleteLorry = async (id: string, registrationNumber: string) => {
//     if (!window.confirm(`Are you sure you want to delete lorry ${registrationNumber}?`)) {
//       return;
//     }

//     try {
//       await api.delete(`/lorries/delete/${id}`);
//       toast.success("Lorry deleted successfully");
//       setShowActionMenu(null);
//       fetchLorries();
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || "Failed to delete lorry");
//     }
//   };

//   // ✅ Apply Search + Filters
//   const filtered = lorries.filter((lorry) => {
//     const matchesSearch =
//       lorry.registration_number.toLowerCase().includes(searchText.toLowerCase()) ||
//       lorry.nick_name?.toLowerCase().includes(searchText.toLowerCase()) ||
//       lorry.owner_id?.name?.toLowerCase().includes(searchText.toLowerCase());
    
//     const matchesStatus =
//       filterStatus === "all" || lorry.status === filterStatus;
    
//     return matchesSearch && matchesStatus;
//   });

//   const getStatusBadge = (status: string) => {
//     const statusConfig = {
//       active: { 
//         color: "bg-green-100 text-green-800 border-green-200", 
//         icon: "🚚",
//         label: "Active"
//       },
//       maintenance: { 
//         color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
//         icon: "🔧",
//         label: "Maintenance"
//       },
//       inactive: { 
//         color: "bg-gray-100 text-gray-800 border-gray-200", 
//         icon: "⏸️",
//         label: "Inactive"
//       }
//     };
    
//     const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
//     return (
//       <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
//         <span>{config.icon}</span>
//         {config.label}
//       </span>
//     );
//   };

//   const getStatusColor = (status: string) => {
//     const colors = {
//       active: "border-l-green-500",
//       maintenance: "border-l-yellow-500",
//       inactive: "border-l-gray-500"
//     };
//     return colors[status as keyof typeof colors] || "border-l-gray-500";
//   };

//   const resetFilters = () => {
//     setSearchText("");
//     setFilterStatus("all");
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 fade-in p-6">
//       {/* Header */}
//       <div className="bg-white p-6 rounded-xl border shadow-sm">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <Truck className="h-6 w-6 text-blue-600" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Lorries</h1>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             {/* Filters Toggle */}
//             <button
//               className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-2"
//               onClick={() => setShowFilters(!showFilters)}
//             >
//               <motion.span
//                 animate={{ rotate: showFilters ? 180 : 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="inline-block"
//               >
//                 ▼
//               </motion.span>
//               Filters
//             </button>

//             {/* Add Lorry */}
//             <Link
//               to="/lorries/create"
//               className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
//             >
//               <FaPlus size={16} />
//               Add Lorry
//             </Link>
//           </div>
//         </div>

//         {/* Filters (Animated Collapse) */}
//         <AnimatePresence>
//           {showFilters && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               transition={{ duration: 0.3, ease: "easeInOut" }}
//             >
//               <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200">
//                 {/* Search */}
//                 <div className="relative w-full md:w-80">
//                   <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
//                   <input
//                     type="text"
//                     placeholder="Search by registration number or nick name..."
//                     value={searchText}
//                     onChange={(e) => setSearchText(e.target.value)}
//                     className="input input-bordered pl-9 w-full"
//                   />
//                 </div>

//                 <select
//                   className="input input-bordered w-full md:w-40"
//                   value={filterStatus}
//                   onChange={(e) => setFilterStatus(e.target.value as any)}
//                 >
//                   <option value="all">All Status</option>
//                   <option value="active">Active</option>
//                   <option value="maintenance">Maintenance</option>
//                   <option value="inactive">Inactive</option>
//                 </select>

//                 <button
//                   className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 border text-sm"
//                   onClick={resetFilters}
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Cards Grid */}
//       {filtered.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filtered.map((lorry) => (
//             <div
//               key={lorry._id}
//               className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 `}
//             >
//               <div className="p-5">
//                 {/* Header */}
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1">
//                     <h3 className="font-bold text-lg text-gray-900 mb-1">
//                       {lorry.registration_number}
//                     </h3>
//                     {lorry.nick_name && (
//                       <p className="text-gray-600 text-sm">{lorry.nick_name}</p>
//                     )}
//                   </div>
                  
//                   {/* Action Menu */}
//                   <div className="relative">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setShowActionMenu(showActionMenu === lorry._id ? null : lorry._id);
//                       }}
//                       className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                     >
//                       <MoreVertical className="h-4 w-4 text-gray-500" />
//                     </button>

//                     {showActionMenu === lorry._id && (
//                       <div className="absolute right-0 top-10 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
//                         <button
//                           onClick={() => navigate(`/lorries/edit/${lorry._id}`)}
//                           className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                         >
//                           <Edit className="h-4 w-4" />
//                           Edit Lorry
//                         </button>
//                         <button
//                           onClick={() => handleToggleStatus(lorry._id, lorry.status)}
//                           className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                         >
//                           <Power className="h-4 w-4" />
//                           Change Status
//                         </button>
//                         <button
//                           onClick={() => handleDeleteLorry(lorry._id, lorry.registration_number)}
//                           className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                           Delete Lorry
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Status Badge */}
//                 <div className="mb-4">
//                   {getStatusBadge(lorry.status)}
//                 </div>
//               </div>

//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
//           <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">No lorries found</h3>
//           <p className="text-gray-600 mb-6">
//             {searchText || filterStatus !== "all" 
//               ? "Try adjusting your search or filters"
//               : "Get started by adding your first lorry to the fleet"
//             }
//           </p>
//           <Link
//             to="/lorries/create"
//             className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
//           >
//             <FaPlus size={16} />
//             Add First Lorry
//           </Link>
//         </div>
//       )}

//       {/* Lorry Details Modal */}
//       <AnimatePresence>
//         {selectedLorry && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//             onClick={() => setSelectedLorry(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-2xl shadow-xl max-w-md w-full"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-xl font-bold text-gray-900">
//                     {selectedLorry.registration_number}
//                   </h3>
//                   <button
//                     onClick={() => setSelectedLorry(null)}
//                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                   >
//                     ✕
//                   </button>
//                 </div>
                
//                 <div className="space-y-4">
//                   <div>
//                     <label className="text-sm font-medium text-gray-700">Nick Name</label>
//                     <p className="text-gray-900">{selectedLorry.nick_name || "Not set"}</p>
//                   </div>
                  
//                   <div>
//                     <label className="text-sm font-medium text-gray-700">Status</label>
//                     <div className="mt-1">{getStatusBadge(selectedLorry.status)}</div>
//                   </div>
                  
//                   <div>
//                     <label className="text-sm font-medium text-gray-700">Owner</label>
//                     <p className="text-gray-900">{selectedLorry.owner_id?.name || "-"}</p>
//                   </div>
                  
//                   <div>
//                     <label className="text-sm font-medium text-gray-700">Last Updated</label>
//                     <p className="text-gray-900">{new Date(selectedLorry.updatedAt).toLocaleString()}</p>
//                   </div>
//                 </div>
                
//                 <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
//                   <button
//                     onClick={() => navigate(`/lorries/edit/${selectedLorry._id}`)}
//                     className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Edit Lorry
//                   </button>
//                   <button
//                     onClick={() => setSelectedLorry(null)}
//                     className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Lorries;

import React, { useEffect, useState } from "react";
import api from "../../api/client";
import {
  Mail,
  Power,
  Search,
  Truck,
  Wrench,
  Clock,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Lorry {
  _id: string;
  owner_id: { _id: string; name: string; company_name?: string };
  registration_number: string;
  nick_name?: string;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const Lorries = () => {
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "maintenance" | "inactive">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLorry, setSelectedLorry] = useState<Lorry | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchLorries = async () => {
    try {
      const res = await api.get("/lorries");
      setLorries(res.data.data?.lorries || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch lorries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLorries();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      let newStatus: string;
      
      switch (currentStatus) {
        case 'active':
          newStatus = 'maintenance';
          break;
        case 'maintenance':
          newStatus = 'inactive';
          break;
        case 'inactive':
          newStatus = 'active';
          break;
        default:
          newStatus = 'active';
      }

      await api.patch(`/lorries/status/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      setShowActionMenu(null);
      fetchLorries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const handleDeleteLorry = async (id: string, registrationNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete lorry ${registrationNumber}?`)) {
      return;
    }

    try {
      await api.delete(`/lorries/delete/${id}`);
      toast.success("Lorry deleted successfully");
      setShowActionMenu(null);
      fetchLorries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete lorry");
    }
  };

  // Handle card click to navigate to trips
  const handleCardClick = (lorryId: string) => {
    navigate(`/lorries/${lorryId}/trips`);
  };

  // ✅ Apply Search + Filters
  const filtered = lorries.filter((lorry) => {
    const matchesSearch =
      lorry.registration_number.toLowerCase().includes(searchText.toLowerCase()) ||
      lorry.nick_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      lorry.owner_id?.name?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus =
      filterStatus === "all" || lorry.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: "🚚",
        label: "Active"
      },
      maintenance: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: "🔧",
        label: "Maintenance"
      },
      inactive: { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        icon: "⏸️",
        label: "Inactive"
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const resetFilters = () => {
    setSearchText("");
    setFilterStatus("all");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lorries</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filters Toggle */}
            <button
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <motion.span
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                ▼
              </motion.span>
              Filters
            </button>

            {/* Add Lorry */}
            <Link
              to="/lorries/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <FaPlus size={16} />
              Add Lorry
            </Link>
          </div>
        </div>

        {/* Filters (Animated Collapse) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by registration number or nick name..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="input input-bordered pl-9 w-full"
                  />
                </div>

                <select
                  className="input input-bordered w-full md:w-40"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 border text-sm"
                  onClick={resetFilters}
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((lorry) => (
            <div
              key={lorry._id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() =>
                {
                      handleCardClick(lorry._id)
                      localStorage.setItem('selectedLorry', JSON.stringify(lorry));
                }
              }
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {lorry.registration_number}
                    </h3>
                    {lorry.nick_name && (
                      <p className="text-gray-600 text-sm">{lorry.nick_name}</p>
                    )}
                  </div>
                  
                  {/* Action Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActionMenu(showActionMenu === lorry._id ? null : lorry._id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>

                    {showActionMenu === lorry._id && (
                      <div className="absolute right-0 top-10 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/lorries/edit/${lorry._id}`);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Lorry
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(lorry._id, lorry.status);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Power className="h-4 w-4" />
                          Change Status
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLorry(lorry._id, lorry.registration_number);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Lorry
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  {getStatusBadge(lorry.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
          <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No lorries found</h3>
          <p className="text-gray-600 mb-6">
            {searchText || filterStatus !== "all" 
              ? "Try adjusting your search or filters"
              : "Get started by adding your first lorry to the fleet"
            }
          </p>
          <Link
            to="/lorries/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            <FaPlus size={16} />
            Add First Lorry
          </Link>
        </div>
      )}
    </div>
  );
};

export default Lorries;
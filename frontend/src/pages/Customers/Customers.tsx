import React, { useEffect, useState } from "react";
import { 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Building, 
  X, 
  Clock, 
  Power,
  CheckCircle2,
  PauseCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  site_addresses: string[];
  isActive: boolean;
  owner_id: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data.data?.customers || []);
    } catch (error: any) {
      console.error("Failed to fetch customers", error);
      toast.error(error.response?.data?.error || "Failed to fetch customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const newStatus = !isActive;
      await api.put(`/customers/update/${id}`, { isActive: newStatus });
      toast.success(`Customer ${newStatus ? "activated" : "deactivated"} successfully`);
      setShowActionMenu(null);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const getStatusConfig = (isActive: boolean) => {
    if (isActive) {
      return {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle2,
        label: "Active",
        dotColor: "bg-green-500"
      };
    } else {
      return {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: PauseCircle,
        label: "Inactive",
        dotColor: "bg-red-500"
      };
    }
  };

  // Apply Search and Filter
  const filtered = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.site_addresses.some(site =>
        site.toLowerCase().includes(searchText.toLowerCase())
      );

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && customer.isActive) ||
      (filterStatus === "inactive" && !customer.isActive);

    return matchesSearch && matchesStatus;
  });

  const clearSearch = () => {
    setSearchText("");
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(null);
    if (showActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-sm text-gray-600">Manage your customer relationships</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchText && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Add Customer */}
            <Link
              to="/customers/create"
              className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium"
            >
              <FaPlus size={16} />
              <span className="hidden sm:inline">Add Customer</span>
            </Link>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === "all" 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === "active" 
                ? 'bg-green-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Active ({customers.filter(c => c.isActive).length})
          </button>
          <button
            onClick={() => setFilterStatus("inactive")}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === "inactive" 
                ? 'bg-red-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Inactive ({customers.filter(c => !c.isActive).length})
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((customer) => {
            const statusConfig = getStatusConfig(customer.isActive);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={customer._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98"
                onClick={() => navigate(`/customers/${customer._id}/trips`)}
              >
                <div className="p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate">
                        {customer.name}
                      </h3>
                    </div>

                    {/* Action Menu */}
                    <div className="relative ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionMenu(showActionMenu === customer._id ? null : customer._id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>

                      <AnimatePresence>
                        {showActionMenu === customer._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-10 z-30 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/customers/edit/${customer._id}`);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                              Edit Customer
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(customer._id, customer.isActive);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Power className="h-4 w-4 text-gray-500" />
                              {customer.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(customer);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <User className="h-4 w-4 text-gray-500" />
                              View Details
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${statusConfig.color}`}>
                      <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {statusConfig.label}
                    </div>

                    {/* Site Addresses Badge */}
                    {customer.site_addresses && customer.site_addresses.length > 0 && (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                        <MapPin className="h-3 w-3" />
                        {customer.site_addresses.length} Site{customer.site_addresses.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-3">
                    {/* Phone */}
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <div className="p-1.5 bg-white rounded-md shadow-sm">
                        <Phone className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{customer.phone}</span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <div className="p-1.5 bg-white rounded-md shadow-sm mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-2">{customer.address}</p>
                      </div>
                    </div>

                    {/* Created Date - Optional */}
                    {/* {customer.createdAt && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="p-1.5 bg-white rounded-md shadow-sm">
                          <Clock className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Added {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.floor((new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </p>
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
          <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {searchText || filterStatus !== "all" 
              ? "No customers found matching your criteria" 
              : "No customers yet"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchText && "Try a different search term"}
            {!searchText && filterStatus !== "all" && "Try changing the status filter"}
            {!searchText && filterStatus === "all" && "Get started by adding your first customer"}
          </p>
          <Link
            to="/customers/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium"
          >
            <FaPlus size={16} />
            Add Customer
          </Link>
        </div>
      )}

      {/* Customer Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {selectedCustomer.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusConfig(selectedCustomer.isActive).color}`}>
                          {/* <StatusIcon className="h-3 w-3" /> */}
                          {getStatusConfig(selectedCustomer.isActive).label}
                        </span>
                        <p className="text-gray-600">Customer Details</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Contact Information
                    </h4>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <div className="flex items-center gap-2 mt-1 text-gray-900">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {selectedCustomer.phone}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <div className="flex items-start gap-2 mt-1 text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{selectedCustomer.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Timestamps */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Status Information
                    </h4>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusConfig(selectedCustomer.isActive).color}`}>
                          {/* <StatusIcon className="h-4 w-4" /> */}
                          {selectedCustomer.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Created</label>
                      <p className="text-gray-900 mt-1">
                        {new Date(selectedCustomer.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="text-gray-900 mt-1">
                        {new Date(selectedCustomer.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Site Addresses */}
                  {selectedCustomer.site_addresses.length > 0 && (
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                        Site Addresses ({selectedCustomer.site_addresses.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedCustomer.site_addresses.map((site, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{site}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/customers/edit/${selectedCustomer._id}`)}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Edit Customer
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedCustomer._id, selectedCustomer.isActive)}
                    className={`flex-1 py-2.5 rounded-lg transition-colors font-medium ${
                      selectedCustomer.isActive
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    {selectedCustomer.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
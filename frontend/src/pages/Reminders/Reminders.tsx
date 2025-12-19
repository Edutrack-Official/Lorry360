import React, { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  Filter,
  ChevronDown,
  RotateCcw,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal"; // Import the modal

interface Reminder {
  _id: string;
  note: string;
  date: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "done">("pending");
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow" | "week" | "month" | "custom">("today");
  const [selectedDate, setSelectedDate] = useState("");
  const [todaysCount, setTodaysCount] = useState(0);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<{id: string, note: string} | null>(null);

  const navigate = useNavigate();

  const fetchReminders = async () => {
    try {
      setLoading(true);
      
      // First fetch all reminders
      const res = await api.get("/reminders");
      const allReminders = res.data.data?.reminders || [];
      setReminders(allReminders);
      
      // Calculate today's reminders count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todaysReminders = allReminders.filter((reminder: Reminder) => {
        const reminderDate = new Date(reminder.date);
        reminderDate.setHours(0, 0, 0, 0);
        return reminderDate.getTime() === today.getTime() && !reminder.done;
      });
      setTodaysCount(todaysReminders.length);
      
      // Apply initial filters
      applyFilters(allReminders);
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch reminders");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (remindersToFilter: Reminder[]) => {
    let filtered = [...remindersToFilter];

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(reminder => 
        filterStatus === "pending" ? !reminder.done : reminder.done
      );
    }

    // Apply date filter
    if (dateFilter !== "all" || selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === "today") {
        filtered = filtered.filter(reminder => {
          const reminderDate = new Date(reminder.date);
          reminderDate.setHours(0, 0, 0, 0);
          return reminderDate.getTime() === today.getTime();
        });
      } else if (dateFilter === "tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(reminder => {
          const reminderDate = new Date(reminder.date);
          reminderDate.setHours(0, 0, 0, 0);
          return reminderDate.getTime() === tomorrow.getTime();
        });
      } else if (dateFilter === "week") {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        filtered = filtered.filter(reminder => {
          const reminderDate = new Date(reminder.date);
          reminderDate.setHours(0, 0, 0, 0);
          return reminderDate >= today && reminderDate <= weekEnd;
        });
      } else if (dateFilter === "month") {
        const monthEnd = new Date(today);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        filtered = filtered.filter(reminder => {
          const reminderDate = new Date(reminder.date);
          reminderDate.setHours(0, 0, 0, 0);
          return reminderDate >= today && reminderDate <= monthEnd;
        });
      } else if (selectedDate) {
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);
        const nextDay = new Date(selected);
        nextDay.setDate(nextDay.getDate() + 1);
        filtered = filtered.filter(reminder => {
          const reminderDate = new Date(reminder.date);
          reminderDate.setHours(0, 0, 0, 0);
          return reminderDate >= selected && reminderDate < nextDay;
        });
      }
    }

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(reminder => 
        reminder.note.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Sort by date (ascending) and then by done status (pending first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.done === b.done ? 0 : a.done ? 1 : -1;
    });

    setFilteredReminders(filtered);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    applyFilters(reminders);
  }, [searchText, filterStatus, dateFilter, selectedDate, reminders]);

  const handleToggleStatus = async (id: string, currentDone: boolean) => {
    try {
      await api.patch(`/reminders/${id}/status`, { done: !currentDone });
      toast.success(!currentDone ? "Marked as done ✓" : "Marked as pending");
      setShowActionMenu(null);
      fetchReminders(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update reminder");
    }
  };

  const handleDeleteClick = (id: string, note: string) => {
    setReminderToDelete({ id, note });
    setShowDeleteModal(true);
    setShowActionMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!reminderToDelete) return;
    
    try {
      setDeleting(true);
      await api.delete(`/reminders/${reminderToDelete.id}`);
      toast.success("Reminder deleted successfully");
      fetchReminders(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete reminder");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setReminderToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setReminderToDelete(null);
  };

  const getStatusConfig = (done: boolean) => {
    return done ? {
      color: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
      label: "Done",
      dotColor: "bg-green-500"
    } : {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Clock,
      label: "Pending",
      dotColor: "bg-blue-500 animate-pulse"
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const resetFilters = () => {
    setSearchText("");
    setFilterStatus("all");
    setDateFilter("all");
    setSelectedDate("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchText) count++;
    if (filterStatus !== "all") count++;
    if (dateFilter !== "all" || selectedDate) count++;
    return count;
  };

  const getFilterSummary = () => {
    const parts = [];
    if (filterStatus !== "all") parts.push(filterStatus);
    if (dateFilter !== "all") parts.push(dateFilter);
    if (selectedDate) parts.push("specific date");
    if (searchText) parts.push("search");
    
    if (parts.length === 0) return "All reminders";
    return parts.join(", ").replace(/\b\w/g, l => l.toUpperCase());
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
          <div className="px-4 py-4 sm:px-6">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reminders</h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {todaysCount > 0 ? `${todaysCount} due today` : 'No reminders due today'}
                  </p>
                </div>
              </div>

              <Link
                to="/reminders/create"
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm sm:text-base font-medium"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Add Reminder</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search reminders..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Filter Summary */}
            {getActiveFiltersCount() > 0 && (
              <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">
                      {getFilterSummary()} • {filteredReminders.length} found
                    </span>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Quick Filters Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {/* Status Filters */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      filterStatus === "all" ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus("pending")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      filterStatus === "pending" ? 'bg-purple-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilterStatus("done")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      filterStatus === "done" ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Done
                  </button>
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setDateFilter("today");
                      setSelectedDate("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      dateFilter === "today" ? 'bg-amber-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter("tomorrow");
                      setSelectedDate("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      dateFilter === "tomorrow" ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter("week");
                      setSelectedDate("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      dateFilter === "week" ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    This Week
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {filteredReminders.length > 0 ? (
            <div className="space-y-3">
              {filteredReminders.map((reminder) => {
                const statusConfig = getStatusConfig(reminder.done);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={reminder._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} border`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}></span>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </div>
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {formatDate(reminder.date)}
                            </div>
                          </div>
                          
                          <h3 className={`font-bold text-base sm:text-lg mb-1 ${reminder.done ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {reminder.note}
                          </h3>
                        </div>
                        
                        {/* Action Menu */}
                        <div className="relative ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowActionMenu(showActionMenu === reminder._id ? null : reminder._id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </button>

                          <AnimatePresence>
                            {showActionMenu === reminder._id && (
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
                                    handleToggleStatus(reminder._id, reminder.done);
                                  }}
                                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  {reminder.done ? (
                                    <>
                                      <Clock className="h-4 w-4 text-blue-500" />
                                      Mark as Pending
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                      Mark as Done
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/reminders/edit/${reminder._id}`);
                                  }}
                                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Edit className="h-4 w-4 text-gray-500" />
                                  Edit Reminder
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(reminder._id, reminder.note);
                                  }}
                                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Reminder
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Created {new Date(reminder.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short"
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {getActiveFiltersCount() > 0
                    ? "No reminders match your filters"
                    : "No reminders yet"
                  }
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {getActiveFiltersCount() > 0
                    ? "Try adjusting your filters or clear them to see all reminders"
                    : "Create reminders for payments, maintenance, and important tasks"
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add FAB for Mobile */}
        <Link
          to="/reminders/create"
          className="fixed bottom-6 right-6 sm:hidden p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Reminder"
        message={`Are you sure you want to delete "${reminderToDelete?.note}"? This action cannot be undone.`}
        isLoading={deleting}
        itemName={reminderToDelete?.note || ""}
      />
    </>
  );
};

export default Reminders;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import toast from "react-hot-toast";
import {
  Bell,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Edit,
  Trash2,
  Share2,
  Printer,
  AlertCircle,
  Info,
  Loader2
} from "lucide-react";
import BackButton from "../../components/BackButton";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal"; // Import the modal

interface Reminder {
  _id: string;
  note: string;  // Changed from title to note
  date: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

const ReminderDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReminder();
    }
  }, [id]);

  const fetchReminder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reminders/${id}`);
      setReminder(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch reminder details");
      navigate("/reminders");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!reminder) return;
    
    try {
      setUpdating(true);
      await api.patch(`/reminders/${id}/status`, { done: !reminder.done });
      toast.success(!reminder.done ? "Marked as done ✓" : "Marked as pending");
      fetchReminder();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reminder) return;
    
    try {
      setDeleting(true);
      await api.delete(`/reminders/${id}`);
      toast.success("Reminder deleted successfully");
      navigate("/reminders");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete reminder");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntil = () => {
    if (!reminder) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(reminder.date);
    reminderDate.setHours(0, 0, 0, 0);
    
    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays === -1) return "Yesterday";
    return `${Math.abs(diffDays)} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading reminder details...</p>
        </div>
      </div>
    );
  }

  if (!reminder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reminder not found</h3>
          <button
            onClick={() => navigate("/reminders")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to reminders
          </button>
        </div>
      </div>
    );
  }

  const daysUntil = getDaysUntil();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BackButton />
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Reminder Details</h2>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleStatus}
                  disabled={updating}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    reminder.done
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : reminder.done ? (
                    <>
                      <Clock className="h-4 w-4" />
                      Mark Pending
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Done
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
          {/* Status Card */}
          <div className={`mb-6 rounded-xl border p-4 sm:p-5 ${
            reminder.done
              ? 'bg-green-50 border-green-200'
              : daysUntil === "Today"
              ? 'bg-amber-50 border-amber-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className={`font-semibold text-lg mb-2 ${reminder.done ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                  {reminder.note}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    reminder.done
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {reminder.done ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        Pending
                      </>
                    )}
                  </div>
                  {daysUntil && (
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      daysUntil === "Today"
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : daysUntil === "Tomorrow"
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      <Calendar className="h-3 w-3" />
                      {daysUntil}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(`/reminders/edit/${reminder._id}`)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0 ml-2"
              >
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 sm:p-6">
              {/* Date & Time */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Reminder Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">{formatDate(reminder.date)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Created</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(reminder.createdAt)} at {formatTime(reminder.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(reminder.updatedAt)} at {formatTime(reminder.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 sm:static sm:border-0 sm:px-0 sm:py-0 sm:bg-transparent shadow-lg sm:shadow-none">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/reminders/edit/${reminder._id}`)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm sm:text-base"
              >
                <Edit className="h-4 w-4" />
                Edit Reminder
              </button>
              
              <button
                onClick={handleDeleteClick}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-red-600 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-all font-medium text-sm sm:text-base"
              >
                <Trash2 className="h-4 w-4" />
                Delete Reminder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Reminder"
        message={`Are you sure you want to delete this reminder? This action cannot be undone.`}
        isLoading={deleting}
        itemName={reminder.note}
      />
    </>
  );
};

export default ReminderDetails;
// // import React, { useEffect, useState } from "react";
// // import api from "../../api/client";
// // import toast from "react-hot-toast";
// // import { useNavigate, useParams } from "react-router-dom";
// // import BackButton from "../../components/BackButton";
// // import FloatingInput from "../../components/FloatingInput";
// // import {
// //   Bell,
// //   Save,
// //   X,
// //   ArrowLeft,
// //   Calendar,
// //   Info,
// //   Loader2,
// //   AlertCircle
// // } from "lucide-react";

// // interface FormData {
// //   note: string;  // Changed from title to note
// //   date: string;
// // }

// // interface FormErrors {
// //   note?: string;
// //   date?: string;
// // }

// // const initialFormData: FormData = {
// //   note: "",
// //   date: new Date().toISOString().split('T')[0] // Today's date
// // };

// // const ManageReminderForm: React.FC = () => {
// //   const { id } = useParams();
// //   const navigate = useNavigate();
// //   const [formData, setFormData] = useState<FormData>(initialFormData);
// //   const [errors, setErrors] = useState<FormErrors>({});
// //   const [submitting, setSubmitting] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const isEditMode = Boolean(id);

// //   useEffect(() => {
// //     if (isEditMode) {
// //       setLoading(true);
// //       api
// //         .get(`/reminders/${id}`)
// //         .then((res) => {
// //           const reminderData = res.data.data;
// //           const date = new Date(reminderData.date).toISOString().split('T')[0];
          
// //           setFormData({
// //             note: reminderData.note || "",
// //             date: date
// //           });
// //         })
// //         .catch((error) => {
// //           toast.error(error.response?.data?.error || "Failed to fetch reminder details");
// //           navigate("/reminders");
// //         })
// //         .finally(() => setLoading(false));
// //     }
// //   }, [id, isEditMode, navigate]);

// //   const validate = (): boolean => {
// //     const newErrors: FormErrors = {};
    
// //     if (!formData.note.trim()) {
// //       newErrors.note = "Note is required";
// //     } else if (formData.note.length < 3) {
// //       newErrors.note = "Note must be at least 3 characters";
// //     }

// //     if (!formData.date) {
// //       newErrors.date = "Date is required";
// //     } else {
// //       const selectedDate = new Date(formData.date);
// //       const today = new Date();
// //       today.setHours(0, 0, 0, 0);
      
// //       if (selectedDate < today) {
// //         newErrors.date = "Date cannot be in the past";
// //       }
// //     }

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleChange = (
// //     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
// //   ) => {
// //     const { name, value } = e.target;
    
// //     setFormData((prev) => ({
// //       ...prev,
// //       [name]: value,
// //     }));

// //     if (errors[name as keyof FormErrors]) {
// //       setErrors((prev) => ({ ...prev, [name]: undefined }));
// //     }
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!validate()) return;

// //     setSubmitting(true);
// //     try {
// //       if (isEditMode) {
// //         await api.put(`/reminders/${id}`, formData);
// //         toast.success("Reminder updated successfully");
// //       } else {
// //         await api.post("/reminders", formData);
// //         toast.success("Reminder created successfully");
// //         setFormData(initialFormData);
// //       }
// //       navigate("/reminders");
// //     } catch (error: any) {
// //       toast.error(error.response?.data?.error || "Operation failed");
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
// //         <div className="flex flex-col items-center gap-3">
// //           <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
// //           <p className="text-sm text-gray-600">Loading reminder details...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* Header */}
// //       <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
// //         <div className="px-4 py-4 sm:px-6">
// //           <div className="flex items-center gap-3">
// //             <BackButton />
// //             <div className="flex items-center gap-2 flex-1">
// //               <div className="p-2 bg-blue-100 rounded-lg">
// //                 <Bell className="h-5 w-5 text-blue-600" />
// //               </div>
// //               <div>
// //                 <h2 className="text-lg sm:text-xl font-bold text-gray-900">
// //                   {isEditMode ? "Edit Reminder" : "Add New Reminder"}
// //                 </h2>
// //                 <p className="text-xs text-gray-500 mt-0.5">
// //                   {isEditMode ? "Update reminder details" : "Create a new reminder"}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Form Content */}
// //       <div className="p-4 sm:p-6 max-w-2xl mx-auto">
// //         <form onSubmit={handleSubmit} className="space-y-6">
// //           {/* Main Form Card */}
// //           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
// //             <div className="p-4 sm:p-6 space-y-6">
// //               {/* Note */}
// //               <div>
// //                 <label className="block text-sm font-semibold text-gray-900 mb-2">
// //                   Note *
// //                 </label>
// //                 <textarea
// //                   name="note"
// //                   value={formData.note}
// //                   onChange={handleChange}
// //                   rows={4}
// //                   placeholder="e.g., Clear cheque payment for customer ABC..."
// //                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
// //                 />
// //                 {errors.note && (
// //                   <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
// //                     <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
// //                     {errors.note}
// //                   </p>
// //                 )}
            
// //               </div>

// //               {/* Date */}
// //               <div>
// //                 <label className="block text-sm font-semibold text-gray-900 mb-2">
// //                   Date *
// //                 </label>
// //                 <div className="relative">
// //                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
// //                   <input
// //                     type="date"
// //                     name="date"
// //                     value={formData.date}
// //                     onChange={handleChange}
// //                     min={new Date().toISOString().split('T')[0]}
// //                     className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
// //                   />
// //                 </div>
// //                 {errors.date && (
// //                   <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
// //                     <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
// //                     {errors.date}
// //                   </p>
// //                 )}
// //                 <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
// //                   <Info className="h-3 w-3" />
// //                   Set the date when this reminder should appear
// //                 </p>
// //               </div>
// //             </div>
// //           </div>

   

// //           {/* Action Buttons */}
// //           <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 sm:relative sm:bg-transparent sm:border-0 sm:p-0 shadow-lg sm:shadow-none">
// //             <div className="flex flex-col sm:flex-row gap-3">
// //               {/* Primary Action */}
// //               <button
// //                 type="submit"
// //                 disabled={submitting}
// //                 className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all font-medium shadow-sm text-sm sm:text-base"
// //               >
// //                 {submitting ? (
// //                   <>
// //                     <Loader2 className="h-4 w-4 animate-spin" />
// //                     {isEditMode ? "Updating..." : "Creating..."}
// //                   </>
// //                 ) : (
// //                   <>
// //                     <Save className="h-4 w-4" />
// //                     {isEditMode ? "Update Reminder" : "Create Reminder"}
// //                   </>
// //                 )}
// //               </button>

// //               {/* Cancel Button */}
// //               <button
// //                 type="button"
// //                 onClick={() => navigate("/reminders")}
// //                 disabled={submitting}
// //                 className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-medium text-sm sm:text-base disabled:opacity-50"
// //               >
// //                 <X className="h-4 w-4" />
// //                 Cancel
// //               </button>

// //               {/* Back to Reminders - Desktop Only */}
// //               {isEditMode && (
// //                 <button
// //                   type="button"
// //                   onClick={() => navigate("/reminders")}
// //                   className="hidden sm:inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-medium sm:ml-auto"
// //                 >
// //                   <ArrowLeft className="h-4 w-4" />
// //                   Back to Reminders
// //                 </button>
// //               )}
// //             </div>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ManageReminderForm;

// import React, { useEffect, useState } from "react";
// import api from "../../api/client";
// import toast from "react-hot-toast";
// import { useNavigate, useParams } from "react-router-dom";
// import BackButton from "../../components/BackButton";
// import FloatingInput from "../../components/FloatingInput";
// import {
//   Bell,
//   Save,
//   X,
//   ArrowLeft,
//   Calendar,
//   Info,
//   Loader2,
//   AlertCircle,
//   MessageCircle
// } from "lucide-react";

// interface FormData {
//   note: string;
//   date: string;
//   sendWhatsapp: boolean;
// }

// interface FormErrors {
//   note?: string;
//   date?: string;
// }

// const initialFormData: FormData = {
//   note: "",
//   date: new Date().toISOString().split('T')[0], // Today's date
//   sendWhatsapp: true // Enable WhatsApp by default
// };

// const ManageReminderForm: React.FC = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState<FormData>(initialFormData);
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [submitting, setSubmitting] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const isEditMode = Boolean(id);

//   useEffect(() => {
//     if (isEditMode) {
//       setLoading(true);
//       api
//         .get(`/reminders/${id}`)
//         .then((res) => {
//           const reminderData = res.data.data;
          
//           // ⛔ Check if reminder is locked
//           if (reminderData.done || reminderData.whatsappSent) {
//             toast.error("This reminder is locked and cannot be edited");
//             navigate("/reminders");
//             return;
//           }
          
//           const date = new Date(reminderData.date).toISOString().split('T')[0];
          
//           setFormData({
//             note: reminderData.note || "",
//             date: date,
//             sendWhatsapp: reminderData.sendWhatsapp !== false // Default to true if not specified
//           });
//         })
//         .catch((error) => {
//           toast.error(error.response?.data?.error || "Failed to fetch reminder details");
//           navigate("/reminders");
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [id, isEditMode, navigate]);

//   const validate = (): boolean => {
//     const newErrors: FormErrors = {};
    
//     if (!formData.note.trim()) {
//       newErrors.note = "Note is required";
//     } else if (formData.note.length < 3) {
//       newErrors.note = "Note must be at least 3 characters";
//     }

//     if (!formData.date) {
//       newErrors.date = "Date is required";
//     } else {
//       const selectedDate = new Date(formData.date);
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
      
//       if (selectedDate < today) {
//         newErrors.date = "Date cannot be in the past";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
    
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (errors[name as keyof FormErrors]) {
//       setErrors((prev) => ({ ...prev, [name]: undefined }));
//     }
//   };

//   const handleToggleWhatsapp = () => {
//     setFormData((prev) => ({
//       ...prev,
//       sendWhatsapp: !prev.sendWhatsapp
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setSubmitting(true);
//     try {
//       if (isEditMode) {
//         await api.put(`/reminders/${id}`, formData);
//         toast.success("Reminder updated successfully");
//       } else {
//         await api.post("/reminders", formData);
//         toast.success("Reminder created successfully");
//         setFormData(initialFormData);
//       }
//       navigate("/reminders");
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || "Operation failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
//           <p className="text-sm text-gray-600">Loading reminder details...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
//         <div className="px-4 py-4 sm:px-6">
//           <div className="flex items-center gap-3">
//             <BackButton />
//             <div className="flex items-center gap-2 flex-1">
//               {/* <div className="p-2 bg-blue-100 rounded-lg">
//                 <Bell className="h-5 w-5 text-blue-600" />
//               </div> */}
//               <div>
//                 <h2 className="text-lg sm:text-xl font-bold text-gray-900">
//                   {isEditMode ? "Edit Reminder" : "Add New Reminder"}
//                 </h2>
//                 <p className="text-xs text-gray-500 mt-0.5">
//                   {isEditMode ? "Update reminder details" : "Create a new reminder"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Form Content */}
//       <div className="p-4 sm:p-6 max-w-2xl mx-auto">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Main Form Card */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//             <div className="p-4 sm:p-6 space-y-6">
//               {/* Note */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-900 mb-2">
//                   Note *
//                 </label>
//                 <textarea
//                   name="note"
//                   value={formData.note}
//                   onChange={handleChange}
//                   rows={4}
//                   placeholder="e.g., Clear cheque payment for customer ABC..."
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
//                 />
//                 {errors.note && (
//                   <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
//                     <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                     {errors.note}
//                   </p>
//                 )}
//               </div>

//               {/* Date */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-900 mb-2">
//                   Date *
//                 </label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
//                   <input
//                     type="date"
//                     name="date"
//                     value={formData.date}
//                     onChange={handleChange}
//                     min={new Date().toISOString().split('T')[0]}
//                     className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                   />
//                 </div>
//                 {errors.date && (
//                   <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
//                     <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                     {errors.date}
//                   </p>
//                 )}
//                 <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
//                   <Info className="h-3 w-3" />
//                   Set the date when this reminder should appear
//                 </p>
//               </div>

//               {/* Push Notification Toggle */}
//               <div className="border-t border-gray-200 pt-6">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <MessageCircle className="h-4 w-4 text-blue-600" />
//                       <label className="text-sm font-semibold text-gray-900">
//                         Push Notification
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       Send a Push notification on the reminder date
//                     </p>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={handleToggleWhatsapp}
//                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
//                       formData.sendWhatsapp ? 'bg-blue-600' : 'bg-gray-200'
//                     }`}
//                   >
//                     <span
//                       className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                         formData.sendWhatsapp ? 'translate-x-6' : 'translate-x-1'
//                       }`}
//                     />
//                   </button>
//                 </div>
                
//                 {formData.sendWhatsapp && (
//                   <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                     <p className="text-xs text-blue-700 flex items-start gap-1">
//                       <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
//                       A Push message will be sent on the reminder date to notify you
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 sm:relative sm:bg-transparent sm:border-0 sm:p-0 shadow-lg sm:shadow-none">
//             <div className="flex flex-col sm:flex-row gap-3">
//               {/* Primary Action */}
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all font-medium shadow-sm text-sm sm:text-base"
//               >
//                 {submitting ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     {isEditMode ? "Updating..." : "Creating..."}
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4" />
//                     {isEditMode ? "Update Reminder" : "Create Reminder"}
//                   </>
//                 )}
//               </button>

//               {/* Cancel Button */}
//               <button
//                 type="button"
//                 onClick={() => navigate("/reminders")}
//                 disabled={submitting}
//                 className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-medium text-sm sm:text-base disabled:opacity-50"
//               >
//                 <X className="h-4 w-4" />
//                 Cancel
//               </button>

//               {/* Back to Reminders - Desktop Only */}
//               {isEditMode && (
//                 <button
//                   type="button"
//                   onClick={() => navigate("/reminders")}
//                   className="hidden sm:inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-medium sm:ml-auto"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Back to Reminders
//                 </button>
//               )}
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ManageReminderForm;

import React, { useEffect, useState } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import FloatingInput from "../../components/FloatingInput";
import {
  Bell,
  Save,
  X,
  ArrowLeft,
  Calendar,
  Info,
  Loader2,
  AlertCircle
} from "lucide-react";

interface FormData {
  note: string;  // Changed from title to note
  date: string;
}

interface FormErrors {
  note?: string;
  date?: string;
}

const initialFormData: FormData = {
  note: "",
  date: new Date().toISOString().split('T')[0] // Today's date
};

const ManageReminderForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      api
        .get(`/reminders/${id}`)
        .then((res) => {
          const reminderData = res.data.data;
          const date = new Date(reminderData.date).toISOString().split('T')[0];
          
          setFormData({
            note: reminderData.note || "",
            date: date
          });
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || "Failed to fetch reminder details");
          navigate("/reminders");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, navigate]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.note.trim()) {
      newErrors.note = "Note is required";
    } else if (formData.note.length < 3) {
      newErrors.note = "Note must be at least 3 characters";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/reminders/${id}`, formData);
        toast.success("Reminder updated successfully");
      } else {
        await api.post("/reminders", formData);
        toast.success("Reminder created successfully");
        setFormData(initialFormData);
      }
      navigate("/reminders");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading reminder details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {isEditMode ? "Edit Reminder" : "Add New Reminder"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEditMode ? "Update reminder details" : "Create a new reminder"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Note *
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g., Clear cheque payment for customer ABC..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
                {errors.note && (
                  <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {errors.note}
                  </p>
                )}
            
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                {errors.date && (
                  <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {errors.date}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Set the date when this reminder should appear
                </p>
              </div>
            </div>
          </div>

   

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 sm:relative sm:bg-transparent sm:border-0 sm:p-0 shadow-lg sm:shadow-none">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary Action */}
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all font-medium shadow-sm text-sm sm:text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? "Update Reminder" : "Create Reminder"}
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => navigate("/reminders")}
                disabled={submitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-medium text-sm sm:text-base disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              {/* Back to Reminders - Desktop Only */}
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => navigate("/reminders")}
                  className="hidden sm:inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-medium sm:ml-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Reminders
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageReminderForm;
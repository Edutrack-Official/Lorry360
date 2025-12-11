// import React, { useState, useEffect } from 'react';
// import { 
//   User, 
//   Building, 
//   Mail, 
//   Phone, 
//   Calendar,
//   Edit,
//   Save,
//   X,
//   Camera,
//   Loader2,
//   Shield,
//   CheckCircle,
//   AlertCircle,
//   MapPin,
//   Briefcase,
//   AlertTriangle,
//   Trash2,
//   ChevronDown
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from '../api/client';
// import { useAuth } from '../contexts/AuthContext';

// // Popular country codes
// const COUNTRY_CODES = [
//   { code: '+91', country: 'India'},
// //   { code: '+1', country: 'United States', flag: '🇺🇸' },
// //   { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
// //   { code: '+86', country: 'China', flag: '🇨🇳' },
// //   { code: '+81', country: 'Japan', flag: '🇯🇵' },
// //   { code: '+49', country: 'Germany', flag: '🇩🇪' },
// //   { code: '+33', country: 'France', flag: '🇫🇷' },
// //   { code: '+61', country: 'Australia', flag: '🇦🇺' },
// //   { code: '+971', country: 'UAE', flag: '🇦🇪' },
// //   { code: '+65', country: 'Singapore', flag: '🇸🇬' },
// //   { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
// //   { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
// //   { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
// //   { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
// //   { code: '+977', country: 'Nepal', flag: '🇳🇵' },
// ];

// interface UserProfile {
//   _id: string;
//   name: string;
//   email: string;
//   phone: string;
//   role: 'admin' | 'owner';
//   company_name?: string;
//   address?: string;
//   city?: string;
//   state?: string;
//   pincode?: string;
//   plan_type?: 'trial' | 'basic' | 'professional' | 'enterprise';
//   logo?: string;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// interface EditFormData {
//   name: string;
//   phone: string;
//   countryCode: string;
//   company_name: string;
//   address: string;
//   city: string;
//   state: string;
//   pincode: string;
// }

// // Delete Confirmation Modal Component
// interface DeleteConfirmationModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   title: string;
//   message: string;
//   isLoading?: boolean;
//   itemName?: string;
// }

// const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   title,
//   message,
//   isLoading = false,
//   itemName = ""
// }) => {
//   if (!isOpen) return null;

//   return (
//     <>
//       {/* Backdrop */}
//       <div 
//         onClick={onClose}
//         className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
//       />

//       {/* Modal */}
//       <div className="fixed inset-0 z-50 overflow-y-auto">
//         <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
//           <div className="relative w-full max-w-md mx-auto">
//             <div className="relative rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-hidden">
//               {/* Close Button */}
//               <button
//                 onClick={onClose}
//                 className="absolute right-3 top-3 sm:right-4 sm:top-4 p-2 hover:bg-gray-100 rounded-lg transition-all z-10 group"
//                 disabled={isLoading}
//               >
//                 <X className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
//               </button>

//               {/* Content */}
//               <div className="p-5 sm:p-6">
//                 <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6 pr-8">
//                   <div className="p-2.5 sm:p-3 rounded-full bg-red-50 text-red-600 flex-shrink-0">
//                     <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
//                   </div>
//                   <div className="flex-1 pt-0.5 sm:pt-1">
//                     <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight">
//                       {title}
//                     </h3>
//                     <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{message}</p>
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
//                   <button
//                     onClick={onClose}
//                     disabled={isLoading}
//                     className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 text-sm sm:text-base active:scale-95"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={onConfirm}
//                     disabled={isLoading}
//                     className="flex-1 px-4 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-red-500/30 active:scale-95"
//                   >
//                     {isLoading ? (
//                       <>
//                         <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                         <span>Deleting...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Trash2 className="h-4 w-4" />
//                         <span>Delete</span>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// const ProfilePage: React.FC = () => {
//   const { user: authUser } = useAuth();
//   const [user, setUser] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState<EditFormData>({
//     name: '',
//     phone: '',
//     countryCode: '+91',
//     company_name: '',
//     address: '',
//     city: '',
//     state: '',
//     pincode: ''
//   });
//   const [isSaving, setIsSaving] = useState(false);
//   const [logoUploading, setLogoUploading] = useState(false);
//   const [logoPreview, setLogoPreview] = useState<string | null>(null);
//   const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
//   // State for delete confirmation modal
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [deletingLogo, setDeletingLogo] = useState(false);

//   useEffect(() => {
//     fetchUserProfile();
//   }, []);

//   const fetchUserProfile = async () => {
//     try {
//       if (!authUser) {
//         console.error('User not authenticated');
//         toast.error('Please login to continue');
//         window.location.href = '/login';
//         return;
//       }

//       const userId = authUser.userId;

//       if (!userId) {
//         console.error('User ID not found in auth context');
//         toast.error('Authentication required');
//         return;
//       }

//       console.log('Fetching profile for user ID:', userId);
      
//       const response = await api.get(`/users/${userId}`);
      
//       if (response.data.success) {
//         const userData = response.data.data;
//         console.log('User data received:', userData);
        
//         setUser(userData);
        
//         // Parse phone number to extract country code
//         const phoneStr = userData.phone || '';
//         let extractedCode = '+91';
//         let phoneNumber = phoneStr;
        
//         if (phoneStr) {
//           const match = phoneStr.match(/^(\+\d+)-(.+)$/);
//           if (match) {
//             extractedCode = match[1];
//             phoneNumber = match[2];
//           }
//         }
        
//         setFormData({
//           name: userData.name || '',
//           phone: phoneNumber,
//           countryCode: extractedCode,
//           company_name: userData.company_name || '',
//           address: userData.address || '',
//           city: userData.city || '',
//           state: userData.state || '',
//           pincode: userData.pincode || ''
//         });
        
//         if (userData.logo) {
//           console.log('Setting logo preview:', userData.logo);
//           setLogoPreview(userData.logo);
//         }
//       } else {
//         throw new Error(response.data.error || 'Failed to load profile');
//       }
//     } catch (error: any) {
//       console.error('Profile fetch error:', error);
      
//       if (error.response?.status === 401) {
//         toast.error('Session expired. Please login again.');
//         window.location.href = '/login';
//       } else if (error.response?.status === 404) {
//         toast.error('User profile not found');
//       } else if (error.response?.status === 403) {
//         toast.error('Access denied. You do not have permission to view this profile.');
//       } else {
//         toast.error(error.response?.data?.error || 'Failed to load profile');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditToggle = () => {
//     if (isEditing) {
//       // Parse phone number when resetting
//       const phoneStr = user?.phone || '';
//       let extractedCode = '+91';
//       let phoneNumber = phoneStr;
      
//       if (phoneStr) {
//         const match = phoneStr.match(/^(\+\d+)-(.+)$/);
//         if (match) {
//           extractedCode = match[1];
//           phoneNumber = match[2];
//         }
//       }
      
//       // Reset form to original values
//       setFormData({
//         name: user?.name || '',
//         phone: phoneNumber,
//         countryCode: extractedCode,
//         company_name: user?.company_name || '',
//         address: user?.address || '',
//         city: user?.city || '',
//         state: user?.state || '',
//         pincode: user?.pincode || ''
//       });
//     }
//     setIsEditing(!isEditing);
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSaveProfile = async () => {
//     if (!user) return;

//     setIsSaving(true);
//     try {
//       // Combine country code and phone number
//       const fullPhone = `${formData.countryCode}-${formData.phone}`;
      
//       // Prepare update data as JSON
//       const updateData: any = {
//         name: formData.name,
//         phone: fullPhone,
//         role: user.role,
//       };

//       // Add owner-specific fields if user is owner
//       if (user.role === 'owner') {
//         updateData.company_name = formData.company_name;
//         updateData.address = formData.address;
//         updateData.city = formData.city;
//         updateData.state = formData.state;
//         updateData.pincode = formData.pincode;
//       }

//       console.log('Updating profile with data:', updateData);
      
//       const response = await api.put(`/users/update/${user._id}`, updateData);
      
//       if (response.data.success) {
//         const updatedUser = response.data.data;
//         console.log('Profile update successful:', updatedUser);
        
//         setUser(updatedUser);
//         toast.success('Profile updated successfully');
//         setIsEditing(false);
//       } else {
//         throw new Error(response.data.error || 'Update failed');
//       }
//     } catch (error: any) {
//       console.error('Profile update error:', error);
      
//       if (error.response?.status === 400) {
//         const errorMsg = error.response?.data?.error;
//         if (errorMsg?.includes('Phone must be in format')) {
//           toast.error('Phone number must be in correct format');
//         } else if (errorMsg?.includes('Pincode must be 6 digits')) {
//           toast.error('Pincode must be 6 digits');
//         } else {
//           toast.error(errorMsg || 'Validation error');
//         }
//       } else if (error.response?.status === 401) {
//         toast.error('Session expired. Please login again.');
//         window.location.href = '/login';
//       } else {
//         toast.error(error.response?.data?.error || 'Failed to update profile');
//       }
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file || !user) return;

//     if (!file.type.startsWith('image/')) {
//       toast.error('Please select an image file');
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       toast.error('Image must be less than 5MB');
//       return;
//     }

//     setLogoUploading(true);
    
//     try {
//       const logoFormData = new FormData();
//       logoFormData.append('logo', file);

//       console.log('Uploading logo for user:', user._id);
      
//       const response = await api.post(`/users/${user._id}/logo`, logoFormData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       if (response.data.success) {
//         const updatedUser = response.data.data;
//         console.log('Logo upload successful:', updatedUser);
        
//         setUser(updatedUser);
        
//         if (updatedUser.logo) {
//           setLogoPreview(updatedUser.logo);
//         }
//         toast.success('Logo uploaded successfully');
//       } else {
//         throw new Error(response.data.error || 'Upload failed');
//       }
//     } catch (error: any) {
//       console.error('Logo upload error:', error);
      
//       if (error.response?.status === 400) {
//         const errorMsg = error.response?.data?.error;
//         if (errorMsg?.includes('Invalid logo file type')) {
//           toast.error('Invalid image type. Use JPEG, PNG, GIF, or WebP');
//         } else if (errorMsg?.includes('exceeds 5MB limit')) {
//           toast.error('Image size exceeds 5MB limit');
//         } else {
//           toast.error(errorMsg || 'Upload failed');
//         }
//       } else if (error.response?.status === 401) {
//         toast.error('Session expired. Please login again.');
//         window.location.href = '/login';
//       } else {
//         toast.error(error.response?.data?.error || 'Failed to upload logo');
//       }
//     } finally {
//       setLogoUploading(false);
//       if (event.target) {
//         event.target.value = '';
//       }
//     }
//   };

//   // Open delete confirmation modal
//   const handleDeleteLogoClick = () => {
//     if (!user || !user.logo) return;
//     setDeleteModalOpen(true);
//   };

//   // Handle confirmed logo deletion
//   const handleConfirmDeleteLogo = async () => {
//     if (!user) return;

//     setDeletingLogo(true);
//     try {
//       console.log('Deleting logo for user:', user._id);
      
//       const response = await api.delete(`/users/${user._id}/logo`);
      
//       if (response.data.success) {
//         console.log('Logo delete successful');
        
//         // Fetch fresh user data after logo deletion
//         const freshResponse = await api.get(`/users/${user._id}`);
        
//         if (freshResponse.data.success) {
//           const freshUserData = freshResponse.data.data;
//           console.log('Fresh user data after logo delete:', freshUserData);
          
//           setUser(freshUserData);
//           setLogoPreview(null);
//           toast.success('Logo removed successfully');
//           setDeleteModalOpen(false);
//         } else {
//           throw new Error('Failed to fetch updated profile');
//         }
//       } else {
//         throw new Error(response.data.error || 'Delete failed');
//       }
//     } catch (error: any) {
//       console.error('Logo delete error:', error);
      
//       if (error.response?.status === 401) {
//         toast.error('Session expired. Please login again.');
//         window.location.href = '/login';
//       } else {
//         toast.error(error.response?.data?.error || 'Failed to remove logo');
//       }
//     } finally {
//       setDeletingLogo(false);
//     }
//   };

//   const getPlanColor = (plan: string) => {
//     switch (plan) {
//       case 'trial': return 'bg-blue-100 text-blue-700 border-blue-300';
//       case 'basic': return 'bg-green-100 text-green-700 border-green-300';
//       case 'professional': return 'bg-purple-100 text-purple-700 border-purple-300';
//       case 'enterprise': return 'bg-amber-100 text-amber-700 border-amber-300';
//       default: return 'bg-gray-100 text-gray-700 border-gray-300';
//     }
//   };

//   const getRoleBadge = (role: string) => {
//     return role === 'admin' 
//       ? 'bg-red-100 text-red-700 border-red-300'
//       : 'bg-blue-100 text-blue-700 border-blue-300';
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
//           <p className="text-sm font-medium text-gray-600">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
//         <div className="text-center max-w-md">
//           <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-bold text-gray-900 mb-2">Profile not found</h3>
//           <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
//           <button 
//             onClick={() => window.location.href = '/login'}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//         {/* Header */}
//         <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
//                 <p className="text-sm text-gray-600 mt-1">Manage your account information</p>
//               </div>
//               <div className="flex items-center gap-2">
//                 {isEditing ? (
//                   <>
//                     <button
//                       onClick={handleEditToggle}
//                       disabled={isSaving}
//                       className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
//                     >
//                       <X className="h-4 w-4" />
//                       <span className="hidden sm:inline">Cancel</span>
//                     </button>
//                     <button
//                       onClick={handleSaveProfile}
//                       disabled={isSaving}
//                       className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
//                     >
//                       {isSaving ? (
//                         <>
//                           <Loader2 className="h-4 w-4 animate-spin" />
//                           <span>Saving...</span>
//                         </>
//                       ) : (
//                         <>
//                           <Save className="h-4 w-4" />
//                           <span>Save</span>
//                         </>
//                       )}
//                     </button>
//                   </>
//                 ) : (
//                   <button
//                     onClick={handleEditToggle}
//                     className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
//                   >
//                     <Edit className="h-4 w-4" />
//                     <span>Edit Profile</span>
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//             {/* Profile Card - Left Column */}
//             <div className="lg:col-span-4">
//               <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//                 {/* Card Header with Gradient */}
//                 <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                
//                 {/* Profile Content */}
//                 <div className="px-6 pb-6 -mt-16 sm:-mt-20">
//                   {/* Avatar */}
//                   <div className="flex justify-center mb-4">
//                     <div className="relative">
//                       <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center">
//                         {logoPreview ? (
//                           <img
//                             src={logoPreview}
//                             alt="Profile"
//                             className="w-full h-full object-cover"
//                             onError={() => setLogoPreview(null)}
//                           />
//                         ) : user.role === 'owner' ? (
//                           <Building className="h-12 w-12 sm:h-14 text-gray-400" />
//                         ) : (
//                           <User className="h-12 w-12 sm:h-14  text-gray-400" />
//                         )}
//                       </div>
                      
//                       {/* Avatar Action Button */}
//                       <div className="absolute bottom-0 right-0">
//                         {logoPreview ? (
//                           <button
//                             onClick={handleDeleteLogoClick}
//                             disabled={logoUploading}
//                             className="p-2 sm:p-2.5 bg-red-600 rounded-full shadow-lg hover:bg-red-700 transition-colors disabled:opacity-50 border-2 border-white"
//                           >
//                             {logoUploading ? (
//                               <Loader2 className="h-4 w-4 text-white animate-spin" />
//                             ) : (
//                               <X className="h-4 w-4 text-white" />
//                             )}
//                           </button>
//                         ) : (
//                           <label className="cursor-pointer">
//                             <div className="p-2 sm:p-2.5 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors border-2 border-white">
//                               {logoUploading ? (
//                                 <Loader2 className="h-4 w-4 text-white animate-spin" />
//                               ) : (
//                                 <Camera className="h-4 w-4 text-white" />
//                               )}
//                             </div>
//                             <input
//                               type="file"
//                               className="hidden"
//                               accept="image/*"
//                               onChange={handleLogoUpload}
//                               disabled={logoUploading}
//                             />
//                           </label>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* User Info */}
//                   <div className="text-center mb-6">
//                     <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
//                     <div className="flex items-center justify-center gap-2 flex-wrap">
//                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${getRoleBadge(user.role)}`}>
//                         <Shield className="h-3.5 w-3.5" />
//                         {user.role === 'admin' ? 'Administrator' : 'Owner'}
//                       </span>
//                       {user.isActive && (
//                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border-2 border-green-300">
//                           <CheckCircle className="h-3.5 w-3.5" />
//                           Active
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   {/* Contact Details */}
//                   <div className="space-y-4 border-t border-gray-100 pt-6">
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 bg-blue-50 rounded-lg">
//                         <Mail className="h-4 w-4 text-blue-600" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
//                         <p className="text-sm text-gray-900 truncate">{user.email}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 bg-green-50 rounded-lg">
//                         <Phone className="h-4 w-4 text-green-600" />
//                       </div>
//                       <div className="flex-1">
//                         <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>
//                         <p className="text-sm text-gray-900">{user.phone || 'N/A'}</p>
//                       </div>
//                     </div>
                    
//                     {user.role === 'owner' && user.company_name && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 bg-purple-50 rounded-lg">
//                           <Briefcase className="h-4 w-4 text-purple-600" />
//                         </div>
//                         <div className="flex-1">
//                           <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Company</p>
//                           <p className="text-sm text-gray-900">{user.company_name}</p>
//                         </div>
//                       </div>
//                     )}
                    
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 bg-amber-50 rounded-lg">
//                         <Calendar className="h-4 w-4 text-amber-600" />
//                       </div>
//                       <div className="flex-1">
//                         <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
//                         <p className="text-sm text-gray-900">
//                           {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
//                             month: 'long',
//                             day: 'numeric',
//                             year: 'numeric'
//                           }) : 'N/A'}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Information Form - Right Column */}
//             <div className="lg:col-span-8">
//               <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//                 <div className="px-4 sm:px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
//                   <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
//                     {user.role === 'owner' ? (
//                       <>
//                         <Building className="h-5 w-5 text-blue-600" />
//                         <span>Company Information</span>
//                       </>
//                     ) : (
//                       <>
//                         <User className="h-5 w-5 text-blue-600" />
//                         <span>Personal Information</span>
//                       </>
//                     )}
//                   </h3>
//                 </div>

//                 <div className="p-4 sm:p-6 lg:p-8">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Full Name */}
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Full Name <span className="text-red-500">*</span>
//                       </label>
//                       {isEditing ? (
//                         <input
//                           type="text"
//                           name="name"
//                           value={formData.name}
//                           onChange={handleInputChange}
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
//                           placeholder="Enter your name"
//                           required
//                           minLength={3}
//                         />
//                       ) : (
//                         <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
//                           <p className="text-gray-900 font-medium">{user.name || 'N/A'}</p>
//                         </div>
//                       )}
//                     </div>

//                     {/* Phone Number */}
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Phone Number <span className="text-red-500">*</span>
//                       </label>
//                       {isEditing ? (
//                         <div className="flex gap-2">
//                           {/* Country Code Dropdown */}
//                           <div className="relative">
//                             <button
//                               type="button"
//                               onClick={() => setShowCountryDropdown(!showCountryDropdown)}
//                               className="h-full px-3 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white flex items-center gap-2 min-w-[110px]"
//                             >
//                               {/* <span className="text-lg">{COUNTRY_CODES.find(c => c.code === formData.countryCode)?.flag || '🌐'}</span> */}
//                               <span className="font-medium">{formData.countryCode}</span>
//                               <ChevronDown className="h-4 w-4 text-gray-400" />
//                             </button>
                            
//                             {/* Dropdown Menu */}
//                             {showCountryDropdown && (
//                               <>
//                                 <div 
//                                   className="fixed inset-0 z-10" 
//                                   onClick={() => setShowCountryDropdown(false)}
//                                 />
//                                 <div className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto">
//                                   {COUNTRY_CODES.map((country) => (
//                                     <button
//                                       key={country.code}
//                                       type="button"
//                                       onClick={() => {
//                                         setFormData(prev => ({ ...prev, countryCode: country.code }));
//                                         setShowCountryDropdown(false);
//                                       }}
//                                       className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${
//                                         formData.countryCode === country.code ? 'bg-blue-50 text-blue-700' : ''
//                                       }`}
//                                     >
//                                       {/* <span className="text-xl">{country.flag}</span> */}
//                                       <div className="flex-1">
//                                         <div className="font-medium text-sm">{country.country}</div>
//                                         <div className="text-xs text-gray-500">{country.code}</div>
//                                       </div>
//                                       {formData.countryCode === country.code && (
//                                         <CheckCircle className="h-4 w-4 text-blue-600" />
//                                       )}
//                                     </button>
//                                   ))}
//                                 </div>
//                               </>
//                             )}
//                           </div>
                          
//                           {/* Phone Number Input */}
//                           <input
//                             type="tel"
//                             name="phone"
//                             value={formData.phone}
//                             onChange={handleInputChange}
//                             className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
//                             placeholder="9876543210"
//                             required
//                           />
//                         </div>
//                       ) : (
//                         <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
//                           <p className="text-gray-900 font-medium">{user.phone || 'N/A'}</p>
//                         </div>
//                       )}
//                     </div>

//                     {/* Company Name (Owner only) */}
//                     {user.role === 'owner' && (
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           Company Name <span className="text-red-500">*</span>
//                         </label>
//                         {isEditing ? (
//                           <input
//                             type="text"
//                             name="company_name"
//                             value={formData.company_name}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
//                             placeholder="Enter company name"
//                             required={user.role === 'owner'}
//                             minLength={3}
//                           />
//                         ) : (
//                           <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
//                             <p className="text-gray-900 font-medium">{user.company_name || 'N/A'}</p>
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     {/* Address (Owner only) */}
//                     {user.role === 'owner' && (
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           Address <span className="text-red-500">*</span>
//                         </label>
//                         {isEditing ? (
//                           <textarea
//                             name="address"
//                             value={formData.address}
//                             onChange={handleInputChange}
//                             rows={3}
//                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
//                             placeholder="Enter full address"
//                             required={user.role === 'owner'}
//                           />
//                         ) : (
//                           <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
//                             <p className="text-gray-900 font-medium">{user.address || 'N/A'}</p>
//                           </div>
//                         )}
//                       </div>
//                     )}

//                     {/* City and State (Owner only) */}
//                     {user.role === 'owner' && (
//                       <>
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             City <span className="text-red-500">*</span>
//                           </label>
//                           {isEditing ? (
//                             <input
//                               type="text"
//                               name="city"
//                               value={formData.city}
//                               onChange={handleInputChange}
//                               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
//                               placeholder="Enter city"
//                               required={user.role === 'owner'}
//                             />
//                           ) : (
//                             <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
//                               <p className="text-gray-900 font-medium">{user.city || 'N/A'}</p>
//                             </div>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             State <span className="text-red-500">*</span>
//                           </label>
//                           {isEditing ? (
//                             <input
//                               type="text"
//                               name="state"
//                               value={formData.state}
//                               onChange={handleInputChange}
//                               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
//                               placeholder="Enter state"
//                               required={user.role === 'owner'}
//                             />
//                           ) : (
//                             <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
//                               <p className="text-gray-900 font-medium">{user.state || 'N/A'}</p>
//                             </div>
//                           )}
//                         </div>

//                         {/* Pincode */}
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Pincode <span className="text-red-500">*</span>
//                           </label>
//                           {isEditing ? (
//                             <input
//                               type="text"
//                               name="pincode"
//                               value={formData.pincode}
//                               onChange={handleInputChange}
//                               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
//                               placeholder="6-digit pincode"
//                               pattern="^\d{6}$"
//                               title="Must be 6 digits"
//                               required={user.role === 'owner'}
//                             />
//                           ) : (
//                             <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
//                               <p className="text-gray-900 font-medium">{user.pincode || 'N/A'}</p>
//                             </div>
//                           )}
//                         </div>
//                       </>
//                     )}
//                   </div>

//                   {/* Save button for mobile at bottom */}
//                   {isEditing && (
//                     <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:hidden">
//                       <button
//                         onClick={handleEditToggle}
//                         disabled={isSaving}
//                         className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
//                       >
//                         <X className="h-4 w-4" />
//                         Cancel
//                       </button>
//                       <button
//                         onClick={handleSaveProfile}
//                         disabled={isSaving}
//                         className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
//                       >
//                         {isSaving ? (
//                           <>
//                             <Loader2 className="h-4 w-4 animate-spin" />
//                             Saving...
//                           </>
//                         ) : (
//                           <>
//                             <Save className="h-4 w-4" />
//                             Save Changes
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       <DeleteConfirmationModal
//         isOpen={deleteModalOpen}
//         onClose={() => setDeleteModalOpen(false)}
//         onConfirm={handleConfirmDeleteLogo}
//         title="Remove Profile Logo"
//         message="Are you sure you want to remove your profile logo? This action cannot be undone."
//         isLoading={deletingLogo}
//       />
//     </>
//   );
// };

// export default ProfilePage;

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
  Shield,
  CheckCircle,
  AlertCircle,
  MapPin,
  Briefcase,
  AlertTriangle,
  Trash2,
  ChevronDown,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/BackButton';

// Popular country codes
const COUNTRY_CODES = [
  { code: '+91', country: 'India'},
//   { code: '+1', country: 'United States', flag: '🇺🇸' },
//   { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
//   { code: '+86', country: 'China', flag: '🇨🇳' },
//   { code: '+81', country: 'Japan', flag: '🇯🇵' },
//   { code: '+49', country: 'Germany', flag: '🇩🇪' },
//   { code: '+33', country: 'France', flag: '🇫🇷' },
//   { code: '+61', country: 'Australia', flag: '🇦🇺' },
//   { code: '+971', country: 'UAE', flag: '🇦🇪' },
//   { code: '+65', country: 'Singapore', flag: '🇸🇬' },
//   { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
//   { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
//   { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
//   { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
//   { code: '+977', country: 'Nepal', flag: '🇳🇵' },
];

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'owner';
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst_number?: string;
  plan_type?: 'trial' | 'basic' | 'professional' | 'enterprise';
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditFormData {
  name: string;
  phone: string;
  countryCode: string;
  company_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number: string;
}

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  itemName?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  itemName = ""
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="relative w-full max-w-md mx-auto">
            <div className="relative rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 sm:right-4 sm:top-4 p-2 hover:bg-gray-100 rounded-lg transition-all z-10 group"
                disabled={isLoading}
              >
                <X className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
              </button>

              {/* Content */}
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6 pr-8">
                  <div className="p-2.5 sm:p-3 rounded-full bg-red-50 text-red-600 flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 pt-0.5 sm:pt-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight">
                      {title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{message}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 text-sm sm:text-base active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-red-500/30 active:scale-95"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    phone: '',
    countryCode: '+91',
    company_name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (!authUser) {
        console.error('User not authenticated');
        toast.error('Please login to continue');
        window.location.href = '/login';
        return;
      }

      const userId = authUser.userId;

      if (!userId) {
        console.error('User ID not found in auth context');
        toast.error('Authentication required');
        return;
      }

      console.log('Fetching profile for user ID:', userId);
      
      const response = await api.get(`/users/${userId}`);
      
      if (response.data.success) {
        const userData = response.data.data;
        console.log('User data received:', userData);
        
        setUser(userData);
        
        // Parse phone number to extract country code
        const phoneStr = userData.phone || '';
        let extractedCode = '+91';
        let phoneNumber = phoneStr;
        
        if (phoneStr) {
          const match = phoneStr.match(/^(\+\d+)-(.+)$/);
          if (match) {
            extractedCode = match[1];
            phoneNumber = match[2];
          }
        }
        
        setFormData({
          name: userData.name || '',
          phone: phoneNumber,
          countryCode: extractedCode,
          company_name: userData.company_name || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
          gst_number: userData.gst_number || ''
        });
        
        if (userData.logo) {
          console.log('Setting logo preview:', userData.logo);
          setLogoPreview(userData.logo);
        }
      } else {
        throw new Error(response.data.error || 'Failed to load profile');
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else if (error.response?.status === 404) {
        toast.error('User profile not found');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to view this profile.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Parse phone number when resetting
      const phoneStr = user?.phone || '';
      let extractedCode = '+91';
      let phoneNumber = phoneStr;
      
      if (phoneStr) {
        const match = phoneStr.match(/^(\+\d+)-(.+)$/);
        if (match) {
          extractedCode = match[1];
          phoneNumber = match[2];
        }
      }
      
      // Reset form to original values
      setFormData({
        name: user?.name || '',
        phone: phoneNumber,
        countryCode: extractedCode,
        company_name: user?.company_name || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || '',
        gst_number: user?.gst_number || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Combine country code and phone number
      const fullPhone = `${formData.countryCode}-${formData.phone}`;
      
      // Prepare update data as JSON
      const updateData: any = {
        name: formData.name,
        phone: fullPhone,
        role: user.role,
      };

      // Add owner-specific fields if user is owner
      if (user.role === 'owner') {
        updateData.company_name = formData.company_name;
        updateData.address = formData.address;
        updateData.city = formData.city;
        updateData.state = formData.state;
        updateData.pincode = formData.pincode;
        updateData.gst_number = formData.gst_number || null; // Set to null if empty
      }

      console.log('Updating profile with data:', updateData);
      
      const response = await api.put(`/users/update/${user._id}`, updateData);
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        console.log('Profile update successful:', updatedUser);
        
        setUser(updatedUser);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        throw new Error(response.data.error || 'Update failed');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error;
        if (errorMsg?.includes('Phone must be in format')) {
          toast.error('Phone number must be in correct format');
        } else if (errorMsg?.includes('Pincode must be 6 digits')) {
          toast.error('Pincode must be 6 digits');
        } else {
          toast.error(errorMsg || 'Validation error');
        }
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setLogoUploading(true);
    
    try {
      const logoFormData = new FormData();
      logoFormData.append('logo', file);

      console.log('Uploading logo for user:', user._id);
      
      const response = await api.post(`/users/${user._id}/logo`, logoFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const updatedUser = response.data.data;
        console.log('Logo upload successful:', updatedUser);
        
        setUser(updatedUser);
        
        if (updatedUser.logo) {
          setLogoPreview(updatedUser.logo);
        }
        toast.success('Logo uploaded successfully');
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Logo upload error:', error);
      
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error;
        if (errorMsg?.includes('Invalid logo file type')) {
          toast.error('Invalid image type. Use JPEG, PNG, GIF, or WebP');
        } else if (errorMsg?.includes('exceeds 5MB limit')) {
          toast.error('Image size exceeds 5MB limit');
        } else {
          toast.error(errorMsg || 'Upload failed');
        }
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to upload logo');
      }
    } finally {
      setLogoUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Open delete confirmation modal
  const handleDeleteLogoClick = () => {
    if (!user || !user.logo) return;
    setDeleteModalOpen(true);
  };

  // Handle confirmed logo deletion
  const handleConfirmDeleteLogo = async () => {
    if (!user) return;

    setDeletingLogo(true);
    try {
      console.log('Deleting logo for user:', user._id);
      
      const response = await api.delete(`/users/${user._id}/logo`);
      
      if (response.data.success) {
        console.log('Logo delete successful');
        
        // Fetch fresh user data after logo deletion
        const freshResponse = await api.get(`/users/${user._id}`);
        
        if (freshResponse.data.success) {
          const freshUserData = freshResponse.data.data;
          console.log('Fresh user data after logo delete:', freshUserData);
          
          setUser(freshUserData);
          setLogoPreview(null);
          toast.success('Logo removed successfully');
          setDeleteModalOpen(false);
        } else {
          throw new Error('Failed to fetch updated profile');
        }
      } else {
        throw new Error(response.data.error || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Logo delete error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to remove logo');
      }
    } finally {
      setDeletingLogo(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'trial': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'basic': return 'bg-green-100 text-green-700 border-green-300';
      case 'professional': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'enterprise': return 'bg-amber-100 text-amber-700 border-amber-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' 
      ? 'bg-red-100 text-red-700 border-red-300'
      : 'bg-blue-100 text-blue-700 border-blue-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Profile not found</h3>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <BackButton className="mb-4" />
    
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Title Section */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
          Profile Settings
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account information
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {isEditing ? (
          <>
            <button
              onClick={handleEditToggle}
              disabled={isSaving}
              className="flex-1 sm:flex-none sm:min-w-[100px] px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex-1 sm:flex-none sm:min-w-[100px] px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={handleEditToggle}
            className="w-full sm:w-auto sm:min-w-[140px] px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>
    </div>
  </div>
</div>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Profile Card - Left Column */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Card Header with Gradient */}
                <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                
                {/* Profile Content */}
                <div className="px-6 pb-6 -mt-16 sm:-mt-20">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={() => setLogoPreview(null)}
                          />
                        ) : user.role === 'owner' ? (
                          <Building className="h-12 w-12 sm:h-14 text-gray-400" />
                        ) : (
                          <User className="h-12 w-12 sm:h-14  text-gray-400" />
                        )}
                      </div>
                      
                      {/* Avatar Action Button */}
                      <div className="absolute bottom-0 right-0">
                        {logoPreview ? (
                          <button
                            onClick={handleDeleteLogoClick}
                            disabled={logoUploading}
                            className="p-2 sm:p-2.5 bg-red-600 rounded-full shadow-lg hover:bg-red-700 transition-colors disabled:opacity-50 border-2 border-white"
                          >
                            {logoUploading ? (
                              <Loader2 className="h-4 w-4 text-white animate-spin" />
                            ) : (
                              <X className="h-4 w-4 text-white" />
                            )}
                          </button>
                        ) : (
                          <label className="cursor-pointer">
                            <div className="p-2 sm:p-2.5 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors border-2 border-white">
                              {logoUploading ? (
                                <Loader2 className="h-4 w-4 text-white animate-spin" />
                              ) : (
                                <Camera className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              disabled={logoUploading}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="text-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${getRoleBadge(user.role)}`}>
                        <Shield className="h-3.5 w-3.5" />
                        {user.role === 'admin' ? 'Administrator' : 'Owner'}
                      </span>
                      {user.isActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border-2 border-green-300">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                        <p className="text-sm text-gray-900 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                        <p className="text-sm text-gray-900">{user.phone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {user.role === 'owner' && user.company_name && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Briefcase className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Company</p>
                          <p className="text-sm text-gray-900">{user.company_name}</p>
                        </div>
                      </div>
                    )}

                    {user.role === 'owner' && user.gst_number && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <FileText className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">GST Number</p>
                          <p className="text-sm text-gray-900 font-mono">{user.gst_number}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                        <p className="text-sm text-gray-900">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Form - Right Column */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    {user.role === 'owner' ? (
                      <>
                        <Building className="h-5 w-5 text-blue-600" />
                        <span>Company Information</span>
                      </>
                    ) : (
                      <>
                        <User className="h-5 w-5 text-blue-600" />
                        <span>Personal Information</span>
                      </>
                    )}
                  </h3>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                          placeholder="Enter your name"
                          required
                          minLength={3}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
                          <p className="text-gray-900 font-medium">{user.name || 'N/A'}</p>
                        </div>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div className="flex gap-2">
                          {/* Country Code Dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                              className="h-full px-3 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white flex items-center gap-2 min-w-[110px]"
                            >
                              <span className="font-medium">{formData.countryCode}</span>
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {showCountryDropdown && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setShowCountryDropdown(false)}
                                />
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto">
                                  {COUNTRY_CODES.map((country) => (
                                    <button
                                      key={country.code}
                                      type="button"
                                      onClick={() => {
                                        setFormData(prev => ({ ...prev, countryCode: country.code }));
                                        setShowCountryDropdown(false);
                                      }}
                                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                                        formData.countryCode === country.code ? 'bg-blue-50 text-blue-700' : ''
                                      }`}
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{country.country}</div>
                                        <div className="text-xs text-gray-500">{country.code}</div>
                                      </div>
                                      {formData.countryCode === country.code && (
                                        <CheckCircle className="h-4 w-4 text-blue-600" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Phone Number Input */}
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                            placeholder="9876543210"
                            required
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
                          <p className="text-gray-900 font-medium">{user.phone || 'N/A'}</p>
                        </div>
                      )}
                    </div>

                    {/* Company Name (Owner only) */}
                    {user.role === 'owner' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                            placeholder="Enter company name"
                            required={user.role === 'owner'}
                            minLength={3}
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
                            <p className="text-gray-900 font-medium">{user.company_name || 'N/A'}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* GST Number (Owner only - Optional) */}
                    {user.role === 'owner' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          GST Number <span className="text-gray-400">(Optional)</span>
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="gst_number"
                            value={formData.gst_number}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-mono"
                            placeholder="Enter GST number"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
                            <p className="text-gray-900 font-medium font-mono">{user.gst_number || 'Not provided'}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Address (Owner only) */}
                    {user.role === 'owner' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                            placeholder="Enter full address"
                            required={user.role === 'owner'}
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
                            <p className="text-gray-900 font-medium">{user.address || 'N/A'}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* City and State (Owner only) */}
                    {user.role === 'owner' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                              placeholder="Enter city"
                              required={user.role === 'owner'}
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
                              <p className="text-gray-900 font-medium">{user.city || 'N/A'}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                              placeholder="Enter state"
                              required={user.role === 'owner'}
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
                              <p className="text-gray-900 font-medium">{user.state || 'N/A'}</p>
                            </div>
                          )}
                        </div>

                        {/* Pincode */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Pincode <span className="text-red-500">*</span>
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                              placeholder="6-digit pincode"
                              pattern="^\d{6}$"
                              title="Must be 6 digits"
                              required={user.role === 'owner'}
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100">
                              <p className="text-gray-900 font-medium">{user.pincode || 'N/A'}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Save button for mobile at bottom */}
                  {isEditing && (
                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:hidden">
                      <button
                        onClick={handleEditToggle}
                        disabled={isSaving}
                        className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteLogo}
        title="Remove Profile Logo"
        message="Are you sure you want to remove your profile logo? This action cannot be undone."
        isLoading={deletingLogo}
      />
    </>
  );
};

export default ProfilePage;
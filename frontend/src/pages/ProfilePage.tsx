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
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

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
  plan_type?: 'trial' | 'basic' | 'professional' | 'enterprise';
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditFormData {
  name: string;
  phone: string;
  company_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [originalUser, setOriginalUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
        
        // Store both original and current user data
        setUser(userData);
        setOriginalUser(userData);
        
        // Initialize form data
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          company_name: userData.company_name || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || ''
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
      // Reset to original user data
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        company_name: user?.company_name || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || ''
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
      const updateFormData = new FormData();
      updateFormData.append('name', formData.name);
      updateFormData.append('phone', formData.phone);
      updateFormData.append('role', user.role);

      if (user.role === 'owner') {
        updateFormData.append('company_name', formData.company_name);
        updateFormData.append('address', formData.address);
        updateFormData.append('city', formData.city);
        updateFormData.append('state', formData.state);
        updateFormData.append('pincode', formData.pincode);
      }

      console.log('Updating profile for user:', user._id);
      
      const response = await api.put(`/users/update/${user._id}`, updateFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        console.log('Profile update successful:', updatedUser);
        
        // Update both user and originalUser
        setUser(updatedUser);
        setOriginalUser(updatedUser);
        
        // Update form data
        setFormData({
          name: updatedUser.name || '',
          phone: updatedUser.phone || '',
          company_name: updatedUser.company_name || '',
          address: updatedUser.address || '',
          city: updatedUser.city || '',
          state: updatedUser.state || '',
          pincode: updatedUser.pincode || ''
        });
        
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
          toast.error('Phone number must be in format: +91-XXXXXXXXXX');
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
        
        // Update user with full data from backend
        setUser(updatedUser);
        setOriginalUser(updatedUser);
        
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

  const handleDeleteLogo = async () => {
    if (!user || !user.logo) return;

    if (!confirm('Are you sure you want to remove the logo?')) {
      return;
    }

    setLogoUploading(true);
    try {
      console.log('Deleting logo for user:', user._id);
      
      const response = await api.delete(`/users/${user._id}/logo`);
      
      if (response.data.success) {
        console.log('Logo delete successful');
        
        // Fetch complete fresh user data to ensure all fields are populated
        const freshResponse = await api.get(`/users/${user._id}`);
        
        if (freshResponse.data.success) {
          const freshUserData = freshResponse.data.data;
          console.log('Fresh user data after logo delete:', freshUserData);
          
          // Update with fresh complete data
          setUser(freshUserData);
          setOriginalUser(freshUserData);
          
          // Update form data with fresh data
          setFormData({
            name: freshUserData.name || '',
            phone: freshUserData.phone || '',
            company_name: freshUserData.company_name || '',
            address: freshUserData.address || '',
            city: freshUserData.city || '',
            state: freshUserData.state || '',
            pincode: freshUserData.pincode || ''
          });
          
          setLogoPreview(null);
          toast.success('Logo removed successfully');
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
      setLogoUploading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'trial': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'basic': return 'bg-green-50 text-green-700 border-green-200';
      case 'professional': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'enterprise': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' 
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile not found</h3>
          <p className="text-gray-600">Unable to load your profile information.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => {
                          console.error('Failed to load logo');
                          setLogoPreview(null);
                        }}
                      />
                    ) : user.role === 'owner' ? (
                      <Building className="h-16 w-16 text-gray-400" />
                    ) : (
                      <User className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="absolute bottom-2 right-2">
                    {logoPreview ? (
                      <button
                        onClick={handleDeleteLogo}
                        disabled={logoUploading}
                        className="p-2 bg-red-600 rounded-full shadow-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        title="Remove logo"
                      >
                        {logoUploading ? (
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        ) : (
                          <X className="h-4 w-4 text-white" />
                        )}
                      </button>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="p-2 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
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

                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                    <Shield className="h-3 w-3" />
                    {user.role === 'admin' ? 'Administrator' : 'Owner'}
                  </span>
                  {user.isActive && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </div>
              </div>

              {user.role === 'owner' && user.plan_type && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Current Plan</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPlanColor(user.plan_type)}`}>
                      {user.plan_type.charAt(0).toUpperCase() + user.plan_type.slice(1)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left min-w-0">
                    <p className="text-gray-600 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400">Email</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-gray-600">{user.phone || 'N/A'}</p>
                    <p className="text-xs text-gray-400">Phone</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400">Member since</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.role === 'owner' ? 'Company Information' : 'Personal Information'}
                </h3>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleEditToggle}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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
                    </>
                  ) : (
                    <button
                      onClick={handleEditToggle}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter your name"
                          required
                          minLength={3}
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{user.name || 'N/A'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="+91-9876543210"
                          pattern="^\+91-\d{10}$"
                          title="Format: +91-XXXXXXXXXX"
                          required
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{user.phone || 'N/A'}</p>
                        </div>
                      )}
                    </div>

                    {user.role === 'owner' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name *
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter company name"
                            required={user.role === 'owner'}
                            minLength={3}
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-900">{user.company_name || 'N/A'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {user.role === 'owner' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address *
                        </label>
                        {isEditing ? (
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter full address"
                            required={user.role === 'owner'}
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-900">{user.address || 'N/A'}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="Enter city"
                              required={user.role === 'owner'}
                            />
                          ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-gray-900">{user.city || 'N/A'}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="Enter state"
                              required={user.role === 'owner'}
                            />
                          ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-gray-900">{user.state || 'N/A'}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode *
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter 6-digit pincode"
                            pattern="^\d{6}$"
                            title="Must be 6 digits"
                            required={user.role === 'owner'}
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-900">{user.pincode || 'N/A'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900">{user.email || 'N/A'}</p>
                      <span className="text-xs text-gray-500">Cannot be changed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import FloatingInput from "../../components/FloatingInput";
import { Package, Plus, X, IndianRupee } from "lucide-react";
import api from "../../api/client";
import BackButton from "../../components/BackButton";

interface Material {
  material_name: string;
  price_per_unit: number;
  _id?: string;
}

interface FormData {
  name: string;
  materials: Material[];
}

interface FormErrors {
  name?: string;
}

const initialFormData: FormData = {
  name: "",
  materials: [],
};

const ManageCrusherForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // New material form
  const [newMaterial, setNewMaterial] = useState({
    material_name: "",
    price_per_unit: ""
  });

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      api
        .get(`/crushers/${id}`)
        .then((res) => {
          const crusherData = res.data.data;
          setFormData({
            name: crusherData.name || "",
            materials: crusherData.materials || [],
          });
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || "Failed to fetch crusher details");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Crusher name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Validate materials
    for (const material of formData.materials) {
      if (!material.material_name.trim()) {
        toast.error("All materials must have a name");
        return false;
      }
      if (material.price_per_unit < 0) {
        toast.error("Price cannot be negative");
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
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

  const addMaterial = () => {
    if (!newMaterial.material_name.trim()) {
      toast.error("Material name is required");
      return;
    }

    const price = parseFloat(newMaterial.price_per_unit);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // Check for duplicate material names
    if (formData.materials.some(m =>
      m.material_name.toLowerCase() === newMaterial.material_name.toLowerCase()
    )) {
      toast.error("Material with this name already exists");
      return;
    }

    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, {
        material_name: newMaterial.material_name.trim(),
        price_per_unit: price
      }]
    }));

    setNewMaterial({
      material_name: "",
      price_per_unit: ""
    });
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const updateMaterial = (index: number, field: keyof Material, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) =>
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/crushers/update/${id}`, formData);
        toast.success("Crusher updated successfully");
      } else {
        await api.post("/crushers/create", formData);
        toast.success("Crusher created successfully");
        setFormData(initialFormData);
      }
      navigate("/crushers");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header section */}
      <div className="bg-white p-4 sm:p-5 rounded-t-xl border shadow-md flex items-center gap-3">
        <BackButton />
        <div className="flex items-center justify-center lg:justify-start flex-1 min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2 text-gray-800 text-center lg:text-left">
            {/* <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" /> */}
            <span>{isEditMode ? "Edit Crusher" : "Add Crusher"}</span>
          </h2>
        </div>
      </div>

      {/* Form section */}
      <div className="bg-white rounded-b-xl shadow-md p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Crusher Name */}
          <div>
            <FloatingInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              label="Crusher Name *"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Materials Section */}
          <div className="space-y-4">
            <label className="block text-base sm:text-lg font-semibold text-gray-700">
              Materials & Prices
            </label>

            {/* Add New Material */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Material</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Name *
                  </label>
                  <input
                    type="text"
                    value={newMaterial.material_name}
                    onChange={(e) => setNewMaterial(prev => ({
                      ...prev,
                      material_name: e.target.value
                    }))}
                    placeholder="e.g., Sand, Gravel, Stone"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Unit *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newMaterial.price_per_unit}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        price_per_unit: e.target.value
                      }))}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={addMaterial}
                disabled={!newMaterial.material_name.trim() || !newMaterial.price_per_unit}
                className="mt-3 w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={16} />
                Add Material
              </button>
            </div>

            {/* Materials List */}
            {formData.materials.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Added Materials ({formData.materials.length})
                </h3>
                {formData.materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-white border rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <div>
                        <input
                          type="text"
                          value={material.material_name}
                          onChange={(e) => updateMaterial(index, 'material_name', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          placeholder="Material name"
                        />
                      </div>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={material.price_per_unit}
                          onChange={(e) => updateMaterial(index, 'price_per_unit', parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="w-full sm:w-auto p-2 rounded-lg sm:rounded-full hover:bg-red-100 text-red-600 transition-colors flex items-center justify-center gap-2 sm:gap-0"
                      title="Remove material"
                    >
                      <X size={16} />
                      <span className="sm:hidden">Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Crusher" : "Create Crusher"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/crushers")}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageCrusherForm;
const PetrolBunk = require('../models/petrolBunk.model');
const Expense = require('../models/expense.model');

const createPetrolBunk = async (bunkData) => {
  const {
    owner_id,
    bunk_name,
    address
  } = bunkData;

  if (!owner_id || !bunk_name) {
    const err = new Error('Owner ID and bunk name are required');
    err.status = 400;
    throw err;
  }

  const newPetrolBunk = new PetrolBunk({
    owner_id,
    bunk_name,
    address
  });

  await newPetrolBunk.save();
  return newPetrolBunk;
};

const getAllPetrolBunks = async (owner_id, include_inactive = false) => {
  const query = { 
    owner_id 
  };
  
  if (!include_inactive) {
    query.isActive = true;
  }
  
  const petrolBunks = await PetrolBunk.find(query).sort({ createdAt: -1 });

  return {
    count: petrolBunks.length,
    petrolBunks
  };
};

const getPetrolBunkById = async (id, owner_id, include_inactive = false) => {
  const query = { 
    _id: id, 
    owner_id 
  };
  
  if (!include_inactive) {
    query.isActive = true;
  }
  
  const petrolBunk = await PetrolBunk.findOne(query);

  if (!petrolBunk) {
    const err = new Error('Petrol bunk not found');
    err.status = 404;
    throw err;
  }
  return petrolBunk;
};

const updatePetrolBunk = async (id, owner_id, updateData) => {
  const updatedPetrolBunk = await PetrolBunk.findOneAndUpdate(
    { _id: id, owner_id, isActive: true },
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedPetrolBunk) {
    const err = new Error('Petrol bunk not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedPetrolBunk;
};

const deletePetrolBunk = async (id, owner_id) => {
  // Step 1: Check if petrol bunk exists and is active
  const petrolBunk = await PetrolBunk.findOne({ 
    _id: id, 
    owner_id,
    isActive: true 
  });
  
  if (!petrolBunk) {
    const err = new Error('Petrol bunk not found or delete failed');
    err.status = 404;
    throw err;
  }

  // Step 2: Check if petrol bunk is referenced in any Expense (fuel expenses)
  const isReferenced = await Expense.exists({ 
    bunk_id: id,
    category: 'fuel',
    isActive: true
  });
  
  if (isReferenced) {
    const err = new Error('Cannot delete petrol bunk: It is referenced in fuel expenses');
    err.status = 400;
    throw err;
  }

  // Step 3: SOFT DELETE - set isActive to false
  await PetrolBunk.findOneAndUpdate(
    { _id: id, owner_id },
    { $set: { isActive: false } }
  );

  return { 
    message: 'Petrol bunk soft deleted successfully',
    bunk_id: id,
    bunk_name: petrolBunk.bunk_name
  };
};

// Bulk soft delete petrol bunks
const bulkSoftDeletePetrolBunks = async (bunkIds, owner_id) => {
  try {
    // Validate input
    if (!bunkIds || !Array.isArray(bunkIds) || bunkIds.length === 0) {
      throw new Error('bunkIds must be a non-empty array');
    }

    // Update active bunks owned by user
    const result = await PetrolBunk.updateMany(
      {
        _id: { $in: bunkIds },
        owner_id,
        isActive: true
      },
      { $set: { isActive: false } }
    );

    return {
      success: true,
      message: `Soft deleted ${result.modifiedCount} petrol bunk(s)`,
      modifiedCount: result.modifiedCount
    };

  } catch (error) {
    console.error('Error in bulk soft delete petrol bunks:', error);
    throw error;
  }
};

module.exports = {
  createPetrolBunk,
  getAllPetrolBunks,
  getPetrolBunkById,
  updatePetrolBunk,
  deletePetrolBunk,
  bulkSoftDeletePetrolBunks
};
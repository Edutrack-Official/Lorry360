const Lorry = require('../models/lorry.model');
const Trip = require('../models/trip.model');   // Trip model

const createLorry = async (lorryData) => {
  const {
    owner_id,
    registration_number,
    nick_name,
    status
  } = lorryData;

  if (!owner_id || !registration_number) {
    const err = new Error('Owner ID and registration number are required');
    err.status = 400;
    throw err;
  }

  // Check if registration number already exists
  const existingLorry = await Lorry.findOne({ registration_number });
  if (existingLorry) {
    const err = new Error('Lorry with this registration number already exists');
    err.status = 409;
    throw err;
  }

  const newLorry = new Lorry({
    owner_id,
    registration_number: registration_number.toUpperCase(),
    nick_name,
    status: status || 'active'
  });

  await newLorry.save();
  return newLorry;
};

const getAllLorries = async (owner_id, filterParams = {}) => {
  const { status } = filterParams;
  const query = { owner_id };
  
  if (status) query.status = status;

  const lorries = await Lorry.find(query)
    .populate('owner_id', 'name company_name')
    .sort({ createdAt: -1 });

  return {
    count: lorries.length,
    lorries
  };
};

const getLorryById = async (id, owner_id) => {
  const lorry = await Lorry.findOne({ _id: id, owner_id })
    .populate('owner_id', 'name company_name');

  if (!lorry) {
    const err = new Error('Lorry not found');
    err.status = 404;
    throw err;
  }
  return lorry;
};

const updateLorry = async (id, owner_id, updateData) => {
  if (updateData.registration_number) {
    // Check if new registration number already exists for other lorry
    const existingLorry = await Lorry.findOne({ 
      registration_number: updateData.registration_number,
      _id: { $ne: id }
    });
    if (existingLorry) {
      const err = new Error('Another lorry with this registration number already exists');
      err.status = 409;
      throw err;
    }
    updateData.registration_number = updateData.registration_number.toUpperCase();
  }

  const updatedLorry = await Lorry.findOneAndUpdate(
    { _id: id, owner_id },
    updateData,
    { new: true, runValidators: true }
  ).populate('owner_id', 'name company_name');

  if (!updatedLorry) {
    const err = new Error('Lorry not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedLorry;
};

const deleteLorry = async (id, owner_id) => {
  // Step 1: Check if lorry exists
  const lorry = await Lorry.findOne({ _id: id, owner_id });
  if (!lorry) {
    const err = new Error('Lorry not found or delete failed');
    err.status = 404;
    throw err;
  }

  // Step 2: Check if lorry is referenced in Trip
  const isReferenced = await Trip.exists({ lorry_id: id });
  if (isReferenced) {
    const err = new Error('Cannot delete lorry');
    err.status = 400;
    throw err;
  }

  // Step 3: Safe to delete
  await Lorry.deleteOne({ _id: id });

  return { message: 'Lorry deleted successfully' };
};


const updateLorryStatus = async (id, owner_id, status) => {
  const updatedLorry = await Lorry.findOneAndUpdate(
    { _id: id, owner_id },
    { status },
    { new: true, runValidators: true }
  ).populate('owner_id', 'name company_name');

  if (!updatedLorry) {
    const err = new Error('Lorry not found or status update failed');
    err.status = 404;
    throw err;
  }
  return updatedLorry;
};

module.exports = {
  createLorry,
  getAllLorries,
  getLorryById,
  updateLorry,
  deleteLorry,
  updateLorryStatus
};
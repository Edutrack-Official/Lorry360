const Crusher = require('../models/crusher.model');

const createCrusher = async (crusherData) => {
  const {
    owner_id,
    name,
    materials
  } = crusherData;

  if (!owner_id || !name) {
    const err = new Error('Owner ID and crusher name are required');
    err.status = 400;
    throw err;
  }

  const newCrusher = new Crusher({
    owner_id,
    name,
    materials
  });

  await newCrusher.save();
  return newCrusher;
};

const getAllCrushers = async (owner_id) => {
  const crushers = await Crusher.find({ owner_id }).sort({ createdAt: -1 });

  return {
    count: crushers.length,
    crushers
  };
};

const getCrusherById = async (id, owner_id) => {
  const crusher = await Crusher.findOne({ _id: id, owner_id });

  if (!crusher) {
    const err = new Error('Crusher not found');
    err.status = 404;
    throw err;
  }
  return crusher;
};

const updateCrusher = async (id, owner_id, updateData) => {
  const updatedCrusher = await Crusher.findOneAndUpdate(
    { _id: id, owner_id },
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedCrusher) {
    const err = new Error('Crusher not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedCrusher;
};

const deleteCrusher = async (id, owner_id) => {
  const deletedCrusher = await Crusher.findOneAndDelete({ _id: id, owner_id });

  if (!deletedCrusher) {
    const err = new Error('Crusher not found or delete failed');
    err.status = 404;
    throw err;
  }
  return { message: 'Crusher deleted successfully' };
};

module.exports = {
  createCrusher,
  getAllCrushers,
  getCrusherById,
  updateCrusher,
  deleteCrusher
};
const Customer = require('../models/customer.model');

const createCustomer = async (customerData) => {
  const {
    owner_id,
    name,
    phone,
    address,
    site_addresses
  } = customerData;

  if (!owner_id || !name || !phone || !address) {
    const err = new Error('Owner ID, name, phone, and address are required');
    err.status = 400;
    throw err;
  }

  const newCustomer = new Customer({
    owner_id,
    name,
    phone,
    address,
    site_addresses: site_addresses || []
  });

  await newCustomer.save();
  return newCustomer;
};

const getAllCustomers = async (owner_id) => {
  const customers = await Customer.find({ owner_id }).sort({ createdAt: -1 });

  return {
    count: customers.length,
    customers
  };
};

const getCustomerById = async (id, owner_id) => {
  const customer = await Customer.findOne({ _id: id, owner_id });

  if (!customer) {
    const err = new Error('Customer not found');
    err.status = 404;
    throw err;
  }
  return customer;
};

const updateCustomer = async (id, owner_id, updateData) => {
  const updatedCustomer = await Customer.findOneAndUpdate(
    { _id: id, owner_id },
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedCustomer) {
    const err = new Error('Customer not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedCustomer;
};

const deleteCustomer = async (id, owner_id) => {
  const deletedCustomer = await Customer.findOneAndDelete({ _id: id, owner_id });

  if (!deletedCustomer) {
    const err = new Error('Customer not found or delete failed');
    err.status = 404;
    throw err;
  }
  return { message: 'Customer deleted successfully' };
};

// Add site address to existing customer
const addSiteAddress = async (id, owner_id, siteAddress) => {
  const customer = await Customer.findOne({ _id: id, owner_id });

  if (!customer) {
    const err = new Error('Customer not found');
    err.status = 404;
    throw err;
  }

  customer.site_addresses.push(siteAddress);
  await customer.save();

  return customer;
};

// Remove site address from customer
const removeSiteAddress = async (id, owner_id, siteAddress) => {
  const customer = await Customer.findOne({ _id: id, owner_id });

  if (!customer) {
    const err = new Error('Customer not found');
    err.status = 404;
    throw err;
  }

  customer.site_addresses = customer.site_addresses.filter(
    address => address !== siteAddress
  );
  await customer.save();

  return customer;
};

module.exports = {  
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addSiteAddress,
  removeSiteAddress
};
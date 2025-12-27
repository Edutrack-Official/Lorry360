const Customer = require('../models/customer.model');
const Trip = require('../models/trip.model');

const createCustomer = async (customerData) => {
  const {
    owner_id,
    name,
    phone,
    address,
    site_addresses,
    gst_number
  } = customerData;

  if (!owner_id || !name || !phone || !address) {
    const err = new Error('Owner ID, name, phone, and address are required');
    err.status = 400;
    throw err;
  }

  // Validate GST number if provided
  if (gst_number) {
    // Remove spaces and convert to uppercase
    const cleanedGst = gst_number.trim().toUpperCase().replace(/\s/g, '');
    
    // Basic GSTIN format validation
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    
    if (!gstRegex.test(cleanedGst)) {
      const err = new Error('Invalid GSTIN format. Example: 33AAAAA0000A1Z5');
      err.status = 400;
      throw err;
    }
  }

  const newCustomer = new Customer({
    owner_id,
    name,
    phone,
    address,
    gst_number: gst_number ? gst_number.trim().toUpperCase() : null,
    site_addresses: site_addresses || []
  });

  await newCustomer.save();
  return newCustomer;
};

const getAllCustomers = async (owner_id, options = {}) => {
  const { 
    search = '', 
    page = 1, 
    limit = 20,
    gst_filter = 'all' // 'all', 'with_gst', 'without_gst'
  } = options;

  const query = { owner_id };

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } }
    ];
  }

  // GST filter
  if (gst_filter === 'with_gst') {
    query.gst_number = { $ne: null, $ne: '' };
  } else if (gst_filter === 'without_gst') {
    query.$or = [
      { gst_number: null },
      { gst_number: '' }
    ];
  }

  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('name phone address gst_number site_addresses isActive createdAt'),
    Customer.countDocuments(query)
  ]);

  return {
    count: customers.length,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
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
  // Validate GST number if being updated
  if (updateData.gst_number !== undefined) {
    if (updateData.gst_number) {
      const cleanedGst = updateData.gst_number.trim().toUpperCase().replace(/\s/g, '');
      
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
      
      if (!gstRegex.test(cleanedGst)) {
        const err = new Error('Invalid GSTIN format. Example: 33AAAAA0000A1Z5');
        err.status = 400;
        throw err;
      }
      
      updateData.gst_number = cleanedGst;
    } else {
      updateData.gst_number = null;
    }
  }

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
  // Step 1: Check if customer exists
  const customer = await Customer.findOne({ _id: id, owner_id });
  if (!customer) {
    const err = new Error('Customer not found or delete failed');
    err.status = 404;
    throw err;
  }

  // Step 2: Check if customer is referenced in any Trip
  const isReferenced = await Trip.exists({ customer_id: id });
  if (isReferenced) {
    const err = new Error('Cannot delete customer: It is referenced in a Trip');
    err.status = 400;
    throw err;
  }

  // Step 3: Safe to delete
  await Customer.deleteOne({ _id: id });

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
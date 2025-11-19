const Collaboration = require('../models/collaboration.model');
const User = require('../models/user.model');

const sendCollaborationRequest = async (collabData) => {
  const {
    from_owner_id,
    to_owner_id
  } = collabData;

  if (!from_owner_id || !to_owner_id) {
    const err = new Error('From owner ID and to owner ID are required');
    err.status = 400;
    throw err;
  }

  if (from_owner_id === to_owner_id) {
    const err = new Error('Cannot send collaboration request to yourself');
    err.status = 400;
    throw err;
  }

  // Check if collaboration already exists
  const existingCollab = await Collaboration.findOne({
    $or: [
      { from_owner_id, to_owner_id },
      { from_owner_id: to_owner_id, to_owner_id: from_owner_id }
    ]
  });

  if (existingCollab) {
    const err = new Error('Collaboration already exists between these owners');
    err.status = 400;
    throw err;
  }

  // Verify to_owner exists and is an owner
  const toOwner = await User.findOne({ _id: to_owner_id, role: 'owner' });
  if (!toOwner) {
    const err = new Error('Recipient owner not found');
    err.status = 404;
    throw err;
  }

  const newCollaboration = new Collaboration({
    from_owner_id,
    to_owner_id,
    status: 'pending'
  });

  await newCollaboration.save();
  return newCollaboration;
};

const getCollaborationRequests = async (owner_id) => {
  const requests = await Collaboration.find({ 
    to_owner_id: owner_id,
    status: 'pending'
  })
    .populate('from_owner_id', 'name company_name email phone')
    .sort({ createdAt: -1 });

  return {
    count: requests.length,
    requests
  };
};

const getMySentRequests = async (owner_id) => {
  const requests = await Collaboration.find({ 
    from_owner_id: owner_id 
  })
    .populate('to_owner_id', 'name company_name email phone')
    .sort({ createdAt: -1 });

  return {
    count: requests.length,
    requests
  };
};

const getActiveCollaborations = async (owner_id) => {
  const collaborations = await Collaboration.find({
    $or: [
      { from_owner_id: owner_id },
      { to_owner_id: owner_id }
    ],
    status: 'active'
  })
    .populate('from_owner_id', 'name company_name email phone')
    .populate('to_owner_id', 'name company_name email phone')
    .sort({ createdAt: -1 });

  return {
    count: collaborations.length,
    collaborations
  };
};

const acceptCollaboration = async (collab_id, owner_id) => {
  const collaboration = await Collaboration.findById(collab_id);
  
  if (!collaboration) {
    const err = new Error('Collaboration request not found');
    err.status = 404;
    throw err;
  }

  // Only the recipient can accept
  if (collaboration.to_owner_id.toString() !== owner_id) {
    const err = new Error('Only the recipient can accept this collaboration request');
    err.status = 403;
    throw err;
  }

  if (collaboration.status !== 'pending') {
    const err = new Error('Collaboration request is not pending');
    err.status = 400;
    throw err;
  }

  collaboration.status = 'active';
  await collaboration.save();
  
  return collaboration;
};

const rejectCollaboration = async (collab_id, owner_id) => {
  const collaboration = await Collaboration.findById(collab_id);
  
  if (!collaboration) {
    const err = new Error('Collaboration request not found');
    err.status = 404;
    throw err;
  }

  // Only the recipient can reject
  if (collaboration.to_owner_id.toString() !== owner_id) {
    const err = new Error('Only the recipient can reject this collaboration request');
    err.status = 403;
    throw err;
  }

  if (collaboration.status !== 'pending') {
    const err = new Error('Collaboration request is not pending');
    err.status = 400;
    throw err;
  }

  collaboration.status = 'rejected';
  await collaboration.save();
  
  return collaboration;
};

const cancelCollaborationRequest = async (collab_id, owner_id) => {
  const collaboration = await Collaboration.findById(collab_id);
  
  if (!collaboration) {
    const err = new Error('Collaboration request not found');
    err.status = 404;
    throw err;
  }

  // Only the sender can cancel
  if (collaboration.from_owner_id.toString() !== owner_id) {
    const err = new Error('Only the sender can cancel this collaboration request');
    err.status = 403;
    throw err;
  }

  if (collaboration.status !== 'pending') {
    const err = new Error('Only pending requests can be cancelled');
    err.status = 400;
    throw err;
  }

  await Collaboration.findByIdAndDelete(collab_id);
  return { message: 'Collaboration request cancelled successfully' };
};

const endCollaboration = async (collab_id, owner_id) => {
  const collaboration = await Collaboration.findById(collab_id);
  
  if (!collaboration) {
    const err = new Error('Collaboration not found');
    err.status = 404;
    throw err;
  }

  // Only participants can end collaboration
  const isParticipant = (
    collaboration.from_owner_id.toString() === owner_id ||
    collaboration.to_owner_id.toString() === owner_id
  );

  if (!isParticipant) {
    const err = new Error('Only collaboration participants can end it');
    err.status = 403;
    throw err;
  }

  if (collaboration.status !== 'active') {
    const err = new Error('Only active collaborations can be ended');
    err.status = 400;
    throw err;
  }

  await Collaboration.findByIdAndDelete(collab_id);
  return { message: 'Collaboration ended successfully' };
};

const getCollaborationById = async (collab_id, owner_id) => {
  const collaboration = await Collaboration.findById(collab_id)
    .populate('from_owner_id', 'name company_name email phone address')
    .populate('to_owner_id', 'name company_name email phone address');

  if (!collaboration) {
    const err = new Error('Collaboration not found');
    err.status = 404;
    throw err;
  }

  // Verify owner has access to this collaboration
  const hasAccess = (
    collaboration.from_owner_id._id.toString() === owner_id ||
    collaboration.to_owner_id._id.toString() === owner_id
  );

  if (!hasAccess) {
    const err = new Error('Access denied to this collaboration');
    err.status = 403;
    throw err;
  }

  return collaboration;
};

const searchOwners = async (owner_id, searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) {
    const err = new Error('Search term must be at least 2 characters');
    err.status = 400;
    throw err;
  }

  const owners = await User.find({
    _id: { $ne: owner_id }, // Exclude self
    role: 'owner',
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { company_name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ]
  })
    .select('name company_name email phone address')
    .limit(10);

  return {
    count: owners.length,
    owners
  };
};

module.exports = {
  sendCollaborationRequest,
  getCollaborationRequests,
  getMySentRequests,
  getActiveCollaborations,
  acceptCollaboration,
  rejectCollaboration,
  cancelCollaborationRequest,
  endCollaboration,
  getCollaborationById,
  searchOwners
};
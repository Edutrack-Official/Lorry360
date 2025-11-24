const Settlement = require('../models/settlement.model');
const Trip = require('../models/trip.model');
const Collaboration = require('../models/collaboration.model');
const User = require('../models/user.model');

/**
 * Calculate net settlement between two owners
 */
// const calculateNetSettlement = async (owner_A_id, owner_B_id, from_date, to_date) => {
//   console.log('Calculating net settlement between:', owner_A_id, 'and', owner_B_id, 'from', from_date, 'to', to_date);
  
//   // Get all collaborative trips between these owners in date range
//   const trips = await Trip.find({
//     $or: [
//       { owner_id: owner_A_id, collab_owner_id: owner_B_id },
//       { owner_id: owner_B_id, collab_owner_id: owner_A_id }
//     ],
//     trip_date: { $gte: new Date(from_date), $lte: new Date(to_date) },
//     status: { $in: ['delivered', 'completed'] }
//   })
//   .populate('owner_id', 'name')
//   .populate('collab_owner_id', 'name')
//   .populate('lorry_id', 'registration_number')
//   .populate('driver_id', 'name');

//   console.log(`Found ${trips.length} collaborative trips`);

//   let a_to_b_amount = 0; // Amount that A should pay to B (A owes B)
//   let b_to_a_amount = 0; // Amount that B should pay to A (B owes A)
//   const tripBreakdown = [];

//   trips.forEach(trip => {
//     const settlementAmount = trip.settlement_amount || trip.crusher_amount;
//     let direction;
//     let payableBy;
//     let receivableBy;

//     if (trip.owner_id._id.toString() === owner_A_id.toString()) {
//       // Trip created by A with B as collaborative owner
//       // B received material from A → B should pay A
//       direction = 'a_to_b';
//       payableBy = 'owner_B';
//       receivableBy = 'owner_A';
//       b_to_a_amount += settlementAmount; // B owes A
//       console.log(`Trip ${trip.trip_number}: A → B, B owes A: ${settlementAmount}`);
//     } else {
//       // Trip created by B with A as collaborative owner  
//       // A received material from B → A should pay B
//       direction = 'b_to_a';
//       payableBy = 'owner_A';
//       receivableBy = 'owner_B';
//       a_to_b_amount += settlementAmount; // A owes B
//       console.log(`Trip ${trip.trip_number}: B → A, A owes B: ${settlementAmount}`);
//     }

//     tripBreakdown.push({
//       trip_id: trip._id,
//       direction: direction,
//       amount: settlementAmount,
//       trip_number: trip.trip_number,
//       trip_date: trip.trip_date,
//       material_name: trip.material_name,
//       location: trip.location,
//       settlement_amount: settlementAmount,
//       payable_by: payableBy,
//       receivable_by: receivableBy
//     });
//   });

//   console.log('Total amounts:');
//   console.log('A owes B (a_to_b_amount):', a_to_b_amount);
//   console.log('B owes A (b_to_a_amount):', b_to_a_amount);

//   // Calculate net amount
//   // Positive: A owes B (A should pay B)
//   // Negative: B owes A (B should pay A)
//   const netAmount = a_to_b_amount - b_to_a_amount;
  
//   let settlementType, netPayableBy;
  
//   if (netAmount > 0) {
//     settlementType = 'net_settlement';
//     netPayableBy = 'owner_A'; // A pays B (A owes B)
//     console.log(`Net result: A owes B ${Math.abs(netAmount)}`);
//   } else if (netAmount < 0) {
//     settlementType = 'net_settlement';
//     netPayableBy = 'owner_B'; // B pays A (B owes A)
//     console.log(`Net result: B owes A ${Math.abs(netAmount)}`);
//   } else {
//     settlementType = 'net_settlement';
//     netPayableBy = 'none'; // Perfect balance
//     console.log('Net result: Balanced, no payment needed');
//   }

//   const result = {
//     net_amount: Math.abs(netAmount),
//     amount_breakdown: {
//       a_to_b_trips_amount: a_to_b_amount, // Amount A owes B
//       b_to_a_trips_amount: b_to_a_amount, // Amount B owes A
//       net_payable_by: netPayableBy
//     },
//     trip_count: trips.length,
//     trip_breakdown: tripBreakdown,
//     settlement_type: settlementType
//   };

//   console.log('Final settlement result:', result);
//   return result;
// };

const calculateNetSettlement = async (owner_A_id, owner_B_id, from_date, to_date) => {
  console.log('Calculating net settlement between:', owner_A_id, 'and', owner_B_id, 'from', from_date, 'to', to_date);
  
  // First, find all settlements between these owners in the date range to get excluded trip IDs
  const existingSettlements = await Settlement.find({
    $or: [
      { owner_A_id: owner_A_id, owner_B_id: owner_B_id },
      { owner_A_id: owner_B_id, owner_B_id: owner_A_id }
    ],
    $or: [
      { from_date: { $lte: new Date(to_date) }, to_date: { $gte: new Date(from_date) } },
      { from_date: { $gte: new Date(from_date), $lte: new Date(to_date) } }
    ]
  });

  // Collect all trip IDs that are already included in settlements
  const excludedTripIds = [];
  existingSettlements.forEach(settlement => {
    if (settlement.trip_ids && settlement.trip_ids.length > 0) {
      excludedTripIds.push(...settlement.trip_ids.map(id => id.toString()));
    }
  });

  console.log(`Found ${existingSettlements.length} existing settlements with ${excludedTripIds.length} excluded trips`);

  // Build query to exclude trips that are already in settlements
  const tripQuery = {
    $or: [
      { owner_id: owner_A_id, collab_owner_id: owner_B_id },
      { owner_id: owner_B_id, collab_owner_id: owner_A_id }
    ],
    trip_date: { $gte: new Date(from_date), $lte: new Date(to_date) },
    status: { $in: ['delivered', 'completed'] }
  };

  // Only add exclusion if there are trips to exclude
  if (excludedTripIds.length > 0) {
    tripQuery._id = { $nin: excludedTripIds };
  }

  // Get all collaborative trips between these owners in date range that are not in settlements
  const trips = await Trip.find(tripQuery)
    .populate('owner_id', 'name company_name phone email')
    .populate('collab_owner_id', 'name company_name phone email')
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .sort({ trip_date: 1 });

  console.log(`Found ${trips.length} collaborative trips available for settlement`);

  let a_to_b_amount = 0; // Amount that A should pay to B (A owes B)
  let b_to_a_amount = 0; // Amount that B should pay to A (B owes A)
  const tripBreakdown = [];
  
  // Separate trips by direction for better display
  const myTripsForPartner = []; // My trips delivered to partner
  const partnerTripsForMe = []; // Partner's trips delivered to me

  trips.forEach(trip => {
    const settlementAmount = trip.customer_amount;
    let direction;
    let payableBy;
    let receivableBy;
    let tripType;

    if (trip.owner_id._id.toString() === owner_A_id.toString()) {
      // Trip created by A with B as collaborative owner
      // B received material from A → B should pay A
      direction = 'a_to_b';
      payableBy = 'owner_B';
      receivableBy = 'owner_A';
      tripType = 'my_trip_for_partner';
      b_to_a_amount += settlementAmount; // B owes A
      myTripsForPartner.push(trip);
      console.log(`Trip ${trip.trip_number}: A → B, B owes A: ${settlementAmount}`);
    } else {
      // Trip created by B with A as collaborative owner  
      // A received material from B → A should pay B
      direction = 'b_to_a';
      payableBy = 'owner_A';
      receivableBy = 'owner_B';
      tripType = 'partner_trip_for_me';
      a_to_b_amount += settlementAmount; // A owes B
      partnerTripsForMe.push(trip);
      console.log(`Trip ${trip.trip_number}: B → A, A owes B: ${settlementAmount}`);
    }

    tripBreakdown.push({
      trip_id: trip._id,
      direction: direction,
      amount: settlementAmount,
      trip_number: trip.trip_number,
      trip_date: trip.trip_date,
      material_name: trip.material_name,
      location: trip.location,
      settlement_amount: settlementAmount,
      payable_by: payableBy,
      receivable_by: receivableBy,
      trip_type: tripType,
      // Detailed trip information
      trip_details: {
        owner: {
          _id: trip.owner_id._id,
          name: trip.owner_id.name,
          company_name: trip.owner_id.company_name,
          phone: trip.owner_id.phone,
          email: trip.owner_id.email
        },
        collab_owner: {
          _id: trip.collab_owner_id._id,
          name: trip.collab_owner_id.name,
          company_name: trip.collab_owner_id.company_name,
          phone: trip.collab_owner_id.phone,
          email: trip.collab_owner_id.email
        },
        lorry: trip.lorry_id ? {
          _id: trip.lorry_id._id,
          registration_number: trip.lorry_id.registration_number,
          nick_name: trip.lorry_id.nick_name
        } : null,
        driver: trip.driver_id ? {
          _id: trip.driver_id._id,
          name: trip.driver_id.name,
          phone: trip.driver_id.phone
        } : null,
        crusher: trip.crusher_id ? {
          _id: trip.crusher_id._id,
          name: trip.crusher_id.name
        } : null,
        rate_per_unit: trip.rate_per_unit,
        no_of_unit_crusher: trip.no_of_unit_crusher,
        no_of_unit_customer: trip.no_of_unit_crusher,
        crusher_amount: trip.crusher_amount,
        customer_amount: trip.customer_amount,
        profit: trip.profit,
        dc_number: trip.dc_number,
        notes: trip.notes
      }
    });
  });

  console.log('Total amounts:');
  console.log('A owes B (a_to_b_amount):', a_to_b_amount);
  console.log('B owes A (b_to_a_amount):', b_to_a_amount);

  // Calculate net amount
  // Positive: A owes B (A should pay B)
  // Negative: B owes A (B should pay A)
  const netAmount = a_to_b_amount - b_to_a_amount;
  
  let settlementType, netPayableBy;
  
  if (netAmount > 0) {
    settlementType = 'net_settlement';
    netPayableBy = 'owner_A'; // A pays B (A owes B)
    console.log(`Net result: A owes B ${Math.abs(netAmount)}`);
  } else if (netAmount < 0) {
    settlementType = 'net_settlement';
    netPayableBy = 'owner_B'; // B pays A (B owes A)
    console.log(`Net result: B owes A ${Math.abs(netAmount)}`);
  } else {
    settlementType = 'net_settlement';
    netPayableBy = 'none'; // Perfect balance
    console.log('Net result: Balanced, no payment needed');
  }

  const result = {
    net_amount: Math.abs(netAmount),
    amount_breakdown: {
      a_to_b_trips_amount: a_to_b_amount, // Amount A owes B
      b_to_a_trips_amount: b_to_a_amount, // Amount B owes A
      net_payable_by: netPayableBy
    },
    trip_count: trips.length,
    trip_breakdown: tripBreakdown,
    settlement_type: settlementType,
    // Enhanced trip categorization
    trip_categories: {
      my_trips_for_partner: {
        count: myTripsForPartner.length,
        total_amount: b_to_a_amount, // Partner owes me for my trips
        trips: myTripsForPartner
      },
      partner_trips_for_me: {
        count: partnerTripsForMe.length,
        total_amount: a_to_b_amount, // I owe partner for their trips
        trips: partnerTripsForMe
      }
    },
    // User information for display
    users: {
      owner_A: trips.length > 0 ? trips[0].owner_id._id.toString() === owner_A_id.toString() ? 
        trips[0].owner_id : trips[0].collab_owner_id : null,
      owner_B: trips.length > 0 ? trips[0].owner_id._id.toString() === owner_B_id.toString() ? 
        trips[0].owner_id : trips[0].collab_owner_id : null
    },
    // Information about excluded trips
    excluded_trips_info: {
      existing_settlements_count: existingSettlements.length,
      excluded_trips_count: excludedTripIds.length,
      message: excludedTripIds.length > 0 ? 
        `${excludedTripIds.length} trips are already included in existing settlements` :
        'No trips excluded'
    }
  };

  console.log('Final settlement result:', result);
  return result;
};

/**
 * Create a new settlement between two owners
 */
const createSettlement = async (settlementData) => {
  const { owner_A_id, owner_B_id, from_date, to_date, notes } = settlementData;

  // Validate required fields
  if (!owner_A_id || !owner_B_id || !from_date || !to_date) {
    const err = new Error('Owner A, Owner B, from date and to date are required');
    err.status = 400;
    throw err;
  }

  // Check if owners are different
  if (owner_A_id.toString() === owner_B_id.toString()) {
    const err = new Error('Owner A and Owner B cannot be the same');
    err.status = 400;
    throw err;
  }

  // Calculate net settlement (this will automatically exclude trips in existing settlements)
  const netCalculation = await calculateNetSettlement(owner_A_id, owner_B_id, from_date, to_date);

  if (netCalculation.trip_count === 0) {
    const err = new Error('No collaborative trips found in the specified period that are not already settled');
    err.status = 400;
    err.data = {
      excluded_trips_info: netCalculation.excluded_trips_info
    };
    throw err;
  }

  // If net amount is zero, create a completed settlement
  if (netCalculation.net_amount === 0) {
    const settlement = new Settlement({
      owner_A_id,
      owner_B_id,
      settlement_type: 'net_settlement',
      net_amount: 0,
      amount_breakdown: netCalculation.amount_breakdown,
      trip_breakdown: netCalculation.trip_breakdown,
      paid_amount: 0,
      due_amount: 0,
      status: 'completed',
      from_date,
      to_date,
      trip_ids: netCalculation.trip_breakdown.map(t => t.trip_id),
      notes
    });

    await settlement.save();
    
    // No need to mark trips as settled in trip model since we're using settlement collection for tracking
    return settlement;
  }

  // Create settlement with net amount due
  const settlement = new Settlement({
    owner_A_id,
    owner_B_id,
    settlement_type: 'net_settlement',
    net_amount: netCalculation.net_amount,
    amount_breakdown: netCalculation.amount_breakdown,
    trip_breakdown: netCalculation.trip_breakdown,
    paid_amount: 0,
    due_amount: netCalculation.net_amount,
    status: 'pending',
    from_date,
    to_date,
    trip_ids: netCalculation.trip_breakdown.map(t => t.trip_id),
    notes
  });

  await settlement.save();

  return settlement;
};
/**
 * Get all settlements for an owner
 */
const getAllSettlements = async (owner_id, filterParams = {}) => {
  const { status, start_date, end_date, partner_id } = filterParams;
  
  const query = {
    $or: [
      { owner_A_id: owner_id },
      { owner_B_id: owner_id }
    ]
  };
  
  if (status) query.status = status;
  
  // Filter by partner
  if (partner_id) {
    query.$or = [
      { owner_A_id: owner_id, owner_B_id: partner_id },
      { owner_B_id: owner_id, owner_A_id: partner_id }
    ];
  }
  
  // Date range filter
  if (start_date || end_date) {
    query.createdAt = {};
    if (start_date) query.createdAt.$gte = new Date(start_date);
    if (end_date) query.createdAt.$lte = new Date(end_date);
  }

  const settlements = await Settlement.find(query)
    .populate('owner_A_id', 'name company_name phone')
    .populate('owner_B_id', 'name company_name phone')
    .populate('payments.paid_by', 'name company_name')
    .populate('payments.paid_to', 'name company_name')
    .populate('payments.approved_by', 'name')
    .sort({ createdAt: -1 });

  return {
    count: settlements.length,
    settlements
  };
};

/**
 * Get settlement by ID
 */
const getSettlementById = async (id, user_id) => {
  const settlement = await Settlement.findOne({
    _id: id,
    $or: [
      { owner_A_id: user_id },
      { owner_B_id: user_id }
    ]
  })
    .populate('owner_A_id', 'name company_name phone email')
    .populate('owner_B_id', 'name company_name phone email')
    .populate('payments.paid_by', 'name company_name')
    .populate('payments.paid_to', 'name company_name')
    .populate('payments.approved_by', 'name')
    .populate('trip_breakdown.trip_id', 'trip_number trip_date material_name location');

  if (!settlement) {
    const err = new Error('Settlement not found');
    err.status = 404;
    throw err;
  }

  // Calculate payment summary
  const paymentSummary = {
    total_approved: settlement.payments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0),
    total_pending: settlement.payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0),
    remaining_due: settlement.due_amount,
    pending_payments: settlement.payments.filter(p => p.status === 'pending').length,
    approved_payments: settlement.payments.filter(p => p.status === 'approved').length
  };

  return {
    settlement,
    payment_summary: paymentSummary
  };
};

/**
 * Add payment to settlement
 */
const addPayment = async (settlement_id, paymentData, paid_by_user_id) => {
  const settlement = await Settlement.findById(settlement_id);
  if (!settlement) {
    const err = new Error('Settlement not found');
    err.status = 404;
    throw err;
  }

  // Verify that the user is one of the owners and is the payable party
  const isOwnerA = settlement.owner_A_id.toString() === paid_by_user_id.toString();
  const isOwnerB = settlement.owner_B_id.toString() === paid_by_user_id.toString();
  
  if (!isOwnerA && !isOwnerB) {
    const err = new Error('You are not authorized to add payments for this settlement');
    err.status = 403;
    throw err;
  }

  // Determine who should receive the payment
  let paid_to;
  if (settlement.amount_breakdown.net_payable_by === 'owner_A') {
    if (!isOwnerA) {
      const err = new Error('Only Owner A can make payments for this settlement');
      err.status = 403;
      throw err;
    }
    paid_to = settlement.owner_B_id;
  } else if (settlement.amount_breakdown.net_payable_by === 'owner_B') {
    if (!isOwnerB) {
      const err = new Error('Only Owner B can make payments for this settlement');
      err.status = 403;
      throw err;
    }
    paid_to = settlement.owner_A_id;
  } else {
    const err = new Error('No payment required for this settlement');
    err.status = 400;
    throw err;
  }

  // Check if payment amount exceeds due amount
  const pendingPaymentsAmount = settlement.payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  if (paymentData.amount > (settlement.due_amount - pendingPaymentsAmount)) {
    const err = new Error('Payment amount exceeds remaining due amount');
    err.status = 400;
    throw err;
  }

  // Add payment with pending status
  settlement.payments.push({
    paid_by: paid_by_user_id,
    paid_to: paid_to,
    amount: paymentData.amount,
    payment_date: paymentData.payment_date || new Date(),
    payment_mode: paymentData.payment_mode,
    reference_number: paymentData.reference_number,
    proof_document: paymentData.proof_document,
    notes: paymentData.notes,
    status: 'pending'
  });

  await settlement.save();
  return settlement;
};

/**
 * Approve payment
 */
const approvePayment = async (settlement_id, payment_index, approved_by_user_id, notes) => {
  const settlement = await Settlement.findById(settlement_id);
  if (!settlement) {
    const err = new Error('Settlement not found');
    err.status = 404;
    throw err;
  }

  // Verify payment exists
  if (!settlement.payments[payment_index]) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }

  const payment = settlement.payments[payment_index];

  // Verify that the approver is the receivable owner
  const isReceivableOwner = payment.paid_to.toString() === approved_by_user_id.toString();
  if (!isReceivableOwner) {
    const err = new Error('Only the receiving owner can approve payments');
    err.status = 403;
    throw err;
  }

  // Verify payment is pending
  if (payment.status !== 'pending') {
    const err = new Error(`Payment is already ${payment.status}`);
    err.status = 400;
    throw err;
  }

  // Approve the payment
  payment.status = 'approved';
  payment.approved_by = approved_by_user_id;
  payment.approved_at = new Date();
  payment.updated_at = new Date();
  if (notes) payment.notes = notes;

  // Update settlement amounts (triggered by pre-save middleware)
  await settlement.save();

  // If settlement is completed, mark all trips as settled
  if (settlement.status === 'completed') {
    await Trip.updateMany(
      { _id: { $in: settlement.trip_ids } },
      { is_settled: true, settlement_id: settlement._id }
    );
  }

  return settlement;
};

/**
 * Reject payment
 */
const rejectPayment = async (settlement_id, payment_index, rejected_by_user_id, rejection_reason) => {
  const settlement = await Settlement.findById(settlement_id);
  if (!settlement) {
    const err = new Error('Settlement not found');
    err.status = 404;
    throw err;
  }

  if (!settlement.payments[payment_index]) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }

  const payment = settlement.payments[payment_index];

  // Verify that the rejector is the receivable owner
  const isReceivableOwner = payment.paid_to.toString() === rejected_by_user_id.toString();
  if (!isReceivableOwner) {
    const err = new Error('Only the receiving owner can reject payments');
    err.status = 403;
    throw err;
  }

  if (payment.status !== 'pending') {
    const err = new Error(`Payment is already ${payment.status}`);
    err.status = 400;
    throw err;
  }

  payment.status = 'rejected';
  payment.rejection_reason = rejection_reason;
  payment.updated_at = new Date();

  await settlement.save();
  return settlement;
};

/**
 * Get settlement statistics
 */
const getSettlementStats = async (owner_id, period = 'month') => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const settlements = await Settlement.find({
    $or: [
      { owner_A_id: owner_id },
      { owner_B_id: owner_id }
    ],
    createdAt: { $gte: startDate }
  });

  const totalSettlements = settlements.length;
  const completedSettlements = settlements.filter(s => s.status === 'completed').length;
  const pendingSettlements = settlements.filter(s => s.status === 'pending').length;
  const totalAmount = settlements.reduce((sum, s) => sum + s.net_amount, 0);
  const totalPaid = settlements.reduce((sum, s) => sum + s.paid_amount, 0);
  const totalDue = settlements.reduce((sum, s) => sum + s.due_amount, 0);

  return {
    period,
    total_settlements: totalSettlements,
    completed_settlements: completedSettlements,
    pending_settlements: pendingSettlements,
    total_amount: totalAmount,
    total_paid: totalPaid,
    total_due: totalDue,
    completion_rate: totalSettlements > 0 ? (completedSettlements / totalSettlements) * 100 : 0
  };
};

/**
 * Get collaborative partners for an owner
 */
const getCollaborativePartners = async (owner_id) => {
  // Get collaborations where the owner is either from_owner or to_owner
  const collaborations = await Collaboration.find({
    $or: [
      { from_owner_id: owner_id },
      { to_owner_id: owner_id }
    ],
    status: 'active'
  })
  .populate('from_owner_id', 'name company_name phone email')
  .populate('to_owner_id', 'name company_name phone email');

  const partners = new Map();

  collaborations.forEach(collab => {
    if (collab.from_owner_id && collab.from_owner_id._id.toString() !== owner_id.toString()) {
      partners.set(collab.from_owner_id._id.toString(), collab.from_owner_id);
    }
    if (collab.to_owner_id && collab.to_owner_id._id.toString() !== owner_id.toString()) {
      partners.set(collab.to_owner_id._id.toString(), collab.to_owner_id);
    }
  });

  return Array.from(partners.values());
};

module.exports = {
  calculateNetSettlement,
  createSettlement,
  getAllSettlements,
  getSettlementById,
  addPayment,
  approvePayment,
  rejectPayment,
  getSettlementStats,
  getCollaborativePartners
};
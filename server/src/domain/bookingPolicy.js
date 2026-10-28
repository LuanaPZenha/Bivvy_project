'use strict';

const OWNER_ONLY = new Set(['accepted', 'declined', 'completed']);

const TRANSITIONS = {
  requested: ['accepted', 'declined', 'cancelled'],
  accepted: ['cancelled'],
  paid: ['completed', 'cancelled'],
  declined: [],
  cancelled: [],
  completed: [],
};

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function canTransition(booking, userId, nextStatus) {
  const status = String(nextStatus || '').toLowerCase();
  const isOwner = booking.ownerId === userId;
  const isRenter = booking.renterId === userId;
  if (!isOwner && !isRenter) {
    return { ok: false, status: 403, message: 'Forbidden' };
  }
  if (status === 'paid') {
    return { ok: false, status: 400, message: 'Payment is confirmed through checkout' };
  }
  if (OWNER_ONLY.has(status) && !isOwner) {
    return { ok: false, status: 403, message: 'Only the owner can update booking to this status' };
  }
  const allowed = TRANSITIONS[booking.status] || [];
  if (!allowed.includes(status)) {
    return {
      ok: false,
      status: 400,
      message: `Cannot transition booking from ${booking.status} to ${status}`,
    };
  }
  return { ok: true, status: 200, nextStatus: status };
}

module.exports = { TRANSITIONS, rangesOverlap, canTransition };

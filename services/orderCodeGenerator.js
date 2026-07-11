// services/orderCodeGenerator.js
// Generates order codes in format: LD-YYYYMMDD-XXXX (4-digit daily sequence).

const { Op } = require('sequelize');
const db = require('../models');

/**
 * Generate the next order code for today.
 * Format: LD-YYYYMMDD-XXXX where XXXX is a zero-padded daily sequence.
 * @returns {Promise<string>} Order code, e.g. "LD-20260710-0001"
 */
async function generateOrderCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const prefix = `LD-${dateStr}-`;

  try {
    // Find the latest order today by matching the prefix
    const latestOrder = await db.Order.findOne({
      where: {
        order_code: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [['order_code', 'DESC']],
      attributes: ['order_code'],
      raw: true,
    });

    let sequence = 1;

    if (latestOrder) {
      // Extract the sequence number from the latest order code
      const lastSequence = parseInt(latestOrder.order_code.split('-').pop(), 10);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  } catch (error) {
    console.error('[OrderCodeGenerator] Error:', error.message);
    // Fallback: use timestamp-based code
    const fallbackSeq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    return `${prefix}${fallbackSeq}`;
  }
}

module.exports = generateOrderCode;

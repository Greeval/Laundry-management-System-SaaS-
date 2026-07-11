// services/uniqueCodeGenerator.js
// Generates a unique 3-digit code (1–999) for payment matching.
// Checks against currently pending payments to avoid collisions.

const db = require('../models');

/**
 * Generate a unique 3-digit code not currently used by any pending payment.
 * @returns {Promise<number>} A unique code between 1 and 999
 */
async function generateUniqueCode() {
  try {
    // Get all unique_codes currently in use by pending payments
    const pendingPayments = await db.Payment.findAll({
      where: { status: 'pending' },
      attributes: ['unique_code'],
      raw: true,
    });

    const usedCodes = new Set(pendingPayments.map((p) => p.unique_code));

    // Edge case: all 999 codes are used
    if (usedCodes.size >= 999) {
      console.warn('[UniqueCodeGenerator] All 999 codes are in use! Returning random code (collision possible).');
      return Math.floor(Math.random() * 999) + 1;
    }

    // Generate a random code that's not in the used set
    let code;
    do {
      code = Math.floor(Math.random() * 999) + 1;
    } while (usedCodes.has(code));

    return code;
  } catch (error) {
    console.error('[UniqueCodeGenerator] Error:', error.message);
    // Fallback: return random code
    return Math.floor(Math.random() * 999) + 1;
  }
}

module.exports = generateUniqueCode;

const { Op } = require('sequelize');
const db = require('../models');

/**
 * Middleware untuk menghapus pesanan yang usianya lebih dari 24 jam.
 * Berjalan secara asynchronous agar tidak memblokir request utama.
 */
const autoCleanupOldOrders = (req, res, next) => {
    // 24 jam = 24 * 60 * 60 * 1000 milidetik
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fire and forget (tidak pakai await agar route tetap cepat)
    db.Order.destroy({
        where: {
            created_at: {
                [Op.lt]: twentyFourHoursAgo
            }
        }
    }).catch(err => {
        console.error('Error saat auto-cleanup pesanan lama:', err);
    });

    next();
};

module.exports = autoCleanupOldOrders;

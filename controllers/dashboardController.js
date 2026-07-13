// controllers/dashboardController.js
// Dashboard with daily summary stats

const { Op } = require('sequelize');
const db = require('../models');

const dashboardController = {
  /**
   * GET / — render dashboard with summary stats
   */
  async index(req, res) {
    try {
      // Calculate start and end of today
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // Execute all queries in parallel for better performance
      const [
        todayOrders,
        pendingPickup,
        pendingPayment,
        todayRevenueResult,
        recentOrders,
        pendingPayments
      ] = await Promise.all([
        // Count orders created today
        db.Order.count({
          where: {
            tenant_id: req.session.user.tenant_id,
            createdAt: { [Op.between]: [todayStart, todayEnd] },
          },
        }),
        // Count orders pending pickup (not yet picked up)
        db.Order.count({
          where: {
            tenant_id: req.session.user.tenant_id,
            status: { [Op.in]: ['menunggu', 'diproses', 'selesai'] },
          },
        }),
        // Count pending payments
        db.Payment.count({
          where: { tenant_id: req.session.user.tenant_id, status: 'pending' },
        }),
        // Calculate today's revenue (paid payments today)
        db.Payment.findAll({
          where: { 
            tenant_id: req.session.user.tenant_id,
            status: 'paid',
            paid_at: { [Op.between]: [todayStart, todayEnd] }
          },
          attributes: [
            [db.sequelize.fn('SUM', db.sequelize.col('base_amount')), 'total'],
          ],
          raw: true,
        }),
        // Get recent orders (latest 10)
        db.Order.findAll({
          where: { tenant_id: req.session.user.tenant_id },
          include: [{ model: db.Customer, as: 'customer' }],
          order: [['createdAt', 'DESC']],
          limit: 10,
        }),
        // Get pending payments with order and customer info
        db.Payment.findAll({
          where: { tenant_id: req.session.user.tenant_id, status: 'pending' },
          include: [{
            model: db.Order,
            as: 'order',
            include: [{ model: db.Customer, as: 'customer' }],
          }],
          order: [[{ model: db.Order, as: 'order' }, 'createdAt', 'DESC']],
        })
      ]);

      const todayRevenue = todayRevenueResult[0] ? (parseFloat(todayRevenueResult[0].total) || 0) : 0;

      res.render('dashboard/index', {
        title: 'Dashboard',
        stats: {
          todayOrders,
          pendingPickup,
          pendingPayment,
          todayRevenue
        },
        recentOrders,
        pendingPayments,
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    } catch (error) {
      console.error('[DashboardController] Error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memuat dashboard.');
      res.render('dashboard/index', {
        title: 'Dashboard',
        todayOrders: 0,
        pendingPickup: 0,
        pendingPayment: 0,
        todayRevenue: 0,
        recentOrders: [],
        pendingPayments: [],
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    }
  },
};

module.exports = dashboardController;

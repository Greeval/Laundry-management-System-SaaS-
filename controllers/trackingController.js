// controllers/trackingController.js
const db = require('../models');

const trackingController = {
  async index(req, res) {
    try {
      const { code } = req.query;
      let order = null;

      if (code) {
        order = await db.Order.findOne({
          where: { order_code: code },
          include: [
            { model: db.Tenant, as: 'tenant' },
            { model: db.Customer, as: 'customer' },
            { model: db.Payment, as: 'payment' }
          ]
        });
      }

      res.render('track/index', {
        layout: false,
        title: 'Lacak Pesanan',
        code: code || '',
        order,
        messages: {
          error: req.flash('error'),
          success: req.flash('success')
        }
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Terjadi kesalahan sistem.');
      res.redirect('/track');
    }
  }
};

module.exports = trackingController;

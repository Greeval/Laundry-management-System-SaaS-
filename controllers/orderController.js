// controllers/orderController.js
// Full order lifecycle: create, process, complete, mark picked up

const { Op } = require('sequelize');
const db = require('../models');
const generateOrderCode = require('../services/orderCodeGenerator');
const generateUniqueCode = require('../services/uniqueCodeGenerator');
const whatsappService = require('../services/whatsappService');

const orderController = {
  /**
   * GET /orders — list orders with search, filter, pagination
   */
  async index(req, res) {
    try {
      const { search, status, date_from, date_to, page } = req.query;
      const limit = 10;
      const currentPage = parseInt(page, 10) || 1;
      const offset = (currentPage - 1) * limit;

      // Build where clause
      const whereClause = { tenant_id: req.session.user.tenant_id };
      const includeClause = [{
        model: db.Customer,
        as: 'customer',
        attributes: ['id', 'name', 'phone_number'],
      }];

      // Status filter
      if (status && ['menunggu', 'diproses', 'selesai', 'diambil'].includes(status)) {
        whereClause.status = status;
      }

      // Date filter
      if (date_from) {
        whereClause.createdAt = whereClause.createdAt || {};
        whereClause.createdAt[Op.gte] = new Date(date_from + 'T00:00:00');
      }
      if (date_to) {
        whereClause.createdAt = whereClause.createdAt || {};
        whereClause.createdAt[Op.lte] = new Date(date_to + 'T23:59:59');
      }

      // Search by customer name or phone
      if (search) {
        includeClause[0].where = {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { phone_number: { [Op.like]: `%${search}%` } },
          ],
        };
        includeClause[0].required = true;
      }

      const { count, rows: orders } = await db.Order.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      res.render('orders/index', {
        title: 'Daftar Pesanan',
        orders,
        currentPage,
        totalPages,
        totalOrders: count,
        search: search || '',
        status: status || '',
        date_from: date_from || '',
        date_to: date_to || '',
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    } catch (error) {
      console.error('[OrderController] Index error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memuat daftar pesanan.');
      res.redirect('/');
    }
  },

  /**
   * GET /orders/create — show create form
   */
  async create(req, res) {
    try {
      const customers = await db.Customer.findAll({
        where: { tenant_id: req.session.user.tenant_id },
        order: [['name', 'ASC']],
      });
      const settings = await db.LaundrySetting.getCurrent(req.session.user.tenant_id);

      res.render('orders/create', {
        title: 'Buat Pesanan Baru',
        customers,
        settings,
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    } catch (error) {
      console.error('[OrderController] Create form error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memuat form pesanan.');
      res.redirect('/orders');
    }
  },

  /**
   * POST /orders — store new order
   */
  async store(req, res) {
    try {
      const {
        customer_id,
        customer_name,
        customer_phone,
        customer_address,
        service_type,
        notes,
      } = req.body;

      let customerId = customer_id;

      // Create new customer if no existing customer selected
      if (!customerId || customerId === 'new') {
        if (!customer_name || !customer_phone) {
          req.flash('error', 'Nama dan nomor telepon customer wajib diisi.');
          return res.redirect('/orders/create');
        }

        const newCustomer = await db.Customer.create({
          tenant_id: req.session.user.tenant_id,
          name: customer_name,
          phone_number: customer_phone,
          address: customer_address || null,
        });
        customerId = newCustomer.id;
      }

      // Generate order code
      const orderCode = await generateOrderCode();

      // Create order with status 'menunggu'
      const order = await db.Order.create({
        tenant_id: req.session.user.tenant_id,
        order_code: orderCode,
        customer_id: customerId,
        created_by: req.session.user.id,
        service_type: service_type || 'reguler',
        status: 'menunggu',
        notes: notes || null,
      });

      req.flash('success', `Pesanan ${orderCode} berhasil dibuat.`);
      return res.redirect(`/orders/${order.id}`);
    } catch (error) {
      console.error('[OrderController] Store error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat membuat pesanan.');
      return res.redirect('/orders/create');
    }
  },

  /**
   * GET /orders/:id — show order detail
   */
  async show(req, res) {
    try {
      const order = await db.Order.findOne({
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id },
        include: [
          { model: db.Customer, as: 'customer' },
          {
            model: db.Payment,
            as: 'payment',
            include: [{ model: db.User, as: 'approver', attributes: ['id', 'name'] }],
          },
          { model: db.User, as: 'creator', attributes: ['id', 'name'] },
          {
            model: db.WaMessageLog,
            as: 'waLogs',
            order: [['sent_at', 'DESC']],
          },
        ],
      });

      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan.');
        return res.redirect('/orders');
      }

      const settings = await db.LaundrySetting.getCurrent(req.session.user.tenant_id);

      res.render('orders/show', {
        title: `Pesanan ${order.order_code}`,
        order,
        settings,
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    } catch (error) {
      console.error('[OrderController] Show error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memuat detail pesanan.');
      return res.redirect('/orders');
    }
  },

  /**
   * POST /orders/:id/process — update status menunggu → diproses
   */
  async process(req, res) {
    try {
      const order = await db.Order.findOne({
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id },
        include: [{ model: db.Customer, as: 'customer' }],
      });

      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan.');
        return res.redirect('/orders');
      }

      if (order.status !== 'menunggu') {
        req.flash('error', 'Pesanan hanya bisa diproses dari status "menunggu".');
        return res.redirect(`/orders/${order.id}`);
      }

      // Update status
      await order.update({ status: 'diproses' });

      // Send WA notification (stub logs to wa_message_log)
      await whatsappService.sendProcessingNotification(order, order.customer);

      req.flash('success', 'Status pesanan diubah menjadi "diproses". Notifikasi WA telah dikirim.');
      return res.redirect(`/orders/${order.id}`);
    } catch (error) {
      console.error('[OrderController] Process error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memproses pesanan.');
      return res.redirect(`/orders/${req.params.id}`);
    }
  },

  /**
   * GET /orders/:id/complete — show complete form (weight input)
   */
  async completeForm(req, res) {
    try {
      const order = await db.Order.findOne({
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id },
        include: [{ model: db.Customer, as: 'customer' }],
      });

      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan.');
        return res.redirect('/orders');
      }

      if (order.status !== 'diproses') {
        req.flash('error', 'Pesanan hanya bisa diselesaikan dari status "diproses".');
        return res.redirect(`/orders/${order.id}`);
      }

      const settings = await db.LaundrySetting.getCurrent(req.session.user.tenant_id);

      res.render('orders/complete', {
        title: `Selesaikan Pesanan ${order.order_code}`,
        order,
        settings,
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    } catch (error) {
      console.error('[OrderController] Complete form error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memuat form penyelesaian.');
      return res.redirect(`/orders/${req.params.id}`);
    }
  },

  /**
   * POST /orders/:id/complete — finalize order with weight, price, payment
   */
  async complete(req, res) {
    try {
      const order = await db.Order.findOne({
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id },
        include: [{ model: db.Customer, as: 'customer' }],
      });

      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan.');
        return res.redirect('/orders');
      }

      if (order.status !== 'diproses') {
        req.flash('error', 'Pesanan hanya bisa diselesaikan dari status "diproses".');
        return res.redirect(`/orders/${order.id}`);
      }

      const { weight_kg, method: payment_method, manual_override, manual_price } = req.body;

      if (!manual_override && (!weight_kg || parseFloat(weight_kg) <= 0)) {
        req.flash('error', 'Berat (kg) harus diisi dan lebih dari 0.');
        return res.redirect(`/orders/${order.id}/complete`);
      }

      if (!payment_method || !['cash', 'transfer', 'qris'].includes(payment_method)) {
        req.flash('error', 'Metode pembayaran harus dipilih.');
        return res.redirect(`/orders/${order.id}/complete`);
      }

      const weight = parseFloat(weight_kg) || 0;
      let priceTotal;
      let settings = await db.LaundrySetting.getCurrent(req.session.user.tenant_id);

      // Calculate price
      if (manual_override && manual_price) {
        // Manual override: use provided price
        priceTotal = parseFloat(manual_price);
      } else {
        // Calculate from settings
        if (!settings) {
          req.flash('error', 'Pengaturan tarif belum dikonfigurasi. Silakan atur di menu Pengaturan.');
          return res.redirect(`/orders/${order.id}/complete`);
        }

        const { price } = require('../utils/helpers').getServiceDetails(order.service_type, settings);
        priceTotal = weight * price;
      }

      // Generate unique code for payment matching
      const uniqueCode = await generateUniqueCode();
      const expectedAmount = priceTotal + uniqueCode;

      // Update order
      await order.update({
        status: 'selesai',
        weight_kg: weight,
        price_total: priceTotal,
      });

      // Create payment record
      const payment = await db.Payment.create({
        tenant_id: req.session.user.tenant_id,
        order_id: order.id,
        method: payment_method,
        base_amount: priceTotal,
        unique_code: uniqueCode,
        expected_amount: expectedAmount,
        status: 'pending',
      });

      // Send WA invoice notification
      await whatsappService.sendInvoiceNotification(order, order.customer, payment, settings);

      req.flash('success', 'Pesanan selesai. Invoice WA telah dikirim ke customer.');
      return res.redirect(`/orders/${order.id}`);
    } catch (error) {
      console.error('[OrderController] Complete error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat menyelesaikan pesanan.');
      return res.redirect(`/orders/${req.params.id}/complete`);
    }
  },

  /**
   * POST /orders/:id/picked-up — mark order as picked up
   */
  async markPickedUp(req, res) {
    try {
      const order = await db.Order.findOne({
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id },
        include: [{ model: db.Payment, as: 'payment' }],
      });

      if (!order) {
        req.flash('error', 'Pesanan tidak ditemukan.');
        return res.redirect('/orders');
      }

      if (order.status !== 'selesai') {
        req.flash('error', 'Pesanan hanya bisa diambil dari status "selesai".');
        return res.redirect(`/orders/${order.id}`);
      }

      if (!order.payment || order.payment.status !== 'paid') {
        req.flash('error', 'Pembayaran harus disetujui (paid) sebelum pesanan bisa ditandai sebagai diambil.');
        return res.redirect(`/orders/${order.id}`);
      }

      await order.update({ status: 'diambil' });

      req.flash('success', 'Pesanan telah ditandai sebagai diambil.');
      return res.redirect(`/orders/${order.id}`);
    } catch (error) {
      console.error('[OrderController] Mark picked up error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat mengupdate status pesanan.');
      return res.redirect(`/orders/${req.params.id}`);
    }
  },
};

module.exports = orderController;

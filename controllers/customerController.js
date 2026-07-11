// controllers/customerController.js
// CRUD operations for customers (no login for customers — internal use only)

const { Op } = require('sequelize');
const db = require('../models');

const customerController = {
  /**
   * GET /customers — list customers with search, include order count
   */
  async index(req, res) {
    try {
      const { search, page } = req.query;
      const limit = 10;
      const currentPage = parseInt(page, 10) || 1;
      const offset = (currentPage - 1) * limit;

      const whereClause = { tenant_id: req.session.user.tenant_id };

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { phone_number: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows: customers } = await db.Customer.findAndCountAll({
        where: whereClause,
        order: [['name', 'ASC']],
        limit,
        offset,
      });

      // Get order counts for each customer
      const customerIds = customers.map((c) => c.id);
      const orderCounts = await db.Order.findAll({
        where: { 
          customer_id: { [Op.in]: customerIds },
          tenant_id: req.session.user.tenant_id
        },
        attributes: [
          'customer_id',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'order_count'],
        ],
        group: ['customer_id'],
        raw: true,
      });

      const countMap = {};
      orderCounts.forEach((oc) => {
        countMap[oc.customer_id] = parseInt(oc.order_count, 10);
      });

      // Attach order count to each customer
      const customersWithCount = customers.map((c) => {
        const plain = c.toJSON();
        plain.orderCount = countMap[c.id] || 0;
        return plain;
      });

      const totalPages = Math.ceil(count / limit);

      res.render('customers/index', {
        title: 'Daftar Customer',
        customers: customersWithCount,
        currentPage,
        totalPages,
        totalCustomers: count,
        search: search || '',
        query: req.query,
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    } catch (error) {
      console.error('[CustomerController] Index error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memuat daftar customer.');
      res.redirect('/');
    }
  },

  /**
   * GET /customers/:id — show customer detail with order history
   */
  async show(req, res) {
    try {
      const customer = await db.Customer.findOne({ 
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id } 
      });

      if (!customer) {
        req.flash('error', 'Customer tidak ditemukan.');
        return res.redirect('/customers');
      }

      const orders = await db.Order.findAll({
        where: { customer_id: customer.id, tenant_id: req.session.user.tenant_id },
        include: [
          { model: db.Payment, as: 'payment' },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.render('customers/show', {
        title: `Customer: ${customer.name}`,
        customer,
        orders,
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    } catch (error) {
      console.error('[CustomerController] Show error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memuat detail customer.');
      return res.redirect('/customers');
    }
  },

  /**
   * GET /customers/create — show create form
   */
  create(req, res) {
    res.render('customers/create', {
      title: 'Tambah Customer Baru',
      messages: {
        success: req.flash('success'),
        error: req.flash('error'),
      },
    });
  },

  /**
   * POST /customers — store new customer
   */
  async store(req, res) {
    try {
      const { name, phone_number, address } = req.body;

      if (!name || !phone_number) {
        req.flash('error', 'Nama dan nomor telepon wajib diisi.');
        return res.redirect('/customers/create');
      }

      const customer = await db.Customer.create({
        tenant_id: req.session.user.tenant_id,
        name,
        phone_number,
        address: address || null,
      });

      req.flash('success', `Customer "${customer.name}" berhasil ditambahkan.`);
      return res.redirect(`/customers/${customer.id}`);
    } catch (error) {
      console.error('[CustomerController] Store error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat menambahkan customer.');
      return res.redirect('/customers/create');
    }
  },

  /**
   * GET /customers/:id/edit — show edit form
   */
  async edit(req, res) {
    try {
      const customer = await db.Customer.findOne({ 
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id } 
      });

      if (!customer) {
        req.flash('error', 'Customer tidak ditemukan.');
        return res.redirect('/customers');
      }

      res.render('customers/edit', {
        title: `Edit Customer: ${customer.name}`,
        customer,
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    } catch (error) {
      console.error('[CustomerController] Edit error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memuat form edit customer.');
      return res.redirect('/customers');
    }
  },

  /**
   * POST /customers/:id — update customer
   */
  async update(req, res) {
    try {
      const customer = await db.Customer.findOne({ 
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id } 
      });

      if (!customer) {
        req.flash('error', 'Customer tidak ditemukan.');
        return res.redirect('/customers');
      }

      const { name, phone_number, address } = req.body;

      if (!name || !phone_number) {
        req.flash('error', 'Nama dan nomor telepon wajib diisi.');
        return res.redirect(`/customers/${customer.id}/edit`);
      }

      await customer.update({
        name,
        phone_number,
        address: address || null,
      });

      req.flash('success', `Customer "${customer.name}" berhasil diupdate.`);
      return res.redirect(`/customers/${customer.id}`);
    } catch (error) {
      console.error('[CustomerController] Update error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat mengupdate customer.');
      return res.redirect(`/customers/${req.params.id}/edit`);
    }
  },
};

module.exports = customerController;

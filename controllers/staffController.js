// controllers/staffController.js
const bcrypt = require('bcryptjs');
const db = require('../models');

const staffController = {
  async index(req, res) {
    try {
      const staffList = await db.User.findAll({
        where: { tenant_id: req.session.user.tenant_id, role: 'tenant_staff' }
      });
      res.render('staff/index', {
        title: 'Manajemen Staff',
        staffList,
        messages: {
          success: req.flash('success'),
          error: req.flash('error')
        }
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Gagal memuat data staff');
      res.redirect('/');
    }
  },

  async store(req, res) {
    try {
      const { name, email, password } = req.body;
      
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        req.flash('error', 'Email sudah digunakan');
        return res.redirect('/staff');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.User.create({
        tenant_id: req.session.user.tenant_id,
        name,
        email,
        password: hashedPassword,
        role: 'tenant_staff'
      });

      req.flash('success', 'Staff berhasil ditambahkan');
      res.redirect('/staff');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Gagal menambah staff');
      res.redirect('/staff');
    }
  },

  async destroy(req, res) {
    try {
      await db.User.destroy({
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id, role: 'tenant_staff' }
      });
      req.flash('success', 'Staff berhasil dihapus');
      res.redirect('/staff');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Gagal menghapus staff');
      res.redirect('/staff');
    }
  }
};

module.exports = staffController;

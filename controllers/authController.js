// controllers/authController.js
// Handles login, logout — session-based authentication with bcryptjs

const bcrypt = require('bcryptjs');
const db = require('../models');

const authController = {
  /**
   * GET /login — render login page
   */
  showLogin(req, res) {
    res.render('auth/login', {
      layout: false,
      title: 'Login',
      messages: {
        error: res.locals.error_msg || res.locals.error || [],
        success: res.locals.success_msg || [],
      },
    });
  },

  /**
   * POST /login — validate credentials, create session
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash('error', 'Email dan password harus diisi.');
        return res.redirect('/login');
      }

      // Find user by email
      const user = await db.User.findOne({ where: { email } });

      if (!user) {
        // Generic message to prevent user enumeration
        req.flash('error', 'Email atau password salah. Jika belum punya akun, silakan daftar baru.');
        return res.redirect('/login');
      }

      // Compare password
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        req.flash('error', 'Email atau password salah. Jika belum punya akun, silakan daftar baru.');
        return res.redirect('/login');
      }

      // Fetch laundry settings and cache in session
      const laundrySetting = await db.LaundrySetting.findOne({ where: { tenant_id: user.tenant_id } });

      // Create session
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
      };
      
      if (laundrySetting) {
        req.session.laundrySetting = laundrySetting;
      }

      req.flash('success', `Selamat datang, ${user.name}!`);
      return res.redirect('/');
    } catch (error) {
      console.error('[AuthController] Login error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat login. Silakan coba lagi.');
      return res.redirect('/login');
    }
  },

  /**
   * GET /register — render registration page
   */
  showRegister(req, res) {
    res.render('auth/register', {
      layout: false,
      title: 'Daftar Laundry Baru',
      messages: {
        error: res.locals.error_msg || res.locals.error || [],
        success: res.locals.success_msg || [],
      },
    });
  },

  /**
   * POST /register — create new tenant, owner user, and default settings
   */
  async registerTenant(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const { laundry_name, user_name, email, password } = req.body;

      if (!laundry_name || !user_name || !email || !password) {
        req.flash('error', 'Semua kolom wajib diisi.');
        return res.redirect('/register');
      }

      // Check if email exists
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        req.flash('error', 'Email sudah terdaftar. Silakan gunakan email lain atau login.');
        return res.redirect('/register');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create Tenant
      const tenant = await db.Tenant.create({
        name: laundry_name,
      }, { transaction: t });

      // Create User (Owner)
      const user = await db.User.create({
        tenant_id: tenant.id,
        name: user_name,
        email,
        password: hashedPassword,
        role: 'tenant_owner',
      }, { transaction: t });

      // Create default LaundrySetting
      await db.LaundrySetting.create({
        tenant_id: tenant.id,
        business_name: laundry_name,
        price_per_kg: 5000,
      }, { transaction: t });

      await t.commit();

      req.flash('success', 'Pendaftaran berhasil! Silakan login.');
      return res.redirect('/login');
    } catch (error) {
      await t.rollback();
      console.error('[AuthController] Register error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat pendaftaran.');
      return res.redirect('/register');
    }
  },

  /**
   * POST /logout — destroy session
   */
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('[AuthController] Logout error:', err.message);
      }
      res.redirect('/login');
    });
  },
};

module.exports = authController;

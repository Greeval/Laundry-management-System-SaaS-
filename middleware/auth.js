// middleware/auth.js
// Authentication and authorization middleware

/**
 * Require authenticated session.
 * Redirects to /login if no user in session.
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Silakan login terlebih dahulu.');
    return res.redirect('/login');
  }
  next();
}

/**
 * Require owner role.
 * Must be used AFTER requireAuth.
 */
function requireOwner(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'tenant_owner') {
    req.flash('error', 'Akses ditolak. Hanya owner yang dapat mengakses halaman ini.');
    return res.redirect('back');
  }
  next();
}

/**
 * Set common locals for all views.
 * Makes `user` and `currentPath` available in every EJS template.
 */
function setLocals(req, res, next) {
  res.locals.user = req.session ? req.session.user : null;
  res.locals.currentPath = req.path;
  
  if (req.session && req.session.user && req.session.user.tenant_id) {
    const db = require('../models');
    db.LaundrySetting.findOne({ where: { tenant_id: req.session.user.tenant_id } })
      .then(setting => {
        res.locals.laundrySetting = setting;
        next();
      })
      .catch(err => {
        console.error(err);
        next();
      });
  } else {
    next();
  }
}

module.exports = { requireAuth, requireOwner, setLocals };

let app;
let startupError = null;

try {
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const db = require('./models');

const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sessionStore = new SequelizeStore({
    db: db.sequelize
});

app = express();

// Trust Vercel's edge proxy for secure cookies
app.set('trust proxy', 1);

// Security Middleware (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Body parser & Static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Session & Flash
app.use(session({
    secret: process.env.SESSION_SECRET || 'laundry-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
app.use(flash());

// Serverless Session Saver Fix
// Vercel immediately ends the request on res.redirect, which interrupts req.session.save()
app.use((req, res, next) => {
    const originalRedirect = res.redirect;
    res.redirect = function (...args) {
        if (req.session && req.session.save) {
            req.session.save(() => {
                originalRedirect.apply(res, args);
            });
        } else {
            originalRedirect.apply(res, args);
        }
    };
    next();
});

// Global variables for views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.error = req.flash('error');
    next();
});

const { setLocals } = require('./middleware/auth');
app.use(setLocals);

// Register Global Helpers for Views
const helpers = require('./utils/helpers');
app.locals.h = helpers;

// Import Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const paymentRoutes = require('./routes/payments');
const settingRoutes = require('./routes/settings');
const staffRoutes = require('./routes/staff');
const trackingRoutes = require('./routes/tracking');

// Mount Routes
const autoCleanupOldOrders = require('./middleware/cleanup');
app.use(autoCleanupOldOrders);

// Error interception middleware for DB failures
app.use((req, res, next) => {
    if (startupError) {
        return res.status(500).send(`<pre style="color:red;font-size:16px;">
DATABASE INIT ERROR:
${startupError.stack || startupError}

ORIGINAL ERROR:
${startupError.original ? startupError.original.message : 'N/A'}

SQL:
${startupError.sql || 'N/A'}

DATABASE_URL is: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}
</pre>`);
    }
    next();
});

app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/orders', orderRoutes);
app.use('/customers', customerRoutes);
app.use('/payments', paymentRoutes);
app.use('/settings', settingRoutes);
app.use('/staff', staffRoutes);
app.use('/track', trackingRoutes);

const PORT = process.env.PORT || 3000;

// Start server
db.sequelize.sync().then(() => {
    // Only listen if run directly (not imported by Vercel)
    if (require.main === module) {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
}).catch(err => {
    startupError = err;
    console.error('Unable to connect to the database:', err);
});

} catch (e) {
    const express = require('express');
    app = express();
    app.use((req, res) => {
        res.status(500).send(`<pre style="white-space:pre-wrap; word-wrap:break-word; color:red;">APP CRASHED ON STARTUP:\n${e.stack || e}\n\nDATABASE_URL is: ${process.env.DATABASE_URL ? 'SET' : 'EMPTY'}</pre>`);
    });
    console.error("STARTUP ERROR CAUGHT:", e);
}

module.exports = app;

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const db = require('./models');

const app = express();

// Security Middleware (Helmet)
app.use(helmet());

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
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

module.exports = app;

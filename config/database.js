// config/database.js
// Sequelize configuration — SQLite (dev) / MySQL (prod)

require('dotenv').config();

const path = require('path');

const config = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false,
  },
  production: {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'web_laundry',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};

const env = process.env.NODE_ENV || 'development';

module.exports = config[env];

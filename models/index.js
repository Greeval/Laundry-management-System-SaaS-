// models/index.js
// Sequelize initialization — imports all models, sets up associations, exports db object

const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/database');

// Create Sequelize instance based on dialect
let sequelize;

if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else if (dbConfig.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbConfig.storage,
    logging: dbConfig.logging,
  });
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

// Import all models
const Tenant = require('./Tenant')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const Customer = require('./Customer')(sequelize, DataTypes);
const LaundrySetting = require('./LaundrySetting')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const Payment = require('./Payment')(sequelize, DataTypes);
const WaMessageLog = require('./WaMessageLog')(sequelize, DataTypes);

// Collect models
const db = {
  Tenant,
  User,
  Customer,
  LaundrySetting,
  Order,
  Payment,
  WaMessageLog,
  sequelize,
  Sequelize,
};

// Set up associations
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;

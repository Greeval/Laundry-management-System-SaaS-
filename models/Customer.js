// models/Customer.js

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'customers',
    timestamps: false,
    underscored: true,
  });

  Customer.associate = (models) => {
    Customer.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    Customer.hasMany(models.Order, { foreignKey: 'customer_id', as: 'orders' });
    Customer.hasMany(models.WaMessageLog, { foreignKey: 'customer_id', as: 'waMessages' });
  };

  return Customer;
};

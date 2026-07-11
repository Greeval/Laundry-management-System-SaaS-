// models/Order.js

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    service_type: {
      type: DataTypes.ENUM('reguler', 'express', 'cuci', 'cuci_kering', 'cuci_setrika'),
      allowNull: false,
      defaultValue: 'reguler',
    },
    status: {
      type: DataTypes.ENUM('menunggu', 'diproses', 'selesai', 'diambil'),
      allowNull: false,
      defaultValue: 'menunggu',
    },
    weight_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    price_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    Order.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    Order.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    Order.hasOne(models.Payment, { foreignKey: 'order_id', as: 'payment', onDelete: 'CASCADE' });
    Order.hasMany(models.WaMessageLog, { foreignKey: 'order_id', as: 'waLogs', onDelete: 'CASCADE' });
  };

  return Order;
};

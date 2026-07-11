// models/Payment.js

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM('cash', 'transfer', 'qris'),
      allowNull: false,
    },
    base_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    unique_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expected_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid'),
      allowNull: false,
      defaultValue: 'pending',
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    proof_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  }, {
    tableName: 'payments',
    timestamps: false,
    underscored: true,
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    Payment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    Payment.belongsTo(models.User, { foreignKey: 'approved_by', as: 'approver' });
  };

  return Payment;
};

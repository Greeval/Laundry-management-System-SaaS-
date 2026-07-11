// models/WaMessageLog.js

module.exports = (sequelize, DataTypes) => {
  const WaMessageLog = sequelize.define('WaMessageLog', {
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
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM('processing', 'invoice', 'reminder'),
      allowNull: false,
    },
    message_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'failed'),
      allowNull: false,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'wa_message_log',
    timestamps: false,
    underscored: true,
  });

  WaMessageLog.associate = (models) => {
    WaMessageLog.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    WaMessageLog.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    WaMessageLog.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
  };

  return WaMessageLog;
};

module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    tableName: 'tenants',
    timestamps: true,
  });

  Tenant.associate = (models) => {
    Tenant.hasMany(models.User, { foreignKey: 'tenant_id', as: 'users' });
    Tenant.hasMany(models.Customer, { foreignKey: 'tenant_id', as: 'customers' });
    Tenant.hasMany(models.Order, { foreignKey: 'tenant_id', as: 'orders' });
    Tenant.hasMany(models.Payment, { foreignKey: 'tenant_id', as: 'payments' });
    Tenant.hasOne(models.LaundrySetting, { foreignKey: 'tenant_id', as: 'setting' });
    Tenant.hasMany(models.WaMessageLog, { foreignKey: 'tenant_id', as: 'wa_logs' });
  };

  return Tenant;
};

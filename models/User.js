// models/User.js

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('superadmin', 'tenant_owner', 'tenant_staff'),
      defaultValue: 'tenant_owner',
      allowNull: false,
    }
  }, {
    tableName: 'users',
    timestamps: false,
    underscored: true,
  });

  User.associate = (models) => {
    User.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    User.hasMany(models.Order, { foreignKey: 'created_by', as: 'orders' });
    User.hasMany(models.Payment, { foreignKey: 'approved_by', as: 'approvedPayments' });
  };

  return User;
};

// models/LaundrySetting.js

module.exports = (sequelize, DataTypes) => {
  const LaundrySetting = sequelize.define('LaundrySetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    business_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price_per_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    express_price_per_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cuci_price_per_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    cuci_kering_price_per_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    cuci_setrika_price_per_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_account_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    bank_account_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qris_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    fonnte_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'laundry_settings',
    timestamps: false,
    underscored: true,
  });

  LaundrySetting.getCurrent = async function (tenant_id) {
    if (!tenant_id) throw new Error('tenant_id is required to get settings');
    let setting = await this.findOne({ where: { tenant_id } });
    if (!setting) {
      setting = await this.create({
        tenant_id,
        business_name: 'Laundry Baru',
        price_per_kg: 5000,
      });
    }
    return setting;
  };

  LaundrySetting.associate = (models) => {
    LaundrySetting.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
  };

  return LaundrySetting;
};

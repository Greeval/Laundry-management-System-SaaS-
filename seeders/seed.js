// seeders/seed.js
// Run: node seeders/seed.js

const bcrypt = require('bcryptjs');
const db = require('../models');

async function seed() {
  try {
    console.log('Syncing database (force: true)...');
    await db.sequelize.sync({ force: true });
    console.log('Database synced.\n');

    // 1. Create tenant
    const tenant = await db.Tenant.create({
      name: 'Laundry Express',
    });
    console.log(`Created tenant: ${tenant.name}`);

    // 2. Create owner user
    const hashedPassword = await bcrypt.hash('password', 10);
    const admin = await db.User.create({
      tenant_id: tenant.id,
      name: 'Admin',
      email: 'admin@laundry.com',
      password: hashedPassword,
      role: 'tenant_owner',
    });
    console.log(`Created user: ${admin.name} (${admin.role})`);

    // 3. Create laundry settings (singleton)
    const settings = await db.LaundrySetting.create({
      tenant_id: tenant.id,
      business_name: 'Laundry Express',
      price_per_kg: 7000,
      express_price_per_kg: 12000,
      bank_name: 'BCA',
      bank_account_number: '1234567890',
      bank_account_name: 'Laundry Express',
    });
    console.log(`Created settings: ${settings.business_name}`);

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

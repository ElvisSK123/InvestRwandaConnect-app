const bcrypt = require('bcrypt');
const pool = require('./database');

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...\n');

    // Admin credentials
    const adminEmail = 'admin@investrwanda.com';
    const adminPassword = 'Admin@123';  // Change this in production!
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      const user = existingAdmin.rows[0];
      
      if (user.role === 'admin') {
        console.log('✅ Admin user already exists!');
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Role: ${user.role}\n`);
        console.log('📝 Login credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}\n`);
        console.log('🌐 Admin Portal URL: http://localhost:5172\n');
        return;
      } else {
        // Update existing user to admin role
        await pool.query(
          'UPDATE users SET role = $1 WHERE email = $2',
          ['admin', adminEmail]
        );
        console.log('✅ Updated existing user to admin role!');
        console.log(`   Email: ${adminEmail}\n`);
        console.log('📝 Login credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: Use your existing password\n`);
        console.log('🌐 Admin Portal URL: http://localhost:5172\n');
        return;
      }
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create new admin user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [adminName, adminEmail, passwordHash, 'admin']
    );

    const newAdmin = result.rows[0];

    console.log('✅ Admin user created successfully!\n');
    console.log('👤 User Details:');
    console.log(`   ID: ${newAdmin.id}`);
    console.log(`   Name: ${newAdmin.full_name}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   Created: ${newAdmin.created_at}\n`);
    console.log('📝 Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');
    console.log('🌐 Admin Portal URL: http://localhost:5172\n');

    // Show all user stats
    const stats = await pool.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    console.log('📊 User Statistics:');
    stats.rows.forEach(row => {
      console.log(`   ${row.role}: ${row.count}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run the script
createAdminUser();

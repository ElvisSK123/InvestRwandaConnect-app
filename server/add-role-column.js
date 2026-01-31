const pool = require('./database');

async function addRoleColumn() {
  try {
    console.log('🔧 Checking and updating database schema...\n');

    // Check if role column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'role';
    `);

    if (checkColumn.rows.length === 0) {
      console.log('➕ Adding role column to users table...');
      
      // Add role column if it doesn't exist
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) 
        CHECK (role IN ('investor', 'seller', 'admin')) 
        DEFAULT 'investor';
      `);
      
      console.log('✅ Role column added successfully!\n');
    } else {
      console.log('✅ Role column already exists\n');
    }

    // Show current schema
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Current users table schema:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}${col.column_default ? ` (default: ${col.column_default})` : ''}`);
    });
    console.log('');

    // Show user count
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total users: ${userCount.rows[0].count}\n`);

    if (userCount.rows[0].count > 0) {
      const roleStats = await pool.query(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `);
      console.log('📈 Users by role:');
      roleStats.rows.forEach(row => {
        console.log(`   ${row.role || 'null'}: ${row.count}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

addRoleColumn();

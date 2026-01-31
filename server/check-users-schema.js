const pool = require('./database');

async function checkUsersSchema() {
  try {
    console.log('🔍 Checking users table schema...\n');

    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        column_default, 
        is_nullable,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Users table columns:');
    console.log('─'.repeat(80));
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` (default: ${col.column_default})` : '';
      console.log(`${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
    });
    console.log('─'.repeat(80));

    // Get a sample user
    const users = await pool.query('SELECT id, email, role FROM users LIMIT 3');
    console.log('\n📋 Sample users:');
    users.rows.forEach(user => {
      console.log(`  ID: ${user.id} (type: ${typeof user.id}) | Email: ${user.email} | Role: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkUsersSchema();

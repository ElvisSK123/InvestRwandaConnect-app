const pool = require('./database');

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Check if listings table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'listings'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ Listings table does not exist!');
      console.log('Run the schema.sql file to create the table.');
      return;
    }

    console.log('✅ Listings table exists\n');

    // Get all columns
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        column_default, 
        is_nullable,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'listings'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Listings table columns:');
    console.log('─'.repeat(80));
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` (default: ${col.column_default})` : '';
      console.log(`${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
    });
    console.log('─'.repeat(80));

    // Check for required columns that backend expects
    const requiredColumns = [
      'id', 'seller_id', 'title', 'type', 'category', 'description', 
      'short_description', 'asking_price', 'minimum_investment', 
      'location', 'district', 'images', 'status', 'verification_status',
      'rdb_registration_number', 'rra_tin', 'land_title_number',
      'projected_roi', 'year_established', 'employees', 'annual_revenue',
      'highlights', 'created_at', 'updated_at'
    ];

    console.log('\n🔎 Checking required columns:');
    const existingColumns = columns.rows.map(c => c.column_name);
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    if (missingColumns.length > 0) {
      console.log('❌ Missing columns:', missingColumns.join(', '));
    } else {
      console.log('✅ All required columns exist');
    }

    // Test insert with minimal data
    console.log('\n🧪 Testing insert with sample data...');
    
    // First, get a user ID to use
    const users = await pool.query('SELECT id FROM users LIMIT 1');
    if (users.rows.length === 0) {
      console.log('❌ No users found. Cannot test insert.');
      return;
    }
    
    const testUserId = users.rows[0].id;
    console.log(`Using user ID: ${testUserId}`);

    try {
      const testInsert = await pool.query(`
        INSERT INTO listings (
          seller_id, title, type, category, description, short_description, asking_price,
          minimum_investment, location, district, images, status, rdb_registration_number,
          rra_tin, land_title_number, projected_roi, year_established,
          employees, annual_revenue, highlights
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id, title, status
      `, [
        testUserId, 
        'Test Listing',
        'Business For Sale',
        'Technology',
        'Test description',
        'Test short desc',
        100000,
        50000,
        'Kigali',
        'Gasabo',
        ['image1.jpg'],
        'pending_review',
        'RDB123',
        'TIN456',
        'LAND789',
        15.5,
        2020,
        10,
        500000,
        ['Feature 1', 'Feature 2']
      ]);

      console.log('✅ Test insert successful!');
      console.log('Inserted listing:', testInsert.rows[0]);

      // Clean up test listing
      await pool.query('DELETE FROM listings WHERE id = $1', [testInsert.rows[0].id]);
      console.log('✅ Test listing cleaned up');

    } catch (insertError) {
      console.log('❌ Test insert failed!');
      console.log('Error:', insertError.message);
      console.log('Detail:', insertError.detail);
      console.log('Code:', insertError.code);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkSchema();

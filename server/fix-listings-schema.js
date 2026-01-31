const pool = require('./database');

async function fixListingsSchema() {
  try {
    console.log('🔧 Fixing listings table schema...\n');

    // Drop the listings table and recreate with correct schema
    console.log('1. Dropping existing listings table...');
    await pool.query('DROP TABLE IF EXISTS listings CASCADE');
    console.log('   ✅ Dropped\n');

    // Create listings table with INTEGER id and seller_id
    console.log('2. Creating listings table with correct schema...');
    await pool.query(`
      CREATE TABLE listings (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT,
        asking_price DECIMAL(15, 2) NOT NULL,
        minimum_investment DECIMAL(15, 2),
        location VARCHAR(255) NOT NULL,
        district VARCHAR(50),
        images TEXT[],
        status VARCHAR(50) DEFAULT 'draft',
        verification_status VARCHAR(50) DEFAULT 'unverified',
        rdb_registration_number VARCHAR(100),
        rra_tin VARCHAR(50),
        land_title_number VARCHAR(100),
        featured BOOLEAN DEFAULT FALSE,
        views_count INTEGER DEFAULT 0,
        inquiries_count INTEGER DEFAULT 0,
        projected_roi DECIMAL(5, 2),
        year_established INTEGER,
        employees INTEGER,
        annual_revenue DECIMAL(15, 2),
        highlights TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   ✅ Created\n');

    // Test insert
    console.log('3. Testing insert with sample data...');
    const users = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['seller']);
    let testUserId;
    
    if (users.rows.length === 0) {
      // Use any user
      const anyUser = await pool.query('SELECT id FROM users LIMIT 1');
      testUserId = anyUser.rows[0].id;
      console.log(`   Using user ID: ${testUserId} (role: investor)`);
    } else {
      testUserId = users.rows[0].id;
      console.log(`   Using user ID: ${testUserId} (role: seller)`);
    }

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
      'Test Coffee Business',
      'Business For Sale',
      'Agriculture',
      'A thriving coffee export business with established international clients',
      'Coffee export business',
      250000,
      100000,
      'Kigali',
      'Gasabo',
      ['https://example.com/coffee1.jpg'],
      'pending_review',
      'RDB123456',
      'TIN789012',
      null,
      20.5,
      2018,
      25,
      500000,
      ['Established client base', 'Export certifications', 'Modern equipment']
    ]);

    console.log('   ✅ Test insert successful!');
    console.log('   Created listing:', testInsert.rows[0]);
    console.log('');

    // Show table structure
    console.log('4. Final table structure:');
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'listings'
      ORDER BY ordinal_position
      LIMIT 10;
    `);
    
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`   ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}`);
    });

    console.log('\n✅ Schema fix complete!');
    console.log('📝 The listings table now uses INTEGER for IDs to match the users table.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

fixListingsSchema();

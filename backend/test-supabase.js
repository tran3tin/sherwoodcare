const { Pool } = require('pg');

async function testSupabase() {
  console.log('\n=== Testing Supabase Connection ===\n');

  // Test 1: Direct connection (port 5432)
  console.log('1. Testing Direct Connection (Port 5432)...');
  const directPool = new Pool({
    connectionString: 'postgresql://postgres:140293NgocDiem!@db.bdorxcdyegrofvqrogvp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const result = await directPool.query('SELECT NOW() as time, version() as version');
    console.log('✅ Direct connection OK');
    console.log('   Time:', result.rows[0].time);
    console.log('   Version:', result.rows[0].version.substring(0, 60));
  } catch (error) {
    console.error('❌ Direct connection failed:', error.message);
  } finally {
    await directPool.end();
  }

  console.log('\n2. Testing Pooler Connection (Port 6543)...');
  const poolerPool = new Pool({
    connectionString: 'postgresql://postgres:140293NgocDiem!@db.bdorxcdyegrofvqrogvp.supabase.co:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const result = await poolerPool.query('SELECT NOW() as time');
    console.log('✅ Pooler connection OK');
    console.log('   Time:', result.rows[0].time);
  } catch (error) {
    console.error('❌ Pooler connection failed:', error.message);
  } finally {
    await poolerPool.end();
  }

  // Test 3: Check active connections
  console.log('\n3. Checking Active Connections...');
  const checkPool = new Pool({
    connectionString: 'postgresql://postgres:140293NgocDiem!@db.bdorxcdyegrofvqrogvp.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await checkPool.query(`
      SELECT 
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) as total
      FROM pg_stat_activity
      WHERE datname = 'postgres'
    `);
    console.log('✅ Connection stats:');
    console.log('   Active:', result.rows[0].active);
    console.log('   Idle:', result.rows[0].idle);
    console.log('   Total:', result.rows[0].total);
  } catch (error) {
    console.error('❌ Failed to check connections:', error.message);
  } finally {
    await checkPool.end();
  }

  console.log('\n=== Test Complete ===\n');
}

testSupabase().catch(console.error);

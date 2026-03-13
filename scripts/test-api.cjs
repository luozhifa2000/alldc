/**
 * Test API endpoints
 */

const SUPABASE_URL = 'https://vhrzyhqnlngrtvfedzmr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnp5aHFubG5ncnR2ZmVkem1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTYyNjQsImV4cCI6MjA4ODc5MjI2NH0.fM0uGHgoKnD3WVmrJkLivYV66YzlFyTbq8YhZaVOVRg';
const API_BASE = `${SUPABASE_URL}/functions/v1/server`;

async function testAPI() {
  console.log('\n==============================================');
  console.log('Testing Life Moments API');
  console.log('==============================================\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const response = await fetch(`${API_BASE}/make-server-4f970b1f/health`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }

  // Test 2: Register
  console.log('\n2. Testing User Registration...');
  const testEmail = `test${Date.now()}@lifemoments.com`;
  let authToken = null;
  
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: testEmail,
        nickname: 'Test User',
        password: 'test123456',
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Registration failed:', error);
    } else {
      const data = await response.json();
      authToken = data.token;
      console.log('✅ Registration successful:', {
        email: data.user.email,
        nickname: data.user.nickname,
        token: authToken ? 'received' : 'missing',
      });
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
  }

  // Test 3: Login
  console.log('\n3. Testing Login...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'test123456',
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Login failed:', error);
    } else {
      const data = await response.json();
      authToken = data.token;
      console.log('✅ Login successful:', {
        email: data.user.email,
        token: authToken ? 'received' : 'missing',
      });
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }

  // Test 4: Create Moment
  if (authToken) {
    console.log('\n4. Testing Create Moment...');
    try {
      const response = await fetch(`${API_BASE}/moments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          shortDescription: 'First test moment',
          richContent: JSON.stringify([
            { type: 'text', content: 'This is my first moment!' },
          ]),
          impactPercent: 0.5,
          impactType: 'POSITIVE',
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.log('❌ Create moment failed:', error);
      } else {
        const data = await response.json();
        console.log('✅ Moment created:', {
          id: data.moment.id,
          description: data.moment.shortDescription,
        });
      }
    } catch (error) {
      console.log('❌ Create moment error:', error.message);
    }

    // Test 5: Get Moments
    console.log('\n5. Testing Get Moments...');
    try {
      const response = await fetch(`${API_BASE}/moments`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.log('❌ Get moments failed:', error);
      } else {
        const data = await response.json();
        console.log('✅ Moments retrieved:', {
          count: data.moments.length,
          total: data.pagination.total,
        });
      }
    } catch (error) {
      console.log('❌ Get moments error:', error.message);
    }

    // Test 6: Get Life Progress
    console.log('\n6. Testing Get Life Progress...');
    try {
      const response = await fetch(`${API_BASE}/moments/progress`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.log('❌ Get progress failed:', error);
      } else {
        const data = await response.json();
        console.log('✅ Progress retrieved:', {
          progress: data.progress,
          totalMoments: data.totalMoments,
        });
      }
    } catch (error) {
      console.log('❌ Get progress error:', error.message);
    }
  }

  console.log('\n==============================================');
  console.log('API Testing Complete');
  console.log('==============================================\n');
}

testAPI();


const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MDJiY2I3NS1jOGJjLTQ2OWEtYTJiMC1jMDY2OTEyNGVjYjMiLCJlbWFpbCI6ImRlYnVnQHRlc3QuY29tIiwiaWF0IjoxNzczMzYxODIxLCJleHAiOjE3NzM5NjY2MjF9.RI4FjWZNzyvSkG6KV0VU1sdWuOZ2PmM2ihBf1rsA3qI";

async function test() {
  // Create moment
  console.log('Creating moment...');
  const createRes = await fetch('http://localhost:3000/moments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      shortDescription: 'Test moment',
      richContent: '[]',
      impactPercent: 5,
      impactType: 'POSITIVE',
    }),
  });
  
  const moment = await createRes.json();
  console.log('Moment created:', moment);
  
  // Get progress
  console.log('\nGetting progress...');
  const progressRes = await fetch('http://localhost:3000/moments/progress', {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
  });
  
  console.log('Status:', progressRes.status);
  const progress = await progressRes.json();
  console.log('Progress:', progress);
}

test();


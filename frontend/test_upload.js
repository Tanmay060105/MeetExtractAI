const fs = require('fs');

async function testMeetingUpload() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = "securepassword123";
  
  // 1. Register
  console.log("Registering user:", email);
  await fetch('http://localhost:8000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, full_name: "Test User", password })
  });

  // 2. Login
  const loginRes = await fetch('http://localhost:8000/api/v1/auth/login/access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  });
  const { access_token } = await loginRes.json();
  const authHeaders = { 'Authorization': `Bearer ${access_token}` };
  
  // 3. Upload text file
  const testFile = 'test_meeting.txt';
  fs.writeFileSync(testFile, 'This is a test meeting. John needs to review the PR by tomorrow.');
  
  console.log("Uploading meeting...");
  
  // Since fetch in Node 18+ doesn't natively support FormData with files from fs easily,
  // we can use standard Node fetch with FormData
  const formData = new FormData();
  formData.append('title', 'E2E Test Meeting');
  const fileBlob = new Blob([fs.readFileSync(testFile)], { type: 'text/plain' });
  formData.append('file', fileBlob, testFile);

  const uploadRes = await fetch('http://localhost:8000/api/v1/meetings/upload', {
    method: 'POST',
    headers: authHeaders,
    body: formData
  });

  if (!uploadRes.ok) {
    console.error("Upload failed", await uploadRes.text());
    process.exit(1);
  }
  
  const meeting = await uploadRes.json();
  console.log("Meeting created:", meeting.id, "Status:", meeting.processing_status);

  // 4. Poll until complete
  let currentStatus = meeting.processing_status;
  while (currentStatus !== 'COMPLETED' && currentStatus !== 'FAILED') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Polling status...");
    const statusRes = await fetch(`http://localhost:8000/api/v1/meetings/${meeting.id}`, {
      headers: authHeaders
    });
    const updatedMeeting = await statusRes.json();
    currentStatus = updatedMeeting.processing_status;
    console.log("Current status:", currentStatus);
  }

  if (currentStatus === 'FAILED') {
    console.error("Meeting processing failed");
    process.exit(1);
  }

  // 5. Fetch Transcript
  console.log("Fetching transcript...");
  const transRes = await fetch(`http://localhost:8000/api/v1/meetings/${meeting.id}/transcript`, {
    headers: authHeaders
  });
  if (!transRes.ok) throw new Error("Transcript fetch failed");
  const transcript = await transRes.json();
  console.log("Transcript fetched. Length:", transcript.raw_text.length);

  // 6. Fetch Action Items (New Endpoint!)
  console.log("Fetching action items...");
  const actionsRes = await fetch(`http://localhost:8000/api/v1/meetings/${meeting.id}/action-items`, {
    headers: authHeaders
  });
  
  if (!actionsRes.ok) {
    console.error("Action items fetch failed", await actionsRes.text());
    process.exit(1);
  }
  const actionItems = await actionsRes.json();
  console.log(`Action items fetched. Count: ${actionItems.length}`);
  if (actionItems.length > 0) {
    console.log("First item:", actionItems[0].task);
  }

  console.log("SUCCESS! E2E Meeting workflow verified.");
}

testMeetingUpload().catch(console.error);

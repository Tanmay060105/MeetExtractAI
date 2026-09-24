async function testRegistration() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = "securepassword123";
  
  console.log("Registering user:", email);
  
  const regRes = await fetch('http://localhost:8000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      full_name: "Test User",
      password: password
    })
  });
  
  if (!regRes.ok) {
    console.error("Registration failed", await regRes.text());
    process.exit(1);
  }
  
  const regData = await regRes.json();
  console.log("Registered:", regData.email);
  
  console.log("Testing login...");
  const loginRes = await fetch('http://localhost:8000/api/v1/auth/login/access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  });
  
  if (!loginRes.ok) {
    console.error("Login failed", await loginRes.text());
    process.exit(1);
  }
  
  const loginData = await loginRes.json();
  console.log("Login success! Token:", loginData.access_token.substring(0, 10) + "...");
}

testRegistration();

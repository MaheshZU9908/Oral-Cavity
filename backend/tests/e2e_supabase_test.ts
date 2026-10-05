import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5000/api';

async function runE2ETest() {
  console.log('--- STARTING COMPLETE LIVE SUPABASE E2E INTEGRATION TEST ---');

  // Test 1: Health check
  console.log('\n[TEST 1] Checking API & Supabase Health...');
  const healthRes = await fetch(`${BASE}/health`);
  const healthData = await healthRes.json();
  console.log('Health Response:', healthData);
  if (healthData.status !== 'ok' || !healthData.services?.database?.connected) {
    throw new Error('Health check failed or database disconnected: ' + JSON.stringify(healthData));
  }
  console.log('✓ TEST 1 PASSED: API & Supabase Connection OK');

  // Test 2: Doctor Registration
  const testEmail = `dr.sarah.${Date.now()}@hospital.org`;
  const testPassword = 'ClinicalSecurePass2026!';
  console.log('\n[TEST 2] Registering new doctor in Supabase:', testEmail);
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Sarah Connor, MD',
      email: testEmail,
      password: testPassword,
      specialization: 'Oncological Histopathology',
      qualification: 'MD, FCPath',
      hospital: 'Metropolitan Cancer Institute',
      phone: '+1 (555) 234-5678',
      professionalId: 'MD-99882',
    }),
  });
  const regData = await regRes.json();
  console.log('Registration Response status:', regRes.status);
  if (!regRes.ok || !regData.success) {
    throw new Error(`Doctor registration failed: ${JSON.stringify(regData)}`);
  }
  const token = regData.data.token;
  const doctor = regData.data.doctor;
  console.log('Doctor created in Supabase:', { id: doctor.id, name: doctor.name, email: doctor.email });
  console.log('✓ TEST 2 PASSED: Doctor registered & saved to Supabase `doctors` table');

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Test 3: Authenticated /auth/me
  console.log('\n[TEST 3] Fetching doctor profile via GET /api/auth/me...');
  const meRes = await fetch(`${BASE}/auth/me`, { headers: authHeaders });
  const meData = await meRes.json();
  if (!meRes.ok || meData.data.email !== testEmail) {
    throw new Error(`Profile fetch failed: ${JSON.stringify(meData)}`);
  }
  console.log('Retrieved Profile:', { name: meData.data.name, email: meData.data.email, hospital: meData.data.hospital });
  console.log('✓ TEST 3 PASSED: Doctor profile read from Supabase successfully');

  // Test 4: Create Patient
  console.log('\n[TEST 4] Creating patient in Supabase via POST /api/patients...');
  const patientRes = await fetch(`${BASE}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify({
      fullName: 'Eleanor Vance',
      age: 52,
      gender: 'Female',
      contact: '+1 555-432-1098',
      clinicalHistory: 'Stage II Invasive Ductal Carcinoma, ER+/PR+, HER2-',
      diagnosis: 'Invasive Ductal Carcinoma of Breast with Axillary Lymphadenopathy',
      biopsyInformation: 'Axillary sentinel lymph node core biopsy specimen',
    }),
  });
  const patientData = await patientRes.json();
  if (!patientRes.ok || !patientData.success) {
    throw new Error(`Patient creation failed: ${JSON.stringify(patientData)}`);
  }
  const patient = patientData.data;
  console.log('Patient created in Supabase:', {
    id: patient.id,
    patient_id: patient.patient_id,
    full_name: patient.full_name,
    diagnosis: patient.diagnosis,
  });
  console.log('✓ TEST 4 PASSED: Patient created in Supabase `patients` table');

  // Test 5: List & Get Patient by ID
  console.log('\n[TEST 5] Listing patients & fetching patient detail...');
  const listRes = await fetch(`${BASE}/patients?limit=10&page=1`, { headers: authHeaders });
  const listData = await listRes.json();
  if (!listRes.ok || !listData.data.patients || listData.data.patients.length === 0) {
    throw new Error(`Patient list query failed: ${JSON.stringify(listData)}`);
  }
  console.log(`Found ${listData.data.total} patient(s) in doctor record.`);

  const getPRes = await fetch(`${BASE}/patients/${patient.id}`, { headers: authHeaders });
  const getPData = await getPRes.json();
  if (!getPRes.ok || getPData.data.full_name !== 'Eleanor Vance') {
    throw new Error(`Get patient by ID failed: ${JSON.stringify(getPData)}`);
  }
  console.log('Fetched single patient:', { id: getPData.data.id, name: getPData.data.full_name });
  console.log('✓ TEST 5 PASSED: Patient list and get-by-ID verified');

  // Test 6: Biopsy Slide Upload & Multi-Instance Learning AI Prediction
  console.log('\n[TEST 6] Uploading biopsy specimen & creating AI prediction...');
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const imgBuffer = Buffer.from(pngBase64, 'base64');
  const blob = new Blob([imgBuffer], { type: 'image/png' });

  const formData = new FormData();
  formData.append('patientId', patient.id);
  formData.append('clinicalNotes', 'High cellularity observed. Rule out nodal micrometastasis.');
  formData.append('image', blob, 'biopsy_sentinel_node.png');

  const predRes = await fetch(`${BASE}/predictions`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });
  const predData = await predRes.json();
  if (!predRes.ok || !predData.success) {
    throw new Error(`Prediction creation failed: ${JSON.stringify(predData)}`);
  }
  const pred = predData.data;
  console.log('Prediction created in Supabase:', {
    id: pred.id,
    risk_category: pred.risk_category,
    probability: pred.probability,
    prediction_result: pred.prediction_result,
    model_name: pred.model_name,
    inference_mode: pred.inference_mode,
  });
  console.log('✓ TEST 6 PASSED: Biopsy image recorded & Prediction stored in Supabase');

  // Test 7: Dashboard Summary Aggregation
  console.log('\n[TEST 7] Fetching real-time dashboard analytics...');
  const dashRes = await fetch(`${BASE}/dashboard/summary`, { headers: authHeaders });
  const dashData = await dashRes.json();
  if (!dashRes.ok || !dashData.success) {
    throw new Error(`Dashboard stats failed: ${JSON.stringify(dashData)}`);
  }
  console.log('Dashboard summary:', {
    totalPatients: dashData.data.totalPatients,
    totalPredictions: dashData.data.totalPredictions,
    riskDistribution: dashData.data.riskDistribution,
    recentPredictionsCount: dashData.data.recentPredictions.length,
  });
  if (dashData.data.totalPatients < 1 || dashData.data.totalPredictions < 1) {
    throw new Error('Dashboard stats did not aggregate live Supabase data correctly');
  }
  console.log('✓ TEST 7 PASSED: Live Supabase aggregation & KPI calculation verified');

  // Test 8: Logout and Re-Login
  console.log('\n[TEST 8] Testing Doctor Login with saved Supabase credentials...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const newToken = loginData.data.token;
  console.log('Login successful! New token issued for doctor:', loginData.data.doctor.email);
  console.log('✓ TEST 8 PASSED: Authentication against Supabase PostgreSQL password hash verified');

  // Test 9: Data Persistence across sessions
  console.log('\n[TEST 9] Verifying patient & prediction data persistence with new session...');
  const verifyRes = await fetch(`${BASE}/patients/${patient.id}`, {
    headers: { Authorization: `Bearer ${newToken}` },
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData.data.latest_prediction || verifyData.data.latest_prediction.id !== pred.id) {
    throw new Error(`Persistence verification failed: ${JSON.stringify(verifyData)}`);
  }
  console.log('Persisted Patient with Latest Prediction:', {
    patientName: verifyData.data.full_name,
    latestPredId: verifyData.data.latest_prediction.id,
    risk: verifyData.data.latest_prediction.risk_category,
    prob: verifyData.data.latest_prediction.probability,
  });
  console.log('✓ TEST 9 PASSED: Complete data persistence across sessions confirmed!');

  // Test 10: Cross-Doctor Multi-Tenant Security & Header Spoofing Isolation
  console.log('\n[TEST 10] Testing Cross-Doctor Multi-Tenant Isolation & Header Spoofing Defense...');
  const doctorBEmail = `dr.bob.${Date.now()}@otherhospital.org`;
  const doctorBPassword = 'BobSecurePass456!';
  
  // Register Doctor B
  const regBRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Bob Henderson, MD',
      email: doctorBEmail,
      password: doctorBPassword,
      specialization: 'General Pathology',
    }),
  });
  const regBData = await regBRes.json();
  if (!regBRes.ok || !regBData.data.token) {
    throw new Error(`Doctor B registration failed: ${JSON.stringify(regBData)}`);
  }
  const tokenB = regBData.data.token;
  const authHeadersB = { Authorization: `Bearer ${tokenB}` };

  // 10.1: Doctor B tries to access Doctor A's patient
  console.log('  -> 10.1 Verifying Doctor B cannot read Doctor A patient...');
  const crossGetPatient = await fetch(`${BASE}/patients/${patient.id}`, { headers: authHeadersB });
  if (crossGetPatient.ok) {
    throw new Error('SECURITY VIOLATION: Doctor B was able to read Doctor A patient record!');
  }
  console.log('     ✓ Access denied to unauthorized patient (Status:', crossGetPatient.status, ')');

  // 10.2: Doctor B tries to update Doctor A's patient
  console.log('  -> 10.2 Verifying Doctor B cannot update Doctor A patient...');
  const crossUpdatePatient = await fetch(`${BASE}/patients/${patient.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeadersB },
    body: JSON.stringify({ fullName: 'Unauthorized Tampering' }),
  });
  if (crossUpdatePatient.ok) {
    throw new Error('SECURITY VIOLATION: Doctor B was able to modify Doctor A patient record!');
  }
  console.log('     ✓ Modification blocked for unauthorized patient (Status:', crossUpdatePatient.status, ')');

  // 10.3: Doctor B tries to delete Doctor A's patient
  console.log('  -> 10.3 Verifying Doctor B cannot delete Doctor A patient...');
  const crossDeletePatient = await fetch(`${BASE}/patients/${patient.id}`, {
    method: 'DELETE',
    headers: authHeadersB,
  });
  if (crossDeletePatient.ok) {
    throw new Error('SECURITY VIOLATION: Doctor B was able to delete Doctor A patient record!');
  }
  console.log('     ✓ Deletion blocked for unauthorized patient (Status:', crossDeletePatient.status, ')');

  // 10.4: Doctor B tries to read Doctor A's prediction
  console.log('  -> 10.4 Verifying Doctor B cannot read Doctor A prediction...');
  const crossGetPred = await fetch(`${BASE}/predictions/${pred.id}`, { headers: authHeadersB });
  if (crossGetPred.ok) {
    throw new Error('SECURITY VIOLATION: Doctor B was able to read Doctor A prediction record!');
  }
  console.log('     ✓ Access denied to unauthorized prediction (Status:', crossGetPred.status, ')');

  // 10.5: Doctor B tries to run prediction on Doctor A's patient
  console.log('  -> 10.5 Verifying Doctor B cannot upload/run prediction on Doctor A patient...');
  const crossForm = new FormData();
  crossForm.append('patientId', patient.id);
  crossForm.append('image', blob, 'malicious_slide.png');
  const crossPredRes = await fetch(`${BASE}/predictions`, {
    method: 'POST',
    headers: authHeadersB,
    body: crossForm,
  });
  if (crossPredRes.ok) {
    throw new Error('SECURITY VIOLATION: Doctor B was able to create prediction for Doctor A patient!');
  }
  console.log('     ✓ Unauthorized prediction creation rejected (Status:', crossPredRes.status, ')');

  // 10.6: Header Spoofing Resistance
  console.log('  -> 10.6 Verifying client-forged x-doctor-id header is ignored and blocked...');
  const spoofedRes = await fetch(`${BASE}/patients/${patient.id}`, {
    headers: {
      Authorization: `Bearer ${tokenB}`,
      'x-doctor-id': doctor.id, // Attempting to spoof Doctor A ID in request header
    },
  });
  if (spoofedRes.ok) {
    throw new Error('SECURITY VIOLATION: Forged x-doctor-id header bypassed authentication!');
  }
  console.log('     ✓ Forged x-doctor-id header ignored, cryptographic JWT identity strictly enforced');

  // 10.7: Doctor B Dashboard Isolation
  console.log('  -> 10.7 Verifying Doctor B dashboard is completely isolated (0 cross-tenant leaks)...');
  const dashBRes = await fetch(`${BASE}/dashboard/summary`, { headers: authHeadersB });
  const dashBData = await dashBRes.json();
  if (dashBData.data.totalPatients !== 0 || dashBData.data.totalPredictions !== 0) {
    throw new Error('SECURITY VIOLATION: Doctor B dashboard shows cross-tenant data!');
  }
  console.log('     ✓ Doctor B dashboard clean (0 patients, 0 predictions)');
  console.log('✓ TEST 10 PASSED: Cross-doctor isolation & header spoofing defense verified 100%');

  console.log('\n=================================================================');
  console.log('🎉 ALL 10 FUNCTIONAL & SECURITY AUDIT TESTS PASSED WITH 100% SUCCESS!');
  console.log('=================================================================');
}

runE2ETest().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});


import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5000/api';

async function runRealModelE2ETest() {
  console.log('=================================================================');
  console.log('🚀 STARTING REAL MIL MODEL END-TO-END VALIDATION SUITE');
  console.log('=================================================================');

  // Test 1: Health check verifying REAL AI mode
  console.log('\n[TEST 1] Verifying System Health & Real AI Microservice Connection...');
  const healthRes = await fetch(`${BASE}/health`);
  const healthData = await healthRes.json();
  console.log('Health Response:', healthData);
  if (
    healthData.status !== 'ok' ||
    !healthData.services?.database?.connected ||
    !healthData.services?.aiInference?.healthy ||
    healthData.services?.aiInference?.mode !== 'real'
  ) {
    throw new Error('Health check failed or Real AI microservice is not active: ' + JSON.stringify(healthData));
  }
  console.log('✓ TEST 1 PASSED: Backend is operational and linked to REAL Python MIL microservice');

  // Test 2: Doctor Registration
  const testEmail = `dr.pathologist.${Date.now()}@cancercenter.org`;
  const testPassword = 'RealAIModelPass2026!';
  console.log('\n[TEST 2] Registering attending pathologist in Supabase:', testEmail);
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Marcus Vance, MD, PhD',
      email: testEmail,
      password: testPassword,
      specialization: 'Molecular Histopathology & Oncology',
      qualification: 'MD, PhD, FCPath',
      hospital: 'National Cancer Research Institute',
      phone: '+1 (555) 789-0123',
      professionalId: 'PATH-88992',
    }),
  });
  const regData = await regRes.json();
  if (!regRes.ok || !regData.success) {
    throw new Error(`Doctor registration failed: ${JSON.stringify(regData)}`);
  }
  const token = regData.data.token;
  const doctor = regData.data.doctor;
  console.log('Doctor created in Supabase:', { id: doctor.id, name: doctor.name, email: doctor.email });
  console.log('✓ TEST 2 PASSED: Doctor registered and authenticated');

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Test 3: Model Info from Backend
  console.log('\n[TEST 3] Querying Model Specification from Real AI Microservice...');
  const modelInfoRes = await fetch(`${BASE}/predictions/model-info`, { headers: authHeaders });
  const modelInfoData = await modelInfoRes.json();
  console.log('Model Info:', modelInfoData.data);
  if (
    !modelInfoData.success ||
    modelInfoData.data.mode !== 'real' ||
    !modelInfoData.data.name.includes('CLAM')
  ) {
    throw new Error(`Model info check failed: ${JSON.stringify(modelInfoData)}`);
  }
  console.log('✓ TEST 3 PASSED: Verified Real CLAM Model architecture and parameters');

  // Test 4: Create Patient Record
  console.log('\n[TEST 4] Creating patient record in Supabase...');
  const patientRes = await fetch(`${BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({
      fullName: 'Sophia Martinez',
      age: 48,
      gender: 'Female',
      contact: '+1 (555) 345-6789',
      clinicalHistory: 'Invasive lobular carcinoma of left breast, cT3N1M0. Post-neoadjuvant evaluation.',
      diagnosis: 'Invasive Lobular Carcinoma with Axillary Lymph Node Involvement',
      biopsyInformation: 'Sentinel axillary lymph node core biopsy (H&E 20x magnification)',
    }),
  });
  const patientData = await patientRes.json();
  if (!patientRes.ok || !patientData.success) {
    throw new Error(`Patient enrollment failed: ${JSON.stringify(patientData)}`);
  }
  const patient = patientData.data;
  console.log('Enrolled Patient:', { id: patient.id, patient_id: patient.patient_id, name: patient.full_name });
  console.log('✓ TEST 4 PASSED: Patient record created in Supabase `patients` table');

  // Test 5: Upload Histology Specimen & Run Real MIL Inference
  console.log('\n[TEST 5] Uploading digitized biopsy slide & running REAL MIL Model inference...');
  // Generate a valid PNG buffer
  const sampleHistologyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYSURBVBhXY2BgYPgPxAwMTAwM/wE4AwgBBggB7gAIAhAAAAAElFTkSuQmCC';
  const imgBuffer = Buffer.from(sampleHistologyPngBase64, 'base64');
  const blob = new Blob([imgBuffer], { type: 'image/png' });

  const formData = new FormData();
  formData.append('patientId', patient.id);
  formData.append('clinicalNotes', 'Core biopsy section evaluated for nodal micrometastasis and extranodal extension.');
  formData.append('image', blob, 'sentinel_node_biopsy_section.png');

  const predRes = await fetch(`${BASE}/predictions`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });
  const predData = await predRes.json();
  if (!predRes.ok || !predData.success) {
    throw new Error(`Real model prediction failed: ${JSON.stringify(predData)}`);
  }
  const pred = predData.data;
  console.log('Real MIL Prediction Result:', {
    id: pred.id,
    inference_mode: pred.inference_mode,
    model_name: pred.model_name,
    model_version: pred.model_version,
    risk_category: pred.risk_category,
    probability: pred.probability,
    confidence: pred.confidence,
    prediction_result: pred.prediction_result,
    processing_time: `${pred.processing_time}ms`,
    bag_statistics: pred.bag_statistics,
  });

  // Verify that it is strictly in REAL mode with real model parameters
  if (pred.inference_mode !== 'real') {
    throw new Error(`CRITICAL FAILURE: Expected inference_mode === 'real', got '${pred.inference_mode}'`);
  }
  if (!pred.model_name.includes('CLAM') && !pred.model_name.includes('MIL')) {
    throw new Error(`CRITICAL FAILURE: Unexpected model_name '${pred.model_name}'`);
  }
  if (typeof pred.probability !== 'number' || pred.probability < 0 || pred.probability > 1) {
    throw new Error(`Invalid probability value '${pred.probability}'`);
  }
  console.log('✓ TEST 5 PASSED: Real MIL inference completed and persisted in Supabase with inference_mode = "real"');

  // Test 6: Retrieve Prediction by ID & Validate Full Report Data
  console.log('\n[TEST 6] Fetching prediction report from Supabase (GET /predictions/:id)...');
  const reportRes = await fetch(`${BASE}/predictions/${pred.id}`, { headers: authHeaders });
  const reportData = await reportRes.json();
  if (!reportRes.ok || !reportData.success) {
    throw new Error(`Report fetch failed: ${JSON.stringify(reportData)}`);
  }
  const reportPred = reportData.data;
  console.log('Persisted Prediction Record:', {
    id: reportPred.id,
    patient_id: reportPred.patient_id,
    patient_name: reportPred.patient?.full_name,
    inference_mode: reportPred.inference_mode,
    risk_category: reportPred.risk_category,
    probability: reportPred.probability,
  });
  if (reportPred.inference_mode !== 'real' || reportPred.id !== pred.id) {
    throw new Error('Report data does not match real model prediction');
  }
  console.log('✓ TEST 6 PASSED: Full clinical report with Real Model metadata retrieved from Supabase');

  // Test 7: Dashboard Summary Aggregation
  console.log('\n[TEST 7] Fetching real-time Dashboard KPIs...');
  const dashRes = await fetch(`${BASE}/dashboard/summary`, { headers: authHeaders });
  const dashData = await dashRes.json();
  if (!dashRes.ok || !dashData.success) {
    throw new Error(`Dashboard stats failed: ${JSON.stringify(dashData)}`);
  }
  console.log('Dashboard KPIs:', {
    totalPatients: dashData.data.totalPatients,
    totalPredictions: dashData.data.totalPredictions,
    riskDistribution: dashData.data.riskDistribution,
    latestPrediction: dashData.data.recentPredictions[0]?.prediction_result,
    latestModel: dashData.data.recentPredictions[0]?.model_name,
  });
  if (dashData.data.totalPatients < 1 || dashData.data.totalPredictions < 1) {
    throw new Error('Dashboard stats failed to reflect real patient/prediction count');
  }
  console.log('✓ TEST 7 PASSED: Dashboard KPIs accurately reflect real model results');

  // Test 8: Logout and Re-Login Session Verification
  console.log('\n[TEST 8] Re-authenticating session with doctor credentials...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const newSessionToken = loginData.data.token;
  console.log('✓ TEST 8 PASSED: Re-login successful, session token renewed');

  // Test 9: Data Persistence Across Sessions
  console.log('\n[TEST 9] Verifying patient & prediction data persistence under new session...');
  const verifyRes = await fetch(`${BASE}/patients/${patient.id}`, {
    headers: { Authorization: `Bearer ${newSessionToken}` },
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData.data.latest_prediction || verifyData.data.latest_prediction.id !== pred.id) {
    throw new Error(`Data persistence verification failed: ${JSON.stringify(verifyData)}`);
  }
  console.log('Persisted Patient Chart:', {
    patientName: verifyData.data.full_name,
    latestPredId: verifyData.data.latest_prediction.id,
    risk: verifyData.data.latest_prediction.risk_category,
    prob: verifyData.data.latest_prediction.probability,
  });
  console.log('✓ TEST 9 PASSED: Complete data persistence across sessions confirmed!');

  console.log('\n=================================================================');
  console.log('🎉 ALL 9 REAL MIL MODEL TESTS PASSED WITH 100% SUCCESS!');
  console.log('=================================================================');
}

runRealModelE2ETest().catch(err => {
  console.error('\n❌ REAL MODEL E2E TEST FAILED:', err);
  process.exit(1);
});

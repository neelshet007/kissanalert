const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function runTest() {
  const baseURL = 'http://localhost:5000';
  console.log('Testing Kisan Alert backend AI services...');

  try {
    // 1. Authenticate
    console.log('Authenticating...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'farmer@kisanalert.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('Authenticated! Token retrieved.');

    // 2. Fetch Farms
    console.log('Fetching farms...');
    const farmsResponse = await axios.get(`${baseURL}/api/farms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const farm = farmsResponse.data[0];
    if (!farm) {
      throw new Error('No farms found in the database. Please seed the database first.');
    }
    console.log(`Using Farm: ${farm.name} (ID: ${farm.id})`);

    // 3. Test Crop Recommendation
    console.log('Testing Crop Recommendation (POST /api/farms/:id/soil-report)...');
    const recommendationResponse = await axios.post(`${baseURL}/api/farms/${farm.id}/soil-report`, {
      season: 'Kharif',
      ph: 6.5,
      nitrogen: 120,
      phosphorus: 35,
      potassium: 220,
      organicCarbon: 0.6
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Crop Recommendation success:', JSON.stringify(recommendationResponse.data, null, 2));

    // 4. Test Voice Assistant
    console.log('Testing Voice Query (POST /api/voice/query)...');
    const voiceResponse = await axios.post(`${baseURL}/api/voice/query`, {
      farmId: farm.id,
      transcription: 'How to treat leaf yellowing in cotton?',
      language: 'en'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Voice Query success:', JSON.stringify(voiceResponse.data, null, 2));

    // 5. Test Disease Detection with a mock JPEG image
    console.log('Testing Disease Detection (POST /api/diseases/detect)...');
    // Create a tiny valid 1x1 pixel JPEG base64 string
    const tinyJpegBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    const imageBuffer = Buffer.from(tinyJpegBase64, 'base64');

    const form = new FormData();
    form.append('farmId', farm.id);
    form.append('image', imageBuffer, {
      filename: 'leaf.jpg',
      contentType: 'image/jpeg'
    });

    const diseaseResponse = await axios.post(`${baseURL}/api/diseases/detect`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Disease Detection success:', JSON.stringify(diseaseResponse.data, null, 2));

    console.log('🎉 ALL AI ENDPOINT TESTS COMPLETED SUCCESSFULLY!');
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Test failed:', error.message);
    }
  }
}

runTest();

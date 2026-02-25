import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, headers, checkResponse, generateRandomProperty, getRandomPropertyId } from './helpers.js';

// Stress test configuration with more aggressive thresholds
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users over 2 minutes
    { duration: '2m', target: 100 },  // Ramp up to 100 users over 2 minutes
    { duration: '2m', target: 200 },  // Ramp up to 200 users over 2 minutes
    { duration: '2m', target: 50 },   // Ramp down to 50 users over 2 minutes
    { duration: '1m', target: 0 },    // Ramp down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // Allow higher response times under stress
    http_req_failed: ['rate<0.05'],   // Allow up to 5% error rate under stress
    checks: ['rate>0.95'],            // 95% of checks must pass under stress
  },
};

export default function () {
  // More aggressive testing scenarios under stress
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    // 30% - Heavy API usage
    heavyApiScenario();
  } else if (scenario < 0.6) {
    // 30% - Rapid property creation
    rapidPropertyCreationScenario();
  } else {
    // 40% - Mixed browsing with shorter delays
    stressBrowsingScenario();
  }
}

function heavyApiScenario() {
  // Rapid API calls to stress the backend
  for (let i = 0; i < 3; i++) {
    let response = http.get(`${BASE_URL}/api/properties`, { headers });
    checkResponse(response);
    
    sleep(0.5);

    const propertyId = getRandomPropertyId();
    response = http.get(`${BASE_URL}/api/properties/${propertyId}`, { headers });
    checkResponse(response);
    
    sleep(0.5);
  }
}

function rapidPropertyCreationScenario() {
  // Create multiple properties in quick succession
  for (let i = 0; i < 2; i++) {
    const newProperty = generateRandomProperty();
    let response = http.post(`${BASE_URL}/api/properties`, JSON.stringify(newProperty), { headers });
    checkResponse(response, 201);
    
    sleep(1);

    if (response.status === 201) {
      const createdProperty = JSON.parse(response.body);
      
      // Immediately check the created property
      response = http.get(`${BASE_URL}/api/properties/${createdProperty.id}`, { headers });
      checkResponse(response);
    }
    
    sleep(0.5);
  }
}

function stressBrowsingScenario() {
  // Rapid page navigation
  let response = http.get(`${BASE_URL}/`);
  checkResponse(response);
  
  sleep(0.5);

  response = http.get(`${BASE_URL}/ssd-calculator`);
  checkResponse(response);
  
  sleep(0.5);

  response = http.get(`${BASE_URL}/add-property`);
  checkResponse(response);
  
  sleep(0.5);

  // Quick property lookups
  for (let i = 0; i < 2; i++) {
    const propertyId = getRandomPropertyId();
    response = http.get(`${BASE_URL}/property/${propertyId}`);
    checkResponse(response);
    
    sleep(0.5);
  }
}
import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, headers, checkResponse, generateRandomProperty, getRandomPropertyId } from './helpers.js';

// Spike test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Normal load: 10 users for 1 minute
    { duration: '30s', target: 200 }, // Spike: jump to 200 users for 30 seconds
    { duration: '1m', target: 10 },   // Recovery: back to 10 users for 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Allow higher response times during spike
    http_req_failed: ['rate<0.1'],     // Allow up to 10% error rate during spike
    checks: ['rate>0.9'],              // 90% of checks must pass
  },
};

export default function () {
  // Test system behavior during sudden load spikes
  const currentVUs = __VU;
  
  // Different behavior based on whether we're in the spike phase
  if (currentVUs <= 10) {
    // Normal load behavior
    normalUserScenario();
  } else {
    // Spike load behavior - more aggressive
    spikeUserScenario();
  }
}

function normalUserScenario() {
  // Typical user behavior during normal load
  let response = http.get(`${BASE_URL}/`);
  checkResponse(response);
  
  sleep(3);

  response = http.get(`${BASE_URL}/api/properties`, { headers });
  checkResponse(response);
  
  sleep(2);

  const propertyId = getRandomPropertyId();
  response = http.get(`${BASE_URL}/property/${propertyId}`);
  checkResponse(response);
  
  sleep(4);

  // Occasionally create a property
  if (Math.random() < 0.2) {
    const newProperty = generateRandomProperty();
    response = http.post(`${BASE_URL}/api/properties`, JSON.stringify(newProperty), { headers });
    checkResponse(response, 201);
    
    sleep(2);
  }
}

function spikeUserScenario() {
  // Aggressive user behavior during spike
  // Simulates many users hitting the system simultaneously
  
  const scenario = Math.random();
  
  if (scenario < 0.4) {
    // 40% - Quick dashboard checks
    let response = http.get(`${BASE_URL}/`);
    checkResponse(response);
    
    sleep(0.5);

    response = http.get(`${BASE_URL}/api/properties`, { headers });
    checkResponse(response);
    
    sleep(1);
    
  } else if (scenario < 0.7) {
    // 30% - Rapid property viewing
    const propertyId = getRandomPropertyId();
    let response = http.get(`${BASE_URL}/property/${propertyId}`);
    checkResponse(response);
    
    sleep(0.5);

    response = http.get(`${BASE_URL}/api/properties/${propertyId}`, { headers });
    checkResponse(response);
    
    sleep(1);
    
  } else {
    // 30% - SSD calculator usage (CPU intensive)
    let response = http.get(`${BASE_URL}/ssd-calculator`);
    checkResponse(response);
    
    sleep(1);

    // Quick property check after calculation
    response = http.get(`${BASE_URL}/api/properties`, { headers });
    checkResponse(response);
    
    sleep(0.5);
  }
}
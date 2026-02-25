import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, headers, thresholds, checkResponse, generateRandomProperty, getRandomPropertyId } from './helpers.js';

// Load test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 },  // Hold 50 users for 3 minutes
    { duration: '1m', target: 0 },   // Ramp down over 1 minute
  ],
  thresholds,
};

export default function () {
  // Simulate realistic user behavior with weighted scenarios
  const scenario = Math.random();
  
  if (scenario < 0.4) {
    // 40% - Browse properties scenario
    browsePropertiesScenario();
  } else if (scenario < 0.7) {
    // 30% - View property details scenario
    viewPropertyDetailsScenario();
  } else if (scenario < 0.85) {
    // 15% - Use SSD calculator scenario
    ssdCalculatorScenario();
  } else {
    // 15% - Add new property scenario
    addPropertyScenario();
  }
}

function browsePropertiesScenario() {
  // User visits dashboard and browses properties
  let response = http.get(`${BASE_URL}/`);
  checkResponse(response);
  
  sleep(2);

  // Get properties list via API
  response = http.get(`${BASE_URL}/api/properties`, { headers });
  checkResponse(response);
  
  sleep(3);

  // Visit add property page (browsing)
  response = http.get(`${BASE_URL}/add-property`);
  checkResponse(response);
  
  sleep(2);
}

function viewPropertyDetailsScenario() {
  // User views specific property details
  const propertyId = getRandomPropertyId();
  
  // View property detail page
  let response = http.get(`${BASE_URL}/property/${propertyId}`);
  checkResponse(response);
  
  sleep(2);

  // Get property details via API
  response = http.get(`${BASE_URL}/api/properties/${propertyId}`, { headers });
  checkResponse(response);
  
  sleep(4);

  // Go back to dashboard
  response = http.get(`${BASE_URL}/`);
  checkResponse(response);
  
  sleep(1);
}

function ssdCalculatorScenario() {
  // User uses the SSD calculator
  let response = http.get(`${BASE_URL}/ssd-calculator`);
  checkResponse(response);
  
  sleep(3);

  // User might check some properties after using calculator
  response = http.get(`${BASE_URL}/api/properties`, { headers });
  checkResponse(response);
  
  sleep(2);
}

function addPropertyScenario() {
  // User adds a new property
  let response = http.get(`${BASE_URL}/add-property`);
  checkResponse(response);
  
  sleep(5); // User fills form

  // Submit new property
  const newProperty = generateRandomProperty();
  response = http.post(`${BASE_URL}/api/properties`, JSON.stringify(newProperty), { headers });
  checkResponse(response, 201);
  
  sleep(2);

  if (response.status === 201) {
    const createdProperty = JSON.parse(response.body);
    
    // User views the newly created property
    response = http.get(`${BASE_URL}/property/${createdProperty.id}`);
    checkResponse(response);
    
    sleep(3);
  }

  // Go back to dashboard to see the updated list
  response = http.get(`${BASE_URL}/`);
  checkResponse(response);
  
  sleep(1);
}
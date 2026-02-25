import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, headers, thresholds, checkResponse, generateRandomProperty, getRandomPropertyId } from './helpers.js';

// Smoke test configuration
export const options = {
  vus: 1,           // 1 virtual user
  duration: '30s',  // run for 30 seconds
  thresholds,
};

export default function () {
  // Test homepage
  let response = http.get(`${BASE_URL}/`);
  checkResponse(response);
  
  sleep(1);

  // Test SSD calculator page
  response = http.get(`${BASE_URL}/ssd-calculator`);
  checkResponse(response);
  
  sleep(1);

  // Test add property page
  response = http.get(`${BASE_URL}/add-property`);
  checkResponse(response);
  
  sleep(1);

  // Test API endpoints
  
  // Get all properties
  response = http.get(`${BASE_URL}/api/properties`, { headers });
  checkResponse(response);
  
  sleep(1);

  // Create a new property
  const newProperty = generateRandomProperty();
  response = http.post(`${BASE_URL}/api/properties`, JSON.stringify(newProperty), { headers });
  checkResponse(response, 201);
  
  let propertyId;
  if (response.status === 201) {
    const createdProperty = JSON.parse(response.body);
    propertyId = createdProperty.id;
  } else {
    propertyId = getRandomPropertyId(); // fallback to existing property
  }
  
  sleep(1);

  // Get specific property details
  response = http.get(`${BASE_URL}/api/properties/${propertyId}`, { headers });
  checkResponse(response);
  
  sleep(1);

  // Test property detail page
  response = http.get(`${BASE_URL}/property/${propertyId}`);
  checkResponse(response);

  sleep(2);
}
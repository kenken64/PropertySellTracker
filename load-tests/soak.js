import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, headers, thresholds, checkResponse, generateRandomProperty, getRandomPropertyId } from './helpers.js';

// Soak test configuration - endurance testing
export const options = {
  vus: 50,            // 50 constant users
  duration: '10m',    // run for 10 minutes
  thresholds: {
    ...thresholds,
    // Additional thresholds to detect degradation over time
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    // Memory leak indicators (response time should not increase over time)
    'http_req_duration{name:homepage}': ['p(95)<600'],
    'http_req_duration{name:api_properties}': ['p(95)<400'],
  },
};

export default function () {
  // Realistic long-running user scenarios
  const scenario = Math.random();
  
  if (scenario < 0.35) {
    // 35% - Regular property management workflow
    propertyManagementWorkflow();
  } else if (scenario < 0.6) {
    // 25% - Property research workflow
    propertyResearchWorkflow();
  } else if (scenario < 0.8) {
    // 20% - SSD calculation workflow
    ssdCalculationWorkflow();
  } else {
    // 20% - Administrative workflow
    administrativeWorkflow();
  }
}

function propertyManagementWorkflow() {
  // User managing their property portfolio
  
  // Check dashboard
  let response = http.get(`${BASE_URL}/`, { tags: { name: 'homepage' } });
  checkResponse(response);
  
  sleep(3);

  // Get all properties
  response = http.get(`${BASE_URL}/api/properties`, { 
    headers, 
    tags: { name: 'api_properties' } 
  });
  checkResponse(response);
  
  sleep(2);

  // View 2-3 property details
  for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
    const propertyId = getRandomPropertyId();
    
    response = http.get(`${BASE_URL}/property/${propertyId}`, {
      tags: { name: 'property_detail' }
    });
    checkResponse(response);
    
    sleep(1);

    response = http.get(`${BASE_URL}/api/properties/${propertyId}`, {
      headers,
      tags: { name: 'api_property_detail' }
    });
    checkResponse(response);
    
    sleep(4); // User reads property details
  }

  // Occasionally add a new property (10% chance)
  if (Math.random() < 0.1) {
    response = http.get(`${BASE_URL}/add-property`);
    checkResponse(response);
    
    sleep(8); // User fills form

    const newProperty = generateRandomProperty();
    response = http.post(`${BASE_URL}/api/properties`, JSON.stringify(newProperty), { 
      headers,
      tags: { name: 'create_property' }
    });
    checkResponse(response, 201);
    
    sleep(2);
  }

  sleep(5); // User thinks/plans
}

function propertyResearchWorkflow() {
  // User researching properties
  
  // Start at dashboard
  let response = http.get(`${BASE_URL}/`, { tags: { name: 'homepage' } });
  checkResponse(response);
  
  sleep(2);

  // Browse properties list multiple times
  for (let i = 0; i < 3; i++) {
    response = http.get(`${BASE_URL}/api/properties`, { 
      headers,
      tags: { name: 'api_properties' } 
    });
    checkResponse(response);
    
    sleep(3);

    // View random properties
    const propertyId = getRandomPropertyId();
    response = http.get(`${BASE_URL}/property/${propertyId}`, {
      tags: { name: 'property_detail' }
    });
    checkResponse(response);
    
    sleep(6); // User analyzes property data
  }

  // Use SSD calculator
  response = http.get(`${BASE_URL}/ssd-calculator`, {
    tags: { name: 'ssd_calculator' }
  });
  checkResponse(response);
  
  sleep(4);

  sleep(3); // User compares options
}

function ssdCalculationWorkflow() {
  // User focused on SSD calculations
  
  // Go to SSD calculator
  let response = http.get(`${BASE_URL}/ssd-calculator`, {
    tags: { name: 'ssd_calculator' }
  });
  checkResponse(response);
  
  sleep(5); // User enters data and calculates

  // Check some properties for reference
  response = http.get(`${BASE_URL}/api/properties`, { 
    headers,
    tags: { name: 'api_properties' } 
  });
  checkResponse(response);
  
  sleep(3);

  // View a few properties for comparison
  for (let i = 0; i < 2; i++) {
    const propertyId = getRandomPropertyId();
    response = http.get(`${BASE_URL}/property/${propertyId}`, {
      tags: { name: 'property_detail' }
    });
    checkResponse(response);
    
    sleep(4);
  }

  sleep(6); // User calculates and compares
}

function administrativeWorkflow() {
  // User doing administrative tasks
  
  // Dashboard overview
  let response = http.get(`${BASE_URL}/`, { tags: { name: 'homepage' } });
  checkResponse(response);
  
  sleep(2);

  // Get full property list
  response = http.get(`${BASE_URL}/api/properties`, { 
    headers,
    tags: { name: 'api_properties' } 
  });
  checkResponse(response);
  
  sleep(4);

  // Review multiple properties systematically
  for (let i = 1; i <= 5; i++) {
    response = http.get(`${BASE_URL}/api/properties/${i}`, {
      headers,
      tags: { name: 'api_property_detail' }
    });
    
    // Handle 404s gracefully for non-existent properties
    if (response.status === 404) {
      continue;
    }
    
    checkResponse(response);
    sleep(2);
  }

  sleep(8); // User reviews and makes notes
}
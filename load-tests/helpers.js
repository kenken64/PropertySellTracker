import { check } from 'k6';

// Base configuration
export const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:3000';

// Common headers
export const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Common thresholds
export const thresholds = {
  http_req_duration: ['p(95)<500'], // 95% of requests must be below 500ms
  http_req_failed: ['rate<0.01'],   // Error rate must be below 1%
  checks: ['rate>0.99'],            // 99% of checks must pass
};

// Singapore property types
const propertyTypes = ['HDB', 'Condo', 'Landed', 'Commercial'];

// Singapore addresses (realistic examples)
const singaporeAddresses = [
  '123 Toa Payoh North #12-345',
  '456 Jurong West Street 41 #05-678',
  '789 Tampines Avenue 4 #08-901',
  '321 Bedok Reservoir Road #03-234',
  '654 Ang Mo Kio Avenue 8 #15-567',
  '987 Clementi Avenue 2 #07-890',
  '147 Hougang Avenue 1 #11-123',
  '258 Punggol Way #04-456',
  '369 Sengkang East Way #09-789',
  '741 Woodlands Ring Road #06-012',
  'Marina Bay Financial Centre Tower 1',
  'The Pinnacle@Duxton Block 1A',
  'Sky Habitat @ Bishan Block A',
  'Tree House Condominium Block 3',
  'Reflections at Keppel Bay Tower 2'
];

// Property names
const propertyNames = [
  'Sunny Villa',
  'Garden Heights',
  'Marina View',
  'Sunset Terrace',
  'Golden Square',
  'Pearl Garden',
  'Jade Palace',
  'Crystal Bay',
  'Diamond Heights',
  'Emerald Park',
  'Sapphire Towers',
  'Ruby Residence',
  'Opal Gardens',
  'Platinum Plaza'
];

// Generate random property data with realistic Singapore values
export function generateRandomProperty() {
  const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
  
  // Realistic price ranges based on property type (in SGD)
  let minPrice, maxPrice;
  switch (type) {
    case 'HDB':
      minPrice = 300000;
      maxPrice = 800000;
      break;
    case 'Condo':
      minPrice = 800000;
      maxPrice = 3000000;
      break;
    case 'Landed':
      minPrice = 1500000;
      maxPrice = 8000000;
      break;
    case 'Commercial':
      minPrice = 500000;
      maxPrice = 5000000;
      break;
  }
  
  const purchasePrice = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
  const currentValue = Math.floor(purchasePrice * (0.9 + Math.random() * 0.4)); // ±20% variation
  
  // Generate realistic dates (purchased in the last 5 years)
  const purchaseDate = new Date();
  purchaseDate.setFullYear(purchaseDate.getFullYear() - Math.floor(Math.random() * 5));
  
  return {
    name: propertyNames[Math.floor(Math.random() * propertyNames.length)],
    address: singaporeAddresses[Math.floor(Math.random() * singaporeAddresses.length)],
    type: type,
    purchase_price: purchasePrice,
    purchase_date: purchaseDate.toISOString().split('T')[0],
    renovation_cost: Math.floor(purchasePrice * (Math.random() * 0.1)), // 0-10% of purchase price
    agent_fees: Math.floor(purchasePrice * 0.02), // ~2% agent fees
    current_value: currentValue,
    cpf_amount: type === 'HDB' ? Math.floor(purchasePrice * (0.2 + Math.random() * 0.6)) : Math.floor(purchasePrice * Math.random() * 0.4), // HDB: 20-80%, others: 0-40%
    mortgage_amount: Math.floor(purchasePrice * (0.6 + Math.random() * 0.3)), // 60-90% mortgage
    mortgage_interest_rate: 2.5 + Math.random() * 3, // 2.5% - 5.5%
    mortgage_tenure: 20 + Math.floor(Math.random() * 15) // 20-35 years
  };
}

// Standard response checks
export function checkResponse(response, expectedStatus = 200, checkContent = true) {
  const result = check(response, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  if (checkContent && expectedStatus === 200) {
    check(response, {
      'response has content': (r) => r.body.length > 0,
      'response is valid JSON': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      }
    });
  }
  
  return result;
}

// Get random property ID from the list (for testing detail endpoints)
export function getRandomPropertyId() {
  // For tests, we'll use IDs 1-10 assuming they exist from seeding
  return Math.floor(Math.random() * 10) + 1;
}
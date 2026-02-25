const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const db = new Database(path.join(process.cwd(), 'property-tracker.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('🌱 Seeding database with sample data...');

// Clear existing data
console.log('Clearing existing data...');
db.exec(`
  DELETE FROM transactions;
  DELETE FROM properties;
  DELETE FROM settings;
`);

// Helper function to calculate BSD
function calculateBSD(propertyPrice) {
  let bsd = 0;
  
  if (propertyPrice <= 180000) {
    bsd = propertyPrice * 0.01;
  } else if (propertyPrice <= 360000) {
    bsd = 180000 * 0.01 + (propertyPrice - 180000) * 0.02;
  } else if (propertyPrice <= 1000000) {
    bsd = 180000 * 0.01 + 180000 * 0.02 + (propertyPrice - 360000) * 0.03;
  } else {
    bsd = 180000 * 0.01 + 180000 * 0.02 + 640000 * 0.03 + (propertyPrice - 1000000) * 0.04;
  }
  
  return bsd;
}

// Sample properties data
const properties = [
  {
    name: "Toa Payoh HDB 4-Room",
    address: "Block 123, Toa Payoh Lorong 1, #08-456, Singapore 310123",
    type: "HDB",
    purchase_price: 450000,
    purchase_date: "2022-06-15",
    renovation_cost: 25000,
    agent_fees: 9000,
    current_value: 480000,
    cpf_amount: 150000,
    mortgage_amount: 360000,
    mortgage_interest_rate: 2.75,
    mortgage_tenure: 25
  },
  {
    name: "Clementi Condominium",
    address: "The Clementview, 88 Clementi Road, #15-02, Singapore 129791",
    type: "Condo",
    purchase_price: 1200000,
    purchase_date: "2021-03-20",
    renovation_cost: 80000,
    agent_fees: 24000,
    current_value: 1350000,
    cpf_amount: 200000,
    mortgage_amount: 960000,
    mortgage_interest_rate: 2.6,
    mortgage_tenure: 30
  },
  {
    name: "Punggol BTO 5-Room",
    address: "Waterway Ridges, Block 308A, Punggol Walk, #12-234, Singapore 828308",
    type: "HDB",
    purchase_price: 520000,
    purchase_date: "2023-01-10",
    renovation_cost: 35000,
    agent_fees: 10400,
    current_value: 550000,
    cpf_amount: 180000,
    mortgage_amount: 416000,
    mortgage_interest_rate: 2.8,
    mortgage_tenure: 25
  },
  {
    name: "Bukit Timah Landed Property",
    address: "12 Bukit Timah Road, Singapore 259584",
    type: "Landed",
    purchase_price: 2800000,
    purchase_date: "2020-11-05",
    renovation_cost: 150000,
    agent_fees: 56000,
    current_value: 3200000,
    cpf_amount: 0,
    mortgage_amount: 2240000,
    mortgage_interest_rate: 2.5,
    mortgage_tenure: 30
  },
  {
    name: "Jurong West HDB 3-Room",
    address: "Block 456, Jurong West Street 42, #06-789, Singapore 640456",
    type: "HDB",
    purchase_price: 380000,
    purchase_date: "2023-08-30",
    renovation_cost: 18000,
    agent_fees: 7600,
    current_value: 390000,
    cpf_amount: 120000,
    mortgage_amount: 304000,
    mortgage_interest_rate: 2.9,
    mortgage_tenure: 25
  }
];

console.log('Inserting properties...');

// Prepare statements
const insertProperty = db.prepare(`
  INSERT INTO properties (
    name, address, type, purchase_price, purchase_date,
    stamp_duty, renovation_cost, agent_fees, current_value,
    cpf_amount, mortgage_amount, mortgage_interest_rate, mortgage_tenure
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertTransaction = db.prepare(`
  INSERT INTO transactions (property_id, type, amount, description, date)
  VALUES (?, ?, ?, ?, ?)
`);

// Insert properties and transactions
properties.forEach((property, index) => {
  const stampDuty = calculateBSD(property.purchase_price);
  
  // Insert property
  const result = insertProperty.run(
    property.name,
    property.address,
    property.type,
    property.purchase_price,
    property.purchase_date,
    stampDuty,
    property.renovation_cost,
    property.agent_fees,
    property.current_value,
    property.cpf_amount,
    property.mortgage_amount,
    property.mortgage_interest_rate,
    property.mortgage_tenure
  );
  
  const propertyId = result.lastInsertRowid;
  
  // Insert purchase transaction
  insertTransaction.run(
    propertyId,
    'purchase',
    property.purchase_price,
    'Initial property purchase',
    property.purchase_date
  );
  
  // Insert renovation transaction if applicable
  if (property.renovation_cost > 0) {
    const renovationDate = new Date(property.purchase_date);
    renovationDate.setMonth(renovationDate.getMonth() + 2); // 2 months after purchase
    
    insertTransaction.run(
      propertyId,
      'expense',
      property.renovation_cost,
      'Property renovation costs',
      renovationDate.toISOString().split('T')[0]
    );
  }
  
  console.log(`✅ Added property: ${property.name}`);
});

// Insert some settings
console.log('Inserting settings...');
const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');

const settings = [
  ['app_version', '1.0.0'],
  ['default_agent_fee_rate', '0.02'],
  ['default_annual_appreciation', '0.03'],
  ['cpf_interest_rate', '0.025']
];

settings.forEach(([key, value]) => {
  insertSetting.run(key, value);
});

console.log('✅ Settings added');

// Add some additional sample transactions for demonstration
console.log('Adding sample transactions...');

// Add market value updates
const marketUpdateDates = [
  '2023-06-01',
  '2023-12-01',
  '2024-06-01',
  '2024-12-01'
];

// Get all property IDs
const allProperties = db.prepare('SELECT id, name FROM properties').all();

allProperties.forEach(property => {
  // Add a couple of market value updates
  marketUpdateDates.slice(0, 2).forEach((date, index) => {
    insertTransaction.run(
      property.id,
      'expense',
      500 + (index * 200), // Property tax or maintenance
      index === 0 ? 'Property tax payment' : 'Maintenance and repairs',
      date
    );
  });
});

console.log('✅ Sample transactions added');

// Show summary
const propertyCount = db.prepare('SELECT COUNT(*) as count FROM properties').get();
const transactionCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get();

console.log('\n🎉 Database seeding completed!');
console.log(`📊 Summary:`);
console.log(`   • ${propertyCount.count} properties added`);
console.log(`   • ${transactionCount.count} transactions added`);
console.log(`   • ${settings.length} settings configured`);
console.log('\nYou can now run `npm run dev` to start the application.');

// Close database connection
db.close();
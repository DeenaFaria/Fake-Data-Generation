const express = require('express');
const router = express.Router();
const { faker } = require('@faker-js/faker');

// Function to generate fake data
function generateFakeData(region, errorsPerRecord, seed) {
  faker.seed(seed);  // Set the seed for reproducibility
  
  const data = [];
  for (let i = 0; i < 20; i++) {
    const randomId = faker.string.uuid();
    const name = faker.person.fullName();  // Updated method
    const address = generateAddress(region);  // Generate region-specific address
    const phone = generatePhone(region);  // Generate region-specific phone number

    let record = {
      index: i + 1,
      randomId,
      name,
      address,
      phone
    };

    // Apply errors to the data
    if (errorsPerRecord > 0) {
      record = applyErrors(record, errorsPerRecord);
    }

    data.push(record);
  }

  return data;
}

// Function to generate addresses based on region
function generateAddress(region) {
  if (region === 'USA') {
    return `${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`;
  } else if (region === 'Poland') {
    return `${faker.location.city()}, ${faker.location.streetAddress()}, ${faker.location.zipCode('PL')}`;
  } else if (region === 'Georgia') {
    return `${faker.location.city()}, ${faker.location.streetAddress()}, ${faker.location.zipCode('GE')}`;
  } else {
    return `${faker.location.city()}, ${faker.location.streetAddress()}`;
  }
}

// Function to generate phone numbers based on region
function generatePhone(region) {
  if (region === 'USA') {
    return faker.phone.number('(###) ###-####');
  } else if (region === 'Poland') {
    return faker.phone.number('+48 ### ### ###');
  } else if (region === 'Georgia') {
    return faker.phone.number('+995 ### ### ###');
  } else {
    return faker.phone.number();
  }
}

// Function to apply errors to the data
function applyErrors(record, errorsPerRecord) {
  const errorTypes = ['delete', 'add', 'swap'];

  for (let i = 0; i < errorsPerRecord; i++) {
    const errorType = faker.helpers.arrayElement(errorTypes);
    const field = faker.helpers.arrayElement(['name', 'address', 'phone']);
    const value = record[field];

    switch (errorType) {
      case 'delete':
        record[field] = deleteRandomChar(value);
        break;
      case 'add':
        record[field] = addRandomChar(value);
        break;
      case 'swap':
        record[field] = swapChars(value);
        break;
    }
  }

  return record;
}

// Error-handling functions
function deleteRandomChar(value) {
  if (value.length > 1) {
    const pos = faker.number.int({ min: 0, max: value.length - 1 });
    return value.slice(0, pos) + value.slice(pos + 1);
  }
  return value;
}

function addRandomChar(value) {
  const pos = faker.number.int({ min: 0, max: value.length });
  const randomChar = faker.string.alpha();
  return value.slice(0, pos) + randomChar + value.slice(pos);
}

function swapChars(value) {
  if (value.length > 1) {
    const pos = faker.number.int({ min: 0, max: value.length - 2 });
    return value.slice(0, pos) + value[pos + 1] + value[pos] + value.slice(pos + 2);
  }
  return value;
}

// Route to get data
router.get('/data', (req, res) => {
  const { region, errors, seed } = req.query;
  const errorsPerRecord = parseFloat(errors);
  const seedValue = parseInt(seed, 10);

  const data = generateFakeData(region, errorsPerRecord, seedValue);
  res.json(data);
});

module.exports = router;

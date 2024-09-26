const express = require('express');
const router = express.Router();
const { faker } = require('@faker-js/faker');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');
const { fakerDE: fakerde } = require('@faker-js/faker');
const { fakerEN: fakeren } = require('@faker-js/faker');
const { fakerPL: fakerpl } = require('@faker-js/faker');

// Function to generate fake data
// Function to generate fake data
function generateFakeData(region, errorsPerRecord, seed) {
  faker.seed(seed);  // Set the seed for reproducibility
  
  // Correct locale setting based on region
  if (region === 'USA') {
    faker.locale = 'en';
  } else if (region === 'Poland') {
    faker.locale = 'pl';
  } else if (region === 'Georgia') {
    faker.locale = 'ge';
  } else {
    faker.locale = 'en';  // Default to English if region not specified
  }

  const data = [];
  for (let i = 0; i < 20; i++) {
    const randomId = faker.string.uuid();
    const name = generateName(region);  // Generate region-specific name
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

// Function to generate names based on region
function generateName(region) {
  if (region==='USA')
    return fakeren.person.fullName();
  if (region==='Poland')
    return fakerpl.person.fullName();
  if (region==='Germany')
    return fakerde.person.fullName();

  //return faker.person.fullName();  // Faker will use the locale set in generateFakeData
}

// Function to generate addresses based on region
function generateAddress(region) {
  if (region === 'USA') {
    return `${fakeren.location.city()}, ${fakeren.location.state()} ${fakeren.location.zipCode()}`;
  } else if (region === 'Poland') {
    return `${fakerpl.location.city()}, ${fakerpl.location.streetAddress()}, ${fakerpl.location.zipCode('PL')}`;
  } else if (region === 'Germany') {
    return `${fakerde.location.city()}, ${fakerde.location.streetAddress()}, ${fakerde.location.zipCode('GE')}`;
  } else {
    return `${faker.location.city()}, ${faker.location.streetAddress()}`;
  }
}

// Function to generate phone numbers based on region
function generatePhone(region) {
  if (region === 'USA') {
    return fakeren.phone.number('(###) ###-####');
  } else if (region === 'Poland') {
    return fakerpl.phone.number('+48 ### ### ###');
  } else if (region === 'Georgia') {
    return fakerde.phone.number('+995 ### ### ###');
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
  console.log(`Region: ${region}`);
  res.json(data);
});



// Route to export CSV
router.get('/export-csv', async (req, res) => {
  const { region, errors, seed } = req.query;
  const errorsPerRecord = parseFloat(errors);
  const seedValue = parseInt(seed, 10);

  const data = generateFakeData(region, errorsPerRecord, seedValue);

  const filePath = path.join(__dirname, '../temp/fake_data.csv');
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'index', title: 'Index' },
      { id: 'randomId', title: 'Random ID' },
      { id: 'name', title: 'Name' },
      { id: 'address', title: 'Address' },
      { id: 'phone', title: 'Phone' },
    ]
  });

  await csvWriter.writeRecords(data);

  res.download(filePath, 'fake_data.csv', (err) => {
    if (err) {
      console.error('Error downloading the file:', err);
    }
    // Remove the file after download
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error removing the file:', err);
      }
    });
  });
});

module.exports = router;

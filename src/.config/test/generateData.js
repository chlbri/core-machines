const faker = require('faker');
const fs = require('fs');
const { nanoid } = require('nanoid');

function generateData() {
  return {
    login: faker.internet.userName(),
    firstNames: Array.from({
      length: faker.datatype.number({ min: 2, max: 4, precision: 1 }),
    }).map(() => faker.name.firstName()),
    lastName: faker.name.lastName(),
    _id: nanoid(),
  };
}

const db = Array.from({ length: 777 }).map(generateData);

fs.writeFileSync(
  './src/.config/test/db.json',
  JSON.stringify(db, null, 2),
);

const faker = require('faker');

function generateData() {
  return {
    login: faker.internet.userName(),
    firstNames: Array.from({
      length: faker.datatype.number({ min: 2, max: 4, precision: 1 }),
    }).map(() => faker.name.firstName()),
    lastName: faker.name.lastName(),
    id: faker.datatype.uuid(),
  };
}

const db = Array.from({ length: 777 }).map(generateData);

const dayjs = require('dayjs');
const faker = require('faker');
const fr = require('dayjs/locale/fr');

const fs = require('fs');
const { nanoid } = require('nanoid');
let i = 0;

const datas = Array.from({ length: 150 }).map(() => {
  i++;
  return {
    ID: i,
    FirstNames: Array.from({
      length: faker.datatype.number({ min: 1, max: 4, precision: 1 }),
    }).map(() => faker.name.firstName()),
    LastName: faker.name.lastName(),
    Transactions: Array.from({
      length: faker.datatype.number({ min: 5, max: 25, precision: 1 }),
    }).map(() => ({
      id: faker.datatype.uuid(),
      amount: faker.datatype.number({
        min: -100000,
        max: 100000,
        precision: 100,
      }),
      date: dayjs(faker.date.between('2018-01-01', '2018-12-31'))
        .locale(fr)
        .format('DD-MM-YYYY'),
    })),
  };
});

const transformedData = [];

datas.forEach((data) => {
  const idUser = data.ID;
  const Prénoms = data.FirstNames.join(', ');
  const Nom = data.LastName;
  data.Transactions.forEach((transaction) => {
    transformedData.push({
      uuid: transaction.id,
      Date: transaction.date,
      Montant: transaction.amount,
      idUser,
      Prénoms,
      Nom,
    });
  });
});

fs.writeFileSync(
  './generateExo.json',
  JSON.stringify(transformedData, null, 2)
);

console.log(
  'date',
  dayjs(faker.date.between('2018-01-01', '2018-12-31'))
    .locale(fr)
    .format('dddd, [le] DD MMMM YYYY')
);

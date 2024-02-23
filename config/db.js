const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('bite_speed', 'root', 'root', {
//     dialect: 'mysql',
//     host: 'localhost',
//     logging: console.log // Log SQL queries
// });

const sequelize = new Sequelize('bite_speed', 'dilleswar', '8yar1Rlehl-Me4JA9mOqQg', {
    dialect: 'postgres',
    host: 'fuzzy-avocet-14143.5xj.gcp-us-central1.cockroachlabs.cloud',
    port:26257,
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    logging: console.log // Log SQL queries
});

sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;

const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql', // Change to 'postgres', 'sqlite', or 'mssql' if needed
  logging: false, // Set to true if you want to see SQL queries in the console
});

sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Error connecting to database:', err));

module.exports = sequelize;

var mysql = require("mysql");
require("dotenv").config();

var connection = mysql.createPool({
  connectionLimit: 50000,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  multipleStatements: true,
});

module.exports = connection;

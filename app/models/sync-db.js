const Mysql = require("sync-mysql");
const dbConfig = require("../config/db.config.js");

var connection = new Mysql({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

module.exports = connection;

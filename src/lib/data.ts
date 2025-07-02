
import 'server-only';

// This file acts as a switcher for the data provider.
// It checks for MySQL environment variables and exports the appropriate
// database implementation (either JSON file-based or MySQL-based).

const useMySQL = !!process.env.DB_HOST;

let db;

if (useMySQL) {
  console.log("Database mode: MySQL");
  // Using require for conditional loading based on environment
  db = require('./mysql-db').db;
} else {
  console.log("Database mode: JSON file (db.json)");
  db = require('./json-db').db;
}

export { db };

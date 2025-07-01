'use server';

import mysql from 'mysql2/promise';

interface DbConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export async function testDbConnection(config: DbConfig) {
  try {
    const connection = await mysql.createConnection(config);
    await connection.ping();
    await connection.end();
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Connection Error:', error);
    // Sanitize error message to avoid exposing sensitive info
    let errorMessage = 'An unknown error occurred.';
    if (error.code) {
        switch (error.code) {
            case 'ECONNREFUSED':
                errorMessage = 'Connection refused. Check if the database server is running and the host/port are correct.';
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                errorMessage = 'Access denied. Check your username and password.';
                break;
            case 'ER_BAD_DB_ERROR':
                errorMessage = 'Database not found. Check the database name.';
                break;
            default:
                errorMessage = `Error: ${error.code}. Please check your connection details.`;
        }
    }
    return { success: false, error: errorMessage };
  }
}

export async function importJsonToMysql() {
    // This is a placeholder for the actual import logic.
    // In a real scenario, you would:
    // 1. Get the JSON data (e.g., from an uploaded file or localStorage).
    // 2. Connect to the MySQL database.
    // 3. Parse the JSON.
    // 4. Iterate through the data and execute INSERT or UPDATE statements.
    // For now, we just return a message.
    return { success: true, message: "Funcionalidade de importação pronta para ser implementada." };
}

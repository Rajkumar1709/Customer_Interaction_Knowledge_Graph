const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const fs = require('fs');

// Project configuration from Hackathon Data Guide
const PROJECT_ID = 'hck-dev-2876';
const DATASET = 'hck_data';
const KEY_PATH = path.resolve(__dirname, 'GCPKey.json');

let client = null;

// Graceful initialization: Check if the key exists before trying to connect
if (fs.existsSync(KEY_PATH)) {
  try {
    client = new BigQuery({
      projectId: PROJECT_ID,
      keyFilename: KEY_PATH,
    });
    console.log(`[BigQuery] ✅ Initialized successfully for project: ${PROJECT_ID}`);
  } catch (error) {
    console.error(`[BigQuery] ❌ Initialization failed:`, error.message);
  }
} else {
  console.warn(`[BigQuery] ⚠️ GCPKey.json NOT FOUND at ${KEY_PATH}`);
  console.warn(`[BigQuery] ⚠️ Running in Mock Data Fallback Mode.`);
}

/**
 * Helper to fully qualify table names
 */
const T = (tableName) => `\`${PROJECT_ID}.${DATASET}.${tableName}\``;

/**
 * Execute a query with parameters
 * Throws an error if client is not initialized, which triggers the fallback in server.js
 */
async function query(sql, params = {}) {
  if (!client) {
    throw new Error('BigQuery client not initialized (missing GCPKey.json)');
  }

  const options = {
    query: sql,
    params: params,
    // Location must match dataset, usually 'US'
    location: 'US',
  };

  const [rows] = await client.query(options);
  return rows;
}

module.exports = {
  query,
  T,
  isReady: !!client,
};

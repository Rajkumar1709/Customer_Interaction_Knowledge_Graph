const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const fs = require('fs');

// Project configuration from Hackathon Data Guide
const PROJECT_ID = 'hck-dev-2876';
const DATASET = 'hck_data';
const KEY_PATH = path.resolve(__dirname, 'GCPKey.json');

let client = null;

// Graceful initialization: Check ENV var first, then fallback to local file
if (process.env.GCP_CREDENTIALS) {
  try {
    const credentials = JSON.parse(process.env.GCP_CREDENTIALS);
    client = new BigQuery({
      projectId: PROJECT_ID,
      credentials,
    });
    console.log(`[BigQuery] ✅ Initialized successfully using ENV credentials for project: ${PROJECT_ID}`);
  } catch (error) {
    console.error(`[BigQuery] ❌ Initialization from ENV failed:`, error.message);
  }
} else if (fs.existsSync(KEY_PATH)) {
  try {
    client = new BigQuery({
      projectId: PROJECT_ID,
      keyFilename: KEY_PATH,
    });
    console.log(`[BigQuery] ✅ Initialized successfully using local GCPKey.json for project: ${PROJECT_ID}`);
  } catch (error) {
    console.error(`[BigQuery] ❌ Initialization from local file failed:`, error.message);
  }
} else {
  console.warn(`[BigQuery] ⚠️ No GCP credentials found (ENV or local file).`);
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

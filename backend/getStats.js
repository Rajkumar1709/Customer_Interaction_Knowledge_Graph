const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const client = new BigQuery({ projectId: 'hck-dev-2876', keyFilename: path.resolve('GCPKey.json') });
async function run() {
  const [rows] = await client.query('SELECT Status, Priority, count(Id) as cnt FROM `hck-dev-2876.hck_data.SFDC_Case` GROUP BY Status, Priority ORDER BY cnt DESC');
  console.log('Case stats:', rows);
}
run();

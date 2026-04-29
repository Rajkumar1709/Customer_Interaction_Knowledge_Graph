const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const client = new BigQuery({ projectId: 'hck-dev-2876', keyFilename: path.resolve('GCPKey.json') });
async function run() {
  const sql = `
    SELECT a.Name, a.Id, count(c.Id) as cnt
    FROM \`hck-dev-2876.hck_data.SFDC_Case\` c
    JOIN \`hck-dev-2876.hck_data.SFDC_Accounts\` a ON a.Id = c.AccountId
    WHERE c.Priority IN ('P1', 'P2') AND c.Status != 'Closed'
    GROUP BY a.Name, a.Id
    ORDER BY cnt DESC
    LIMIT 5
  `;
  const [rows] = await client.query(sql);
  console.log('Riskiest Accounts:', rows);
}
run();

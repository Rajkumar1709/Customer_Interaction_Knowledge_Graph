const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const client = new BigQuery({ projectId: 'hck-dev-2876', keyFilename: path.resolve('GCPKey.json') });
async function run() {
  const sql = `
    SELECT c.AccountId as id, a.Name, count(c.Id) as cnt
    FROM \`hck-dev-2876.hck_data.SFDC_Case\` c
    JOIN \`hck-dev-2876.hck_data.SFDC_Accounts\` a ON a.Id = c.AccountId
    WHERE c.Priority LIKE 'P1%' AND c.Status NOT LIKE '%Closed%' AND c.Status NOT LIKE '%Resolved%' AND c.Status NOT LIKE '%Completed%'
    GROUP BY c.AccountId, a.Name
    ORDER BY cnt DESC
    LIMIT 5
  `;
  const [rows] = await client.query(sql);
  console.log('Accounts with most active P1 tickets:', rows);
}
run();

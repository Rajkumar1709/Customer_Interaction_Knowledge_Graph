const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const bq = new BigQuery({ projectId: 'hck-dev-2876', keyFilename: path.resolve('GCPKey.json') });
bq.query(`
  SELECT Name 
  FROM hck_data.SFDC_Cancellation_Reason 
  WHERE LOWER(Name) LIKE '%sold%'
`).then(r => console.log(r[0]));

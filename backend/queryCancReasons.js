const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const bq = new BigQuery({ projectId: 'hck-dev-2876', keyFilename: path.resolve('GCPKey.json') });
bq.query(`
  SELECT DISTINCT COALESCE(r.Name, c.Reason_for_Cancellation__c) as reason
  FROM hck_data.SFDC_Cancellation c
  LEFT JOIN hck_data.SFDC_Cancellation_Reason r ON c.Reason_for_Cancellation__c = r.ID
  LIMIT 20
`).then(r => console.log(r[0]));

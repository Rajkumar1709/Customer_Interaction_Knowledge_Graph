const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const bq = new BigQuery({ projectId: 'hck-dev-2876', keyFilename: path.resolve('GCPKey.json') });
bq.query('SELECT DISTINCT Product_Family__c, Product_Name__c FROM hck_data.SFDC_Order__c LIMIT 20')
  .then(r => console.log(r[0]));

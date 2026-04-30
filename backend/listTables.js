const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const bq = new BigQuery({ projectId: 'hck-dev-2876', keyFilename: path.resolve('GCPKey.json') });
bq.dataset('hck_data').getTables().then(r => console.log(r[0].map(t => t.id).join(', ')));

const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
const client = new BigQuery({ projectId: 'hck-dev-2876', keyFilename: path.resolve('GCPKey.json') });

async function checkSchema(table) {
  try {
    const [metadata] = await client.dataset('hck_data').table(table).getMetadata();
    const cols = metadata.schema.fields.map(f => f.name).join(', ');
    console.log(`\nTable ${table}:`);
    console.log(cols);
  } catch (e) {
    console.error(`Error fetching ${table}:`, e.message);
  }
}

async function run() {
  await checkSchema('SFDC_ProblemManagementEscalation');
  await checkSchema('SFDC_Order__c');
  await checkSchema('SFDC_Cancellation');
  await checkSchema('SFDC_ClientHealthEvents__c');
}
run();

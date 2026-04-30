const q = require('./queries.js');
q.getAccountGraph('001G000000rC0U3IAK')
  .then(d => {
    const acc = d.nodes.find(n => n.label === 'Account');
    console.log(acc.properties);
  })
  .catch(console.error);

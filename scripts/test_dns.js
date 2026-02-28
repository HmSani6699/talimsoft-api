const dns = require('dns');
const host = 'cluster0.lhadmfx.mongodb.net';

dns.resolveSrv('_mongodb._tcp.' + host, (err, addresses) => {
  if (err) {
    console.error('SRV Resolution Error:', err);
  } else {
    console.log('SRV Records:', addresses);
  }
});

dns.lookup(host, (err, address, family) => {
  if (err) {
    console.error('Standard Lookup Error:', err);
  } else {
    console.log('Standard Lookup:', address);
  }
});

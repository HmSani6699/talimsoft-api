const dns = require('dns');

console.log("System DNS Servers:", dns.getServers());

const host = '_mongodb._tcp.cluster0.lhadmfx.mongodb.net';

console.log(`Resolving SRV for ${host}...`);

dns.resolveSrv(host, (err, addresses) => {
  if (err) {
    console.error("Default DNS failed:", err.code);
    
    // Try Google DNS
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8']);
    console.log("Trying Google DNS (8.8.8.8)...");
    resolver.resolveSrv(host, (err2, addresses2) => {
      if (err2) {
        console.error("Google DNS failed:", err2.code);
      } else {
        console.log("Google DNS success!", addresses2);
      }
    });
  } else {
    console.log("Default DNS success!", addresses);
  }
});

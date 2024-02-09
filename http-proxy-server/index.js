const http = require("http");
const httpProxy = require("http-proxy");

const publicProxies = [
  { ip: "192.168.1.1", port: 8080 },
  { ip: "192.168.1.2", port: 8080 },
  { ip: "192.168.1.3", port: 8080 },
  { ip: "192.168.1.4", port: 8080 },
  { ip: "192.168.1.5", port: 8080 },
];

const targetHost = "example.com";
const proxyPort = 8080;
let currentProxyIndex = 0;
let requestCount = 0;

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  const currentProxy = publicProxies[currentProxyIndex];
  const proxyOptions = {
    target: `http://${targetHost}`,
    changeOrigin: true,
    headers: { "X-Forwarded-For": currentProxy.ip },
  };

  proxy.web(req, res, proxyOptions, (err) => {
    if (err) {
      console.error(`Proxy error: ${err.message}`);
      res.writeHead(502);
      res.end("Bad Gateway");
    }
  });

  requestCount++;
  if (requestCount >= 5) {
    currentProxyIndex = (currentProxyIndex + 1) % publicProxies.length;
    requestCount = 0;
  }
});

server.listen(proxyPort, () => {
  console.log(`Proxy server listening on port ${proxyPort}`);
});

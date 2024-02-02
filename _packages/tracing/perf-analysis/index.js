const http = require("http");
const { trace, Span, attributes } = require("trace_events");

const server = http.createServer((req, res) => {
  const span = trace.startSpan("http_request", Span.Kind.SERVER);
  span.setAttribute(attributes.HTTP_METHOD, req.method);
  span.setAttribute(attributes.HTTP_URL, req.url);

  req.on("end", () => {
    span.setAttribute(attributes.HTTP_STATUS_CODE, res.statusCode);
    span.end();
  });

  res.on("finish", () => {
    span.addEvent("response_sent");
  });

  // Simulate request processing
  setTimeout(() => {
    res.end("Hello, World!");
  }, 500);
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server stopped");
  });
});

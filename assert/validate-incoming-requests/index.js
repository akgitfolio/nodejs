const http = require("http");
const assert = require("assert");

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Define validation rules based on request path
  const path = req.url;
  switch (path) {
    case "/users":
      validateUserRequest(req);
      break;
    case "/products":
      validateProductRequest(req);
      break;
    default:
      res.statusCode = 404;
      res.end("Not Found");
      return;
  }

  // Further processing of the request can be done here

  res.statusCode = 200;
  res.end("Request validated successfully");
});

function validateUserRequest(req) {
  assert.equal(req.method, "POST", "Only POST requests are allowed for /users");
  assert(
    req.headers["content-type"] === "application/json",
    "Content-Type must be application/json"
  );
  const body = JSON.parse(req.body);
  assert(body.name && body.email, "Name and email are required fields");
  assert(typeof body.name === "string", "Name must be a string");
  assert(typeof body.email === "string", "Email must be a string");
  assert(body.email.includes("@"), "Email must be a valid email address");
}

function validateProductRequest(req) {
  assert.equal(
    req.method,
    "GET",
    "Only GET requests are allowed for /products"
  );
  const params = new URLSearchParams(req.url.split("?")[1]);
  assert(params.has("id"), "Product ID is required");
  assert(typeof params.get("id") === "string", "Product ID must be a string");
  assert(
    Number.isInteger(parseInt(params.get("id"))),
    "Product ID must be an integer"
  );
}

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

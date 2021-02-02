const http = require("http");
const app = require("./app");
const PORT = 3000;

var server = http.createServer(app);
server.listen(PORT, () =>
console.log(`Server running on http://localhost:${PORT}/`)
);

require('dotenv').config({ path: './.env' });

const axios = require("axios");
const http = require("http");

console.log("Loaded ACCESS_TOKEN:", process.env.ACCESS_TOKEN);

const server = http.createServer(async (req, res) => {
  if (req.url === "/test" && req.method === "GET") {
    try {
      const response = await axios.get(
        "https://sandbox.sellingpartnerapi-na.amazon.com/fba/inventory/v1/summaries?details=true&granularityType=Marketplace&granularityId=ATVPDKIKX0DER&marketplaceIds=ATVPDKIKX0DER",
        {
          headers: {
            "x-amz-access-token": process.env.ACCESS_TOKEN,
          },
        }
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response.data));
    } catch (error) {
      res.writeHead(error.response?.status || 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: error.response?.data || error.message,
      }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/test`);
});

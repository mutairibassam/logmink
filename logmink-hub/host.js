const Mongoosedb = require("./mongo_client");
const requests = require("./request_schema");

const express = require("express");
const app = express();

app.use(express.json());

app.post("/capture", async (req, res) => {

  /**
   *  incoming request
   * 
   *  {
   *    timestamp: '2024-09-06T12:26:08.358Z',
   *    method: 'POST',
   *    url: '/create',
   *    headers: {
   *      Host: 'localhost:8080',
   *      'Content-Type': 'application/json',
   *      'Content-Length': '57'
   *      Accept: '',
   *      'User-Agent': 'PostmanRuntime/7.41.2',
   *      'Cache-Control': 'no-cache',
   *      'Postman-Token': '2c47212a-fd25-4fbe-a2fe-656d8c66e57e',
   *      'Accept-Encoding': 'gzip, deflate, br',
   *      Connection: 'keep-alive',
   *      },
   *    payload: { username: 'username', bio: 'bio' },
   *    from: '111.222.333.444',
   *    to: 'logmink.dns'
   *  }
   * 
   */
  try {
    await requests.create(req.body);
  } catch (err) {
    /// this try/catch is used just to avoid server crashing.
    /// TODO: since the host only for logging we might go with diff
    /// apporach rather than tcp/http. UDP is valid for logging.
    /// in case UDP is not considered we might go with rpc, kafka
    /// or tcp/http long pull.
  }

  /**
   *  "X-Agent-Logs" is used to avoid logging host http requests.
   */
  res.setHeader("X-Agent-Logs", true);
  return res.status(200).send();
});

Mongoosedb.connect().then(
  async () => {
    app.listen(process.env.PORT || 32001, async () => {
      console.log(`Server running on ${process.env.PORT || 32001}`);
    });
  },
  (err) => {
    console.log("Unable to connect mongoose " + err);
  }
);

exports.module = app;

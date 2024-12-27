const express = require("express");
const bodyParser = require("body-parser");

const app = express().use(bodyParser.json());

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challange = req.query["hub.challange"];
  let token = req.query["hub.verify_token"];

  const mytoken = "";

  if (mode && token) {
    if (mode === "subcribe" && token === mytoken) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  let body_param = req.body;
  console.log(JSON.stringify(body_param, null, 2));
});

app.get("/", (req, res) => {
  let body_param = req.body;
  console.log(JSON.stringify(body_param, null, 2));
  res.sendStatus(200).send("hello this is webhook setup");
});

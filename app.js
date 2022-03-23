const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/src/*", (req, res) => {
  // console.log(req.params);
  res.sendFile(path.join(__dirname, "src", req.params[0]));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
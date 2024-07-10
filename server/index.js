const sqlite3 = require('sqlite3').verbose();
const fs = require("fs");
const bodyParser = require('body-parser');
const app = require("express")();

AREA_PATH = process.cwd() + "\\server\\"

// Read config
const configPath = process.cwd() + '\\config.json';
if (!fs.existsSync(configPath))
  fs.copyFileSync(__dirname + '\\config.default.json', configPath);
let config = JSON.parse(fs.readFileSync(configPath));

async function main() {
  app.use(bodyParser.urlencoded({ extended: true }));
  await setupEndpoints(app, config.port, await setupDB());
  console.log("Server started on port: " + config.port);
}

async function setupDB() {
  const db = new sqlite3.Database(':memory:');
  const setupStatments = require(process.cwd() + "\\dbSetupStatments.js")();
  db.serialize(() => {
    for (const statment of setupStatments)
      db.run(statment);
  });
  return db;
}

async function setupEndpoints(app, port, database) {
  const requestHandler = require("./requestHandler.js");

  const methods = require(AREA_PATH + "\\methods.js")(database);
  const rpc = new requestHandler(methods, database);

  for (const endpointName of Object.keys(methods.GET)) {
    await app.get("/" + endpointName, function (req, res) {
      this.callEndpointMethod(endpointName, req, res);
    }.bind(rpc));
  }
  for (const endpointName of Object.keys(methods.POST)) {
    await app.post("/" + endpointName, function (req, res) {
      this.callEndpointMethod(endpointName, req, res)
    }.bind(rpc));
  }
  app.listen(port);
}

main();
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

  const port = config.port || 8081;

  const database = await setupDB(config);

  await setupEndpoints(app, port, userManager, database);

  console.log("Server reloaded.");
}


async function setupDB(config) {
  const db = new sqlite3.Database(':memory:');

  const setupStatments = require(process.cwd() + "\\dbSetupStatments.js")();

  db.serialize(() => {
    for (const statment of setupStatments)
      db.run(statment);
  });

  return db;
}

async function setupEndpoints(app, port, userManager, database) {
  const requestHandler = require("./requestHandler.js");

  const areas = fs.readdirSync(process.cwd() + "\\server\\")
  console.log("Setting up methods");
  const methods = require(AREA_PATH + "\\methods.js")(database);
  const rpc = new requestHandler(methods, database, userManager);

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
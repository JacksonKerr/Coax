const sqlite3 = require('sqlite3').verbose();
const fs = require("fs");
const bodyParser = require('body-parser');
const app = require("express")();

const configPath = process.cwd() + '\\config.json';
if (!fs.existsSync(configPath))
  fs.copyFileSync(__dirname + '\\config.default.json', configPath);
let config = JSON.parse(fs.readFileSync(configPath));

async function setupDB() {
  const db = new sqlite3.Database(':memory:');
  const setupStatments = require("./dbSetupStatments.js");
  db.serialize(() => setupStatments.forEach(s => db.run(s)));
  return db;
}

async function setupEndpoints(app, port, database, userManager) {
  const requestHandler = require("./requestHandler.js");
  const methods = require(process.cwd() + "\\server\\methods.js");
  const rqh = new requestHandler(methods, database, userManager);

  const endpointTypes = Object.keys(methods);
  for (const endpointType of endpointTypes)
    for (const endpointName of Object.keys(methods[endpointType]))
      await app[endpointType.toLowerCase()](
        "/" + endpointName,
        function (req, res) {
          this.callEndpointMethod(endpointName, req, res);
        }.bind(rqh)
      );
  app.listen(port);
}

async function setup() {
  app.use(bodyParser.urlencoded({ extended: true }));

  const db = await setupDB();

  const userManager = require("./userManager.js");
  const um = new userManager(db);

  await setupEndpoints(app, config.port, db, um);
  console.log("Server started on port: " + config.port);
}
setup();

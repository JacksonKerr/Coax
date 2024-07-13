const sqlite3 = require('sqlite3').verbose();
const fs = require("fs");
const bodyParser = require('body-parser');
const app = require("express")();

const configPath = process.cwd() + '\\config.json';
if (!fs.existsSync(configPath))
  fs.copyFileSync(process.cwd() + '\\config.default.json', configPath);
let config = JSON.parse(fs.readFileSync(configPath));

async function setupDB() {
  const db = new sqlite3.Database(':memory:');
  const setupStatments = require("./server/dbSetupStatments.js");
  db.serialize(() => setupStatments.forEach(s => db.run(s)));
  return db;
}

async function setupEndpoints(app, database, userManager) {
  const requestHandler = require("./server/requestHandler.js");
  const methods = require(process.cwd() + "\\server\\endpoints.js");
  const rqh = new requestHandler(methods, database, userManager, config.publicEndpoints);

  const endpointTypes = Object.keys(methods);
  for (const endpointType of endpointTypes)
    for (const endpointPath of Object.keys(methods[endpointType]))
      await app[endpointType.toLowerCase()](
        "/" + endpointPath,
        function (req, res) {
          this.callEndpoint(endpointPath, req, res);
        }.bind(rqh)
      );
  app.listen(config.port);
  console.log("Endpoints listening on port: " + config.port);
}

async function setup() {
  app.use(bodyParser.urlencoded({ extended: true }));

  const db = await setupDB();

  const userManager = require("./server/userManager.js");
  const um = new userManager(db, config.numBytesInSessionToken);

  await setupEndpoints(app, db, um);
  
  return {app, db, um};
}

module.exports = setup();


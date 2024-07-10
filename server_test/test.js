const fs = require("fs");
requestHandler = require("../server/requestHandler");

module.exports = class Test {
    TEST_AUTHOR_NAME = "Test author";

    appName = null;
    rpc = null;
    userManager = {
        authenticate: (username, password) => username == password,
        findUsers: (searchTerm) => searchTerm,
    }

    constructor(appName, methods) {
        this.appName = appName;

        this.sequelize.authenticate();
        this.getModels();

        this.rpc = new requestHandler(methods(this.sequelize), this.sequelize, this.userManager);
        //constructor(methods, sequelize, userManager)
    }

    /**
     * Helper method for calling requestHandler functions.
     * @param {Object} rpc Initialised and set up requestHandler object
     * @param {Boolean} authed If true, run function as authed user.
     * @param {String} methodName 
     * @param {Object} params 
     * @returns Result from requestHandler function.
     */
    call(methodName, params, withoutAuth) {
        const req = {
            body: { method: methodName, params: params, },
            session: { authed: !withoutAuth ? this.TEST_AUTHOR_NAME : null },
        }
        const res = { send: () => { } }
        return this.rpc.call(req, res, this.sequelize)
    };

    /**
     * @param {*} rpc Initialized and set up requestHandler object
     * @param {*} modelName 
     * @param {*} withID If true, include the UUID of each entry.
     * @param {*} hierarchy If true, also get child records
     * @returns All entries from a model in the given rpc object's sequelize instance.
     */
    async findAll(modelName, withID, hierarchy) {
        const found = await this.sequelize.models[modelName].findAll({
            attributes: { exclude: withID ? [] : ['UUID'] },
            hierarchy: hierarchy,
            nest: true,
        });
        return found.map(i => i.toJSON());
    };

    async reset() {
        await this.sequelize.sync({ force: true });
    }
}


const helpers = require("./helperFunctions.js");

module.exports = class userManager {
    authedUsers = {};
    database = null;

    constructor(database) {
        this.database = database;
    }

    async checkAuth(userName, password) {
        let userRows = await helpers.db(
            this.database,
            "SELECT * FROM User"
            + " WHERE UserName = '" + userName + "'"
            + " AND Password = '" + password + "'"
        );
        if (userRows.length != 1)
            return false;
        let expDate = Date.now() + (60 * 60 * 1000); // One hour
        let token = Math.random(); // TODO: Make this more sensible
        this.authedUsers[token] = { userName: userName, expiration: expDate };
        return token;
    }

    getUserFromToken(token) {
        // TODO: Session expiration
        return this.authedUsers[token]?.userName;
    }
}
var crypto = require("crypto");
const helpers = require("./helperFunctions.js");

module.exports = class userManager {
    authedUsers = {};
    database = null;

    constructor(database, numBytesInSessionToken) {
        this.database = database;
        this.numBytesInSessionToken = numBytesInSessionToken;
    }

    async newSession(userName, password) {
        let userRows = await helpers.db(
            this.database,
            "SELECT * FROM User"
            + " WHERE UserName = '" + userName + "'"
            + " AND Password = '" + password + "'"
        );
        if (userRows.length != 1)
            return false;
        let expDate = Date.now() + (60 * 60 * 1000); // One hour
        let token = crypto.randomBytes(this.numBytesInSessionToken).toString('hex');
        this.authedUsers[token] = { userName: userName, expiration: expDate };
        return token;
    }

    getUserFromToken(token) {
        // TODO: Session expiration
        return this.authedUsers[token]?.userName;
    }

    killUserSessionIfExists(userName) {
        for (const token of Object.kets(this.authedUsers)) {
            if (this.authedUsers[token].userName == userName) {
                delete this.authedUsers[token];
                return;
            }
        }
    }
}
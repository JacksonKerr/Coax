const fs = require("fs");

function readStaticFileAsString(fileName) {
    const file = fs.readFileSync(process.cwd() + "\\static\\" + fileName + ".html")
    return file.toString();
};

async function db(db, query){
    return new Promise(function(resolve,reject){
        db.all(query, function(err,rows){
           if(err){return reject(err);}
           resolve(rows);
         });
    });
}

module.exports = (database) => ({
    POST: {
        login: {
            params: {
                required: { userName: String(), password: String() },
            },
            function: async function (session, params, context) {
                const x = await db(context.database, "SELECT * FROM User");
                return x;
            }.bind(this),
        },
        // example: {
        //     params: {
        //         required: { stringPAram: String() },
        //         optional: { tempref: String() },
        //     },
        //     function: async function (session, params, context) {
        //         const x = await db(context.database, "SELECT * FROM User");
        //         return x;
        //     }.bind(this),
        // },
    },
    GET: {
        endSession: {
            function: async function (session, params, context) {
                session.authed = null;
                return rpc.success();
            },
        },
        login: {
            function: async function (session, params, context) {
                return readStaticFileAsString("login")
            },
        },
    },
});
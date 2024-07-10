const helpers = require("./helperFunctions.js");

module.exports = {
    POST: {
        login: {
            params: {
                required: { userName: String(), password: String() },
            },
            function: async function (userName, params, context) {
                return "Redirect to main page";
            }.bind(this),
        },
        example: {
            function: async function (userName, params, context) {
                return "Example response";
            }.bind(this),
        },
        // example: {
        //     params: {
        //         required: { stringParam: String() },
        //         optional: { examp: String() },
        //     },
        //     function: async function (userName, params, context) {
        //         return "Examp";
        //     }.bind(this),
        // },
    },
    GET: {
        endSession: {
            function: async function (userName, params, context) {
                session.authed = null;
                return rpc.success();
            },
        },
        login: {
            function: async function (userName, params, context) {
                return helpers.readStaticFileAsString("login")
            },
        },
    },
};
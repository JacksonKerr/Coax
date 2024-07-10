const helpers = require("./helperFunctions.js");

function redirect(endpoint) {
    return "<script>window.location.href = '/" + endpoint + "'</script>";
}

module.exports = {
    POST: {
        login: {
            params: {
                required: { userName: String(), password: String() },
            },
            function: async function (userName, params, context) {
                return redirect("chat");
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
        chat: {
            function: async function (userName, params, context) {
                return helpers.readStaticFileAsString("chat");
            },
        },
        login: {
            function: async function (userName, params, context) {
                if (userName) 
                    return redirect("chat");
                return helpers.readStaticFileAsString("login");
            },
        },
        users: {
            function: async function (userName, params, context) {
                let users = await helpers.db(
                    context.database,
                    "SELECT UserName FROM User"
                );
                users = users.map(u => u.UserName);
                return users;
            },
        },
    },
};
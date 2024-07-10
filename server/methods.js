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
                    "SELECT UserName FROM User WHERE UserName != '" + userName + "'"
                );
                let response = "";
                for (let user of users)
                    response += `
                        <a href='/dm?userName=`+ user.UserName + `' hx-swap='outerHTML'>
                            ` + user.UserName + `
                        </a>
                        <br/>
                    `;
                return response;
            },
        },
        dm: {
            params: {
                required: { userName: String() },
            },
            function: async function (userName, params, context) {
                // Select all messages between users
                return "Example response";
            }.bind(this),
        },
    },
};
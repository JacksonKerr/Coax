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
                return redirect("home");
            }.bind(this),
        },
    },
    GET: {
        home: {
            function: async function (userName, params, context) {
                return helpers.readStaticFileAsString("home");
            },
        },
        login: {
            function: async function (userName, params, context) {
                if (userName)
                    return redirect("home");
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
                        <a href='/messages?userName=`+ user.UserName + `' hx-swap='outerHTML'>
                            ` + user.UserName + `
                        </a>
                        <br/>
                    `;
                return response;
            },
        },
        messages: {
            params: {
                required: { userName: String() },
            },
            function: async function (userName, params, context) {
                // Select all messages between users
                const messages = await helpers.db(
                    context.database,
                    "SELECT * FROM Message WHERE '" + userName + "' IN (fromUser, toUser)"
                    + "ORDER BY [TimeStamp] DESC"
                );
                let response = "<h4>Messages:</h4><br/>";
                for (let message of messages) {
                    response += "<p>" + message.Msg + "</p>"; 
                }
                return response;
            }.bind(this),
        },
    },
};
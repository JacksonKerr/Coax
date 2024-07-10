const helpers = require("./helperFunctions.js");
const Handlebars = require('handlebars');

module.exports = {
    POST: {
        login: {
            params: {
                required: { userName: String(), password: String() },
            },
            function: async function (userName, params, context) {
                return helpers.getJsRedirect("home");
            }.bind(this),
        },
        sendMessage: {
            params: {
                required: { toUser: String(), message: String() },
            },
            function: async function (userName, params, context) {
                helpers.db(
                    context.database, 
                    "INSERT INTO Message (Msg, fromUser, toUser)"
                    + "VALUES ('" + params.message + "', '" + userName + "', '" + params.toUser + "')"
                )
                return helpers.getJsRedirect("chat?userName=" + params.toUser);
            }.bind(this),
        },
    },
    GET: {
        home: {
            function: async function (userName, params, context) {
                return helpers.readStaticFileAsString("home.html");
            },
        },
        login: {
            function: async function (userName, params, context) {
                if (userName)
                    return helpers.getJsRedirect("home");
                return helpers.readStaticFileAsString("login.html");
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
                        <a href='/chat?userName=`+ user.UserName + `' hx-swap='outerHTML'>
                            ` + user.UserName + `
                        </a>
                        <br/>
                    `;
                return response;
            },
        },
        chat: {
            params: {
                required: { userName: String() },
            },
            function: async function (userName, params, context) {
                // Select all messages between users
                let template = Handlebars.compile(
                    helpers.readStaticFileAsString("chat.handlebars")
                );
                let response = template({toUser: params.userName});
                return response;
            }.bind(this),
        },
        messages: {
            params: {
                required: { userName: String() },
            },
            function: async function (userName, params, context) {
                // Select all messages between users
                const messages = await helpers.db(
                    context.database,
                    `SELECT * FROM Message 
                    WHERE (fromUser = '` + userName + `' AND toUser = '` + params.userName + `')
                    OR (fromUser = '` + params.userName + `' AND toUser = '` + userName + `')
                    ORDER BY [TimeStamp] ASC`
                );
                helpers.get
                let template = Handlebars.compile(
                    `{{#messages}}
                    <div class="container">
                            <span class="time-left">{{TimeStamp}}</span>
                            <br/>
                            {{fromUser}}: {{Msg}}
                    </div>
                    {{/messages}}`
                );
                
                let response = template({messages, toUser: params.userName});
                return response;
            }.bind(this),
        },
    },
};
const helpers = require("./helperFunctions.js");
const Handlebars = require('handlebars');

module.exports = {
    POST: {
        login: {
            params: {
                required: { userName: String(), password: String() },
            },
            function: async function (context) {
                sessionToken = await context.userManager.newSession(
                    context.params.userName,
                    context.params.password
                );
                if (!sessionToken)
                    return helpers.getJsRedirect("login");

                context.response.cookie(context.SESSION_COOKIE_NAME, sessionToken)
                context.request.headers.cookie = context.SESSION_COOKIE_NAME + '=' + sessionToken;

                return helpers.getJsRedirect("home");
            }.bind(this),
        },
        newUser: {
            params: {
                required: { userName: String(), password: String() },
            },
            function: async function (context) {
                helpers.db(
                    context.database,
                    `INSERT INTO User (UserName, Password) VALUES ('`
                    + context.params.userName + `', '` + context.params.password + `')`
                );
                return "Account created";
            }.bind(this),
        },
        sendMessage: {
            params: {
                required: { toUser: String(), message: String() },
            },
            function: async function (context) {
                helpers.db(
                    context.database,
                    "INSERT INTO Message (Msg, fromUser, toUser)"
                    + "VALUES ('" + context.params.message + "', '" + context.authedUserName + "', '" + context.params.toUser + "')"
                )
                return helpers.getJsRedirect("chat?userName=" + params.toUser);
            }.bind(this),
        },
    },
    GET: {
        home: {
            function: async function (context) {
                return helpers.readStaticFileAsString("home.html");
            },
        },
        login: {
            function: async function (context) {
                if (context.authedUserName)
                    context.userManager.killUserSessionIfExists(context.authedUserName);
                return helpers.readStaticFileAsString("login.html");
            },
        },
        users: {
            function: async function (context) {
                let users = await helpers.db(
                    context.database,
                    "SELECT UserName FROM User WHERE UserName != '" + context.authedUserName + "'"
                );
                let html = "";
                for (let user of users)
                    html += `
                        <a href='/chat?userName=`+ user.UserName + `' hx-swap='outerHTML'>
                            ` + user.UserName + `
                        </a>
                        <br/>
                    `;
                return html;
            },
        },
        chat: {
            params: {
                required: { userName: String() },
            },
            function: async function (context) {
                // Select all messages between users
                let template = Handlebars.compile(
                    helpers.readStaticFileAsString("chat.handlebars")
                );
                let html = template({ toUser: context.params.userName });
                return html;
            }.bind(this),
        },
        messages: {
            params: {
                required: { userName: String() },
            },
            function: async function (context) {
                // Select all messages between users
                const messages = await helpers.db(
                    context.database,
                    `SELECT * FROM Message 
                    WHERE (fromUser = '` + context.authedUserName + `' AND toUser = '` + context.params.userName + `')
                    OR (fromUser = '` + context.params.userName + `' AND toUser = '` + context.authedUserName + `')
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

                let response = template({ messages, toUser: context.params.userName });
                return response;
            }.bind(this),
        },
        newUser: {
            function: async function (context) {
                return helpers.readStaticFileAsString("newUser.html");
            }.bind(this),
        },
    },
};
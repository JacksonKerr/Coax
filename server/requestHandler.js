const helpers = require("./helperFunctions.js");

const LOGIN_ENDPOINT = "login";
const SESSION_COOKIE = "session";

module.exports = class requestHandler {
    database = null;
    methods = null;
    userManager = null;
    ERROR = {
        NO_AUTH: () => "Not authenticated.",
        BAD_CREDENTIALS: () => "Bad username/password combination.",
        UNKNOWN_SESSION_TOKEN: () => "Session token unknown or expired.",
        MISSING_PARAM: (param) => "Missing required parameter '" + param + "'.",
        UNKNOWN_PARAMETER: (param) => "Unknown parameter '" + param + "'.",
        BAD_PARAM_TYPE: (param, expected, given) => "Expected type '" + expected
            + "' for parameter '" + param + "' but got '" + given + "'.",
    }

    constructor(endpoints, database, userManager) {
        this.database = database;
        this.endpoints = endpoints;
        this.userManager = userManager;
    }

    async callEndpoint(endpointPath, req, res) {
        const returnVal = function (response, isAuthFail) {
            if (isAuthFail)
                response = helpers.getJsRedirect("login")
            res.send(response);
            return response; // For testing
        }.bind(this);
        const returnFuncResult = async function (method, userName, params, context) {
            const response = await method.function(userName, params, context);
            return returnVal(response);
        }.bind(this);

        const method = this.endpoints[req.method][endpointPath];
        const params = this.getParamsFromRequest(req);

        const paramError = this.checkParams(method, params);
        if (paramError != null)
            return returnVal(paramError);

        let sessionToken;

        if (endpointPath == LOGIN_ENDPOINT) {
            if (req.method == "POST") {
                sessionToken = await this.userManager.newSession(
                    params.userName,
                    params.password
                );
                if (!sessionToken) 
                    return returnVal(this.ERROR.BAD_CREDENTIALS(), true);
                res.cookie(SESSION_COOKIE, sessionToken)
                req.headers.cookie = SESSION_COOKIE + '=' + sessionToken;
            }
            if (req.method == "GET") {
                this.userManager.killSessionIfExists(sessionToken);
                return await returnFuncResult(this.endpoints.GET.login, '', {}, this);
            }
        }

        if (sessionToken == null)
            sessionToken = (req.headers.cookie)?.split('; ')
                .find(c => c.includes(SESSION_COOKIE))
                .replace(SESSION_COOKIE + '=', '');

        let userName = this.userManager.getUserFromToken(sessionToken);
        if (userName != null) 
            return await returnFuncResult(method, userName, params, this);
        return returnVal(this.ERROR.UNKNOWN_SESSION_TOKEN(), true);
    }

    /**
     * @param {String} method The name of the method we are checking params against
     * @param {Object} params
     * @returns Error response or null if there were no errors
     */
    checkParams(method, params) {
        const requiredNames = Object.keys(method?.params?.required || {})

        const allParams = { ...method?.params?.required, ...method?.params?.optional }
        const allParamNames = Object.keys(allParams);

        for (const required of requiredNames)
            if (!Object.keys(params).includes(required))
                return this.ERROR.MISSING_PARAM(required);

        for (const paramName of Object.keys(params)) {
            const givenType = typeof (params[paramName])

            if (allParamNames.includes(paramName)) {
                const expectedType = typeof (allParams[paramName]);
                if (expectedType != givenType)
                    return this.ERROR.BAD_PARAM_TYPE(paramName, expectedType, givenType);
            } else return this.ERROR.UNKNOWN_PARAMETER(paramName);
        }
        return null;
    }

    getParamsFromRequest(req) {
        function escape(s) {
            let lookup = {
                '&': "&amp;",
                '"': "&quot;",
                '\'': "&apos;",
                '<': "&lt;",
                '>': "&gt;"
            };
            return s.replace(/[&"'<>]/g, c => lookup[c]);
        }

        const params = { ...req.body, ...req.query };
        for (let param of Object.keys(params))
            params[param] = escape(params[param]);
        return params
    }
}
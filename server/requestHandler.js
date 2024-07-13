const helpers = require("./helperFunctions.js");


module.exports = class requestHandler {
    database = null;
    methods = null;
    userManager = null;
    publicEndpoints = null;
    SESSION_COOKIE_NAME = "session";
    ERROR = {
        NO_AUTH: () => "Not authenticated.",
        BAD_CREDENTIALS: () => "Bad username/password combination.",
        UNKNOWN_SESSION_TOKEN: () => "Session token unknown or expired.",
        MISSING_PARAM: (param) => "Missing required parameter '" + param + "'.",
        UNKNOWN_PARAMETER: (param) => "Unknown parameter '" + param + "'.",
        BAD_PARAM_TYPE: (param, expected, given) => "Expected type '" + expected
            + "' for parameter '" + param + "' but got '" + given + "'.",
    }

    constructor(endpoints, database, userManager, publicEndpoints) {
        this.database = database;
        this.endpoints = endpoints;
        this.userManager = userManager;
        this.publicEndpoints = publicEndpoints;
    }

    async callEndpoint(endpointPath, request, response) {
        const returnVal = function (html, isAuthFail) {
            if (isAuthFail)
                html = helpers.getJsRedirect("login")
            response.send(html);
            return html; // For testing
        }.bind(this);

        const returnFuncResult = async function (userName) {
            const method = this.endpoints[request.method][endpointPath];
            const params = this.getParamsFromRequest(request);
            const paramError = this.checkParams(method, params);
            if (paramError != null)
                return returnVal(paramError);

            const html = await method.function(
                {...this, authedUserName, params, request, response});
            return returnVal(html);
        }.bind(this);







        let sessionToken = (request.headers.cookie)?.split('; ')
            .find(c => c.includes(this.SESSION_COOKIE_NAME))
            .replace(this.SESSION_COOKIE_NAME + '=', '');
        let authedUserName = this.userManager.getUserFromToken(sessionToken);
        if (authedUserName != null)
            return await returnFuncResult(authedUserName);



        let isPublicEndpoint = this.publicEndpoints.find(
            e => e.method == request.method && e.endpoint == endpointPath
        ) != null;
        if (isPublicEndpoint)
            return await returnFuncResult();


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
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

    constructor(methods, database, userManager) {
        this.database = database;
        this.methods = methods;
        this.userManager = userManager;
    }

    async callEndpointMethod(endpoint, req, res) {
        const returnVal = function (response) {
            res.send(response);
            return response; // For testing
        }.bind(this);
        const returnFuncResult = async function (userName, params, context) {
            const response = await method.function(userName, params, context);
            return returnVal(response);
        }.bind(this);

        const method = this.methods[req.method][endpoint];
        const params = req.body;

        const paramError = this.checkParams(method, params);
        if (paramError != null)
            return returnVal(paramError);

        let cookieName = "session";

        if (endpoint == "login") {
            if (req.method == "POST") {
                let sessionToken = await this.userManager.checkAuth(
                    params.userName,
                    params.password
                );
                if (!sessionToken)
                    return returnVal(this.ERROR.BAD_CREDENTIALS());
                res.cookie(cookieName, sessionToken)
                req.headers.cookie = cookieName + '=' + sessionToken;
            }
            if (req.method == "GET")
                return await returnFuncResult(null, params, this);
        }

        if (req.headers.cookie === undefined)
            return returnVal(this.ERROR.NO_AUTH());

        let sessionToken = req.headers.cookie
            .split('; ')
            .find(c => c.includes(cookieName))
            .replace(cookieName + '=', '');
        let userName = this.userManager.getUserFromToken(sessionToken);
        if (userName == null)
            return returnVal(this.ERROR.UNKNOWN_SESSION_TOKEN()); 

        return await returnFuncResult(userName, params, this);
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
}
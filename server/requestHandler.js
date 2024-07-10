module.exports = class requestHandler {
    database = null;
    methods = null;
    userManager = null;
    ERROR = {
        NO_AUTH: () => "Not authenticated.",
        BAD_CREDENTIALS: () => "Bad username/password combination.",
        MODEL_NOT_EDITABLE: (modelName) => "Given model '" + modelName + "' is not user editable.",
        UNKNOWN_METHOD: (methodName) => "Invalid method name '" + methodName + "'.",
        MISSING_PARAM: (param) => "Missing required parameter '" + param + "'.",
        UNKNOWN_PARAMETER: (param) => "Unknown parameter '" + param + "'.",
        BAD_PARAM_TYPE: (param, expected, given) => "Expected type '" + expected
            + "' for parameter '" + param + "' but got '" + given + "'.",
        UNKNOWN_MODEL_NAME: (modelName) => "Unknown model '" + modelName + "'.",
        UNKNOWN_PATIENT: (patientID) => "Could not find patient with id: '" + patientID + "'.",
    }

    constructor(methods, database, userManager) {
        this.database = database;
        this.userManager = userManager;
        this.methods = methods;
    }

    async callEndpointMethod(endpoint, req, res) { 
        // this.error(this.ERROR.NO_AUTH);
        // tempref: TODO session/persistant login
        const session = req.session; 
        
        const relevantMethods = this.methods[req.method]
        const getMethodNames = Object.keys(relevantMethods);
        if (!getMethodNames.includes(endpoint)) {
            res.send(this.error(this.ERROR.UNKNOWN_METHOD, endpoint));
            return;
        }
        
        const method = relevantMethods[endpoint];
        const params = req.body;
        if (method.params != null) {
            // TODO: Don't do param checks for get requests.
            const paramError = this.checkParams(method, params);
            if (paramError != null) {
                res.send(paramError);
                return;
            }
        }

        const response = await method.function(session, params, this);
        res.send(response);
        return response; // For testing
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
                return this.error(this.ERROR.MISSING_PARAM, required);

        for (const paramName of Object.keys(params)) {
            const givenType = typeof (params[paramName])

            if (allParamNames.includes(paramName)) {
                const expectedType = typeof (allParams[paramName]);

                if (expectedType != givenType)
                    return this.error(this.ERROR.BAD_PARAM_TYPE, paramName, expectedType, givenType)
            } else return this.error(this.ERROR.UNKNOWN_PARAMETER(paramName));
        }
        return null;
    }
}
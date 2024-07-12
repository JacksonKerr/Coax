const assert = require('assert');

async function testEndpoints(db) {
    const endpoints = await require(process.cwd() + "\\server\\endpoints.js");
    const endpointTests = await require(process.cwd() + "\\test\\endpointTests.js");

    // Collate endpoint tests and functions into a single object.
    describe('Endpoints:', function () {
        for (const endpointType of Object.keys(endpoints)) {
            for (const methodName of Object.keys(endpoints[endpointType])) {
                let endpointFunction = endpoints[endpointType][methodName].function;
                const functionTests = endpointTests[endpointType][methodName];

                const testName = endpointType + ": " + methodName;
                if (functionTests?.length == null)
                    describe(testName,
                        () => it('Endpoint not listed in endpointTests.js')
                    );
                else describe(
                    testName,
                    () => functionTests.forEach(test => { test(endpointFunction, db); })
                );
            }
        }
    });
}

async function testAuthentication(db, um) {
    
}

async function main() {
    const { app, db, um } = await require(process.cwd() + '\\index.js');

    await testEndpoints(db);
    await testAuthentication(db, um);
}
main();
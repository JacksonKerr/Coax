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
                    () => functionTests.forEach(
                        test => { test(endpointFunction, db); }
                    )
                );
            }
        }
    });
}

async function testAuthentication(db, um) {
    const helpers = await require(process.cwd() + "\\server\\helperFunctions.js");

    describe('Authentication:', function () {
        it("newSession",
            async function () {
                let testUsers = [
                    { userName: "TestUser1", password: "password1" },
                    { userName: "TestUser2", password: "password2" },
                    { userName: "TestUser3", password: "password3" },
                ];
                testUsers.forEach(async u =>
                    await helpers.db(
                        db,
                        `INSERT INTO User (UserName, Password) VALUES 
                        ('` + u.userName + `', '` + u.password + `');`
                    )
                );
                const authedUser1 = testUsers[1];
                const loginToken1 = await um.newSession(authedUser1.userName, authedUser1.password);

                const authedUser2 = testUsers[2];
                await um.newSession(authedUser2.userName, authedUser2.password);

                let user1AuthRecord = um.authedUsers[loginToken1];
                assert.equal(authedUser1.userName, user1AuthRecord.userName);
            }
        );
    });
}

async function main() {
    const { app, db, um } = await require(process.cwd() + '\\index.js');

    await testEndpoints(db);
    await testAuthentication(db, um);
}
main();
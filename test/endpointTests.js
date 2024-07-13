module.exports = {
    POST: {
        login: [],
        sendMessage: [
            function (endpointFunction, db) {
                const returnVal = endpointFunction(
                    "userName",
                    {},
                    { database: db }
                );

                describe('TestName', function () {

                    // it('tempref',
                    //     function () {
                    //         assert.equal(1, 2);
                    //     }
                    // );
                });
            }
        ],
    },
    GET: {
        home: [],
        login: [],
        users: [],
        chat: [],
        messages: [],
    },
};
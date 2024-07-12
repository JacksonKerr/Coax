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

                    it('should return -1 when the value is not present',
                        function () {
                            assert.equal(1, 2);
                        }
                    );
                });
            }
        ],
    },
    GET: {
        home: [],
        login: [],
        users: [],
        chat: [],
        //messages: [],
    },
};
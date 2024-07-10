module.exports = [
    // TODO: Password hashing/etc
    `CREATE TABLE User (
        UserName VARCHAR(25) UNIQUE PRIMARY KEY,
        [Password] VARCHAR(25)
    );`,
    `CREATE TABLE Message (
        ID VARCHAR(25) UNIQUE PRIMARY KEY,
        Msg VARCHAR(255),
        fromUser VARCHAR(25),
        toUser VARCHAR(25),
        [TimeStamp] TimeStamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(fromUser) REFERENCES User(userName),
        FOREIGN KEY(toUser) REFERENCES User(userName)
    );`,
    `INSERT INTO User (UserName, Password) VALUES ('Jackson', 'password');`,
    `INSERT INTO User (UserName, Password) VALUES ('Justiva', 'password');`,
    `INSERT INTO Message (Msg, fromUser, toUser) VALUES ('Test Message1', 'Jackson', 'Justiva');`,
    `INSERT INTO Message (Msg, fromUser, toUser) VALUES ('Test Message2', 'Justiva', 'Jackson');`,
    `INSERT INTO Message (Msg, fromUser, toUser) VALUES ('Test Message3', 'Jackson', 'Justiva');`,
    `INSERT INTO User (UserName, Password) VALUES ('Chris', 'password');`,
];


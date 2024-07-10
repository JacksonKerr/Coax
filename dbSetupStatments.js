module.exports = [
    // TODO: Password hashing/etc
    `CREATE TABLE User (
        UserName VARCHAR(25) UNIQUE PRIMARY KEY,
        [Password] VARCHAR(25)
    );`,
    `CREATE TABLE ChatGroup (
        ID VARCHAR(25) UNIQUE PRIMARY KEY
    );`,
    `CREATE TABLE ChatUser (
        UserID INT,
        ChatGroupID INT,
        FOREIGN KEY(ChatGroupID) REFERENCES ChatGroup(ID),
        FOREIGN KEY(UserID) REFERENCES User(ID)
    );`,
    `CREATE TABLE ChatMessage (
        ID VARCHAR(25) UNIQUE PRIMARY KEY,
        Msg VARCHAR(255),
        ChatGroupID INT,
        [TimeStamp] TimeStamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ChatGroupID) REFERENCES ChatGroup(ID)
    );`,
    `INSERT INTO User (UserName, Password) VALUES ('JacksonKerr', 'JacksonKerrPassword');`
];


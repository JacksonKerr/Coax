const fs = require("fs");

module.exports = {
    db(db, query){
        return new Promise(function(resolve,reject){
            db.all(query, function(err,rows){
               if(err){return reject(err);}
               resolve(rows);
             });
        });
    },
    readStaticFileAsString(fileName) {
        const file = fs.readFileSync(process.cwd() + "\\static\\" + fileName + ".html")
        return file.toString();
    },
}
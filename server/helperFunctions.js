const fs = require("fs");

module.exports = {
    async db(db, query){
        return new Promise(function(resolve,reject){
            db.all(query, function(err,rows){
               if(err){return reject(err);}
               resolve(rows);
             });
        });
    },
    readStaticFileAsString(fileName) {
        const file = fs.readFileSync(process.cwd() + "\\static\\" + fileName)
        return file.toString();
    },
    getJsRedirect(endpoint) {
        return "<script>window.location.href = '/" + endpoint + "'</script>";
    }
}
async function main() {
    const index = await require(process.cwd() + '\\server\\index.js');
    
    
    
    const { app, db, um } = index;



    console.log("Begin testing here");
}
main();
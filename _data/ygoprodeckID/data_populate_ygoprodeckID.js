const fs = require('node:fs');
const data = require('./cardinfo-13598-20-03-25.json');

// https://ygoprodeck.com/api-guide/
function main() {
    console.log("Database length:" + data['data'].length);
    const cards = data['data'];
    const sqlGenerated = cards.map((element) => {
        const id = element['id'];
        const nameEN = element['name'].replaceAll("'","\\'");
        return `UPDATE CARDS SET ygoprodeckID = '${id}' WHERE name = '${nameEN}';`
    }).join('\n');
    fs.writeFile(__dirname + '/queries.sql', sqlGenerated, err => {
        if (err) {
            console.error(err);
        } else {
            console.log("OK");
        }
    });
}

main();
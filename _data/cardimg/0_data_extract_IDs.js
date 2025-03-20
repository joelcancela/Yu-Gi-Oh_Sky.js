const fs = require('node:fs');
const data = require('./cardsDatabase.json');

function main() {
    console.log("Database length:" + data.length);
    const cards = data;
    const allIDS = cards.map((element) => {
        return element['ygoprodeckID'];
    }).join('\n');
    fs.writeFile(__dirname + '/ids.raw', allIDS, err => {
        if (err) {
            console.error(err);
        } else {
            console.log("OK");
        }
    });
}

main();
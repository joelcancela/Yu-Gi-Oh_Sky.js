const fs = require('node:fs');
const https = require('node:https');

async function main() {
    const allFileContents = fs.readFileSync(__dirname + '/ids.rawt', 'utf-8');
    const allLines = allFileContents.split(/\r?\n/);
    for (const line of allLines) {
        const URL = `https://images.ygoprodeck.com/images/cards/${line}.jpg`;
        downloadImage(URL, line);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

function downloadImage(URL, filename) {
    const file = fs.createWriteStream(__dirname + '/../../img/card/' +`${filename}.jpg`);
    const request = https.get(URL, function (response) {
        response.pipe(file);

        file.on("error", ()=> {
            console.error(filename);
        });

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
        });
    });
}

main();
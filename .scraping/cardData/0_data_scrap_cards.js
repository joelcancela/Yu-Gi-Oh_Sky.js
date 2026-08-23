const fs = require('node:fs');
const https = require('node:https');

// CALL InsertCard(`name_fr`, `name`, `card_type`, `quantity`, `family`, `atk`, `def`, `level`, `text`, `property`, `type/0`, `type/1`, `type/2`, `type/3`, `deck/0`, `deck/1`, `deck/2`, `ygoprodeckID`)


const cardData = [];

async function main() {
    const allFileContents = fs.readFileSync(__dirname + '/ids.rawt', 'utf-8');
    const allLines = allFileContents.split(/\r?\n/);
    for (const line of allLines) {
        const URL = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${line}`;
        const URLFR = URL + '&language=fr';
        console.log(URLFR);
        try {
            await downloadCardData(URLFR, line);
        } catch (e) {
            console.error("ERROR: ", e);
            console.log("Retry with EN version");
            try {
                await downloadCardData(URL, line);
            } catch (e) {
                console.error("ERROR: ", e);
                console.error("Failed again for " + line);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    fs.writeFileSync(__dirname + '/output/' + `output.rawt`, JSON.stringify(cardData, null, '\n'));
}

async function downloadCardData(URL, cardID) {

    const response = await fetch(URL);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }


    const json = await response.json();
    console.log(json);
    const actualData = json.data[0];
    cardData.push(`${actualData.name + ',' + (actualData.name_en || actualData.name) + ',' + actualData.frameType + ',' + 1 + ',' + actualData.attribute?.toLowerCase() + ',' + actualData.atk + ',' + actualData.def + ',' + actualData.level + ',' + actualData.desc + ',' + actualData.race + ',' + actualData.typeline?.[0] + ',' + actualData.typeline?.[1] + ',' + actualData.typeline?.[2] + ',' + 'NULL,NULL,NULL,NULL,' + cardID.toString()}`);
}

main();
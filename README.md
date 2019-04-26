# Yu-Gi-Oh_Sky.js

[![Language](https://img.shields.io/badge/language-javascript-yellow.svg)]() [![Project Status](https://img.shields.io/badge/status-online-brightgreen.svg)]()

Yu-Gi-Oh_Sky.js is a JS script used to display the Yu-Gi-Oh! cards that I own listed on a MySQL database.

## Features
* Search a card by name (english or french) or description
* Sort cards by name, ATK, DEF, level, quantity owned, card type
* Filter cards by card type (monster, spell, trap), monster types, family, ATK, DEF, level, quantity and property
* See the description of a card (in french)
* See related cards for a card

## Disclaimer

**Yu-Gi-Oh!** is a trademark of Kazuki Takahashi, Konami © 1996-2017.

This project is in no way affiliated with Konami.

The data displayed by the script is purely informational and may not always be accurate or even correct.

The data is provided as received from the Yu-Gi-Oh! Prices API, Yu-Gi-Oh! Wikia, and the owner of this application takes no responsibility for any issues that may arise from its users taking this information for granted.

## Mentions

This project uses :
* [filter.js](https://github.com/jiren/filter.js) by jiren (MIT License included) (slightly edited)
* [Yu-Gi-Oh! Prices](https://yugiohprices.com/) [Public API](http://docs.yugiohprices.apiary.io/#) for most of the cards info.
* [Yu-Gi-Oh! Wikia](http://yugioh.wikia.com) for the cards translation and for the support cards links.
* [YGOPRODeck API](https://db.ygoprodeck.com/api-guide-v3/) for the TCG ban list status.

## Notes

The JSON Structure used as *"database"*

```JSON
[
    {
    "name_fr": "7",
    "name": "7",
    "card_type": "spell",
    "quantity": "1",
    "family": "",
    "atk": "",
    "def": "",
    "level": "",
    "text": "When there are 3 face-up \"7\" cards on your side of the field, draw 3 cards from your Deck. Then destroy all \"7\" cards. When this card is sent directly from the field to your Graveyard, increase your Life Points by 700 points.",
    "property": "Continuous",
    "decks": false,
    "types": false
    }
]
```

## License

This is released under the MIT license.

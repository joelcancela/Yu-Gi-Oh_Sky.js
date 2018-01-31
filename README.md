# Yu-Gi-Oh_Sky.js

[![Build Status](https://img.shields.io/travis/rust-lang/rust.svg)]() [![Project Status](https://img.shields.io/badge/status-WIP-blue.svg)]() [![Language](https://img.shields.io/badge/language-javascript-yellow.svg)]()

Yu-Gi-Oh_Sky.js is a JS script used to display the Yu-Gi-Oh! cards that I own listed on a MySQL database.

## Disclaimer

**Yu-Gi-Oh!** is a trademark of Kazuki Takahashi, Konami © 1996-2017.

This project is in no way affiliated with Konami.

The data displayed by the script is purely informational and may not always be accurate or even correct.

The data is provided as received from the Yu-Gi-Oh! Prices and the owner of this application takes no responsibility for any issues that may arise from its users taking this information for granted.

## Mentions

This project uses the following libraries:
- [filter.js](https://github.com/jiren/filter.js) by jiren (MIT License) (Slightly Edited)

The Yu-Gi-Oh! Cards information are provided via the [Yu-Gi-Oh! Prices](https://yugiohprices.com/) [Public API](http://docs.yugiohprices.apiary.io/#).

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
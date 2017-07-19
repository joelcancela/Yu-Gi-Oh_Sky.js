var IMG_API_URL = "http://yugiohprices.com/api/card_image/";
//Spreadsheet settings
var CSV_URL = "https://docs.google.com/spreadsheets/d/1WEsIrHSEmGXQYVAUw1rqFhTqllE6n-am9mx15FuhUNo/pubhtml";
var yu_gi_oh_sheet = "Yu-Gi-Oh";
var yu_gi_oh_sheet_stats = "Yu-Gi-Oh Stats";
var img_card_404 = "./img/yugioh_404.png";
var cards_table;
var cards_stats;
var cards_are_retrieved = false;
// JSON cards array keys
var cards_table__key_name_fr = "Nom";
var cards_table__key_name_en = "Nom Anglais";
var cards_table__key_decks_array = "Decks";
var cards_table__key_quantity = "Qte";
var cards_table__key_card_type = "Type";
// JSON cards stats keys
var cards_stats__key_fusion_nb = "Fusion";
var cards_stats__key_token_nb = "Jeton";
var cards_stats__key_magic_nb = "Magie";
var cards_stats__key_monster_nb = "Monstre";
var cards_stats__key_total_cards_nb = "Nb de cartes";
var cards_stats__key_total_unique_cards_nb = "Nb de cartes uniques";
var cards_stats__key_trap_nb = "Piège";
var cards_stats__key_ritual_nb = "Rituel";
var cards_stats__key_synchro_nb = "Synchro";
var cards_stats__key_xyz_nb = "XYZ";
// Other variables
var isIE; // Checks if IE is the browser
var filterJS; // List.js instance
var sortOptions; //Sorting

window.addEventListener('DOMContentLoaded', init);

function init() {
    retrieve_and_parse_csv();
    init_suite();
}

function init_suite() {
    if (!cards_are_retrieved) {
        setTimeout(init_suite, 100);
        return;
    }
    isIE = detectIE();
    initEvents();
    add_multi_deck_support();
    create_filters();
}

function add_multi_deck_support() {
    for (var i = 0; i < cards_table.length; i++) {
        cards_table[i][cards_table__key_decks_array] = cards_table[i][cards_table__key_decks_array].split(', ');
    }
    // console.dir(cards_table);
}

function retrieve_and_parse_csv() {
    Tabletop.init({
        key: CSV_URL,
        callback: function (data) {
            cards_table = data[yu_gi_oh_sheet].elements;
            cards_stats = data[yu_gi_oh_sheet_stats].elements[0];
            cards_are_retrieved = true;
        },
        simpleSheet: false
    });
}


function create_img(src, alt, title) {
    var img = isIE ? new Image() : document.createElement('img');
    img.className = "yugioh_card";
    img.src = src;
    img.onerror = function () {
        img.src = img_card_404;
        img.className = "yugioh_card missing";
    };
    img.onclick = function () {
        window.open(this.src);
    };
    if (alt !== null) img.alt = alt;
    if (title !== null) img.title = title;
    return img;
}

function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

function create_filters() {
    filterJS = FilterJS(cards_table, '#cards_table', {
        template: '#card_template',
        search: {
            ele: '#searchbox',
            fields: [cards_table__key_name_fr, cards_table__key_name_en],
            start_length: 1,
            timeout: 100
        },
        criterias: [{field: 'Decks', ele: '#deck_criteria input:checkbox', all: 'all_decks'}],
        filter_on_init: true, // Default filter_on_init is false
        callbacks: {
            afterFilter: function (result) {
                $('#cards_number').text(result.length);
            },
            shortResult: shortResult,
            afterAddRecords: function () {
                display_card_images();
            }
        }
    });
}

function display_card_images() {
    for (var i = 0; i < cards_table.length; i++) {
        var id = i + 1;
        var element = cards_table[i];
        var img = create_img(IMG_API_URL + element[cards_table__key_name_en], element[cards_table__key_name_fr], element[cards_table__key_name_fr]);
        document.getElementById("fjs_" + id).appendChild(img);
    }

}

function initEvents() {

    $('#deck_criteria').find(':checkbox').prop('checked', false); //All checkboxes are set to false
    $("#l-sort-by").on('change', function (e) {
        sortOptions = buildSortOptions($(this).val());
        filterJS.filter();
        e.preventDefault();
    });
}

//Beta sort


function shortResult(query) {
    if (sortOptions) {
        query.order(sortOptions);
    }
}

function buildSortOptions(name) {
    if (name === 'name_asc') {
        return {'Nom': 'asc'}
    }

    if (name === 'name_desc') {
        return {'Nom': 'desc'}
    }
}




/*
 * YuGiOh.js
 * 1.0.0 (2017-07-28)
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Copyright 2017 Joël CANCELA VAZ[joel.cancelavaz@gmail.com]
 * This is not affiliated with Konami.
 */

// Card API
var IMG_API_URL = "http://yugiohprices.com/api/card_image/";
var CORS_BYPASS_URL = "http://yugioh.joelcancela.fr/cors.php?card=";
// Spreadsheet settings
var CSV_URL = "https://docs.google.com/spreadsheets/d/1WEsIrHSEmGXQYVAUw1rqFhTqllE6n-am9mx15FuhUNo/pubhtml";
var yu_gi_oh_sheet = "Yu-Gi-Oh";
var yu_gi_oh_sheet_stats = "Yu-Gi-Oh Stats";
var img_card_404 = "./img/yugioh_404.png";
var cards_table; // Card sheet
var cards_stats; // Card stats sheet
// Events
var cards_are_retrieved = false;
// JSON cards array keys
var cards_table__key_name_fr = "Nom";
var cards_table__key_name_fr_sort = "Nom_FR_Sort";
var cards_table__key_name_en = "Nom Anglais";
var cards_table__key_decks_array = "Decks";
var cards_table__key_quantity = "Qte";
var cards_table__key_card_type = "Type";
var cards_table__key_picture_link = "Image";
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
var sortOptions = {}; //Sorting

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
    initEvents();
    add_multi_deck_support_and_images_links();
    update_cards_number(cards_table);
    create_filters();
    //for (var i = 0; i < cards_table.length; i++) {
    //get_card_data_and_merge(cards_table[i][cards_table__key_name_en]);
    // }

}

// function get_card_data_and_merge(card_name) {
//     $.getJSON(CORS_BYPASS_URL + card_name, function (data) {
//         // console.log(card_name);
//         //arr.push(data);
//     }).fail(function (jqXHR, textStatus, errorThrown) {
//         console.log(card_name);
//         console.log(errorThrown);
//     });
// }

function add_multi_deck_support_and_images_links() {
    for (var i = 0; i < cards_table.length; i++) {
        var element = cards_table[i];
        element[cards_table__key_decks_array] = element[cards_table__key_decks_array].split(', ');
        element[cards_table__key_picture_link] = IMG_API_URL + element[cards_table__key_name_en].replace(/"/g, "_");
        element[cards_table__key_name_fr_sort] = cleanUpSpecialChars(element[cards_table__key_name_fr]);
    }
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


function create_filters() {

    window.FJS = FilterJS(cards_table, '#cards_table', {
        template: '#card_template',
        search: {
            ele: '#searchbox', fields: ['Nom'],
            start_length: 1
        },

        criterias: [{field: 'Decks', ele: '#deck_criteria input:checkbox'}, {
            field: 'Type',
            ele: '#type_criteria input:checkbox'
        }, {
            field: 'Qte',
            ele: '#input_default',
            type: 'range'
        }],
        pagination: {
            container: '#pagination',
            paginationView: "#pagination_template",
            visiblePages: 5,
            perPage: {
                values: [15, 30, 60, 'Toutes'],
                container: '#per_page'
            }
        },
        callbacks: {
            afterFilter: update_cards_number,
            shortResult: shortResult
        }
    });
}

function update_cards_number(result) {
    $('#cards_number').text(result.length);
}

function imgError(image) {
    image.onerror = "";
    image.src = img_card_404;
    return true;
}

function initEvents() {

    $('#deck_criteria').find(':checkbox').prop('checked', true);
    $('#type_criteria').find(':checkbox').prop('checked', true);
    $("#l-sort-by").on('change', function (e) {
        sortOptions = buildSortOptions($(this).val());
        FJS.filter();
        e.preventDefault();
    });
}


function shortResult(query) {
    if (sortOptions) {
        query.order(sortOptions);
    }
}

function cleanUpSpecialChars(str) {
    str = str.replace(/[ÀÁÂÃÄÅ]/g, "A");
    return str.replace(/[ÈÉÊË]/g, "E");
}

function buildSortOptions(name) {
    if (name === 'name_asc') {
        return {'Nom_FR_Sort': 'asc'};
    }

    if (name === 'name_desc') {
        return {'Nom_FR_Sort': 'desc'};
    }

    if (name === 'type') {
        return {
            'Type': 'custom',
            'custom_order': ['Monstre', 'Rituel', 'Fusion', 'Synchro', 'XYZ', 'Jeton', 'Magie', 'Piège'],
            'sort_function': function (a, b, ordering) {
                return (ordering[a.Type] - ordering[b.Type]) || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
            }
        };
    }
}




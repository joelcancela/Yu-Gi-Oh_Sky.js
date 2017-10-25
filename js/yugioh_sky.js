/*
 * YuGiOh.js
 * 1.1.0 (2017-10-24)
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Copyright 2017 Joël CANCELA VAZ[joel.cancelavaz@gmail.com]
 * This is not affiliated with Konami.
 */

// Card API & Database links
var IMG_API_URL = "http://yugiohprices.com/api/card_image/";
var DATABASE_CARDS = "../res/database.json";
// Spreadsheet settings
var CSV_URL = "https://docs.google.com/spreadsheets/d/1WEsIrHSEmGXQYVAUw1rqFhTqllE6n-am9mx15FuhUNo/pubhtml";
var yu_gi_oh_sheet = "Yu-Gi-Oh";
var yu_gi_oh_sheet_stats = "Yu-Gi-Oh Stats";
var img_card_404 = "./img/yugioh_404.png";
var cards_table; // Card sheet
var cards_stats; // Card stats sheet
// Events
var cards_are_retrieved = false;
var all_infos_merged = false;
// JSON cards table keys
var cards_table__key_atk = "atk";
var cards_table__key_card_type = "card_type"; // Monster, Spell, Trap or Token
var cards_table__key_decks_array = "decks";
var cards_table__key_def = "def";
var cards_table__key_family = "family"; // Monster family (Earth, Wind, Water, Fire, Dark, Light)
var cards_table__key_picture_link = "img_link";
var cards_table__key_level = "level";
var cards_table__key_name = "name";
var cards_table__key_name_fr = "name_fr";
var cards_table__key_name_fr_sort = "name_fr_sorting";
var cards_table__key_property = "property"; // Spell or Trap type
var cards_table__key_quantity = "quantity";
var cards_table__key_text = "text"; // Description text (english)
var cards_table__key_monster_type = "type"; // Monster type, Effect, Fusion, Ritual, Synchro, Token, XYZ
// JSON cards stats keys
//// card_type
var cards_stats__key_monster = "monster";
var cards_stats__key_spell = "spell";
var cards_stats__key_trap = "trap";
var cards_stats__key_token_lowercase = "token";
//// type
var cards_stats__key_fusion = "Fusion";
var cards_stats__key_ritual = "Ritual";
var cards_stats__key_synchro = "Synchro";
var cards_stats__key_token = "Token";
var cards_stats__key_xyz = "XYZ";
//// stats
var cards_stats__key_total_cards_nb = "cards_number";
var cards_stats__key_total_unique_cards_nb = "unique_cards_number";
// Other variables
var sortOptions = {}; // Sorting
//// Sorting types
var sorting__name_asc = "name_asc";
var sorting__name_desc = "name_desc";
var sorting__card_type = "card_type";


window.addEventListener('DOMContentLoaded', init);

function init() {
    retrieve_and_parse_csv();//Google spreadsheet
    init_suite();
}

function setCheckboxesStatus() {
    $('#deck_criteria').find(':checkbox').prop('checked', true);
}

function init_suite() {
    if (!cards_are_retrieved) {
        setTimeout(init_suite, 100);
        return;
    }
    setCheckboxesStatus();
    add_multi_deck_support_and_images_links();
    get_cards_data_and_merge();
    update_cards_number(cards_table);
    create_filters();
    initEvents();
}

function get_cards_data_and_merge() {
    $.getJSON(DATABASE_CARDS, function (data) {
        for (var currentIteration = 0; currentIteration < cards_table.length; currentIteration++) {
            $.extend(cards_table[currentIteration], data[currentIteration]);
            var current_card_type = cards_table[currentIteration][cards_table__key_monster_type];
            if (current_card_type !== null) {
                cards_table[currentIteration][cards_table__key_monster_type] = current_card_type.split(" / ");
            } else{
                cards_table[currentIteration][cards_table__key_monster_type] = [];
            }
        }
        all_infos_merged = true;
    }).fail(function () {
        console.log("Can't retrieve JSON cards database");
    });

    console.dir(cards_table);
}

function add_multi_deck_support_and_images_links() {
    for (var i = 0; i < cards_table.length; i++) {
        var element = cards_table[i];
        element[cards_table__key_decks_array] = element[cards_table__key_decks_array].split(', ');// Split decks
        element[cards_table__key_picture_link] = IMG_API_URL + element[cards_table__key_name].replace(/"/g, "_");// Create img_link
        element[cards_table__key_name_fr_sort] = cleanUpSpecialChars(element[cards_table__key_name_fr]);// Create name_fr_sorting
    }
}


function retrieve_and_parse_csv() {
    // noinspection JSUnusedGlobalSymbols
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

    if (!all_infos_merged) {
        setTimeout(create_filters, 100);
        return;
    }


    window.FJS = FilterJS(cards_table, '#cards_table', {
        template: '#card_template',
        search: {
            ele: '#searchbox', fields: [cards_table__key_name_fr, cards_table__key_name],
            start_length: 1
        },
        criterias: [
            {field: cards_table__key_decks_array, ele: '#deck_criteria input:checkbox'},
            {field: cards_table__key_card_type, ele: '#card_type_criteria input:checkbox'},
            {field: cards_table__key_monster_type, ele: '#type_criteria input:checkbox'},
            {field: cards_table__key_quantity, ele: '#input_default', type: 'range'}],//TODO Slider quantity
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
    var sort = {};
    if (name === sorting__name_asc) {
        sort[cards_table__key_name_fr_sort] = 'asc';
        return sort;
    }

    if (name === sorting__name_desc) {
        sort[cards_table__key_name_fr_sort] = 'desc';
        return sort;
    }

    if (name === sorting__card_type) {
        sort[cards_table__key_card_type] = 'custom';
        var custom_order = [];
        custom_order.push(cards_stats__key_monster, cards_stats__key_spell, cards_stats__key_trap, cards_stats__key_token_lowercase);
        sort['custom_order'] = custom_order;
        sort['sort_function'] = function (a, b, ordering) {
            return (ordering[a[cards_table__key_card_type]] - ordering[b[cards_table__key_card_type]]) || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
        };
        return sort;
    }
}




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
    $('#all_types').prop("checked", true);
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
            cards_table[currentIteration][cards_table__key_quantity] = parseInt(cards_table[currentIteration][cards_table__key_quantity]);
            var current_card_type = cards_table[currentIteration][cards_table__key_monster_type];
            var current_card_atk = cards_table[currentIteration][cards_table__key_atk];
            if (current_card_atk === null) {
                cards_table[currentIteration][cards_table__key_atk] = -1;
            }
            if (current_card_type !== null) {
                cards_table[currentIteration][cards_table__key_monster_type] = current_card_type.split(" / ");
            } else {
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
            {field: cards_table__key_card_type, ele: '#card_type_criteria input:radio', all: 'all'},
            {field: cards_table__key_quantity, ele: '#quantity_filter', type: 'range'}],
        pagination: {
            container: '#pagination',
            paginationView: "#pagination_template",
            visiblePages: 5,
            perPage: {
                values: [12, 24, 48, 'Toutes'],
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

function enable_monster_criterias() {
    FJS.addCriteria({field: cards_table__key_atk, ele: '#atk_filter', type: 'range'});
    FJS.addCriteria({field: cards_table__key_def, ele: '#def_filter', type: 'range'});
    FJS.addCriteria({field: cards_table__key_monster_type, ele: '#type_criteria input:checkbox'});
    FJS.addCriteria({field: cards_table__key_family, ele: '#family_criteria input:checkbox'});
    FJS.addCriteria({field: cards_table__key_level, ele: '#level_filter', type: 'range'});
    $('#monster_level').show();
    $('#monster_def').show();
    $('#monster_atk').show();
    $('#monster_family').show();
    $('#monster_type').show();
}

function disable_monster_criterias() {
    FJS.removeCriteria(cards_table__key_atk);
    FJS.removeCriteria(cards_table__key_def);
    FJS.removeCriteria(cards_table__key_monster_type);
    FJS.removeCriteria(cards_table__key_family);
    FJS.removeCriteria(cards_table__key_level);
    $('#monster_level').hide();
    $('#monster_def').hide();
    $('#monster_atk').hide();
    $('#monster_family').hide();
    $('#monster_type').hide();
}

function enable_spell_traps_criterias() {
    FJS.addCriteria({field: cards_table__key_property, ele: '#property_criteria input:checkbox'});
    $('#properties').show();
}


function disable_spell_traps_criterias() {
    FJS.removeCriteria(cards_table__key_property);
    $('#properties').hide();
}

function initEvents() {

    $("#all_types").change(function () {
        if (this.checked) {
            disable_monster_criterias();
            disable_spell_traps_criterias();
        }
    });


    $("#monster").change(function () {
        if (this.checked) {
            enable_monster_criterias();
            disable_spell_traps_criterias();
        } else {
            disable_monster_criterias();
        }
    });


    $("#spell").change(function () {
        if (this.checked) {
            enable_spell_traps_criterias();
            disable_monster_criterias();
        } else {
            disable_spell_traps_criterias();
        }
    });

    $("#trap").change(function () {
        if (this.checked) {
            enable_spell_traps_criterias();
            disable_monster_criterias();
        } else {
            disable_spell_traps_criterias();
        }
    });


    $("#token").change(function () {
        if (this.checked) {
            disable_monster_criterias();
            disable_spell_traps_criterias();
        }
    });


    $("#atk_slider").slider({
        min: 0,
        max: 16000,
        values: [0, 16000],
        step: 100,
        range: true,
        slide: function (event, ui) {
            $("#atk_range_label").html(ui.values[0] + ' - ' + ui.values[1] + ' ATK');
            $('#atk_filter').val(ui.values[0] + '-' + ui.values[1]).trigger('change');
        }
    });

    $("#def_slider").slider({
        min: 0,
        max: 16000,
        values: [0, 16000],
        step: 100,
        range: true,
        slide: function (event, ui) {
            $("#def_range_label").html(ui.values[0] + ' - ' + ui.values[1] + ' DEF');
            $('#def_filter').val(ui.values[0] + '-' + ui.values[1]).trigger('change');
        }
    });

    $("#level_slider").slider({
        min: 0,
        max: 12,
        values: [0, 12],
        step: 1,
        range: true,
        slide: function (event, ui) {
            $("#level_range_label").html('Niveau ' + ui.values[0] + ' - ' + ui.values[1]);
            $('#level_filter').val(ui.values[0] + '-' + ui.values[1]).trigger('change');
        }
    });

    $("#quantity_slider").slider({
        min: 1,
        max: 10,
        values: [1, 10],
        step: 1,
        range: true,
        slide: function (event, ui) {
            $("#quantity_range_label").html(ui.values[0] + ' - ' + ui.values[1] + ' exemplaires');
            $('#quantity_filter').val(ui.values[0] + '-' + ui.values[1]).trigger('change');
        }
    });


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




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
var DATABASE_CARDS = "http://www.joelcancela.fr/services/database_yugiohjs_json";
var IMG_API_URL = "http://yugiohprices.com/api/card_image/";
var img_card_404 = "./img/yugioh_404.png";
var cards_table = [];
// Events
var cards_table_is_ready = false;
var cards_table_is_created = false;
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
var cards_table__key_monster_type = "types"; // Monster type, Effect, Fusion, Ritual, Synchro, Token, XYZ
// JSON cards stats keys
//// card_type
var cards_stats__key_monster = "monster";
var cards_stats__key_spell = "spell";
var cards_stats__key_trap = "trap";
var cards_stats__key_token_lowercase = "token";
// Other variables
var sortOptions = {}; // Sorting
//// Sorting types
var sorting__name_asc = "name_asc";
var sorting__name_desc = "name_desc";
var sorting__atk_asc = "atk_asc";
var sorting__atk_desc = "atk_desc";
var sorting__def_asc = "def_asc";
var sorting__def_desc = "def_desc";
var sorting__level_asc = "level_asc";
var sorting__level_desc = "level_desc";
var sorting__quantity_asc = "quantity_asc";
var sorting__quantity_desc = "quantity_desc";
var sorting__card_type = "card_type";

window.addEventListener('DOMContentLoaded', init);

function init() {
    get_cards_data();
    edit_cards_data();
    update_cards_number(cards_table);
    create_filters();
}


function get_cards_data() {
    $.getJSON(DATABASE_CARDS, function (data) {
        cards_table = data;
        cards_table_is_created = true;
    }).fail(function () {
        console.log("Can't retrieve JSON cards database");
    });
}

function edit_cards_data() {
    if (!cards_table_is_created) {
        setTimeout(edit_cards_data, 100);
        return;
    }
    for (var currentIteration = 0; currentIteration < cards_table.length; currentIteration++) {
        cards_table[currentIteration][cards_table__key_quantity] = parseInt(cards_table[currentIteration][cards_table__key_quantity]);
        cards_table[currentIteration][cards_table__key_atk] = parseInt(cards_table[currentIteration][cards_table__key_atk]);
        cards_table[currentIteration][cards_table__key_def] = parseInt(cards_table[currentIteration][cards_table__key_def]);
        cards_table[currentIteration][cards_table__key_level] = parseInt(cards_table[currentIteration][cards_table__key_level]);
        var current_card_types = cards_table[currentIteration][cards_table__key_monster_type];
        var current_card_decks = cards_table[currentIteration][cards_table__key_decks_array];
        if (!current_card_decks) {
            cards_table[currentIteration][cards_table__key_decks_array] = [""];
        } else {
            cards_table[currentIteration][cards_table__key_decks_array] = cards_table[currentIteration][cards_table__key_decks_array].split(",");
        }
        if (!current_card_types) {
            cards_table[currentIteration][cards_table__key_monster_type] = [""];
        }
        else {
            cards_table[currentIteration][cards_table__key_monster_type] = cards_table[currentIteration][cards_table__key_monster_type].split(",");
        }
        if (cards_table[currentIteration][cards_table__key_name] === "Level Down!?") {
            cards_table[currentIteration][cards_table__key_picture_link] = IMG_API_URL + "Level_Down_%3F";// Level Down?!  //API Screw this up
        } else {
            cards_table[currentIteration][cards_table__key_picture_link] = IMG_API_URL + cards_table[currentIteration][cards_table__key_name].replace(/"/g, "_");// Create img_link
        }

        cards_table[currentIteration][cards_table__key_name_fr_sort] = cleanUpSpecialChars(cards_table[currentIteration][cards_table__key_name_fr]);// Create name_fr_sorting FIXME TO MAKE IT LANGUAGE DEPENDANT
    }
    cards_table_is_ready = true;
}

function create_filters() {

    if (!cards_table_is_ready) {
        setTimeout(create_filters, 100);
        return;
    }
    console.dir(cards_table);


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
    initEvents();
    setCheckboxesStatus();

}

function setCheckboxesStatus() {
    $('#deck_criteria').find(':checkbox').prop('checked', true);
    $('#all_types').prop("checked", true);
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
    FJS.filter();
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
    var custom_order = [];
    if (name === sorting__name_asc) {
        sort[cards_table__key_name_fr_sort] = 'asc';
        return sort;
    }

    if (name === sorting__name_desc) {
        sort[cards_table__key_name_fr_sort] = 'desc';
        return sort;
    }

    if (name === sorting__atk_asc) {
        sort[cards_table__key_atk] = 'custom';
        sort['sort_function'] = function (a, b) {
            if (a[cards_table__key_name_fr] === "Jeton" || a[cards_table__key_atk] === null) {
                if (b[cards_table__key_atk] === a[cards_table__key_atk]) {
                    return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);//0-0 null-null
                } else {
                    if (b[cards_table__key_atk] === null) //0-null
                        return -1;
                    return 1;//0-else
                }
            }
            //else-null else-0
            if (b[cards_table__key_atk] === "Jeton" || b[cards_table__key_atk] === null) {
                return -1;
            }
            return (a[cards_table__key_atk] - b[cards_table__key_atk]) ||
                a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
        };
        return sort;
    }//FIXME

    if (name === sorting__atk_desc) {
        sort[cards_table__key_atk] = 'custom';
        sort['sort_function'] = function (a, b) {
            if (a[cards_table__key_name_fr] === "Jeton" || a[cards_table__key_atk] === null) {
                if (b[cards_table__key_atk] === a[cards_table__key_atk] && a[cards_table__key_name_fr] !== "Jeton") {
                    return (a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]));//0-0 null-null
                } else {
                    if (b[cards_table__key_atk] === null) //0-null
                        return -1;
                    return 1;//0-else
                }
            }
            //else-null else-0
            if (b[cards_table__key_name_fr] === "Jeton" || b[cards_table__key_atk] === null) {
                return -1;
            }
            return ((a[cards_table__key_atk] - b[cards_table__key_atk])) * -1 ||
                a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
        };
        return sort;
    }//FIXME

    if (name === sorting__def_asc) {
        sort[cards_table__key_def] = 'custom';
        sort['sort_function'] = function (a, b) {
            console.log(a[cards_table__key_name_fr] + "" + b[cards_table__key_name_fr]);
            if (a[cards_table__key_name_fr] === "Jeton" || a[cards_table__key_def] === null) {
                if (b[cards_table__key_def] === a[cards_table__key_def] && a[cards_table__key_name_fr] !== "Jeton") {
                    console.log("398 normal compare");
                    return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);//0-0 null-null
                } else {
                    // if (b[cards_table__key_name_fr] === "Jeton") { //null-
                    //     console.log("401 -1");
                    //     return -1;
                    // }
                    if (b[cards_table__key_def] === null) { //0-null
                        console.log("405 -1");
                        return -1;
                    }
                    console.log("409 1");
                    return 1;//0-else
                }
            }
            //else-null else-0
            if (b[cards_table__key_name_fr] === "Jeton" || b[cards_table__key_def] === null) {
                console.log("415 -1");
                return -1;
            }
            console.log("else return");
            return (a[cards_table__key_def] - b[cards_table__key_def]) ||
                a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
        };
        return sort;
    }//FIXME

    if (name === sorting__def_desc) {
        sort[cards_table__key_def] = 'custom';
        sort['sort_function'] = function (a, b) {
            if (a[cards_table__key_name_fr] === "Jeton" || a[cards_table__key_def] === null) {
                if (b[cards_table__key_def] === a[cards_table__key_def] && a[cards_table__key_name_fr] !== "Jeton") {
                    return (a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]));//0-0 null-null
                } else {
                    if (b[cards_table__key_def] === null) //0-null
                        return -1;
                    return 1;//0-else
                }
            }
            //else-null else-0
            if (b[cards_table__key_name_fr] === "Jeton" || b[cards_table__key_def] === null) {
                return -1;
            }
            return ((a[cards_table__key_def] - b[cards_table__key_def])) * -1 ||
                a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
        };
        return sort;
    }//FIXME

    if (name === sorting__level_asc) {
        sort[cards_table__key_level] = 'custom';
        sort['sort_function'] = function (a, b) {
            if (a[cards_table__key_level] === 0 || a[cards_table__key_level] === null) {
                if (b[cards_table__key_level] === a[cards_table__key_level]) {
                    return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);//0-0 null-null
                } else {
                    if (b[cards_table__key_level] === 0) //null-0
                        return -1;
                    if (b[cards_table__key_level] === null) //0-null
                        return -1;
                    return 1;//0-else
                }
            }
            //else-null else-0
            if (b[cards_table__key_level] === 0 || b[cards_table__key_level] === null) {
                return -1;
            }
            return (a[cards_table__key_level] - b[cards_table__key_level]) ||
                a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
        };
        return sort;
    }//FIXME

    if (name === sorting__level_desc) {
        sort[cards_table__key_level] = 'custom';
        sort['sort_function'] = function (a, b) {
            if (a[cards_table__key_level] === 0 || a[cards_table__key_level] === null) {
                if (b[cards_table__key_level] === a[cards_table__key_level]) {
                    return (a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]));//0-0 null-null
                } else {
                    if (b[cards_table__key_level] === 0) //null-0
                        return -1;
                    if (b[cards_table__key_level] === null) //0-null
                        return -1;
                    return 1;//0-else
                }
            }
            //else-null else-0
            if (b[cards_table__key_level] === 0 || b[cards_table__key_level] === null) {
                return -1;
            }
            return ((a[cards_table__key_level] - b[cards_table__key_level])) * -1 ||
                a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
        };
        return sort;
    }//FIXME

    if (name === sorting__quantity_asc) {
        sort[cards_table__key_quantity] = 'asc';
        return sort;
    }

    if (name === sorting__quantity_desc) {
        sort[cards_table__key_quantity] = 'desc';
        return sort;
    }

    if (name === sorting__card_type) {
        sort[cards_table__key_card_type] = 'custom';
        custom_order.push(cards_stats__key_monster, cards_stats__key_spell, cards_stats__key_trap, cards_stats__key_token_lowercase);
        sort['custom_order'] = custom_order;
        sort['sort_function'] = function (a, b, ordering) {
            return (ordering[a[cards_table__key_card_type]] - ordering[b[cards_table__key_card_type]]) || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
        };
        return sort;
    }
}

/**
 *  MODAL
 */



function traduce(element) {//FIXME
    if (element === "monster") {
        return "Monstre";
    } else if (element === "spell") {
        return "Magie";
    }
    else if (element === "trap") {
        return "Piège";
    } else if (element === "token") {
        return "Jeton";
    } else if (element === "earth") {
        return "Terre";
    }
}

function display_card_modal(card_fid) {
    var card_modal = cards_table[card_fid - 1];
    var html = '<div id="cardModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
    html += '<div class="modal-dialog modal-lg">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<a class="close" data-dismiss="modal">×</a>';
    html += '<h4>' + card_modal[cards_table__key_name_fr] + '</h4>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div class="row center-block">';
    html += '<div class="col-md-5">';// col1
    html += "<img class='img-responsive' src=\"" + card_modal[cards_table__key_picture_link] + "\"" + " onerror='imgError(this);'>";//TODO
    html += '</div>'; // col 1
    html += '<div class="col-md-6">'; //col 2
    html += "<br><strong>" + "Nom anglais: " + "</strong>";
    html += "<span>" + card_modal[cards_table__key_name] + "</span><br><br>";
    html += "<strong>" + "Type de carte: " + "</strong>";
    html += "<span>" + traduce(card_modal[cards_table__key_card_type]) + " </span>";
    if (card_modal[cards_table__key_card_type] === "monster") {//Monster
        html += "<br><br><strong>" + "Niveau: " + "</strong>";
        for (var i = 0; i < parseInt(card_modal[cards_table__key_level]); i++) {
            html += "</span><img class='icon_level' src='/img/level/level.svg' onerror='this.src=''>";
        }
        html += "<br><br><strong>" + "ATK: " + "</strong>";
        html += "<span>" + card_modal[cards_table__key_atk] + "</span><br><br>";
        html += "<strong>" + "DEF: " + "</strong>";
        html += "<span>" + card_modal[cards_table__key_def] + "</span><br><br>";
        html += "<strong>" + "Type(s): " + "</strong>";
        html += "<span>" + card_modal[cards_table__key_monster_type].join("/") + "</span><br><br>";
        html += "<strong>" + "Élement: " + "</strong>";
        html += "<span>" + traduce(card_modal[cards_table__key_family]) + " </span><img class='icon' src='img/attribute/" + card_modal[cards_table__key_family] + ".svg' onerror='this.src=''><br><br>";
        html += "<strong>" + "Texte: " + "</strong>";
        html += "<span>" + card_modal[cards_table__key_text] + "</span>";
    } else if (card_modal[cards_table__key_card_type] !== "token") {//Spells and Traps
        html += "<img class='icon' src='img/card_type/" + card_modal[cards_table__key_card_type] + ".svg' onerror='this.src=''><br><br>";
        html += "<strong>" + "Propriété: " + "</strong>";
        html += "<span>" + card_modal[cards_table__key_property] + " </span><img class='icon' src='img/property/" + card_modal[cards_table__key_property] + ".svg' onerror='this.src=''><br><br>";
        html += "<strong>" + "Texte: " + "</strong>";
        html += "<span>" + card_modal[cards_table__key_text] + "</span>";
    }
    html += "<br><br><strong>" + "Quantité: " + "</strong>";
    html += "<span>" + card_modal[cards_table__key_quantity] + "</span>";
    html += '</div>'; // col 2
    html += '</div>'; // container
    html += '</div>'; // modal body
    html += '<div class="modal-footer">';
    html += '<span class="btn btn-primary" data-dismiss="modal">Fermer</span>';
    html += '</div>';  // content
    html += '</div>';  // dialog
    html += '</div>';  // footer
    html += '</div>';  // modalWindow
    $('body').append(html);
    var cardModalSelector = $("#cardModal");
    cardModalSelector.modal();
    cardModalSelector.modal('show');
    cardModalSelector.on('hidden.bs.modal', function () {
        $(this).remove();
    });
}



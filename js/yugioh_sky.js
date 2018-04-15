/*
 * yugioh_sky.js
 * 2.0 (2018-04-15)
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * https://github.com/joelcancela/Yu-Gi-Oh_Sky.js
 *
 * Copyright 2018 Joël CANCELA VAZ[joel.cancelavaz@gmail.com]
 * This is not affiliated with Konami.
 */

/************************************************** Globals **************************************************/
//// API links
// APIs Used with CORS
var DATABASE_CARDS_URL = "https://www.joelcancela.fr/services/yugioh_sky.js/getCardsDatabase/";
var SUPPORT_CARDS_URL = "https://www.joelcancela.fr/services/yugioh_sky.js/getSupportCards/";
var CARD_DESCRIPTION_FR_URL = "https://www.joelcancela.fr/services/yugioh_sky.js/getCardDescription/";
// External APIs
var IMG_API_URL = "http://yugiohprices.com/api/card_image/";
var WIKIA_LINK = "http://yugioh.wikia.com/wiki/";
// Vars
var img_card_404 = "./img/yugioh_404.png";
var cards_table = [];
// Events
var cards_table_is_ready = false;
var cards_table_is_created = false;
// JSON cards table keys
var cards_table__key_atk = "atk";
var cards_table__key_card_type = "card_type"; // Monster, Spell, Trap
var cards_table__key_decks_array = "decks";
var cards_table__key_def = "def";
var cards_table__key_family = "family"; // Monster family (Earth, Wind, Water, Fire, Dark, Light)
var cards_table__key_picture_link = "img_link";
var cards_table__key_level = "level";
var cards_table__key_name = "name";
var cards_table__key_name_fr = "name_fr";
var cards_table__key_name_fr_sort = "name_fr_sorting";
var cards_table__key_property = "property"; // Spell or Trap type
var cards_table__key_quantity = "quantity"; // Quantity of cards owned
var cards_table__key_text = "text"; // Description text (english)
var cards_table__key_monster_type = "types"; // Monster type, Effect, Fusion, Ritual, Synchro, Token, XYZ
// JSON cards table values
//// card_type values
var card_type__value_monster = "monster";
var card_type__value_spell = "spell";
var card_type__value_trap = "trap";
var card_type__value_token = "token";
// Other variables
var sortOptions = {}; // Sorting object for filter.js
var DEBUG = false; //Dev purposes
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

/************************************************** Initialization **************************************************/
window.addEventListener('DOMContentLoaded', init);

/**
 * Init function
 */
function init() {
	get_cards_data();//Retrieve JSON
	edit_cards_data();//Edit JSON values
	update_cards_number(cards_table);//Update display
	create_filters();//Create FJS instance with criterias
	initEvents();//Init events on checkboxes and buttons for criterias
	setCheckboxesStatus();//Set default checked buttons
}

/**
 * Retrieves cards data from database
 */
function get_cards_data() {
	$.getJSON(DATABASE_CARDS_URL, function (data) {
		cards_table = data;
		cards_table_is_created = true;
	}).fail(function () {
		console.log("Can't retrieve JSON cards database");
	});
}

/**
 * Formats data for filter.js
 */
function edit_cards_data() {
	if (!cards_table_is_created) {
		setTimeout(edit_cards_data, 100);
		return;
	}
	for (var currentIteration = 0; currentIteration < cards_table.length; currentIteration++) {
		cards_table[currentIteration][cards_table__key_quantity] = parseInt(cards_table[currentIteration][cards_table__key_quantity]);//Replace quantity by a number
		cards_table[currentIteration][cards_table__key_atk] = parseInt(cards_table[currentIteration][cards_table__key_atk]);//Replace atk by a number
		cards_table[currentIteration][cards_table__key_def] = parseInt(cards_table[currentIteration][cards_table__key_def]);//Replace def by a number
		cards_table[currentIteration][cards_table__key_level] = parseInt(cards_table[currentIteration][cards_table__key_level]);//Replace level by a number
		var current_card_types = cards_table[currentIteration][cards_table__key_monster_type];
		var current_card_decks = cards_table[currentIteration][cards_table__key_decks_array];
		if (!current_card_decks) {
			cards_table[currentIteration][cards_table__key_decks_array] = [""];//Replace false by an array with an empty string (FJS)
		} else {
			cards_table[currentIteration][cards_table__key_decks_array] = cards_table[currentIteration][cards_table__key_decks_array].split(",");//Create an array of string being the decks
		}
		if (!current_card_types) {
			cards_table[currentIteration][cards_table__key_monster_type] = [""];//Replace false by an array with an empty string (FJS)
		}
		else {
			cards_table[currentIteration][cards_table__key_monster_type] = cards_table[currentIteration][cards_table__key_monster_type].split(",");//Create an array of string being the monster types
		}
		if (cards_table[currentIteration][cards_table__key_name] === "Level Down!?") {//FIXME: YuGiOh Prices API doesn't like this card "Level Down?!" (request has to have the "!" removed)
			cards_table[currentIteration][cards_table__key_picture_link] = IMG_API_URL + "Level_Down_%3F";
		} else {
			cards_table[currentIteration][cards_table__key_picture_link] = IMG_API_URL + cards_table[currentIteration][cards_table__key_name].replace(/"/g, "_");// Creates the link to the card image
		}
		cards_table[currentIteration][cards_table__key_name_fr_sort] = cleanUpSpecialChars(cards_table[currentIteration][cards_table__key_name_fr]);// Create name_fr_sorting
	}
	cards_table_is_ready = true;
}

/**
 * Updates the cards number counter
 * @param result is the cards array currently displayed
 */
function update_cards_number(result) {
	$('#cards_number').text(result.length);
}

/************************************************** Filter.js functions **************************************************/

/**
 * Creates filters and initializes filter.js instance
 */
function create_filters() {
	if (!cards_table_is_ready) {
		setTimeout(create_filters, 100);
		return;
	}
	if (DEBUG) {
		console.dir(cards_table);
	}

	window.FJS = FilterJS(cards_table, '#cards_table', {
		template: '#card_template',
		search: {
			ele: '#searchbox', fields: [cards_table__key_name_fr, cards_table__key_name, cards_table__key_text],
			start_length: 1
		},
		criterias: [
			{field: cards_table__key_decks_array, ele: '#deck_criteria input:checkbox'},
			{field: cards_table__key_card_type, ele: '#card_type_criteria input:radio', all: 'all'},
			{field: cards_table__key_quantity, ele: '#quantity_filter', type: 'range'}],
		pagination: {
			container: '#pagination',
			paginationView: "#pagination_template",
			visiblePages: 7,
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

/**
 * Keeps the cards ordered while searching
 * @param query is a filter.js object
 */
function shortResult(query) {
	if (sortOptions) {
		query.order(sortOptions);
	}
}

/************************************************** Events **************************************************/

/**
 * Sets defaults checkboxes attributes
 */
function setCheckboxesStatus() {
	$('#deck_criteria').find(':checkbox').prop('checked', true);
	$('#all_types').prop("checked", true);
}

/**
 * Initiates all events for triggers and checkboxes
 */
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
		max: 4000,
		values: [0, 4000],
		step: 100,
		range: true,
		slide: function (event, ui) {
			$("#atk_range_label").html(ui.values[0] + ' - ' + ui.values[1] + ' ATK');
			$('#atk_filter').val(ui.values[0] + '-' + ui.values[1]).trigger('change');
		}
	});

	$("#def_slider").slider({
		min: 0,
		max: 4000,
		values: [0, 4000],
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

/**
 * Enables filter criterias for monster cards
 */
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

/**
 * Disables filter criterias for monster cards
 */
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

/**
 * Enables filter criterias for spell and trap cards
 */
function enable_spell_traps_criterias() {
	FJS.addCriteria({field: cards_table__key_property, ele: '#property_criteria input:checkbox'});
	$('#properties').show();
}

/**
 * Disables filter criterias for spell and trap cards
 */
function disable_spell_traps_criterias() {
	FJS.removeCriteria(cards_table__key_property);
	$('#properties').hide();
}

/************************************************** Sorting functions **************************************************/

/**
 * Creates an object for sorting used by filter.js for a specific type of sorting
 * @param name the name of the sorting
 * @returns {{}} the object containing the sorting function and the key of sorting
 */
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

	//Sorting function for a: return -1 put before, 1 put after
	//for b: return 1 put before, -1 put after
	if (name === sorting__atk_desc) {
		sort[cards_table__key_atk] = 'custom';
		sort['sort_function'] = function (a, b) {
			//TOKEN
			if (a[cards_table__key_card_type] === card_type__value_token) {
				return 1;
			}
			if (b[cards_table__key_card_type] === card_type__value_token) {
				return -1;
			}
			//TRAP
			if (a[cards_table__key_card_type] === card_type__value_trap) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//SPELL
			if (a[cards_table__key_card_type] === card_type__value_spell) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return -1;
				} else if (b[cards_table__key_card_type] === card_type__value_spell) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//MONSTER
			if (a[cards_table__key_card_type] === card_type__value_monster) {
				if (b[cards_table__key_card_type] === card_type__value_monster) {
					return b[cards_table__key_atk] - a[cards_table__key_atk] || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return -1;
				}
			}
		};
		return sort;
	}

	if (name === sorting__atk_asc) {
		sort[cards_table__key_atk] = 'custom';
		sort['sort_function'] = function (a, b) {
			//TOKEN
			if (a[cards_table__key_card_type] === card_type__value_token) {
				return 1;
			}
			if (b[cards_table__key_card_type] === card_type__value_token) {
				return -1;
			}
			//TRAP
			if (a[cards_table__key_card_type] === card_type__value_trap) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//SPELL
			if (a[cards_table__key_card_type] === card_type__value_spell) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return -1;
				} else if (b[cards_table__key_card_type] === card_type__value_spell) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//MONSTER
			if (a[cards_table__key_card_type] === card_type__value_monster) {
				if (b[cards_table__key_card_type] === card_type__value_monster) {
					return a[cards_table__key_atk] - b[cards_table__key_atk] || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return -1;
				}
			}
		};
		return sort;
	}

	if (name === sorting__def_desc) {
		sort[cards_table__key_def] = 'custom';
		sort['sort_function'] = function (a, b) {
			//TOKEN
			if (a[cards_table__key_card_type] === card_type__value_token) {
				return 1;
			}
			if (b[cards_table__key_card_type] === card_type__value_token) {
				return -1;
			}
			//TRAP
			if (a[cards_table__key_card_type] === card_type__value_trap) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//SPELL
			if (a[cards_table__key_card_type] === card_type__value_spell) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return -1;
				} else if (b[cards_table__key_card_type] === card_type__value_spell) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//MONSTER
			if (a[cards_table__key_card_type] === card_type__value_monster) {
				if (b[cards_table__key_card_type] === card_type__value_monster) {
					return b[cards_table__key_def] - a[cards_table__key_def] || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return -1;
				}
			}
		};
		return sort;
	}

	if (name === sorting__def_asc) {
		sort[cards_table__key_def] = 'custom';
		sort['sort_function'] = function (a, b) {
			//TOKEN
			if (a[cards_table__key_card_type] === card_type__value_token) {
				return 1;
			}
			if (b[cards_table__key_card_type] === card_type__value_token) {
				return -1;
			}
			//TRAP
			if (a[cards_table__key_card_type] === card_type__value_trap) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//SPELL
			if (a[cards_table__key_card_type] === card_type__value_spell) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return -1;
				} else if (b[cards_table__key_card_type] === card_type__value_spell) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//MONSTER
			if (a[cards_table__key_card_type] === card_type__value_monster) {
				if (b[cards_table__key_card_type] === card_type__value_monster) {
					return a[cards_table__key_def] - b[cards_table__key_def] || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return -1;
				}
			}
		};
		return sort;
	}

	if (name === sorting__level_desc) {
		sort[cards_table__key_level] = 'custom';
		sort['sort_function'] = function (a, b) {
			//TOKEN
			if (a[cards_table__key_card_type] === card_type__value_token) {
				return 1;
			}
			if (b[cards_table__key_card_type] === card_type__value_token) {
				return -1;
			}
			//TRAP
			if (a[cards_table__key_card_type] === card_type__value_trap) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//SPELL
			if (a[cards_table__key_card_type] === card_type__value_spell) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return -1;
				} else if (b[cards_table__key_card_type] === card_type__value_spell) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//MONSTER
			if (a[cards_table__key_card_type] === card_type__value_monster) {
				if (b[cards_table__key_card_type] === card_type__value_monster) {
					return b[cards_table__key_level] - a[cards_table__key_level] || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return -1;
				}
			}
		};
		return sort;
	}

	if (name === sorting__level_asc) {
		sort[cards_table__key_level] = 'custom';
		sort['sort_function'] = function (a, b) {
			//TOKEN
			if (a[cards_table__key_card_type] === card_type__value_token) {
				return 1;
			}
			if (b[cards_table__key_card_type] === card_type__value_token) {
				return -1;
			}
			//TRAP
			if (a[cards_table__key_card_type] === card_type__value_trap) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//SPELL
			if (a[cards_table__key_card_type] === card_type__value_spell) {
				if (b[cards_table__key_card_type] === card_type__value_trap) {
					return -1;
				} else if (b[cards_table__key_card_type] === card_type__value_spell) {
					return a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return 1;
				}
			}
			//MONSTER
			if (a[cards_table__key_card_type] === card_type__value_monster) {
				if (b[cards_table__key_card_type] === card_type__value_monster) {
					return a[cards_table__key_level] - b[cards_table__key_level] || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
				} else {
					return -1;
				}
			}
		};
		return sort;
	}

	if (name === sorting__quantity_asc) {
		sort[cards_table__key_quantity] = 'custom';
		sort['sort_function'] = function (a, b) {
			return a[cards_table__key_quantity] - b[cards_table__key_quantity] || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
		};
		return sort;
	}

	if (name === sorting__quantity_desc) {
		sort[cards_table__key_quantity] = 'custom';
		sort['sort_function'] = function (a, b) {
			return b[cards_table__key_quantity] - a[cards_table__key_quantity] || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
		};
		return sort;
	}

	if (name === sorting__card_type) {
		sort[cards_table__key_card_type] = 'custom';
		custom_order.push(card_type__value_monster, card_type__value_spell, card_type__value_trap, card_type__value_token);
		sort['custom_order'] = custom_order;
		sort['sort_function'] = function (a, b, ordering) {
			return (ordering[a[cards_table__key_card_type]] - ordering[b[cards_table__key_card_type]]) || a[cards_table__key_name_fr].localeCompare(b[cards_table__key_name_fr]);
		};
		return sort;
	}
}

/************************************************** Modals functions **************************************************/

/**
 * Creates and displays a bootstrap modal for a card
 * @param card_fid the index of the card in the cards_table
 */
function display_card_modal(card_fid) {
	var card_modal = cards_table[parseInt(card_fid) - 1];
	var html = '<div id="cardModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
	html += '<div class="modal-dialog modal-lg">';
	html += '<div class="modal-content">';
	html += '<div class="modal-header">';
	html += '<h4>' + card_modal[cards_table__key_name_fr] + '</h4>';
	html += '<a class="close" data-dismiss="modal">×</a>';
	html += '</div>';
	html += '<div class="modal-body">';
	html += '<div class="row center-block">';
	html += '<div class="col-lg-6">';// col1
	html += "<img class='img-responsive' src=\"" + card_modal[cards_table__key_picture_link] + "\"" + " onerror='imgError(this);'>";
	html += '</div>'; // col 1
	html += '<div class="col-lg-6">'; //col 2
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
		html += "<span>" + traduce(card_modal[cards_table__key_monster_type]) + "</span><br><br>";
		html += "<strong>" + "Élement: " + "</strong>";
		html += "<span>" + traduce(card_modal[cards_table__key_family]) + " </span><img class='icon' src='img/attribute/" + card_modal[cards_table__key_family] + ".svg' onerror='this.src=''>";
	} else if (card_modal[cards_table__key_card_type] !== "token") {//Spells and Traps
		html += "<img class='icon' src='img/card_type/" + card_modal[cards_table__key_card_type] + ".svg' onerror='this.src=''><br><br>";
		html += "<strong>" + "Propriété: " + "</strong>";
		html += "<span>" + traduce(card_modal[cards_table__key_property]) + " </span><img class='icon' src='img/property/" + card_modal[cards_table__key_property] + ".svg' onerror='this.src=''>";
	}
	html += "<br><br><strong>" + "Texte: " + "</strong>";
	html += "<span id='description'>" + card_modal[cards_table__key_text] + "</span>";
	html += "<br><br><strong>" + "Quantité: " + "</strong>";
	html += "<span>" + card_modal[cards_table__key_quantity] + "</span><br><br>";
	html += "<a href='#supportCards' class='btn btn-info' data-toggle='collapse'>Voir les cartes liées</a>";
	html += "<div id='supportCards' class='collapse'>";
	html += '</div>';
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
	traductionCardText(card_modal[cards_table__key_name]);
	getSupportCards(card_modal[cards_table__key_name]);
	cardModalSelector.on('hidden.bs.modal', function () {
		$(this).remove();
	});
}

/************************************************** Translation functions for modals **************************************************/

/**
 * JSON containing the french translation for some Yu-Gi-Oh! terms
 */
var traductionJson = {
	"Aqua": "Aqua",
	"Beast": "Bête",
	"Beast-Warrior": "Bête-Guerrier",
	"Continuous": "Continu",
	"Counter": "Contre",
	"Creator God": "Dieu Créateur",
	"Cyberse": "Cyberse",
	"Dinosaur": "Dinosaure",
	"Divine-Beast": "Bête-Divine",
	"Dragon": "Dragon",
	"Effect": "Effet",
	"Equip": "Équipement",
	"Fairy": "Elfe",
	"Field": "Terrain",
	"Fiend": "Démon",
	"Fish": "Poisson",
	"Flip": "Flip",
	"Fusion": "Fusion",
	"Gemini": "Gémeau",
	"Insect": "Insecte",
	"Link": "Lien",
	"Machine": "Machine",
	"Normal": "Normal",
	"Pendulum": "Pendule",
	"Plant": "Plante",
	"Psychic": "Psychique",
	"Pyro": "Pyro",
	"Quick-Play": "Jeu-Rapide",
	"Reptile": "Reptile",
	"Ritual": "Rituel",
	"Rock": "Rocher",
	"Sea Serpent": "Serpent de Mer",
	"Spellcaster": "Magicien",
	"Spirit": "Spirit",
	"Synchro": "Synchro",
	"Thunder": "Tonnerre",
	"Toon": "Toon",
	"Tuner": "Syntoniseur",
	"Union": "Union",
	"Warrior": "Guerrier",
	"Winged Beast": "Bête Ailée",
	"Wyrm": "Wyrm",
	"XYZ": "XYZ",
	"Zombie": "Zombie",
	"dark": "Ténèbres",
	"divine": "Divin",
	"earth": "Terre",
	"fire": "Feu",
	"light": "Lumière",
	"monster": "Monstre",
	"spell": "Magie",
	"token": "Jeton",
	"trap": "Piège",
	"water": "Eau",
	"wind": "Vent"
};

/**
 * Traduces a word or an array of words in french
 * @param element a word or an array of words
 * @returns string french translation of the word(s) or itself if not found
 */
function traduce(element) {
	if ($.isArray(element)) {
		var traduction = "";
		for (var i = 0; i < element.length; i++) {
			if (i !== 0) {
				traduction += "/";
			}
			traduction += traduce(element[i]);
		}
		return traduction;
	} else {
		return traductionJson[element] || element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
	}
}

/**
 * Retrieves the french translation for a card description and replaces it on the card modal
 * @param card_name_en the name of the card in english
 */
function traductionCardText(card_name_en) {
	$.ajax({
		async: true,
		type: 'GET',
		url: CARD_DESCRIPTION_FR_URL,
		data: {'card_name': card_name_en},
		success: [function (data) {
			if (data !== "") {
				$("#description").text(data);
			}
		}]
	});
}

/************************************************** Support cards functions for modals **************************************************/

/**
 * Retrieves the list of support cards for a specific cards and creates the list for the card modal
 * @param card_name_en the name of card to get the support cards for
 */
function getSupportCards(card_name_en) {
	$.ajax({
		async: true,
		type: 'GET',
		url: SUPPORT_CARDS_URL,
		data: {'card_name': card_name_en},
		success: [function (data) {
			var cards = "";
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					cards += "<ul>";
				}
				cards += "<li><a target='_blank' href='" + WIKIA_LINK + data[i] + "'>" + data[i] + "</a></li>";
				if (i === data.length - 1) {
					cards += "</ul>";
				}
			}
			if (data.length > 0) {
				$("#supportCards").html(cards);
			} else {
				$("#supportCards").html("Aucune carte liée");
			}
		}],
		error: [function () {
			$("#supportCards").html("Aucune carte liée");
		}]
	});
}

/************************************************** Miscellaneous functions **************************************************/

/**
 * Replaces all accents characters to match URL requirements for APIs
 * @param str a string to sanitize
 * @returns {string} the string with no accents
 */
function cleanUpSpecialChars(str) {
	str = str.replace(/[ÀÁÂÃÄÅ]/g, "A");
	return str.replace(/[ÈÉÊË]/g, "E");
}

/**
 * Executes when the card image can't be retrieved
 * @param image the DOM object that triggered that function
 * @returns {boolean} true
 */
function imgError(image) {
	console.error("Error while retrieving image for card " + image);
	image.onerror = "";
	image.src = img_card_404;
	return true;
}
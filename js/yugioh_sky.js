var CSV_URL = "https://docs.google.com/spreadsheets/d/1WEsIrHSEmGXQYVAUw1rqFhTqllE6n-am9mx15FuhUNo/pubhtml";
var IMG_API_URL = "http://yugiohprices.com/api/card_image/";
var yu_gi_oh_sheet = "Yu-Gi-Oh";
var yu_gi_oh_sheet_stats = "Yu-Gi-Oh Stats";
var img_card_404 = "./img/yugioh_404.png";
var cards_table;
var cards_stats;
var cards_are_retrieved = false;
var card_name_fr = "Nom";

window.addEventListener('DOMContentLoaded', init);

function init() {
    retrieve_and_parse_csv();
    init_suite();
}

function init_suite(){
    if (!cards_are_retrieved) {
        setTimeout(init_suite, 100);
        return;
    }
    display_card_images();
    //create_filters();
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

function display_card_images() {
    cards_table.forEach(function (element) {
        var img = create_img(IMG_API_URL+element[card_name_fr],element[card_name_fr],element[card_name_fr] );
        document.getElementById("cards").appendChild(img);
    });
}

function create_img(src, alt, title) {
    var img = detectIE ? new Image() : document.createElement('img');
    img.className = "yugioh_card";
    img.src = src;
    img.onerror = function() {
        img.src = img_card_404;
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
    var FJS = FilterJS(cards_table, '#cards', {
        template: '#movie-template',
        filter_on_init: true, // Default filter_on_init is false
        callbacks: {
            afterFilter: function(result){
                $('#total_movies').text(result.length);
            }
        }
    });
}




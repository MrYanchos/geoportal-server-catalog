var dictUrl= "http://ec-scigraph.sdsc.edu:9000/scigraph/vocabulary/autocomplete/%QUERY?limit=20&searchSynonyms=true&searchAbbreviations=false&searchAcronyms=false&includeDeprecated=false";
var params = {"query": "%QUERY","limit":"20" };
var keyCol = "";
var qStack = [];
var taCol = new Bloodhound({
    datumTokenizer: function(datum) {
        return Bloodhound.tokenizers.whitespace(datum.value);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        wildcard: params.query,
        url: dictUrl,
        prepare: function(query, settings) {
            var pq = query.split(' ');

            gPre = pq[pq.length-1];
            taPick = false;
            var surl = settings.url.replace('%QUERY',gPre);

            settings.url = surl;
            return settings;
        },
        transform: function(response) {
            // Map the remote source JSON array to a JavaScript object array
            if ( response.suggestions ) {
                var mr = response.suggestions;
            } else  {
                mr = response;
            }

            var zed = $.map(mr, function(taObj) {
                console.log('map');
                if ( taObj.text ){
                    return {
                        value: taObj.text,
                        magicKey: taObj.magicKey
                    };

                } else if ( typeof(taObj.concept) !== "undefined" && Array.isArray(taObj.concept.categories) ) {

                    for (z = 0; z < taObj.concept.categories.length; z++) {
                        return {
                            uri: taObj.concept.uri,
                            categories: taObj.concept.categories[z],
                            value: taObj.completion
                        };
                    }

                } else {
                    return {
                        uri: taObj.concept.uri,
                        categories: '',
                        value: taObj.completion
                    };
                }
            });

            return zed;
        }
    }
});

var placeUrl = "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=%QUERY&category=Land+Features,Water+Features,Populated+Place,Coordinate+System,Parks+and+Outdoors,Professional+and+Other+Places,Postal+Locality&maxSuggestions=15&f=pjson";
var placeParams = {"query": "%QUERY" };
var taPlace = new Bloodhound({
    datumTokenizer: function(datum) {
        return Bloodhound.tokenizers.whitespace(datum.value);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        wildcard: placeParams.query,
        url: placeUrl,
        prepare: function(query, settings) {
            var pq = query.split(' ');

            gPre = pq[pq.length-1];
            taPick = false;
            var surl = settings.url.replace('%QUERY',gPre);

            settings.url = surl;
            return settings;
        },
        transform: function(response) {
            // Map the remote source JSON array to a JavaScript object array
            if ( response.suggestions ) {
                var mr = response.suggestions;
            } else  {
                mr = response;
            }

            var zed = $.map(mr, function(taObj) {
                console.log('map' + JSON.stringify(taObj) );
                if ( taObj.text ){
                    return {
                        value: taObj.text,
                        magicKey: taObj.magicKey
                    };
                } else {
                    return {
                        value: taObj.completion
                    };
                }
            });

            return zed;
        }
    }
});

var taTrim = false;
var taDone = function () {
    // Instantiate the Typeahead UI
    $('.sb-typeahead-text').typeahead({ hint: true, highlight: true }, {
            displayKey: 'value',
            source: taCol,
            limit: 7,
            templates: { suggestion: function (data) {
                    var conCat = '';

                    if ( data.categories ) {
                        conCat = '<p><strong>' + data.value + '</strong></br>' + data.categories + '</br><a href="' + data.uri + '" target="_blank" >' + data.uri + '</p>';
                    } else {
                        conCat = '<p><strong>' + data.value + '</strong></p>';
                    }
                    return conCat;
                }}
        }, {
            displayKey: 'value',
            source: taPlace,
            limit: 7,
            templates: { suggestion: function (data) {
                    var conCat = '';
                    if ( data.value ) {
                        conCat = '<p style="background-color: #efefff; font-style: italic; "><strong><i>' + data.value + '</strong></p>';
                    }
                    return conCat;
                }}
        }
    ).on('typeahead:autocomplete', function (obj) {
        var key = event.keyCode || event.charCode;
        if ( key == 9 ) {
            if ( keyCol.length > 0 ) {
                if ( taTrim && keyCol.slice(-1) !== " " ) {
                    var kca = keyCol.split(' ');
                    kca.pop();
                    keyCol = kca.join(' ') + ' ';
                    taTrim = false;
                }
                keyCol = keyCol + $( this ).typeahead('val') + ' ';
            } else {
                keyCol = $( this ).typeahead('val') + ' ';
            }
            $( this ).typeahead('val', keyCol );
            getSearchCount(keyCol.trim());
        }
    }).on('typeahead:selected', function (obj, datum) {
        taPick = true;
        if ( keyCol.length > 0 ) {
            if ( taTrim && keyCol.slice(-1) !== " ") {
                var kca = keyCol.split(' ');
                kca.pop();
                keyCol = kca.join(' ') + ' ';
                taTrim = false;
            }
        }
        $( this ).typeahead('val', keyCol + ' ' + datum.value );
        keyCol = $( this ).typeahead('val' );
        getSearchCount(keyCol.trim());

    }).keydown( function () {
        var key = event.keyCode || event.charCode;
        var sTex = getSelectionText();

        if ( key == 8 || key == 37 || key == 46) {
            taTrim = true;
            var etrim = $( this ).typeahead('val');
            if ( sTex.length > 1 ) {
                keyCol = etrim.slice(0, - sTex.length);
            } else {
                keyCol = etrim.slice(0, -1);
            }
            if ( keyCol.splice(-1) == " " ) {
                qStack.pop();
            }
        } else if ( key == 32 ) {
            keyCol = $( this ).typeahead('val') + ' ';
            getSearchCount(keyCol.trim());
        }
    });
}

function getSelectionText() {
    var text = "";
    var activeEl = document.activeElement;
    var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
        (activeElTagName == "textarea") || (activeElTagName == "input" &&
        /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
        (typeof activeEl.selectionStart == "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}

function getSearchCount(qry) {

    var qcUrl = 'http://cinergi.sdsc.edu/geoportal_test/elastic/metadata/item/_count?q=' + encodeURI(qry);
    $.ajax({
        type: 'GET',
        url: qcUrl,
        dataType: "json",
        contentType: "application/json",
        success: function(data) {
            if ( typeof(data.count) !== "undefined" ) {
                qStack.push(qry + ' : ' + data.count);
                $("#qryStat").html('Search Count for </br>' + qStack.join('</br>') );
            }
        }
    });
}
taDone();
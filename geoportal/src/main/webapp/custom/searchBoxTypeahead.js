var dictUrl= "http://ec-scigraph.sdsc.edu:9000/scigraph/vocabulary/autocomplete/%QUERY?limit=20&searchSynonyms=true&searchAbbreviations=false&searchAcronyms=false&includeDeprecated=false";
var params = {"query": "%QUERY","limit":"20" };
var keyCol = "";

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

           // var taDone = function (query) {

                var taDone = function () {
                // Instantiate the Typeahead UI
                $('.sb-typeahead-text').typeahead({hint: true, highlight: true}, {
           // query(".typeahead-text").typeahead({hint: true, highlight: true}, {
                    displayKey: 'value',
                    source: taCol,
                    templates: {
                        suggestion: function (data) {
                            var conCat = '';

                if ( data.categories ) {
                    conCat = '<p><strong>' + data.value + '</strong></br>' + data.categories + '</br>' + data.uri + '</p>';
                } else {
                    conCat = '<p><strong>' + data.value + '</strong></p>';
                }

                return conCat;
            }}
    }).on('typeahead:open', function (obj, datum) {
        console.log( ' open ');
    }).on('typeahead:render', function (obj, datum) {
        var fulstr = $( this ).typeahead('val');
        console.log( ' render ' + $( this ).typeahead('val') );

    }).on('typeahead:active', function (obj, datum) {
        console.log( ' active ');
    }).on('typeahead:selected', function (obj, datum) {
        taPick = true;

        $( this ).typeahead('val', keyCol + ' ' + datum.value );
        keyCol = $( this ).typeahead('val' );

    }).focus( function () {
        console.log('typeahead focus');
    }).keydown( function () {
        var key = event.keyCode || event.charCode;

        if( key == 8 || key == 46 ) {
            var etrim = $( this ).typeahead('val');
            keyCol = etrim.slice(0, -1);;

        }
    });


}

taDone();






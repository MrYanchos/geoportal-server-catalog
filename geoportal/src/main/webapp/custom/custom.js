(
    function() {
    // require(["dojo/domReady!","dojo/query!css3","app/boostrap/Typeahead"], function(on,query,typeahead) {
    //     // will not be called until DOM is ready
    //
    //     // Custom initialization
    //
    //    // $(document).ready(function () {
    //         var dictUrl = "http://ec-scigraph.sdsc.edu:9000/scigraph/vocabulary/autocomplete/%QUERY?limit=20&searchSynonyms=false&searchAbbreviations=false&searchAcronyms=false&includeDeprecated=false";
    //         var params = {"query": "%QUERY", "limit": "20"};
    //
    //         var taCol = new Bloodhound({
    //             datumTokenizer: function (datum) {
    //                 return Bloodhound.tokenizers.whitespace(datum.value);
    //             },
    //             queryTokenizer: Bloodhound.tokenizers.whitespace,
    //             remote: {
    //                 wildcard: params.query,
    //                 url: dictUrl,
    //                 prepare: function (query, settings) {
    //                     gPre = query;
    //                     taPick = false;
    //                     var surl = settings.url.replace('%QUERY', query);
    //
    //                     settings.url = surl;
    //                     return settings;
    //                 },
    //                 transform: function (response) {
    //                     console.log(JSON.stringify(response));
    //                     // Map the remote source JSON array to a JavaScript object array
    //
    //                     if (response.suggestions) {
    //                         var mr = response.suggestions;
    //                     } else {
    //                         mr = response;
    //                     }
    //
    //                     var zed = $.map(mr, function (taObj) {
    //                         console.log(JSON.stringify(taObj));
    //
    //                         if (taObj.text) {
    //                             return {
    //                                 value: taObj.text,
    //                                 magicKey: taObj.magicKey
    //                             };
    //
    //                         } else if (typeof(taObj.concept) !== "undefined" && Array.isArray(taObj.concept.categories)) {
    //
    //                             for (z = 0; z < taObj.concept.categories.length; z++) {
    //                                 return {
    //                                     uri: taObj.concept.uri,
    //                                     categories: taObj.concept.categories[z],
    //                                     value: taObj.completion
    //                                 };
    //                             }
    //
    //
    //                         } else {
    //                             return {
    //                                 uri: taObj.concept.uri,
    //                                 categories: '',
    //                                 value: taObj.completion
    //                             };
    //                         }
    //                     });
    //
    //                     return zed;
    //                 }
    //             }
    //         });
    //
    //         var taDone = function (query) {
    //             // Instantiate the Typeahead UI
    //            // $('.typeahead-text').typeahead({hint: true, highlight: true}, {
    //         query(".typeahead-text").typeahead({hint: true, highlight: true}, {
    //                 displayKey: 'value',
    //                 source: taCol,
    //                 templates: {
    //                     suggestion: function (data) {
    //                         var conCat = '';
    //
    //                         if (data.categories) {
    //                             conCat = '<p><strong>' + data.value + '</strong></br>' + data.categories + '</br>' + data.uri + '</p>';
    //                         } else {
    //                             conCat = '<p><strong>' + data.value + '</strong></p>';
    //                         }
    //
    //                         console.log('ta ' + JSON.stringify(conCat));
    //                         return conCat;
    //                     }
    //                 }
    //             }).on('typeahead:selected', function (obj, datum) {
    //                 taPick = true;
    //                 rexedit = datum.value;
    //                 if (datum.magicKey) {
    //                     gBBMagicKey = datum.magicKey
    //                 }
    //             });
    //         }
    //
    //
    //         taDone(query);
    //
    //    // })
     })



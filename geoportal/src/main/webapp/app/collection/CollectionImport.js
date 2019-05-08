/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "app/common/Templated",
        "dojo/text!./templates/CollectionImport.html",
        "dojo/i18n!../nls/resources",
        "app/collection/CollectionBase",
        "app/search/DropPane",
        "dijit/form/RadioButton",
        "dijit/form/Button",

    ],
    function(declare, lang, Templated, template, i18n, CollectionBase) {

        var oThisClass = declare([Templated], {

            i18n: i18n,
            templateString: template,
            label: "Collection Import",
            open: false,
            postCreate: function() {
                this.inherited(arguments);
            },
        //     $("#import-all-file").change(function(e){
        //     changeDataFromUpload(e, function(data){
        //         console.log(data);
        //     });
        // });

         importAll:function(o) {
            $("#import-all-file").trigger("click");

        },

         changeDataFromUpload:function(evt, cb){
            if (!browserSupportFileUpload()) {
                console.error("The File APIs are not fully supported in this browser!");
            } else {
                var data = null;
                var file = evt.target.files[0];
                var fileName = file.name;
                $("#filename").html(fileName);

                if (file !== "") {
                    var reader = new FileReader();

                    reader.onload = function(event) {
                        var csvData = event.target.result;
                        parseImport(csvData);

                    };
                    reader.onerror = function() {
                        console.error("Unable to read " + file.fileName);
                    };
                }

                reader.readAsText(file);

            }
        },

// Method that checks that the browser supports the HTML5 File API
         browserSupportFileUpload:function() {
            var isCompatible = false;
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                isCompatible = true;
            }
            return isCompatible;
        },

// Parse the CSV input into JSON
         csvToJson:function(data) {
            var cols = data[0];
            var out = [];
            for (var i = 1; i < data.length; i++){
                var obj = {};
                var row = data[i];
                cols.forEach(function(col, index){
                    obj[col] = row[index];
                });
                out.push(obj);
            }
            return out;
        },
             parseImport:function(csvData) {

            var ovi = $('input[name=uniqName_9_2_radio]:checked').val();

            if ( ovi == 'over') {
                if ( confirm ("Are you sure you want to overwrite your current collection records ? ") ) {
                    ovi = 'over';
                    // clear out records here;
                    /*
                    var ca =[];
                    for (var i = 0; i < localStorage.length; i++){
                        if (localStorage.key(i) !== 'saveSearch') {
                            ca.push(localStorage.key(i));
                        }
                    }
                    for (var z = 0; z < ca.length; z++ ) {
                        localStorage.removeItem(ca[z]);
                    }
                    */
                } else {
                    ovi = 'not-over';
                }
            }
            var defaultLoad = false;
            var oneCID="default";

            var rArr = csvData.split('\n');
            if ( rArr.length )  {
                for (var k = 0; k < rArr.length; k++) {
                    var row = rArr[k];
                    if ( typeof row !== "undefined" ) {
                        var rowA = row.split(',');
                        if ( rowA[0] == "Collection"  ) {

                            var cname = rowA[1];
                            var cid = rowA[2];
                            oneCID = cid;
                            if ( cname == "Default" ) {
                                defaultLoad = true;
                            }
                            var cx = _getCollections("id", cid);
                            if ( cx.length && ovi == 'over' ) {
                                // already there
                                var cItem = collectionItem(rowA[2], rowA[1]);
                                saveCollectionItem(cItem);
                                var nop ="";

                            } else {
                                var cItem = collectionItem(rowA[2], rowA[1]);
                                saveCollectionItem(cItem);

                            }

                        }
                        /*
                        if ( rowA[0] == "Saved Search"  ) {

                            var sid = rowA[2];
                            var sx = _getSavedSearches("id", sid);
                            if ( sx.length && ovi == 'over' ) {
                                // already here
                                 var sItem = searchItem(rowA[2], rowA[1], rowA[3], params);
                                saveSearchItem(sItem);
                                var nop ="";
                            } else {
                                var params = {};
                                var sItem = searchItem(rowA[2], rowA[1], rowA[3], params);
                                saveSearchItem(sItem);

                            }

                        }
                        */
                        if ( rowA[0] == "Saved Record"  ) {

                            var rid = rowA[3];
                            var rx = getMdRecords("id", rid);

                            if ( rx.length ) {
                                if (defaultLoad) {
                                    var nop = true;
                                } else {
                                    // collections may have changed reload
                                    var storeCol = rx.collections;
                                    //storeCol.split()
                                    storeCol.push(oneCID);
                                    var rtitle = rowA[1];
                                    var rUrl = rowA[2];
                                    var fid = rowA[4];
                                    var des = row[6];

                                    localStorage.removeItem("mdRec-"+rid);

                                    var rItem = mdRecord( rid, fid, rtitle, rUrl, des, collections );
                                    saveMdRecord(rItem);


                                }

                            } else {

                                var rtitle = rowA[1];
                                var rUrl = rowA[2];
                                var fid = rowA[4];
                                var collections = rowA[5];
                                ( collections.length == 0 ) ? collections = "default" : collections = collections.split('|');
                                var des = row[6];
                                var rItem = mdRecord( rid, fid, rtitle, rUrl, des, collections );
                                saveMdRecord(rItem);

                            }



                        }

                    }
                }
            }

            console.log('import completed ');

        }

        });

        return oThisClass;
    });
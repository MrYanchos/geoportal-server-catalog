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
        "dojo/_base/array",
        "dojo/query",
        "dojo/on",
        "dojox/form/Uploader",
        "dojox/form/uploader/FileList",
        "app/common/Templated",
        "dojo/text!./templates/CollectionImport.html",
        "dojo/i18n!../nls/resources",
        "app/collection/CollectionBase",
        "dojo/topic",
        "app/context/app-topics",
        "app/search/DropPane",
        "dijit/form/RadioButton",
        "dijit/form/Button"


    ],
    function (declare, lang, array, query, on, Uploader, UploadFiles, Templated, template, i18n, CollectionBase, topic, appTopics) {

        var oThisClass = declare([Templated], {

            i18n: i18n,
            templateString: template,
            label: "Collection Import",
            open: false,
            data: null,

            //     $("#import-all-file").change(function(e){
            //     changeDataFromUpload(e, function(data){
            //         console.log(data);
            //     });
            // });
            postCreate: function () {
                this.inherited(arguments);


                var self = this;

                var target = this.dropTarget;

                var uploader = this.uploader;
                this.own(on(uploader, "onChange", function (file) {
                    changeDataFromUpload(file);
                }))
            },
            importAll: function (o) {
                $("#import-all-file").trigger("click");

            },


            clickUpload: function (evt, cb) {
            var self = this;

                        self.parseImport(self.data);

        },
            changeDataFromUpload: function (evt, cb) {
                var self = this;
                if (!this.browserSupportFileUpload()) {
                    console.error("The File APIs are not fully supported in this browser!");
                } else {
                    var data = null;
                    var file = evt.target.files[0];
                    //   var file = this.uploader.getFileList()[0];
                    var fileName = file.name;
                    this.importFile = file;
                    //  $("#filename").html(fileName);

                    if (file !== "") {
                        var reader = new FileReader();

                        reader.onload = function (event) {
                           // var csvData = event.target.result;
                            self.data = event.target.result;
                            //self.parseImport(csvData);
                        };

                        // reader.onload = function(theFile) {
                        //     parseImport(reader.result);
                        // }

                        // reader.loadend = (function(theFile) {
                        //     return function(e) {
                        //         // Render thumbnail.
                        //         var span = document.createElement('span');
                        //         span.innerHTML = ['<img class="thumb" src="', e.target.result,
                        //             '" title="', escape(theFile.name), '"/>'].join('');
                        //         document.getElementById('list').insertBefore(span, null);
                        //     };
                        // })(file);
                        reader.onerror = function () {
                            console.error("Unable to read " + file.fileName);
                        };
                    }

                    reader.readAsText(file);

                }
            },

// Method that checks that the browser supports the HTML5 File API
            browserSupportFileUpload: function () {
                var isCompatible = false;
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    isCompatible = true;
                }
                return isCompatible;
            },

// Parse the CSV input into JSON
            csvToJson: function (data) {
                var cols = data[0];
                var out = [];
                for (var i = 1; i < data.length; i++) {
                    var obj = {};
                    var row = data[i];
                    cols.forEach(function (col, index) {
                        obj[col] = row[index];
                    });
                    out.push(obj);
                }
                return out;
            },
            parseImport: function (csvData) {
                var countRec = 0;
                var countLoaded = 0;
                var countMatched = 0;
                var countCollectionsRecords = 0;
                //var ovi = $('input[name=uniqName_9_2_radio]:checked').val();
                //  var ovi = query('input[name=importFormat]:checked').val();
                var ovi = query('input[name=importFormat]:checked');
                if (ovi !== undefined && (ovi instanceof Array)) {
                    ovi = ovi[0];
                }
                if (ovi !== undefined && ovi.value === 'Overwrite') {
                    if (confirm("Are you sure you want to overwrite your current collection records ? ")) {
                        ovi = 'Overwrite';
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
                var oneCID = "default";

                var rArr = csvData.split('\n');
                if (rArr.length) {
                    for (var k = 0; k < rArr.length; k++) {
                        var row = rArr[k];
                        if (typeof row !== "undefined") {
                            var rowA = row.split(',');
                            if (rowA[0] == "Collection") {
                                countCollectionsRecords++;
                                var cname = rowA[1];
                                var cid = rowA[2];
                                oneCID = cid;
                                if (cname == "Default") {
                                    defaultLoad = true;
                                }
                                var cx = CollectionBase.getCollections("id", cid);
                                if (cx.length && ovi == 'Overwrite') {
                                    // already there
                                    var cItem = CollectionBase.collectionItem(rowA[2], rowA[1]);
                                    CollectionBase.saveCollectionItem(cItem);
                                    var nop = "";

                                } else {
                                    if (cid !== 'default') {
                                        var cItem = CollectionBase.collectionItem(rowA[2], rowA[1]);
                                        CollectionBase.saveCollectionItem(cItem);
                                    }
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
                            if (rowA[0] == "Saved Record") {
                                countRec++;
                                var rid = rowA[3];
                                var rx = CollectionBase.getMdRecords("id", rid);

                                if (rx instanceof Array && rx.length > 0) {
                                    if (defaultLoad) {
                                        var nop = true;
                                    } else {
                                        var rec = rx[0].val;
                                        // collections may have changed reload
                                        // var storeCol = rec.collections;
                                        //storeCol.split()
                                        var collections = rowA[5];
                                        (collections.length == 0) ? collections = ["default"] : collections = collections.split('|');
                                        if (rec.collections instanceof Array) {

                                            // array.forEach(collections, function (col) {
                                                CollectionBase._addCollectionMdRecord(rec, collections);
                                            // })

                                        } else {
                                            rec.collections = ['default'];
                                           // array.forEach(collections, function (col) {
                                                CollectionBase._addCollectionMdRecord(rec, collections);
                                           // })
                                        }
                                        var rtitle = rowA[1];
                                        var rUrl = rowA[2];
                                        var fid = rowA[4];
                                        var des = rowA[6];

                                        //    localStorage.removeItem("mdRec-" + rid);

                                        // var rItem = CollectionBase.mdRecord( rid, fid, rtitle, rUrl, des, storeCol );
                                        // CollectionBase.saveMdRecord(rItem);
                                        CollectionBase.saveMdRecord(rec);
                                        countLoaded++;
                                        countMatched++;

                                    }

                                } else {

                                    var rtitle = rowA[1];
                                    var rUrl = rowA[2];
                                    var fid = rowA[4];
                                    var collections = rowA[5];
                                    (collections.length == 0) ? collections = ["default"] : collections = collections.split('|');
                                    var des = rowA[6];
                                    var rItem = CollectionBase.mdRecord(rid, fid, rtitle, rUrl, des, collections);
                                    CollectionBase.saveMdRecord(rItem);
                                    countLoaded++;

                                }


                            }

                        }
                    }
                }

                console.log('import completed countRecs:{0} countLoaded {1} countUpdated {2}', countRec, countLoaded, countMatched);
                topic.publish("app/collection/refresh");
                topic.publish(appTopics.BulkUpdate);
            }
        });

        return oThisClass;
    });
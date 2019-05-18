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
        "dojo/on",
        "dojo/topic",     "dijit/registry",
        "app/common/Templated",
        "dojo/text!./templates/SavedCollections.html",
        "dojo/i18n!../nls/resources",
        "app/collection/CollectionComponent",
        "app/collection/CollectionBase",
        "app/collection/ItemsPane",
        "app/search/DropPane",
        "dijit/form/Select",
        "dijit/form/Button",
        "dijit/form/TextBox",

    ],
    function(declare, lang, ArrayUtil, on, topic, registry, Templated, template, i18n, CollectionComponent,CollectionBase,  ItemsPane) {

        var oThisClass = declare([CollectionComponent], {

            i18n: i18n,
            templateString: template,
            label: "Saved Collections",
            open: true,
            postCreate: function() {
                var self = this;
                this.inherited(arguments);
                var col = CollectionBase.getCollections();
                for (var k in col) {
                    var colk = col[k].val
                    var colOpt = [{value: colk.id , label: colk.colName }];
                    this.menuNode.addOption(colOpt);
                }
                this.menuNode.on( "change", function(evt){
                    topic.publish("app/collection/selectCollection", self.menuNode.value);
                });
                //viewBtn, newBtn, removeBtn
                // on(this.viewBtn, "click", function(evt){
                //     self._selCollection(evt);
                // });
                // on(this.newBtn, "click", function(evt){
                //     self._addCollection(evt);
                // });
                // on(this.removeBtn, "click", function(evt){
                //     self._removeCollection(evt);
                // });

            }
,

            _selCollection: function (colVal) {

                var xc = colVal;

               // if ( colVal.id =="vBtn" ) {
                    curPage = 0;
                    $("#PageCnt").html("Page 0");
               // }


                var pageRec=10*curPage;
                sType = "local";

                var ColID = this.menuNode.value; // $('#gSvCollection').find(":selected").val();
                var coltxt =   this.menuNode.get("displayedValue"); // $('#gSvCollection').find(":selected").text(); //dijit_TitlePane_0_titleBarNode
                if ( ColID !== "default") {

                    // var sb =ItemsPane.itemsNode;// container.find('#'+recordsDropPaneId);
                    // var tlab = sb[0].childNodes[0];
                    // tlab.nodeValue =" Saved Results for Collection   "+coltxt;
                    //
                    // sb.hide();
                    // sb.show();
                    //
                    // console.log('Show records in the collection ..' + coltxt);
                    //var mda = CollectionBase.getMdRecords();


                }

                  var dp = registry.byId("itemDropPane");
                dp.set("label" ,  "Collection Items from " + coltxt);
                dp.set("title" ,  "Collection Items from " + coltxt);

                if ( ColID == "default" ) {
                   // var mda = CollectionBase.getMdRecords("collections","default");
                    var mda = this.collectionPane.savedResults("collections","default");


                } else if ( ColID == "All" ){
                   // var mda = CollectionBase.getMdRecords("collections","");
                    var mda = this.collectionPane.savedResults("collections","");
                } else {
                   // var mda = CollectionBase.getMdRecords("collections",ColID);
                    var mda = this.collectionPane.savedResults("collections",ColID);
                }
               // ItemsPane.addItem(mda);
                // totRecords = mda.length;
                //
                // if (mda.length > pageRec ) {
                //     startAt = pageRec;
                // } else {
                //     startAt = mda.length - 10;
                // }
                //
                // var opc = 0;
                //
                // if ( mda.length ){
                //  //   $("#PageTotals").html("Total Records " + mda.length);
                //     // add a paging node
                //
                // }
                //
                //
                // for (var k in mda) {
                //     if ( k >= startAt ) {
                //         if ( opc < 10 ) {
                //             var mdRec = mda[k];
                //             var gCard = recordPanelItem(mdRec.val);
                //             cp.append(gCard);
                //         }
                //         opc++;
                //     }
                //
                // }
                // uniq.append(cp);
                //
                //
                //
                // uniq.show();

            }
,
            _addCollection: function (C){

                var newCollection = this.newCollection.value;
                if (newCollection ==="default") return;

                var ncID = CollectionBase.createUUID();


                if (newCollection.length ) {
                    var nco = CollectionBase.collectionItem(ncID, newCollection,"")
                    localStorage.setItem("cItem-"+ncID, JSON.stringify(nco));

                    var newColOpt = [{value: ncID ,  label:newCollection }];

                   // $("#gSvCollection").append(newColOpt);
                  // this.menuNode.options.push(newColOpt);
                    this.menuNode.addOption(newColOpt);
                    this.menuNode.set("value", ncID);
                    this.newCollection.set('displayedValue', '');
                }

            },

            _removeCollection: function (C){

                var ColID = this.menuNode.value;

                if ( ColID !== "default" && ColID !== "All" ) {

                    var mdRem  = CollectionBase.getMdRecords("collections", ColID );

                    for ( var k in mdRem ) {
                        var mCol = mdRem[k].val.collections;
                        var mid = mdRem[k].val.id;
                        var saveMe = false;
                        if ( mCol.length < 2 ) {
                            localStorage.removeItem("mdRec-"+mid);
                        } else {
                            for ( var c in mCol ) {

                                if ( mCol[c].match(ColID) ) {
                                    mCol.splice(c, 1);
                                    saveMe = true;
                                    //results.push({key:mkey,val:mkr});
                                }
                            }
                            if ( saveMe ) { localStorage.setItem("mdRec-"+mid, JSON.stringify(mdRem)); }
                        }
                    }

                    localStorage.removeItem("cItem-"+ColID);
                    // this.menuNode.options = ArrayUtil.filter(this.menuNode.options, function(item, index){
                    //     return item.value!==ColID  });
                    this.menuNode.set("value", "All");

                    this.menuNode.removeOption(ColID);


                }


            },
            expAll2: function (e) {

            var fn = "exportCollection" + $.now() + ".csv";

            var x = this.exportBtn.download =fn;

            var ez = this.getExpAll();

            var exFile = "data:application/octet-stream," + encodeURIComponent(ez);
                this.exportBtn.href = exFile;

        },

         exp2Notebook:function(e) {

            var fn = "exportCollection" + $.now() + ".json";

            var x = $(e).attr("download", fn);

            var ez = this.getExpJson();

            var exFile = "data:application/octet-stream," + encodeURIComponent(ez);
            $(e).attr("href", exFile);

        },
        getExpJson:function () {
            //exports selected collection
            //var ColID = $('#gSvCollection').find(":selected").val();
            var ColID = this.menuNode.value;

            var coLabel = "Collection,";
            var colText = "COLLECTION, NAME, ID, DESCRIPTION\n";

            if ( ColID == "default" ) {
                colText = colText + coLabel + 'default,default,Records not in a Collection\n';

            } else if ( ColID == "all" ) {
                alert("Select a collection ");
                return;

            } else {
                var sc = CollectionBase.findLocalItems("cItem-"+ColID)

                //var sc = findLocalItems("cItem-"+ColID);

                if ( Array.isArray(sc) ) {
                    for ( var c in sc ) {
                        var cId = sc[c].key;
                        var cName = sc[c].val.colName;
                        var cDesc = sc[c].val.colDesc;
                        var cIndex = cId.substr(6);
                        colText = colText + coLabel + cName +  ',' + cIndex + ',' + cDesc + '\n';
                    }
                }
            }


            var mdLabel= "Saved Record,";
            var mdText = "SAVED RECORD, TITLE, URL, ID, FILEID, COLLECTION_IDS, DESCRIPTION\n";
            if ( ColID === "All" ) {
                var md =  CollectionBase.findLocalItems("mdRec");
            } if ( ColID === "default" ) {
                CollectionBase.getMdRecords('collections', "default");
            }else
             {
                var md = CollectionBase.getMdRecords('collections', ColID);
            }

            if ( Array.isArray(md) ) {
                // for ( var c in md ) {
                //
                //     var mName = md[c].val.title;
                //     mName = mName.replace(/,/g, '|');
                //     var mLink = md[c].val.mdlink;
                //     var mId =  md[c].val.id;
                //     var fId =  md[c].val.fileId;
                //     var mDesc ="";
                //     if ( md[c].val.hasOwnProperty("description") ) {
                //         var mDesc = md[c].val.description;
                //         ( typeof mDesc !== "undefined" ) ? mDesc = mDesc.replace(/,/g, '|'): mDesc ="";
                //     }
                //
                //     var xol = md[c].val.collections;
                //     var col = xol.join('|');
                //
                //     if ( ColID == "default" ) {
                //         if ( xol.length == 1 && xol[0]=="default") {
                //             mdText = mdText + mdLabel + mName +  ',' + mLink + ',' + mId + ',' + fId  +  ',' + col +  ',Citation_Description\n';
                //         }
                //
                //     } else {
                //         mdText = mdText + mdLabel + mName +  ',' + mLink + ',' + mId + ',' + fId  +  ',' + col +  ',Citation_Description\n';
                //     }
                //
                //
                //
                //
                //
                // }
                var j = JSON.stringify(md);
                return j;
            }

            // var xft =  colText + mdText;
            // return xft;
            return null;

        },

        getExpAll:function () {
            //exports selected collection
           // var ColID = $('#gSvCollection').find(":selected").val();
            var ColID = this.menuNode.value;

            var coLabel = "Collection,";
            var colText = "COLLECTION, NAME, ID, DESCRIPTION\n";

            if ( ColID == "default" ) {
                colText = colText + coLabel + 'default,default,Records not in a Collection\n';

            } else if ( ColID == "all" ) {
               // alert("Select a collection ");
               // return;
                var sc = CollectionBase.findLocalItems("cItem");
            } else {
               // var sc = CollectionBase.findLocalItems("cItem-"+ColID);
                var sc = CollectionBase.getCollections('id',ColID)

                //var sc = findLocalItems("cItem-"+ColID);

                if ( Array.isArray(sc) ) {
                    for ( var c in sc ) {
                        var cId = sc[c].val.id;
                        var cName = sc[c].val.colName;
                        var cDesc = sc[c].val.colDesc;
                       // var cIndex = cId.substr(6);
                        colText = colText + coLabel + cName +  ',' + cId + ',' + cDesc + '\n';
                    }
                }
                // var fields = [ {id : "id"},
                //     {id :"colName"},
                //     {id :"colDesc" }]
                // var collConfig = {
                //     quotes: false, //or array of booleans
                //     quoteChar: '"',
                //     escapeChar: '"',
                //     delimiter: ",",
                //     header: true,
                //     newline: "\r\n",
                //     skipEmptyLines: false, //or 'greedy',
                //     columns: ["id","colName","colDesc"] //or array of strings
                // }
                //
                // colText = colText+ CSV.serialize({fields:fields, records:sc});
            }


            var mdLabel= "Saved Record,";
            var mdText = "SAVED RECORD, TITLE, URL, ID, FILEID, COLLECTION_IDS, DESCRIPTION\n";
            if (ColID === "ALL") {
                var md =  CollectionBase.findLocalItems("mdRec");
            } else if ( ColID == "default" ) {
                    // var md =  CollectionBase.findLocalItems("mdRec");
                    CollectionBase.getMdRecords('collections', "default");
                } else {
                    var md = CollectionBase.getMdRecords('collections', ColID);
                }

// var mdarray= [];
//              ArrayUtil.forEach(md, function(m ){
//     mdarray.push(m.val) ;
// })
//             var recfields = [ {id : "id"},
//                 {id :"title"},
//                 {id :"mdlink" },
//                 {id :"fileId" },
//                 {id :"description" },
//             ]
//             var recfields = [ {id : "key"},
//                 {id :"val"},
//                 {id :"mdlink" },
//                 {id :"fileId" },
//                 {id :"description" },
//             ]
//             mdRecsText = mdText+ CSV.serialize({fields:recfields, records: mdarray});

            if ( Array.isArray(md) ) {
                for ( var c in md ) {
                    try {
                        var mName = md[c].val.title.toString();
                        mName = mName.replace(/,/g, '--');
                        mName = mName.replace(/\r?\n/g,' ');
                        var mLink = md[c].val.mdlink;
                        var mId = md[c].val.id;
                        var fId = md[c].val.fileId;
                        var mDesc = md[c].val.description;
                        if (md[c].val.hasOwnProperty("description")) {
                            var mDesc = md[c].val.description;

                            (typeof mDesc !== "undefined") ? mDesc = mDesc.replace(/,/g, '|') : mDesc = "";
                            mDesc = mDesc.replace(/\r?\n/g,' ');
                        }

                        var xol = md[c].val.collections;
                        var col = xol.join('|');

                        if (ColID == "default") {
                            if (xol.length == 1 && xol[0] == "default") {
                                mdText = mdText + mdLabel + mName + ',' + mLink + ',' + mId + ',' + fId + ',' + col + ', '+mDesc+'\n';
                            }

                        } else {
                            mdText = mdText + mdLabel + mName + ',' + mLink + ',' + mId + ',' + fId + ',' + col + ', '+mDesc+'\n';
                        }

                    } catch (error) {
                        console.warn ("did not convert record")
                    }



                }
            }

            var xft =  colText + mdText;
            return xft;

        }
        });

        return oThisClass;
    });
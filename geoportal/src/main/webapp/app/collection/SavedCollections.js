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
        "app/common/Templated",
        "dojo/text!./templates/SavedCollections.html",
        "dojo/i18n!../nls/resources",
        "app/collection/CollectionComponent",
        "app/search/DropPane",
        "dijit/form/Select",
        "dijit/form/Button",
        "dijit/form/TextBox",

    ],
    function(declare, lang, ArrayUtil, Templated, template, i18n, CollectionComponent) {

        var oThisClass = declare([CollectionComponent], {

            i18n: i18n,
            templateString: template,
            label: "Saved Collections",
            open: true,
            postCreate: function() {
                this.inherited(arguments);
                var col = this.getCollections();
                for (var k in col) {
                    var colk = col[k].val
                    var colOpt = [{value: colk.id , label: colk.colName }];
                    this.menuNode.addOption(colOpt);
                }
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

                var ColID = $('#gSvCollection').find(":selected").val();
                var coltxt =  $('#gSvCollection').find(":selected").text(); //dijit_TitlePane_0_titleBarNode
                if ( ColID !== "default") {

                    var sb = container.find('#'+recordsDropPaneId);
                    var tlab = sb[0].childNodes[0];
                    tlab.nodeValue =" Saved Results for Collection   "+coltxt;

                    sb.hide();
                    sb.show();

                    console.log('Show records in the collection ..' + coltxt);

                }

                container.find('.g-item-card').each(function(d){
                    $(this).remove();
                });

                var uniq = $('#'+mdRecordsId);
                var cp =  $('<div class="g-drop-pane dijitTitlePane" id="'+colDropPaneId+'" widgetid="'+colDropPaneId+'">');


                if ( ColID == "default" ) {
                    var mda = getMdRecords("collections","default");

                } else if ( ColID == "All" ){
                    var mda = getMdRecords("collections","");
                } else {
                    var mda = getMdRecords("collections",ColID);
                }

                totRecords = mda.length;

                if (mda.length > pageRec ) {
                    startAt = pageRec;
                } else {
                    startAt = mda.length - 10;
                }

                var opc = 0;

                if ( mda.length ){
                    $("#PageTotals").html("Total Records " + mda.length);

                }


                for (var k in mda) {
                    if ( k >= startAt ) {
                        if ( opc < 10 ) {
                            var mdRec = mda[k];
                            var gCard = recordPanelItem(mdRec.val);
                            cp.append(gCard);
                        }
                        opc++;
                    }

                }
                uniq.append(cp);



                uniq.show();

            }
,
            _addCollection: function (C){

                var newCollection = this.newCollection.value;
                var ncID = this.createUUID();


                if (newCollection.length ) {
                    var nco = this.collectionItem(ncID, newCollection,"")
                    localStorage.setItem("cItem-"+ncID, JSON.stringify(nco));

                    var newColOpt = [{value: ncID ,  label:newCollection }];

                   // $("#gSvCollection").append(newColOpt);
                  // this.menuNode.options.push(newColOpt);
                    this.menuNode.addOption(newColOpt);
                    this.menuNode.set("value", ncID);
                }

            },

            _removeCollection: function (C){

                var ColID = this.menuNode.value;

                if ( ColID !== "default" && ColID !== "All" ) {

                    var mdRem  = this.getMdRecords("collections", ColID );

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
                    this.menuNode.options = ArrayUtil.filter(this.menuNode.options, function(item, index){
                        return item.value!==ColID  });
                    //this.menuNode.options= this.menuNode.options.slice(i,1);
                    this.menuNode.set("value", "All");
                  //  $('#gSvCollection').find(":selected").remove();
                  //  $('#gSvCollection').val('default');
                    // code remove

                  //  makeRecordPanel();
                   // gCard.append(colOpt1);
                }


            }
        });

        return oThisClass;
    });
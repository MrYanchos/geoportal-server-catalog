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
        "dojo/topic",
        "dijit/registry",
        "app/context/app-topics",
        "dojo/text!./templates/SavedSearches.html",
        "dojo/i18n!../nls/resources",
        "app/collection/CollectionComponent",
        "app/collection/CollectionBase",
        "app/search/DropPane",
        "dijit/form/Select",
        "dijit/form/Button"
    ],
    function(declare, lang, ArrayUtil, Templated, topic,registry, appTopics, template, i18n, CollectionComponent, CollectionBase) {

        var oThisClass = declare([CollectionComponent], {

            i18n: i18n,
            templateString: template,
            label: "Saved Search",
            open: true,
            lastQuery:null,

            postCreate: function () {
                this.inherited(arguments);
                var self = this;
                var sea = this.getSavedSearches();

                for (var k in sea) {
                    var seak = sea[k].val;
                    var colText = seak.searchText.length > 25 ? seak.searchText.substr(0,25): seak.searchText;

                    var colOpt = [{value: seak.id, title: seak.searchUrl, label: colText}];
                    this.menuNode.addOption(colOpt);
                }
                topic.subscribe(appTopics.LastQuery,function(params){
                    if (params !== null && params.query !== null)
                        self.lastQuery = params;
                });
            },
            getSavedSearches: function (qField, query) {
                var sea = CollectionBase.findLocalItems("sItem");
                if (typeof (qField) !== "undefined" && typeof (query)) {
                    results = [];

                    for (var k in sea) {
                        var kd = sea[k].val;
                        var kid = kd[qField];
                        var cleanKid = kid.replace(/[|&;$%@"<>()+,]/g, "");
                        if (cleanKid.match(query)) {
                            results.push({key: k, val: kd});
                        }
                    }
                    sea = results;
                }
                return sea;

            },
            _addSearch: function (cObj) {
                // Puts a record into saved search

                if (this.lastQuery === null){
                    return;
                }
                //var sUrl='http://cinergi.sdsc.edu/geoportal/?q=';
                var port = location.port === 80 ? "" : ':' + location.port;
                var sUrl = location.protocol + "//" + location.hostname + port + location.pathname + '?q=';
               // var ss = JSON.parse(localStorage.getItem("saveSearch"));
                var ss = this.lastQuery;
                var sa = ss.query.bool.must;
                var sQry = '';
                for (var i in sa) {
                    if (sa[i].query_string){
                        sQry = sQry +"["+sa[i].query_string.query+"] ";
                    } else if (sa[i].geo_shape){
                        var coord1= sa[i].geo_shape.envelope_geo.shape.coordinates[0];
                        var coord2= sa[i].geo_shape.envelope_geo.shape.coordinates[1];
                        sQry = sQry + " [Location:"+coord1 + coord2+" ]";
                    }  else if (sa[i].range){
                        var key = Object.keys(sa[i].range)[0];
                        var gte = sa[i].range[key].gte;
                        var lte = sa[i].range[key].lte;
                    sQry = sQry + " [range:"+ lte +":"+gte+" ]";
                }  else if (sa[i].term){
                        var jsons = JSON.stringify(sa[i].term)
                    sQry = sQry + " [term:"+jsons+" ]";
                } else {
                        sQry = sQry + " ]Other facet] ";
                    }
                }

                if (sQry.length < 2) {
                    alert('Empty Query ');
                    return;
                }
                sUrl = sUrl + sQry;
                //var seaID = cObj.id.substr(6);
                var newSearchText = sQry.length > 25 ? sQry.substr(0,25): sQry;

                var nid = CollectionBase.createUUID();
                var si = CollectionBase.searchItem(nid, newSearchText, sUrl, ss);
                this.saveSearchItem(si);

                var newSearch = { value: si.id, label: newSearchText };
                this.menuNode.addOption(newSearch);
                this.menuNode.set("value", si.id);
                console.log(' Add search' + newSearchText);

            },

            _removeSearch: function (cObj) {
                // Remove Saved Search

              //  var seaID = cObj.id;
                var seaID = this.menuNode.value;
                if (seaID === "default") return;
                localStorage.removeItem("sItem-"+ seaID);
                console.log('cleared  ' + seaID);

                // Remove from list ...
               // var ColStr = $('#gSvSearch').find(":selected").remove();
               //  this.menuNode.options = ArrayUtil.filter(this.menuNode.options, function(item, index){
               //      return item.value!==seaID  });
                this.menuNode.removeOption(seaID);

            },
            showSearchResults: function (sp, savedSearch){
                var collId = this.menuNode.value;
                var searchTitle = this.menuNode.get("displayedValue");
                var search = CollectionBase.getSearchById(collId);
                var mda = this.collectionPane.savedSearch(search);

                var dp = registry.byId("itemDropPane");
                dp.set("label" ,  "Results from Search " + searchTitle);
                dp.set("title" ,  "Results from Search " + searchTitle);
            },

            saveSearchItem: function (SeaItem) {

            var key = "sItem-"+ SeaItem.id;
            localStorage.setItem(key, JSON.stringify(SeaItem) );
            return key;

        }
        });

        return oThisClass;
    });
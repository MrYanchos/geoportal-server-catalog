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
        "dojo/dom-construct",
        "dojo/dom",
        "app/context/app-topics",
        "dojo/text!./templates/SavedSearches.html",
        "dojo/i18n!../nls/resources",
        "app/collection/CollectionComponent",
        "app/collection/CollectionBase",
        "app/search/DropPane",
        "dijit/form/Select",
        "dijit/form/Button"
    ],
    function (declare, lang, ArrayUtil, Templated, topic, registry, domConstruct, dom, appTopics, template, i18n, CollectionComponent, CollectionBase) {

        var oThisClass = declare([CollectionComponent], {

            i18n: i18n,
            templateString: template,
            label: "Saved Search",
            open: true,
            lastQuery: null,

            postCreate: function () {
                this.inherited(arguments);
                var self = this;
                this.addOptions();
                // var sea = this.getSavedSearches();
                //
                // for (var k in sea) {
                //     var seak = sea[k].val;
                //     var colText = seak.searchText.length > 25 ? seak.searchText.substr(0, 25) : seak.searchText;
                //
                //     var colOpt = [{value: seak.id, title: seak.searchUrl, label: colText}];
                //     this.menuNode.addOption(colOpt);
                // }
                topic.subscribe(appTopics.LastQuery, function (params) {
                    if (params !== null && params.query !== null)
                        self.lastQuery = params;
                });
              //  this.showBtn.setDisabled(true);
            },
            addOptions() {
                var sea = CollectionBase.getSavedSearches();
                for (var k in sea) {
                    var seak = sea[k].val;
                    var colText = seak.searchText.length > 25 ? seak.searchText.substr(0, 25) : seak.searchText;
                    var option = domConstruct.create("option", {value: seak.id, label: colText, title: seak.searchUrl}, this.menuNode);
                    // option.value= colk.id;
                    // option.label= colk.colName;
                    // this.menuNode.appendChild(option);
                    // var colOpt = [{value: colk.id, label: colk.colName}];
                    // this.menuNode.addOption(colOpt);
                }
            },
            // dojo.form.select can only produce a dropdown, and not a scrolling select box
            // if you use this, it isolates code from future change.
            getSelectedSearchValue: function () {
                return this.menuNode.value;
            }
            ,
            setSelectedSearchValue: function (value) {
                this.menuNode.value = value;
            },
            getSelectedSearchDisplayedValue: function () {
                return this.menuNode.selectedOptions[0].label;
            },
            _addSearch: function (cObj) {
                // Puts a record into saved search
                var name = this.newSearchName.value;

                if (this.lastQuery === null) {
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
                    if (sa[i].query_string) {
                        sQry = sQry + "[" + sa[i].query_string.query + "] ";
                    } else if (sa[i].geo_shape) {
                        var coord1 = sa[i].geo_shape.envelope_geo.shape.coordinates[0];
                        var coord2 = sa[i].geo_shape.envelope_geo.shape.coordinates[1];
                        sQry = sQry + " [Location:" + coord1 + coord2 + " ]";
                    } else if (sa[i].range) {
                        var key = Object.keys(sa[i].range)[0];
                        var gte = sa[i].range[key].gte;
                        var lte = sa[i].range[key].lte;
                        sQry = sQry + " [range:" + lte + ":" + gte + " ]";
                    } else if (sa[i].term) {
                        var jsons = JSON.stringify(sa[i].term)
                        sQry = sQry + " [term:" + jsons + " ]";
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
                var newSearchText = name? name : sQry;

                var nid = CollectionBase.createUUID();
                var si = CollectionBase.searchItem(nid, newSearchText, sUrl, ss);
                this.saveSearchItem(si);
                this.menuNode.option=[];
                this.addOptions();
                this.setSelectedSearchValue( si.id);
                // var newSearch = {value: si.id, label: newSearchText};
                // this.menuNode.addOption(newSearch);
                // this.menuNode.set("value", si.id);
               // this.showBtn.setDisabled(false);
                console.log(' Add search:' + newSearchText);
                this.collectionPane.savedSearch(si,1);
            },

            _removeSearch: function (cObj) {
                // Remove Saved Search

                //  var seaID = cObj.id;
                var seaID = this.getSelectedSearchValue();
                if (seaID === "default") return;
                localStorage.removeItem("sItem-" + seaID);
                console.log('cleared  ' + seaID);

                // Remove from list ...
                // var ColStr = $('#gSvSearch').find(":selected").remove();
                //  this.menuNode.options = ArrayUtil.filter(this.menuNode.options, function(item, index){
                //      return item.value!==seaID  });
                this.menuNode.option=[];
                this.addOptions();
                //this.menuNode.removeOption(seaID);

                this.collectionPane.savedResults('All',1);

            },
            showSearchResults: function (sp, savedSearch) {


                var collId = this.getSelectedSearchValue();
                var searchTitle = this.getSelectedSearchDisplayedValue();

                var search = CollectionBase.getSearchById(collId);
                this.lastQuery = search;
                this.collectionPane.lastCollectionsQuery = search;
                var mda = this.collectionPane.savedSearch(search);

                var dp = registry.byId("itemDropPane");
                dp.set("label", "Results from Search " + searchTitle);
                dp.set("title", "Results from Search " + searchTitle);

            },

            saveSearchItem: function (SeaItem) {

                var key = "sItem-" + SeaItem.id;
                localStorage.setItem(key, JSON.stringify(SeaItem));
                return key;

            },
        });

        return oThisClass;
    });
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
        "dojo/text!./templates/SavedSearches.html",
        "dojo/i18n!../nls/resources",
        "app/collection/CollectionComponent",
        "app/search/DropPane",
        "dijit/form/Select",
        "dijit/form/Button"
    ],
    function(declare, lang, Templated, template, i18n, CollectionComponent) {

        var oThisClass = declare([CollectionComponent], {

            i18n: i18n,
            templateString: template,
            label: "Saved Search",
            open: true,
            postCreate: function () {
                this.inherited(arguments);

                var sea = this.getSavedSearches();

                for (var k in sea) {
                    var seak = sea[k].val;
                    var colOpt = [{value: seak.id, title: seak.searchUrl, value: seak.searchText}];
                    this.menuNode.addOption(colOpt);
                }
            },
            getSavedSearches: function (qField, query) {
                var sea = this.findLocalItems("sItem");
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

                //var sUrl='http://cinergi.sdsc.edu/geoportal/?q=';
                var port = location.port === 80 ? "" : ':' + location.port;
                var sUrl = location.protocol + "//" + location.hostname + port + location.pathname + '?q=';
                var ss = JSON.parse(localStorage.getItem("saveSearch"));
                var sa = ss.query.bool.must;
                var sQry = '';
                for (var i in sa) {
                    sQry = sa[i].query_string.query;
                }

                if (sQry.length < 2) {
                    alert('Empty Query ');
                    return;
                }
                sUrl = sUrl + sQry;
                //var seaID = cObj.id.substr(6);
                var newSearchText = sQry;

                var nid = this.createUUID();
                var si = this.searchItem(nid, newSearchText, sUrl, ss);
                this.saveSearchItem(si);

                var newSearch = $('<option value="' + si.id + '" >' + newSearchText + '</option>');
                var sb = $('#gSvSearch');
                sb.append(newSearch);
                console.log(' Add search' + newSearchText);

            },

            _removeSearch: function (cObj) {
                // Remove Saved Search

                var seaID = cObj.id;
                localStorage.removeItem(seaID);
                console.log('cleared  ' + seaID);

                // Remove from list ...
               // var ColStr = $('#gSvSearch').find(":selected").remove();
                this.menuNode.options = ArrayUtil.filter(this.menuNode.options, function(item, index){
                    return item.value!==seaID  });
            },
            show_cinergi: function (sp, savedSearch) {
                // Show DDH records on search page
                sType = "csw";
                var aggUrl;
                var startP = this.curPage * 10;
                if (typeof sp !== "undefined") {
                    startP = sp * 10;
                    this.curPage = sp;
                    $("#PageCnt").html("Page " + this.curPage);
                }

                var bref = 'http://132.249.238.169:8080/geoportal/opensearch?f=json&from=' + startP + '&size=10&sort=sys_modified_dt:desc&esdsl={"query":{"bool":{"must":[{"query_string":{"analyze_wildcard":true,"query":"';
                var eref = '","fields":["_source.title^5","_source.*_cat^10","_all"],"default_operator":"and"}}]}}}';

                if (savedSearch) {
                    aggUrl = savedSearch;
                } else {
                    var inp = $("#gSvSearch option:selected").text();

                    var inJ = inp.split(" ").join('+');
                    var inParams = '&from=' + startP + '&q=' + inJ;

                    aggUrl = bref + inJ + eref;
                }

                container.find('.g-item-card').each(function (d) {
                    $(this).remove();
                });

                mdArray = [];

                var uniq = $('#' + mdRecordsId);
                var cp = $('<div class="g-drop-pane dijitTitlePane" id="' + recordsDropPaneId + '" widgetid="' + recordsDropPaneId + '">');

                $.ajax({
                    type: "GET",
                    url: aggUrl,
                    dataType: 'json',
                    data: {"datatype": "query"},
                    contentType: 'application/json',
                    success: function (data) {
                        //console.log(data);
                        var ha = [];

                        if (data.hits) {
                            ha = data.hits.hits;
                            var hal = data.hits.total;

                        } else {
                            ha = data.results;
                            var hal = data.total;
                        }

                        totRecords = hal;

                        $("#PageTotals").html("Total Records " + hal);
                        for (i = 0; i < ha.length; i++) {
                            if (ha[i]._id) {
                                var hid = ha[i]._id;
                            } else {
                                var hid = ha[i].id;
                            }
                            var src_title = ha[i]._source.title;
                            var src_desc = ha[i]._source.description;
                            var src_fileid = ha[i]._source.fileid;

                            var idlink = 'http://datadiscoverystudio.org/geoportal/rest/metadata/item/' + hid + '/html';
                            var col = [];
                            var mdRec = mdRecord(hid, src_fileid, src_title, idlink, src_desc, col);

                            mdArray.push(mdRec);

                            var gCard = recordPanelItem(mdRec);
                            cp.append(gCard);
                        }


                        uniq.append(cp);
                        uniq.show();

                        var sb = $('#' + recordsDropPaneId + '_titleBarNode');
                        var tlab = sb[0].childNodes[0];
                        tlab.nodeValue = "Results - DDS Records for Saved Search  " + inp;

                        sb.hide();

                        sb.show();

                    },
                    error: function (xhr, status, error) {
                        console.log(xhr);
                    }
                });
            },
            saveSearchItem: function (SeaItem) {

            var key = "sItem-"+ SeaItem.id;
            localStorage.setItem(key, JSON.stringify(SeaItem) );
            return key;

        }
        });

        return oThisClass;
    });
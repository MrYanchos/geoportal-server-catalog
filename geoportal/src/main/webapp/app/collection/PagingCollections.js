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
        "dojo/on",
        "dojo/dom-class",
        "dojo/number",
        "dojo/topic",
        "dijit/InlineEditBox",
        "dijit/form/Select",
        "dijit/form/NumberTextBox",
        "app/context/app-topics",
        "app/collection/coll-topics",
        "dojo/text!./templates/PagingCollections.html",
        "dojo/i18n!app/nls/resources",
        "app/collection/CollectionComponent",
        "app/etc/util"],
    function (declare, lang, on, domClass, djNumber, topic, InlineEditBox, Select, NumberTextBox, appTopics, colllTopics, template, i18n, CollectionComponent, util) {

        var oThisClass = declare([CollectionComponent], {

            i18n: i18n,
            templateString: template,

            hasLess: false,
            hasMore: false,
            nextStart: -1,
            numHits: 0,
            numPerPage: null,
            showPageCount: null,
            maxShowPageCount: null,
            maxShowPageCountText: null,
            previousStart: -1,
            start: 1,

            typePlural: null,
            typeSingular: null,

            postCreate: function () {
                this.inherited(arguments);
                this.typePlural = i18n.search.resultCount.itemPlural;
                this.typeSingular = i18n.search.resultCount.itemSingular;
                if (typeof this.numPerPage === "undefined" || this.numPerPage === null) {
                    this.numPerPage = AppContext.appConfig.searchResults.numPerPage;

                }
                if (typeof this.numPerPage === "undefined" || this.numPerPage === null) {
                    this.numPerPage = 10;
                }
                this.numPerPageNode.set("value", this.numberPerPage);

                if (typeof this.showPageCount === "undefined" || this.showPageCount === null) {
                    this.showPageCount = AppContext.appConfig.searchResults.showPageCount;
                }
                if (typeof this.showPageCount === "undefined" || this.showPageCount === null) {
                    this.showPageCount = false;
                }

                if (typeof this.maxShowPageCount === "undefined" || this.maxShowPageCount === null) {
                    this.maxShowPageCount = AppContext.appConfig.searchResults.maxShowPageCount;
                }
                if (typeof this.maxShowPageCount === "undefined" || this.maxShowPageCount === null) {
                    this.maxShowPageCount = 9999;
                }
                if (typeof this.maxShowPageCountText === "undefined" || this.maxShowPageCountText === null) {
                    this.maxShowPageCountText = AppContext.appConfig.searchResults.maxShowPageCountText;
                }
                if (typeof this.maxShowPageCountText === "undefined" || this.maxShowPageCountText === null) {
                    this.maxShowPageCountText = ">10k";
                }

                var self = this;
                topic.subscribe(appTopics.itemRemove, function (params) {
                    if (params.collectionPane && self.collectionPane === params.collectionPane) {
                        self.numHits = self.numHits - 1;
                        self._renderCount();
                        self._renderPaging();
                    }
                });
                topic.subscribe(colllTopics.collectionRefreshRequest, function (params) {
                    if (params.collectionPane && self.collectionPane === params.collectionPane) {
                        self.start = self._start;
                        self.savedResults();
                    }
                });
            },

            /* events ========================================================== */

            firstButtonClicked: function () {
                if (this.hasLess) {
                    this.start = 1;
                    this.collectionPane.start = 1;
                    switch (this.collectionPane.displayResultType){
                        case "search":
                            this.savedSearch(this.collectionPane.lastSavedField, this.collectionPane.start);
                        case "collection":
                        default:
                            this.savedResults(this.collectionPane.lastSavedField, this.collectionPane.lastSavedQuery,this.collectionPane.start);
                    }
                }
            },

            previousButtonClicked: function () {
                if (this.hasLess) {
                    this.start = this.previousStart;
                    this.collectionPane.start = this.previousStart;
                    switch (this.collectionPane.displayResultType){
                        case "search":
                            this.savedSearch(this.collectionPane.lastSavedField, this.collectionPane.start);
                        case "collection":
                        default:
                            this.savedResults(this.collectionPane.lastSavedField, this.collectionPane.lastSavedQuery,this.collectionPane.start);
                    }
                }
            },

            nextButtonClicked: function () {
                if (this.hasMore) {
                    this.start = this.nextStart;
                    this.collectionPane.start = this.nextStart;
                    switch (this.collectionPane.displayResultType){
                        case "search":
                            this.savedSearch(this.collectionPane.lastSavedField, this.collectionPane.start);
                        case "collection":
                        default:
                            this.savedResults(this.collectionPane.lastSavedField, this.collectionPane.lastSavedQuery,this.collectionPane.start);
                    }
                }
            },

            numPerPageNodeChanged: function () {
                var oldPerPage = this.numPerPage;
                var oldStart = this.start;

                this.numPerPage = parseInt(this.numPerPageNode.value);

                var itemEnd = oldPerPage + (oldStart - 1);
                var newStart = Math.floor(itemEnd / this.numPerPage);
                if (newStart > 0) {
                    this.start = newStart;
                } else {
                    this.start = 1;
                }

                this._hasMore();
                if (this.hasMore) {
                    switch (this.collectionPane.displayResultType){
                        case "search":
                            this.savedSearch(this.collectionPane.lastSavedField, this.collectionPane.start);
                        case "collection":
                        default:
                            this.savedResults(this.collectionPane.lastSavedField, this.collectionPane.lastSavedQuery,this.collectionPane.start);
                    }
                }
            },

            goToPageNodeUpdated: function () {
                this.start = parseInt(this.goToPageNode.value - 1) * this.numPerPage + 1;
                this._hasMore();
                if (this.hasMore) {
                    switch (this.collectionPane.displayResultType){
                        case "search":
                            this.savedSearch(this.collectionPane.lastSavedField, this.collectionPane.start);
                        case "collection":
                        default:
                            this.savedResults(this.collectionPane.lastSavedField, this.collectionPane.lastSavedQuery,this.collectionPane.start);
                    }
                }
            },


            processSavedResults: function (records, totalRecords, nextPage, startRec, endRec) {
                this.start = 1;
                var nHits = totalRecords;
                var nStart = startRec;
                if (nStart < 1) nStart = 1;
                this.numHits = nHits;
                this._start = nStart;

                this._renderCount();
                this._renderPaging(records);
            },

            _renderCount: function () {
                var nHits = this.numHits;
                var sType = this.typePlural;
                if (nHits === 1) sType = this.typeSingular;
                var s = i18n.search.resultCount.countPattern;
                s = s.replace("{count}", "" + djNumber.format(nHits, {}));
                s = s.replace("{type}", sType);
                this.setNodeText(this.countNode, s);
                if (this.searchPane) this.searchPane.lastQueryCount = nHits;
            },
            _hasMore: function () {
                var nStart = this._start, nHits = this.numHits, nPer = this.numPerPage;
                this.hasMore = false;
                this.nextStart = -1;
                var nNext = nStart + nPer;
                if (nHits >= nNext) {
                    this.hasMore = true;
                    this.nextStart = nNext;
                }
            },
            _renderPaging: function (pagingResponse) {
                var nStart = this._start, nHits = this.numHits, nPer = this.numPerPage;

                this._hasMore();
                // this.hasMore = false;
                // this.nextStart = -1;
                // var nNext = nStart + nPer;
                // if (nHits >= nNext) {
                //   this.hasMore = true;
                //   this.nextStart = nNext;
                // }

                if (pagingResponse) {
                    this.hasLess = false;
                    this.previousStart = -1;
                    if (nStart > 1) {
                        this.hasLess = true;
                        this.previousStart = nStart - parseInt(this.numPerPageNode.value);
                        if (this.previousStart < 1) this.previousStart = 1;
                    }
                }

                var sPage = "";
                if (this.showPageCount) {
                    sPage = this.i18n.search.paging.pageCountPattern;
                } else {
                    sPage = this.i18n.search.paging.pagePattern;
                }
                if (nHits > nPer) {
                    var nPage = 1;
                    if (nStart > 1) {
                        nPage = Math.floor(nStart / nPer) + 1;
                    }
                    // sPage = this.i18n.search.paging.pagePattern;
                    sPage = sPage.replace("{page}", "" + nPage);
                } else {
                    // sPage = this.i18n.search.paging.pagePattern;
                    sPage = sPage.replace("{page}", "" + 1);
                }
                if (this.showPageCount) {
                    var nTotalPages = Math.round(nHits / nPer);
                    if (nTotalPages < this.maxShowPageCount) {
                        sPage = sPage.replace("{pages}", "" + nTotalPages);
                    } else {
                        sPage = sPage.replace("{pages}", "" + this.maxShowPageCountText);
                    }
                }
                this.setNodeText(this.pagePatternNode, sPage);

                this.goToPageNode.set("value", nPage);

                if (this.hasLess) {
                    domClass.remove(this.firstButton.parentNode, "disabled");
                    domClass.remove(this.previousButton.parentNode, "disabled");
                } else {
                    domClass.add(this.firstButton.parentNode, "disabled");
                    domClass.add(this.previousButton.parentNode, "disabled");
                }
                if (this.hasMore) {
                    domClass.remove(this.nextButton.parentNode, "disabled");
                } else {
                    domClass.add(this.nextButton.parentNode, "disabled");
                }
                if (nHits > 0) {
                    this.pagingNode.style.display = "";
                } else {
                    this.pagingNode.style.display = "none";
                }
            }

        });

        return oThisClass;
    });
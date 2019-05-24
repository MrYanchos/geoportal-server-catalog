define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/query",
        "dojo/dom-class",
        "dojo/topic",
        "app/context/app-topics",
        "dijit/registry",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/CollectionPane.html",
        "dojo/i18n!app/nls/resources",
        "dojo/request",
        "app/context/AppClient",
        "app/collection/ItemsPane",
        "app/collection/CollectionBase",
        "app/collection/CollectionRunInJupyter"
    ],
    function (declare, lang, array, query, domClass, topic, appTopics, registry,
              _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n,
              dojoRequest, AppClient, ItemsPane, CollectionBase,
              CollectionRunInJupyter
    ) {

        var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            i18n: i18n,
            templateString: template,

            defaultSort: null,
            showItemsOnStart: true,
            lastQuery: null,
            lastQueryCount: 0,
            lastQueryWasMyContent: false,
            highlightQuery: null,
            lastSavedSearchObject: null,
            lastCollectionsQuery: null,
            lastCollectionsSearch: null,
            displayResultType: "collection", // collection or search for

            nextStart: -1,
            numHits: 0,
            numPerPage: 10,
            showPageCount: null,
            maxShowPageCount: null,
            maxShowPageCountText: null,
            previousStart: -1,
            start: 1,

            _dfd: null,

            postCreate: function () {
                this.inherited(arguments);
                if (this.defaultSort === null) {
                    this.defaultSort = AppContext.appConfig.searchResults.defaultSort;
                }
                var self = this;
                this.own(topic.subscribe(appTopics.itemSave, function (params) {
                        /* need to handle:
                        exists
                        exists in collection: do not need to add
                        exists, add to collection
                        does not exist. add to collection or default
                         */

                        if (params.item) {
                            var item = params.item;
                            var mds = CollectionBase.getMdRecords('id', item._id);
                            var collections = [];
                            if (mds.length == 0) {
                                //id, fileId, title, link, description, collections
                                if (params.collection) {
                                    collections.push(params.collection);
                                }
                                var idlink = 'http://datadiscoverystudio.org/geoportal/rest/metadata/item/' + item._id + '/html';
                                var md = CollectionBase.mdRecord(item._id, item.fileid, item.title, idlink, item.description, collections)

                            } else {
                                var md = mds[0].val;
                                if (md.collections) {
                                    var found = md.collections.find(function (coll) {
                                        return coll === params.collection;
                                    });
                                    if (found) {
                                        console.log(' addItem, already in assigned collection');
                                        return; // item has not changed. Does not need to be saved.
                                    } else {
                                        md.collections.push(params.collection);
                                    }

                                }
                            }
                            CollectionBase.saveMdRecord(md);
                            topic.publish(appTopics.itemStatusChanged, {item: params.item, status: "saved"})

                            self.refreshResults();
                        }
                    })
                );
                this.own(topic.subscribe(appTopics.itemRemove, function (params) {

                        if (params.item) {
                            var item = params.item;
                            var mds = CollectionBase.getMdRecords('id', item._id);
                            if (mds.length == 0) {
                                console.log(' addRemove, item not found');
                                return;
                            } else {
                                if (params.removeAll) {
                                    localStorage.removeItem("mdRec-" + item._id);
                                    topics.publish(appTopics.itemStatusChanged, {
                                        item: params.item,
                                        collection: 'All',
                                        status: 'removed'
                                    });
                                }
                                var md = mds[0].val;
                                if (md.collections) {
                                    var found = md.collections.find(function (coll) {
                                        return coll === params.collection;
                                    });
                                    if (found) {
                                        md.collections.pop(params.collection);
                                        ;
                                    } else {
                                        console.log(' itemRemove not found in collection');
                                        // return; // remove not needed.
                                    }

                                }
                                if (md.collections.length > 0) {
                                    CollectionBase.saveMdRecord(md);
                                    topic.publish(appTopics.itemStatusChanged, {
                                        item: item,
                                        collection: params.collection,
                                        status: "saved"
                                    });
                                } else {
                                    CollectionBase.removeMdRecord(md);
                                    topic.publish(appTopics.itemStatusChanged, {
                                        item: item,
                                        collection: params.collection,
                                        status: "removed"
                                    });

                                }
                                self.refreshResults();
                                // if (params.collection === 'default') {
                                //     topic.publish(appTopics.itemStatusChanged, {item: item, collection:params.collection, status: false})
                                // }
                            }
                        }
                    })
                );
                this.own(topic.subscribe("app/collection/refresh", function () {
                    self.refreshResults();
                }));

            },

            startup: function () {
                if (this._started) {
                    return;
                }
                this.inherited(arguments);
                var self = this;
                if (this.showItemsOnStart) {
                    // wait a bit for the map
                    setTimeout(function () {
                        self.savedResults({});
                    }, 100);
                }
                array.forEach(this.getCollectionComponents(), function (component) {
                    component.collectionPane = self;
                });
            },

            getCollectionComponents: function () {
                //var components = [this.searchBox,this.resultsPane];
                var components = [];
                array.forEach(this.getChildren(), function (child) {
                    if (child.isCollectionComponent && !child.conditionallyDisabled) {
                        components.push(child);
                    }
                });
                return components;
            },

            savedResults: function (Field, query, startRec=1) {

                this.displayResultType = "collection";
                var components = this.getCollectionComponents();
                var self = this;

                // var mda = CollectionBase.getMdRecords(Field,query);
                var paged = CollectionBase.getMdRecordsPaged(Field, query, startRec, this.numPerPage);
                var mda = paged.records;
                var totalRecords = paged.totalRecords;
                this.previousStart = this.start;
                this.start = startRec;

                array.forEach(components, function (component) {
                    component.processSavedResults(mda, totalRecords, paged.nextPage, paged.startRec, paged.endRec);
                });
                this.lastCollectionsQuery = query;
                this.lastCollectionsSearch = Field;

            },
            refreshResults: function () {
               // this.savedResults(this.lastCollectionsSearch, this.lastCollectionsQuery);
                switch (this.displayResultType) {
                    case "search":
                        this.savedSearch(this.lastSavedSearchObject, this.start);
                        break;
                    case "collection":
                    default:
                        this.savedResults(this.lastCollectionsSearch, this.lastCollectionsQuery, this.start);
                }
            },
            savedSearch: function (savedSearchObj, start) {
                this.displayResultType = "search";
                var components = this.getCollectionComponents();
                var self = this;
                var postData = null;

                // var paged = CollectionBase.getSavedSearchRecords(this.nextPage, esdsl, this.start, this.numPerPage);
                // var mda = paged.records;
                // var totalRecords = paged.totalRecords;
                // this.previousStart = this.start;
                // this.start = paged.endRec;
                // array.forEach(components, function (component) {
                //     component.processSavedResults(mda, totalRecords, paged.nextPage, paged.startRec, paged.endRec);
                // });
                // this.lastQuery = esdsl;
                var bref = 'http://localhost:8081/geoportal/opensearch?f=json&from=' +
                    this.start +
                    '&size=' + this.numPerPage + ' &sort=sys_modified_dt:desc&esdsl=';
                var esdsl = JSON.stringify({query: savedSearchObj.params.query});
                // var esdsl=encodeURI( JSON.stringify({"query":{"bool":{"must":[{"query_string":{"analyze_wildcard":true,"query":"water","fields":["_source.title^5","_source.*_cat^10","_all"],"default_operator":"and"}}]}}}));
                var esdsl = encodeURI(esdsl);
                var url = bref + esdsl;

                if (this._dfd !== null && !this._dfd.isCanceled()) {
                    this._dfd.cancel("Search aborted.", false);
                }

                var dfd = null;
                var mdArray = [];
                var status = registry.byId("collectionStatusNode");
                try {

                    status.show();
                    dfd = this._dfd = dojoRequest.get(url, {handleAs: "json"});

                    dfd.then(function (response) {
                        if (!dfd.isCanceled()) {
                            self.lastSavedSearchObject = savedSearchObj;
                            status.hide();
                            //console.warn("search-response",response);
                            var data = response;
                            if (data.hits) {
                                ha = data.hits.hits;
                                var hal = data.hits.total;
                                var start = data.hits.start;
                                var nextStart = data.hits.nextStart;
                            } else {
                                ha = data.results;
                                var hal = data.total;
                                var start = data.start;
                                var nextStart = data.nextStart;
                            }

                            totRecords = hal;

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
                                var mdRec = CollectionBase.mdRecord(hid, src_fileid, src_title, idlink, src_desc, col);

                                mdArray.push({key: hid, val: mdRec});


                            }
                            array.forEach(components, function (component) {
                                //items, totalRecords, nextPage, startRec, endRec
                                //mda, totalRecords, paged.nextPage, paged.startRec, paged.endRec
                                component.processSavedResults(mdArray, totRecords, null, start, nextStart);
                            });
                        }
                    }).otherwise(function (error) {
                        if (!dfd.isCanceled()) {
                            if (error && error.dojoType && error.dojoType === "cancel") {
                            } else {
                                console.warn("search-error");
                                console.warn(error);
                                array.forEach(components, function (component) {
                                    component.processError(error);
                                });
                            }
                        }
                        status.hide();
                    });

                    return dfd;
                } catch (error) {
                    console.warn("search-error");
                }

            },
        });

        return oThisClass;
    });
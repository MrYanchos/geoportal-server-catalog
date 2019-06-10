define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/query",
        "dojo/dom",
        "dojo/dom-class",
        "dojo/topic",
        "app/context/app-topics",
        "app/collection/coll-topics",
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
        "app/collection/CollectionRunInJupyter",
        "dijit/form/DropDownButton", "dijit/DropDownMenu", "dijit/MenuItem",
    ],
    function (declare, lang, array, query, dom, domClass, topic, appTopics, collTopics, registry,
              _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n,
              dojoRequest, AppClient, ItemsPane, CollectionBase,
              CollectionRunInJupyter,
              DropDownButton, DropDownMenu, MenuItem
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
            tourMenu:null,


            postCreate: function () {
                this.inherited(arguments);
                if (this.defaultSort === null) {
                    this.defaultSort = AppContext.appConfig.searchResults.defaultSort;
                }
                var self = this;

                var menu = new DropDownMenu({ style: "display: none;"});
                var menuItem1 = new MenuItem({
                    label: "Collection Introduction",
                    onClick:  self.startCollectionTour
                });
                menu.addChild(menuItem1);
                menu.startup();

                 this.tourMenu = new DropDownButton({
                    label: "Tour",
                    name: "programmatic2",
                    dropDown: menu,
                    id: "tourButton",

                });
                this.tourMenu.startup();

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
                this.own(topic.subscribe(collTopics.collectionRefreshRequest, function (params) {
                    self.refreshResults();
                }));


            },

            startup: function () {
                if (this._started) {
                    return;
                }
                var self = this;
                $("a[href='#collectionPanel']").on("shown.bs.tab",function(e) {

                   var tour=  dom.byId("tourDropDownButtonContainer");
                    tour.appendChild(self.tourMenu.domNode);
                });
                $("a[href='#collectionPanel']").on("hide.bs.tab",function(e) {

                    var tour=  dom.byId("tourDropDownButtonContainer");
                    tour.innerHTML = "";
                });

                this.inherited(arguments);

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

            },startCollectionTour: function(){
                var tour = new Tour({
                    name:"collectionTour",
                    steps: [
                        {
                            element:"#collectionTab",
                            placement:"right",
                            orphan: true,
                            title: "DDStudio Collections Interface",
                            content: "The Collection page allows you to save search records into collections, " +
                                "which can be sent to a JupyterHub, or saved as a CSV file to share or use in processing."  +
                                "<br/>Works best in Chrome."
                        },
                        // {
                        //     element:"#collectionPanelLeft",
                        //     placement:"right",
                        //     orphan: true,
                        //     title: "Collections vs Saved Search",
                        //     content: "A <i>collection</i> is a set of saved metadata records. Records are saved from the results list in " +
                        //         "the <b>Search</b> tab, can can be organized in the <b>Collection</b> tab. " +
                        //         " A <i>saved search</i> is a query based on the facets of a search. Only the query is saved; the individual records are not " +
                        //         "saved. From a saved search, you can save individual records. "
                        // },
                        {
                            element: "#collectionDropPane",
                            backdrop: true,
                            title: "Show Saved Results ",
                            content: "Records saved on the Search page show up on the Collection page, " +
                                "temporarily stored in your browser storage until put into a Collection and Exported." +
                                " View initially under <i>Show All</i> & <i>Unassigned Results</i>"
                        },
                        {
                            element: "#addCollectionBtn",
                            placement:"right",
                            backdrop: true,
                            title: "Create New Collection ",
                            content: "Make a container for your records: click <b>New Collection</b> and supply a name –" +
                                " this will become part of a filename. New collection name appears under Saved Collections."
                        }
                        ,
                        // {
                        //     element: "#saveSelectGroup",
                        //     placement:"right",
                        //     backdrop: true,
                        //     title: "View Items in a Collection",
                        //     content: "<i>Click</i> on a collection from list and click <b>View</b>."
                        // },
                        {
                            element: "#itemDropPane",
                            placement:"left",
                            backdrop: true,
                            title: "Collection Items",
                            content: "<i>Click</i> to select a Saved Collection, " +
                                "then click <b>Add to Collection</b> to add records to that collection."
                        },
                        {
                            element: "#exportBtn",
                            backdrop: true,
                            title: "Export Collection ",
                            content: "Save results to a CSV file with <b>Export Collection</b> – call them up later," +
                                " use in applications, or transfer to another computer or person."
                        },


                        {
                            element: "#importDropPane",
                            backdrop: true,
                            title: "Import collection ",
                            content: "Click <b>Select a CSV file</b>, select a stored collection file (CSV), " +
                                "then click <b>Import File</b>. Now <i>Refresh</i> (circular arrow) your browser. " +
                                "The imported collection will appear under Saved Collections," +
                                " and its items can be Viewed under both <i>Show All</i> and the <i>collection</i> name." +
                                " You can now add or remove items in this collection and Export again," +
                                " or create a New Collection and add results to more than one collection."
                        }
                        ,
                        {
                            element: "#collectionTab",
                            orphan: true,
                            title: " ",
                            content: "That’s enough to get started with. Now try creating a New Collection with your" +
                                " search results! If you find bugs, please email us at DataDiscoveryStudio@gmail.com" +
                                " – we’re always improving."
                        },
                        //         ,
                        //         {
                        //             element: "#collectionMenuNode",
                        //             backdrop: true,
                        //             title: "Select a collection",
                        //             content: "<i>Click</i>i on a collection from list and click <b>View</b>. "
                        //
                        //         }
                        //         ,
                        //
                        //         {
                        //             element: "#viewBtn",
                        //             placement:"right",
                        //             backdrop: true,
                        //             title: "View",
                        //             content: "To see items in a collection, click <b>View</b>. "
                        //         },
                        //         // {
                        //         //     element: "#searchDropPane",
                        //         //     backdrop: true,
                        //         //     title: "Show search results",
                        //         //     content: "Save searches are shown here."
                        //         // }
                        //         // ,
                        //         // {
                        //         //     element: "#newSearchBtn",
                        //         //     backdrop: true,
                        //         //     title: "Save a search",
                        //         //     content: " When you have a search you would like to save, click <b>Save</b> to create a new Search. "
                        //         // },
                        //         {
                        //             element:"#collectionPanelLeft",
                        //             placement:"right",
                        //             //orphan: true,
                        //             backdrop: true,
                        //             title: "Sharing collections: Export and Import",
                        //             content: "You can export your saved records as a collection to a CSV file. " +
                        //                 "You can import these files into another browser," +
                        //                 "or use them as a basis for processing the data referred to in the collection."
                        //         },
                        //         {
                        //         element:"#importDropPane",
                        //         placement:"right",
                        //        // orphan: true,
                        //             backdrop: true,
                        //         title: "Collections CSV files",
                        //         content: "The exported CSV files contain a description of the collection (id, title, description)" +
                        //             " and a summary of metadata record. The summary record includes the id, title, description and " +
                        //             "a link to the DDStudio where you can retrieve the record."
                        // },
                        //
                        //
                        //         {
                        //             element: "#importDropPane",
                        //             backdrop: true,
                        //             title: "Import a saved search",
                        //             content: "You can modify your CSV file, and add descriptions to collections, and import." +
                        //                 " This allows you to transfer collections beteween browsers or share with others."
                        //         }
                        //         ,
                        //         {
                        //             element: "#overwriteCollectionMD",
                        //             backdrop: true,
                        //             title: "Merge or Overwirte",
                        //             content: "You can toggle to <b>overwrite</b> the details of a collection, such as collection name," +
                        //                 " or merge to add new records to an older collection."
                        //         },
                        //         {
                        //             element: "#importFile",
                        //             backdrop: true,
                        //             title: "Import file",
                        //             content: "Select a file, and click <b>Import File</b> to import records."
                        //         }
                    ]});

// Initialize the tour
                tour.init();

// Start the tour

                tour.restart();
                // tour.start();
            }

        });

        return oThisClass;
    });
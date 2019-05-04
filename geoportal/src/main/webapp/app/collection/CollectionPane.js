
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
        "app/collection/CollectionBase"
    ],
function(declare, lang, array, query, domClass, topic, appTopics, registry,
         _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n,
         dojoRequest, AppClient,ItemsPane , CollectionBase) {

    var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        i18n: i18n,
        templateString: template,

        defaultSort: null,
        showItemsOnStart: true,

        lastQuery: null,
        lastQueryCount: 0,
        lastQueryWasMyContent: false,
        highlightQuery: null,

        _dfd: null,

        postCreate: function() {
            this.inherited(arguments);
            if (this.defaultSort === null) {
                this.defaultSort = AppContext.appConfig.searchResults.defaultSort;
            }
            var self = this;
            this.own(topic.subscribe(appTopics.itemSave,function(params){
                 /* need to handle:
                 exists
                 exists in collection: do not need to add
                 exists, add to collection
                 does not exist. add to collection or default
                  */

                if (params.item ){
                    var item = params.item;
                    var mds = CollectionBase.getMdRecords('id', item._id);
                    var collections = [];
                     if (mds.length ==0 ){
                         //id, fileId, title, link, description, collections
                         if (params.collection){
                            collections.push(params.collection);
                         }
                         var idlink = 'http://datadiscoverystudio.org/geoportal/rest/metadata/item/'+item._id+'/html';
                         var md = CollectionBase.mdRecord(item._id, item.fileid, item.title, idlink, item.description, collections)

                     }
                     else {
                         var md = mds[0].val;
                         if (md.collections){
                             var found = md.collections.find(function(coll) {
                                 return coll === params.collection;
                             });
                             if (found){
                                console.log (' addItem, already in assigned collection');
                                return; // item has not changed. Does not need to be saved.
                             } else {
                                 md.collections.push(params.collection);
                             }

                         }
                     }
                    CollectionBase.saveMdRecord(md);
                    topic.publish(appTopics.itemStatusChanged, {item:params.item, status:'saved' } )


                }
            })
            );
            this.own(topic.subscribe(appTopics.itemRemove,function(params){
                if (params.item ) {
                    var mds = CollectionBase.getMdRecords('id', params.item.id);
                    if (mds.length ==0 ){
                        print (' addRemove, item not found');
                        return;
                    }
                    else {
                        if (params.removeAll) {
                            localStorage.removeItem("mdRec-" + params.item.id);
                            topics.publish(appTopics.itemStatusChanged, {item: params.item, collection:'All', status: 'removed'});
                        }
                        var md = mds[0];
                        if (md.collections){
                            var found = md.collections.find(function(coll) {
                                return coll === params.collection;
                            });
                            if (found){
                                md.collections.pop(params.collection);;
                            } else {
                                print (' itemRemove not found in collection');
                                return; // remove not needed.
                            }

                        }
                        self.saveMdRecord(md);
                        if (params.collection === 'default') {
                            topic.publish(appTopics.itemStatusChanged, {item: params.item, collection:params.collection, status: 'removed'})
                        }
                    }
                }
            })
            );
            // topic.subscribe(appTopics.SignedIn,function(params){
            //     if (self._started) self.search();
            // });
        },

        startup: function() {
            if (this._started) {return;}
            this.inherited(arguments);
            var self = this;
            if (this.showItemsOnStart) {
                // wait a bit for the map
                setTimeout(function(){self.savedResults({});},100);
            }
            array.forEach(this.getCollectionComponents(),function(component){
                component.collectionPane = self;
            });
        },

        getCollectionComponents: function() {
            //var components = [this.searchBox,this.resultsPane];
            var components = [];
            array.forEach(this.getChildren(),function(child){
                if (child.isCollectionComponent && !child.conditionallyDisabled) {
                    components.push(child);
                }
            });
            return components;
        },

        savedResults: function (Field, query){
            var components = this.getCollectionComponents();
            var self = this;

            var mda = CollectionBase.getMdRecords(Field,query);
            array.forEach(components, function (component) {
                component.processSavedResults(mda);
            });

        },

    });

    return oThisClass;
});

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
        "app/collection/ItemsPane"],
function(declare, lang, array, query, domClass, topic, appTopics, registry,
         _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n,
         dojoRequest, AppClient,ItemsPane ) {

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
            // var self = this;
            // topic.subscribe(appTopics.BulkUpdate,function(params){
            //     if (self._started) self.search();
            // });
            // topic.subscribe(appTopics.ItemUploaded,function(params){
            //     if (self._started) self.search();
            // });
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
                setTimeout(function(){self.savedItems({});},100);
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

        savedItems: function() {

            var components = this.getCollectionComponents();
            var self = this, params = {urlParams: {}};
            var uri = window.location.search;
            var query = uri.substring(uri.indexOf("?") + 1, uri.length);
            if (query != null && query.length > 0) {
            }
        }

    });

    return oThisClass;
});
/*

*/
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/string",
        "dojo/topic",
        "dojo/request/xhr",
        "dojo/request",
        "dojo/on",
        "app/context/app-topics",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dijit/_WidgetBase",
        "dijit/_AttachMixin",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/Tooltip",
        "dijit/TooltipDialog",
        "dijit/popup",
        "dojo/text!./templates/SavedItemCard.html",
        "dojo/i18n!app/nls/resources",
        "app/collection/CollectionBase",
        "app/etc/util",

    ],
    function(declare, lang, array, string, topic, xhr, request, on, appTopics, domClass, domConstruct,
             _WidgetBase,_AttachMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Tooltip, TooltipDialog, popup,
             template, i18n,  CollectionBase, util) {

        var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            i18n: i18n,
            templateString: template,

            isItemCard: true,
            item: null,
            itemsNode: null,
            itemsPane: null,
            itemIsSaved: true,


            postCreate: function() {
                this.inherited(arguments);
                var self = this;
                // this.own(topic.subscribe(appTopics.ItemOwnerChanged,function(params){
                //     if (self.item && self.item === params.item) {
                //         self._renderOwnerAndDate(self.item);
                //     }
                // }));
                // this.own(topic.subscribe(appTopics.ItemApprovalStatusChanged,function(params){
                //     if (self.item && self.item === params.item) {
                //         self._renderOwnerAndDate(self.item);
                //     }
                // }));
                // this.own(topic.subscribe(appTopics.ItemAccessChanged,function(params){
                //     if (self.item && self.item === params.item) {
                //         self._renderOwnerAndDate(self.item);
                //     }
                // }));


                // this.own(topic.subscribe(appTopics.itemStatusChanged,function(params){
                //     if (self.item && self.item._id === params.item._id && params.status) {
                //         self._renderItemsSaveStatus(self.item, params.status);
                //     }
                // }));
                //collection
                //  on(this,"click", setSavedCard);
                // use a publish/subscribe? for assignEvent, setSavedCard
                // on(this,"click", assignEvent);

                // setSavedCard();
                // assignEvent();

            },

            // startup:  function () {

            //   },

            render: function(item) {


                this._renderTitle(item);

                this._renderDescription(item);
                this._renderCollections(item);

            },

            _mouseenter: function(e) {
                topic.publish("app/collection/OnMouseEnterSavedItem",{item:this.item});
            },

            _mouseleave: function(e) {
                topic.publish("app/collection/OnMouseLeaveSavedItem",{item:this.item});
            },
            onAddCollectionClicked: function(evt){
                this.myTempDialog.show();
            },
            onRemoveCollectionClicked: function(evt){
                this.myTempDialog.show();
            },
            onRemoveMDRecordClicked: function(evt){
                this.myTempDialog.show();
            },

            _renderCollections: function (item) {
                var collections = item.collections;
                var collString = "collections:"
                array.forEach(collections, function(coll){
                    collString = collString + ", " + coll;
                })
                util.setNodeText(this.collectionsNode,collString);

            },
            /*

        DVW 2018-80-23 Restore Logic to allow for highlighting of HTML.
        */
            _renderDescription: function (item, highlight) {
                var desc = item.description;
                if (desc && desc.indexOf("REQUIRED FIELD") > -1 ) {
                    desc = "";
                }
                if (typeof highlight != "undefined" ) {

                    if (typeof highlight.description != "undefined") {

                        desc = highlight.description;
                        util.setNodeHtml(this.descriptionNode, desc);
                    } else {
                        util.setNodeText(this.descriptionNode,desc);
                    }
                } else {util.setNodeText(this.descriptionNode,desc);}

            },
            _renderTitle: function (item, highlight) {
                var title = item.title;
                if (!title || 0 === title.length){
                    title = "Title Not Provided. Identifier: " + item.id;
                }

                if (typeof highlight != "undefined") {
                    if (typeof highlight.title != "undefined") {
                        title = highlight.title;
                    }
                }

                var titleElement = domConstruct.create("a",{
                   // href: item.mdlink +"/html",
                    href: item.mdlink ,
                    target: "_blank",
                    title: title ,
                    "aria-label": title,
                    innerHTML: title
                },this.titleNode);





            },
        });

        return oThisClass;

    });
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
        "dijit/registry",
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
    function(declare, lang, array, string, topic, xhr, request, on, appTopics, domClass, domConstruct,registry,
             _WidgetBase,_AttachMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Tooltip, TooltipDialog, popup,
             template, i18n,  CollectionBase, util) {

        var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            i18n: i18n,
            templateString: template,

            isItemCard: true,
            mdRecord: null,
            itemsNode: null,
            itemsPane: null,
            itemIsSaved: true,


            postCreate: function() {
                this.inherited(arguments);
                var self = this;
                this.own(topic.subscribe("app/collection/selectCollection",function(params){
                     self._renderActionStatus(self.mdRecord);
                }));
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

            render: function(mdRecord) {
                this.mdRecord = mdRecord;

                this._renderTitle(mdRecord);

                this._renderDescription(mdRecord);
                this._renderCollections(mdRecord);
                this._renderActionStatus(mdRecord); // enable/disable buttons

            },

            _mouseenter: function(e) {
                topic.publish("app/collection/OnMouseEnterSavedItem",{item:this.mdRecord});
            },

            _mouseleave: function(e) {
                topic.publish("app/collection/OnMouseLeaveSavedItem",{item:this.mdRecord});
            },
            onAddCollectionClicked: function(evt){
                var collTxtBox = registry.byId("collectionMenuNode");
                var coll= collTxtBox.value;
                CollectionBase._addCollectionMdRecord(this.mdRecord,coll);
                this._renderCollections(this.mdRecord)
                this._renderActionStatus(mdRecord);
                // this.myTempDialog.show();
            },
            onRemoveCollectionClicked: function(evt){
                var collTxtBox = registry.byId("collectionMenuNode");
                var coll= collTxtBox.value;
                CollectionBase._removeCollectionMdRecord(this.mdRecord,coll);
                this._renderCollections(this.mdRecord)
                this._renderActionStatus(mdRecord);
                // this.myTempDialog.show();
            },
            onRemoveMDRecordClicked: function(evt){

                CollectionBase.removeMdRecord(this.mdRecord);
                this.mdRecord.title ='deleted';
                this._renderTitle(this.mdRecord)
            },

            _renderCollections: function (mdRecord) {
                var collections = mdRecord.collections;
                var collString = "collections:"
                array.forEach(collections, function(coll){
                    collString = collString + ", " + coll;
                })
                util.setNodeText(this.collectionsNode,collString);

            },
            /*

        DVW 2018-80-23 Restore Logic to allow for highlighting of HTML.
        */
            _renderDescription: function (mdRecord, highlight) {
                var desc = mdRecord.description;
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
            _renderTitle: function (mdRecord, highlight) {
                var title = mdRecord.title;
                if (!title || 0 === title.length){
                    title = "Title Not Provided. Identifier: " + mdRecord.id;
                }

                if (typeof highlight != "undefined") {
                    if (typeof highlight.title != "undefined") {
                        title = highlight.title;
                    }
                }

                var titleElement = domConstruct.create("a",{
                   // href: mdRecord.mdlink +"/html",
                    href: mdRecord.mdlink ,
                    target: "_blank",
                    title: title ,
                    "aria-label": title,
                    innerHTML: title
                },this.titleNode);

            },
            _renderActionStatus: function(mdRecord){
              var add = this.addButton ;
              var rmColl = this.rmCollectionButton;
              var rmMd = this.rmMdRecordButton;

                var collTxtBox = registry.byId("collectionMenuNode");
                var coll= collTxtBox.value;
                switch (CollectionBase._inCollectionMdRecord(mdRecord, coll)){
                    case true:
                          add.disabled = true;
                        add.title = "item in "+ coll;
                          rmColl.disabled =false;
                        rmColl.title = "remove item from " + coll;

                          break;
                    case false:
                          add.disabled = false;
                        add.title = "add item to " + coll;
                        rmColl.disabled =true;
                        rmColl.title = " not in " + coll;
                        break;
                    default:
                        add.disabled = true;
                        add.title = "Select a collection";
                        rmColl.disabled =true;
                        rmColl.title = "Select a collection";
                        break;
              }
            },
        });

        return oThisClass;

    });
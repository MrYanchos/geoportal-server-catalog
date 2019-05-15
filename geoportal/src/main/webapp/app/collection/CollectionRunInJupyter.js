define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/io-query",
        "dijit/registry",
        "dojo/text!./templates/CollectionRunInJupyter.html",
        "dojo/i18n!app/nls/resources",
        "app/collection/CollectionComponent",
        "app/collection/CollectionBase",
        "app/common/JupyterDialog",],
    function (declare, lang, array, domConstruct, ioQuery, registry, template, i18n, CollectionComponent,CollectionBase, JupyterDialog) {
        var oThisClass = declare([CollectionComponent], {

            i18n: i18n,
            templateString: template,
            records: [],
            encodedRecords : null,


            recordPackage: function (id, collectionId, title,  recordIds,packageType, link ) {
                var self = this;
                var recPack = {
                    "id": id,
                    "collectionId": collectionId,
                    "title": title,
                    "collectionlink": link,
                    "packageType": packageType,

                    "recordIds": recordIds,

                };
                return recPack;
            },
            recordId: function (id, link) {
                var self = this;
                var recIds = {
                    "id": id,
                    "recordlink": link,

                };
                return recIds;
            },
            postCreate: function(){
                this.inherited(arguments);
                this.sendSavedPage.title="Send Page";
                this.sendSavedCollection.title="Send Collection";


            },
            startup: function(){

            },
            processSavedResults: function(records, totalRecords, nextPage, startRec, endRec){
                if (totalRecords > 20){
                    this.sendSavedCollection.set({"display": "hidden", disabled: true})  ;
                }
                this.records = this.createRecordIds(records);
                var package = this.createRecordPackage("included","");
                this.encodedRecords = JSON.stringify(package);


             },
            createRecordPackage: function(packageType, link){

                var collection =registry.byId("collectionMenuNode");
                var collID = collection.value;
                var collName = collection.get("displayedValue");
                var id = CollectionBase.createUUID();
                var rp = this.recordPackage(id, collID, collName,packageType, link, this.records);

                return rp;

            },
            createRecordIds: function(savedRecords) {
                var self = this;
                var records = [];
                array.forEach(savedRecords, function(rec){
                    var recId = self.recordId( rec.val.id, "");

                    records.push(recId);
                })
                return records;
            },
            click_sendSavedPage: function(evt) {

                    var dialog = new JupyterDialog();
                    dialog.show(this.encodedRecords);

            },
            click_sendSavedCollection: function(evt) {},
            click_sendSavedChecked: function(evt) {},
        });

            return oThisClass;
})
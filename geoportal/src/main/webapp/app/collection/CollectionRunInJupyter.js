define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/io-query",
        "dojo/text!./templates/CollectionRunInJupyter.html",
        "dojo/i18n!app/nls/resources",
        "app/collection/CollectionComponent",
        "app/common/JupyterDialog",],
    function (declare, lang, array, domConstruct, ioQuery, template, i18n, CollectionComponent, JupyterDialog) {
        var oThisClass = declare([CollectionComponent], {

            i18n: i18n,
            templateString: template,
            records: [],


            recordPackage: function (id, collectionId, title,  recordIds,packageType, link ) {
                var self = this;
                var recPack = {
                    "id": id,
                    "collectionId": collectionId,
                    "title": title,
                    "collectionlink": link,
                    "packageType": packageType,
                    "description": description,
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

            },
            startup: function(){

            },
            processSavedResults: function(records, totalRecords, nextPage, startRec, endRec){
                this.sendSavedPage.title="Send Page";
                this.sendSavedCollection.title="Send Collection";
                if (totalRecords > 20){
                    this.sendSavedCollection.set({"display": "hidden", disabled: true})  ;
                }
                this.records = records;

             },
            createRecordPackage: function(packageType, link){

                var collection =registry.byId("collectionMenuNode");
                var collID = collection.value;
                var collName = collection.get("displayedValue");
                var id = CollectionBase.createUUID();
                var rp = new recordPackage(id, collectionId, collName,packageType, link, records);



            },
            createRecordIds: function(saveRecords) {
                var records = [];
                Array.foreach(savedRecords, function(rec){
                    var recId = new recordId( rec.id, "");

                    records.put()
                })
                return records;
            },
            click_sendSavedPage: function(evt) {

                    var dialog = new JupyterDialog();
                    dialog.show(this.records);

            },
            click_sendSavedCollection: function(evt) {},
            click_sendSavedChecked: function(evt) {},
        });

            return oThisClass;
})
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


            recordPackage: function (id, title, packageType, link,  recordIds) {
                var self = this;
                var recPack = {
                    "id": id,
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
            click_sendSavedPage: function(evt) {

                    var dialog = new JupyterDialog();
                    dialog.show(this.records);

            },
            click_sendSavedCollection: function(evt) {},
            click_sendSavedChecked: function(evt) {},
        });

            return oThisClass;
})
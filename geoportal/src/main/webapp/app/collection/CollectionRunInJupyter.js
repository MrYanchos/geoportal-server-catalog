define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/io-query",
        "dijit/registry",
        "dojo/text!./templates/CollectionRunInJupyter.html",
        "dojo/i18n!app/nls/resources",
        "app/collection/CollectionComponent",
        "app/collection/CollectionBase",
        "app/common/JupyterDialog",
    "app/context/AppClient"],
    function (declare, lang, array, dom, domConstruct, ioQuery, registry, template, i18n,
              CollectionComponent, CollectionBase, JupyterDialog,
        AppClient
        ) {
        var oThisClass = declare([CollectionComponent], {

            i18n: i18n,
            templateString: template,
            baseUrl:null,
            records: [],
            encodedRecords: null,

/* packageType:
standalone: all records included, link null
link: link to endpoint which will serve a standalone json package.
service: known service. Link points to service endpoint, use id or collectionId in service
            */
            recordPackage: function (id, collectionId, title, briefrecords,  packageType="standalone",link, ) {
                var self = this;
                var recPack = {
                    "id": id,
                    "collectionId": collectionId,
                    "title": title,
                    "collectionlink": link,
                    "packageType": packageType,

                    "briefrecords": briefrecords,

                };
                return recPack;
            },

            /*
            recordLink provides (xml/js, on) need to fully decide.
            csw brief record is an
            * identifier,
            * title
            * type(optional)
            * BoundingBox (optional)
            */
            recordId: function (id, link, title) {
                var self = this;
                var recIds = {
                    "identifier": id,
                    "recordlink": link,
                    "title": title,


                };
                return recIds;
            },
            postCreate: function () {
                this.inherited(arguments);
                this.sendSavedPage.title = "Send Page";
                this.sendSavedCollection.title = "Send Collection";
                var thisUrl = require.toUrl(document.URL);

            },
            startup: function () {

            },
            processSavedResults: function (records, totalRecords, nextPage, startRec, endRec) {
                if (totalRecords > 20) {
                    this.sendSavedCollection.set({"display": "hidden", disabled: true});
                } else {
                    this.sendSavedCollection.set({"display": "initial", disabled: false});
                }
                this.records = this.createRecordIds(records);
                var package = this.createRecordPackage("standalone", "");
                this.encodedRecords = JSON.stringify(package);


            },
            createRecordPackage: function (packageType, link) {


                var collID = this.getSelectedCollectionValue();
                var collName = this.getSelectedCollectionDisplayedValue();
                var id = CollectionBase.createUUID();
                //  recordPackage: function (id, collectionId, title, briefrecords,  packageType="standalone",link, ) {
                var rp = this.recordPackage(id, collID, collName,  this.records,packageType, link);

                return rp;

            },
            createRecordIds: function (savedRecords) {
                var self = this;
                var records = [];

                array.forEach(savedRecords, function (rec) {
                    var url = location.origin + location.pathname +"rest/metadata/item";
                    url += "/"+encodeURIComponent(rec.val.id)+"/xml";
                    var recId = self.recordId(rec.val.id, url, rec.val.title.trim(0,20));

                    records.push(recId);
                })
                return records;
            },
            click_sendSavedPage: function (evt) {

                var dialog = new JupyterDialog();
                dialog.show(this.encodedRecords, "collection");

            },
            click_sendSavedCollection: function (evt) {
                var dialog = new JupyterDialog();
                dialog.show(this.encodedRecords, "collection");
            },
            click_sendSavedChecked: function (evt) {
            },
            // can't use dojo/registry, so these isolates code for future change.
            getSelectedCollectionValue: function () {
                var collMenuNode = dom.byId("collectionMenuNode");
                return collMenuNode.value;
            }
            ,
            setSelectedCollectionValue: function (value) {
                var collMenuNode = dom.byId("collectionMenuNode");
                this.collMenuNode.value = value;
            },
            getSelectedCollectionDisplayedValue: function () {
                var collMenuNode = dom.byId("collectionMenuNode");
                return collMenuNode.selectedOptions[0].label;
            },
        });

        return oThisClass;
    })
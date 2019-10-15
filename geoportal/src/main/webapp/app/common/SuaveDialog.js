define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom",
        "dojo/on",
        "dojo/keys",
        "app/common/Templated",
        "dojo/text!./templates/SuaveDialog.html",
        "dojo/i18n!app/nls/resources",
        "dijit/Dialog",
        // "app/common/ModalDialog",
        "dijit/registry",
        "dijit/form/Select",
        "dojo/store/Memory",
        "dijit/form/TextBox",
        "dojo/text!app/context/jupyter_hubs.json",
        "dojox/json/query",
        "dojo/fx/Toggler",
        "dojo/request/iframe",
        "dojo/request"
        // "app/common/OkCancelBar"
    ],
    function (declare, lang, array, dom, on, keys, Templated, template, i18n, ModalDialog, registry, Select, Memory,
              TextBox, hubs, jsonquery, Toggler, iframe, dojoRequest) {

        var oThisClass = declare([Templated], {

            i18n: i18n,
            templateString: template,

            dialog: null,
            title: "Use resource in DD Studio",
            okLabel: "Select",
            cancelLabel: i18n.general.cancel,
            okIconClass: null,
            cancelIconClass: null,
            showOk: true,
            showCancel: true,
            documentId: null,
            collectionJson: null,
            type: "documentId",

            jupyter_hubs_json: hubs,
            jupyter_hubs: dojo.fromJson(hubs),
            toggler: null,

            postCreate: function () {
                // var okCancel = new OkCancelBar({
                //     okLabel: this.okLabel,
                //     cancelLabel: this.cancelLabel,
                //     showOk: this.showOk,
                //     showCancel: this.showCancel,
                //     onOkClicked: function() {
                //         self.onOkClicked();
                //         if (self.hideOnOk) self.hide();
                //     },
                //     onCancelClicked: function() {
                //         self.onCancelClicked();
                //         self.hide();
                //     },
                // });
                // this.footer = okCancel.domNode;
                // this.okCancelBar = okCancel;
                // domConstruct.place(footer,this.contentNode);
                this.inherited(arguments);
                // this.toggler = new Toggler( {node: this.jusername.id});
                // this.toggler.hide();
                this.jusernamegroup.hidden = false;
            },
            updateDialog: function (e) {
                var hub = this.hubMenu.focusNode.textContent;
                if (hub) {
                    var titleQuery = "$.hubs[?title='" + hub + "']";
                    var hubConfig = jsonquery(titleQuery, this.jupyter_hubs);
                    if (hubConfig[0] && hubConfig[0]["login"]) {
                        if ( hubConfig[0]["default_path"]) {
                            this.jusername.set( "value", hubConfig[0]["default_path"]);
                        } else {
                            this.jusername.set( "value", null);
                            this.jusername.set( "placeHolder", "Login Name");
                        }
                        this.jusernameLabel.innerHTML = hubConfig[0]["login"];
                        this.jusernamegroup.hidden = false;
                    } else {
                        this.jusernamegroup.hidden = true;
                    }
                }

            }
            ,
            onOkClicked: function (e) {
                this.execute();
                this.dialog.hide();
            },

            onCancelClicked: function () {
                this.dialog.hide();
            },
            execute: function () {
                var self = this;


                var user = this.jusername.value;

                        var dfd = null;
                        var url = "./rest/collection/toSuave";
                        try {
                            dfd = dojoRequest.post(url, {
                                handleAs: "json",
                                headers: {"Content-Type": "application/json"},
                                data: this.collectionJson
                            });


                            dfd.then(function (response) {
                                if (!dfd.isCanceled()) {
                                    var returnUrl = response;
                                }
                            }).otherwise(function (error) {
                                if (!dfd.isCanceled()) {
                                    if (error && error.dojoType && error.dojoType === "cancel") {
                                    } else {
                                        console.warn("search-error");
                                        console.warn(error);
                                    }
                                }
                            });
                            //return dfd;
                        } catch(error) {
                            console.warn("search-error");
                        }

                        var ancorTag = document.createElement('a');
                        //ancorTag.href = hubUrl;
                        //ancorTag.target = '_blank';
                        // ancorTag.download = 'ConsumptionReport.pdf';
                        //document.body.appendChild(ancorTag);
                        //ancorTag.click();
                        //document.body.removeChild(ancorTag);

                        // window.open("https://google.com/", "_blank");
                        // this.dialog.okCancelBar.showWorking(i18n.general.working,true);
                        // AppContext.appUser.signIn(u,p).then(function(){
                        //     self.dialog.hide();
                        // }).otherwise(function(error){
                        //     if (typeof error === "string") self.handleError(error);
                        //     else self.handleError(i18n.general.error,error);
                        // });
            },

            handleError: function (msg, error) {
                if (error) console.warn(error);
                if (!this.dialog) return;
                this.dialog.okCancelBar.enableOk();
                this.dialog.okCancelBar.showError(msg, false);
            },

            /*
            for an documentId Pass: item, or itemID
            for a collection pass, {collection package json}, 'collection'
             */
            init: function (item, type = "documentId") {
                var self = this;
                this.type=type;
                if (type === "documentId") {
                    if (item !== undefined && item._id) {
                        this.documentId = item._id;

                    } else {
                        this.documentId = item;
                    }

                }
                if (type === 'collection') {
                     this.collectionJson = item;
                }
                this.own(on(this.jusername, "keyup", function (evt) {
                    if (evt.keyCode === keys.ENTER) self.execute();
                }));
            },

            modalShown: function () {
            },
            hide: function () {
                $("#" + this.domNode.id).modal("hide");
            },
            show: function (item, type = "documentId") {
                var self = this;
                this.init(item,type);
                this.dialog = new ModalDialog({
                    content: this.domNode,
                    title: this.title,
                    okLabel: this.okLabel,
                    onHide: function () {
                        self.destroyRecursive(false);
                    },
                    onOkClicked: function () {
                        self.execute();
                    }
                });
                $(this.dialog.domNode).on('shown.bs.modal', function () {
                    self.modalShown();
                });
                this.dialog.show();
            }

        });

        return oThisClass;
    });
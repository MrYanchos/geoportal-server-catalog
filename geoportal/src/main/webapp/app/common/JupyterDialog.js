define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom",
        "dojo/on",
        "dojo/keys",
        "app/common/Templated",
        "dojo/text!./templates/JupyterDialog.html",
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
<<<<<<< Updated upstream
        "dojo/request/iframe"
   // "app/common/OkCancelBar"
    ],
    function(declare, lang,array, dom, on, keys, Templated, template, i18n, ModalDialog,registry,Select,Memory,
             TextBox, hubs, jsonquery, Toggler, iframe) {
=======
        "dojo/request/iframe",
        "dojo/request"
        // "app/common/OkCancelBar"
    ],
    function (declare, lang, array, dom, on, keys, Templated, template, i18n, ModalDialog, registry, Select, Memory,
              TextBox, hubs, jsonquery, Toggler, iframe, dojoRequest) {
>>>>>>> Stashed changes

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

            jupyter_hubs_json: hubs,
            jupyter_hubs: dojo.fromJson(hubs),
            toggler: null,

            postCreate: function() {
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
                this.jusernamegroup.hidden=true;
            },
            updateDialog: function(e) {
                var hub =  this.hubMenu.focusNode.textContent;
                if (hub) {
                var titleQuery= "$.hubs[?title='" + hub + "']";
                var hubConfig = jsonquery(titleQuery, this.jupyter_hubs);
                if (hubConfig && hubConfig[0].login){
                    this.jusernameLabel.innerHTML = hubConfig[0]["login"];
                    this.jusernamegroup.hidden=false;
                } else {
                    this.jusernamegroup.hidden=true;
                }
                }

            }
            ,
            onOkClicked: function(e){
                this.execute();
                this.dialog.hide();},

            onCancelClicked: function(){
                this.dialog.hide();},
            execute: function() {
                var self = this;
                var hub = this.hubMenu.value;
                //var hubName = this.hubMenu.getOptionLabel();
                var user = this.jusername.value;
<<<<<<< Updated upstream
                if (hub!== null && hub.length > 0 ) {
                    this.okButton.disabled=true;
if ( user!== null && user.length > 0){
    hub=hub.replace("{username}", user);
};

                    //var fileURL = URL.createObjectURL(hub);
                    //window.open(fileURL);
                    // create an anchor and click on it.
                    var ancorTag = document.createElement('a');
                    ancorTag.href = hub; ancorTag.target = '_blank';
                   // ancorTag.download = 'ConsumptionReport.pdf';
                    document.body.appendChild(ancorTag);
                    ancorTag.click();
                    document.body.removeChild(ancorTag);

                   // window.open("https://google.com/", "_blank");
                   // this.dialog.okCancelBar.showWorking(i18n.general.working,true);
                    // AppContext.appUser.signIn(u,p).then(function(){
                    //     self.dialog.hide();
                    // }).otherwise(function(error){
                    //     if (typeof error === "string") self.handleError(error);
                    //     else self.handleError(i18n.general.error,error);
                    // });
=======
                if (hubs.length >0 ) {
                    var hub = hubs[0];
                    this.okButton.disabled = true;
                    try {
                        var hubUrl = hub.uri_template;
                        if (user !== null && user.length > 0) {
                            hubUrl = hubUrl.replace("{username}", user);
                        }
                        ;
                        if (this.type === "documentId") {
                            var paramTemplate = hub.params["documentId"];
                            var param = paramTemplate.replace("{documentId}", encodeURIComponent(this.documentId));
                        }
                        if (this.type === "collection") {
                            var paramTemplate = hub.params["collection"];
                            var param = paramTemplate.replace("{collectionPackage}", encodeURIComponent(this.collectionJson));
                        }
                        /*
                        "https://mybinder.org/v2/gh/CINERGI/jupyter-cinergi.git/stable?urlpath=%2Fnotebooks%2FCinergiDispatch.ipynb?"

                         */
                        if (hub.url_encode_options ) {
                            param = encodeURI('?' + param);
                            hubUrl = hubUrl + param;
                        }
                        else {
                            var i = hubUrl.lastIndexOf('?');
                            if (i > 0) {
                                if (i === hubUrl.length) {
                                    hubUrl = hubUrl + param;
                                } else {
                                    hubUrl = hubUrl + '&' + param;
                                }
                            } else {
                                hubUrl = hubUrl + '?' + param;
                            }
                        }
                        //var fileURL = URL.createObjectURL(hubUrl);
                        //window.open(fileURL);
                        // create an anchor and click on it.

                        url = "geoportal/rest/collection/toSuave";
                        response = dojoRequest.post(url);
                        resultat = response.getEntity()


                        resultat = runPyScript(hubUrl);

                        var ancorTag = document.createElement('a');
                        ancorTag.href = resultat;
                        ancorTag.target = '_blank';
                        // ancorTag.download = 'ConsumptionReport.pdf';
                        document.body.appendChild(ancorTag);
                        ancorTag.click();
                        document.body.removeChild(ancorTag);

                        // window.open("https://google.com/", "_blank");
                        // this.dialog.okCancelBar.showWorking(i18n.general.working,true);
                        // AppContext.appUser.signIn(u,p).then(function(){
                        //     self.dialog.hide();
                        // }).otherwise(function(error){
                        //     if (typeof error === "string") self.handleError(error);
                        //     else self.handleError(i18n.general.error,error);
                        // });
                    } catch (ex ) {
                        this.okButton.disabled = false;
                        self.handleError("Hubs defined in jyputer_hubs.json, incorrect. Contact adminstrator");
                    }
>>>>>>> Stashed changes
                } else {
                    self.handleError(i18n.login.incomplete);
                }
            },

            handleError: function(msg,error) {
                if (error) console.warn(error);
                if (!this.dialog) return;
                this.dialog.okCancelBar.enableOk();
                this.dialog.okCancelBar.showError(msg,false);
            },

            init: function(item) {
                var self = this;
                var m = registry.byId(self.hubMenu.id);
                if (lang.isArray(this.jupyter_hubs.hubs)) {
                    var optionsHub = [];
                    array.forEach(this.jupyter_hubs.hubs, function (hub) {

                       // var ddli = domConstruct.create("li", {}, ddul);
                        var uri = hub.uri_template.replace("{docId}", encodeURIComponent(item._id));
                       // var divClass = "small";
                        if (hub.disabled){
                            divClass = "small disabled";
                        }
                        if (lang.isArray(hub.branches)) {
                            array.forEach(hub.branches, function (branch) {

                                var branchuri = uri.replace("{branch}",branch.branch );
                                var title  = hub.title.replace("{branch}",branch.title);
                                // domConstruct.create("a", {
                                //     "class": "small",
                                //     href: branchuri,
                                //     target: "_blank",
                                //     innerHTML: title
                                // }, ddli);
                                optionsHub.push(
                                    {label: title,
                                        value: branchuri }
                                );

                            });
                        } else {
                            // domConstruct.create("a", {
                            //     "class": "small",
                            //     href: uri,
                            //     target: "_blank",
                            //     innerHTML: hub.title
                            // }, ddli);
                            optionsHub.push(
                                {label: hub.title,
                                    value: uri }
                            );

                        }
                    });
                    // var s = new Select({
                    //
                    //
                    // });
                      m.addOption(optionsHub);
                         m.startup();
                   // s.addOption(optionsHub);
                   //  s.placeAt(m);
                   //  s.startup();
                   // m.store.add(
                   //          {name:"Alabama", id:"AL"});
                   //
                   //  m.store.add(  {name:"Alaska", id:"AK"});


                }
                this.own(on(this.jusername,"keyup",function(evt) {
                    if (evt.keyCode === keys.ENTER) self.execute();
                }));
            },

            modalShown: function() {
            },
            hide: function() {
                $("#"+this.domNode.id).modal("hide");
            },
            show: function(item) {
                var self = this;
                this.init(item);
                this.dialog = new ModalDialog({
                    content: this.domNode,
                    title: this.title,
                    okLabel: this.okLabel,
                    onHide: function() {
                        self.destroyRecursive(false);
                    },
                    onOkClicked: function() {
                        self.execute();
                    }
                });
                $(this.dialog.domNode).on('shown.bs.modal',function() {
                    self.modalShown();
                });
                this.dialog.show();
            }

        });

        return oThisClass;
    });
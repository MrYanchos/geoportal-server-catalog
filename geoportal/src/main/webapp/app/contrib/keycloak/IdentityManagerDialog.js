 define("dojo/_base/kernel dojo/_base/declare dojo/_base/config dojo/_base/Deferred dojo/_base/lang dojo/has dojo/dom-attr dojo/keys dijit/registry dijit/Dialog ./kernel ./lang ./domUtils ./Credential ./IdentityManagerBase dojo/i18n!./nls/jsapi dojo/query dijit/form/Button dijit/form/Form dijit/form/ValidationTextBox".split(" "), function(n, k, a, e, q, m, h, r, g, c, b, d, f, v, t, p) {
        k = k([t], {
            declaredClass: "esri.IdentityManager",
            _eventMap: {
                "dialog-cancel": ["info"]
            },
            constructor: function(a) {
                q.mixin(this, a);
                this.registerConnectEvents()
            },
            _dialogContent: "\x3cdiv data-dojo-type\x3d'dijit.form.Form' data-dojo-props\x3d'\"class\":\"esriIdForm\"'\x3e\x3cdiv class\x3d'dijitDialogPaneContentArea'\x3e\x3cdiv style\x3d'padding-bottom: 5px; word-wrap: break-word;'\x3e${info}\x3c/div\x3e\x3cdiv style\x3d'margin: 0px; padding: 0px; height: 10px;'\x3e\x3c/div\x3e\x3cdiv class\x3d'esriErrorMsg' style\x3d'display: none; color: white; background-color: #D46464; text-align: center; padding-top: 3px; padding-bottom: 3px;'\x3e${invalidUser}\x3c/div\x3e\x3cdiv style\x3d'margin: 0px; padding: 0px; height: 10px;'\x3e\x3c/div\x3e\x3ctable style\x3d'width: 100%;'\x3e\x3ctr\x3e\x3ctd\x3e\x3clabel\x3e${lblUser}\x3c/label\x3e\x3cbr/\x3e\x3cinput data-dojo-type\x3d'dijit.form.ValidationTextBox' data-dojo-props\x3d'type:\"text\", \"class\":\"esriIdUser\", required:true, trim:true, style:\"width: 100%;\", autocapitalize:\"none\", autocorrect:\"off\", spellcheck:false' /\x3e\x3c/td\x3e\x3c/tr\x3e\x3ctr\x3e\x3ctd\x3e\x3clabel\x3e${lblPwd}\x3c/label\x3e\x3cbr/\x3e\x3cinput data-dojo-type\x3d'dijit.form.ValidationTextBox' data-dojo-props\x3d'type:\"password\", \"class\":\"esriIdPwd\", required:true, style:\"width: 100%;\"' /\x3e\x3c/td\x3e\x3c/tr\x3e\x3c/table\x3e\x3c/div\x3e\x3cdiv class\x3d'dijitDialogPaneActionBar'\x3e\x3cbutton data-dojo-type\x3d'dijit.form.Button' data-dojo-props\x3d'type:\"button\", \"class\":\"esriIdSubmit\"'\x3e${lblOk}\x3c/button\x3e\x3cbutton data-dojo-type\x3d'dijit.form.Button' data-dojo-props\x3d'type:\"button\", \"class\":\"esriIdCancel\"'\x3e${lblCancel}\x3c/button\x3e\x3c/div\x3e\x3c/div\x3e",
            onDialogCreate: function() {},
            onDialogCancel: function() {},
            signIn: function(b, c, d) {
                this._nls || (this._nls = p.identity);
                this._loginDialog || (this._loginDialog = this.dialog = this._createLoginDialog(),
                    this.onDialogCreate());
                var g = this._loginDialog
                    , l = d && d.error
                    , k = d && d.token
                    , m = new e(function() {
                        g.onCancel()
                    }
                );
                if (g.open)
                    return b = Error("BUSY"),
                        b.code = "IdentityManager.1",
                        b.log = !!a.isDebug,
                        m.errback(b),
                        m;
                f.hide(g.errMsg_);
                l && 403 == l.code && k && (h.set(g.errMsg_, "innerHTML", this._nls.forbidden),
                    f.show(g.errMsg_));
                g.dfd_ = m;
                g.serverInfo_ = c;
                g.resUrl_ = b;
                g.admin_ = d && d.isAdmin;
                h.set(g.resLink_, {
                    title: b,
                    innerHTML: "(" + (this.getResourceName(b) || this._nls.lblItem) + ")"
                });
                h.set(g.serverLink_, {
                    title: c.server,
                    innerHTML: (-1 !== c.server.toLowerCase().indexOf("arcgis.com") ? "ArcGIS Online" : c.server) + " "
                });
                g.txtPwd_.set("value", "");
                g.show();
                return m
            },
            _createLoginDialog: function() {
                var e = this._nls
                    , l = d.substitute(e, this._dialogContent)
                    , l = d.substitute({
                    resource: "\x3cspan class\x3d'resLink' style\x3d'word-wrap: break-word;'\x3e\x3c/span\x3e",
                    server: "\x3cspan class\x3d'serverLink' style\x3d'word-wrap: break-word;'\x3e\x3c/span\x3e"
                }, l)
                    , k = new c({
                    title: e.title,
                    content: l,
                    "class": "esriSignInDialog",
                    style: "width: 18em;",
                    esriIdMgr_: this,
                    keypressed_: function(a) {
                        a.charOrCode === r.ENTER && this.execute_()
                    },
                    execute_: function() {
                        var a = this.txtUser_.get("value")
                            , g = this.txtPwd_.get("value")
                            , l = this.dfd_
                            , k = this;
                        if (this.form_.validate() && a && g) {
                            this.btnSubmit_.set("label", e.lblSigning);
                            var p = b.id.findCredential(k.resUrl_, a)
                                , m = function(b) {
                                k.btnSubmit_.set("label", e.lblOk);
                                k.btnSubmit_.set("disabled", !1);
                                f.hide(k.errMsg_);
                                k.hide();
                                c._DialogLevelManager.hide(k);
                                var g = k.serverInfo_;
                                k.dfd_ = k.serverInfo_ = k.generateDfd_ = k.resUrl_ = null;
                                var h, m, n = p, q;
                                b && (h = b.token,
                                    m = d.isDefined(b.expires) ? Number(b.expires) : null,
                                    q = !!b.ssl,
                                    n ? (n.userId = a,
                                        n.token = h,
                                        n.expires = m,
                                        n.validity = b.validity,
                                        n.ssl = q,
                                        n.creationTime = (new Date).getTime()) : n = new v({
                                        userId: a,
                                        server: g.server,
                                        token: h,
                                        expires: m,
                                        ssl: q,
                                        isAdmin: k.admin_,
                                        validity: b.validity
                                    }));
                                l.callback(n)
                            };
                            p && !p._enqueued ? m() : (k.btnSubmit_.set("disabled", !0),
                                k.generateDfd_ = b.id.generateToken(this.serverInfo_, {
                                    username: a,
                                    password: g
                                }, {
                                    isAdmin: this.admin_
                                }).addCallback(m).addErrback(function(a) {
                                    k.btnSubmit_.set("disabled", !1);
                                    k.generateDfd_ = null;
                                    k.btnSubmit_.set("label", e.lblOk);
                                    h.set(k.errMsg_, "innerHTML", a && a.code ? e.invalidUser : e.noAuthService);
                                    f.show(k.errMsg_)
                                }))
                        }
                    },
                    cancel_: function() {
                        k.generateDfd_ && k.generateDfd_.cancel();
                        var b = k.dfd_
                            , d = k.resUrl_
                            , e = k.serverInfo_;
                        k.btnSubmit_.set("disabled", !1);
                        k.dfd_ = k.serverInfo_ = k.generateDfd_ = k.resUrl_ = null;
                        f.hide(k.errMsg_);
                        c._DialogLevelManager.hide(k);
                        k.esriIdMgr_.onDialogCancel({
                            resourceUrl: d,
                            serverInfo: e
                        });
                        d = Error("ABORTED");
                        d.code = "IdentityManager.2";
                        d.log = !!a.isDebug;
                        b.errback(d)
                    }
                })
                    , l = k.domNode;
                k.form_ = g.byNode(n.query(".esriIdForm", l)[0]);
                k.txtUser_ = g.byNode(n.query(".esriIdUser", l)[0]);
                k.txtPwd_ = g.byNode(n.query(".esriIdPwd", l)[0]);
                k.btnSubmit_ = g.byNode(n.query(".esriIdSubmit", l)[0]);
                k.btnCancel_ = g.byNode(n.query(".esriIdCancel", l)[0]);
                k.resLink_ = n.query(".resLink", l)[0];
                k.serverLink_ = n.query(".serverLink", l)[0];
                k.errMsg_ = n.query(".esriErrorMsg", l)[0];
                k.connect(k.txtUser_, "onKeyPress", k.keypressed_);
                k.connect(k.txtPwd_, "onKeyPress", k.keypressed_);
                k.connect(k.btnSubmit_, "onClick", k.execute_);
                k.connect(k.btnCancel_, "onClick", k.onCancel);
                k.connect(k, "onCancel", k.cancel_);
                return k
            }
        });
        m("extend-esri") && (b.IdentityManagerDialog = b.IdentityManager = k);
        return k
    })

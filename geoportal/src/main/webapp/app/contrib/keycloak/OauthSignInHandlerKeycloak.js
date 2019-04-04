define("esri/Credential esri/domUtils esri/lang esri/urlUtils dijit/Dialog dijit/registry dojo/_base/config dojo/_base/Deferred dojo/_base/kernel dojo/dom-attr dojo/i18n!esri/nls/jsapi dojo/io-query dojo/sniff dojo/json dijit/form/Button dojo/query".split(" "),
    function(credential, domutils, lang, urlutils, dialog,  registry, baseconfig, deffered, kernel, domattrib  , jsapi, ioquery   , json, button) {
    return {
        _oAuthDfd: null,
        _oAuthIntervalId: 0,
        _oAuthDialogContent: "\x3cdiv class\x3d'dijitDialogPaneContentArea'\x3e\x3cdiv style\x3d'padding-bottom: 5px; word-wrap: break-word;'\x3e${oAuthInfo}\x3c/div\x3e\x3cdiv style\x3d'margin: 0px; padding: 0px; height: 10px;'\x3e\x3c/div\x3e\x3cdiv class\x3d'esriErrorMsg' style\x3d'display: none; color: white; background-color: #D46464; text-align: center; padding-top: 3px; padding-bottom: 3px;'\x3e${invalidUser}\x3c/div\x3e\x3cdiv style\x3d'margin: 0px; padding: 0px; height: 10px;'\x3e\x3c/div\x3e\x3cdiv class\x3d'dijitDialogPaneActionBar'\x3e\x3cbutton data-dojo-type\x3d'dijit.form.Button' data-dojo-props\x3d'type:\"json\", \"class\":\"esriIdSubmit\"'\x3e${lblOk}\x3c/json\x3e\x3cbutton data-dojo-type\x3d'dijit.form.Button' data-dojo-props\x3d'type:\"json\", \"class\":\"esriIdCancel\"'\x3e${lblCancel}\x3c/json\x3e\x3c/div\x3e",
        setOAuthRedirectionHandler: function(a) {
            this._oAuthRedirectFunc = a;
        },
        oAuthSignIn: function(resourceurl, serverinfo, oauthinfo, e) {
            var g = this._oAuthDfd = new deffered;
            g.resUrl_ = resourceurl;
            g.sinfo_ = serverinfo;
            g.oinfo_ = oauthinfo;
            var h = !e || !1 !== e.oAuthPopupConfirmation;
            if (!oauthinfo.popup || !h)
                return this._doOAuthSignIn(resourceurl, serverinfo, oauthinfo),
                    g;
            this._nls || (this._nls = jsapi.identity);
            this.oAuthDialog || (this.oAuthDialog = this._createOAuthDialog());
            resourceurl = this.oAuthDialog;
            serverinfo = e && e.error;
            e = e && e.token;
            domutils.hide(resourceurl.errMsg_);
            serverinfo && 403 == serverinfo.code && e && (domattrib.set(resourceurl.errMsg_, "innerHTML", this._nls.forbidden),
                domutils.show(resourceurl.errMsg_));
            resourceurl.show();
            return g;
        },
        setOAuthResponseHash: function(a) {
            /* esri:
            http://moonstone.sdsc.edu:8081/geoportal/oauth-callback.html#access_token=FoTwlAI9u9B7B2GLe2QvJ3wS1sFQnlzg6PAIE9Hw9FRg07k_4ETO2XUJbCegYJ0GLCaHJjTCCFa4WEDuQ3WbEYJ5BdLbS-vks6Lq2tj1UhuBCTZpyb7NqY78AFPx-dIPUjsa0N3oed9IFKQNzqhVQqy1AI30XEnMym1afZZ_wFtddxMKRQ2_KNt0-2x4IaJp&expires_in=7200&username=valentinedwv&state=%7B%22portalUrl%22%3A%22https%3A%2F%2Fwww.arcgis.com%22%7D

            keycloak
            http://localhost:8081/geoportal/oauth-callback.html#state=%7B%22portalUrl%22%3A%22http%3A%2F%2Flocalhost%3A8843%2Fauth%2Frealms%2FGeoportal%22%7D&session_state=108bb839-e4d9-4ee8-a753-ada49708a707&access_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ3SEV4SzF0S0U0a0lVcExBZUZHLTYwR1ZGU2lJT0h2aUFjRFhIb2t1eDJVIn0.eyJqdGkiOiJkYzBhZGNlNi1mMGM5LTQ2ODEtOWIzNC0wZGRiOGQxOGRhM2MiLCJleHAiOjE1NTE0OTQzNTMsIm5iZiI6MCwiaWF0IjoxNTUxNDkzNDUzLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0Ojg4NDMvYXV0aC9yZWFsbXMvZ2VvcG9ydGFsIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImE3ZTkwOGExLTQ4ODYtNDQ0MS05Mzc0LTM2YThhY2ZhMTY3MyIsInR5cCI6IkJlYXJlciIsImF6cCI6Imdlb3BvcnRhbCIsIm5vbmNlIjoiIiwiYXV0aF90aW1lIjoxNTUxNDkzNDUzLCJzZXNzaW9uX3N0YXRlIjoiMTA4YmI4MzktZTRkOS00ZWU4LWE3NTMtYWRhNDk3MDhhNzA3IiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiZ3B0dXNlciJ9.YfBA4EswQQ2BGQp4UjAuItBbzx2liG-dJkhprS-WaAXIzMpXE6wj_h7aoipmVeWejhGN74dZtzYH3zmXNb6mV9Jr3cvLeTpQ-nGDG-630s-JNE_EVQSG71Y-qqwZiP9UqRN4uTTXqli87r20QN_sVYPPoe5Xwptp3O2RrNCB_xt6psIo_YC2IOq8zBvkWR3gc8ushS5fAFtYSVboU1r0JKxYz2A6al3nRL7c3PHIy4aKAN1SuhfvqjAWaFJIimV7Ct7J7QAcIajJD304dACkVJTAsqnGIu_stafGvfFP8gwlzykadnXa38K-aqoJGEGCgny-zM5W8929lUH_WcLnpQ&token_type=bearer&expires_in=900
{
  "jti": "dc0adce6-f0c9-4681-9b34-0ddb8d18da3c",
  "exp": 1551494353,
  "nbf": 0,
  "iat": 1551493453,
  "iss": "http://localhost:8843/auth/realms/geoportal",
  "aud": "account",
  "sub": "a7e908a1-4886-4441-9374-36a8acfa1673",
  "typ": "Bearer",
  "azp": "geoportal",
  "nonce": "",
  "auth_time": 1551493453,
  "session_state": "108bb839-e4d9-4ee8-a753-ada49708a707",
  "acr": "1",
  "realm_access": {
    "roles": [
      "offline_access",
      "uma_authorization"
    ]
  },
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "scope": "openid email profile",
  "email_verified": false,
  "preferred_username": "gptuser"
}
             */
            var tokenJson = this._parseJwt(a)
;            var b = this._oAuthDfd;
            this._oAuthDfd = null;
            if (b && a)
                if (clearInterval(this._oAuthIntervalId),
                "#" === a.charAt(0) && (a = a.substring(1)),
                    a = ioquery.queryToObject(a),
                    a.error)
                    a = Error("access_denied" === a.error ? "ABORTED" : "OAuth: " + a.error + " - " + a.error_description),
                        a.code = "IdentityManagerBase.2",
                        a.log = !!baseconfig.isDebug,
                        b.errback(a);
                else {
                    var c = b.oinfo_._oAuthCred
                        , f = new credential({
                        userId: a.azp,
                        server: b.sinfo_.server,
                        token: a.access_token,
                        expires: (new Date).getTime() + 1E3 * Number(a.exp),
                        ssl: "true" === a.ssl,
                        _oAuthCred: c
                    });
                    c.storage = a.persist ? window.localStorage : window.sessionStorage;
                    c.token = f.token;
                    c.expires = f.expires;
                    c.userId = f.userId;
                    c.ssl = f.ssl;
                    c.save();
                    b.callback(f);
                }
        },
        _parseJwt: function  (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(window.atob(base64));
        },
        _createOAuthDialog: function() {
            var b = this._nls
                , c = lang.substitute(b, this._oAuthDialogContent)
                , d = new dialog({
                title: b.title,
                content: c,
                "class": "esriOAuthSignInDialog",
                style: "min-width: 18em;",
                esriIdMgr_: this,
                execute_: function() {
                    var a = d.esriIdMgr_._oAuthDfd;
                    d.hide_();
                    d.esriIdMgr_._doOAuthSignIn(a.resUrl_, a.sinfo_, a.oinfo_);
                },
                cancel_: function() {
                    var a = d.esriIdMgr_._oAuthDfd;
                    d.esriIdMgr_._oAuthDfd = null;
                    d.hide_();
                    var b = Error("ABORTED");
                    b.code = "IdentityManager.2";
                    b.log = !!baseconfig.isDebug;
                    a.errback(b);
                },
                hide_: function() {
                    domutils.hide(d.errMsg_);
                    d.hide();
                    dialog._DialogLevelManager.hide(d);
                }
            }),
                 b = d.domNode;
            d.btnSubmit_ = registry.byNode(kernel.query(".esriIdSubmit", b)[0]);
            d.btnCancel_ = registry.byNode(kernel.query(".esriIdCancel", b)[0]);
            d.errMsg_ = kernel.query(".esriErrorMsg", b)[0];
            d.connect(d.btnSubmit_, "onClick", d.execute_);
            d.connect(d.btnCancel_, "onClick", d.onCancel);
            d.connect(d, "onCancel", d.cancel_);
            return d;
        },
        _doOAuthSignIn: function(resurl, serverinfo, oauthinfo) {
            var self = this
                , k = {
                client_id: oauthinfo.appId,
                response_type: "token",
                state: button.stringify({
                    portalUrl: oauthinfo.portalUrl
                }),
                expiration: oauthinfo.expiration,
                locale: oauthinfo.locale,
                redirect_uri: oauthinfo.popup ? urlutils.getAbsoluteUrl(oauthinfo.popupCallbackUrl) : window.location.href.replace(/#.*$/, "")
            };
            oauthinfo.forceLogin && (k.force_login = !0);
          //  var p = domattrib.portalUrl.replace(/^http:/i, "https:") + "/sharing/oauth2/authorize"
          //  var p = getRealmUrl() + '/protocol/openid-connect/token'
            // is: http://localhost:8843/auth/realms/Geoportal/protocol/openid-connect/auth?response_type=token&state=%7B%7D&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Fgeoportal%2F
           // http://localhost:8843/auth/realms/Geoportal/protocol/openid-connect/auth?client_id=geoportal&scope=openid%20email&response_type=token&state=%7B%7D&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Fgeoportal%2F
            // needs to be
            //http://localhost:8843/auth/realms/geoportal/protocol/openid-connect/auth?client_id=geoportal&redirect_uri=http://localhost:8081&response_type=code&scope=openid%20email
          //  var p = "http://localhost:8843/auth/realms/geoportal"+ '/protocol/openid-connect/auth?nonce=&client_id=geoportal&scope=openid email';
          // http://localhost:8843/auth/realms/Geoportal/protocol/openid-connect/auth?client_id=geoportal-client&redirect_uri=http://localhost:8081&response_type=code&scope=openid%20email
          var p = serverinfo.tokenServiceUrl + "?nonce=&scope=openid email"; // in k &client_id="+oauthinfo.appId+"

            var  m = p + "&" + ioquery.objectToQuery(k);
            if (oauthinfo.popup) {
                var n;
                7 === json("ie") ? (n = window.open(oauthinfo.popupCallbackUrl, "esriJSAPIOAuth", oauthinfo.popupWindowFeatures),
                    n.location = m) : n = window.open(m, "esriJSAPIOAuth", oauthinfo.popupWindowFeatures);
                n ? (n.focus(),
                    this._oAuthDfd.oAuthWin_ = n,
                    this._oAuthIntervalId = setInterval(function() {
                        if (n.closed) {
                            clearInterval(self._oAuthIntervalId);
                            var a = self._oAuthDfd;
                            if (a) {
                                var b = Error("ABORTED");
                                b.code = "IdentityManager.2";
                                b.log = !!baseconfig.isDebug;
                                a.errback(b);
                            }
                        }
                    }, 500)) : (resurl = Error("ABORTED"),
                    resurl.code = "IdentityManager.2",
                    resurl.log = !!baseconfig.isDebug,
                    this._oAuthDfd.errback(resurl));
            } else
                this._oAuthRedirectFunc ? this._oAuthRedirectFunc({
                    authorizeParams: k,
                    authorizeUrl: p,
                    resourceUrl: resurl,
                    serverInfo: serverinfo,
                    oAuthInfo: oauthinfo
                }) : window.location = m;
        }
    };
});
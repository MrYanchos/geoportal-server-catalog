define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/topic",
        "app/context/app-topics",
        "dojo/i18n!app/nls/resources",
        "esri/kernel",
        "app/context/AppClient",
        "app/common/SignIn",
        "esri/ServerInfo",
        "esri/IdentityManagerDialog",
        "esri/IdentityManager",
        "esri/arcgis/OAuthInfo",
        "esri/arcgis/Portal",
        "esri/arcgis/utils",
       "app/contrib/keycloak/keycloak", // keycloak adds itself to the global variables
      // "app/contrib/keycloak/IndenityManagerKeycloak",
        "app/contrib/keycloak/OauthSignInHandlerKeycloak",
    ],
function(declare, lang, Deferred, topic, appTopics, i18n, kernel, AppClient, SignIn, esriServerInfo,
   esriIdDialog, esriId, OAuthInfo, arcgisPortal, arcgisUtils
        , kc, imk
) {
	
  var oThisClass = declare(null, {

    appToken: null,
    arcgisPortalUser: null,
    geoportalUser: null,
    kc:null,
    constructor: function(args) {
      lang.mixin(this,args);

       // this.kc =  Keycloak("custom/keycloak.json");
       //  this.kc.init().success(function(authenticated) {
       //      alert(authenticated ? 'authenticated' : 'not authenticated');
       //  }).error(function(ex) {
       //      alert('failed to initialize');
       //  });
    },
    
    getArcGISPortalUrlForLink: function() {
      var p = null, url = null;
      try {
        if (this.arcgisPortalUser !== null) p = this.arcgisPortalUser.portal;
        if (p && p.customBaseUrl && (p.customBaseUrl.length > 0) && p.urlKey && (p.urlKey.length > 0)) {
          url = window.location.protocol+"//"+p.urlKey+"."+p.customBaseUrl;
          return url;
        } else if (p && p.url) {
          return p.url;
        }
      } catch(ex) {
        console.warn(ex);
      }
    },
    
    getGroups: function() {
      if (this.geoportalUser) {
        return this.geoportalUser.groups;
      }
      return null;
    },
    
    getMyProfileUrl: function() {
      if (AppContext.geoportal && AppContext.geoportal.arcgisOAuth &&
            AppContext.geoportal.arcgisOAuth.showMyProfileLink) {
            if (this.arcgisPortalUser) {
                var v = this.getArcGISPortalUrlForLink();
                if (v) {
                    return v+"/home/user.html?user="+encodeURIComponent(this.arcgisPortalUser.username);
                }
            }
        }
        if (AppContext.geoportal && AppContext.geoportal.keyCloakOAuth &&
            AppContext.geoportal.keyCloakOAuth.showMyProfileLink) {
            if (this.arcgisPortalUser) {
                var v = this.getArcGISPortalUrlForLink();
                if (v) {
                    return v+"/home/user.html?user="+encodeURIComponent(this.arcgisPortalUser.username);
                }
            }
        }
      return null;
    },
    
    getUsername: function() {
      if (this.geoportalUser) {
        var v = this.geoportalUser.username;
        if (typeof v === "string" && v.length > 0) return v;
      }
      return null;
    },
    
    isAdmin: function() {
      if (this.geoportalUser) {
        return this.geoportalUser.isAdmin;
      }
      return false;
    },
    
    isSignedIn: function() {
      return (this.getUsername() !== null);
    },
    
    isPublisher: function() {
      if (this.geoportalUser) {
        return this.geoportalUser.isPublisher;
      }
      return false;
    },
        
    _showAgsOAuthSignIn: function(oauth) {
      var self = this, portalUrl = oauth.portalUrl;
      arcgisUtils.arcgisUrl = portalUrl;  // PortalImplementation
      esriId.getCredential(portalUrl,{oAuthPopupConfirmation:false}).then(function (){
        var portal = new arcgisPortal.Portal(portalUrl);
        portal.signIn().then(function(portalUser){
          //console.warn("portalUser",portalUser);
          self.arcgisPortalUser = portalUser;
          var u = portalUser.username;
          var p = "__rtkn__:"+portalUser.credential.token;
          self.signIn(u,p).then(function(){
          }).otherwise(function(error){
            // TODO handle 
            console.warn("Error occurred while signing in:",error);
          });
        }).otherwise(function(error){
          // TODO handle 
          console.warn("Error occurred while signing in:",error);
        });
      });
    },
      _showKeycloakOAuthSignIn: function(oauth) {
          var self = this;

          var portalURL = oauth.realmUrl;

       //   var keycloakjs  = KeyCloak.Keycloakbj;
       //    //script(KeyCloak.keycloakjson));
       //    this.kc =  Keycloak("custom/keycloak.json");
       //    console.info ("keycloak: " + this.kc.hasResourceRole("ROLE_USER", "geoportal") );
      //    window.keycloak.init({ onLoad: 'login-required' });
       //
       //    this.kc.init({checkLoginIframe:false,
       //        flow: 'hybrid' }).success(function(authenticated) {
       //        alert(authenticated ? 'authenticated' : 'not authenticated');
       //    }).error(function(ex) {
       //        alert('failed to initialize');
       //    });
       //    this.kc.login();
          var info = new OAuthInfo({
              appId: oauth.appId,
              // Uncomment the next line and update if using your own portal
              portalUrl: oauth.portalUrl,
              // Uncomment the next line to prevent the user's signed in state from being shared
              // with other apps on the same domain with the same authNamespace value.
              authNamespace: oauth.authNamespace,
              popup: true
          });
          esriId.registerOAuthInfos([info]);

          var oAuthInfo = esriId.findOAuthInfo(portalURL);
          console.log(oAuthInfo.toJson());


          var serverInfo = new esriServerInfo();
          serverInfo.server = oauth.realmUrl;
          serverInfo.tokenServiceUrl = oauth.realmUrl + "/protocol/openid-connect/auth"; // not token, token returned
          serverInfo.adminTokenServiceUrl = oauth.realmUrl + "/protocol/openid-connect/auth"; // not token, token returned
          esriId.registerServers([serverInfo]);
          imk.oAuthSignIn("http://localhost:8081/geportal",serverInfo,info,null)
              .then(function(portalUser){
                  //console.warn("portalUser",portalUser);
                  self.arcgisPortalUser = portalUser;
                  var u = portalUser.username;
                  var p = "__rtkn__:"+portalUser.credential.token;
                  self.signIn(u,p).then(function(){
                  }).otherwise(function(error){
                      // TODO handle
                      console.warn("Error occurred while signing in:",error);
                  });
              }).otherwise(function(error){
              // TODO handle
              console.warn("Error occurred while signing in:",error);
          });
          // esriId.setRedirectionHandler(function(info) {
          //     // Execute custom logic then perform redirect
          //     window.location = info.signInPage   "?"
          //     info.returnUrlParamName   "="   window.location.href;
          // });
         //  esriId.setRedirectionHandler(function(info) {
         //      // Execute custom logic then perform redirect
         //      window.location = oauth.realmUrl + "/protocol/openid-connect/login"   ?
         //      oauth.redirectUri  :  window.location.href;
         //  });
         //
         //  // , portalUrl = oauth.portalUrl;
         //  //arcgisUtils.arcgisUrl = portalUrl;  // PortalImplementation
         //  esriId.getCredential(info.portalUrl,{oAuthPopupConfirmation:false})
         // // esriId.oAuthSignIn(resUrl, serverInfo, OAuthInfo, options?);
         //  esriId.oAuthSignIn(oauth.redirectUri, serverInfo, info);

          // esriId.getCredential(portalUrl,{oAuthPopupConfirmation:false}).then(function (){
          //     var portal = new arcgisPortal.Portal(portalUrl);
          //     portal.signIn().then(function(portalUser){
          //         //console.warn("portalUser",portalUser);
          //         self.arcgisPortalUser = portalUser;
          //         var u = portalUser.username;
          //         var p = "__rtkn__:"+portalUser.credential.token;
          //         self.signIn(u,p).then(function(){
          //         }).otherwise(function(error){
          //             // TODO handle
          //             console.warn("Error occurred while signing in:",error);
          //         });
          //     }).otherwise(function(error){
          //         // TODO handle
          //         console.warn("Error occurred while signing in:",error);
          //     });
          // });
      },
    showSignIn: function() {
      var ctx = window.AppContext;
      if (ctx.geoportal && ctx.geoportal.arcgisOAuth && ctx.geoportal.arcgisOAuth.appId) {
        this._showAgsOAuthSignIn(ctx.geoportal.arcgisOAuth);
      }
      // Keycloak Oauth.
      else if (ctx.geoportal && ctx.geoportal.keycloakOAuth && ctx.geoportal.keycloakOAuth.appId
          && ctx.geoportal.keycloakOAuth.popUpLoginWindow){
          //this._showAgsOAuthSignIn(ctx.geoportal.genericOauth);
          this._showKeycloakOAuthSignIn( ctx.geoportal.keycloakOAuth);
      }
      else {
        (new SignIn()).show();
      }
    },

    signIn: function(u,p) {
      var self = this, dfd = new Deferred(), client = new AppClient();
      client.generateToken(u,p).then(function(oauthToken){
        if (oauthToken && oauthToken.access_token) {
          client.pingGeoportal(oauthToken.access_token).then(function(info){
            if (info && info.user) {
              self.appToken = oauthToken;
              self.geoportalUser = info.user;
              topic.publish(appTopics.SignedIn,{geoportalUser:info.user});
              dfd.resolve();
            } else {
              dfd.reject(i18n.general.error);
            } 
          }).otherwise(function(error){
            console.warn(error);
            dfd.reject(i18n.general.error);
          });
        } else {
          dfd.reject(i18n.login.invalidCredentials);
        }
      }).otherwise(function(error){
        var msg = i18n.general.error;
        if (error) {
          if (error.status === 400) msg = i18n.login.invalidCredentials;
          else console.warn(error);
        }
        dfd.reject(msg);
      });
      return dfd;
    },
    
    signOut: function() {
      esriId.destroyCredentials();
      window.location.reload();
    },
    
    whenAppStarted: function() {
      var self = this, dfd = new Deferred(), ctx = window.AppContext, oauth;
      if (ctx.geoportal && ctx.geoportal.arcgisOAuth) oauth = ctx.geoportal.arcgisOAuth;
        if (ctx.geoportal && ctx.geoportal.keycloakOAuth && ctx.geoportal.keycloakOAuth.appId) {
            esriIdDialog = new esriIdDialog;
            kernel.id = declare.safeMixin(esriIdDialog, imk);
            oauth = ctx.geoportal.keycloakOAuth;
        }
      if (oauth && oauth.appId) {
        var portalUrl = oauth.portalUrl;
        arcgisUtils.arcgisUrl = portalUrl;  // PortalImplementation
        var info = new OAuthInfo({
          appId: oauth.appId,
          // Uncomment this line to prevent the user's signed in state from being shared
          // with other apps on the same domain with the same authNamespace value.
          authNamespace: oauth.authNamespace,
          portalUrl: portalUrl,
          expiration: oauth.expirationMinutes,
          popup: true
        });
        esriId.registerOAuthInfos([info]);

        esriId.checkSignInStatus(portalUrl).then(function(){
          var portal = new arcgisPortal.Portal(portalUrl);
          portal.signIn().then(function(portalUser){
            //console.warn("portalUser.....",portalUser);
            self.arcgisPortalUser = portalUser;
            var u = portalUser.username;
            var p = "__rtkn__:"+portalUser.credential.token;
            self.signIn(u,p).then(function(){
              dfd.resolve();
            }).otherwise(function(error){
              dfd.resolve();
            });
          }).otherwise(function(error){
            dfd.resolve();
          });
        }).otherwise(function(error){
          dfd.resolve();
        });
        
      } else {
        dfd.resolve();
      }
      return dfd;
    }

  });

  return oThisClass;
});
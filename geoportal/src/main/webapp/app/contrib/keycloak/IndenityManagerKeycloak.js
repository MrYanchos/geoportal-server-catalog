define(["IdentityManagerDialogKeycloak",
    "esri/kernel",
    "app/contrib/keycloak/OauthSignInHandlerKeycloak",
    "dojo/_base/declare",
        "app/context/AppContext"
    ],
    function(idmanager, kernel, kcOathSignin, declare, AppContext) {
        var ctx = AppContext;
        if (ctx.geoportal && ctx.geoportal.keycloakOauth && ctx.geoportal.keycloakOauth.appId) {
            idmanager = new idmanager;
            kernel.id = declare.safeMixin(idmanager, kcOathSignin);
            return kernel.id;
        }

}
);
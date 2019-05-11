define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/io-query",
        "dojo/text!./templates/CollectionRunInJupyter.html",
        "dojo/i18n!app/nls/resources",
        "app/collection/CollectionComponent"],
    function (declare, lang, array, domConstruct, ioQuery, template, i18n, CollectionComponent) {
        var oThisClass = declare([CollectionComponent], {

            i18n: i18n,
            templateString: template,
            params: {},

        });

            return oThisClass;
})
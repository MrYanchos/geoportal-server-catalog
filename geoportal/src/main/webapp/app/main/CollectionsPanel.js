/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

    define(["dojo/_base/declare",
            "dojo/_base/lang",
            "app/common/Templated",
            "dojo/text!./templates/CollectionsPanel.html",
            "dojo/i18n!../nls/resources",

            "app/collection/CollectionPane",
            "app/collection/SavedSearches",
           "app/collection/CollectionImport",
            "app/collection/SavedCollections",
            "app/collection/ItemsPane",
          "app/collection/CollectionRunInJupyter",


        ],
        function(declare, lang,  Templated, template, i18n) {

            var oThisClass = declare([Templated], {

                i18n: i18n,
                templateString: template,

                postCreate: function() {
                    this.inherited(arguments);
                }
                ,
                startup: function() {
                    this.inherited(arguments);
                },

                startCollectionTour: function(){
                var tour = new Tour({
                    name:"collectionTour",
                    steps: [
                        {
                            element:"#collectionPanel",
                            placement:"bottom",
                            orphan: true,
                            title: "DD Studio Collections Interface",
                            content: "This tab allows you to organize saved metadata records into collections " +
                                "which can be sent to a JupyterHub, or saved as a CSV file for use in processing."
                        },
                        {
                            element: "#collectionDropPane",
                            backdrop: true,
                            title: "Show Saved Results",
                            content: "From the search page Click <b>Save</b> in an item  and the metadata will appear here. " +
                                "At present, results are " +
                                "stored on your computer"
                        },
                        {
                            element: "#collectionMenuNode",
                            backdrop: true,
                            title: "Select a collection",
                            content: "Click on a collection from list and click <i>View</i>. "

                        },
                        {
                            element: "#itemDropPane",
                            placement:"left",
                            backdrop: true,
                            title: "Collection Items",
                            content: "Select a collection, then click <i>Add to Collection</i> to add record to collection"
                        },
                        {
                            element: "#viewBtn",
                            placement:"left",
                            backdrop: true,
                            title: "View",
                            content: "To see items in a collection, click  <i>View</i>"
                        },
                        {
                            element: "#exportBtn",
                            backdrop: true,
                            title: "Export Results",
                            content: "Export results as a CSV for use in your applications, or to transfer to another computer."
                        },
                        {
                            element: "#searchDropPane",
                            backdrop: true,
                            title: "Show search results",
                            content: "Saved searches are shown here."
                        }
                        ,
                        {
                            element: "#newSearchBtn",
                            backdrop: true,
                            title: "Save a search",
                            content: "When you have a search you would like to save, click to Save a new Search."
                        }
                        ,
                        {
                            element: "#importDropPane",
                            backdrop: true,
                            title: "Import a saved search",
                            content: "You can modify your CSV file, and add descriptions to collections, and" +
                                "import. This allows you to transfer collections beteween browsers"
                        }
                        ,
                        {
                            element: "#overwriteCollectionMD",
                            backdrop: true,
                            title: "Merge or Overwirte",
                            content: "You can overwrite the details of a collection, such a name, and add a description " +
                                "by editing the CSV file"
                        },
                        {
                            element: "#importFile",
                            backdrop: true,
                            title: "Import file",
                            content: "Select a file, and click import to import records."
                        }
                    ]});

// Initialize the tour
                tour.init();

// Start the tour

                    tour.restart();
               // tour.start();
            }



            });

            return oThisClass;
        });
//         function(declare, lang, Templated, template, i18n) {
//
//             var oThisClass = declare([Templated], {
//
//                 i18n: i18n,
//                 templateString: template,
//                 script: 'custom/localCollectionSaveEvents.js',
//                 script2: 'custom/localCollectionSaveUI.js',
//                 postCreate: function() {
//                     this.inherited(arguments);
//                 },
//                 startup:  function () {
//                     var  ascript = this.script;
//                     if (typeof ascript === "undefined" || ascript === null) {
//                         ascript ="custom/localCollectionSaveEvents.js";
//                     }
//                     var  ascript2 = this.script2;
//                     if (typeof ascript === "undefined" || ascript === null) {
//                         ascript ="custom/localCollectionSaveUI.js";
//                     }
//
//                     require([ascript,ascript2], function(){
// // separate out this to custom to allow for easier customization.
//                     });
//                 }
//             });
//
//             return oThisClass;
//         });
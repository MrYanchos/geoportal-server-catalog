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
                            placement:"left",
                            orphan: true,
                            title: "DD Studio Collections Interface",
                            content: "The Collection tab allows you to organize saved metadata records into collections" +
                                " which can be sent to a JupyterHub, or saved as a CSV file to share or use in processing. "
                        },
                        {
                            element:"#collectionPanelLeft",
                            placement:"right",
                            orphan: true,
                            title: "Collections vs Saved Search",
                            content: "A <i>collection</i> is a set of saved metadata records. Records are saved from the results list in " +
                                "the <b>Search</b> tab, can can be organized in the <b>Collection</b> tab. " +
                                " A <i>saved search</i> is a query based on the facets of a search. Only the query is saved; the individual records are not " +
                                "saved. From a saved search, you can save individual records. "
                        },
                        {
                            element: "#collectionDropPane",
                            backdrop: true,
                            title: "Show Saved Results",
                            content: "Click <b>Save</b> for an item from the search page and the metadata will appear here." +
                                " At present, results are stored on your computer"
                        },
                        {
                            element: "#collectionMenuNode",
                            backdrop: true,
                            title: "Select a collection",
                            content: "Click on a collection from list and click <b>View</b>. "

                        },
                        {
                            element: "#itemDropPane",
                            placement:"left",
                            backdrop: true,
                            title: "Collection Items",
                            content: "Select a collection, then click <b>Add to Collection</b> to add record to collection."
                        },
                        {
                            element: "#viewBtn",
                            placement:"right",
                            backdrop: true,
                            title: "View",
                            content: "To see items in a collection, click <b>View</b>"
                        },
                        {
                            element: "#searchDropPane",
                            backdrop: true,
                            title: "Show search results",
                            content: "Save searches are shown here."
                        }
                        ,
                        {
                            element: "#newSearchBtn",
                            backdrop: true,
                            title: "Save a search",
                            content: " When you have a search you would like to save, click <b>Save</b> to create a new Search. "
                        },
                        {
                            element:"#importDropPane",
                            placement:"right",
                            orphan: true,
                            title: "Sharing collections: Export and Import",
                            content: "You can export your saved records as a collection to a CSV file. " +
                                "You can import these files into another browser," +
                                "or use them as a basis for processing the data referred to in the collection."
                        },
                        {
                        element:"#importDropPane",
                        placement:"right",
                        orphan: true,
                        title: "Collections CSV files",
                        content: "The exported CSV files contain a description of the collection (id, title, description)" +
                            " and a summary of metadata record. The summary record includes the id, title, description and" +
                            "a link to the DDStudio where you can retrieve the record."
                },
                        {
                            element: "#exportBtn",
                            backdrop: true,
                            title: "Export Results",
                            content: "Export results as a CSV for use in your applications, or to transfer to another computer."
                        },

                        {
                            element: "#importDropPane",
                            backdrop: true,
                            title: "Import a saved search",
                            content: "You can modify your CSV file, and add descriptions to collections, and import." +
                                " This allows you to transfer collections beteween browsers or share with others"
                        }
                        ,
                        {
                            element: "#overwriteCollectionMD",
                            backdrop: true,
                            title: "Merge or Overwirte",
                            content: "You can toggle to <b>overwrite</b> the details of a collection, such as collection name," +
                                " or merge to add new records to an older collection"
                        },
                        {
                            element: "#importFile",
                            backdrop: true,
                            title: "Import file",
                            content: "Select a file, and click <b>Import File</b> to import records"
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
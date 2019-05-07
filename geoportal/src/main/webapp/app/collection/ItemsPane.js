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
        "dojo/_base/array",
        "dojo/aspect",
        "dojo/dom-construct",
      "app/common/Templated",
        "dojo/text!./templates/ItemsPane.html",
        "dojo/i18n!app/nls/resources",
        "app/collection/CollectionComponent",
      "app/collection/CollectionBase",
      "app/collection/SavedItemCard",
        "app/collection/PagingCollections",
        "app/search/DropPane",
        "dojox/widget/Standby"],
function(declare, lang, array, aspect, domConstruct, Templated,template, i18n, CollectionComponent, CollectionBase, SavedItemCard,
    PagingCollections,DropPane, Standby) {
  
  var oThisClass = declare([CollectionComponent], {
//var oThisClass = declare([Templated], {
    i18n: i18n,
    templateString: template,
    
    label: "Collection Items",
    // label: i18n.search.results.label,
    open: true,
    paging: null,
    sortField: null,
    sortDir: null,
    
    postCreate: function() {
      this.inherited(arguments);
      this.inherited(arguments);
     // this.addSort();
      this.paging = new PagingCollections({});
      this.paging.placeAt(this.dropPane.toolsNode);
    //  document.body.appendChild(this.statusNode.domNode);
     // this.statusNode.target = this.dropPane.domNode;
     //  this.own(topic.subscribe("app/collection/assignEvent",function(item){
     //
     //      self.assignEvent(item);
     //    }
     //  ));

      //setSavedCard();
    },

    processSavedResults: function(records, totalRecords, nextPage){
      var self = this;
      domConstruct.empty(this.itemsNode);
     if (Array.isArray(records))  {
       array.forEach( records, function(md ){
         var itemCard = new SavedItemCard({
           itemsNode: self.itemsNode,
           itemsPane: self.itemsPane
         });
         itemCard.render(md.val);
         itemCard.placeAt(self.itemsNode);

       })
     } else {
       var itemCard = new SavedItemCard({
         itemsNode: self.itemsNode,
         itemsPane: self.itemsPane
       });
       itemCard.render(item.val);
       itemCard.placeAt(self.itemsNode);

     }
    },

    addSort: function() {
      var self = this, dd = null;
      var addOption = function(parent,ddbtn,label,field,sortDir) {
        var ddli = domConstruct.create("li",{},parent);
        domConstruct.create("a",{
          "class": "small",
          "href": "javascript:void(0)",
          innerHTML: label,
          onclick: function(e) {
            var dir = sortDir;
            if (field !== null && field === self.sortField) {
              if (self.sortDir === "asc") dir = "desc";
              else dir = "asc";
            }
            self.sortField = field;
            self.sortDir = dir;
            if (dir === null) {
              ddbtn.innerHTML = label+"<span class='glyphicon glyphicon-triangle-right'></span>";
            } else if (dir === "asc") {
              ddbtn.innerHTML = label+"<span class='glyphicon glyphicon-triangle-top'></span>";
            } else {
              ddbtn.innerHTML = label+"<span class='glyphicon glyphicon-triangle-bottom'></span>";
            }
            //ddbtn.innerHTML = label+"<span class='caret'></span>";
            $(dd).removeClass('open');
            self.search();
          }
        },ddli);
      };
      
      dd = domConstruct.create("div",{
        "class": "dropdown g-sort-dropdown"
      },this.dropPane.toolsNode);
      var ddbtn = domConstruct.create("a",{
        "class": "dropdown-toggle",
        "href": "#",
        "data-toggle": "dropdown",
        "aria-haspopup": true,
        "aria-expanded": true,
        innerHTML: i18n.search.sort.byRelevance,
        onclick: function(e) {
          if ($(dd).hasClass('open')) {
            $(dd).removeClass('open');
          } else {
            $(dd).addClass('open');
          }
          e.stopPropagation();
        }
      },dd);
      domConstruct.create("span",{"class":"glyphicon glyphicon-triangle-right"},ddbtn);
      var ddul = domConstruct.create("ul",{"class":"dropdown-menu"},dd);
      
      addOption(ddul,ddbtn,i18n.search.sort.byRelevance,null,null);
      addOption(ddul,ddbtn,i18n.search.sort.byTitle,"title.sort","asc");
      addOption(ddul,ddbtn,i18n.search.sort.byDate,"sys_modified_dt","desc");
    },
    

  });
  
  return oThisClass;
});
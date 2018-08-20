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

  Change log
  SMR2018-08-18
  uniqueLinks looks at distribution_links_s
 */

define(["dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/string",
  "dojo/topic",
  "dojo/request/xhr",
  "dojo/on",
  "app/context/app-topics",
  "dojo/dom-class",
  "dojo/dom-construct",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/Tooltip",
  "dijit/TooltipDialog",
  "dijit/popup",
  "dojo/text!./templates/ItemCard.html",
  "dojo/i18n!app/nls/resources",
  "app/context/AppClient",
  "app/etc/ServiceType",
  "app/etc/util",
  "app/common/ConfirmationDialog",
  "app/content/ChangeOwner",
  "app/content/DeleteItems",
  "app/content/MetadataEditor",
  "app/context/metadata-editor",
  "app/content/SetAccess",
  "app/content/SetApprovalStatus",
  "app/content/SetField",
  "app/content/UploadMetadata",
  "app/preview/PreviewUtil",
  "app/preview/PreviewPane",
    "app/prov/Prov"],
function(declare, lang, array, string, topic, xhr, on, appTopics, domClass, domConstruct,
  _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Tooltip, TooltipDialog, popup, 
  template, i18n, AppClient, ServiceType, util, ConfirmationDialog, ChangeOwner, DeleteItems,
  MetadataEditor, gxeConfig, SetAccess, SetApprovalStatus, SetField, UploadMetadata, 
  PreviewUtil, PreviewPane) {
  
  var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
 
    i18n: i18n,
    templateString: template,
    
    isItemCard: true,
    item: null,
    itemsNode: null,
    searchPane: null,
    
    allowedServices: {
      "featureserver":"agsfeatureserver",
      "imageserver":"agsimageserver",
      "mapserver":"agsmapserver",
      "csw": "csw",
      "ims": "image",
      "sos": "sos",
      "wcs": "wcs",
      "wfs": "wfs",
      "wms": "wms"
    },
    
    postCreate: function() {
      this.inherited(arguments);
      var self = this;
      this.own(topic.subscribe(appTopics.ItemOwnerChanged,function(params){
        if (self.item && self.item === params.item) {
          self._renderOwnerAndDate(self.item);
        }
      }));
      this.own(topic.subscribe(appTopics.ItemApprovalStatusChanged,function(params){
        if (self.item && self.item === params.item) {
          self._renderOwnerAndDate(self.item);
        }
      }));
      this.own(topic.subscribe(appTopics.ItemAccessChanged,function(params){
        if (self.item && self.item === params.item) {
          self._renderOwnerAndDate(self.item);
        }
      }));
    },
    
    render: function(hit) {
      var item = this.item = hit._source;
      var highlight = hit.highlight;

      item._id = hit._id; 
      var links = this._uniqueLinks(item);
     // util.setNodeText(this.titleNode,item.title);
        this._renderTitle(item, highlight);
        //this._renderOwnerAndDate(item);
        this._renderSourceAndDate(item);
        //util.setNodeText(this.descriptionNode,item.description);
        this._renderDescription(item,highlight);
      this._renderThumbnail(item);
      this._renderItemLinks(hit._id,item);
      this._renderLinksDropdown(item,links);
      this._renderOptionsDropdown(hit._id,item);
      this._renderAddToMap(item,links);
      this._renderServiceStatus(item);
      this._renderUrlLinks(item);
        this._renderWorkbenchLinksDropdown(item,links);
        this._renderCinergiLinks(hit._id,item),
        this._renderSchemaOrg(item)
    },
    
    _canEditMetadata: function(item,isOwner,isAdmin,isPublisher) {
      var v;
      if ((isOwner && isPublisher) || isAdmin) {
        v = item.sys_metadatatype_s;
        if (typeof v === "string") {
          if (gxeConfig.editable.geoportalTypes.indexOf(v) !== -1) {
            if (gxeConfig.editable.allowNonGxeDocs) {
              return true;
            }
            v = item.app_editor_s;
            if (typeof v === "string" && v === "gxe") {
              return true;
            }
          }
        }
      }
      return false;
    },
    
    _isOwner: function(item) {
      var username = AppContext.appUser.getUsername();
      if (typeof username === "string" && username.length > 0) {
        return (username === item.sys_owner_s);
      }
      return false;
    },
    
    _mitigateDropdownClip: function(dd,ddul) {
      // Bootstrap dropdown menus clipped by scrollable container
      var self = this;
      var reposition = function() {
        //console.warn($(dd).offset());
        var t = $(dd).offset().top + 15 - $(window).scrollTop();
        var l = $(dd).offset().left;
        $(ddul).css('top',t);
        $(ddul).css('left',l);
        
        var position = dd.getBoundingClientRect().top;
        var buttonHeight = dd.getBoundingClientRect().height;
        var menuHeight = $(ddul).outerHeight();
        var winHeight = $(window).height();
        if (position > menuHeight && winHeight - position < buttonHeight + menuHeight) {
          //console.warn("dropup","position:",position,"t",t,"buttonHeight",buttonHeight,"menuHeight",menuHeight);
          t = t - menuHeight - buttonHeight - 4;
          $(ddul).css('top',t);
        } 
      };
      $(ddul).css("position","fixed");
      $(dd).on('click', function() {reposition();});
      //$(window).scroll(function() {reposition();});
      //$(this.itemsNode).scroll(function() {reposition();});
      //$(window).resize(function() {reposition();});
    },
    
    _mouseenter: function(e) {
      topic.publish(appTopics.OnMouseEnterResultItem,{item:this.item});
    },

    _mouseleave: function(e) {
      topic.publish(appTopics.OnMouseLeaveResultItem,{item:this.item});
    },
    
    _renderPreview: function(actionsNode, serviceType) {
      
      // declare preview pane
      var previewPane;
      
      // create preview area 
      var previewArea = domConstruct.create("div");
      var tooltipDialog = new TooltipDialog({
          style: "width: 470px; height: 320px;",
          content: previewArea,
          
          onBlur: function() {
            // cause to hide dialog whenever user clicks outside the map
            popup.close(tooltipDialog);
          },
          
          onKeyPress: function(event) {
            // cause to hide dialog whenever ESC key is being pressed
            if (event.keyCode === 27) {
              popup.close(tooltipDialog);
            }
          },
          
          onShow: function() {
            // focus automatically
            tooltipDialog.focus();
            
            // create new preview pane
            previewPane = new PreviewPane({serviceType: serviceType}, previewArea);
            previewPane.startup();
          },
          
          onHide: function() {
            // destroy preview pane
            previewPane.destroy();
            previewPane = null;
          }
      });
      this.own(tooltipDialog);
      
      // create clickable link to launch preview dialog
      var previewNode = domConstruct.create("a",{
        href: "javascript:void(0)",
        innerHTML: i18n.item.actions.preview
      },actionsNode);
      
      // install 'onclick' event handler to show tooltip dialog
      this.own(on(previewNode, "click", function() {
        popup.open({
          popup: tooltipDialog,
          around: previewNode
        });
      }));
    },
    
    _renderAddToMap: function(item,links) {
      if (links.length === 0) return;
      var endsWith = function(v,sfx) {return (v.indexOf(sfx,(v.length-sfx.length)) !== -1);};
      var actionsNode = this.actionsNode;
      array.some(links, lang.hitch(this, function(u){
        var serviceType = new ServiceType();
        serviceType.checkUrl(u);
        //console.warn("serviceType",serviceType.isSet(),serviceType);
        if (serviceType.isSet()) {
          domConstruct.create("a",{
            href: "javascript:void(0)",
            innerHTML: i18n.item.actions.addToMap,
            onclick: function() {
              topic.publish(appTopics.AddToMapClicked,serviceType);
            }
          },actionsNode);
          
          // create clickable 'Preview' link if allowes
          if (PreviewUtil.canPreview(serviceType)) {
            this._renderPreview(actionsNode, serviceType);
          }
          
          return true;
        }
      }));
    },
    
    _renderItemLinks: function(itemId,item) {
      if (AppContext.appConfig.searchResults.showLinks) {
        var actionsNode = this.actionsNode;
        var uri = "./rest/metadata/item/"+encodeURIComponent(itemId);
        var htmlNode = domConstruct.create("a",{
          href: uri+"/html",
          target: "_blank",
          innerHTML: "Full metadata record"
        },actionsNode);
        var xmlNode = domConstruct.create("a",{
          href: uri+"/xml",
          target: "_blank",
          innerHTML: "ISO XML"
        },actionsNode);
        var jsonNode = domConstruct.create("a",{
          href: uri+"?pretty=true",
          target: "_blank",
          innerHTML: i18n.item.actions.json
        },actionsNode);
        if (AppContext.geoportal.supportsApprovalStatus ||
            AppContext.geoportal.supportsGroupBasedAccess) {
          var client = new AppClient();
          htmlNode.href = client.appendAccessToken(htmlNode.href);
          xmlNode.href = client.appendAccessToken(xmlNode.href);
          jsonNode.href = client.appendAccessToken(jsonNode.href);
        }
        var v = item.sys_metadatatype_s;
        if (typeof v === "string" && v === "json") {
          htmlNode.style.visibility = "hidden";
          xmlNode.style.visibility = "hidden";
        }
      }
    },

    _renderLinksDropdown: function(item,links) {
      if (links.length === 0) return;
      var dd = domConstruct.create("div",{
        "class": "dropdown",
        "style": "display:inline-block;"
      },this.actionsNode);
      var ddbtn = domConstruct.create("a",{
        "class": "dropdown-toggle",
        "href": "#",
        "data-toggle": "dropdown",
        "aria-haspopup": true,
        "aria-expanded": true,
        innerHTML: i18n.item.actions.links
      },dd);
      domConstruct.create("span",{
        "class": "caret"
      },ddbtn);
      var ddul = domConstruct.create("ul",{
        "class": "dropdown-menu",
      },dd);

     /*
      use the dist_links_nst to get more link information
      */
      var dist_links=item.dist_link_nst;

      function getdistname (url) {
          //console.log("getdistname");
          result="";
          if (lang.isArray(dist_links)) {
            array.forEach(dist_links, function(alink){
               //console.log(alink);
               if (typeof alink.url_s === "string" &&
                        alink.url_s === url) {
                   if (typeof alink.url_name_s === "string"){
                        result = alink.url_name_s;
                      }
                    }
               }
            );
          } else if (lang.isObject(dist_links)) {
            if (typeof dist_links.url_s === "string" &&
                  dist_links.url_s === url) {
             if (typeof dist_links.url_name_s === "string"){
                  result = dist_links.url_name_s;
                }
              };
          }
          if (result === ""){
            return url;
            } else {
            return result;
            }
      };

      array.forEach(links, function(u){
        var ddli = domConstruct.create("li",{},ddul);
        thelabel = getdistname(u);

        domConstruct.create("a",{
          "class": "small",
          href: u,
          target: "_blank",
          innerHTML: thelabel
        },ddli);
      });
      this._mitigateDropdownClip(dd,ddul);
    },

    _renderOptionsDropdown: function(itemId,item) {
      var self = this;
      var isOwner = this._isOwner(item);
      var isAdmin = AppContext.appUser.isAdmin();
      var isPublisher = AppContext.appUser.isPublisher();
      var supportsApprovalStatus = AppContext.geoportal.supportsApprovalStatus;
      var supportsGroupBasedAccess = AppContext.geoportal.supportsGroupBasedAccess;
      var links = [];
      
      if (this._canEditMetadata(item,isOwner,isAdmin,isPublisher)) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.item.actions.options.editMetadata,
          onclick: function() {
            var editor = new MetadataEditor({itemId:itemId});
            editor.show();
          }
        }));
      }
      
      var canManage = ((isOwner && isPublisher) || isAdmin);
      
      if (canManage) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.item.actions.options.uploadMetadata,
          onclick: function() {
            (new UploadMetadata({itemId:itemId})).show();
          }
        }));
      }
      
      if (isAdmin) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.content.changeOwner.caption,
          onclick: function() {
            var dialog = new ChangeOwner({item:item,itemCard:self});
            dialog.show();
          }
        }));
      }
      
      if (supportsApprovalStatus && canManage) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.content.setApprovalStatus.caption,
          onclick: function() {
            var dialog = new SetApprovalStatus({item:item,itemCard:self});
            dialog.show();
          }
        }));
      }
      
      if (supportsGroupBasedAccess && canManage) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.content.setAccess.caption,
          onclick: function() {
            var dialog = new SetAccess({item:item,itemCard:self});
            dialog.show();
          }
        }));
      }
      
      if (canManage && AppContext.appConfig.edit && AppContext.appConfig.edit.setField && 
          AppContext.appConfig.edit.setField.allow && 
          (isAdmin || !AppContext.appConfig.edit.setField.adminOnly)) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.content.setField.caption,
          onclick: function() {
            var dialog = new SetField({item:item,itemCard:self});
            dialog.show();
          }
        }));        
      }
      
      if (canManage) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.content.deleteItems.caption,
          onclick: function() {
            var dialog = new DeleteItems({item:item,itemCard:self});
            dialog.show();
          }
        }));
      }
      
//      if (canManage) {
//        links.push(domConstruct.create("a",{
//          "class": "small",
//          href: "javascript:void(0)",
//          innerHTML: i18n.item.actions.options.deleteItem,
//          onclick: function() {
//            var dialog = new ConfirmationDialog({
//              title: i18n.item.actions.options.deleteItem,
//              content: item.title,
//              okLabel: i18n.general.del,
//              status: "danger"
//            });
//            dialog.show().then(function(ok){
//              if (ok) {
//                dialog.okCancelBar.showWorking(i18n.general.deleting,false);
//                var client = new AppClient();
//                client.deleteItem(itemId).then(function(response){
//                  topic.publish(appTopics.ItemDeleted,{
//                    itemId: itemId,
//                    searchPane: self.searchPane
//                  });
//                  self.domNode.style.display = "none";
//                  dialog.hide();
//                }).otherwise(function(error){
//                  var msg = i18n.general.error;
//                  console.warn("deleteItem.error",error);
//                  dialog.okCancelBar.showError(msg,false);
//                });
//              }
//            });
//          }
//        }));        
//      }

      if (links.length === 0) return;
      
      var dd = domConstruct.create("div",{
        "class": "dropdown",
        "style": "display:inline-block;"
      },this.actionsNode);
      var ddbtn = domConstruct.create("a",{
        "class": "dropdown-toggle",
        "href": "#",
        "data-toggle": "dropdown",
        "aria-haspopup": true,
        "aria-expanded": true,
        innerHTML: i18n.item.actions.options.caption
      },dd);
      domConstruct.create("span",{
        "class": "caret"
      },ddbtn);
      var ddul = domConstruct.create("ul",{
        "class": "dropdown-menu",
      },dd);
      array.forEach(links,function(link){
        var ddli = domConstruct.create("li",{},ddul);
        ddli.appendChild(link);
      });
      this._mitigateDropdownClip(dd,ddul);
    },
    
    _renderOwnerAndDate: function(item) {
      var owner = item.sys_owner_s;
      var date = item.sys_modified_dt;
      var idx, text = "", v;
      if (AppContext.appConfig.searchResults.showDate && typeof date === "string" && date.length > 0) {
        idx = date.indexOf("T");
        if (idx > 0) date =date.substring(0,idx);
        text = date;
      }
      if (AppContext.appConfig.searchResults.showOwner && typeof owner === "string" && owner.length > 0) {
        if (text.length > 0) text += " ";
        text += owner;
      }
      
      if (AppContext.appUser.isAdmin() || this._isOwner(item)) {
        if (AppContext.appConfig.searchResults.showAccess && 
            AppContext.geoportal.supportsGroupBasedAccess) {
          v = item.sys_access_s;
          if (text.length > 0) text += " - ";
          if (v === "private") {
            text += i18n.content.setAccess._private;
          } else {
            text += i18n.content.setAccess._public;
          }
        }
        if (AppContext.appConfig.searchResults.showApprovalStatus && 
            AppContext.geoportal.supportsApprovalStatus) {
          v = item.sys_approval_status_s;
          if (typeof v === "string" && v.length > 0) {
            v = i18n.content.setApprovalStatus[v];
          }
          if (typeof v === "string" && v.length > 0) {
            if (text.length > 0) text += " - ";
            text += v;
          }
        }
      }
      
      if (text.length > 0) {
        util.setNodeText(this.ownerAndDateNode,text);
      }
    },
    
    _renderThumbnail: function(item) {
      var show = AppContext.appConfig.searchResults.showThumbnails;
      var thumbnailNode = this.thumbnailNode;
      if (show && typeof item.thumbnail_s === "string" && item.thumbnail_s.indexOf("http") === 0) {
        setTimeout(function(){
          thumbnailNode.src = util.checkMixedContent(item.thumbnail_s);
        },1);
      } else {
        thumbnailNode.style.display = "none";
      }
      //thumbnailNode.src = "http://placehold.it/80x60";
    },
    
    _uniqueLinks: function(item) {
      var links = [];
      //smr 2018-08-18 update to use distribution_links_s
      if (typeof item.distribution_links_s === "string") {
        links = [item.distribution_links_s];
      } else if (lang.isArray(item.distribution_links_s)) {
        array.forEach(item.distribution_links_s, function(u){
          if (links.indexOf(u) === -1) links.push(u);
        });
      }
      return links;
    },
    
    _renderServiceStatus: function(item) {
      var type;
      var authKey = AppContext.appConfig.statusChecker.authKey;
      if (authKey && string.trim(authKey).length>0) {
        if (item && item.resources_nst) {
          if (item.resources_nst.length) {
            for (var i=0; i<item.resources_nst.length; i++) {
              type = this._translateService(item.resources_nst[i].url_type_s);
              if (type) {
                this._checkService(item._id,type);
                break;
              }
            }
          } else {
            type = this._translateService(item.resources_nst.url_type_s);
            if (type) {
              this._checkService(item._id,type);
            }
          }
        }
      }
    },
    
    _checkService: function(id,type) {
      console.log("Service check for: ", id, type);
      xhr.get("viewer/proxy.jsp?"+AppContext.appConfig.statusChecker.apiUrl,{
        query: {
          auth: AppContext.appConfig.statusChecker.authKey,
          type: type,
          id: id
        },
        handleAs: "json"
      }).then(lang.hitch({self: this, id: id, type: type},this._drawStatusIcon));
    },
    
    _drawStatusIcon: function(response) {
      if (response.error) {
        console.error(response.error);
      } else if (response.data!=null && response.data.constructor==Array && response.data.length>0) {
        var score = response.data[0].summary.scoredTest.currentScore;
        this.self._setServiceCheckerIcon(score,this.id,this.type);
      }    
    },
    
    _setServiceCheckerIcon: function(score,id,type) {
      console.log("SCORE", score);
      var imgSrc;
      var info;
      if(!score || score < 0) {
        imgSrc = "Unknown16.png";
        info = i18n.item.statusChecker.unknown;
      } else if(score <= 25) {
        imgSrc = "VeryBad16.png";
      } else if(score <= 50 ) {
        imgSrc = "Bad16.png";
      } else if(score <= 75 ) {
        imgSrc = "Good16.png";
      } else if(score > 75 && score <= 100) {
        imgSrc = "Excellent16.png";
      } else {
        imgSrc = "Unknown16.png";
        info = i18n.item.statusChecker.unknown;
      }
      if (!info) {
        info = string.substitute(i18n.item.statusChecker.status,{score: score});
      }
      
      var link = domConstruct.create("a",{
        href: AppContext.appConfig.statusChecker.infoUrl+"?auth="+AppContext.appConfig.statusChecker.authKey+"&uId="+id+"&serviceType="+type, 
        target: "_blank",
        alt: info,
        "class": "g-item-status"
      });
      domConstruct.place(link,this.titleNode,"first");
      
      var iconPlace = domConstruct.create("img",{
        src: "images/serviceChecker"+imgSrc, 
        alt: info, 
        height: 16, 
        width: 16
      });
      domConstruct.place(iconPlace,link);
      
      var tooltip = new Tooltip({
        connectId: link,
        label: info,
        position: ['below']
      });
      tooltip.startup();
    },
    
    _translateService: function(service) {
      if (service) {
        service = service.toLowerCase();
        if (this.allowedServices[service]) {
          return this.allowedServices[service];
        }
      }
      return null;
    },

    _renderUrlLinks: function(item) {
      if (AppContext.appConfig.searchResults.showCustomLinks) {
        this._renderUrlLink(item.url_thumbnail_s, i18n.item.actions.urlLinks.thumbnail);
        this._renderUrlLink(item.url_website_s, i18n.item.actions.urlLinks.website);
        this._renderUrlLink(item.url_project_metadata_s, i18n.item.actions.urlLinks.projectMetadata);
        this._renderUrlLink(item.url_granule_s, i18n.item.actions.urlLinks.granule);
        this._renderUrlLink(item.url_http_download_s, i18n.item.actions.urlLinks.downloadHTTP);
        this._renderUrlLink(item.url_ftp_download_s, i18n.item.actions.urlLinks.downloadFTP);
      }
    },

    _renderUrlLink: function(href, caption) {
      var actionsNode = this.actionsNode;

      if (href && href.length > 0) {
        var link = domConstruct.create("a",{
          href: href,
          target: "_blank",
          "class": "g-item-status",
          innerHTML: caption
        }, actionsNode);
      }
    },
    _renderSourceAndDate: function(item) {
/*          var owner = item.src_source_name_s;
          var date = item.sys_modified_dt;*/
          var author = item.cited_individual_s;
          var date = "";
          var dataCenter=item.dataCentre_s;
          var idx, text = "";

/*SMR 2018-08-20 modify to display the authors and creation date
 * Authors (cited_individual_s apparently might be string or array
 * have to handle both
 */


          if (Array.isArray(author)){
           author.forEach(function(element) {
             if (typeof element === "string") {
             if (text.length == 0  ) {
                   text = "Authors: " + element;
               } else {
                   text = text + ", " + element;
               };
           }})
           }
           else {
         	  if (typeof author === "string" && author.length > 0) {
                   if (text.length > 0) text += " ";
                   text = "Author: " + author;
               }
           }

/*  SMR 2018-08-20
            * report either the publication(available, release) date or reported creation date
            *
*/
            if (typeof item.apiso_PublicationDate_dt === "string" && item.apiso_PublicationDate_dt.length > 0){
             date = item.apiso_PublicationDate_dt;
             idx = date.indexOf("T");
                if (idx > 0) date =date.substring(0,idx);
                idx = date.indexOf("-01-01");
                if (idx > 0) date =date.substring(0,idx);
                date = ";    Publication: " + date;
            }
            else if (typeof item.apiso_CreatedDate_dt === "string" && item.apiso_CreatedDate_dt.length > 0 ){
             date = item.apiso_CreatedDate_dt;
             idx = date.indexOf("T");
                if (idx > 0) date =date.substring(0,idx);
                idx = date.indexOf("-01-01");
                if (idx > 0) date =date.substring(0,idx);
                date = ";    Created: " + date;
            }

             if (AppContext.appConfig.searchResults.showDate && typeof date === "string" && date.length > 0) {
                 text += date;
             }

             if (text.length > 0) {
                 util.setNodeText(this.ownerAndDateNode,text);
             }

   /*  original code
          if (typeof owner === "string" && owner.length > 0) {
              if (text.length > 0) text += " ";
              text = "Source: " + owner;
          }
          if (AppContext.appConfig.searchResults.showDate && typeof date === "string" && date.length > 0) {
              idx = date.indexOf("T");
              if (idx > 0) date =date.substring(0,idx);
              text += " Last Modified: " + date;
          }          if (text.length > 0) {
              util.setNodeText(this.ownerAndDateNode,text);
          }
   */
      },

    _renderWorkbenchLinksDropdown: function(item,links) {
          if ( ! Array.isArray(item.services_nst)) return;
          if( item.services_nst.length === 0) return;
          var dd = domConstruct.create("div",{
              "class": "dropdown",
              "style": "display:inline-block;"
          },this.actionsNode);
          var ddbtn = domConstruct.create("a",{
              "class": "dropdown-toggle",
              "href": "#",
              "data-toggle": "dropdown",
              "aria-haspopup": true,
              "aria-expanded": true,
              innerHTML: "Named Links"
          },dd);
          domConstruct.create("span",{
              "class": "caret"
          },ddbtn);
          var ddul = domConstruct.create("ul",{
              "class": "dropdown-menu",
          },dd);
          if (lang.isArray(item.services_nst)){
              array.forEach(item.services_nst, function(u){
                  var ddli = domConstruct.create("li",{},ddul);
                  domConstruct.create("a",{
                      "class": "small",
                      href: u.url_s,
                      target: "_blank",
                      innerHTML: u.url_type_s
                  },ddli);
              });
          }
          this._mitigateDropdownClip(dd,ddul);
      },
    _renderCinergiLinks: function(itemId,item) {
          // if categories_cat exists, then these should exist
          if (item.categories_cat) {

              var actionsNode = this.actionsNode;
              var uri = "app/prov/templates/Prov.html?source=" + encodeURIComponent(item.fileid);
              var htmlNode = domConstruct.create("a", {
                  href: uri + "&ttl=" + encodeURIComponent(item.title),
                  target: "_blank",
                  innerHTML: "Provenance"
              }, actionsNode);
              var uri2 = "http://mdeditor.usgin.org/?docId=" + encodeURIComponent(item.fileid);
              var htmlNode = domConstruct.create("a", {
                  href: uri2,
                  target: "_blank",
                  innerHTML: "Edit"
              }, actionsNode);
              //https://mybinder.org/v2/gh/CINERGI/jupyter-cinergi.git/master?urlpath=%2Fnotebooks%2FCinergiDispatch.ipynb
              var uri3 = "https://"+ "mybinder.org" +
                  "/v2/gh/CINERGI/jupyter-cinergi.git/master?urlpath=%2Fnotebooks%2FCinergiDispatch.ipynb"+
                  "?documentId=" + encodeURIComponent(item._id);
              // var uri3 = "http://"+ "suave-jupyterhub.com" +
              //     "/user/zeppelin-v/notebooks/CinergiDispatch.ipynb"+
              //     "?documentId=" + encodeURIComponent(item._id);
              var htmlNode = domConstruct.create("a", {
                  href: uri3,
                  target: "_blank",
                  innerHTML: "Workbench Demo"
              }, actionsNode);

          }

      },
    _renderSchemaOrg: function (item){
          var actionsNode = this.actionsNode;
          if (item.sys_metadatatype_s && item.sys_metadatatype_s.startsWith("iso19115") ) {
              var uri3 = "https://search.google.com/structured-data/testing-tool/u/0/#url=" +
                  encodeURIComponent(
                      "http://cinergi.sdsc.edu/geoportal/rest/metadata/item/" + item._id + "/html");
              var htmlNode = domConstruct.create("a", {
                  href: uri3,
                  target: "_blank",
                  innerHTML: "Schema.Org"
              }, actionsNode);
          }
      },

    _renderDescription: function (item, highlight) {
          var desc = item.description;

          if (typeof highlight != "undefined"
             && typeof highlight.description != "undefined"
             && highlight.description.length > 0){
              desc = highlight.description;
          } else if (typeof desc === "undefined"
             || desc.indexOf("REQUIRED FIELD") > -1
             || desc.length === 0) {
               desc = "No abstract provided";
          }
          util.setNodeText(this.descriptionNode,desc);
      },
      /*
      SMR 2018-08-20 adjust logic to always render something
      */
    _renderTitle: function (item, highlight) {
          var title = item.title;
          if (typeof title === "undefined"){
            title = "Title not provided";
          } else {
            if (typeof highlight != "undefined" && typeof highlight.title != "undefined"){
                  title = highlight.title;
            };
          }
          util.setNodeText(this.titleNode,title);
      },
  });
  
  return oThisClass;
});
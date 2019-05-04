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
        "app/common/Templated",
        "app/etc/util",
    "app/collection/CollectionBase"],
function(declare, lang, array, Templated, util, CollectionBase) {
  
  var oThisClass = declare([Templated], {

    conditionallyDisabled: false,
    isCollectionComponent: true,
    collectionPane: null,

     mdArray : [],
  curPage : 0,
   sType : "local",
   search: "",
  totRecords : 0,
    /* params - {geoportalUser:obj} */
    ItemAdded: "app/SignedIn",
    /* params - {geoportalUser:obj} */
    Item: "app/SignedIn",

    postCreate: function() {
      this.inherited(arguments);
      if (this.conditionallyDisabled) {
        if (this.domNode) this.domNode.style.display = "none";
      }
    },
    processError: function(searchError) {},

    processSavedResults: function(items) {},


  //  var open = window.XMLHttpRequest.prototype.open,
  //  send = window.XMLHttpRequest.prototype.send,
   // onReadyStateChange;

// * entry point - attach to button class

//   $(".btn").on('click', function (b) {
//     var bl = b;
//     if (b.title == 'Search' || b.target.title == 'Search') {
//
//       setTimeout(function () {
//
//         $(".g-item-card").each(function () {
//           var gC = $(this);
//           setSavedCard(gC);
//           assignEvent(gC);
//
//         })
//
//       }, 2000);
//     }
//
//   });
// ,

//  mdRecord : function (id, fileId, title, link, description, collections) {
//     var mdRec = {
//       "id": id,
//       "fileId": fileId,
//       "title": title,
//       "mdlink": link,
//       "description": description,
//       "collections": collections
//     };
//     return mdRec;
//   }
//       ,
//
//   searchItem :function (id, searchText, sUrl, params, query) {
//     var mdSS = {
//       "id": id,
//       "searchText": searchText,
//       "searchUrl": sUrl,
//       "params": params,
//       "query": query,
//
//     };
//     return mdSS;
//
//   }
//       ,
//      collectionItem : function (id, colName, colDesc ) {
//       var cI = { "id" : id,
//         "colName" : colName,
//         "colDesc" : colDesc
//       };
//       return cI;
//
//     },
//     createUUID: function () {
//     // From http://www.ietf.org/rfc/rfc4122.txt
//     var s = [];
//     var hexDigits = "0123456789abcdef";
//     for (var i = 0; i < 36; i++) {
//       s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
//     }
//     s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
//     s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
//     s[8] = s[13] = s[18] = s[23] = "-";
//
//     var uuid = s.join("");
//     return uuid;
//   }
// ,
//     findLocalItems: function  (query) {
//     var i, results = [];
//     for (i in localStorage) {
//       if (localStorage.hasOwnProperty(i)) {
//         if (i.match(query) || (!query && typeof i === 'string')) {
//           value = JSON.parse(localStorage.getItem(i));
//           results.push({key:i,val:value});
//         }
//       }
//     }
//     return results;
//   },
//
//     saveMdRecord : function (md) {
//
//     var key = "mdRec-" + md.id;
//     localStorage.setItem(key, JSON.stringify(md) );
//     refeshMdPanel(container);
//     return key;
//   },
//
//   saveCollectionItem:function (ColItem) {
//
//     var key = "cItem-"+ ColItem.id;
//     localStorage.setItem(key, JSON.stringify(ColItem) );
//     return key;
//   },
//     getCollections: function (qField, query) {
//     var col = this.findLocalItems("cItem");
//     // If there is a query
//     if ( typeof(qField) !== "undefined" && typeof(query) !== "undefined"  ) {
//       results = [];
//       for (var k in col){
//         var kd = col[k].val;
//         var kid = kd[qField];
//         var cleanKid = kid.replace(/[|&;$%@"<>()+,]/g, "");
//         var cleanQry = query.replace(/[|&;$%@"<>()+,]/g, "");
//         if ( cleanKid.match(cleanQry) ) {
//           results.push({key:k,val: kd });
//         }
//       }
//       col = results;
//
//     }
//
//     return col;
//   },
//     saveSearchItem: function (SeaItem) {
//
//     var key = "sItem-"+ SeaItem.id;
//     localStorage.setItem(key, JSON.stringify(SeaItem) );
//     return key;
//
//   },
//
//   getMdRecords : function (qField, query) {
//     var md = this.findLocalItems("mdRec");
//     // If there is a query
//     if ( typeof(qField) !== "undefined" && typeof(query) !== "undefined" ) {
//       results = [];
//       for (var k in md){
//         var  mkr = md[k].val;
//         var  mkey = md[k].key;
//         // var kid = md[k][qField];
//
//         if ( qField == "collections") {
//           if ( query == "default" )
//           {
//             var mCol = mkr.collections;
//             // only bring back if only in default
//             if ( mCol.length == 1 & mCol[0] == "default") {
//               results.push({key:mkey,val:mkr});
//             }
//
//           } else if ( query == "all") {
//             results.push({key:mkey,val:mkr});
//
//           } else {
//             var mCol = mkr.collections;
//
//             for ( var c in mCol ) {
//
//               if ( mCol[c].match(query) ) {
//                 results.push({key:mkey,val:mkr});
//               }
//             }
//           }
//         } else if ( qField == "id" ) {
//           if (  mkr.id == query ) {
//             results.push({key:mkey,val:mkr});
//           }
//         } else {
//           var mkStr = JSON.stringify(mkr);
//           if ( mkStr.match(query) ) {
//             results.push({key:mkey,val:mkr});
//           }
//         }
//
//       }
//       md = results;
//     }
//
//     return md;
//   },
//
//
//   findLocalItems:function  (query) {
//     var i, results = [];
//     for (i in localStorage) {
//       if (localStorage.hasOwnProperty(i)) {
//         if (i.match(query) || (!query && typeof i === 'string')) {
//           value = JSON.parse(localStorage.getItem(i));
//           results.push({key:i,val:value});
//         }
//       }
//     }
//     return results;
//   },
// duplicate version. Also in UI
// function saveMdRecord(md) {
//
//     var key = "mdRec-" + md.id;
//     localStorage.setItem(key, JSON.stringify(md));
//     return key;
// }

  setSavedCard :function (gC) {
    console.log('click Card:setSavedEvent');
    //var topGC = gC;
    $(gC).find('*').each(function () {
      //console.log('a');
      if (typeof($(this).attr('href')) !== "undefined") {
        var href = $(this).attr('href');
        if (href.substr(0, 6) == "./rest" && href.substring(href.length - 4) == "html") {

          var ahr = href.split("/");
          xid = ahr[ahr.length - 2];
          var md = localStorage.getItem("mdRec-" + xid);
          if (typeof(md) !== "undefined" && md !== null) {
            $(gC).css("background-color", "#aaa");
          }
          console.log('e' + href);
        }

      }

    });
  }

,
  assignEvent: function (gC) {
    console.log('click Card:assignEvent');
    // $(gC).click(function () {
    var tlval = '',
        fileId = '',
        DescVal = '',
        mLink = '',
        xid = '',
        cState = 'f',
        xLinks = '';

    var gRgb = $(this).css("background-color");
    if (gRgb == "rgb(170, 170, 170)") {
      cState = 'f';
    } else {
      $(this).css("background-color", "#aaa");
      cState = 't';
    }

    $(this).find('*').each(function () {
          var iClass = $(this).attr('class');

          if (iClass == 'g-item-title') {
            tlval = $(this).html();
          }

          if (iClass == 'g-item-description') {
            DescVal = $(this).html();
          }

          if (typeof($(this).attr('href')) !== "undefined") {
            var href = $(this).attr('href');

            if (href.substr(0, 6) == "./rest" && href.substring(href.length - 4) == "html") {
              mLink = "http://datadiscoverystudio.org/geoportal/" + href.substr(2);
              var ahr = href.split("/");
              xid = ahr[ahr.length - 2];

            }

          }
        }
    );

    if (cState == 't') {
      var col = ["default"];
      var newMdRecord = CollectionBase.mdRecord(xid, fileId, tlval, mLink, DescVal, col);
      CollectionBase.saveMdRecord(newMdRecord);

    } else {

      console.log('Removing if in just default');
      var mdRec = localStorage.getItem("mdRec-" + xid);
      if (mdRec.length) {
        var mo = JSON.parse(mdRec);

        if (mo.collections.length < 2) {
          localStorage.removeItem("mdRec-" + xid)
          $(this).css("background-color", "white");
        } else {
          mo.collections.pop();
          mdRec = JSON.stringify(mo);
          CollectionBase.saveMdRecord(newMdRecord);
        }
      }

    }
    console.log('click card');
    //  });


  }
,

  openReplacement: function (method, url, async, user, password) {
    var syncMode = async !== false ? 'async' : 'sync';
    return open.apply(this, arguments);
  }
,
  sendReplacement: function (data) {

    if ( data !== null & typeof(data) !== "undefined") {
      var dt = typeof data;
      var io = data.indexOf("query");

      if ( typeof data === "string" && data.indexOf("query") > 0 ) {
        localStorage.setItem("saveSearch", data);
      }
      if(this.onreadystatechange) {
        this._onreadystatechange = this.onreadystatechange;
      }
      this.onreadystatechange = onReadyStateChangeReplacement;
      return send.apply(this, arguments);
    } else {
      return send.apply(this, arguments);
    }

  }

,
    onReadyStateChangeReplacement:  function () {

    if (this._onreadystatechange) {
      return this._onreadystatechange.apply(this, arguments);
    }
  },

 // window.XMLHttpRequest.prototype.open = openReplacement;
//  window.XMLHttpRequest.prototype.send = sendReplacement;


  });
  
  return oThisClass;
});
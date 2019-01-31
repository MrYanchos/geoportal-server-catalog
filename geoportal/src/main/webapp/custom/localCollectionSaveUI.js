/*  Saved Collections, Searches and Results
    GH
    1/11/2019
*/

// $(".navbar-logo").click(function() {
//     var container= $('.g-search-pane-right');
//     searchPanel(container);
//
// });
// $(".navbar-logo").click(function() {
    var container= $('#collectionPanel');
    searchPanel(container);
//
// });

var mdRecord = function (id, fileId, title, link, description, collections ) {
    var mdRec = { "id" : id,
                "fileId" : fileId,
                "title" : title,
                "mdlink" : link,
                "description"  : description,
                "collections" : collections
              };
    return mdRec;

}

var searchItem = function (id, searchText, sUrl, params ) {
    var mdSS = { "id" : id,
                "searchText" : searchText,
                "searchUrl" : sUrl,
                "params" : params   
              };
    return mdSS;
    
}
   
var collectionItem = function (id, colName, colDesc ) {
    var cI = { "id" : id,
                "colName" : colName,
                "colDesc" : colDesc
              };
    return cI;
    
}

function saveMdRecord(md) {

    var key = "mdRec-" + md.id;
    localStorage.setItem(key, JSON.stringify(md) );
    return key;
}

function saveCollectionItem(ColItem) {

    var key = "cItem-"+ ColItem.id;
    localStorage.setItem(key, JSON.stringify(ColItem) );
    return key;
}

function saveSearchItem(SeaItem) {

    var key = "sItem-"+ SeaItem.id;
    localStorage.setItem(key, JSON.stringify(SeaItem) );
    return key;

}

function getMdRecords(qField, query) {
     var md = findLocalItems("mdRec");
     // If there is a query
     if ( typeof(qField) !== "undefined" && typeof(query) !== "undefined" ) {
         results = [];
         for (var k in md){
            var  mkr = md[k].val;
            var  mkey = md[k].key;
           // var kid = md[k][qField];

            if ( qField == "collections") {
                if ( query == "default" )
                { 
                     results.push({key:mkey,val:mkr});
                 

                } else {
                    var mCol = mkr.collections;

                    for ( var c in mCol ) {

                        if ( mCol[c].match(query) ) {
                            results.push({key:mkey,val:mkr});
                        }
                    }
                }
             } else if ( qField == "id" ) {
                 if (  mkr.id == query ) {
                     results.push({key:mkey,val:mkr});    
                 } 
             } else {
                var mkStr = JSON.stringify(mkr);
                if ( mkStr.match(query) ) {
                 results.push({key:mkey,val:mkr});
                }                 
             }
          
         }
         md = results;
     }

     return md;
}


function getCollections(qField, query) {
    var col = findLocalItems("cItem");
      // If there is a query
     if ( typeof(qField) !== "undefined" && typeof(query) !== "undefined"  ) {
         results = [];
         for (var k in col){
              var kid = md[k][qField];
              if ( kid.match(query) ) {
                 results.push({key:i,val:col[k]});
                }   
         }
        col = results;
       
     }

    return col;
}

function getSavedSearches(qField, query) {
    var sea = findLocalItems("sItem");
    if ( typeof(qField) !== "undefined" && typeof(query) ) {
         results = [];
         for (var k in sea){
              var kid = sea[k][qField];
              if ( kid.match(query) ) {
                 results.push({key:i,val:sea[k]});
                }   
         }
        sea = results;
     }

    return sea;

}

function findLocalItems (query) {
  var i, results = [];
  for (i in localStorage) {
    if (localStorage.hasOwnProperty(i)) {
      if (i.match(query) || (!query && typeof i === 'string')) {
        value = JSON.parse(localStorage.getItem(i));
        results.push({key:i,val:value});
      }
    }
  }
  return results;
}

function createUUID() {
    // From http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

function searchPanel(container) {
// Top level container for SaveSearch functions - attatch to container
    console.log('level1');
    
	if ($('#saveSearchPanel').length) {
		
		$('#saveSearchPanel').hide();
		$('#saveSearchPanel').remove();
	} else {
	   // var wrapper = $('<div class="g-search-results-pane" data-dojo-attach-point="containerNode" id="saved-pane-101" widgetid="uniqName_10110">');
	  // var dropane = $('<div class="g-drop-pane dijitTitlePane" id="dijit_TitlePane_17" widgetid="dijit_TitlePane_17">');
	  //  var tibar = $('<div data-dojo-attach-event="ondijitclick:_onTitleClick, onkeydown:_onTitleKey" class="dijitTitlePaneTitle dijitTitlePaneTitleOpen dijitOpen" data-dojo-attach-point="titleBarNode" id="dijit_TitlePane_17_titleBarNode">');
        

		//var searchPanel = $('<div id="saveSearchPanel" class="g-drop-pane dijitTitlePane" />');
		var searchPanel = $('<div class="dijitTitlePaneTitleFocus" data-dojo-attach-point="focusNode" role="button" aria-controls="dijit_TitlePane_17_pane" tabindex="0" aria-pressed="true">');
        var tb =  $('<span data-dojo-attach-point="titleNode" class="dijitTitlePaneTextNode" />').html('<b>Saved Collections Searches and Results Panel</b>');
        
        searchPanel.append(tb);

  
     //   tibar.append(searchPanel);
     //   dropane.append(tibar);
     //   wrapper.append(dropane);

       var seaSet =  makeSearchPanel();  
       searchPanel.append(seaSet);
         
       var colset = makeCollectionPanel();
  	   searchPanel.append(colset);

  		var addBtn = $('<button id="export-all" class="btn" onclick="exportAll(this)">Export CSV</button>')
                      .css("height", "20px" )
                      .css("padding","4px 16px")
                      .css("margin", "10px")
                       .css("color", "#ffffff")
                      .css("font-size", "11px")
                      .css("background-color", "#1E84A8");
  		searchPanel.append(addBtn);

  		var md = makeRecordPanel();
  		searchPanel.append(md);

        //container.append(searchPanel);
        container.append(searchPanel);
        searchPanel.show();
      //  wrapper.show();


	}

    
}

function exportAll() {

    var colText = "Collections</br>";
    var sc = findLocalItems("cItem");
    if ( Array.isArray(sc) ) {
          for ( var c in sc ) {
              var cId = ss[c].key;;
              var cName = sc[c].val.colName;
              var cDesc = sc[c].val.colDesc;
              var cMD = getMdRecords('collections', cId);
              if ( Array.isArray(md) ) {
                  for ( var c in md ) {
                      var mName = md[c].val.title;
                      var mLink = md[c].val.mdlink;
                      var mId =  md[c].val.id;
                      colText = colText + cName + ',' + mName + "," + mLink +  "," + mId + "</br>";
                  }
              } else {
                colText = colText + cName + "," + cDesc + "</br>";    
              }
              
          }
    }

    var srchText = "Saved Searches</br>";
    var ss = findLocalItems("sItem");
        if ( Array.isArray(ss) ) {
          for ( var c in ss ) {
              var sKey = ss[c].key;
              var SName = ss[c].val.searchText;
              var sDesc = ss[c].val.searchUrl;

             // var z = ss[c].val.query.bool.must;
              //for ( var i in z) {
              //       var sDesc = z[i].query_string.query;     
             // }
              //var sDesc = ss[c].val.query.bool.must.0.query_string.query;
              srchText = srchText + SName + "," + sDesc + "</br>";
          }

    }
    var mdText = "Saved Records</br>";
    var md =  findLocalItems("mdRec");
        if ( Array.isArray(md) ) {
          for ( var c in md ) {
              var mName = md[c].val.title;
              var mLink = md[c].val.mdlink;
              var mId =  md[c].val.id;
               mdText = mdText + mName + "," + mLink +  "," + mId + "</br>";
          }
    }

    var xft =  colText + srchText + mdText;
    var w = window.open();
    $(w.document.body).html(xft);

}

/* Saved Records pane */
function makeRecordPanel(qf, q) {
//UI for the mdRecords Panel
    if ( $("#savedRecPanel").length ){
        $("#savedRecPanel").empty();
    } else {
        var cp = $('<div id="savedRecPanel" class="dijitTitlePaneContentOuter" data-dojo-attach-point="hideNode" role="presentation" />');
    }

    var tb =  $('<span data-dojo-attach-point="titleNode" class="dijitTitlePaneTextNode" />').html('<b>Saved Search Results</b>');
    cp.append(tb);

    var mda = getMdRecords(qf, q);
    for (var k in mda) {
        var mdRec = mda[k];
        var gCard = recordPanelItem(mdRec.val);
        cp.append(gCard);
    }
    return cp;

}

function recordPanelItem(md) {

      var gCard = $('<div id ="gCard-' + md.id + '" class="g-item-card" style="background-color: white;" />')
                    .attr('title', md.description);

      var addBtn = $('<button id="addRec-' + md.id + '" class="btn" onclick="addToCollection(this)">Add to Collection</button>')
                      .css("height", "20px" )
                      .css("padding","4px 16px")
                      .css("margin", "10px")
                       .css("color", "#ffffff")
                      .css("font-size", "11px")
                      .css("background-color", "#1E84A8");

      var clrBtn = $('<button id="remRec-' + md.id + '" class="btn" onclick="removeRecord(this)">Remove</button>')
              .css("height", "20px" )
              .css("padding","4px 16px")
               .css("color", "#ffffff")
              .css("margin", "10px")
              .css("font-size", "11px")
              .css("background-color", "#1E84A8");
   
      var gTitle = $('<div class="g-item-title" data-dojo-attach-point="titleNode" >').append(
                        $('<a>').attr('href', md.mdlink)
                            .attr('target', '_blank')
                            .append(md.title));

      gCard.append(gTitle);
      gCard.append(addBtn);
      gCard.append(clrBtn);
     
  
     return gCard; 
    

}

function addToCollection(cObj) {

    console.log(' Add to collection');
    var recID = cObj.id.substr(7);

    var ColID = $('#gCollection').find(":selected").val();
   
    var ctu = getMdRecords("id", recID);

    for ( var z in ctu ) {
    	var mdc = ctu[z].val;
    	var colA = mdc.collections;
    	colA.push(ColID);
    	localStorage.setItem("mdRec-"+recID, JSON.stringify(mdc));	
    }

        
 }


function removeRecord(cObj) {
    // Remove from collection if multiple, else remove record entirely
    console.log(' Remove from collection ');
    var recID = cObj.id.substr(7);

    var ColID = $('#gCollection').find(":selected").val();
   
    var ctu = getMdRecords("id", recID);

    for ( var z in ctu ) {
    	var mdc = ctu[z].val;
    	var colA = mdc.collections;
    	if ( colA.length < 2 ) {
    	     localStorage.removeItem("mdRec-"+recID);
    	} else {
            for ( var c in colA ) {
    	       if ( colA[c] == ColID ) {
    	           colA.pop();
    	       }
    	   }
    	   localStorage.setItem("mdRec"+recID, JSON.stringify(mdc));	

    	}

    }


    var gCard = $('#gCard-' + recID);
	gCard.hide();
	gCard.remove();
  
 }


/* Saved Collections */

function makeCollectionPanel(){

      var col = getCollections();

      var cp = $('<div id="savedCollectionPanel" class="dijitTitlePaneContentOuter" data-dojo-attach-point="hideNode" role="presentation" />')
              .text("Saved Collections");
      var gCard = $('<select id ="gCollection" style="background-color: white;" />');


      var colOpt1 = $('<option value="default" >Select a Collection ...</option>');
      gCard.append(colOpt1);

      for (var k in col) {
            var colk = col[k].val
            var colOpt = $('<option value="' + colk.id + '" >' + colk.colName +'</option>');
            gCard.append(colOpt);     
      }
      
      var vBtn = $('<button id="vBtn" class="btn" onclick="selectCollection(this)">View</button>')
                      .css("height", "20px" )
                      .css("padding","4px 16px")
                       .css("color", "#ffffff")
                      .css("margin", "10px")
                      .css("font-size", "11px")
                      .css("background-color", "#1E84A8");

      var gColLabel = $('<label for="gInpCol"> or Enter New </label>');
      var gColInput = $('<input type="text" id="gInpCol" placeholder="Collection Name" size="30" />');
      var addBtn = $('<button id="addBtn" class="btn" onclick="addCollection(this)">Add</button>')
                      .css("height", "20px" )
                      .css("padding","4px 16px")
                       .css("color", "#ffffff")
                      .css("margin", "10px")
                      .css("font-size", "11px")
                      .css("background-color", "#1E84A8");
       var clrBtn = $('<button id="rmBtn" class="btn" onclick="removeCollection(this)">Remove</button>')
                      .css("height", "20px" )
                      .css("padding","4px 16px")
                      .css("color", "#ffffff")
                      .css("margin", "10px")
                      .css("font-size", "11px")
                      .css("background-color", "#1E84A8");

      cp.append(gCard);
      cp.append(vBtn);
      cp.append(gColLabel);   
      cp.append(gColInput);  
      cp.append(addBtn);  
      cp.append(clrBtn);           
      return cp;

}


 function selectCollection(colVal) {

        var ColID = $('#gCollection').find(":selected").val();
		console.log('Show records in the collection ..' + ColID);

		$('#savedRecPanel').hide();
		$('#savedRecPanel').remove();
 		var mdRecSet = makeRecordPanel("collections", ColID);
		$('#saveSearchPanel').append(mdRecSet);
        $('#savedRecPanel').show();
}

function addCollection(C){

    var newCollection = $("#gInpCol").val();
    var ncID = createUUID();

    if (newCollection.length ) {
        var nco = collectionItem(ncID, newCollection,"")
        localStorage.setItem("cItem-"+ncID, JSON.stringify(nco));

        var newColOpt = $('<option value="' + ncID + '" >' + newCollection +'</option>');
        $("#gCollection").append(newColOpt);         

    }
     
}


function removeCollection(C){

    var ColID = $('#gCollection').find(":selected").val();
    
    var mdRem  = getMdRecords("collections", ColID );

    for ( var k in mdRem ) {
        var mCol = mdRem[k].val.collections;
        var mid = mdRem[k].val.id;
        var saveMe = false;
        if ( mCol.length < 2 ) {
             localStorage.removeItem("mdRec-"+mid);
        } else {
            for ( var c in mCol ) {

                if ( mCol[c].match(ColID) ) {
                    mCol.splice(c, 1);
                    saveMe = true;
                    //results.push({key:mkey,val:mkr});
                }
            }
            if ( saveMe ) { localStorage.setItem("mdRec-"+mid, JSON.stringify(mdRem)); }
        }       
    }

    localStorage.removeItem("cItem-"+ColID);

    $('#gCollection').find(":selected").remove();
    $('#gCollection').val('default');
    makeRecordPanel();
        
     
}



/* Saved Searches */ 

function makeSearchPanel() {
   

      var cp = $('<div id="savedSearchPanel" class="dijitTitlePaneContentOuter" data-dojo-attach-point="hideNode" role="presentation" />')
              .text("Saved Searches");
      var gCard = $('<select id ="gSavedSearch" style="background-color: white;" />'); 
      
      var colOpt1 = $('<option value="default" >Your Saved Searches ...</option>');
      gCard.append(colOpt1);

      var sea = getSavedSearches();

      for (var k in sea) {
          var seak = sea[k].val;
          var colOpt = $('<option value="' + seak.id + '" title="' + seak.searchUrl + '" >' + seak.searchText +'</option>');
          gCard.append(colOpt);
       }

      var gColLabel = $('<label for="gInpCol"> Saved Searches </label>');
      //var gColInput = $('<input type="text" id="gInpSearch" class="form-control" />');
      var seaBtn = $('<button id="addBtn" class="btn" onclick="runSearch(this)">Go To ..</button>')
                      .css("height", "20px" )
                      .css("padding","4px 16px")
                      .css("margin", "10px")
                      .css("color", "#ffffff")
                      .css("font-size", "11px")
                      .css("background-color", "#1E84A8");
      var addBtn = $('<button id="addBtn" class="btn" onclick="addSearch(this)">Save Current</button>')
                      .css("height", "20px" )
                      .css("padding","4px 16px")
                      .css("margin", "10px")
                      .css("color", "#ffffff")
                      .css("font-size", "11px")
                      .css("background-color", "#1E84A8");
       //var clrBtn = $('<button id="' + rid + '" class="btn" onclick="removeSearch(this)">Remove</button>')
       var clrBtn = $('<button id="rmBtn" class="btn" onclick="removeSearch(this)">Remove</button>')
                      .css("height", "20px" )
                      .css("padding","4px 16px")
                       .css("color", "#ffffff")
                      .css("margin", "10px")
                      .css("font-size", "11px")
                      .css("background-color", "#1E84A8");

      cp.append(gCard);
      cp.append(seaBtn);   
      cp.append(addBtn);  
      cp.append(clrBtn);           
      

      return cp;

  }

   function runSearch(cObj) {
    // Run a selected search - nor sure yet

    var seaID = cObj.id;
    
    var seaID = $('#gSavedSearch').find(":selected").val();
    var seaO = JSON.parse(localStorage.getItem("sItem-"+seaID));
   
    var sUrl = seaO.searchUrl;

    var w = window.open();
    w.location.href = sUrl;

 

  }

   function removeSearch(cObj) {
    // Remove Saved Search

    var seaID = cObj.id;
    localStorage.removeItem(seaID);
    console.log('cleared cookie ' + seaID);   

    // Remove from list ...
     var ColStr =$('#gSavedSearch').find(":selected").remove();
  
  }

  function addSearch(cObj) {
    // Puts a record into saved search

    var sUrl='http://cinergi.sdsc.edu/geoportal/?q=';

    var ss = JSON.parse(localStorage.getItem("saveSearch") );
    var sa =  ss.query.bool.must;
    for ( var i in sa) {
            var sQry = sa[i].query_string.query;     
    }
    sUrl=sUrl+sQry;
    //var seaID = cObj.id.substr(6);
    var newSearchText = sQry;
   
    var nid = createUUID();
    var si = searchItem(nid, newSearchText, sUrl, ss);
    saveSearchItem(si);

    var newSearch = $('<option value="' + si.id + '" >' + newSearchText + '</option>');
    $('#gSavedSearch').append(newSearch);
     console.log(' Add search' + newSearchText);
 
  }



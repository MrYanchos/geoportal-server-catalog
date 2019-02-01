/*  Saved Collections, Searches and Results
    GH
    1/11/2019
*/

// $(".navbar-logo").click(function() {
//     var container= $('.g-search-pane-right');
//     searchPanel(container);
//
// });
// // $(".navbar-logo").click(function() {
//     var container= $('#collectionPanel');
//     searchPanel(container);
// //
// // });


var container= $('#collectionPanel');
var mdRecordsId = "uniqName_9_24";
var collectionPanelId = "uniqName_9_22";
//var container= $('#collectionContent');


leftPanel(container);
rightPanel(container);

var mdArray = [];
var curPage = 0;
var sType = "local";
var search = "";

function leftPanel(container) {

    var lPanel = $('<div class="g-search-pane-left" style="padding: 4px 10px; margin: 10px;">');
    var lp =  $('<div class="g-drop-pane dijitTitlePane dijitTitlePaneFocused dijitFocused" id="dijit_TitlePane_0" widgetid="dijit_TitlePane_0">');

    lPanel.append(lp);
    var seaSet =  makeSearchPanel();
    lPanel.append(seaSet);

    var colset = makeCollectionPanel();
    lPanel.append(colset);

    var expBtn = $('<button id="export-all" class="btn" onclick="exportAll(this)">Export CSV</button>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("margin", "10px")
        .css("color", "#ffffff")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");

    lPanel.append(expBtn);

    var inpBtn = $('<button id="export-all" class="btn" onclick="exportAll(this)">Import CSV</button>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("margin", "10px")
        .css("color", "#ffffff")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");
    lPanel.append(inpBtn);

    lPanel.show();
    container.append(lPanel);

}

function makeSearchPanel() {

    var uniq = $('<div id="uniqName_9_20" widgetid="uniqName_9_20" >');
    var cp =   $('<div class="g-drop-pane dijitTitlePane" id="dijit_TitlePane_0" widgetid="dijit_TitlePane_0">');
    var tb =  $('<div data-dojo-attach-event="ondijitclick:_onTitleClick, onkeydown:_onTitleKey" class="dijitTitlePaneTitle dijitTitlePaneTitleOpen dijitOpen" data-dojo-attach-point="titleBarNode" id="dijit_TitlePane_0_titleBarNode">').html('Saved Searches');
    var tb2 = $('<div class="dijitTitlePaneTitleFocus" data-dojo-attach-point="focusNode" role="button" aria-controls="dijit_TitlePane_0_pane" tabindex="0" aria-pressed="true">');
    var sp1 = $('<span data-dojo-attach-point="arrowNode" class="dijitInline dijitArrowNode" role="presentation"></span>');
    var sp2 = $('<span data-dojo-attach-point="arrowNodeInner" class="dijitArrowNodeInner"></span>');
    var sp3 = $('<span data-dojo-attach-point="titleNode" class="dijitTitlePaneTextNode" style="user-select: none;">Search</span>');
    var sp4 = $('<span class="g-drop-pane-tools"></span>');
    var op = $('<div class="dijitTitlePaneContentOuter" data-dojo-attach-point="hideNode" role="presentation">');

    tb.append(sp2);
    tb2.append(sp1);
    tb2.append(sp2);
    tb2.append(sp3);
    tb2.append(sp4);
    cp.append(tb);
    uniq.append(cp);

    var gCard = $('<select id="gSvSearch" class="form-control" style="background-color: white;" />');

    var colOpt1 = $('<option value="default" >Your Saved Searches ...</option>');
    gCard.append(colOpt1);

    var sea = getSavedSearches();

    for (var k in sea) {
        var seak = sea[k].val;
        var colOpt = $('<option value="' + seak.id + '" title="' + seak.searchUrl + '" >' + seak.searchText +'</option>');
        gCard.append(colOpt);
    }
    var bDiv =  $('<div id="searchButtons" class="dijitTitlePaneContentOuter" data-dojo-attach-point="hideNode" role="presentation" />');

    var seaBtn = $('<button id="addBtn" class="btn" onclick="show_cinergi(0)">Go To ..</button>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("margin", "10px")
        .css("color", "#ffffff")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");
    var addBtn = $('<button id="addBtn" class="btn" onclick="_addSearch(this)">Save Current</button>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("margin", "10px")
        .css("color", "#ffffff")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");

    var clrBtn = $('<button id="rmBtn" class="btn" onclick="_removeSearch(this)">Remove</button>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("color", "#ffffff")
        .css("margin", "10px")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");

    op.append(gCard);
    bDiv.append(seaBtn);
    bDiv.append(addBtn);
    bDiv.append(clrBtn);
    op.append(bDiv);
    cp.append(op);

    return uniq;

}

function _addSearch(cObj) {
    // Puts a record into saved search

    var sUrl='http://cinergi.sdsc.edu/geoportal/?q=';

    var ss = JSON.parse(localStorage.getItem("saveSearch") );
    var sa =  ss.query.bool.must;
    var sQry ='';
    for ( var i in sa) {
        sQry = sa[i].query_string.query;
    }

    if ( sQry.length < 2 ) {
        alert('Empty Query ');
        return;
    }
    sUrl=sUrl+sQry;
    //var seaID = cObj.id.substr(6);
    var newSearchText = sQry;

    var nid = createUUID();
    var si = searchItem(nid, newSearchText, sUrl, ss);
    saveSearchItem(si);

    var newSearch = $('<option value="' + si.id + '" >' + newSearchText + '</option>');
    var sb = $('#gSvSearch');
    sb.append(newSearch);
    console.log(' Add search' + newSearchText);

}

function _removeSearch(cObj) {
    // Remove Saved Search

    var seaID = cObj.id;
    localStorage.removeItem(seaID);
    console.log('cleared  ' + seaID);

    // Remove from list ...
    var ColStr =$('#gSvSearch').find(":selected").remove();

}

function makeCollectionPanel(){

    var col = getCollections();

    var uniq = $('<div id="'+ collectionPanelId + '" widgetid="'+ collectionPanelId + '" >');
    var cp =   $('<div class="g-drop-pane dijitTitlePane" id="dijit_TitlePane_0" widgetid="dijit_TitlePane_0">');
    var tb =  $('<div data-dojo-attach-event="ondijitclick:_onTitleClick, onkeydown:_onTitleKey" class="dijitTitlePaneTitle dijitTitlePaneTitleOpen dijitOpen" data-dojo-attach-point="titleBarNode" id="dijit_TitlePane_0_titleBarNode">').html('Saved Collections');
    var tb2 = $('<div class="dijitTitlePaneTitleFocus" data-dojo-attach-point="focusNode" role="button" aria-controls="dijit_TitlePane_0_pane" tabindex="0" aria-pressed="true">');
    var sp1 = $('<span data-dojo-attach-point="arrowNode" class="dijitInline dijitArrowNode" role="presentation"></span>');
    var sp2 = $('<span data-dojo-attach-point="arrowNodeInner" class="dijitArrowNodeInner"></span>');
    var sp3 = $('<span data-dojo-attach-point="titleNode" class="dijitTitlePaneTextNode" style="user-select: none;"></span>');
    var sp4 = $('<span class="g-drop-pane-tools"></span>');
    var op = $('<div class="dijitTitlePaneContentOuter" data-dojo-attach-point="hideNode" role="presentation">');

    tb.append(sp2);
    tb2.append(sp1);
    tb2.append(sp2);
    tb2.append(sp3);
    tb2.append(sp4);
    cp.append(tb);
    uniq.append(cp);

    var gCard = $('<select id ="gSvCollection" class="form-control" style="background-color: white;" />');

    var colOpt1 = $('<option value="default" >Select a Collection ... show default</option>');
    gCard.append(colOpt1);

    for (var k in col) {
        var colk = col[k].val
        var colOpt = $('<option value="' + colk.id + '" >' + colk.colName +'</option>');
        gCard.append(colOpt);
    }

    var vBtn = $('<button id="vBtn" class="btn" onclick="_selCollection(this)">View</button>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("color", "#ffffff")
        .css("margin", "10px")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");

    var gColInput = $('<input type="text"  class="form-control" id="gSvInpCol" placeholder="Enter a New Collection Name" size="30" />');
    var addBtn = $('<button id="addBtn" class="btn" onclick="_addCollection(this)">Add</button>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("color", "#ffffff")
        .css("margin", "10px")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");
    var clrBtn = $('<button id="rmBtn" class="btn" onclick="_removeCollection(this)">Remove</button>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("color", "#ffffff")
        .css("margin", "10px")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");

    cp.append(gCard);
    cp.append(vBtn);
    //cp.append(gColLabel);
    cp.append(gColInput);
    cp.append(addBtn);
    cp.append(clrBtn);
    return uniq;

}

function _selCollection(colVal) {

    var xc = colVal;

    if ( colVal.id =="vBtn" ) {
        curPage = 0;
        $("#PageCnt").html("Page 0");
    }


    var pageRec=10*curPage;
    sType = "local";

    var ColID = $('#gSvCollection').find(":selected").val();
    console.log('Show records in the collection ..' + ColID);

    $('.g-item-card').each(function(d){
        $(this).remove();
    });

    var uniq = $('#'+collectionPanelId);
    var cp =  $('<div class="g-drop-pane dijitTitlePane" id="dijit_TitlePane_0" widgetid="dijit_TitlePane_0">');
    var mda = getMdRecords("collections",ColID);

    if (mda.length > pageRec ) {
        startAt = pageRec;
    } else {
        startAt = mda.length - 10;
    }

    var opc = 0;

    if ( mda.length ){
        $("#PageTotals").html("Total Records " + mda.length);

    }


    for (var k in mda) {
        if ( k >= startAt ) {
            if ( opc < 10 ) {
                var mdRec = mda[k];
                var gCard = recordPanelItem(mdRec.val);
                cp.append(gCard);
            }
            opc++;
        }

    }
    uniq.append(cp);
    uniq.show();

}

function _addCollection(C){

    var newCollection = $("#gSvInpCol").val();
    var ncID = createUUID();

    if (newCollection.length ) {
        var nco = collectionItem(ncID, newCollection,"")
        localStorage.setItem("cItem-"+ncID, JSON.stringify(nco));

        var newColOpt = $('<option value="' + ncID + '" >' + newCollection +'</option>');
        $("#gSvCollection").append(newColOpt);

    }

}

function _removeCollection(C){

    var ColID = $('#gSvCollection').find(":selected").val();

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

    $('#gSvCollection').find(":selected").remove();
    $('#gSvCollection').val('default');
    makeRecordPanel();


}

function rightPanel(container) {

    var rPanel = $('<div class="g-search-pane-right" style="margin:2px;" >');
    var rp =  $('<div class="g-drop-pane dijitTitlePane dijitTitlePaneFocused dijitFocused" id="dijit_TitlePane_0" widgetid="dijit_TitlePane_0">');


    rPanel.append(rp);
    var mr = makeRecordPanel();
    rPanel.append(mr);
    container.append(rPanel);

}
function refeshMdPanel(container) {

   // var mdPanel = $('#'+mdRecordsId);

    var mr = makeRecordPanel();
    $('#'+mdRecordsId).replaceWith(mr);


}

function makeRecordPanel(rp, qf, q) {
//UI for the mdRecords Panel

    var uniq = $('<div id="'+mdRecordsId+'" widgetid="'+mdRecordsId+'" >');
    var cp =   $('<div class="g-drop-pane dijitTitlePane" id="dijit_TitlePane_0" widgetid="dijit_TitlePane_0">');
    var tb =  $('<div data-dojo-attach-event="ondijitclick:_onTitleClick, onkeydown:_onTitleKey" class="dijitTitlePaneTitle dijitTitlePaneTitleOpen dijitOpen" data-dojo-attach-point="titleBarNode" id="dijit_TitlePane_0_titleBarNode">')
        .html('Saved Results');

    var pag0 =  $('<span id="PageTotals" style="margin-left:800px;margin-right:10px;">Total Records</span>');
    var pag1 =  $('<button class="arrow-button" style="margin-left: 10px;" onclick="page_records(this);"  id="pagePrev"> < </button>');
    var pag2 =  $('<span id="PageCnt" style="margin-left: 10px;" >Page 0</span>');
    var pag3 =  $('<button class="arrow-button" style="margin-left: 10px;" onclick="page_records(this);" id="pageNext"> > </button>');
    var op = $('<div class="dijitTitlePaneContentOuter" data-dojo-attach-point="hideNode" role="presentation">');


    tb.append(pag0);
    tb.append(pag1);
    tb.append(pag2);
    tb.append(pag3);

    cp.append(tb);
    uniq.append(cp);

    var opc = 0;
    var mda = getMdRecords(qf, q);


    for (var k in mda) {
        if ( opc < 10 ) {
            var mdRec = mda[k];
            var gCard = recordPanelItem(mdRec.val);
            cp.append(gCard);
        }
        opc++;
    }

    if ( mda.length ){

        $("#PageTotals").html("Total Records " + mda.length);
    }
    return uniq;


}

function recordPanelItem(md) {

    var gCard = $('<div id ="gCard-' + md.id + '" class="g-item-card" style="background-color: white;" />')
        .attr('title', md.description);

    var addBtn = $('<button id="addRec-' + md.id + '" class="btn" onclick="_addToCollection(this)">Add to Collection</button>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("margin", "10px")
        .css("color", "#ffffff")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");

    var clrBtn = $('<button id="remRec-' + md.id + '" class="btn" onclick="_removeRecord(this)">Remove</button>')
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

function _addToCollection(cObj) {

    console.log(' Add to collection');
    var recID = cObj.id.substr(7);
    $('#gCard-'+recID).css("background-color", "#aaa");
    var ColID = $('#gSvCollection').find(":selected").val();

    var ctu = getMdRecords("id", recID);

    if ( ctu.length ) {
        for ( var z in ctu ) {
            var mdc = ctu[z].val;
            var colA = mdc.collections;
            colA.push(ColID);
            localStorage.setItem("mdRec-"+recID, JSON.stringify(mdc));
        }
    } else {
        //from saved search
        for ( var z in mdArray ) {
            var mdc = mdArray[z];
            if ( mdc.id == recID) {
                var colA = mdc.collections;
                colA.push(ColID);
                localStorage.setItem("mdRec-"+recID, JSON.stringify(mdc));
            }
        }
    }

}


function _removeRecord(cObj) {
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
    if ( sType == "local" ) {
        gCard.hide();
        gCard.remove();
    } else {
        $('#gCard-'+recID).css("background-color", "#fff");
    }

}


function page_records(dir){

    var ld = dir.id;

    if ( ld == "pageNext" ) {
        curPage++;
    } else {
        if ( curPage > 0 ) {
            curPage--;
        }
    }

    $("#PageCnt").html("Page " + curPage);


    if (sType == "csw") {
        show_cinergi(curPage);

    } else {
        mic = { "id" : "page" };
        _selCollection(mic);

    }

}


function show_cinergi(sp, savedSearch ) {

    var baseRef="http://132.249.238.169:8080/geoportal/csw?service=CSW&request=GetRecords&f=json&size=10";
    // Show DDH records on search page
    sType = "csw";
    var aggUrl;
    var startP = curPage*10;
    if ( typeof sp !== "undefined"  ) {
        startP = sp*10;
        curPage = sp;
        $("#PageCnt").html("Page " + curPage);
    }


    if ( savedSearch ) {
        aggUrl = savedSearch;
    } else {
        var inp = $("#gSvSearch option:selected").text();
        //var inp = 'coral reef';
        var inJ = inp.split(" ").join('+');
        var inParams = '&from='+startP+'&q='+inJ;
        var xSrchUrl = encodeURI(baseRef+inParams);
        sSrchUrl = xSrchUrl.replace(/=/g,'-#-');
        aggUrl = baseRef+inParams;
    }



    $('.g-item-card').each(function(d){
        $(this).remove();
    });

    mdArray = [];

    var uniq = $('#'+collectionPanelId);
    var cp =  $('<div class="g-drop-pane dijitTitlePane" id="dijit_TitlePane_0" widgetid="dijit_TitlePane_0">');

    $.ajax({
        type: "GET",
        url: aggUrl,
        dataType: 'json',
        data: { "datatype" : "query"},
        contentType: 'application/json',
        success: function(data) {
            console.log(data);
            var ha = [];

            if ( data.hits ) {
                ha = data.hits.hits;
                var hal = data.hits.total;

            } else {
                ha = data.results;
                var hal = data.total;
            }


            $("#PageTotals").html("Total Records " + hal);
            for (i = 0; i < ha.length; i++) {
                if (  ha[i]._id ) {
                    var hid = ha[i]._id;
                } else {
                    var hid = ha[i].id;
                }
                var src_title = ha[i]._source.title;
                var src_desc = ha[i]._source.description;
                var src_fileid = ha[i]._source.fileid;

                var idlink = 'http://datadiscoverystudio.org/geoportal/rest/metadata/item/'+hid+'/html';
                var col = [];
                var mdRec = mdRecord(hid, src_fileid, src_title,idlink, src_desc, col );

                mdArray.push(mdRec);

                var gCard = recordPanelItem(mdRec);
                cp.append(gCard);
            }


            uniq.append(cp);
            uniq.show();

        },
        error: function (xhr, status, error) {
            console.log(xhr);

        }


    });
};

/* lib region */


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
    refeshMdPanel(container);
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


/*  Saved Collections, Searches and Results -
    localCollectionSaveUI.js
    Merged with Export Import
    fixed backbone - g-drop-pane-tools in makeRecordPanel
    2/5/2019
    New fixes for 2/11/19 :
    openSearch
    Export single collection only
    export file timestanp
    clear button
    search results title bar
    better reload management
    all results selction
    Create New collection button

    Bug fixes - 2/11/19 - 6PM
    bug fixes - page count, export file format... - 7pm

*/

var container= $('#collectionPanel');
var mdRecordsId = "uniqName_9_24";
var collectionPanelId = "uniqName_9_22";
var recordsDropPaneId = "dijit_TitlePane_10";
var colDropPaneId = "dijit_TitlePane_20";

$('.g-item-card').each(function(d) {
    $(this).remove();
});


leftPanel(container);
rightPanel(container);

var mdArray = [];
var curPage = 0;
var sType = "local";
var search = "";
var totRecords = 0;

function leftPanel(container) {

    var lpTest = container.find('.g-search-pane-left');
    if ( lpTest ) {
        lpTest.empty();
        lpTest.remove();
    }

    var lPanel = $('<div class="g-search-pane-left" style="padding: 4px 10px; margin: 10px;">');
    var lp =  $('<div class="g-drop-pane dijitTitlePane dijitTitlePaneFocused dijitFocused" id="dijit_TitlePane_0" widgetid="dijit_TitlePane_0">');

    lPanel.append(lp);
    var seaSet =  makeSearchPanel();
    lPanel.append(seaSet);

    var colset = makeCollectionPanel();
    lPanel.append(colset);

    expInp(lPanel);

    lPanel.show();
    container.append(lPanel);

}

function makeSearchPanel() {

    var uniq = $('<div id="uniqName_9_20" widgetid="uniqName_9_20" >');
    var cp =   $('<div class="g-drop-pane dijitTitlePane" id="dijit_TitlePane_0" widgetid="dijit_TitlePane_0">');
    var tb =  $('<div data-dojo-attach-event="ondijitclick:_onTitleClick, onkeydown:_onTitleKey" class="dijitTitlePaneTitle dijitTitlePaneTitleOpen dijitOpen" data-dojo-attach-point="titleBarNode" id="dijit_TitlePane_0_titleBarNode9">').html('Saved Searches');
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

    var seaBtn = $('<button id="addBtn" class="btn" onclick="show_cinergi(0)">Show Search Results</button>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("margin", "10px")
        .css("color", "#ffffff")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");
    var addBtn = $('<button id="addBtn" class="btn" onclick="_addSearch(this)">Save Current Search</button>')
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
    bDiv.append(addBtn);
    bDiv.append(seaBtn);
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
    var cp =   $('<div class="g-drop-pane dijitTitlePane" id="'+colDropPaneId+'" widgetid="'+colDropPaneId+'">');
    var tb =  $('<div data-dojo-attach-event="ondijitclick:_onTitleClick, onkeydown:_onTitleKey" class="dijitTitlePaneTitle dijitTitlePaneTitleOpen dijitOpen" data-dojo-attach-point="titleBarNode" id="dijit_TitlePane_9_titleBarNode">').html('Saved Collections');
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
    var colOpt1 = $('<option value="default" >Unnassigned Results </option>');
    var colOpt2 = $('<option value="All" >Show All</option>');
    gCard.append(colOpt1);
    gCard.append(colOpt2);

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
    var addBtn = $('<button id="addBtn" class="btn" onclick="_addCollection(this)">Create New Collection</button>')
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
    var coltxt =  $('#gSvCollection').find(":selected").text(); //dijit_TitlePane_0_titleBarNode
    if ( ColID !== "default") {

        var sb = container.find('#dijit_TitlePane_0_titleBarNode');
        var tlab = sb[0].childNodes[0];
        tlab.nodeValue =" Saved Results for Collection   "+coltxt;

        sb.hide();
        sb.show();

        console.log('Show records in the collection ..' + coltxt);

    }

    container.find('.g-item-card').each(function(d){
        $(this).remove();
    });

    var uniq = $('#'+mdRecordsId);
    var cp =  $('<div class="g-drop-pane dijitTitlePane" id="'+colDropPaneId+'" widgetid="'+colDropPaneId+'">');


    if ( ColID == "default" ) {
        var mda = getMdRecords("collections","default");

    } else if ( ColID == "All" ){
        var mda = getMdRecords("collections","");
    } else {
        var mda = getMdRecords("collections",ColID);
    }

    totRecords = mda.length;

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

    if ( ColID !== "default" && colID !== "All" ) {

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
        gCard.append(colOpt1);
    }


}

function rightPanel(container) {

    var rpTest = container.find('.g-search-pane-right');
    if ( rpTest ) {
        rpTest.empty();
        rpTest.remove();
    }


    var rPanel = $('<div class="g-search-pane-right" style="margin:2px;" >');
    var rp =  $('<div class="g-drop-pane dijitTitlePane dijitTitlePaneFocused dijitFocused" id="dijit_TitlePane_0" widgetid="dijit_TitlePane_0">');

    rPanel.append(rp);
    var mr = makeRecordPanel();
    rPanel.append(mr);
    container.append(rPanel);

}
function refeshMdPanel(container) {

    var mr = makeRecordPanel();
    $('#'+mdRecordsId).replaceWith(mr);

}

function makeRecordPanel(rp, qf, q) {
// UI for the mdRecords Panel
// fixed backbone problem -- gpdt 2/5

    var uniq = $('<div id="'+mdRecordsId+'" widgetid="'+mdRecordsId+'" >');
    var cp =   $('<div class="g-drop-pane dijitTitlePane" id="'+recordsDropPaneId+'" widgetid="'+recordsDropPaneId+'">');
    var tb =  $('<div data-dojo-attach-event="ondijitclick:_onTitleClick, onkeydown:_onTitleKey" class="dijitTitlePaneTitle dijitTitlePaneTitleOpen dijitOpen" data-dojo-attach-point="titleBarNode" id='+recordsDropPaneId+'_titleBarNode">')
        .html('Saved Results');
    var gdpt = $('<span class="g-drop-pane-tools">');
    var pag0 =  $('<span id="PageTotals" >Total Records</span>');
    var pag1 =  $('<button class="arrow-button" style="margin-left: 10px;" onclick="page_records(this);"  id="pagePrev"> < </button>');
    var pag2 =  $('<span id="PageCnt" style="margin-left: 10px;" >Page 0</span>');
    var pag3 =  $('<button class="arrow-button" style="margin-left: 10px;" onclick="page_records(this);" id="pageNext"> > </button>');
    var op = $('<div class="dijitTitlePaneContentOuter" data-dojo-attach-point="hideNode" role="presentation">');

    tb.append(gdpt);

    gdpt.append(pag0);
    gdpt.append(pag1);
    gdpt.append(pag2);
    gdpt.append(pag3);

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
        totRecords = mda.length;
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

    var maxPage = totRecords/10;

    if ( ld == "pageNext" ) {
        if ( curPage < maxPage ) {
            curPage++;
        }

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
    // Show DDH records on search page
    sType = "csw";
    var aggUrl;
    var startP = curPage*10;
    if ( typeof sp !== "undefined"  ) {
        startP = sp*10;
        curPage = sp;
        $("#PageCnt").html("Page " + curPage);
    }

    var bref = 'http://132.249.238.169:8080/geoportal/opensearch?f=json&from='+startP+'&size=10&sort=sys_modified_dt:desc&esdsl={"query":{"bool":{"must":[{"query_string":{"analyze_wildcard":true,"query":"';
    var eref = '","fields":["_source.title^5","_source.*_cat^10","_all"],"default_operator":"and"}}]}}}';

    if ( savedSearch ) {
        aggUrl = savedSearch;
    } else {
        var inp = $("#gSvSearch option:selected").text();

        var inJ = inp.split(" ").join('+');
        var inParams = '&from='+startP+'&q='+inJ;

        aggUrl = bref+inJ+eref;
    }

    container.find('.g-item-card').each(function(d){
        $(this).remove();
    });

    mdArray = [];

    var uniq = $('#'+mdRecordsId);
    var cp =  $('<div class="g-drop-pane dijitTitlePane" id="'+recordsDropPaneId+'" widgetid="'+recordsDropPaneId+'">');

    $.ajax({
        type: "GET",
        url: aggUrl,
        dataType: 'json',
        data: { "datatype" : "query"},
        contentType: 'application/json',
        success: function(data) {
            //console.log(data);
            var ha = [];

            if ( data.hits ) {
                ha = data.hits.hits;
                var hal = data.hits.total;

            } else {
                ha = data.results;
                var hal = data.total;
            }

            totRecords = hal;

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

            var sb = $('#'+recordsDropPaneId+'_titleBarNode');
            var tlab = sb[0].childNodes[0];
            tlab.nodeValue = "Results - DDS Records for Saved Search  "+inp;

            sb.hide();

            sb.show();

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
                    var mCol = mkr.collections;
                    // only bring back if only in default
                    if ( mCol.length == 1 & mCol[0] == "default") {
                        results.push({key:mkey,val:mkr});
                    }

                } else if ( query == "all") {
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

//Export Import ---------------------------------------------------------------------

function expInp(container) {

    var Dexp = $('<div >')
        .css("margin", "4px" )
        .css("height", "44px" )
        .css("width", "80px");

    var Dcb = $('<div >')
        .css("margin", "4px" )
        .css("height", "44px" )
        .css("width", "120px");

    var clrBtn = $('<a id="clear-local-btn" onclick="clearLocalRecords(this);" class="btn" >Clear Saved Results</a>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("margin", "10px")
        .css("color", "#ffffff")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");

    var ex2Btn = $('<a  href="data:application/octet-stream,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A" id="export-href" onclick="expAll2(this);" class="btn" download="exportCollection.csv">Export Collection</a>')
        .css("height", "20px" )
        .css("padding","4px 16px")
        .css("margin", "10px")
        .css("color", "#ffffff")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");

    var Dib = $('<div class="file-upload">')
        .css("margin", "10px" )
        .css("height", "44px" )
        .css("width", "80px");

    var dFUB =  $('<div class="file-upload-button">')
        .css("display", "inline-block" );

    var ifu = $('<input type="file" name="File Upload" id="import-all-file" accept=".csv"  />')
        .css("display", "none")
        .css("width", "190px")
        .css("padding","4px 6px")
        .css("margin", "4px")
        .css("color", "#ffffff")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");

    var ifl = $('<label id="fileLabel" onclick="importAll(this)" for="import-all">Import Collection</label>')
        .css("display", "inline-block" )
        .css("height", "20px" )
        .css("width", "90px")
        .css("padding","4px 6px")
        .css("margin", "4px")
        .css("color", "#ffffff")
        .css("font-size", "11px")
        .css("background-color", "#1E84A8");

    var fun = $('<div class="file-upload-name" id="filename">No file chosen</div>')
        .css("width", "200px")
        .css("display", "inline-block" );

    var mrge = $('<span class="g-spatial-filter-relation"><input id="uniqName_9_99" type="radio" name="uniqName_9_2_radio" data-op="merge" value="merge" checked><label style="width:60px" for="uniqName_9_99">Merge</label></span>');
    var ovi = $('<span class="g-spatial-filter-relation"><input id="uniqName_9_90" type="radio" name="uniqName_9_2_radio" data-op="overwrite" value="over"><label style="width:60px" for="uniqName_9_90">Overwrite</label></span>');


    dFUB.append(ifu);
    dFUB.append(ifl);
    //Dexp.append(clrBtn);
    Dexp.append(ex2Btn);
    Dib.append(dFUB);

    //container.append(ex2Btn);
    container.append(Dexp);

    container.append(Dib);
    container.append(mrge);
    container.append(ovi);
    Dcb.append(clrBtn)
    container.append(Dcb);
}


function expAll2(e) {

    var fn = "exportCollection" + $.now() + ".csv";

    var x = $(e).attr("download", fn);

    var ez = getExpAll();

    var exFile = "data:application/octet-stream," + encodeURIComponent(ez);
    $(e).attr("href", exFile);

}

function getExpAll() {
    //exports selected collection
    var ColID = $('#gSvCollection').find(":selected").val();

    var coLabel = "Collection,";
    var colText = "COLLECTION, NAME, ID, DESCRIPTION\n";

    if ( ColID == "default" ) {
        colText = colText + coLabel + 'default,default,Records not in a Collection\n';

    } else if ( ColID == "all" ) {
        alert("Select a collection ");
        return;

    } else {
        var sc = findLocalItems("cItem-"+ColID)

        //var sc = findLocalItems("cItem-"+ColID);

        if ( Array.isArray(sc) ) {
            for ( var c in sc ) {
                var cId = sc[c].key;
                var cName = sc[c].val.colName;
                var cDesc = sc[c].val.colDesc;
                var cIndex = cId.substr(6);
                colText = colText + coLabel + cName +  ',' + cIndex + ',' + cDesc + '\n';
            }
        }
    }


    var mdLabel= "Saved Record,";
    var mdText = "SAVED RECORD, TITLE, URL, ID, FILEID, COLLECTION_IDS, CITATION\n";
    if ( ColID == "default" ) {
        var md =  findLocalItems("mdRec");
    } else {
        var md = getMdRecords('collections', ColID);
    }


    if ( Array.isArray(md) ) {
        for ( var c in md ) {

            var mName = md[c].val.title;
            mName = mName.replace(/,/g, '|');
            var mLink = md[c].val.mdlink;
            var mId =  md[c].val.id;
            var fId =  md[c].val.fileId;
            var mDesc ="";
            if ( md[c].val.hasOwnProperty("description") ) {
                var mDesc = md[c].val.description;
                ( typeof mDesc !== "undefined" ) ? mDesc = mDesc.replace(/,/g, '|'): mDesc ="";
            }

            var xol = md[c].val.collections;
            var col = xol.join('|');

            if ( ColID == "default" ) {
                if ( xol.length == 1 && xol[0]=="default") {
                    mdText = mdText + mdLabel + mName +  ',' + mLink + ',' + mId + ',' + fId  +  ',' + col +  ',Citation_Description\n';
                }

            } else {
                mdText = mdText + mdLabel + mName +  ',' + mLink + ',' + mId + ',' + fId  +  ',' + col +  ',Citation_Description\n';
            }





        }
    }

    var xft =  colText + mdText;
    return xft;

}

$("#import-all-file").change(function(e){
    changeDataFromUpload(e, function(data){
        console.log(data);
    });
});

function importAll(o) {
    $("#import-all-file").trigger("click");

}

function changeDataFromUpload(evt, cb){
    if (!browserSupportFileUpload()) {
        console.error("The File APIs are not fully supported in this browser!");
    } else {
        var data = null;
        var file = evt.target.files[0];
        var fileName = file.name;
        $("#filename").html(fileName);

        if (file !== "") {
            var reader = new FileReader();

            reader.onload = function(event) {
                var csvData = event.target.result;
                parseImport(csvData);

            };
            reader.onerror = function() {
                console.error("Unable to read " + file.fileName);
            };
        }

        reader.readAsText(file);

    }
}

// Method that checks that the browser supports the HTML5 File API
function browserSupportFileUpload() {
    var isCompatible = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        isCompatible = true;
    }
    return isCompatible;
}

// Parse the CSV input into JSON
function csvToJson(data) {
    var cols = data[0];
    var out = [];
    for (var i = 1; i < data.length; i++){
        var obj = {};
        var row = data[i];
        cols.forEach(function(col, index){
            obj[col] = row[index];
        });
        out.push(obj);
    }
    return out;
}

function getSavedSearches(qField, query) {
    var sea = findLocalItems("sItem");
    if ( typeof(qField) !== "undefined" && typeof(query) ) {
        results = [];

        for (var k in sea){
            var kd = sea[k].val;
            var kid = kd[qField];
            var cleanKid = kid.replace(/[|&;$%@"<>()+,]/g, "");
            if ( cleanKid.match(query) ) {
                results.push({key:k,val: kd });
            }
        }
        sea = results;
    }
    return sea;

}

function getCollections(qField, query) {
    var col = findLocalItems("cItem");
    // If there is a query
    if ( typeof(qField) !== "undefined" && typeof(query) !== "undefined"  ) {
        results = [];
        for (var k in col){
            var kd = col[k].val;
            var kid = kd[qField];
            var cleanKid = kid.replace(/[|&;$%@"<>()+,]/g, "");
            var cleanQry = query.replace(/[|&;$%@"<>()+,]/g, "");
            if ( cleanKid.match(cleanQry) ) {
                results.push({key:k,val: kd });
            }
        }
        col = results;

    }

    return col;
}

function clearLocalRecords() {

    if ( confirm ("Are you sure you want to overwrite your current collection records ? ") ) {
        // clear out records here;
        var ca =[];
        for (var i = 0; i < localStorage.length; i++){
            if (localStorage.key(i) !== 'saveSearch') {
                ca.push(localStorage.key(i));
            }
        }
        for (var z = 0; z < ca.length; z++ ) {
            localStorage.removeItem(ca[z]);
        }

        leftPanel(container);
        rightPanel(container);

    } else {
        return;
    }

}

function parseImport(csvData) {

    var ovi = $('input[name=uniqName_9_2_radio]:checked').val();

    if ( ovi == 'over') {
        if ( confirm ("Are you sure you want to overwrite your current collection records ? ") ) {
            ovi = 'over';
            // clear out records here;
            /*
            var ca =[];
            for (var i = 0; i < localStorage.length; i++){
                if (localStorage.key(i) !== 'saveSearch') {
                    ca.push(localStorage.key(i));
                }
            }
            for (var z = 0; z < ca.length; z++ ) {
                localStorage.removeItem(ca[z]);
            }
            */
        } else {
            ovi = 'not-over';
        }
    }
    var defaultLoad = false;
    var oneCID="default";

    var rArr = csvData.split('\n');
    if ( rArr.length )  {
        for (var k = 0; k < rArr.length; k++) {
            var row = rArr[k];
            if ( typeof row !== "undefined" ) {
                var rowA = row.split(',');
                if ( rowA[0] == "Collection"  ) {

                    var cname = rowA[1];
                    var cid = rowA[2];
                    oneCID = cid;
                    if ( cname == "Default" ) {
                        defaultLoad = true;
                    }
                    var cx = _getCollections("id", cid);
                    if ( cx.length && ovi == 'over' ) {
                        // already there
                        var cItem = collectionItem(rowA[2], rowA[1]);
                        saveCollectionItem(cItem);
                        var nop ="";

                    } else {
                        var cItem = collectionItem(rowA[2], rowA[1]);
                        saveCollectionItem(cItem);

                    }

                }
                /*
                if ( rowA[0] == "Saved Search"  ) {

                    var sid = rowA[2];
                    var sx = _getSavedSearches("id", sid);
                    if ( sx.length && ovi == 'over' ) {
                        // already here
                         var sItem = searchItem(rowA[2], rowA[1], rowA[3], params);
                        saveSearchItem(sItem);
                        var nop ="";
                    } else {
                        var params = {};
                        var sItem = searchItem(rowA[2], rowA[1], rowA[3], params);
                        saveSearchItem(sItem);

                    }

                }
                */
                if ( rowA[0] == "Saved Record"  ) {

                    var rid = rowA[3];
                    var rx = getMdRecords("id", rid);

                    if ( rx.length ) {
                        if (defaultLoad) {
                            var nop = true;
                        } else {
                            // collections may have changed reload
                            var storeCol = rx.collections;
                            //storeCol.split()
                            storeCol.push(oneCID);
                            var rtitle = rowA[1];
                            var rUrl = rowA[2];
                            var fid = rowA[4];
                            var des = row[6];

                            localStorage.removeItem("mdRec-"+rid);

                            var rItem = mdRecord( rid, fid, rtitle, rUrl, des, collections );
                            saveMdRecord(rItem);


                        }

                    } else {

                        var rtitle = rowA[1];
                        var rUrl = rowA[2];
                        var fid = rowA[4];
                        var collections = rowA[5];
                        ( collections.length == 0 ) ? collections = "default" : collections = collections.split('|');
                        var des = row[6];
                        var rItem = mdRecord( rid, fid, rtitle, rUrl, des, collections );
                        saveMdRecord(rItem);

                    }



                }

            }
        }
    }

    console.log('import completed ');

}

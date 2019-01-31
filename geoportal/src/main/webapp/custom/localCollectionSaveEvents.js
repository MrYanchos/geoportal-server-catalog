var open = window.XMLHttpRequest.prototype.open,
    send = window.XMLHttpRequest.prototype.send,
    onReadyStateChange;

// * entry point - attach to button class

$(".btn").on('click', function (b) {
    var bl = b;
    if (b.title == 'Search' || b.target.title == 'Search') {

        setTimeout(function () {

            $(".g-item-card").each(function () {
                var gC = $(this);
                setSavedCard(gC);
                assignEvent(gC);

            })

        }, 2000);
    }

});


var mdRecord = function (id, fileId, title, link, description, collections) {
    var mdRec = {
        "id": id,
        "fileId": fileId,
        "title": title,
        "mdlink": link,
        "description": description,
        "collections": collections
    };
    return mdRec;
}


var searchItem = function (id, searchText, sUrl, params) {
    var mdSS = {
        "id": id,
        "searchText": searchText,
        "searchUrl": sUrl,
        "params": params
    };
    return mdSS;

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


function saveMdRecord(md) {

    var key = "mdRec-" + md.id;
    localStorage.setItem(key, JSON.stringify(md));
    return key;
}

function setSavedCard(gC) {
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


function assignEvent(gC) {
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
            var newMdRecord = mdRecord(xid, fileId, tlval, mLink, DescVal, col);
            saveMdRecord(newMdRecord);

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
                    saveMdRecord(newMdRecord);
                }
            }

        }
        console.log('click card');
  //  });


}


function openReplacement(method, url, async, user, password) {
    var syncMode = async !== false ? 'async' : 'sync';
    return open.apply(this, arguments);
}

function sendReplacement(data) {

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


function onReadyStateChangeReplacement() {

    if (this._onreadystatechange) {
        return this._onreadystatechange.apply(this, arguments);
    }
}

window.XMLHttpRequest.prototype.open = openReplacement;
window.XMLHttpRequest.prototype.send = sendReplacement;
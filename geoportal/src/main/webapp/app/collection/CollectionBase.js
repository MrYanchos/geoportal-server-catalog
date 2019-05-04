define(["dojo/_base/lang",
        "dojo/_base/array"],
    function (lang,array) {

        var oThisObject = {

            mdRecord: function (id, fileId, title, link, description, collections) {
                var self = this;
                var mdRec = {
                    "id": id,
                    "fileId": fileId,
                    "title": title,
                    "mdlink": link,
                    "description": description,
                    "collections": collections,

                };
                return mdRec;
            }
            ,
            "_addCollectionMdRecord":function(mdRecord, coll){
                if (coll==="All" | coll==="default" ) return;
                if (mdRecord) {
                    if (array.indexOf(mdRecord.collections, coll) < 0) {
                        mdRecord.collections.push(coll);
                        mdRecord.collections = array.filter(mdRecord.collections, function(collection){
                            return collection !== "default";
                        }
                        )
                    };
                    this.saveMdRecord(mdRecord);
                }

            },
            "_removeCollectionMdRecord":function(mdRecord, coll){
                if (coll==="All" | coll==="default" ) return;
                if (mdRecord) {
                    if (array.indexOf(mdRecord.collections, coll) >= 0) {
                        mdRecord.collections.pop(coll);
                        mdRecord.collections = array.filter(mdRecord.collections, function(collection){
                                return collection === "default";
                            }
                        )
                        if (mdRecord.collections.length ===0){
                            mdRecord.collections.push("default");
                        }
                    };
                    this.saveMdRecord(mdRecord);
                }

            },
            "_inCollectionMdRecord":function(mdRecord, coll){
                if (coll==="All" | coll==="default") return null;
                if (mdRecord) {
                    if ( array.indexOf(mdRecord.collections, coll) >= 0) return true;
                }
                return false;

            },
            searchItem: function (id, searchText, sUrl, params, query) {
                var mdSS = {
                    "id": id,
                    "searchText": searchText,
                    "searchUrl": sUrl,
                    "params": params,
                    "query": query,

                };
                return mdSS;

            }
            ,
            collectionItem: function (id, colName, colDesc) {
                var cI = {
                    "id": id,
                    "colName": colName,
                    "colDesc": colDesc
                };
                return cI;

            },
            createUUID: function () {
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
            ,
            findLocalItems: function (query) {
                var i, results = [];
                for (i in localStorage) {
                    if (localStorage.hasOwnProperty(i)) {
                        if (i.match(query) || (!query && typeof i === 'string')) {
                            value = JSON.parse(localStorage.getItem(i));
                            results.push({key: i, val: value});
                        }
                    }
                }
                return results;
            },

            saveMdRecord: function (md) {
                if (md.id){
                var key = "mdRec-" + md.id;
                localStorage.setItem(key, JSON.stringify(md));
              //  refeshMdPanel(container);
                return key;
                    }
                return null;
            },
            removeMdRecord: function (md) {
                if (md.id){
                var key = "mdRec-" + md.id;
                localStorage.removeItem(key);
                //  refeshMdPanel(container);
                }
            },
            saveCollectionItem: function (ColItem) {

                var key = "cItem-" + ColItem.id;
                localStorage.setItem(key, JSON.stringify(ColItem));
                return key;
            },
            getCollections: function (qField, query) {
                var col = this.findLocalItems("cItem");
                // If there is a query
                if (typeof (qField) !== "undefined" && typeof (query) !== "undefined") {
                    results = [];
                    for (var k in col) {
                        var kd = col[k].val;
                        var kid = kd[qField];
                        var cleanKid = kid.replace(/[|&;$%@"<>()+,]/g, "");
                        var cleanQry = query.replace(/[|&;$%@"<>()+,]/g, "");
                        if (cleanKid.match(cleanQry)) {
                            results.push({key: k, val: kd});
                        }
                    }
                    col = results;

                }

                return col;
            },
            saveSearchItem: function (SeaItem) {

                var key = "sItem-" + SeaItem.id;
                localStorage.setItem(key, JSON.stringify(SeaItem));
                return key;

            },
            isSavedItem: function(itemId){
                var isSaved = false;
                var collections = [];
                // case for item from ES vs MdRecord
                if (itemId){

                    var rec = this.getMdRecords("id", itemId);
                    if (rec.length > 0){
                        if (rec[0].val.id = itemId){
                            isSaved = true;
                            collections = rec[0].val.collections;
                        }
                    }
                }
                return {isSaved:isSaved, collections:collections};
            },

            getMdRecords: function (qField, query) {
                var md = this.findLocalItems("mdRec");
                // If there is a query
                if (typeof (qField) !== "undefined" && typeof (query) !== "undefined") {
                    results = [];
                    for (var k in md) {
                        var mkr = md[k].val;
                        var mkey = md[k].key;
                        // var kid = md[k][qField];

                        if (qField == "collections") {
                            if (query == "default") {
                                var mCol = mkr.collections;
                                // only bring back if only in default
                                if (mCol.length == 1 & mCol[0] == "default") {
                                    results.push({key: mkey, val: mkr});
                                }

                            } else if (query == "all") {
                                results.push({key: mkey, val: mkr});

                            } else {
                                var mCol = mkr.collections;

                                for (var c in mCol) {

                                    if (mCol[c].match(query)) {
                                        results.push({key: mkey, val: mkr});
                                    }
                                }
                            }
                        } else if (qField == "id") {
                            if (mkr.id == query) {
                                results.push({key: mkey, val: mkr});
                            }
                        } else {
                            var mkStr = JSON.stringify(mkr);
                            if (mkStr.match(query)) {
                                results.push({key: mkey, val: mkr});
                            }
                        }

                    }
                    md = results;
                }

                return md;
            },


            findLocalItems: function (query) {
                var i, results = [];
                for (i in localStorage) {
                    if (localStorage.hasOwnProperty(i)) {
                        if (i.match(query) || (!query && typeof i === 'string')) {
                            value = JSON.parse(localStorage.getItem(i));
                            results.push({key: i, val: value});
                        }
                    }
                }
                return results;
            },
            getMdRecords: function (qField, query) {
                var md = this.findLocalItems("mdRec");
                // If there is a query
                if (typeof (qField) !== "undefined" && typeof (query) !== "undefined") {
                    results = [];
                    for (var k in md) {
                        var mkr = md[k].val;
                        var mkey = md[k].key;
                        // var kid = md[k][qField];

                        if (qField == "collections") {
                            if (query == "default") {
                                var mCol = mkr.collections;
                                // only bring back if only in default
                                if (mCol.length == 1 & mCol[0] == "default") {
                                    results.push({key: mkey, val: mkr});
                                }

                            } else if (query == "all") {
                                results.push({key: mkey, val: mkr});

                            } else {
                                var mCol = mkr.collections;

                                for (var c in mCol) {

                                    if (mCol[c].match(query)) {
                                        results.push({key: mkey, val: mkr});
                                    }
                                }
                            }
                        } else if (qField == "id") {
                            if (mkr.id == query) {
                                results.push({key: mkey, val: mkr});
                            }
                        } else {
                            var mkStr = JSON.stringify(mkr);
                            if (mkStr.match(query)) {
                                results.push({key: mkey, val: mkr});
                            }
                        }

                    }
                    md = results;
                }

                return md;
            }
        }
        return oThisObject;
    });
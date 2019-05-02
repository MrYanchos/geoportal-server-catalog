define(["dojo/_base/lang"],
    function (lang) {

        var oThisObject = {

            mdRecord: function (id, fileId, title, link, description, collections) {
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
            ,

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

                var key = "mdRec-" + md.id;
                localStorage.setItem(key, JSON.stringify(md));
              //  refeshMdPanel(container);
                return key;
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
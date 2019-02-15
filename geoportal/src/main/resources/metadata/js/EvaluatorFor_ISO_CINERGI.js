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

/*
SMR 2018-08-18 update xpaths as noted in comments,
   add index key for place keywords
   add index key for cited individual and organization (author, originator, creator
   remove some commented out code in evalWorkbenchLinks;
   add SV_Operations in evalResourceLinks and distribution_links_s;
   update version to v1.2.cinergi
*/
/*
dwv 2018-08-27 extend, from EvaluatorForISO.js
   update version to v1.3.cinergi
dwv 2019-02-11 Added non-dynamic fields to the index to enable autocompletion
    keywords, place_keywords, tags, contact_people,contact_{people,organizations}
    cited_{people,organizations}*
*/
G.evaluators.cinergi = {

    version: "iso.v1.4.cinergi",

    evaluate: function (task) {
        var metadataType = G._metadataTypes["iso19115base"];
        if (metadataType && metadataType.evaluator) {
            metadataType.evaluator.evaluate(task);
            print("evaluated iso19115base")
        }

        this.evalBaseCinergi(task);
        this.evalServiceCinergi(task);
 ;
        this.evalTemporalCinergi(task);

        this.evalCinergi(task);
        this.evalCallHierarchy(task);
    },

    evalBaseCinergi: function (task) {
        var item = task.item, root = task.root;
        var iden = G.getNode(task, root, "gmd:identificationInfo/gmd:MD_DataIdentification | gmd:identificationInfo/srv:SV_ServiceIdentification");

        /* get title and alternateTitle */
        G.evalProp(task, item, iden, "title", "gmd:citation/gmd:CI_Citation/gmd:title/*/text() | gmd:citation/gmd:CI_Citation/gmd:alternateTitle/*/text()");

        /*    G.evalProp(task,item,iden,"description","gmd:abstract/gco:CharacterString");
                get abstract and other citation details */
        G.evalProp(task, item, iden, "description", "gmd:abstract/gco:CharacterString | gmd:citation/gmd:CI_Citation/gmd:otherCitationDetails[not(contains(gco:CharacterString,'elated publications'))]/gco:CharacterString");

        /* get any child text under gmd:keyword--CharacterString, Anchor etc. Same as apiso_Subject_txt*/
        this.clearProps(task,"keywords_s");
        G.evalProps(task, item, root, "keywords_s", "//gmd:MD_TopicCategoryCode | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/*/text()");
        G.evalProps(task, item, root, "keywords", "//gmd:MD_TopicCategoryCode | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/*/text()");


        G.evalProp(task, item, iden, "thumbnail_s", "gmd:graphicOverview/gmd:MD_BrowseGraphic/gmd:fileName/gco:CharacterString");


        /* include position name for individual, leave out 'missing', get only pointOf contact */
        this.clearProps(task,"contact_people_s");
        G.evalProps(task, item, root, "contact_people_s", "//gmd:CI_ResponsibleParty[gmd:role/gmd:CI_RoleCode/@codeListValue='pointOfContact']/gmd:individualName[not(contains(gco:CharacterString,'issing'))]/*/text() | //gmd:CI_ResponsibleParty[gmd:role/gmd:CI_RoleCode/@codeListValue='pointOfContact']/gmd:positionName[not(contains(gco:CharacterString,'issing'))]/*/text()");
        G.evalProps(task, item, root, "contact_people", "//gmd:CI_ResponsibleParty[gmd:role/gmd:CI_RoleCode/@codeListValue='pointOfContact']/gmd:individualName[not(contains(gco:CharacterString,'issing'))]/*/text() | //gmd:CI_ResponsibleParty[gmd:role/gmd:CI_RoleCode/@codeListValue='pointOfContact']/gmd:positionName[not(contains(gco:CharacterString,'issing'))]/*/text()");

        /* these are the points of contacts, for metadata, the resource, or distribution; no distinction made */
        this.clearProps(task,"contact_organizations_s");
        G.evalProps(task, item, root, "contact_organizations_s", "//gmd:CI_RoleCode[contains(text(),'ontact') or contains(@codeListValue, 'ontact')]/../../gmd:organisationName[not(contains(gco:CharacterString,'issing'))]/gco:CharacterString");
        G.evalProps(task, item, root, "contact_organizations", "//gmd:CI_RoleCode[contains(text(),'ontact') or contains(@codeListValue, 'ontact')]/../../gmd:organisationName[not(contains(gco:CharacterString,'issing'))]/gco:CharacterString");

        /* ResponsibleParty who have role author, creator, principal (or principle) Investigator, originator
        filter for responsible party in identification; sometimes the author is put in identificationInformation
            point of contact */
        this.clearProps(task,"cited_individual");
        G.evalProps(task, item, iden, "cited_individual", "//gmd:identificationInfo//gmd:CI_RoleCode[contains(text(),'rincip') or contains(@codeListValue, 'uthor') or contains(@codeListValue, 'riginator') or contains(@codeListValue, 'reator') or contains(@codeListValue, 'rincip')]/../../gmd:individualName[not(contains(gco:CharacterString,'issing'))]/*/text()");
        this.clearProps(task,"cited_organization");
         G.evalProps(task, item, iden, "cited_organization", "//gmd:identificationInfo//gmd:CI_RoleCode[contains(text(),'rincip') or contains(@codeListValue, 'uthor') or contains(@codeListValue, 'riginator') or contains(@codeListValue, 'reator') or contains(@codeListValue, 'rincip')]/../../gmd:organisationName[not(contains(gco:CharacterString,'issing'))]/*/text()");

        G.evalProps(task, item, iden, "publisher_individual", "gmd:citation//gmd:CI_RoleCode[contains(text(),'ublisher')]/../../gmd:individualName[not(contains(gco:CharacterString,'issing'))]/gco:CharacterString");
         G.evalProps(task, item, iden, "publisher_organization", "gmd:citation//gmd:CI_RoleCode[contains(text(),'ublisher')]/../../gmd:organisationName[not(contains(gco:CharacterString,'issing'))]/gco:CharacterString");

       /* to generate facet for place names
         * dwv 2018-08-28 add named places */
        this.clearProps(task,"place_keywords");
        G.evalProps(task, item, root, "place_keywords",
            "//gmd:MD_KeywordTypeCode[contains(@codeListValue,'lace')]/../../gmd:keyword/*/text() | //gmd:geographicIdentifier//gmd:code/*/text() |" +
            " //gmd:geographicElement/../gmd:description/*/text()");
        G.evalProps(task, item, root, "place_keywords",
            "//gmd:MD_KeywordTypeCode[contains(@codeListValue,'lace')]/../../gmd:keyword/*/text() | //gmd:geographicIdentifier//gmd:code/*/text() |" +
            " //gmd:geographicElement/../gmd:description/*/text()");
        /* facet for all non-CINERGI controlled keywords, except place */
        this.clearProps(task,"tags_s");
        G.evalProps(task, item, root, "tags", "//gmd:MD_Keywords[not(descendant::*[contains(text(),'Cinergi')]) and //gmd:MD_KeywordTypeCode[not(contains(@codeListValue,'lace') )]]/gmd:keyword/*/text()");

        this.clearProps(task,"distribution_links_s");
        G.evalProps(task, item, root, "distribution_links_s", "/gmd:distributionInfo//gmd:MD_DigitalTransferOptions//gmd:linkage/gmd:URL | gmd:identificationInfo//srv:SV_OperationMetadata//gmd:linkage/gmd:URL | //gmd:aggregationInfo//gmd:code[starts-with(gco:CharacterString/text(),'http')]/gco:CharacterString");


        /*Resource identifier */
        this.clearProps(task,"apiso_ResourceIdentifier_s");
        G.evalProp(task, item, root, "apiso_ResourceIdentifier_s", "//gmd:dataSetURI/*/text() |  //gmd:identificationInfo//gmd:citation//gmd:identifier//gmd:code/*/text()");

        /* subject */
        this.clearProps(task,"apiso_Subject_txt");
        G.evalProps(task, item, root, "apiso_Subject_txt", "//gmd:MD_TopicCategoryCode | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/*/text()");


        /* G.evalProps(task, item, root, "apiso_Format_s", "gmd:distributionInfo/gmd:MD_Distribution/gmd:distributionFormat/gmd:MD_Format/name/gco:CharacterString");  */
        /*Format-- pick up all format name element values */
        this.clearProps(task,"apiso_Format_s");
        G.evalProps(task, item, root, "apiso_Format_s", "//gmd:MD_Format/gmd:name/*/text()");


    },



    evalServiceCinergi: function (task) {
        var item = task.item, root = task.root;

        // G.evalResourceLinks(task, item, root, "gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL | gmd:identificationInfo/srv:SV_ServiceIdentification/srv:containsOperations/srv:SV_OperationMetadata/srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
     //   this.evalResourceLinks(task, item, root, "gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL | gmd:identificationInfo/srv:SV_ServiceIdentification/srv:containsOperations/srv:SV_OperationMetadata/srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
        this.evalWorkbenchLinks(task, item, root, "gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine");
        this.evalDistributionLinks(task, item, root, "gmd:distributionInfo//gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource | gmd:identificationInfo//srv:SV_OperationMetadata/srv:connectPoint/gmd:CI_OnlineResource");
    },



    evalTemporalCinergi: function (task) {
        var self = this;
        var item = task.item, root = task.root;
        G.forEachNode(task, root, "//gmd:EX_TemporalExtent/gmd:extent", function (node) {
            var params = null;

            if (G.hasNode(task, node, "gml:TimeInstant/gml:timePosition")) {
                params = {
                    instant: {
                        date: G.getString(task, node, "gml:TimeInstant/gml:timePosition"),
                        indeterminate: G.getString(task, node, "gml:TimeInstant/gml:timePosition/@indeterminatePosition")
                    }
                };
            } else if (G.hasNode(task, node, "gml:TimePeriod/gml:beginPosition")) {
                params = {
                    begin: {
                        date: G.getString(task, node, "gml:TimePeriod/gml:beginPosition"),
                        indeterminate: G.getString(task, node, "gml:TimePeriod/gml:beginPosition/@indeterminatePosition")
                    },
                    end: {
                        date: G.getString(task, node, "gml:TimePeriod/gml:endPosition"),
                        indeterminate: G.getString(task, node, "gml:TimePeriod/gml:endPosition/@indeterminatePosition")
                    }
                };
            } else if (G.hasNode(task, node, "gml:TimePeriod/gml:begin")) {
                params = {
                    begin: {
                        date: G.getString(task, node, "gml:TimePeriod/gml:begin/gml:TimeInstant/gml:timePosition"),
                        indeterminate: G.getString(task, node, "gml:TimePeriod/gml:begin/gml:TimeInstant/gml:timePosition/@indeterminatePosition")
                    },
                    end: {
                        date: G.getString(task, node, "gml:TimePeriod/gml:end/gml:TimeInstant/gml:timePosition"),
                        indeterminate: G.getString(task, node, "gml:TimePeriod/gml:end/gml:TimeInstant/gml:timePosition/@indeterminatePosition")
                    }
                };

            } else if (G.hasNode(task, node, "gml32:TimeInstant/gml32:timePosition")) {
                params = {
                    instant: {
                        date: G.getString(task, node, "gml32:TimeInstant/gml32:timePosition"),
                        indeterminate: G.getString(task, node, "gml32:TimeInstant/gml32:timePosition/@indeterminatePosition")
                    }
                };
            } else if (G.hasNode(task, node, "gml32:TimePeriod/gml32:beginPosition")) {
                params = {
                    begin: {
                        date: G.getString(task, node, "gml32:TimePeriod/gml32:beginPosition"),
                        indeterminate: G.getString(task, node, "gml32:TimePeriod/gml32:beginPosition/@indeterminatePosition")
                    },
                    end: {
                        date: G.getString(task, node, "gml32:TimePeriod/gml32:endPosition"),
                        indeterminate: G.getString(task, node, "gml32:TimePeriod/gml32:endPosition/@indeterminatePosition")
                    }
                };
            } else if (G.hasNode(task, node, "gml32:TimePeriod/gml32:begin")) {
                params = {
                    begin: {
                        date: G.getString(task, node, "gml32:TimePeriod/gml32:begin/gml32:TimeInstant/gml32:timePosition"),
                        indeterminate: G.getString(task, node, "gml32:TimePeriod/gml32:begin/gml32:TimeInstant/gml32:timePosition/@indeterminatePosition")
                    },
                    end: {
                        date: G.getString(task, node, "gml32:TimePeriod/gml32:end/gml32:TimeInstant/gml32:timePosition"),
                        indeterminate: G.getString(task, node, "gml32:TimePeriod/gml32:end/gml32:TimeInstant/gml32:timePosition/@indeterminatePosition")
                    }
                };
            }

            //if (params) G.analyzeTimePeriod(task, params);
            if (params) self._analyzeTimePeriod(task, params);
        });
    },

    evalCinergi: function (task) {
        var item = task.item, root = task.root;
        /*
         1) if keyword node ia an anchor, and citation title contains > then treat is as a hierachy
         //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'>')]
         //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'C')]/../../../../gmd:keyword
                   | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gmx:Anchor
         md_keywords: //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'C')]/../../../..
		 
         2) if the title of a keyword viaf put in oranization
         */

//construct hierarchical category string with thesaurus name and anchor value
        G.forEachNode(task, root, "//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'>')]/../../../../gmd:keyword", function (node) {
            var cat = G.getString(task, node, "../gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString") + ' > ';
            var name = G.getString(task, node, "gmx:Anchor");
            cat = cat.concat(name);
            G.writeMultiProp(task.item, "categories_cat", cat);

        });
    },

    evalCallHierarchy: function (task) {
        var item = task.item, root = task.root;
        var fileid = G.getString(task, root, "gmd:fileIdentifier/gco:CharacterString");

        /* calls Cinergi Hierarchy Service with a document ID,
         http://132.249.238.151:8080/foundry/api/cinergi/docs/keyword/hierarchies/?id=%7bad308574-044c-3942-81dc-7d6e155dafac%7d
         {"keywords": [
         {
         "keyword": "Water Chemistry",
         "hierarchy": "Science Domain > Chemistry > Geochemistry > Hydrochemistry"
         },
         {
         "keyword": "Chemistry",
         "hierarchy": "Science Domain > Chemistry"
         },
         }
         Extracts path
         puts paths in document
         */

        try {
            var url = 'http://132.249.238.151:8080/foundry/api/cinergi/docs/keyword/hierarchies?id=';
            url = url + fileid;
            var hier = edu.sdsc.cinergi.service.client.hierarchy.getUrlAsJsonObject(url);
            if (hier == undefined) {
                print("No Hierarchy id:", fileid);
                return;
            }   //var kwds = hier.getJsonArray("keywords");
            var kwds = hier.keywords;

            //print (kwds);
            //print (kwds[0].hierarchy);

            for (i = 0; i < kwds.length; i++) {
                //print (kwds[i]);
                //print (kwds[i].hierarchy);
                if (kwds[i].hierarchy.getString().contains("Unassigned")) {
                    continue;
                }
                G.writeMultiProp(task.item, "hierarchies", "Category > " + kwds[i].hierarchy.getString());
                //print (task.item.hierarchies_cat);
            }

            //kwds.foreach(
            //    function(element, index, array) {
            //      G.writeProp(task.item, "hierarchies_cat", element.hierarchy);
            //    }
            //)
            //var kwds = getJSON(url ,
            //    function(err, data) {
            //      if (err != null) {
            //        alert("Something went wrong: " + err);
            //      } else {
            //        kwds.foreach(
            //         function(element, index, array) {
            //           G.writeProp(task.item, "hierarchies_cat", element.hierarchy);
            //         }
            //        )
            //      }
            //    });

        } catch (e) {
            print("INFO: Cinergi.ISO: No CINEGI hierarchy for:", fileid);
            //  print(e.message);
        }
        //G.forEachNode(task,root,"//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'>')]/../../../../gmd:keyword",function(node){
        //  var cat = G.getString(task,node,"../gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString") + '>';
        //  var name = G.getString(task,node,"gmd:keyword/gmx:Anchor");
        //  cat.concat( name );
        //  G.writeMultiProp(task.item,"hierarchies_cat",cat);
        //
        //});

    },

    checkResourceLink: function(url) {
        var endsWith = function(v,sfx) {return (v.indexOf(sfx,(v.length-sfx.length)) !== -1);};

        var arcgisTypes = ["MapServer","ImageServer","FeatureServer","GlobeServer","GPServer","GeocodeServer",
            "GeometryServer","NAServer","GeoDataServer ","MobileServer","SceneServer",
            "SchematicsServer","StreamServer","VectorTileServer"];
        var ogcTypes = ["WMS","WFS","WCS","WMTS","WPS","SOS","CSW"];
        var dataTypes = ["zip","shp"];

        var i, v, lc, linkType = null, linkUrl = null;
        var isHttp = (typeof url === "string" && (url.indexOf("http://") === 0 || url.indexOf("https://") === 0));
        var isFtp = (typeof url === "string" && (url.indexOf("ftp://") === 0 || url.indexOf("ftps://") === 0));
        if (isHttp) {
            lc = url.toLowerCase();
            if (lc.indexOf("service=") > 0) {
                //if (lc.indexOf("request=getcapabilities") > 0) {}
                for (i=0;i<ogcTypes.length;i++) {
                    v = "service="+ogcTypes[i].toLowerCase();
                    if (lc.indexOf("?"+v) > 0 || lc.indexOf("&"+v) > 0) {
                        linkType = ogcTypes[i];
                        linkUrl = url;
                        break;
                    }
                }
            } else if (lc.indexOf("/rest/services/") > 0) {
                for (i=0;i<arcgisTypes.length;i++) {
                    v = "/"+arcgisTypes[i].toLowerCase();
                    if (endsWith(lc,v)) {
                        linkType = arcgisTypes[i];
                        linkUrl = url;
                        break;
                    }
                }
            }
            if (linkType === null) {
                if (endsWith(lc,".kml") || endsWith(lc,".kmz") ||
                    lc.indexOf("?f=kml") > 0 || lc.indexOf("&f=kml") > 0 ||
                    lc.indexOf("?f=kmz") > 0 || lc.indexOf("&f=kmz") > 0) {
                    linkType = "kml";
                    linkUrl = url;
                }
            }
            if (linkType === null) {
                if (lc.indexOf("com.esri.wms.esrimap")>= 0) {
                    linkType = "IMS";
                    linkUrl = url;
                }
            }
            if (linkType === null) {
                if (lc.indexOf("cuahsi_1_1.asmx")>= 0) {
                    linkType = "WaterOneFlow";
                    linkUrl = url;
                }
            }
        }
        if (linkType !== null && (isHttp || isFtp)) {
            return {linkType:linkType,linkUrl:linkUrl};
        }
    },
    // //gmd:transferOptions
    evalWorkbenchLinks: function(task,item,root,xpathExpression) {
        if (!root) return;
        var self = this, urls = [], name = "services_nst";
        // print(xpathExpression);
        G.forEachNode(task,root,xpathExpression,function(node){
            var linkName = G.getString(task, node,"../../../gmd:distributionFormat/gmd:MD_Format/gmd:name/gco:CharacterString");
            var url = G.getString(task, node,"gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
            var type = G.getString(task, node,"gmd:CI_OnlineResource/gmd:name/gco:CharacterString");
            if (linkName && url && type) {
                if (urls.indexOf(url) === -1) {
                    urls.push(url);
                    G.writeMultiProp(item,name,{
                        "url_s": url,
                        "url_type_s": type,
                        "url_name_s": linkName
                    });
                }
            }
        });
    },

    checkWorkbenchLink: function(url) {
        var endsWith = function(v,sfx) {return (v.indexOf(sfx,(v.length-sfx.length)) !== -1);};

        var arcgisTypes = ["MapServer","ImageServer","FeatureServer","GlobeServer","GPServer","GeocodeServer",
            "GeometryServer","NAServer","GeoDataServer ","MobileServer","SceneServer",
            "SchematicsServer","StreamServer","VectorTileServer"];
        var ogcTypes = ["WMS","WFS","WCS","WMTS","WPS","SOS","CSW"];
        var dataTypes = ["zip","shp"];

        var i, v, lc, linkType = null, linkUrl = null;
        var isHttp = (typeof url === "string" && (url.indexOf("http://") === 0 || url.indexOf("https://") === 0));
        var isFtp = (typeof url === "string" && (url.indexOf("ftp://") === 0 || url.indexOf("ftps://") === 0));
        if (isHttp) {
            lc = url.toLowerCase();
            if (lc.indexOf("service=") > 0) {
                //if (lc.indexOf("request=getcapabilities") > 0) {}
                for (i=0;i<ogcTypes.length;i++) {
                    v = "service="+ogcTypes[i].toLowerCase();
                    if (lc.indexOf("?"+v) > 0 || lc.indexOf("&"+v) > 0) {
                        linkType = ogcTypes[i];
                        linkUrl = url;
                        break;
                    }
                }
            } else if (lc.indexOf("/rest/services/") > 0) {
                for (i=0;i<arcgisTypes.length;i++) {
                    v = "/"+arcgisTypes[i].toLowerCase();
                    if (endsWith(lc,v)) {
                        linkType = arcgisTypes[i];
                        linkUrl = url;
                        break;
                    }
                }
            }
            if (linkType === null) {
                if (endsWith(lc,".kml") || endsWith(lc,".kmz") ||
                    lc.indexOf("?f=kml") > 0 || lc.indexOf("&f=kml") > 0 ||
                    lc.indexOf("?f=kmz") > 0 || lc.indexOf("&f=kmz") > 0) {
                    linkType = "kml";
                    linkUrl = url;
                }
            }
            if (linkType === null) {
                if (lc.indexOf("com.esri.wms.esrimap")>= 0) {
                    linkType = "IMS";
                    linkUrl = url;
                }
            }
            if (linkType === null) {
                if (lc.indexOf("cuahsi_1_1.asmx")>= 0) {
                    linkType = "WaterOneFlow";
                    linkUrl = url;
                }
            }
        }
        if (linkType !== null && (isHttp || isFtp)) {
            return {linkType:linkType,linkUrl:linkUrl};
        }
    },

    evalDistributionLinks: function(task,item,root,xpathExpression) {
        //root is a CI_OnlineResource
        if (!root) return;
        var self = this, urls = [], name = "dist_link_nst";
        // print(xpathExpression);
        G.forEachNode(task,root,xpathExpression,function(node){
            var linkName = G.getString(task, node,"gmd:name/*/text()");
            if (linkName == undefined) {
                linkName = "link";
            }
            var url = G.getString(task, node,"gmd:linkage/gmd:URL");
            var funct = G.getString(task, node,"gmd:function/gmd:CI_OnLineFunctionCode/@codeListValue");
            if (funct == undefined) {
                funct = "";
            }
            var appProfile = G.getString(task, node,"gmd:applicationProfile/*/text()");
            if (appProfile == undefined) {
                appProfile = "";
            }
            var description = G.getString(task, node,"gmd:description/*/text()");
            if (description == undefined) {
                description = "";
            }
            var protocol = G.getString(task, node,"gmd:protocol/*/text()");
            if (protocol == undefined) {
                protocol = "";
            }
            if (linkName && url) {
                if (urls.indexOf(url) === -1) {
                    urls.push(url);
                    G.writeMultiProp(item,name,{
                        "url_s": url,
                        "url_name_s": linkName,
                        "url_appprof_s": appProfile,
                        "url_function_s": funct,
                        "url_protocol_s": protocol,
                        "url_desc_s": description
                    });
                }
            }
        });
    },

    _analyzeTimePeriod: function(task,params) {
        //print("analyzeTimePeriod");
        if (!params) return;
        //"instant_dt": null, "instant_indeterminate_s": null,
        var data = {
            "begin_dt": null,
            "begin_indeterminate_s": null,
            "end_dt": null,
            "end_indeterminate_s": null,
        };
        if (params.instant) {
            //data["instant_dt"] = this.DateUtil.checkIsoDateTime(params.instant.date,false);
            //data["instant_indeterminate_s"] = this.Val.chkStr(params.instant.indeterminate,null);
            if (!params.begin && !params.end) {
                params.begin = {
                    date: params.instant.date,
                    indeterminate: params.instant.indeterminate
                };
                // TODO should use the instant
                params.end = {
                    date: params.instant.date,
                    indeterminate: params.instant.indeterminate
                };
            }
        }
        if (params.begin) {
            if (typeof params.begin.date === "string" && !params.begin.date.startsWith("9999")
                && this._limitDateRange(params.begin.date )
            ) {
                data["begin_dt"] = G.DateUtil.checkIsoDateTime(params.begin.date,false);
            }
            data["begin_indeterminate_s"] = G.Val.chkStr(params.begin.indeterminate,null);
        }
        if (params.end) {
            if (typeof params.end.date === "string" && !params.end.date.startsWith("9999")
                && this._limitDateRange(params.end.date )
            ) {
                data["end_dt"] = G.DateUtil.checkIsoDateTime(params.end.date,true);
            }
            data["end_indeterminate_s"] = G.Val.chkStr(params.end.indeterminate,null);
        }
        var ok = false;
        for (var k in data) {
            if (data.hasOwnProperty(k)) {
                if (data[k] !== null ) {
                    ok = true;
                    break;
                }
            }
        }
        if (ok) {
            //this.writeMultiProp(task.item,"timeperiod_tp",data);
            G.writeMultiProp(task.item,"timeperiod_nst",data);
        }
    },


    _limitDateRange: function(dateString){
        var validDate = true;
        if (dateString.startsWith("9999")) validDate = false;

        try {
            var dateYear = dateString.substr(0,4);
            var dateInt = parseInt(dateYear);
            if ( (dateInt === undefined) ||  (dateInt < 1000) || (dateInt > 2100) ){
                print ("daterange reject "+ dateString );
                validDate = false;
            }
        } catch (ex) {
            print ("daterange error "+dateString );
            validDate=false;
        }
        return validDate;
    },

    clearProps: function(obj, name) {
        if (obj[name]){
            obj[name] = undefined;
        }

    }
};
//var getJSON = function(url, callback) {
//  var xhr = new XMLHttpRequest();
//  xhr.open("get", url, true);
//  xhr.responseType = "json";
//  xhr.onload = function() {
//    var status = xhr.status;
//    if (status == 200) {
//      callback(null, xhr.response);
//    } else {
//      callback(status);
//    }
//  };
//  xhr.send();
//};
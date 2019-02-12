define(["dojo/i18n!app/nls/resources",]
    ,function(i18n){var obj={
// .......................................................................................
  
  edit: {
    setField: {
      allow: false,
      adminOnly: false
    }
  },
  
  bulkEdit: {
    allowByOwner: true,
    allowBySourceUri: true,
    allowByTaskRef: true,
    allowByQuery: true
  },
  
  search: {
    allowSettings: false,
    useSimpleQueryString: false,
    highlightQuery: true
  },
  
  searchMap: {
    open: true,
      basemap: "streets",
    autoResize: true, 
    wrapAround180: true,
    center: [-98, 40], 
    zoom: 3,
      searchOnMap: false,
      locatorParams: {
      sources:[
          {
              type:"locator",
              url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
              singleLineFieldName: "SingleLine",
              outFields: ["Addr_type"],
              // name: i18n.widgets.Search.main.esriLocatorName,
              localSearchOptions: {
                  minScale: 300000,
                  distance: 90
              },
              placeholder: "find  a place",
              categories: [
                  "Populated Place",
                  "Education",
                  "Land Features",
                  "Wildlife Reserve",
                  "Nature Reserve",
                  "Harbor",
                  "Mine",

                  "Water Features",
              ],
              maxResults:10,
              maxSuggestions: 20,
              searchInCurrentMapExtent: false,

          }
      ],
      }
  },

  searchResults: {
    numPerPage: 10,
    showPageCount: true,
    maxShowPageCount: 9999,
      maxShowPageCountText: ">10k",
    showDate: true,
    showOwner: true,
    showThumbnails: true,
    showAccess: true,
    showApprovalStatus: true,
    defaultSort: "sys_modified_dt:desc",
    showLinks: true,
    showCustomLinks: false,
    showOpenSearchLinks: true
  },
  
  statusChecker: {
    apiUrl: "http://registry.fgdc.gov/statuschecker/api/v2/results?",
    infoUrl: "http://registry.fgdc.gov/statuschecker/ServiceDetail.php?",
    authKey: null
  }
  
// .......................................................................................
};return obj;});
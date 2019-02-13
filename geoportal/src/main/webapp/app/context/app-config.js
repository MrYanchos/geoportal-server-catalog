define([],function(){var obj={
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
      DateMin: 1000,
      DateMax: 2500
  },
  
  searchMap: {
    basemap: "streets",
    autoResize: true, 
    wrapAround180: true,
    center: [-98, 40], 
    zoom: 3
  },
  
  searchResults: {
    numPerPage: 10,
    showDate: true,
    showOwner: false,
    showThumbnails: true,
    showAccess: true,
    showApprovalStatus: true,
    defaultSort: "title.sort:asc",
    showLinks: true,
    showCustomLinks: true,
    showOpenSearchLinks: true
  },
  
  statusChecker: {
    apiUrl: "http://registry.fgdc.gov/statuschecker/api/v2/results?",
    infoUrl: "http://registry.fgdc.gov/statuschecker/ServiceDetail.php?",
    authKey: null
  }
  
// .......................................................................................
};return obj;});
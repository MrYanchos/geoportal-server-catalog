define([],function(){var obj={
// .......................................................................................
        
  /* params - {type:string, url:string}; */
  AddToMapClicked: "app/AddToMapClicked",
  
  /* params - {} */
  BulkUpdate: "app/BulkUpdate",
  
  /* params - {item:obj} */
  ItemAccessChanged: "app/ItemAccessChanged",
  
  /* params - {item:obj} */
  ItemApprovalStatusChanged: "app/ItemApprovalStatusChanged",
  
  /* params - {item:obj} */
  ItemOwnerChanged: "app/ItemOwnerChanged",
  
  /* params - {response:obj} */
  ItemUploaded: "app/ItemUploaded",
  
  /* params - {searchPane:obj,itemId:string} */
  ItemDeleted: "app/ItemDeleted",
  
  /* params - {item:item} */
  OnMouseEnterResultItem: "app/OnMouseEnterResultItem",
  
  /* params - {item:item} */
  OnMouseLeaveResultItem: "app/OnMouseLeaveResultItem",
  
  /* params - {searchPane:obj} */
  RefreshSearchResultPage: "app/RefreshSearchResultPage",
  
  /* params - {geoportalUser:obj} */

  SignedIn: "app/SignedIn",

  /* topics for saving queries */
  /* params - {query:postdata.query, queries:postdata.queries} */
  LastQuery: "app/LastQuery",

  /* itemSave,itemRemove topics for managing items in local storage */
  /* params - {item:item, collection:string} */
  itemSave: "app/ItemSave",

  /* params - {item:obj, collection:string, removeAll:false} */
  itemRemove: "app/ItemRemove",

  /* params - {item:obj, status:(saved|removed) } */
  itemStatusChanged: "app/itemStatusChanged",

// .......................................................................................
};return obj;});
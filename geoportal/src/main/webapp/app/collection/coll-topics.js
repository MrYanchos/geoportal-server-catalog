define([],function(){var obj={
// .......................................................................................
        
  /* collection topics */
  collectionChanged: "app/collection/selectCollection",
  collectionRefreshRequest: "app/collection/refresh",
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
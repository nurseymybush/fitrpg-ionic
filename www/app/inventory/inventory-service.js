angular.module('mobile.inventory.services')

.factory('InvService', function() {
  function getInvItemFromShopId(shopId, userInventory) {
    console.log("In InvService.getInvItemFromShopId()");
    var inventoryItem = null;
    for (var i = 0; i < userInventory.length; ++i) {
      if (userInventory[i].storeId === shopId) {
        inventoryItem = userInventory[i];
      }
    }
    console.log("inventoryItem");
    console.log(inventoryItem);
    return inventoryItem;
  };

  function getInvItemsFromShopIds(shopIds, userInventory) {
    console.log("In InvService.getInvItemsFromShopIds()");
    var inventoryItems = [];
    for (var i = 0; i < shopIds.length; ++i) {
      var tempItem = getInvItemFromShopId(shopIds[i], userInventory);
      if(tempItem !== null) inventoryItems.push(tempItem);
    }
    return inventoryItems;
  }

  return {
    getInvItemFromShopId: getInvItemFromShopId,
    getInvItemsFromShopIds: getInvItemsFromShopIds
  }
});
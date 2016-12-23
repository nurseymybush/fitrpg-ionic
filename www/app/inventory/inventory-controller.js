angular.module('mobile.inventory.controllers')

.controller('InventoryCtrl', function($scope, Shop, $ionicLoading, $ionicPopup, InvService, User, ShopItemsByIds) {
  // inventory is accessed from $rootScope.user.inventory in the template
  var inventory = $scope.user.inventory;

  var makeCopy = function(object) {
    objectCopy = {};
    for (var key in object) {
      objectCopy[key] = object[key];
    }
    return objectCopy;
  };
  
  $scope.rarityColor = function(isRare){
    if(isRare) return "energized";
  }

  var loading = setTimeout(function() {
    $ionicLoading.show({
      template: '<p>Loading...</p><i class="icon ion-loading-c"></i>'
    });
  }, 500);

  $scope.sellAllUnequippedPrompt = function(){
    var title = 'Sell All';
    var body = 'Do you want to sell all unequipped inventory items (excluding potions)?';

    util.showPrompt($ionicPopup, title, body, 'Sell', 'Cancel', function() {
      $scope.sellAllUnequipped();
    });
  }

  $scope.sellAllUnequipped = function(){
    console.log("Selling all unequipped items");
    //get each item that is unequipped in a list
    var unequippedItemsIds = [];

    console.log("inventory");
    console.log(inventory);

    for(var i = 0; i < inventory.length; ++i){
      if(inventory[i].equipped === false){
        unequippedItemsIds.push(inventory[i].storeId);
      }
    }
    console.log("unequippedItemsIds");
    console.log(unequippedItemsIds);
    //i have the unequipped item ids list now

    //this is not what should be done here
    var tempList = InvService.getInvItemsFromShopIds(unequippedItemsIds, $scope.user.inventory);
    console.log(tempList);
    //send list of ids to server
    //it should return [{id:id1, sellPrice:sellPrice1}, {id:id2, sellPrice:sellPrice2}]
    ShopItemsByIds.post(tempList).$promise.function(items){
      
      //foreach object in this list
      for(var item in items) {
        //add sell price to users gold
        $scope.user.attributes.gold = $scope.user.attributes.gold + item.sellPrice;
        
        //get index of item in inventory
        var itemIndex;
        for (var i = 0; i < inventory.length; i++) {
          if (inventory[i].storeId === item['_id']) {
            itemIndex = i;
          }
        }
        //remove item from inventory
        $scope.user.inventory.splice(itemIndex, 1);
      }
      //update User
      User.update($scope.user);    
    });
  }

  $scope.getInventory = function() {
    $scope.inventory = [];
    Shop.query(function(storeItems) {
      for (var i = 0; i < inventory.length; i++) {
        var itemId = inventory[i].storeId;
        for (var j = 0; j < storeItems.length; j++) {
          var storeItem = makeCopy(storeItems[j]);
          if (storeItem['_id'] === itemId) {
            storeItem['inventoryId'] = inventory[i].id;
            storeItem['quantity'] = inventory[i].quantity;
            if (inventory[i].equipped) {
              storeItem['equipped'] = 'Equipped';
            }
            $scope.inventory.push(storeItem);
          }
        }
      }
      clearTimeout(loading);
      $ionicLoading.hide();
      checkItems();
    });
  };

  $scope.equipmentTab = 'button-tab-active';
  $scope.equipment = function() {
    $scope.isEquipment = true;
    $scope.equipmentTab = 'button-tab-active';
    $scope.itemsTab = '';
  };

  $scope.potion = function() {
    $scope.isEquipment = false;
    $scope.equipmentTab = '';
    $scope.itemsTab = 'button-tab-active';
  };

  $scope.equipment();

  $scope.showList = {
    weapons: true,
    armor: true,
    accessories: true,
    potions: true
  };

  $scope.toggleList = function(list) {
    $scope.showList[list] = !$scope.showList[list];
  };

  $scope.hasItem = {
    weapon: false,
    armor: false,
    accessory: false,
    potion: false
  };
  
  $scope.getInventory();

  $scope.refresh = function() {
    $scope.getInventory();
    $scope.$broadcast('scroll.refreshComplete');
  };

  var checkItems = function() {
    var quantity = {}
    for (var i = 0; i < $scope.inventory.length; i++) {
      var item = $scope.inventory[i].type;
      quantity[item] = quantity[item] || 0;
      quantity[item]++;
    }

    for (var key in $scope.hasItem) {
      if (quantity[key]) {
        $scope.hasItem[key] = true;
      }
    }
  };

});
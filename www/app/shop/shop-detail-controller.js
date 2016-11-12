angular.module('mobile.shop.controllers')

.controller('ShopDetailCtrl', function($scope, $stateParams, $state, Shop, User, $ionicPopup, $q, $cordovaToast) {
  $scope.isWeapon = false;
  $scope.currentQuantity = 1;
  $scope.currentCost;

  //if user.seenItems doesnt exist, create it
  $scope.user.seenItems = $scope.user.seenItems ? $scope.user.seenItems : [];
  //push item into user.seenItems if not already present
  //if(!$scope.user.seenItems.includes($stateParams.shopId)) $scope.user.seenItems.push($stateParams.shopId);
  if (_.contains($scope.user.seenItems, $stateParams.shopId) === false) {
    console.log('pushing ' + $stateParams.shopId + 'into seenItems');
    $scope.user.seenItems.push($stateParams.shopId);
    User.update($scope.user);
  }

  $scope.changePotionQuantity = function(posOrMinus) {
    var nextQuantity = $scope.currentQuantity + posOrMinus; //this could be -1 or +1
    if ($scope.user.attributes.gold >= ($scope.shopItem.cost * nextQuantity) && nextQuantity >= 1) {
      $scope.currentQuantity = nextQuantity;
      $scope.currentCost = $scope.shopItem.cost * nextQuantity;
    }
  };

  $scope.shopItem = Shop.get({
    id: $stateParams.shopId
  }, function(item) {
    //$scope.shopItem.type = util.capitalize($scope.shopItem.type);
    //$scope.shopItem.type = $scope.shopItem.type;
    $scope.currentCost = item.cost;
    $scope.shopItem.type = item.type; //chance try
    if ($scope.shopItem.size === 1) {
      $scope.shopItem.sizeText = 'One-Handed';
    } else if ($scope.shopItem.size === 2) {
      $scope.shopItem.sizeText = 'Two-Handed';
    }
    //if ($scope.shopItem.type === 'Weapon') {
    if ($scope.shopItem.type === 'weapon') {
      $scope.isWeapon = true;
    }
  });

  $scope.addClass = function(attr) {
    if (attr >= 0) {
      return 'text-green';
    } else {
      return 'text-red';
    }
  };

  var equipmentInInventory = function() {
    var found = false;
    var inventory = $scope.user.inventory;
    for (var i = 0; i < inventory.length; ++i) {
      var item = inventory[i];
      if (item.storeId === $scope.shopItem['_id']) {
        found = true;
      }
    }
    return found;
  }

  $scope.buyItem = function() {
    var equipInInventory = equipmentInInventory();
    var isPotion = $scope.checkType();

    if (equipInInventory === true && isPotion === false) { //is not a potion and is already in inventory
      //util.showAlert($ionicPopup, 'Item Owned', 'You already own this item.', 'OK', function() {
      $cordovaToast.showShortBottom('You already own this item.').then(function(success) {
        $state.go('app.shop');
      });

    } else {
      //if ($scope.user.attributes.gold >= $scope.shopItem.cost) { //has enough gold to buy item
      if ($scope.user.attributes.gold >= $scope.currentCost) {
        $scope.user.attributes.gold = $scope.user.attributes.gold - $scope.currentCost;
        // add to inventory
        var found = false;
        var added = false;
        var inventoryId = 0;
        if ($scope.user.inventory.length > 0) { //increment the inventory id
          inventoryId = $scope.user.inventory[$scope.user.inventory.length - 1].id + 1;
        }

        //TODO - this area down til User.update can be refactored
        if (isPotion === true) {
          var inventory = $scope.user.inventory;
          for (var i = 0; i < inventory.length; ++i) {
            var item = inventory[i];
            if (item.storeId === $scope.shopItem['_id']) {
              found = true;
              added = true;
              item.quantity = item.quantity + $scope.currentQuantity; //increase item quantity
            }
          }
        }

        if (!found && !added) { //if not in inventory already and not added already
          $scope.user.inventory.push({
            id: inventoryId,
            quantity: 1,
            equipped: false,
            storeId: $scope.shopItem['_id']
          });
        } else if (found && !added) { //if in inventory and not added already
          $scope.user.inventory.push({
            id: inventoryId,
            quantity: 1,
            equipped: false,
            storeId: $scope.shopItem['_id']
          });
        }

        User.update($scope.user);
        util.showAlert($ionicPopup, 'Item Purchased', 'Go to your inventory to equip or use your item.', 'OK', function() {
          $state.go('app.shop');
        });
      } else {
        util.showAlert($ionicPopup, 'Insufficient Gold', 'You need more gold. Fight some bosses or go on quests to earn gold.', 'OK', function() {});
      }
    }
  };

  $scope.checkType = function() {
    if ($scope.shopItem.type === 'potion') {
      return true;
    } else {
      return false;
    }
  }
});
angular.module('mobile.inventory.controllers')

.controller('InventoryDetailCtrl', function($scope, $state, $stateParams, Shop, User, $ionicPopup, $q) {
  var item;
  var index;
  var inventory = $scope.user.inventory; //might need to use rootscope, got an error

  //CONST VARS
  var TYPE_WEAPON = "weapon";
  var SLOT_WEAPON1 = "weapon1";
  var SLOT_WEAPON2 = "weapon2";
  var SIZE_WEAPON1 = "One-Handed";
  var SIZE_WEAPON2 = "Two-Handed";
  var TYPE_ARMOR = "armor";
  var SLOT_ARMOR = "armor";
  var TYPE_ACCESSORY = "accessory";
  var SLOT_ACCESSORY1 = "accessory1";
  var SLOT_ACCESSORY2 = "accessory2";
  var TYPE_POTION = "potion";

  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i].id.toString() === $stateParams.inventoryId.toString()) {
      index = i;
      item = inventory[index];
    }
  }
  $scope.isWeapon = false;

  $scope.inventoryItem = Shop.get({
    id: item.storeId
  }, function(item) {
    $scope.inventoryItem.type = item.type;
    //$scope.inventoryItem.quantity = item.quantity;//shop doesnt have this info
    if ($scope.inventoryItem.size === 1) {
      $scope.inventoryItem.sizeText = SIZE_WEAPON1;
    } else if ($scope.inventoryItem.size === 2) {
      $scope.inventoryItem.sizeText = SIZE_WEAPON2;
    }
    if ($scope.inventoryItem.type === TYPE_WEAPON) {
      $scope.isWeapon = true;
    }
  });

  var myVitality = $scope.user.attributes.vitality + $scope.user.fitbit.vitality;
  var myMaxHp = util.vitalityToHp(myVitality, $scope.user.characterClass);
  if ($scope.user.attributes.hp + $scope.inventoryItem.hp >= myMaxHp)
    $scope.potionHp = myMaxHp;
  else
    $scope.potionHp = $scope.user.attributes.hp + $scope.inventoryItem.hp;

  $scope.addClass = function(attr) {
    if (attr > 0) {
      return 'text-green';
    } else {

      return 'text-red';
    }
  };

  $scope.sellItem = function() {
    var title, body, callback;
    if (item.equipped === false) {
      $scope.user.attributes.gold = $scope.user.attributes.gold + $scope.inventoryItem.sellPrice;
      if ($scope.inventoryItem.type !== TYPE_POTION) {
        // remove from inventory
        $scope.user.inventory.splice(index, 1);
      } else {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else if (item.quantity === 1) {
          $scope.user.inventory.splice(index, 1);
        }
      }
      // save user
      User.update($scope.user);
      title = 'Item Sold';
      body = 'You received ' + $scope.inventoryItem.sellPrice + ' gold for your item.';
      callback = function() {
        $state.go('app.inventory');
      }
    } else {
      title = 'Item Equipped';
      body = 'You must unequip your item before you can sell it.';
      callback = function() {};
    }

    util.showAlert($ionicPopup, title, body, 'OK', callback);
  };

  var setEquippedItem = function(slot, inventoryItemId, name) {//working here
    $scope.user.equipped[slot].name = name;//this should be '' when unequipping
    $scope.user.equipped[slot].inventoryId = inventoryItemId;//this should be null when unequipping
    return true;
  };

  var addRemoveItemAttributes = function(pos1orneg1) {//updating bonusAttributes now
      $scope.user.bonusAttributes.strength = $scope.user.bonusAttributes.strength + ($scope.inventoryItem.strength * pos1orneg1);
      $scope.user.bonusAttributes.vitality = $scope.user.bonusAttributes.vitality +  ($scope.inventoryItem.vitality * pos1orneg1);
      $scope.user.bonusAttributes.endurance = $scope.user.bonusAttributes.endurance + ($scope.inventoryItem.endurance * pos1orneg1);
      $scope.user.bonusAttributes.dexterity = $scope.user.bonusAttributes.dexterity + ($scope.inventoryItem.dexterity * pos1orneg1);
      $scope.user.bonusAttributes.dexterity = $scope.user.bonusAttributes.hp + ($scope.inventoryItem.hp * pos1orneg1);
};

  var itemSetFn = function(item, inventoryItem, equipped) {//working here
    var returnItemSet = false;
    if (inventoryItem.type.toLowerCase() === TYPE_WEAPON) {
      if (inventoryItem.size === 1) {
        if (equipped.weapon1.name === '') {
          returnItemSet = setEquippedItem(SLOT_WEAPON1, parseFloat(inventoryItem.id), inventoryItem.name) //item is the same as inventoryItem
        } else if (equipped.weapon2.name === '') {
          returnItemSet = setEquippedItem(SLOT_WEAPON2, parseFloat(inventoryItem.id), inventoryItem.name)
        }
      } else if (inventoryItem.size === 2) {
        if (equipped.weapon1.name === '' && equipped.weapon2.name === '') {
          returnItemSet = setEquippedItem(SLOT_WEAPON1, parseFloat(inventoryItem.id), inventoryItem.name)
          returnItemSet = setEquippedItem(SLOT_WEAPON2, parseFloat(inventoryItem.id), inventoryItem.name)
        }
      }
    } else if (inventoryItem.type.toLowerCase() === TYPE_ARMOR) {
      if (equipped.armor.name === '') {
        returnItemSet = setEquippedItem(SLOT_ARMOR, parseFloat(inventoryItem.id), inventoryItem.name)
      }
    } else if (inventoryItem.type.toLowerCase() === TYPE_ACCESSORY) {
      if (equipped.accessory1.name === '') {
        returnItemSet = setEquippedItem(SLOT_ACCESSORY1, parseFloat(inventoryItem.id), inventoryItem.name)
      } else if (equipped.accessory2.name === '') {
        returnItemSet = setEquippedItem(SLOT_ACCESSORY2, parseFloat(inventoryItem.id), inventoryItem.name)
      }
    }
    return returnItemSet;
  };

  $scope.equipItem = function() {//working here
    if (item.equipped === false) {
      if (itemSetFn(item, $scope.inventoryItem, $scope.user.equipped) === true) {
        item.equipped = true;
        addRemoveItemAttributes(1);
        User.update($scope.user);
        util.showAlert($ionicPopup, 'Item Equipped', 'You are ready to wage war against the forces of evil.', 'OK', function() {
          $state.go('app.inventory');
        })
      } else {
        util.showAlert($ionicPopup, 'Remove An Item', 'You are holding too many items. You need to take off an item before you can put this on.', 'OK', function() {
          $state.go('app.inventory');
        })
      }
    } else { //Unequip item
      var didSetEmpty = itemSetFn(item, $scope.inventoryItem, $scope.user.equipped);
      item.equipped = false;
      addRemoveItemAttributes(-1);
      User.update($scope.user);
      util.showAlert($ionicPopup, 'Item Unequipped', 'You have successfully unequipped this item.', 'OK', function() {
        $state.go('app.inventory');
      })
    }
  };

  $scope.useItem = function() {
    var totalVitality = $scope.user.attributes.vitality + $scope.user.fitbit.vitality;
    var maxHp = util.vitalityToHp(totalVitality, $scope.user.characterClass);
    if (item.quantity > 0) {
      $scope.user.attributes.HP += $scope.inventoryItem.hp;
      if ($scope.user.attributes.HP > maxHp) {
        $scope.user.attributes.HP = maxHp;
      }
      // subtract quantity from inventory -> remove if quantity = 0
      item.quantity -= 1;
    }

    if (item.quantity === 0) {
      $scope.user.inventory.splice(index, 1);
    }

    User.update($scope.user);
    util.showAlert($ionicPopup, 'HP Recovered', 'Your HP is recovering!', 'OK', function() {
      $state.go('app.inventory');
    })
  };

  $scope.checkType = function() {
    if ($scope.inventoryItem.type === TYPE_POTION) {
      return true;
    } else {
      return false;
    }
  };
});
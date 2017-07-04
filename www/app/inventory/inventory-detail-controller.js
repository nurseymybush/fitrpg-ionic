angular.module('mobile.inventory.controllers')

  .controller('InventoryDetailCtrl', function ($scope, $state, $stateParams, Shop, User, $ionicPopup, $q, localStorageService, $rootScope) {
    var localItem;
    var index;
    //var inventory = $scope.user.inventory; //might need to use rootscope, got an error
    var localUser = localStorageService.get('userData');
    var inventory = localUser.inventory;
    $scope.userHP = localUser.attributes.HP;

    //CONST VARS
    var TYPE_WEAPON = "weapon";
    var SLOT_WEAPON1 = "weapon1";
    var SLOT_WEAPON2 = "weapon2";
    var SIZE_WEAPON1 = "One-Handed";
    var SIZE_WEAPON2 = "Two-Handed";
    var TYPE_ARMOR = "armor";
    //var SLOT_ARMOR = "armor"; //redundant
    var TYPE_ACCESSORY = "accessory";
    var SLOT_ACCESSORY1 = "accessory1";
    var SLOT_ACCESSORY2 = "accessory2";
    var TYPE_POTION = "potion";

    console.log('InventoryDetailCtrl $stateParams.inventoryId: ' + $stateParams.inventoryId);
    console.log('InventoryDetailCtrl inventory:');
    console.log(JSON.stringify(inventory));
    for (var i = 0; i < inventory.length; i++) {
      if (inventory[i].id.toString() === $stateParams.inventoryId.toString()) {
        console.log('InventoryDetailCtrl found the inventoryItem at index: ' + i);
        index = i;
        localItem = inventory[index];
      }
    }
    console.log('InventoryDetailCtrl localItem:');
    console.log(JSON.stringify(localItem));
    $scope.isWeapon = false;

    $scope.inventoryItem = Shop.get({
      id: localItem.storeId
    }, function (item) {
      console.log('InventoryDetailCtrl Shop.get() item:');
      console.log(JSON.stringify(item));
      $scope.inventoryItem.type = item.type;
      $scope.inventoryItem.hp = item.hp; //chance add to fix potion hp not showing
      $scope.inventoryItem.quantity = localItem.quantity; //shop doesnt have this info
      $scope.inventoryItem.equipped = localItem.equipped;
      if ($scope.inventoryItem.size === 1) {
        $scope.inventoryItem.sizeText = SIZE_WEAPON1;
      } else if ($scope.inventoryItem.size === 2) {
        $scope.inventoryItem.sizeText = SIZE_WEAPON2;
      }
      if ($scope.inventoryItem.type === TYPE_WEAPON) {
        $scope.isWeapon = true;
      }
      DoCalculations();
    }, function (error) {
      console.log(JSON.stringify(error));
    });

    function DoCalculations() {
      console.log('InventoryDetailCtrl $scope.inventoryItem:');
      console.log(JSON.stringify($scope.inventoryItem));

      //var myVitality = $scope.user.attributes.vitality + $scope.user.fitbit.vitality;
      var myVitality = localUser.attributes.vitality + localUser.fitbit.vitality;
      console.log('InventoryDetailCtrl myVitality: ' + myVitality);
      //var myMaxHp = util.vitalityToHp(myVitality, $scope.user.characterClass);
      var myMaxHp = util.vitalityToHp(myVitality, localUser.characterClass);
      console.log('InventoryDetailCtrl myMaxHp: ' + myMaxHp);
      console.log('InventoryDetailCtrl $scope.inventoryItem.hp: ' + $scope.inventoryItem.hp);
      //if ($scope.user.attributes.hp + $scope.inventoryItem.hp >= myMaxHp)
      console.log('InventoryDetailCtrl localUser.attributes.HP + $scope.inventoryItem.hp: ' + (localUser.attributes.HP + $scope.inventoryItem.hp));
      if (localUser.attributes.HP + $scope.inventoryItem.hp >= myMaxHp)
        $scope.potionHp = myMaxHp;
      else
        //$scope.potionHp = $scope.user.attributes.HP + $scope.inventoryItem.hp;
        $scope.potionHp = localUser.attributes.HP + $scope.inventoryItem.hp;
      console.log('InventoryDetailCtrl $scope.potionHp: ' + $scope.potionHp);
    }

    $scope.addClass = function (attr) {
      if (attr > 0) {
        return 'text-green';
      } else if (attr < 0) {
        return 'text-red';
      } else {
        return '';
      }
    };

    $scope.sellItem = function () {
      var title, body, callback;
      if (localItem.equipped === false) {
        //$scope.user.attributes.gold = $scope.user.attributes.gold + $scope.inventoryItem.sellPrice;
        localUser.attributes.gold += $scope.inventoryItem.sellPrice;
        if ($scope.inventoryItem.type !== TYPE_POTION) {
          // remove from inventory
          //$scope.user.inventory.splice(index, 1);
          localUser.inventory.splice(index, 1);
        } else {
          if (localItem.quantity > 1) {
            localItem.quantity -= 1;
          } else if (localItem.quantity === 1) {
            //$scope.user.inventory.splice(index, 1);
            localUser.inventory.splice(index, 1);
          }
        }
        // save user
        //User.update($scope.user);
        User.update(localUser);
        //localStorageService.set('userData', $scope.user);   
        localStorageService.set('userData', localUser);
        
        //$scope.$broadcast("soldItem", {});//chance try 6-26-2017
        $rootScope.$emit("inventoryChange", {});//chance try 6-26-2017

        title = 'Item Sold';
        body = 'You received ' + $scope.inventoryItem.sellPrice + ' gold for your item.';
        callback = function () {
          $state.go('app.inventory');
        }
      } else {
        title = 'Item Equipped';
        body = 'You must unequip your item before you can sell it.';
        callback = function () {};
      }

      util.showAlert($ionicPopup, title, body, 'OK', callback);
    };

    var setEquippedItem = function (slot, inventoryItemId, name) { //working here
      //$scope.user.equipped[slot].name = name;//this should be '' when unequipping
      //$scope.user.equipped[slot].inventoryId = inventoryItemId;//this should be null when unequipping
      localUser.equipped[slot].name = name; //this should be '' when unequipping
      localUser.equipped[slot].inventoryId = inventoryItemId; //this should be null when unequipping
      return true;
    };

    var addRemoveItemAttributes = function (pos1orneg1) { //updating bonusAttributes now
      /*$scope.user.bonusAttributes.strength = $scope.user.bonusAttributes.strength + ($scope.inventoryItem.strength * pos1orneg1);
      $scope.user.bonusAttributes.vitality = $scope.user.bonusAttributes.vitality +  ($scope.inventoryItem.vitality * pos1orneg1);
      $scope.user.bonusAttributes.endurance = $scope.user.bonusAttributes.endurance + ($scope.inventoryItem.endurance * pos1orneg1);
      $scope.user.bonusAttributes.dexterity = $scope.user.bonusAttributes.dexterity + ($scope.inventoryItem.dexterity * pos1orneg1);
      $scope.user.bonusAttributes.HP = $scope.user.bonusAttributes.HP + ($scope.inventoryItem.hp * pos1orneg1);*/
      localUser.bonusAttributes.strength = localUser.bonusAttributes.strength + ($scope.inventoryItem.strength * pos1orneg1);
      if(localUser.bonusAttributes.strength < 0) localUser.bonusAttributes.strength = 0;
      localUser.bonusAttributes.vitality = localUser.bonusAttributes.vitality + ($scope.inventoryItem.vitality * pos1orneg1);
      if(localUser.bonusAttributes.vitality < 0) localUser.bonusAttributes.vitality = 0;
      localUser.bonusAttributes.endurance = localUser.bonusAttributes.endurance + ($scope.inventoryItem.endurance * pos1orneg1);
      if(localUser.bonusAttributes.endurance < 0) localUser.bonusAttributes.endurance = 0;
      localUser.bonusAttributes.dexterity = localUser.bonusAttributes.dexterity + ($scope.inventoryItem.dexterity * pos1orneg1);
      if(localUser.bonusAttributes.dexterity < 0) localUser.bonusAttributes.dexterity = 0;
      localUser.bonusAttributes.HP = localUser.bonusAttributes.HP + ($scope.inventoryItem.hp * pos1orneg1);
      if(localUser.bonusAttributes.HP < 0) localUser.bonusAttributes.HP = 0;
    };

    //var itemSetFn = function (item, inventoryItem, equipped) { //working here
    var itemSetFn = function (item, inventoryItem) {
      console.log("InventoryDetailCtrl itemSetFn() item:");
      console.log(JSON.stringify(item));

      console.log("InventoryDetailCtrl itemSetFn() inventoryItem:");
      console.log(JSON.stringify(inventoryItem));

      console.log("InventoryDetailCtrl itemSetFn() localUser.equipped:");
      console.log(JSON.stringify(localUser.equipped));

      //var returnItemSet = false;
      var returnItemSet = true;
      var itemTypeText = inventoryItem.type.toLowerCase();
      if (inventoryItem.equipped === false) {
        //equip
        if (itemTypeText === TYPE_ARMOR) {
          //type is armor
          localUser.equipped[TYPE_ARMOR].name = inventoryItem.name; //shop name
          localUser.equipped[TYPE_ARMOR].inventoryId = item.id; //inventory id
        } else {
          //type is weapon or accessory
          if (inventoryItem.size > 1) {
            //replace both slots with item
            localUser.equipped[itemTypeText + '1'].name = inventoryItem.name; //shop name
            localUser.equipped[itemTypeText + '1'].inventoryId = item.id; //inventory id
            localUser.equipped[itemTypeText + '2'].name = inventoryItem.name; //shop name
            localUser.equipped[itemTypeText + '2'].inventoryId = item.id; //inventory id
          } else {
            //find empty slot and replace with item
            if (localUser.equipped[itemTypeText + '1'].name !== '' && localUser.equipped[itemTypeText + '1'].name === localUser.equipped[itemTypeText + '2'].name) {
              //both slots equipped with same item
              localUser.equipped[itemTypeText + '1'].name = inventoryItem.name; //remove item slot2 name
              localUser.equipped[itemTypeText + '1'].inventoryId = item.id; //remove item slot2 id
              localUser.equipped[itemTypeText + '2'].name = ''; //remove item slot2 name
              localUser.equipped[itemTypeText + '2'].inventoryId = ''; //remove item slot2 id
            } else {
              //not sure what to do here yet
              console.log('InventoryDetailCtrl itemSetFn item is size 1 and is not equipped and there are two diff things equipped in slot 1 and 2 and not sure what to remove');
              returnItemSet = false;
          }
          }
        }
      } else {
        //unequip
        if (inventoryItem.size > 1) {
          localUser.equipped[itemTypeText + '1'].name = inventoryItem.name; //remove item slot2 name
          localUser.equipped[itemTypeText + '1'].inventoryId = item.id; //remove item slot2 id
          localUser.equipped[itemTypeText + '2'].name = ''; //remove item slot2 name
          localUser.equipped[itemTypeText + '2'].inventoryId = ''; //remove item slot2 id
        } else {
          if (itemTypeText === TYPE_ARMOR) {
            //type is armor
            localUser.equipped[TYPE_ARMOR].name = ''; //remove shop name
            localUser.equipped[TYPE_ARMOR].inventoryId = ''; //remove inventory id
          } else {
            //find which slots its equipped in
            if (localUser.equipped[itemTypeText + '1'].inventoryId === item.id) {
              //item equipped in slot 1
              localUser.equipped[itemTypeText + '1'].name = ''; //remove item slot2 name
              localUser.equipped[itemTypeText + '1'].inventoryId = ''; //remove item slot2 id
            } else {
              //item equipped in slot 2
              localUser.equipped[itemTypeText + '2'].name = ''; //remove item slot2 name
              localUser.equipped[itemTypeText + '2'].inventoryId = ''; //remove item slot2 id
            }
          }
        }
      }

      /*if (inventoryItem.type.toLowerCase() === TYPE_WEAPON) {
        console.log("item is weapon");
        if (inventoryItem.size === 1) {
          console.log("item size 1");
          if (equipped.weapon1.name === '') {
            console.log("if weapon 1 slot is empty, then equip 1 handed weapon in slot 1");
            returnItemSet = setEquippedItem(SLOT_WEAPON1, parseFloat(inventoryItem._id), inventoryItem.name) //item is the same as inventoryItem
          } else if (equipped.weapon2.name === '') {
            console.log("if weapon 1 slot is not empty, but weapon slot 2 is, then equip 1 handed weapon in slot 2");
            returnItemSet = setEquippedItem(SLOT_WEAPON2, parseFloat(inventoryItem._id), inventoryItem.name)
          } else {
            //change setEquppedItem to allow unequips
            //unequip 
          }

        } else if (inventoryItem.size === 2) {
          console.log("item size 2");
          if (equipped.weapon1.name === '' && equipped.weapon2.name === '') {
            console.log("if weapon 1 slot is empty, and weapon slot 2 is empty, then equip 2 handed weapon in slot 1 & 2");
            returnItemSet = setEquippedItem(SLOT_WEAPON1, parseFloat(inventoryItem._id), inventoryItem.name)
            returnItemSet = setEquippedItem(SLOT_WEAPON2, parseFloat(inventoryItem._id), inventoryItem.name)
          } else {
            //change setEquppedItem to allow unequips
            //unequip
          }
        }
      } else if (inventoryItem.type.toLowerCase() === TYPE_ARMOR) {
        console.log("item is armor");
        if (equipped.armor.name === '') {
          console.log("if no armor equipped, equip armor");
          returnItemSet = setEquippedItem(SLOT_ARMOR, parseFloat(inventoryItem._id), inventoryItem.name)
        }
      } else if (inventoryItem.type.toLowerCase() === TYPE_ACCESSORY) {
        console.log("item is accessory");
        if (equipped.accessory1.name === '') {
          console.log("if accessory 1 slot empty, equip accessory in slot 1");
          returnItemSet = setEquippedItem(SLOT_ACCESSORY1, parseFloat(inventoryItem._id), inventoryItem.name)
        } else if (equipped.accessory2.name === '') {
          console.log("if accessory 1 slot not empty, but slot 2 is, equip accessory in slot 2");
          returnItemSet = setEquippedItem(SLOT_ACCESSORY2, parseFloat(inventoryItem._id), inventoryItem.name)
        }
      }*/
      return returnItemSet;
    };

    //TODO - itemSetFn is being called in both if and else with same params, maybe move it up
    $scope.equipItem = function () { //working here
      if (localItem.equipped === false) {
        //var isItemEquipped = itemSetFn(localItem, $scope.inventoryItem, $scope.user.equipped);
        //var isItemEquipped = itemSetFn(localItem, $scope.inventoryItem, localUser.equipped);
        var isItemEquipped = itemSetFn(localItem, $scope.inventoryItem);
        console.log('equipItem() isItemEquipped: ' + isItemEquipped);
        if (isItemEquipped === true) {
          localItem.equipped = true;
          addRemoveItemAttributes(1);
          //User.update($scope.user);
          User.update(localUser);
          localStorageService.set('userData', localUser);
          $rootScope.$emit("inventoryChange", {});
          util.showAlert($ionicPopup, 'Item Equipped', 'You are ready to wage war against the forces of evil.', 'OK', function () {
            $state.go('app.inventory');
          })
        } else {
          util.showAlert($ionicPopup, 'Remove An Item', 'You are holding too many items. You need to take off an item before you can put this on.', 'OK', function () {
            $state.go('app.inventory');
          })
        }
      } else { //Unequip item
        //var didSetEmpty = itemSetFn(localItem, $scope.inventoryItem, $scope.user.equipped);
        //var didSetEmpty = itemSetFn(localItem, $scope.inventoryItem, localUser.equipped);
        var didSetEmpty = itemSetFn(localItem, $scope.inventoryItem);
        console.log('equipItem() didSetEmpty: ' + didSetEmpty);
        localItem.equipped = false;
        addRemoveItemAttributes(-1);
        //User.update($scope.user);
        User.update(localUser);
        //localStorageService.set('userData', $scope.user);  
        localStorageService.set('userData', localUser);
        $rootScope.$emit("inventoryChange", {});
        util.showAlert($ionicPopup, 'Item Unequipped', 'You have successfully unequipped this item.', 'OK', function () {
          $state.go('app.inventory');
        })
      }
    };

    //TODO - you shouldnt even be able to use hp potion if your health is at max
    $scope.useItem = function () {
      var popupTitle = 'HP Recovered';
      var popupMessage = 'Your HP is recovering!';
      //var totalVitality = $scope.user.attributes.vitality + $scope.user.fitbit.vitality;
      var totalVitality = localUser.attributes.vitality + localUser.fitbit.vitality;
      //var maxHp = util.vitalityToHp(totalVitality, $scope.user.characterClass);
      var maxHp = util.vitalityToHp(totalVitality, localUser.characterClass);

      if (localUser.attributes.HP < maxHp) {
        if (localItem.quantity > 0) {
          //$scope.user.attributes.HP += $scope.inventoryItem.hp;
          localUser.attributes.HP += $scope.inventoryItem.hp;
          /*if ($scope.user.attributes.HP > maxHp) {
            $scope.user.attributes.HP = maxHp;
          }*/
          if (localUser.attributes.HP > maxHp) { //still need this here in case using item, pushed health above max
            localUser.attributes.HP = maxHp;
          }
          // subtract quantity from inventory -> remove if quantity = 0
          localItem.quantity -= 1;
        } else if (localItem.quantity === 0) {
          //$scope.user.inventory.splice(index, 1);
          popupTitle = "useItem Error";
          popupMessage = "item quantity 0";
        }
      } else {
        popupTitle = "HP Max";
        popupMessage = "HP already at max";
      }

      //User.update($scope.user);
      //localStorageService.set('userData', $scope.user);  
      User.update(localUser);
      localStorageService.set('userData', localUser);
      $rootScope.$emit("inventoryChange", {});
      util.showAlert($ionicPopup, popupTitle, popupMessage, 'OK', function () {
        $state.go('app.inventory');
      })
    };

    $scope.checkType = function () {
      if ($scope.inventoryItem.type === TYPE_POTION) {
        return true;
      } else {
        return false;
      }
    };
  });
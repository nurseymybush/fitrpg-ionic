angular.module('mobile.shop.controllers')

.controller('ShopCtrl', function($rootScope, $state, $scope, Shop, $ionicLoading) {
  var loading = setTimeout(function(){
    $ionicLoading.show({
      template: '<p>Loading...</p><i class="icon ion-loading-c"></i>'
    });
  }, 500);

  $scope.rarityColor = function(isRare){
    if(isRare) return "energized";
  };

  $scope.isNotOwned = function(item){
    //TODO - this logic is now in tow places, shop-detail and shop
    var notOwned = true;
    var inventory = $scope.user.inventory;
    for (var i = 0; i < inventory.length; ++i) {
      if (item._id === inventory[i].storeId) {
        notOwned = false;
      }
    }
    return notOwned;
  };

  $scope.getData = function() {
    $scope.shop = [];
    Shop.query( function (items) {
      var userLvl = $scope.user.attributes.level;
      for (var i=0; i<items.length; i++) {
        var item = items[i];
        if (userLvl >= item.level) {
          $scope.shop.push(item);
        }
      }
      clearTimeout(loading);
      $ionicLoading.hide();
    });
  };

  $scope.equipmentTab = 'button-tab-active';
  $scope.equipment = function() {
    $scope.isEquipment = true;
    $scope.equipmentTab = 'button-tab-active';
    $scope.itemsTab = '';
  };

  $scope.potion = function(id) {
    $scope.isEquipment = false;
    $scope.equipmentTab = '';
    $scope.itemsTab = 'button-tab-active';
  };

  $scope.getData();

  $scope.refresh = function(){
    $scope.getData();
    $scope.$broadcast('scroll.refreshComplete');
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

});

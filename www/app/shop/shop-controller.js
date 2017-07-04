angular.module('mobile.shop.controllers')

  .controller('ShopCtrl', function ($rootScope, $state, $scope, Shop, $ionicLoading, localStorageService, $cordovaToast){
    /*var loading = setTimeout(function(){
      $ionicLoading.show({
        template: '<p>Loading...</p><i class="icon ion-loading-c"></i>'
      });
    }, 500);*/
    $scope.$on('$ionicView.enter', function() {
      console.log('ShopCtrl ionicView.enter');
    });

    var localUser = localStorageService.get('userData');
    var inventory;
    if (localUser) {
      inventory = localUser.inventory;
      $scope.userGold = localUser.attributes.gold;
    } else {
      User.get({
        id: localStorageService.get('userId')
      }, function (user) {
        inventory = user.inventory;
      }, function(error){
        console.log('ShopCtrl User.get error:');
        console.log(error);
      });
    }

    $scope.rarityColor = function (isRare) {
      if (isRare) return "energized";
    };

    $scope.isNotSeen = function (item) {
      //TODO - this logic is now in tow places, shop-detail and shop
      var notSeen = true;
      //var inventory = $scope.user.inventory;
      var seenItems = localUser.seenItems;
      for (var i = 0; i < seenItems.length; ++i) {
        if (item._id === seenItems[i]) {
          notSeen = false;
        }
      }
      return notSeen;
    };

    $scope.isOwned = function (item) {
      //TODO - this logic is now in tow places, shop-detail and shop
      var isOwned = false;
      //var inventory = $scope.user.inventory;
      var ownedItems = localUser.inventory;
      for (var i = 0; i < ownedItems.length; ++i) {
        if (item._id === ownedItems[i].storeId) {
          isOwned = true;
        }
      }
      return isOwned;
    };

    //TODO - using this in main-controller now too, maybe a refactor would be appropriate
    $scope.getData = function () {
      $scope.shop = [];
      Shop.query(function (items) {
        //var userLvl = $scope.user.attributes.level;
        var userLvl = localUser.attributes.level;
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (userLvl >= item.level) {
            $scope.shop.push(item);
          }
        }
        //clearTimeout(loading);
        $ionicLoading.hide();
      });
    };

    $scope.equipmentTab = 'button-tab-active';
    $scope.equipment = function () {
      $scope.isEquipment = true;
      $scope.equipmentTab = 'button-tab-active';
      $scope.itemsTab = '';
    };

    $scope.potion = function (id) {
      $scope.isEquipment = false;
      $scope.equipmentTab = '';
      $scope.itemsTab = 'button-tab-active';
    };

    $scope.getData();

    $scope.refresh = function () {
      //console.log('shop-controller refresh() force go to auth page');
      //location.href = "#/app/auth"; //go to auth state, leaves header
      //$state.transitionTo('auth');
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

    $scope.toggleList = function (list) {
      $scope.showList[list] = !$scope.showList[list];
    };

  });
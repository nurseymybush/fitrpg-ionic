angular.module('mobile.main.controllers')

.controller('CharacterCtrl', function(
  $rootScope,
  $scope,
  $state,
  $ionicLoading,
  $ionicNavBarDelegate,
  $ionicPopup,
  $ionicPlatform,
  User,
  Shop,
  Quests,
  TimesData,
  DatesData,
  Refresh,
  Settings,
  localStorageService,
  $window,
  $cordovaToast) {

  // initialize $rootScope.user to eliminate console errors before authentication
  //var loading = setTimeout(function() {
  //  $ionicLoading.show({
  //    template: '<p>Loading...</p><i class="icon ion-loading-c"></i>'
  //  });
  //}, 500);

  $scope.calculatedData = {};
  $scope.alertCount = 0;
  $scope.showAlert = false;

  var device = {
    isApple: ionic.Platform.isIOS(),
    isGoogle: ionic.Platform.isAndroid(),
  };

  var addAlert = function(status, name) {
    name = name || '';
    var type, msg;
    if (status === 'loss') {
      type = 'danger';
      msg = 'Looks like you need to work out more. You lost to ' + name + '.';
    } else if (status === 'win') {
      type = 'success';
      msg = 'You beat ' + name + '. You gained experience and gold.'
    } else if (status === 'request') {
      type = '';
      msg = 'Someone wants to battle you.';
    }
    $scope.alertCount++;
    $scope.alerts.push({
      type: type,
      msg: msg
    });
  };

  var addLevelUpAlert = function() {
    var type, msg;
    type = 'success';
    msg = 'You leveled up! You\'ve gained skill points to increase your attributes.';
    $scope.alertCount++;
    $scope.levelUpAlerts.push({
      type: type,
      msg: msg
    });
  };

  var addFriendRequestAlert = function() {
    var type, msg;
    type = 'success';
    msg = 'You have a new friend request. Click here to view the requests.';
    $scope.alertCount++;
    $scope.friendRequestAlerts.push({
      type: type,
      msg: msg
    });
  };

  var addNewItemAlert = function() {
    var type, msg;
    type = 'success';
    msg = 'There are new item(s) in the Shop.';
    $scope.alertCount++;
    $scope.newItemAlerts.push({
      type: type,
      msg: msg
    });
  };

  var addQuestAlert = function(quest) {
    var type, msg;
    if (quest.status === 'success') {
      type = 'success';
      msg = 'You completed your quest to ' + quest.shortDesc.toLowerCase() + ' You won ' + quest.gold + " pieces!";
    } else if (quest.status === 'fail') {
      type = 'danger';
      msg = 'Sorry, you didn\'t finish your quest to ' + quest.shortDesc.toLowerCase() + ' You lost gold. Try again in a few days.'
    }
    $scope.alertCount++;
    $scope.questAlerts.push({
      type: type,
      msg: msg
    });
  };

  $scope.displayAlerts = function() {
    $scope.alertCount = 0;
    $scope.showAlert = true;
  }

  $scope.closeAlertsRefactored = function(index, alertContainer) {
    console.log(alertContainer);
    alertContainer.splice(index, 1);
  }

  /*
  $scope.closeAlert = function (index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.closeLevelUpAlert = function (index) {
    $scope.levelUpAlerts.splice(index, 1);
  };

  $scope.closeFriendRequestAlert = function (index) {
    $scope.friendRequestAlerts.splice(index, 1);
  };

  $scope.closeQuestAlert = function (index) {
    $scope.questAlerts.splice(index, 1);
  };
  */
  $scope.goToPotions = function(current, max) {
    if (current < max) {
      $state.go('app.inventory');
    } else {
      $cordovaToast.showShortBottom('You are at full HP.');
    }
  };

  var calculateData = function(user) { //adding bonusAttributes to userAttributes and fitbitAttributes
    //$scope.calculatedData is what gets shown to the user in main page
    console.log('in calculateData');
    if (user.attributes != undefined) {
      console.log('in if(user.attributes != undefined)');
      $scope.calculatedData.currentXp = Math.floor(util.currentLevelExp(user.attributes.level, user.fitbit.experience + user.attributes.experience));

      $scope.calculatedData.requiredXp = util.nextLevelExp(user.attributes.level);
      $scope.calculatedData.strength = user.attributes.strength + user.fitbit.strength + user.bonusAttributes.strength;
      $scope.calculatedData.vitality = user.attributes.vitality + user.fitbit.vitality + user.bonusAttributes.vitality;
      $scope.calculatedData.dexterity = user.attributes.dexterity + user.fitbit.dexterity + user.bonusAttributes.dexterity;
      $scope.calculatedData.endurance = user.attributes.endurance + user.fitbit.endurance + user.bonusAttributes.endurance;
      $scope.calculatedData.maxHp = util.vitalityToHp($scope.calculatedData.vitality, $scope.user.characterClass); //change to $scope.user.characterClass
      user.attributes.HP += user.fitbit.HPRecov + user.bonusAttributes.HP;

      console.log('MaxHP');
      console.log($scope.calculatedData.maxHp);
      console.log('HP');
      console.log(user.attributes.HP);

      user.fitbit.HPRecov = 0;
      if (user.attributes.HP > $scope.calculatedData.maxHp) {
        user.attributes.HP = $scope.calculatedData.maxHp;
      }
      if (user.attributes.gold < 0) {
        user.attributes.gold = 0;
      }
    }
  };

  var getAllAlerts = function() {
    alertBattleStatus();
    alertLevelUpStatus();
    alertFriendRequestStatus();
    alertQuestStatus();
    alertNewShopItem();
  };

  //chance add 11/5 - still working
  var alertNewShopItem = function() {
    $scope.newItemAlerts = [];
    var userInventory = $scope.user.inventory; //alias var for inventory
    $scope.user.seenItems = $scope.user.seenItems ? $scope.user.seenItems : []; //if seenItems doesnt exist, create it

    console.log("seenItems");
    console.log($scope.user.seenItems);

    var userTempSeenItems = [];

    //push all seenItems into temp array
    for (var i = 0; i < $scope.user.seenItems.length; ++i) {
      //console.log('pushing ' + $scope.user.seenItems[i] + ' into userTempSeenItems');
      userTempSeenItems.push($scope.user.seenItems[i]);
    }

    //for every item in the users inventory, if the item id is not in userTempSeenItems then add it
    for (var i = 0; i < userInventory.length; ++i) {
      //if(!userTempSeenItems.includes(userInventory[i].storeId)){//includes is ecmascript6
      if (_.contains(userTempSeenItems, userInventory[i].storeId) === false) {
        //console.log('pushing ' + userInventory[i].storeId + ' into userTempSeenItems');
        userTempSeenItems.push(userInventory[i].storeId);
      }
    }

    //set seenItems to temp
    $scope.user.seenItems = userTempSeenItems;

    //get all items from shop
    var shopItems = [];
    Shop.query(function(items) {//everything needs to be done inside the .success
      shopItems = items;
      //check if user.seenItems contains each shopItem - if not then add new item Alert
      for (var i = 0; i < shopItems.length; ++i) {
        //if(!$scope.user.seenItems.includes(shopItems[i]._id)){
        if (_.contains($scope.user.seenItems, shopItems[i]._id) === false) {
          console.log(shopItems[i]._id + ' is not in seenItems. Adding alert.');
          addNewItemAlert();
        }
      }
      User.update($scope.user);
    });
  };

  var alertBattleStatus = function() {
    $scope.alerts = [];
    var listOfIndices = [];
    var alertWin = false;
    var alertLoss = false;
    var alertRequest = false;
    //TODO - missionsVersus is undefined 
    if ($rootScope.user.missionsVersus != undefined) {

      for (var i = 0; i < $rootScope.user.missionsVersus.length; i++) {
        var alertMission = function(index) {
          var mission = $rootScope.user.missionsVersus[index];
          if (mission.type === 'battle') {
            if (mission.status === 'win' || mission.status === 'loss') {
              User.get({
                id: mission.enemy
              }, function(enemy) {
                addAlert(mission.status, enemy.profile.displayName);
              });
              listOfIndices.push(index);
            } else if (mission.status === 'request' && !alertRequest) {
              alertRequest = true;
              addAlert(mission.status);
            }
          }
        };
        alertMission(i);
      }


      var removeMission = function(index, count) {
        if (count < listOfIndices.length) {
          $rootScope.user.missionsVersus.splice(index - count, 1);
          removeMission(listOfIndices[count + 1], count + 1);
        }
      };

      if (listOfIndices.length > 0) {
        removeMission(listOfIndices[0], 0);
      }
    }

  };

  var alertLevelUpStatus = function() {
    $scope.levelUpAlerts = [];
    var userLevel = localStorageService.get('level');
    var currentLevel = $rootScope.user.attributes.level;
    if (!userLevel) {
      userLevel = localStorageService.set('level', 1);
    }
    if (userLevel < currentLevel) {
      localStorageService.set('level', currentLevel);
      addLevelUpAlert();
    }
  };

  var alertFriendRequestStatus = function() {
    $scope.friendRequestAlerts = [];
    var alertRequest = false;
    if ($rootScope.user.friendRequests) {
      for (var i = 0; i < $rootScope.user.friendRequests.length; i++) {
        var request = $rootScope.user.friendRequests[i];
        if (request.status === 'request' && !alertRequest) {
          alertRequest = true;
          addFriendRequestAlert();
        }
      }
    }
  };

  var alertQuestStatus = function() {
    $scope.questAlerts = [];
    var today = parseInt(Date.parse(new Date()));
    for (var j = 0; j < $rootScope.user.quests.length; j++) {
      (function(i) {
        var quest = $rootScope.user.quests[i];
        if (quest.status === 'active') {
          var completeDate = parseInt(Date.parse(quest.completionTime));
          if (today >= completeDate) {
            if (quest.numDays < 1) {
              TimesData.get(quest.getObj, function(result) {
                var total = result.total;
                if (total >= quest.winGoal) {
                  $rootScope.user.quests[i].status = 'success';
                  $rootScope.user.attributes.gold += quest.gold;
                } else {
                  $rootScope.user.quests[i].status = 'fail';
                  $rootScope.user.attributes.gold = $rootScope.user.attributes.gold - Math.floor(quest.gold / 3);
                }
                User.update($rootScope.user);
                addQuestAlert(quest);
              });
            } else if (quest.numDays > 0) {
              DatesData.get(quest.getObj, function(result) {
                var total = result.total;
                if (total >= quest.winGoal) {
                  $rootScope.user.quests[i].status = 'success';
                  $rootScope.user.attributes.gold += quest.gold;
                } else {
                  $rootScope.user.quests[i].status = 'fail';
                  $rootScope.user.attributes.gold = $rootScope.user.attributes.gold - Math.floor(quest.gold / 3);
                }
                User.update($rootScope.user);
                addQuestAlert(quest);
              });
            }
          }
        }
      }(j));
    }
  };

  var setWeapons = function() {
    var defaultWeapon = function(location) {
      $rootScope.user.equipped[location] = {};
      $rootScope.user.equipped[location].name = '';
      $rootScope.user.equipped[location].inventoryId = null;
    };

    if (!$rootScope.user.equipped) {
      $rootScope.user.equipped = {};
      defaultWeapon('weapon1');
      defaultWeapon('weapon2');
      defaultWeapon('armor');
      defaultWeapon('accessory1');
      defaultWeapon('accessory2');
    }
  }

  //var localUserIdTemp = localStorageService.get('userId');
  //var localUserId = localUserIdTemp.slice(0, localUserIdTemp.length - 4);
  var localUserId = localStorageService.get('userId'); //chance try
  console.log('main-controller() localUserId(): ' + localUserId); //'2Q2TVT'; //
  var userData = localStorageService.get('userData');
  if(userData){
    console.log('main-controller() localUserData exists');
    $rootScope.user = userData;
    calculateData($rootScope.user);
  } else {
    console.log('main-controller() localUserData doesnt exist');
    refresh();
  }


  var checkNewData = function() {
    User.get({
      id: localUserId
    }, function(user) {
      console.log('in checkNewData');
      $rootScope.user = user;
      setWeapons();
      getSettings();
      if (user.needsUpdate === true) {
        console.log('in if(user.needsUpdate === true)');
        Refresh.get({
          id: localUserId
        }, function() {
          User.get({
            id: localUserId
          }, function(user) {
            console.log('needed a new update');
            $rootScope.user = user;
            calculateData($rootScope.user);
            getAllAlerts();
            //alertBattleStatus();
            //alertLevelUpStatus();
            //alertFriendRequestStatus();
            //alertQuestStatus();
            $rootScope.user.needsUpdate = false;
            User.update($rootScope.user);
            localStorageService.set('userData', $rootScope.user);
            //clearTimeout(loading);
            $ionicLoading.hide();
          });
        });
      } else {
        console.log('did not need a new update');
        alertBattleStatus();
        calculateData($rootScope.user);
        User.update($rootScope.user);
        localStorageService.set('userData', $rootScope.user);
        clearTimeout(loading);
        $ionicLoading.hide();
      }
    });
  }

  var refresh = function() {
    console.log('refresh() userId :' + localUserId);
    Refresh.get({
      id: localUserId
    }, function() { // this will tell fitbit to get new data
      User.get({
        id: localUserId
      }, function(user) { // this will retrieve that new data
        console.log('refresh() user:');
        console.log(user);
        $rootScope.user = user;
        calculateData($rootScope.user);
        $scope.alertCount = 0;
        $scope.showAlert = false;
        getAllAlerts();
        //alertBattleStatus();
        //alertLevelUpStatus();
        //alertFriendRequestStatus();
        User.update($rootScope.user);
        localStorageService.set('userData', $rootScope.user);
        //clearTimeout(loading); //chance add because infinite loading symbol
        $ionicLoading.hide(); //ditto
        $scope.$broadcast('scroll.refreshComplete');
      });
    });
    //getSettings();
  };

  $scope.refresh = refresh;

  //checkNewData();
  //document.addEventListener("resume", checkNewData, false); //whenever we resume the app, retrieve new data if there is any

  //TODO - skillPts is undefined
  //this is running before checkNewData() because of the attribute listing in char.html
  $scope.hasSkillPoints = function() {
    console.log('in $scope.hasSkillPoints()');
    if ($rootScope.user.attributes.skillPts != undefined) {
      if ($rootScope.user && $rootScope.user.attributes.skillPts > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  $scope.applyAttributes = function(attr) {
    if ($rootScope.user.attributes.skillPts != undefined) {
      if ($rootScope.user.attributes.skillPts > 0) {
        $rootScope.user.attributes[attr]++;
        $rootScope.user.attributes.skillPts--;
        if (attr === 'vitality') {
          // change char class from warrior to user class
          // $rootScope.user.attributes.hp = util.vitalityToHp($rootScope.user.attributes.vitality,'warrior');
          $scope.calculatedData.maxHp = util.vitalityToHp($rootScope.user.attributes.vitality, 'warrior');
        }
        calculateData($rootScope.user);
        // update database
        User.update($rootScope.user);
      }
    }
  };

  $scope.isEquipped = function(slot) {
    var user = $rootScope.user;
    if (user && user.equipped[slot].inventoryId !== null) {
      return true;
    } else {
      return false;
    }
  };

  //TODO: since i am using this on the inventory page, this should be refactored
  $scope.unequip = function(slot) {
    var inventory = $rootScope.user.inventory;
    var inventoryId = $rootScope.user.equipped[slot].inventoryId;

    var empty = function(location) {
      $rootScope.user.equipped[location].name = '';
      $rootScope.user.equipped[location].inventoryId = null;
    };

    if (slot === 'weapon1' || slot === 'weapon2') {
      if ($rootScope.user.equipped['weapon1'].inventoryId === $rootScope.user.equipped['weapon2'].inventoryId) {
        empty('weapon1');
        empty('weapon2');
      }
    }

    empty(slot);

    var storeId;
    for (var i = 0; i < inventory.length; i++) {
      if (inventory[i].id === inventoryId) {
        inventory[i].equipped = false;
        storeId = inventory[i].storeId;
      }
    }

    Shop.get({
      id: storeId
    }, function(item) { //maybe make addRemoveItemAttribute a service so can be used here
      $rootScope.user.bonusAttributes.strength -= item.strength;
      $rootScope.user.bonusAttributes.vitality -= item.vitality;
      $rootScope.user.bonusAttributes.endurance -= item.endurance;
      $rootScope.user.bonusAttributes.dexterity -= item.dexterity;
      $rootScope.user.bonusAttributes.HP -= item.hp;
      calculateData($rootScope.user);
      User.update($rootScope.user);
    })

  };

  $scope.equip = function(slot) {};

  $scope.navTo = function(location) {
    $state.go('app.' + location);
  };

  var showIncentive = false;

  var getSettings = function() {
    var platform;
    if (device.isApple) {
      platform = 'ios';
    } else if (device.isGoogle) {
      platforom = 'android'
    }
    Settings.get({
      platform: platform
    }, function(item) {
      showIncentive = item.incentive;
    });
  };

  //getSettings();

  $scope.rateApp = function() {
    var title = 'Having Fun?';
    var body;
    if (localStorageService.get('rate') || !showIncentive) {
      body = 'Let us know what you think and what features you want added!';
    } else {
      body = 'Leave some feedback for us and get 500 GOLD! Good or bad we want to hear from you so we can continue to add to and improve the game.';
    }
    var likeBtn = '<i class="icon ion-thumbsup"></i>';
    var hateBtn = '<i class="icon ion-thumbsdown"></i>';
    var cancelBtn = '<i class="icon ion-close"></i>';
    util.showPopup($ionicPopup, title, body, hateBtn, likeBtn, cancelBtn,
      function() {
        if (!localStorageService.get('rate')) {
          localStorageService.set('rate', true);
          $rootScope.user.attributes.gold += 500;
          User.update($rootScope.user);
        }
        if (device.isApple) {
          $window.open('http://itunes.apple.com/app/id887067605', '_system');
        } else if (device.isGoogle) {
          $window.open('http://play.google.com/store/apps/details?id=com.fatchickenstudios.fitrpg', '_system');
        }
      },
      function() {
        $scope.navTo('feedback');
      }
    )
  };
})
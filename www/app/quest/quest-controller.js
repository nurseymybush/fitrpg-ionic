angular.module('mobile.quest.controllers')

  // This controller handles the list of the quests that show up as all,active,and completed
  .controller('QuestCtrl', function ($scope, $ionicLoading, $ionicScrollDelegate, localStorageService, SoloMissions, Quests, User, TimesData, DatesData, $rootScope) {

    $scope.allTab = 'button-tab-active';
    var localUser, userQuests;
    
    var refreshUser = function () {
      localUser = localStorageService.get('userData');
      if (localUser) {
        userQuests = localUser.quests;
      } else {
        User.get({
          id: localStorageService.get('userId')
        }, function (user) {
          userQuests = user.quests;
        });
      }
    }

    $rootScope.$on("questChange", function (event, args) {
      console.log('QuestCtrl $rootScope.$on onQuestChange');
      $scope.refresh();
    });


    $scope.all = function () {
      refreshUser();
      // Creates the loading screen that only shows up after 500 ms if items have not yet loaded
      /*var loading = setTimeout(function() {
        $ionicLoading.show({
          template: '<p>Loading...</p><i class="icon ion-loading-c"></i>'
        });
      }, 500);*/

      $scope.isAll = true;
      $scope.isActive = false;
      $scope.isComplete = false;
      $scope.quests = [];
      $scope.availableQuests = [];
      $scope.allTab = 'button-tab-active';
      $scope.activeTab = '';
      $scope.completedTab = '';
      $ionicScrollDelegate.scrollTop();

      // Create an array of ids of quests the user is currently doing
      var currentQuests = [];
      for (var i = 0; i < userQuests.length; ++i) {
        //for (var i = 0; i < $scope.user.quests.length; i++) {
        //currentQuests.push($scope.user.quests[i].questId);
        currentQuests.push(userQuests[i].questId);
      }
      // Compare all quests against this array and only display them if they're not on it
      Quests.query(function (quests) {
        $scope.quests = quests;
        for (var i = 0; i < $scope.quests.length; i++) {
          var index = currentQuests.indexOf($scope.quests[i]._id);
          if (index < 0) {
            console.log('quest not found in list, id:' + $scope.quests[i]._id);
            $scope.availableQuests.push($scope.quests[i]);
          }
        }
        //clearTimeout(loading);
        //$ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    // Show all of the quests that are active
    $scope.active = function () {
      $scope.isAll = false;
      $scope.isActive = true;
      $scope.isComplete = false;
      $scope.allTab = '';
      $scope.activeTab = 'button-tab-active';
      $scope.completedTab = '';
      $ionicScrollDelegate.scrollTop();

      var today = new Date();
      $scope.quests = [];
      for (var i = 0; i < userQuests.length; ++i) {
        //for (var i = 0; i < $scope.user.quests.length; i++) {
        //if ($scope.user.quests[i].status === 'active') {
        if (userQuests[i].status === 'active') {
          (function (i) {
            Quests.get({
              //id: $scope.user.quests[i].questId
              id: userQuests[i].questId
            }, function (q) {
              $scope.quests.push(q);
            });
          }(i));
        }
      }
    };

    // Show all of the quests that have already been completed in the last week
    $scope.completed = function () {
      $scope.isAll = false;
      $scope.isActive = false;
      $scope.isComplete = true;
      $scope.successfulQuests = [];
      $scope.failedQuests = [];
      $scope.allTab = '';
      $scope.activeTab = '';
      $scope.completedTab = 'button-tab-active';
      $ionicScrollDelegate.scrollTop();
      var today = new Date();
      var refreshQuests = [];

      // Iterate over all the quests that the user has stored; maybe eventually just save them
      // locally to the user object
      //for (var j = 0; j < $scope.user.quests.length; j++) {
      for (var j = 0; j < userQuests.length; ++j) {
        (function (i) {
          //var quest = $scope.user.quests[i];
          var quest = userQuests[i];
          var completeDate = new Date(quest.completionTime); //convert date to matched format
          // Iterate over all the quests and get the ones that have status of completed
          if (quest.status === 'success' || quest.status === 'fail') {
            //if (quest.status === 'success') {
            // if 7 days have passed since this was completed, they can do it again so we remove it from their user array
            if (completeDate.addDays(7) > today) {
              refreshQuests.push(quest);
              Quests.get({
                id: quest.questId
              }, function (q) {
                q.completionTime = quest.completionTime; //add completion time so we can sort them
                if (quest.status === 'success') {
                  $scope.successfulQuests.push(q);
                } else {
                  $scope.failedQuests.push(q);
                }
              });
            }
          } else {
            refreshQuests.push(quest);
          }
        }(j));
      }

      //$scope.user.quests = refreshQuests;
      //User.update($scope.user);
      //localStorageService.set('userData', $scope.user);
      localUser.quests = refreshQuests;
      User.update(localUser);
      localStorageService.set('userData', localUser);
    };

    $scope.all();

    //chance add to refresh quest list start
    $scope.refresh = function () {
      $scope.all();
    }
    //chance add to refresh quest list end

    $scope.showList = {
      steps: true,
      distance: true,
      strength: true,
      sleep: true,
      succeed: true,
      fail: true
    }

    $scope.toggleList = function (list) {
      $scope.showList[list] = !$scope.showList[list];
    };

  });
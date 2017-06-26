angular.module('mobile.friends.controllers')

.controller('FriendsCtrl', function($scope, $state, User, $ionicLoading, $ionicListDelegate, $ionicPopup, $q, localStorageService) {
  // friends is accessed from $rootScope.user
  $scope.friends = [];
  $scope.friendRequests = [];
  var localUser = localStorageService.get('userData');
  var localFriendRequests = localUser.friendRequests;

  $scope.showList = {
    friend: true,
    pending: true,
    request: true,
  };

  //chance add to refresh friends list start
  $scope.refresh = function() {
    console.log('refreshing friends list');
    $scope.friends = [];
    $scope.friendRequests = [];
    //for (var i = 0; i < $scope.user.friends.length; i++) {
    for (var i = 0; i < localUser.friends.length; i++) {
      //var friend = $scope.user.friends[i];
      var friend = localUser.friends[i];
      User.get({
        id: friend
      }, function(user) {
        if (user._id) {
          $scope.friends.push(user);
          $scope.hasFriends = true;
        }
        stopLoading();
      });
    }
    
    //if ($scope.user.friendRequests) {
    if(localFriendRequests){
      //for (var i = 0; i < $scope.user.friendRequests.length; i++) {
      for (var i = 0; i < localFriendRequests.length; i++) {
        //var friendRequest = $scope.user.friendRequests[i];
        var friendRequest = localFriendRequests[i];
        var getFriend = function(request) {
          User.get({
            id: friendRequest.id
          }, function(friend) {
            friend.requestStatus = request.status;
            $scope.friendRequests.push(friend);
          });
        };
        getFriend(friendRequest);
      }
    }
    $scope.$broadcast('scroll.refreshComplete');
  };
  //chance add to refresh friends list end

  $scope.toggleList = function(list) {
    $scope.showList[list] = !$scope.showList[list];
  };

  //var loading = setTimeout(function() {
   // $ionicLoading.show({
      //template: '<p>Loading...</p><i class="icon ion-loading-c"></i>'
    //});
  //}, 500);

  var stopLoading = function() {
    //clearTimeout(loading);
    $ionicLoading.hide();
  };

  //if ($scope.user.friends.length === 0) {
  if (localUser.friends.length === 0) {
    stopLoading();
  }

  //for (var i = 0; i < $scope.user.friends.length; i++) {
  for (var i = 0; i < localUser.friends.length; i++) {
    //var friend = $scope.user.friends[i];
    var friend = localUser.friends[i];
    User.get({
      id: friend
    }, function(user) {
      if (user._id) {
        $scope.friends.push(user);
        $scope.hasFriends = true;
      }
      stopLoading();
    });
  }

  //if ($scope.user.friendRequests) {
  if(localFriendRequests){
    //for (var i = 0; i < $scope.user.friendRequests.length; i++) {
    for (var i = 0; i < localFriendRequests.length; i++) {
      //var friendRequest = $scope.user.friendRequests[i];
      var friendRequest = localUser.friendRequests[i];
      var getFriend = function(request) {
        User.get({
          id: friendRequest.id
        }, function(friend) {
          friend.requestStatus = request.status;
          $scope.friendRequests.push(friend);
        });
      };
      getFriend(friendRequest);
    }
  }

  //TODO - use this in place of the below 2
  var removeFriendOrRequest = function(user, friendId, type){
    var index;
    for (var i = 0; i < user[type].length; i++) {
      var friendOrRequest = user[type][i];
      if (friendOrRequest.id === friendId) {
        index = i;
      }
    }
    user[type].splice(index, 1);
  };

  //TODO - refactor this and removeFriend into 1 function
  var removeFriendRequest = function(user, friendId) {
    var index;
    for (var i = 0; i < user.friendRequests.length; i++) {
      var friendRequest = user.friendRequests[i];
      if (friendRequest.id === friendId) {
        index = i;
      }
    }
    user.friendRequests.splice(index, 1);
  };

  var removeFriend = function(user, friendId) {
    var index;
    for (var i = 0; i < user.friends.length; i++) {
      var friend = user.friends[i];
      if (friend.id === friendId) {
        index = i;
      }
    }
    user.friends.splice(index, 1);
  };

  $scope.friendPrompt = function(index) {
    var friend = $scope.friendRequests[index];
    var title = 'Friend Request';
    var body = friend.username + ' wants to add you as their friend.';
    util.showPrompt($ionicPopup, title, body, 'Accept', 'Reject',
      function() {
        $scope.acceptFriend(index);
      },
      function() {
        $scope.rejectFriend(index);
      }
    );
  };

  $scope.acceptFriend = function(index) {
    var friend = $scope.friendRequests[index];
    //$scope.user.friends.push(friend._id);
    localUser.friends.push(friend._id);
    $scope.friends.push(friend);

    //removeFriendRequest($scope.user, friend._id);
    removeFriendRequest(localUser, friend._id);
    $scope.friendRequests.splice(index, 1);

    User.get({
      id: friend._id
    }, function(user) {
      //removeFriendRequest(user, $scope.user._id);
      removeFriendRequest(user, localUser._id);
      //user.friends.push($scope.user._id);
      user.friends.push(localUser._id);
      User.update(user);
    });
    //User.update($scope.user);
    User.update(localUser);
    localStorageService.set('userData', localUser);
  };

  $scope.rejectFriend = function(index) {
    var friend = $scope.friendRequests[index];

    //removeFriendRequest($scope.user, friend._id);
    removeFriendRequest(localUser, friend._id);
    $scope.friendRequests.splice(index, 1);

    User.get({
      id: friend._id
    }, function(friend) {
      //removeFriendRequest(friend, $scope.user._id);
      removeFriendRequest(friend, localUser._id);
      User.update(friend);
    });
    //User.update($scope.user);
    User.update(localUser);
    localStorageService.set('userData', localUser);
  };

  var removeMissions = function(user, friendId) {
    var index;
    for (var i = 0; i < user.missionsVersus.length; i++) {
      var mission = user.missionsVersus[i];
      if (mission.enemy === friendId) {
        index = i;
      }
    }
    user.missionsVersus.splice(index, 1);
  };

  $scope.unfriend = function(friendId) {
    console.log("in unfriend");
    //removeFriend($scope.user, friendId);//remove friend from friend list
    //removeMissions($scope.user, friendId);
    removeFriend(localUser, friendId);
    removeMissions(localUser, friendId);
    
    User.get({
      id: friendId
    }, function(friend) {
      //removeFriend(friend, $scope.user._id);  //remove friend from your friendList and you from your friend's friendList
      //removeMissions(friend, $scope.user._id);
      removeFriend(friend, localUser._id);  //remove friend from your friendList and you from your friend's friendList
      removeMissions(friend, localUser._id);
      User.update(friend);//updated friends user object on server
    });
    
    //User.update($scope.user);
    User.update(localUser);
    localStorageService.set('userData', localUser);

    var title = 'Unfriend';
    var body = 'Successfully removed friend';
    util.showAlert($ionicPopup, title, body, 'OK', function() {
      $ionicListDelegate.closeOptionButtons();
    });
    $scope.refresh();
  };

  $scope.hasFriends = false;
  $scope.navTo = function(location) {
    $state.go('app.' + location);
  };

  $scope.requestBattle = function(friendId) {
    var title;
    var body;
    //if ($scope.user.attributes.HP === 0) {
    if (localUser.attributes.HP === 0) {
      title = 'Unfit for Battle';
      body = 'You don\'t look so good. You need to recover some of your health before you can battle again.';
    } else {
      var battleExists = false;

      //for (var i = 0; i < $scope.user.missionsVersus.length; i++) {
      for (var i = 0; i < localUser.missionsVersus.length; i++) {
        //var mission = $scope.user.missionsVersus[i];
        var mission = localUser.missionsVersus[i];
        if (mission.enemy === friendId) {
          battleExists = true;
        }
      }

      if (!battleExists) {
        // update $scope.battle to reflect status of pending with friend
        //$scope.user.missionsVersus.push({
        localUser.missionsVersus.push({
          type: 'battle',
          enemy: friendId,
          status: 'pending'
        });
        // post to database to update friends battle status
        //User.update($scope.user);
        User.update(localUser);
        localStorageService.set('userData', localUser);

        for (var i = 0; i < $scope.friends.length; i++) {
          var friend = $scope.friends[i];
          if (friend['_id'] === friendId) {
            friend.missionsVersus.push({
              type: 'battle',
              //enemy: $scope.user['_id'],
              enemy: localUser['_id'],
              status: 'request'
            });
            User.update(friend);
          }
        }
        title = 'Request Sent';
        body = 'Your battle request has been sent. You can still equip new weapons or train more until the battle request is accepted.';
      } else {
        title = 'Battle Pending';
        body = 'You are already have a request to do battle with this friend.';
      }
    }
    util.showAlert($ionicPopup, title, body, 'OK', function() {
      $ionicListDelegate.closeOptionButtons();
    });
  };
});
angular.module('mobile.leaderboard.controllers')

.controller('LeaderboardCtrl', function($scope, $ionicLoading, User, Leaderboard, localStorageService) {

  $scope.user = localStorageService.get('userData');

  $scope.allTab = 'button-tab-active';
  $scope.all = function() {
    $scope.allTab = 'button-tab-active';
    $scope.friendsTab = '';
    $scope.leaderboard = [];
    Leaderboard.query(function(users) {
      $scope.leaderboard = users;
      $ionicLoading.hide();
    })
  };

  $scope.friends = function() {
    $scope.allTab = '';
    $scope.friendsTab = 'button-tab-active';
    $scope.leaderboard = [];
    $scope.leaderboard.push($scope.user);
    for(var i = 0; i < $scope.user.friends.length; ++i){
      User.get(
        {
          id : $scope.user.friends[i]
        }
      ,function(user) {
        console.log(user);//print friend
        if (user['_id']) {
          $scope.leaderboard.push(user);
        }
      })
    }
  };

  $scope.all();
});

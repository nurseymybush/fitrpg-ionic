angular.module('mobile.authentication.controllers')

.controller('AuthenticationController', function($scope, $state, $ionicLoading, User, localStorageService) {
  // Check our local storage for the proper credentials to ensure we are logged in, this means users can't get past app unless they select a username
  var localStorageToken = localStorageService.get('fitbit-token');
  var localStorageTokenDate = JSON.parse(localStorageService.get('token-date'));

  console.log("Start of Authentication");
  if (localStorageService.get('username')) {
    console.log("Entered if username exists");
    if (localStorageToken && isTokenInDate(localStorageTokenDate)) {
      console.log("Entered token exists and is in date");
      $state.transitionTo('app.character');
      $scope.Authenticated = true;
    } else {
      //refresh token stuff here
      console.log('Entered either fitbit-token is unset or the token is expired');
      $scope.needsAuthentication = true;
    }
  } else if (localStorageToken && isTokenInDate(localStorageTokenDate)) {
    console.log('Entered username doesnt exists but token does and is in date');

    $ionicLoading.show({
      template: '<p>loading...</p><i class="icon ion-loading-c"></i>',
      animation: 'fade-in',
      showBackdrop: false,
      maxWidth: 200,
      showDelay: 100
    });

    User.get({
      id: localStorageService.get('userId')
    }, function(user) {
      if (user.username === undefined) {
        $ionicLoading.hide();
        $state.transitionTo('username');
        $scope.Authenticated = true;
      } else {
        $ionicLoading.hide();
        $state.transitionTo('app.character');
        $scope.Authenticated = true;
      }
    });
  } else {
    console.log('Entered username doesnt exists and neither does token or is not in date');

    $scope.needsAuthentication = true;
  }

  $scope.logout = function() {
    localStorageService.clearAll();
    location.href = location.pathname;
  };

});

var isTokenInDate = function(tokenDateString) {
  //var oneHour = 1;
  var sevenDays = 7;
  var tokenDate = new Date(tokenDateString);
  if (tokenDate) {
    var today = new Date();
    var timeDiff = Math.abs(today.getTime() - tokenDate.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    //var diffHours = Math.ceil(timeDiff / (1000 * 3600));
    if(diffDays > sevenDays) {
    //if (diffHours > oneHour) {
      console.log("token is more than " + sevenDays + " days old.");
      return false;
    } else { //token is valid
      return true;
    }
  } else {
    console.log("tokenDate is null or invalid");
    return false;
  }
};
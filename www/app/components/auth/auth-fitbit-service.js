angular.module('mobile.authentication.services')

  .factory('FitbitLoginService', function ($window, $state, $ionicLoading, localStorageService, $location, $cordovaInAppBrowser, $ionicPlatform, $rootScope) {
    var url = 'https://fitrpg-enhanced.herokuapp.com/fitbit/auth';
    var usernameUrl = 'https://fitrpg-enhanced.herokuapp.com/fitbit/getUsername';

    var loginWindow, token, hasToken, userId, hasUserId;

    return {
      login: function () {
        document.addEventListener('deviceready', function () {
          var options = {
            location: 'no',
            toolbar: 'no'
          };
          console.log("Clicked login");
          console.log("Contacting Fitbit...");
          $cordovaInAppBrowser.open(url, '_blank', options);
        }, false);

        document.addEventListener('deviceready', function () {

          $rootScope.$on("$cordovaInAppBrowser:loadstart", function (e, event) {
            //trying to figure out what event and result look like
            console.log(e);
            console.log(event);
            //the variables below come from fitbit-controller-refactor getOauthToken()
            hasToken = event.url.indexOf('?oauth_token=');
            hasUserId = event.url.indexOf('&userId=');
            if (hasToken > -1 && hasUserId > -1) {
              token = event.url.match('oauth_token=(.*)&userId')[1];
              //userId = event.url.match('&userId=(.*)')[1];
              var userIdTemp = event.url.match('&userId=(.*)')[1];
              userId = userIdTemp.slice(0, userIdTemp.length - 4);
              console.log('FitbitLogInService() userId: ' + userId);//console of this doesnt appear
              localStorageService.set('fitbit-token', token);
              localStorageService.set('token-date', JSON.stringify(new Date()));
              localStorageService.set('userId', userId);
              $cordovaInAppBrowser.close();
              location.href = location.pathname;
            }
          });
        }, false);
      },
    };
  });

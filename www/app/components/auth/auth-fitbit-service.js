angular.module('mobile.authentication.services')

.factory('FitbitLoginService', function ($window, $state, $ionicLoading, localStorageService, $location) {
  var url = 'http://127.0.0.1:9000/fitbit/auth';
  var usernameUrl = 'http://127.0.0.1:9000/fitbit/getUsername';

  var loginWindow, token, hasToken, userId, hasUserId;

  return {
    login: function () {
      console.log("Clicked login");
      console.log("Contacting Fitbit...");
      loginWindow = cordova.InAppBrowser.open(url, '_blank', 'location=no,toolbar=no,hidden=yes');
      $ionicLoading.show({
         template: '<p>Contacting Fitbit...</p><i class="icon ion-loading-c"></i>',
         animation: 'fade-in',
         showBackdrop: false,
         maxWidth: 200,
         showDelay: 200
      });

      loginWindow.addEventListener("loadstop", function(e) {
          $ionicLoading.hide();
          loginWindow.show();
      });

      loginWindow.addEventListener('loadstart', function (event) {
        console.log(event.url);
          hasToken = event.url.indexOf('?oauth_token=');
          hasUserId = event.url.indexOf('&userId=');
        if (hasToken > -1 && hasUserId > -1) {
          token = event.url.match('oauth_token=(.*)&userId')[1];
          userId = event.url.match('&userId=(.*)')[1];
          localStorageService.set('fitbit-token', token);
          localStorageService.set('token-date', JSON.stringify(new Date()));
          localStorageService.set('userId', userId);
          loginWindow.close();
          location.href=location.pathname;
        }
      });
    },
  };
});

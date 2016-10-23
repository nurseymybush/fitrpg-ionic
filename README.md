<h2>Fixes 10/21</h2>
*[added $window to dep inj in select-username-controller.js]
*[added $state to dep inj in shop-detail-controller.js]
*[added moment and humanize-duration to bower.json fix error when click on quest]
*[fixed bug where random button wasnt showing on battle page by adding it to correct html area]
*[using $ionicHistory.goBack() instead of deprecated $navBarDelegate.back() in app.js]
*[added can-swipe="true" to ion-list in battle.html and friends.html to enable swiping]

*[fixed status bar hiding in app.js with: --didnt work
if (window.StatusBar) {
      StatusBar.hide(); //chance add
      ionic.Platform.fullScreen(); //chance add
}
if (ionic.Platform.isAndroid()) {
    window.addEventListener("native.hidekeyboard", function() {
      StatusBar.hide();
      window.AndroidFullScreen.immersiveMode(false, false);
    });
}]

<h2>Nurseymybush forked updates</h2>
*[Updates all Node and Bower components to latest]
*[Updated from Fitbit Oauth1 to Oauth2]
*[Using NgCordova for Cordova plugins]

<img src="/readme/github_promo.png"/>
<a href="https://play.google.com/store/apps/details?id=com.fatchickenstudios.fitrpg">
  <img alt="Get it on Google Play"
       src="readme/google_play.png" />
</a>
<a href="https://itunes.apple.com/us/app/fitrpg-gamifying-fitbit/id887067605?mt=8&uo=4">
  <img alt="Get it on the App Store"
       src="readme/app_store.png" />
</a>

FitRPG is a mobile app created by [Amira Anuar](https://github.com/aellawind), [Matt Gutierrez](https://github.com/fatchicken007), and [Conor Fennell](https://github.com/conorfennell) at [Hack Reactor](http://www.hackreactor.com/). FitRPG transforms a Fitbit user's data into a character that can fight friends, battle bosses, and go on quests using the steps, distance, and sleep tracked by the Fitbit. The game logic seeks to motivate users to stay fit and challenge themselves to go that extra mile in order to win a battle or complete a quest.

<h2>Featured On</h2>
  * [Lifehacker](http://lifehacker.com/fitrpg-turns-your-fitbit-into-a-game-you-play-with-frie-1602140820)

<h2>Tech Stack</h2>
  * [Ionic Framework](http://ionicframework.com/)
  * [AngularJS](https://angularjs.org/)
  * [Node.js](http://nodejs.org/)
  * [Express.js](http://expressjs.com/)
  * [MongoDB](http://www.mongodb.org/)

<h2>Code Base</h2>
  * [Client side](https://github.com/fitrpg/fitrpg-ionic)
  * [Server side](https://github.com/fitrpg/fitrpg-server)

<b>Challenges</b>:
  * User flow during fitbit OAuth
    *  Originally we wanted to do the OAuth login client side on the app. But due to fitbit using OAuth 1.0 and not allowing CORS or JSONP, it had to be done server side. This was a challenge since the server redirects your app during the OAuth process and takes you out of the app context. We had to find a way to keep this redirect within the app and inform the app if the authentication was successful. Read our blog post [here](http://amiraanuar.com/mobile-authentication-in-ionic-with-oauth-through-external-apis-fitbit-pt-2-client/) on how we implemented the client-side portion of authentication via Ionic.
  * Game logic design
    * Balancing how sleep, steps and other activities relate to the characters attributes and making sure one is not more effective than other attributes.
  * User interface design
    * A game can have a lot of different options and views, reducing and compressing these views and making them innutaive is a challenge.
  * Security
    * Implementing json web tokens
    * OAuth

<h2>Upcoming Features</h2>
  * Push Notfications
  * Versus Missions
  * Jawbone Support

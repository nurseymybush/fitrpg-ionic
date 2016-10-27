<h1>FitRPG-Enhanced</h1>

Fork of https://github.com/fitrpg/fitrpg-ionic
<br>I hope to provide enhancedments and fixes to the project, fixes being first
<h2>10/27</h2>
* fixed bug where if you already own a piece of equipment(not potions), it should tell you and not let you buy it
* fixed bug where inventory doesnt update when you sell weapons
* added feature to swipe to cancel friend request
* added feature to make same type potions appear in one row with a quantity number next to them

<h2>10/22</h2>

* changed "Store" to shop in shop.html title
* ability to remove friend on swipe in friend menu, also removes any missionVersus with ex-friend
* fixed bug where hasSkillPts was erroring out on load
<h2>10/21</h2>

* added $window to dep inj in select-username-controller.js
* added $state to dep inj in shop-detail-controller.js
* added moment and humanize-duration to bower.json fix error when click on quest
* fixed bug where random button wasnt showing on battle page by adding it to correct html area
* using $ionicHistory.goBack() instead of deprecated $navBarDelegate.back() in app.js
* added can-swipe="true" to ion-list in battle.html and friends.html to enable swiping
* fixed status bar hiding
<h2>8/20</h2>

* Updates all Node and Bower components to latest
* Updated from Fitbit Oauth1 to Oauth2
* Using NgCordova for Cordova plugins

<h2>FitRPG</h2>
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

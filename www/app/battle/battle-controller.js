angular.module('mobile.battle.controllers')

.controller('BattleCtrl', function(
  $scope,
  $q,
  $window,
  $cordovaSocialSharing,
  $ionicPopup,
  $ionicLoading,
  $ionicListDelegate,
  $ionicScrollDelegate,
  $ionicNavBarDelegate,
  User,
  Battle,
  RandomUser,
  SoloMissions,
  localStorageService
) {
  var localUser = localStorageService.get('userData');

  var battles;

  var sendTweet = function(message) {
    $cordovaSocialSharing.shareViaTwitter(message).then(function(result) {
      // Success!
    }, function(err) {
      // An error occured. Show a message to the user
    });
  };

  // Show/hide buttons on specified screen
  var tabSettings = function(tab) {
    if (tab === 'boss') {
      $scope.friendsTab = false;
      $scope.showHistory = false;
      $scope.showRandom = false;
    } else if (tab === 'friend') {
      $scope.friendsTab = true;
      $scope.showHistory = true;
      $scope.showRandom = true;
    } else if (tab === 'history') {
      $scope.friendsTab = true;
      $scope.showHistory = false;
      $scope.showRandom = true;
    }
  };

  tabSettings('friend');

  $scope.hasBattles = false;
  $scope.hasBosses = false; //chance add to show default no boss message
  $scope.isPending = true;

  // Set active class on specified tab
  var activeTab = function(name) {
    $scope.tabClass = {
      boss: '',
      friend: '',
    };

    $scope.tabClass[name] = 'button-tab-active';
  };

  activeTab('friend');

  /*var loading = setTimeout(function() {
    $ionicLoading.show({
      template: '<p>Loading...</p><i class="icon ion-loading-c"></i>'
    });
  }, 500);*/

  var stopLoading = function() {
    //clearTimeout(loading);
    $ionicLoading.hide();
  };

  var checkLevel = function(user) {
    var newLevel = util.calcLevel(user.fitbit.experience + user.attributes.experience);
    user.attributes.skillPts = util.calcSkillPoints(user.attributes.skillPts, newLevel, user.attributes.level);
    user.attributes.level = newLevel;
  };

  // TEXT PROMPTS
  var healthWarning = function() {
    var title = 'Unfit for Battle';
    var body = 'You don\'t look so good. You need to recover some of your health before you can battle again.';

    util.showAlert($ionicPopup, title, body, 'OK', function() {
      $ionicListDelegate.closeOptionButtons();
    });
  };

  var listOfBattles = function() {
    // make a copy of the $scope.user.missionsVersus
    //for (var i = 0; i < $scope.user.missionsVersus.length; i++) {
    for(var  i = 0; i < localUser.missionsVersus.length; i++) {
      battles[i] = {};
      //for (var key in $scope.user.missionsVersus[i]) {
      for (var key in localUser.missionsVersus[i]) {
        //battles[i][key] = $scope.user.missionsVersus[i][key];
        battles[i][key] = localUser.missionsVersus[i][key];
      }
    }

    //if ($scope.user.friends.length === 0) {
    if (localUser.friends.length === 0) {
      //stopLoading();
    };

    var getFriendData = function(id) {
      console.log('BattleCtrl getFriendData id: ' + id);
      if(typeof id !== "undefined"){
      User.get({
        id: id
      }, function(user) {
        if (user._id) {
          $scope.friends.push(user);
          var friend = $scope.friends[$scope.friends.length - 1];
          for (var j = 0; j < battles.length; j++) {
            var battle = battles[j];
            if (friend._id === battle.enemy) {
              friend.battleData = battle;
              friend.battleData.status = util.capitalize(friend.battleData.status);
            }
          }
          //console.log(friend);
          $scope.hasBattles = true;
        }
        //stopLoading();
      },function(error){
        console.log(JSON.stringify(error));
      }
      );
    };
    }

    console.log(JSON.stringify(localUser.friends));
    //for (var i = 0; i < $scope.user.friends.length; i++) {
    for (var i = 0; i < localUser.friends.length; i++) {
      //var friend = $scope.user.friends[i];
      var friend = localUser.friends[i];
      getFriendData(friend);
    }

    //for (var i = 0; i < $scope.user.missionsVersus.length; i++) {
    for (var i = 0; i < localUser.missionsVersus.length; i++) {
      //var enemy = $scope.user.missionsVersus[i].enemy;
      var enemy = localUser.missionsVersus[i].enemy;
      var friendExists = false;
      //for (var j = 0; j < $scope.user.friends.length; j++) {
      for (var j = 0; j < localUser.friends.length; j++) {
        //var friend = $scope.user.friends[j];
        var friend = localUser.friends[j];
        if (enemy === friend) {
          friendExists = true;
        }
      }
      if (!friendExists) {
        getFriendData(enemy);
      }
    }

  };

  $scope.refresh = function() {
    battles = [];
    $scope.friends = [];
    listOfBattles();
    //$scope.newBossFights();
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.friendsBattle = function() {
    $ionicScrollDelegate.scrollTop();
    $scope.isPending = true;
    activeTab('friend');
    tabSettings('friend');
    $scope.refresh();
  };

  $scope.refresh();

  $scope.cancelBattle = function(id) {
    // remove battle from $scope.user.battles
    var removeMission = function(player, playerId) {
      var indexOfBattle;
      for (var i = 0; i < player.missionsVersus.length; i++) {
        if (player.missionsVersus[i].enemy === playerId) {
          indexOfBattle = i;
        }
      }

      player.missionsVersus.splice(indexOfBattle, 1);
      //User.update(player);
    };

    //removeMission($scope.user, id);
    removeMission(localUser, id);

    // get enemy data and remove missions versus
    User.get({
      id: id
    }, function(user) {
      localUser = user;
      //removeMission(user, $scope.user._id);
      removeMission(localUser, localUser._id);
      //User.update(player);
      User.update(localUser);
      localStorageService.set('userData', localUser);
    });

    for (var i = 0; i < $scope.friends.length; i++) {
      var friend = $scope.friends[i];
      if (friend._id === id) {
        delete friend.battleData;
      }
    }
    $ionicListDelegate.closeOptionButtons();
  };

  var battleResults = function(outcome, enemy) {
    var title, body, message;
    if (outcome === 'win') {
      title = 'Victorious in Battle';
      body = 'Congratulations, your training has served you well. Keep up the good work! You\'ve gained experience and gold';
      message = 'I beat ' + enemy + ' in battle! I\'m the fittest! @fitrpg';
    } else if (outcome === 'loss') {
      title = 'Defeated in Battle';
      body = 'Sorry, you need to train more if you don\'t want to be a weakling. You\'ve lost experience and gold';
      message = 'I was defeated by ' + enemy + ' in battle! I need to train more. @fitrpg';
    } else {
      title = 'Draw';
      body = 'This match was too close...there was no victor.';
      message = 'It was too close of a  match with ' + enemy + '. There was no winner. @fitrpg';
    }
    util.showPrompt($ionicPopup, title, body, 'Share', 'Continue',
      function() {
        sendTweet(message);
      },
      function() {
        $ionicListDelegate.closeOptionButtons();
      }
    );
  };

  $scope.random = function() {
    var title, body;

    var findRandomBattle = function() {
      RandomUser.get({
        //id: $scope.user._id,
        id:localUser._id,
        //level: $scope.user.attributes.level
        level: localUser.attributes.level
      }, function(enemy) {
        if (Object.keys(enemy).length > 0) {
          $scope.startBattle(enemy._id);
        } else {
          title = 'No Matches Found';
          body = 'We couldn\'t find a suitable match for you. You must be too strong.';
          util.showAlert($ionicPopup, title, body, 'OK', function() {});
        }
      });
    };

    title = 'Random Battle';
    body = 'Battle a randomly matched player. Are you up for the challenge?'
    util.showPrompt($ionicPopup, title, body, 'Start', 'Cancel', findRandomBattle);
  };

  $scope.startBattle = function(id) {
    var title, body;
    if (localUser.attributes.HP === 0) {
    //if ($scope.user.attributes.HP === 0) {
      healthWarning();
    } else {
      var battlePending = false;
      var battleRequest = false;

      //for (var i = 0; i < $scope.user.missionsVersus.length; i++) {
        //var mission = $scope.user.missionsVersus[i];
      for (var i = 0; i < localUser.missionsVersus.length; i++) {
        var mission = localUser.missionsVersus[i];
        if (mission.enemy === id && mission.status.toLowerCase() === 'pending') {
          battlePending = true;
        } else if (mission.enemy === id && mission.status.toLowerCase() === 'request') {
          battleRequest = true;
        }
      }
      if (battleRequest) {
        console.log('get ready for battle!');
        // get the correct battle
        var battle;
        var indexOfBattle;
         //for (var i = 0; i < $scope.user.missionsVersus.length; i++) {
          //if ($scope.user.missionsVersus[i].enemy === id) {
        for (var i = 0; i < localUser.missionsVersus.length; i++) {
          if (localUser.missionsVersus[i].enemy === id) {
            indexOfBattle = i;
            //battle = $scope.user.missionsVersus[i];
            battle = localUser.missionsVersus[i];
          }
        }

        // get user attributes from database
        User.get({
          id: id
        }, function(enemy) {
          var enemyBattle;
          for (var i = 0; i < enemy.missionsVersus.length; i++) {
            //if (enemy.missionsVersus[i].enemy === $scope.user._id) {
            if (enemy.missionsVersus[i].enemy === localUser._id) {
              enemyBattle = enemy.missionsVersus[i];
            }
          }

          // use game logic to determine winner of battle
          // post battle results to database for both players

          //var winner = util.battle($scope.user, enemy);
          var winner = util.battle(localUser, enemy);

          var updateExp = function(player1, player2, status) {
            var player1Xp = player1.attributes.experience + player1.fitbit.experience;
            var player2Xp = player2.attributes.experience + player2.fitbit.experience;
            var player1AttrXp = player1.attributes.experience;
            var player2AttrXp = player2.attributes.experience;
            var diff = Math.abs(player2Xp - player1Xp);
            if (status === 'win') {
              if (player2Xp >= player1Xp) {
                return player1AttrXp + diff * 0.2;
              } else {
                return player1AttrXp + diff * (1 / Math.log(diff) * 0.5);
              }
            } else if (status === 'loss') {
              if (player2Xp >= player1Xp) {
                return player1AttrXp - diff * (1 / Math.log(diff) * 0.5);
              } else {
                return player1AttrXp - diff * 0.2;
              }
            }
          };

          var saveBattleResult = function(winnerId, loserId) {
            var battle = {
              winner: winnerId,
              loser: loserId,
              createdAt: new Date()
            }

            Battle.save(battle);
          }

          var adjustAttr = function(playerWin, playerLose) {
            playerLose.attributes.HP = 0;
            playerWin.attributes.HP = winner.hp;
            playerWin.attributes.gold += Math.floor(playerLose.attributes.gold * 0.1);
            playerLose.attributes.gold = Math.floor(playerLose.attributes.gold *= 0.9);
            playerWin.attributes.experience = Math.floor(updateExp(playerWin, playerLose, 'win'));
            playerLose.attributes.experience = Math.floor(updateExp(playerLose, playerWin, 'loss'));
            saveBattleResult(playerWin._id, playerLose._id);
          };

          var handleNegXp = function(player, level) {
            var playerXp = player.fitbit.experience + player.attributes.experience;
            var levelXp = util.levelExp(level);
            if (playerXp < 0) {
              player.attributes.experience = -player.fitbit.experience;
            } else if (playerXp < levelXp) {
              player.attributes.experience += (levelXp - playerXp);
            }
          };

          if (winner.result === 'player 1') {
            //adjustAttr($scope.user, enemy);
            adjustAttr(localUser, enemy);
            handleNegXp(enemy, enemy.attributes.level);
            enemyBattle.status = 'loss';
            battle.status = 'win';
            //checkLevel($scope.user);
            checkLevel(localUser);
          } else if (winner.result === 'player 2') {
            //adjustAttr(enemy, $scope.user);
            //handleNegXp($scope.user, $scope.user.attributes.level);
            adjustAttr(enemy, localUser);
            handleNegXp(localUser, localUser.attributes.level);
            enemyBattle.status = 'win';
            battle.status = 'loss';
          }

          util.showAlert($ionicPopup, 'Challenge Accepted', 'Your duel to the death with ' + enemy.profile.displayName + ' is in progress. Who will come out on top?', 'Results', function() {
            battleResults(battle.status, enemy.username);
          });

          //$scope.user.missionsVersus.splice(indexOfBattle, 1);
          localUser.missionsVersus.splice(indexOfBattle, 1);

          for (var i = 0; i < $scope.friends.length; i++) {
            var friend = $scope.friends[i];
            if (friend._id === id) {
              delete friend.battleData;
            }
          }

          //User.update($scope.user);
          User.update(localUser);
          localStorageService.set('userData', localUser);
          User.update(enemy);
        });
      } else if (battlePending) {
        title = 'Battle Pending';
        body = 'You are already have a request to do battle with this friend.';

        util.showAlert($ionicPopup, title, body, 'OK', function() {
          $ionicListDelegate.closeOptionButtons();
        });
      } else {
        var checkMissionExists = function(player, enemyId) {
          var missions = player.missionsVersus;
          for (var i = 0; i < missions.length; i++) {
            var mission = missions[i];
            if (mission.enemy === enemyId) {
              return true;
            }
          }
          return false;
        };

        var battleInfo = {
          type: 'battle',
          enemy: id,
          status: 'pending'
        };
        User.get({
          //id: $scope.user._id
          id: localUser._id
        }, function(user) {
          localUser = user;
          //var missionExists = checkMissionExists(user, id);
          var missionExists = checkMissionExists(localUser, id);
          if (!missionExists) {
            //user.missionsVersus.push(battleInfo);
            //$scope.user.missionsVersus.push(battleInfo);
            //User.update(user);
            localUser.missionsVersus.push(battleInfo);
            User.update(localUser);
          }
        });

        User.get({
          id: id
        }, function(friend) {
          var battle = {
            type: 'battle',
            //enemy: $scope.user._id,
            enemy:localUser._id,
            status: 'request'
          };
          //var friendMissionExists = checkMissionExists(friend, $scope.user._id);
          var friendMissionExists = checkMissionExists(friend, localUser._id);
          if (!friendMissionExists) {
            friend.missionsVersus.push(battle);
            friend.battleData = battleInfo;
            User.update(friend);
            friend.battleData.status = util.capitalize(friend.battleData.status);
          }
        });

        for (var i = 0; i < $scope.friends.length; i++) {
          var friend = $scope.friends[i];
          if (friend._id === id) {
            friend.battleData = battleInfo;
          }
        }

        title = 'Request Sent';
        body = 'Your battle request has been sent. You can still equip new weapons or train more until the battle request is accepted.';

        util.showAlert($ionicPopup, title, body, 'OK', function() {
          $ionicListDelegate.closeOptionButtons();
        });
      }
    }

  };

  $scope.history = function() {
    $scope.oldWinBattles = [];
    $scope.oldLossBattles = [];
    $scope.isPending = false;
    tabSettings('history');
    //var userId = $scope.user._id;
    var userId = localUser._id;
    Battle.query({
      winner: userId
    }, function(battlesWon) {
      Battle.query({
        loser: userId
      }, function(battlesLost) {
        $scope.wins = battlesWon.length;
        $scope.losses = battlesLost.length;

        var oldBattles = battlesWon.concat(battlesLost);
        for (var i = 0; i < battlesWon.length; i++) {
          var enemy = battlesWon[i].loser;
          User.get({
            id: enemy
          }, function(user) {
            $scope.oldWinBattles.push(user);
          });
        }
        for (var i = 0; i < battlesLost.length; i++) {
          var enemy = battlesLost[i].winner;
          User.get({
            id: enemy
          }, function(user) {
            $scope.oldLossBattles.push(user);
          });
        }

      });
    });
  };

  $scope.battlePending = function(friend) {
    return friend ? true : false;
  };

  // START BOSS FUNCTIONS

  // Load bosses to fight when tab button is clicked
  $scope.newBossFights = function() {
    $ionicScrollDelegate.scrollTop();
    activeTab('boss');
    tabSettings('boss');
    $scope.soloMissions = [];
    $scope.completedSoloMissions = [];

    var attributes = localUser.attributes;
    var battles = localUser.battles;

    SoloMissions.query(function(solos) {
      var allSoloMissions = solos;
      var soloMission;
      //Filter missions that are complete or greater than current user level
      for (var i = 0; i < allSoloMissions.length; i++) {
        var battleComplete = false;
        soloMission = allSoloMissions[i];
        //if (soloMission.level <= $scope.user.attributes.level && ($scope.user.attributes.level - 6) < (soloMission.level)) {
        if (soloMission.level <= attributes.level && (attributes.level - 6) < (soloMission.level)) {
          //for (var j = 0; j < $scope.user.battles.length; j++) {
          for (var j = 0; j < battles.length; j++) {
            //var completedBattle = $scope.user.battles[j]._id;
            var completedBattle = battles[j]._id;
            if (completedBattle === soloMission['_id']) {
              battleComplete = true;
            }
          }
          
          if (!battleComplete) {
            $scope.soloMissions.push(soloMission);
          } else {
            var completedDate;

            //console.log('newBossFights() completedSolo $scope.user.battles:');
            //console.log($scope.user.battles);

            //for(var h = 0; h < $scope.user.battles.length; ++h){
              //if($scope.user.battles[h]._id === soloMission['_id']){
            for(var h = 0; h < battles.length; ++h){
              if(battles[h]._id === soloMission['_id']){
                //console.log('newBossFights() completedSolo userCompletedSolo: ' + $scope.user.battles[h]);
                //completedDate = $scope.user.battles[h].dateCompleted;
                completedDate = battles[h].dateCompleted;
                //console.log('newBossFights() completedSolo completedDate: ' + completedDate);
              }
            }
            var completedObj = {
              "completedDate": completedDate,
              "missionDetails" : soloMission 
            };
            $scope.completedSoloMissions.push(completedObj);
            //$scope.completedSoloMissions.push(soloMission);
          }
        }
      }
      //stopLoading();
      if($scope.soloMissions.length > 0 || $scope.completedSoloMissions.length > 0){ 
        $scope.hasBosses = true;
      }
    });
  };

  // Show/hide 'difficulty' stars in boss list
  $scope.difficulty = function(index, num, isCompleted) {
    var returnBool;
    if(isCompleted){
      returnBool = num <= $scope.completedSoloMissions[index].missionDetails.difficulty ? true : false;
    } else{
      returnBool = num <= $scope.soloMissions[index].difficulty ? true : false;
    }
    return returnBool;
  };

  // Show list of completed boss fights
  /*$scope.completeBossFights = function() {
    $scope.soloMissions = [];
    for (var i = 0; i < $scope.user.battles.length; i++) {
      var completedBattle = $scope.user.battles[i]._id;
      SoloMissions.get({
        id: completedBattle
      }, function(battle) {
        $scope.soloMissions.push(battle);
      });
    }
  };*/

  // Stat mission with boss
  $scope.startMission = function(missionId) {
    $scope.soloMission = SoloMissions.get({
      id: missionId
    });
    var title, body;

    var attributes = localUser.attributes;

    var startBossBattle = function() {
      var index;
      //var winner = util.bossBattle($scope.user, $scope.soloMission);
      var winner = util.bossBattle(localUser, $scope.soloMission);
      title = 'Mission Results';

      if (winner.result === 'player') {
        //$scope.user.attributes.experience += $scope.soloMission.experience;
        //$scope.user.attributes.gold += $scope.soloMission.gold;
        attributes.experience += $scope.soloMission.experience;
        attributes.gold += $scope.soloMission.gold;
        
        //chance add to instead of just battles = ["1","2"], battles = [{date, id},{date, id}]
        var completedBattle = {
          "dateCompleted" : new Date().toLocaleDateString(),
          "_id": $scope.soloMission._id
        };

        //$scope.user.battles.push($scope.soloMission._id);
        //$scope.user.battles.push(completedBattle);
        localUser.battles.push(completedBattle);
        for (var i = 0; i < $scope.soloMissions.length; i++) {
          if ($scope.soloMissions[i]['_id'] === missionId) {
            index = i;
          }
        }
        $scope.soloMissions.splice(index, 1);
        //$scope.newBossFights();//chance add to create completed boss fights array
        $scope.completeBossFights.push(index);//chance add to add to completed boss fights array

        //checkLevel($scope.user);
        checkLevel(localUser);
        body = 'You\'ve crushed evil. You gained ' + $scope.soloMission.experience + ' experience and ' + $scope.soloMission.gold + ' gold';
      } else {
        body = 'You were defeated. You may want to train more before doing battle.';
      }
      //$scope.user.attributes.HP = winner.hp;
      localUser.attributes.HP = winner.hp;
      //User.update($scope.user);
      User.update(localUser);
      localStorageService.set('userData', localUser);
      util.showAlert($ionicPopup, title, body, 'OK', function() {
        $ionicListDelegate.closeOptionButtons();
      });
    };

    //if ($scope.user.attributes.HP > 0) {
    if (attributes.HP > 0) {
      title = 'Mission Started';
      body = 'You are waging war against the forces of evil...',

        util.showAlert($ionicPopup, title, body, 'Continue', startBossBattle);
    } else {
      healthWarning();
    }
  };
})
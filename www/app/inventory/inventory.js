'use strict';

angular.module('mobile.inventory', [

  'mobile.inventory.controllers',
  'mobile.inventory.services'
]);

angular.module('mobile.inventory.controllers', ['LocalStorageModule','ionic']);
angular.module('mobile.inventory.services', ['LocalStorageModule','ionic']);


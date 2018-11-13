/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2018 App Builder - https://www.davidesperalta.com
 */

window.App = {};

window.App.Utils = (function () {

  var
    lastSound = 0;

  return {

    lowerCase: function (text) {
      return text.toLowerCase();
    },
    
    upperCase: function (text) {
      return text.toUpperCase();
    },    

    strLen: function (text) {
      return text.length;
    },

    trimStr: function (text) {
      return text.trim();
    },

    strSearch: function (text, query) {
      return text.search(query);
    },

    splitStr: function (text, separator) {
      return text.split(separator);
    },

    subStr: function (text, start, count) {
      return text.substr(start, count);
    },

    strReplace: function (text, from, to) {
      return text.replace(from, to);
    },

    strReplaceAll: function (text, from, to) {
      return text.split(from).join(to);
    },

    playSound: function (mp3Url, oggUrl) {
      if (lastSound === 0) {
        lastSound = new Audio();
      }
      if (lastSound.canPlayType('audio/mpeg')) {
        lastSound.src = mp3Url;
        lastSound.type = 'audio/mpeg';
      } else {
        lastSound.src = oggUrl;
        lastSound.type = 'audio/ogg';
      }
      lastSound.play();
    },

    stopSound: function () {
      lastSound.pause();
      lastSound.currentTime = 0.0;
    },

    sleep: function (ms) {
      var
        start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > ms){
          break;
        }
      }
    },
    
    parseViewParams: function (params) {
      if (angular.isUndefined(params)) {
        return {};
      }
      var 
        result = {},
        pairs = params.split('&');
      pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
      });
      return JSON.parse(JSON.stringify(result));
    },
    
    transformRequest: function (kind) {
      if (kind === 'json') {
        return function(data) { 
          return JSON.stringify(data); 
        };
      } else if (kind === 'form') {
        return function(data) { 
          var 
            frmData = []; 
          angular.forEach(data, function(value, key) { 
            frmData.push(encodeURIComponent(key) + '=' + encodeURIComponent(value)); 
          }); 
          return frmData.join('&'); 
        };
      } else if (kind === 'data') {
        return function(data) { 
          var 
            frmData = new FormData(); 
          angular.forEach(data, function(value, key) { 
            frmData.append(key, value); 
          }); 
          return frmData; 
        };      
      }
    }
  };
})();

window.App.Modal = (function () {

  var
    stack = [],
    current = 0;

  return {

    insert: function (name) {
      current = stack.length;
      stack[current] = {};
      stack[current].name = name;
      stack[current].instance = null;
      return stack[current];
    },

    getCurrent: function () {
      if (stack[current]) {
        return stack[current].instance;
      } else {
        return null;
      }
    },
    
    removeCurrent: function () {
      stack.splice(current, 1);
      current = current - 1;
      current = (current < 0) ? 0 : current;
    },

    closeAll: function () {
      for (var i = stack.length-1; i >= 0; i--) {
        stack[i].instance.dismiss();
      }
      stack = [];
      current = 0;
    }
  };
})();

window.App.Debugger = (function () {

  return {

    exists: function () {
      return (typeof window.external === 'object')
       && ('hello' in window.external);
    },

    log: function (text, aType, lineNum) {
      if (window.App.Debugger.exists()) {
        window.external.log('' + text, aType || 'info', lineNum || 0);
      } else {
        console.log(text);
      }
    },

    watch: function (varName, newValue, oldValue) {
      if (window.App.Debugger.exists()) {
        if (angular.isArray(newValue)) {
          window.external.watch('', varName, newValue.toString(), 'array');
        } else if (angular.isObject(newValue)) {
          angular.forEach(newValue, function (value, key) {
            if (!angular.isFunction (value)) {
              try {
                window.external.watch(varName, key, value.toString(), typeof value);
              } 
              catch(exception) {}
            }
          });
        } else if (angular.isString(newValue) || angular.isNumber(newValue)) {
          window.external.watch('', varName, newValue.toString(), typeof newValue);
        }
      }
    }
  };
})();

window.App.Module = angular.module
(
  'AppModule',
  [
    'ngAria',
    'ngRoute',
    'ngTouch',
    'ngSanitize',
    'blockUI',
    'chart.js',
    'ngOnload',
    'ui.bootstrap',
    'angular-canvas-gauge',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'AppCtrls'
  ]
);

window.App.Module.run(function () {
  if (window.FastClick) {
    window.FastClick.attach(window.document.body);
  }
});

window.App.Module.directive('ngImageLoad',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('load', function (event) {
          var 
            fn = $parse(attrs.ngImageLoad);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('ngImageError',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('error', function (event) {
          var 
            fn = $parse(attrs.ngImageError);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('ngContextMenu',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('contextmenu', function (event) {
          var
            fn = $parse(attrs.ngContextMenu);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('bindFile',
[
  function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, el, attrs, ngModel) {
        el.bind('change', function (event) {
          ngModel.$setViewValue(event.target.files[0]);
          $scope.$apply();
        });

        $scope.$watch(function () {
          return ngModel.$viewValue;
        }, function (value) {
          if (!value) {
            el.val('');
          }
        });
      }
    };
  }
]);

window.App.Module.config
([
  '$compileProvider',

  function ($compileProvider) {
    $compileProvider.debugInfoEnabled(window.App.Debugger.exists());
    $compileProvider.imgSrcSanitizationWhitelist
     (/^\s*(https?|blob|ftp|mailto|file|tel|app|data:image|moz-extension|chrome-extension|ms-appdata|ms-appx-web):/);
  }
]);

window.App.Module.config
([
  '$httpProvider',

  function ($httpProvider) {
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    if (!$httpProvider.defaults.headers.post) {
      $httpProvider.defaults.headers.post = {};
    }
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.post['Content-Type'] = undefined;
    $httpProvider.defaults.transformRequest.unshift(window.App.Utils.transformRequest('data'));
}]);

window.App.Module.config
([
  '$provide',

  function ($provide) {
    $provide.decorator('$exceptionHandler',
    ['$injector',
      function ($injector) {
        return function (exception, cause) {
          var
            $rs = $injector.get('$rootScope');

          if (!angular.isUndefined(cause)) {
            exception.message += ' (caused by "'+cause+'")';
          }

          $rs.App.LastError = exception.message;
          $rs.OnAppError();
          $rs.App.LastError = '';

          if (window.App.Debugger.exists()) {
            throw exception;
          } else {
            if (window.console) {
              window.console.error(exception);
            }
          }
        };
      }
    ]);
  }
]);

window.App.Module.config
([
  'blockUIConfig',

  function (blockUIConfig) {
    blockUIConfig.delay = 0;
    blockUIConfig.autoBlock = false;
    blockUIConfig.resetOnException = true;
    blockUIConfig.message = 'Please wait';
    blockUIConfig.autoInjectBodyBlock = false;
    blockUIConfig.blockBrowserNavigation = true;
  }
]);

window.App.Module.config
([
  '$routeProvider',

  function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: "/welcome"})
    .when("/welcome/:params*?", {controller: "welcomeCtrl", templateUrl: "app/views/welcome.html"})
    .when("/SendPoll/:params*?", {controller: "SendPollCtrl", templateUrl: "app/views/SendPoll.html"})
    .when("/PreviewEntry/:params*?", {controller: "PreviewEntryCtrl", templateUrl: "app/views/PreviewEntry.html"})
    .when("/Views/:params*?", {controller: "ViewsCtrl", templateUrl: "app/views/Views.html"})
    .when("/PrendingPoll/:params*?", {controller: "PrendingPollCtrl", templateUrl: "app/views/PrendingPoll.html"})
    .when("/register/:params*?", {controller: "registerCtrl", templateUrl: "app/views/register.html"})
    .when("/Activation/:params*?", {controller: "ActivationCtrl", templateUrl: "app/views/Activation.html"})
    .when("/activate/:params*?", {controller: "activateCtrl", templateUrl: "app/views/activate.html"})
    .when("/View3/:params*?", {controller: "View3Ctrl", templateUrl: "app/views/View3.html"});
  }
]);

window.App.Module.service
(
  'AppEventsService',

  ['$rootScope',

  function ($rootScope) {

    function setAppHideEvent() {
      window.document.addEventListener('visibilitychange', function (event) {
        if (window.document.hidden) {
          window.App.Event = event;
          $rootScope.OnAppHide();
          $rootScope.$apply();
        }
      }, false);
    }
    
    function setAppShowEvent() {
      window.document.addEventListener('visibilitychange', function (event) {
        if (!window.document.hidden) {
          window.App.Event = event;
          $rootScope.OnAppShow();
          $rootScope.$apply();
        }
      }, false);
    }    

    function setAppOnlineEvent() {
      window.addEventListener('online', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOnline();
      }, false);
    }

    function setAppOfflineEvent() {
      window.addEventListener('offline', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOffline();
      }, false);
    }

    function setAppResizeEvent() {
      window.addEventListener('resize', function (event) {
        window.App.Event = event;
        $rootScope.OnAppResize();
      }, false);
    }

    function setAppPauseEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('pause', function (event) {
          window.App.Event = event;
          $rootScope.OnAppPause();
          $rootScope.$apply();
        }, false);
      }
    }

    function setAppReadyEvent() {
      if (window.App.Cordova) {
        angular.element(window.document).ready(function (event) {
          window.App.Event = event;
          $rootScope.OnAppReady();
        });
      } else {
        document.addEventListener('deviceready', function (event) {
          window.App.Event = event;
          $rootScope.OnAppReady();
        }, false);
      }
    }

    function setAppResumeEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('resume', function (event) {
          window.App.Event = event;
          $rootScope.OnAppResume();
          $rootScope.$apply();
        }, false);
      }
    }

    function setAppBackButtonEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('backbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppBackButton();
        }, false);
      }
    }

    function setAppMenuButtonEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('deviceready', function (event) {
          // http://stackoverflow.com/q/30309354
          navigator.app.overrideButton('menubutton', true);
          document.addEventListener('menubutton', function (event) {
            window.App.Event = event;
            $rootScope.OnAppMenuButton();
          }, false);
        }, false);
      }
    }

    function setAppOrientationEvent() {
      window.addEventListener('orientationchange', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOrientation();
      }, false);
    }

    function setAppVolumeUpEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('volumeupbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppVolumeUpButton();
        }, false);
      }
    }

    function setAppVolumeDownEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('volumedownbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppVolumeDownButton();
        }, false);
      }
    }

    function setAppKeyUpEvent() {
      document.addEventListener('keyup', function (event) {
        window.App.Event = event;
        $rootScope.OnAppKeyUp();
      }, false);
    }

    function setAppKeyDownEvent() {
      document.addEventListener('keydown', function (event) {
        window.App.Event = event;
        $rootScope.OnAppKeyDown();
      }, false);
    }
    
    function setAppClickEvent() {
      document.addEventListener('click', function (event) {
        window.App.Event = event;
        $rootScope.OnAppClick();
      }, false);
    }    

    function setAppMouseUpEvent() {
      document.addEventListener('mouseup', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseUp();
      }, false);
    }

    function setAppMouseDownEvent() {
      document.addEventListener('mousedown', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseDown();
      }, false);
    }
    
    function setAppMouseMoveEvent() {
      document.addEventListener('mousemove', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseMove();
      }, false);
    }    

    function setAppViewChangeEvent() {
      angular.element(window.document).ready(function (event) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
          window.App.Event = event;
          $rootScope.App.NextView = next.substring(next.lastIndexOf('/') + 1);
          $rootScope.App.PrevView = current.substring(current.lastIndexOf('/') + 1);
          $rootScope.OnAppViewChange();
        });
      });
    }
    
    function setAppWebExtMsgEvent() {
      if (window.chrome) {
        window.chrome.runtime.onMessage.addListener(function (message, sender, responseFunc) {
          $rootScope.App.WebExtMessage = message;
          $rootScope.OnAppWebExtensionMsg();
        });
      }    
    }    

    return {
      init : function () {
        
        
              
        setAppReadyEvent();
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
      }
    };
  }
]);

window.App.Module.service
(
  'AppGlobalsService',

  ['$rootScope', '$filter',

  function ($rootScope, $filter) {

    var setGlobals = function () {    
      $rootScope.App = {};
      $rootScope.App._Timers = {};
      var s = function (name, method) {
        Object.defineProperty($rootScope.App, name, { get: method });
      };      
      s('Online', function () { return navigator.onLine; });
      s('Url', function () { return window.location.href; });      
      s('WeekDay', function () { return new Date().getDay(); });
      s('Event', function () { return window.App.Event || ''; });
      s('OuterWidth', function () { return window.outerWidth; });
      s('InnerWidth', function () { return window.innerWidth; });
      s('InnerHeight', function () { return window.innerHeight; });
      s('OuterHeight', function () { return window.outerHeight; });
      s('Timestamp', function () { return new Date().getTime(); });
      s('Day', function () { return $filter('date')(new Date(), 'dd'); });
      s('Hour', function () { return $filter('date')(new Date(), 'hh'); });
      s('Week', function () { return $filter('date')(new Date(), 'ww'); });
      s('Month', function () { return $filter('date')(new Date(), 'MM'); });
      s('Year', function () { return $filter('date')(new Date(), 'yyyy'); });
      s('Hour24', function () { return $filter('date')(new Date(), 'HH'); });
      s('Minutes', function () { return $filter('date')(new Date(), 'mm'); });
      s('Seconds', function () { return $filter('date')(new Date(), 'ss'); });
      s('DayShort', function () { return $filter('date')(new Date(), 'd'); });
      s('WeekShort', function () { return $filter('date')(new Date(), 'w'); });
      s('HourShort', function () { return $filter('date')(new Date(), 'h'); });
      s('YearShort', function () { return $filter('date')(new Date(), 'yy'); });
      s('MonthShort', function () { return $filter('date')(new Date(), 'M'); });
      s('Hour24Short', function () { return $filter('date')(new Date(), 'H'); });
      s('Fullscreen', function () { return window.BigScreen.element !== null; });
      s('MinutesShort', function () { return $filter('date')(new Date(), 'm'); });
      s('SecondsShort', function () { return $filter('date')(new Date(), 's'); });
      s('Milliseconds', function () { return $filter('date')(new Date(), 'sss'); });
      s('Debugger', function () { return window.App.Debugger.exists() ? 'true' : 'false'; });      
      s('Cordova', function () {  return angular.isUndefined(window.App.Cordova) ? 'true' : 'false'; });
      s('Orientation', function () { return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait'; });
      s('ActiveControl', function () { return (window.document.activeElement !== null) ? window.document.activeElement.id : ''; });
      s('CurrentView', function () { var s = window.document.location.hash.substring(3), i = s.indexOf('/'); return (i !== -1) ? s.substring(0, i) : s; });
      s('DialogView', function () { return window.document.querySelector('.modal-content .appView') ? window.document.querySelector('.modal-content .appView').id : ''; });

      
$rootScope.App.IdleIsIdling = "false";
$rootScope.App.IdleIsRunning = "false";
$rootScope.App.ID = "com.justclickk.myvotes";
$rootScope.App.Name = "Voters Poll";
$rootScope.App.ShortName = "ePractice";
$rootScope.App.Version = "1.0.0";
$rootScope.App.Description = "Result monitoring for INEC Elections";
$rootScope.App.AuthorName = "Justclickk Technology Ltd";
$rootScope.App.AuthorEmail = "support@justclickk.com";
$rootScope.App.AuthorUrl = "http://www.justclickk.com/";
$rootScope.App.LanguageCode = "en";
$rootScope.App.TextDirection = "ltr";
$rootScope.App.BuildNumber = 50;
$rootScope.App.Scaled = "scaled";
$rootScope.App.Views = ["welcome", "SendPoll", "PreviewEntry", "Views", "PrendingPoll", "register", "Activation", "activate", "View3"];
$rootScope.App.Theme = "Default";
$rootScope.App.Themes = ["Default", "Sketchy", "Yeti"];
if ($rootScope.App.Themes.indexOf("Default") == -1) { $rootScope.App.Themes.push("Default"); }
    };

    return {
      init : function () {
        setGlobals();
      }
    };
  }
]);

window.App.Module.service
(
  'AppControlsService',

  ['$rootScope', '$http', '$sce',

  function ($rootScope, $http, $sce) {

    var setControlVars = function () {
      

$rootScope.Container30 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: "animated"
};

$rootScope.Container31 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Container32 = {
  ABRole: 1001,
  Hidden: "",
  Title: "Activate",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.C_all_apps_btn = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.C_all_apps_ico = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "fa fa-th-large",
  Text: "",
  Class: "btn btn-link btn-sm ",
  Disabled: ""
};

$rootScope.Container39 = {
  ABRole: 1001,
  Hidden: "",
  Title: "Activate",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.C_visit_site_btn = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.C_visit_site_ico = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "far fa-chart-bar",
  Text: "",
  Class: "btn btn-link btn-sm ",
  Disabled: ""
};

$rootScope.Container40 = {
  ABRole: 1001,
  Hidden: "",
  Title: "Activate",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.C_help_btn = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.C_help_ico = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "far fa-list-alt",
  Text: "",
  Class: "btn btn-link btn-sm ",
  Disabled: ""
};

$rootScope.Container41 = {
  ABRole: 1001,
  Hidden: "",
  Title: "Activate",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.C_chat_btn = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.C_chat_ico = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "far fa-copy",
  Text: "",
  Class: "btn btn-link btn-sm ",
  Disabled: ""
};

$rootScope.Container42 = {
  ABRole: 1001,
  Hidden: "",
  Title: "Activate",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.C_activate_btn = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.C_activate_ico = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "far fa-paper-plane",
  Text: "",
  Class: "btn btn-link btn-sm ",
  Disabled: ""
};

$rootScope.Container43 = {
  ABRole: 1001,
  Hidden: "",
  Title: "Activate",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.C_reqst_code_btn = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.C_reqst_code_ico = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "far fa-folder-open",
  Text: "",
  Class: "btn btn-link btn-sm ",
  Disabled: ""
};

$rootScope.Container12 = {
  ABRole: 1001,
  Hidden: "",
  Title: "Activate",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.C_Update_btn = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.C_Update_ico = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "far fa-envelope-open",
  Text: "",
  Class: "btn btn-link btn-sm ",
  Disabled: ""
};

$rootScope.Container13 = {
  ABRole: 1001,
  Hidden: "",
  Title: "Activate",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.C_About_btn = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.C_About_ico = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "fab fa-internet-explorer",
  Text: "",
  Class: "btn btn-link btn-sm ",
  Disabled: ""
};

$rootScope.Container14 = {
  ABRole: 1001,
  Hidden: "",
  Title: "Activate",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.C_Settings_btn = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.C_Settings_ico = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "fas fa-cog",
  Text: "",
  Class: "btn btn-link btn-sm ",
  Disabled: ""
};

$rootScope.Contaitner4 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Label20 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Voters Poll",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.HtmlConftent17 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.HtmlContent56 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "",
  PopoverTitle: "",
  PopoverPos: ""
};

$rootScope.HtmlContent2 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Image1 = {
  ABRole: 8001,
  Hidden: "",
  Image: "app/images/polls1.jpg",
  Class: "",
  Alt: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Image2 = {
  ABRole: 8001,
  Hidden: "",
  Image: "app/images/polls6.jpg",
  Class: "",
  Alt: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Image3 = {
  ABRole: 8001,
  Hidden: "",
  Image: "app/images/polls2.jpg",
  Class: "",
  Alt: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Image5 = {
  ABRole: 8001,
  Hidden: "",
  Image: "app/images/result_2.jpeg",
  Class: "",
  Alt: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.addpoll = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Send Poll",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label9 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Poll Result",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label11 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Pending Result",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label14 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Reports",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label19 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Select a task below to start",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Image7 = {
  ABRole: 8001,
  Hidden: "",
  Image: "app/images/polls9.jpg",
  Class: "",
  Alt: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Image8 = {
  ABRole: 8001,
  Hidden: "",
  Image: "app/images/admin.jpg",
  Class: "",
  Alt: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Label21 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Notifications",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label22 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Admin Area",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.BadgeBtn = {
  ABRole: 2001,
  Hidden: "true",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "",
  PopoverPos: "",
  Badge: "1",
  Icon: "",
  Text: "",
  Class: "btn btn-link btn-sm ",
  Disabled: ""
};

$rootScope.HttpClient3 = {
  ABRole: 30001,
  Transform: "data",
  Status: 0,
  StatusText: "",
  Response: "",
  Request: {
    data: {},
    headers: {},
    url: "http://www.justclickk.com/post.php",
    method: "POST"
  }
};

$rootScope.Button63 = {
  ABRole: 2001,
  Hidden: "true",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "fab fa-internet-explorer",
  Text: "No Internet  Try again",
  Class: "btn btn-danger btn-md ",
  Disabled: ""
};

$rootScope.Progressbar3 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "",
  AriaLabel: "",
  BarText: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 100
};

$rootScope.Container7 = {
  ABRole: 1001,
  Hidden: "true",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Containeytr8 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.TimerDataCheck = {
  ABRole: 30002,
  Interval: 1000
};
$rootScope.App._Timers.TimerDataCheck = null;

$rootScope.HttpClientDataCheck = {
  ABRole: 30001,
  Transform: "data",
  Status: 0,
  StatusText: "",
  Response: "",
  Request: {
    data: {},
    headers: {},
    url: "http://www.justclickk.com/post.php",
    method: "POST"
  }
};

$rootScope.NewClient = {
  ABRole: 30001,
  Transform: "data",
  Status: 0,
  StatusText: "",
  Response: "",
  Request: {
    data: {},
    headers: {},
    url: "http://www.justclickk.com/cbt/eactivate/scripts/notes/NewNotes.php",
    method: "POST"
  }
};

$rootScope.Container9 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Label10 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Send Poll",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.HtmlContent9 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.HtmlContent10 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "",
  PopoverTitle: "",
  PopoverPos: ""
};

$rootScope.HtmlContent11 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.VOTERage = {
  ABRole: 20004,
  Hidden: "true",
  Items: [],
  ItemIndex: 0,
  Title: "Subject",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-sm ",
  Disabled: ""
};
$rootScope.VOTERage.Items.push("Select Voter Age");
$rootScope.VOTERage.Items.push("18 - 25");
$rootScope.VOTERage.Items.push("25 - 35");
$rootScope.VOTERage.Items.push("35 - 45");
$rootScope.VOTERage.Items.push("45 - 55");
$rootScope.VOTERage.Items.push("55 -  above");

$rootScope.LGAselect = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "Select LGA",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.LGAselect.Items.push("Select LGA");
$rootScope.LGAselect.Items.push("AGAIE");
$rootScope.LGAselect.Items.push("AGWARA");
$rootScope.LGAselect.Items.push("BIDA");
$rootScope.LGAselect.Items.push("BORGU");
$rootScope.LGAselect.Items.push("BOSSO");
$rootScope.LGAselect.Items.push("CHANCHAGA");
$rootScope.LGAselect.Items.push("EDATTI");
$rootScope.LGAselect.Items.push("GBAKO");
$rootScope.LGAselect.Items.push("GURARA");
$rootScope.LGAselect.Items.push("KATCHA");
$rootScope.LGAselect.Items.push("KONTAGORA");
$rootScope.LGAselect.Items.push("LAPAI");
$rootScope.LGAselect.Items.push("LAVUN");
$rootScope.LGAselect.Items.push("MAGAMA");
$rootScope.LGAselect.Items.push("MARIGA");
$rootScope.LGAselect.Items.push("MASHEGU");
$rootScope.LGAselect.Items.push("MOKWA");
$rootScope.LGAselect.Items.push("MUYA");
$rootScope.LGAselect.Items.push("PAIKORO");
$rootScope.LGAselect.Items.push("RAFI");
$rootScope.LGAselect.Items.push("RIJAU");
$rootScope.LGAselect.Items.push("SHIRORO");
$rootScope.LGAselect.Items.push("SULEJA");
$rootScope.LGAselect.Items.push("TAFA");
$rootScope.LGAselect.Items.push("WUSHISHI");

$rootScope.WARDselect = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "Subject",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.WARDselect.Items.push("Selct LGA Ward");

$rootScope.PUNITselect = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "Subject",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.PUNITselect.Items.push("Select Polling Unit");

$rootScope.ELECTIONselect = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "Subject",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.ELECTIONselect.Items.push("Select Election");
$rootScope.ELECTIONselect.Items.push("PRESIDENTIAL");
$rootScope.ELECTIONselect.Items.push("SENATORIAL");
$rootScope.ELECTIONselect.Items.push("HOUSE OF REPRESENTITIVE");
$rootScope.ELECTIONselect.Items.push("GOVERNORSHIP");
$rootScope.ELECTIONselect.Items.push("STATE HOUSE OF ASSEMBLY");

$rootScope.PARTYselect = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.PARTYselect.Items.push("Select Voters Choice (Party)");
$rootScope.PARTYselect.Items.push("APC");
$rootScope.PARTYselect.Items.push("PDP");
$rootScope.PARTYselect.Items.push("SDP");
$rootScope.PARTYselect.Items.push("APGA");
$rootScope.PARTYselect.Items.push("OTHERS");
$rootScope.PARTYselect.Items.push("UNDECIDED");
$rootScope.PARTYselect.Items.push("UNDISCLOSED");

$rootScope.RESPONSselect = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "Subject",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.RESPONSselect.Items.push("Select Voter Response");
$rootScope.RESPONSselect.Items.push("I will vote for APC in all elections");
$rootScope.RESPONSselect.Items.push("I will vote for APC in some elections");
$rootScope.RESPONSselect.Items.push("I will vote for PDP in all elections");
$rootScope.RESPONSselect.Items.push("I will vote for PDP in some elections");
$rootScope.RESPONSselect.Items.push("I will vote for SDP in all elections");
$rootScope.RESPONSselect.Items.push("I will vote for SDP in some elections");
$rootScope.RESPONSselect.Items.push("I will vote for APGA in all elections");
$rootScope.RESPONSselect.Items.push("I will vote for APGA in some elections");
$rootScope.RESPONSselect.Items.push("I will vote other parties");
$rootScope.RESPONSselect.Items.push("I cannot talk");

$rootScope.REASONselect = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "Subject",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.REASONselect.Items.push("Select Voter Reason");
$rootScope.REASONselect.Items.push("APC Govt. in Niger State has performed well");
$rootScope.REASONselect.Items.push("PDP candidate will perform better");
$rootScope.REASONselect.Items.push("SDP candidate will perform better");
$rootScope.REASONselect.Items.push("APGA candidate will perform better");
$rootScope.REASONselect.Items.push("Protest vote");
$rootScope.REASONselect.Items.push("Lack of security");
$rootScope.REASONselect.Items.push("No Govt. presense in my area");
$rootScope.REASONselect.Items.push("Our leaders have neglected us");

$rootScope.VOTERname = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Enter Voter Full Name",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.VOTERphone = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Enter Voter Phone Number",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.VOTERvin = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Enter Voter VIN Number",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Label6 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Select Voter Date of Birth",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.YearSelect = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.YearSelect.Items.push("YEAR");
$rootScope.YearSelect.Items.push("1900");
$rootScope.YearSelect.Items.push("1901");
$rootScope.YearSelect.Items.push("1902");
$rootScope.YearSelect.Items.push("1903");
$rootScope.YearSelect.Items.push("1904");
$rootScope.YearSelect.Items.push("1905");
$rootScope.YearSelect.Items.push("1906");
$rootScope.YearSelect.Items.push("1907");
$rootScope.YearSelect.Items.push("1908");
$rootScope.YearSelect.Items.push("1909");
$rootScope.YearSelect.Items.push("1910");
$rootScope.YearSelect.Items.push("1911");
$rootScope.YearSelect.Items.push("1912");
$rootScope.YearSelect.Items.push("1913");
$rootScope.YearSelect.Items.push("1914");
$rootScope.YearSelect.Items.push("1915");
$rootScope.YearSelect.Items.push("1916");
$rootScope.YearSelect.Items.push("1917");
$rootScope.YearSelect.Items.push("1918");
$rootScope.YearSelect.Items.push("1919");
$rootScope.YearSelect.Items.push("1920");
$rootScope.YearSelect.Items.push("1921");
$rootScope.YearSelect.Items.push("1922");
$rootScope.YearSelect.Items.push("1923");
$rootScope.YearSelect.Items.push("1924");
$rootScope.YearSelect.Items.push("1925");
$rootScope.YearSelect.Items.push("1926");
$rootScope.YearSelect.Items.push("1927");
$rootScope.YearSelect.Items.push("1928");
$rootScope.YearSelect.Items.push("1929");
$rootScope.YearSelect.Items.push("1930");
$rootScope.YearSelect.Items.push("1931");
$rootScope.YearSelect.Items.push("1932");
$rootScope.YearSelect.Items.push("1933");
$rootScope.YearSelect.Items.push("1934");
$rootScope.YearSelect.Items.push("1935");
$rootScope.YearSelect.Items.push("1936");
$rootScope.YearSelect.Items.push("1937");
$rootScope.YearSelect.Items.push("1938");
$rootScope.YearSelect.Items.push("1939");
$rootScope.YearSelect.Items.push("1940");
$rootScope.YearSelect.Items.push("1941");
$rootScope.YearSelect.Items.push("1942");
$rootScope.YearSelect.Items.push("1943");
$rootScope.YearSelect.Items.push("1944");
$rootScope.YearSelect.Items.push("1945");
$rootScope.YearSelect.Items.push("1946");
$rootScope.YearSelect.Items.push("1947");
$rootScope.YearSelect.Items.push("1948");
$rootScope.YearSelect.Items.push("1949");
$rootScope.YearSelect.Items.push("1950");
$rootScope.YearSelect.Items.push("1951");
$rootScope.YearSelect.Items.push("1952");
$rootScope.YearSelect.Items.push("1953");
$rootScope.YearSelect.Items.push("1954");
$rootScope.YearSelect.Items.push("1955");
$rootScope.YearSelect.Items.push("1956");
$rootScope.YearSelect.Items.push("1957");
$rootScope.YearSelect.Items.push("1958");
$rootScope.YearSelect.Items.push("1959");
$rootScope.YearSelect.Items.push("1960");
$rootScope.YearSelect.Items.push("1961");
$rootScope.YearSelect.Items.push("1962");
$rootScope.YearSelect.Items.push("1963");
$rootScope.YearSelect.Items.push("1964");
$rootScope.YearSelect.Items.push("1965");
$rootScope.YearSelect.Items.push("1966");
$rootScope.YearSelect.Items.push("1967");
$rootScope.YearSelect.Items.push("1968");
$rootScope.YearSelect.Items.push("1969");
$rootScope.YearSelect.Items.push("1970");
$rootScope.YearSelect.Items.push("1971");
$rootScope.YearSelect.Items.push("1972");
$rootScope.YearSelect.Items.push("1973");
$rootScope.YearSelect.Items.push("1974");
$rootScope.YearSelect.Items.push("1975");
$rootScope.YearSelect.Items.push("1976");
$rootScope.YearSelect.Items.push("1977");
$rootScope.YearSelect.Items.push("1978");
$rootScope.YearSelect.Items.push("1979");
$rootScope.YearSelect.Items.push("1980");
$rootScope.YearSelect.Items.push("1981");
$rootScope.YearSelect.Items.push("1982");
$rootScope.YearSelect.Items.push("1983");
$rootScope.YearSelect.Items.push("1984");
$rootScope.YearSelect.Items.push("1985");
$rootScope.YearSelect.Items.push("1986");
$rootScope.YearSelect.Items.push("1987");
$rootScope.YearSelect.Items.push("1988");
$rootScope.YearSelect.Items.push("1989");
$rootScope.YearSelect.Items.push("1990");
$rootScope.YearSelect.Items.push("1991");
$rootScope.YearSelect.Items.push("1992");
$rootScope.YearSelect.Items.push("1993");
$rootScope.YearSelect.Items.push("1994");
$rootScope.YearSelect.Items.push("1995");
$rootScope.YearSelect.Items.push("1996");
$rootScope.YearSelect.Items.push("1997");
$rootScope.YearSelect.Items.push("1998");
$rootScope.YearSelect.Items.push("1999");
$rootScope.YearSelect.Items.push("2000");

$rootScope.MonthSelect = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.MonthSelect.Items.push("MONTH");
$rootScope.MonthSelect.Items.push("1");
$rootScope.MonthSelect.Items.push("2");
$rootScope.MonthSelect.Items.push("3");
$rootScope.MonthSelect.Items.push("4");
$rootScope.MonthSelect.Items.push("5");
$rootScope.MonthSelect.Items.push("6");
$rootScope.MonthSelect.Items.push("7");
$rootScope.MonthSelect.Items.push("8");
$rootScope.MonthSelect.Items.push("9");
$rootScope.MonthSelect.Items.push("10");
$rootScope.MonthSelect.Items.push("11");
$rootScope.MonthSelect.Items.push("12");

$rootScope.DaySelect = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.DaySelect.Items.push("DAY");

$rootScope.VOTERgender = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "Subject",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.VOTERgender.Items.push("Select Voter Gender");
$rootScope.VOTERgender.Items.push("Male");
$rootScope.VOTERgender.Items.push("Female");

$rootScope.VOTERreligion = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "Subject",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-md ",
  Disabled: ""
};
$rootScope.VOTERreligion.Items.push("Select Voter Religion");
$rootScope.VOTERreligion.Items.push("Christian");
$rootScope.VOTERreligion.Items.push("Muslim");

$rootScope.AGENTname = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Enter Agent Full Name",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.AGENTphone = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Enter Agent Phone Number",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Button1 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "CONTINUE",
  Class: "btn btn-success btn-md ",
  Disabled: ""
};

$rootScope.Progressbar4 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "",
  AriaLabel: "",
  BarText: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 100
};

$rootScope.Label2 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Select options below and click CONTINUE",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.HtmlContentd0 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Button2 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Submit",
  Class: "btn btn-success btn-lg ",
  Disabled: ""
};

$rootScope.Button7 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Previous",
  Class: "btn btn-dark btn-lg ",
  Disabled: ""
};

$rootScope.IFrame3 = {
  ABRole: 4001,
  Hidden: "",
  Url: "IFrame3.Url",
  Class: "ios-iframe-wrapper "
};

$rootScope.Progressbar2 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "",
  AriaLabel: "",
  BarText: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 100
};

$rootScope.Button52 = {
  ABRole: 2001,
  Hidden: "true",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "fab fa-internet-explorer",
  Text: "Try again",
  Class: "btn btn-danger btn-md ",
  Disabled: ""
};

$rootScope.Contttainer4 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Label4 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Voters Poll",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.HtmlConretent4 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.HtmlContent5 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "",
  PopoverTitle: "",
  PopoverPos: ""
};

$rootScope.HtmlContent6 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Button45 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "X",
  Class: "btn btn-danger btn-xs ",
  Disabled: ""
};

$rootScope.HtmlContent1 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Button4 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Load all",
  Class: "btn btn-success btn-lg ",
  Disabled: ""
};

$rootScope.Image4 = {
  ABRole: 8001,
  Hidden: "",
  Image: "app/images/polls6.jpg",
  Class: "",
  Alt: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Container10 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Label8 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "REGISTER FOR PREMIUM",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.name = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Full name",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.phone = {
  ABRole: 3008,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Your Phone",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.email = {
  ABRole: 3005,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Your Email",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.state = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "Select State",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-sm ",
  Disabled: ""
};
$rootScope.state.Items.push("Select State");
$rootScope.state.Items.push("Abuja");
$rootScope.state.Items.push("Abia");
$rootScope.state.Items.push("Adamawa");
$rootScope.state.Items.push("Akwa Iborm");
$rootScope.state.Items.push("Anambra");
$rootScope.state.Items.push("Bauchi");
$rootScope.state.Items.push("Bayelsa");
$rootScope.state.Items.push("Benue");
$rootScope.state.Items.push("Borno");
$rootScope.state.Items.push("Cross River");
$rootScope.state.Items.push("Dealta");
$rootScope.state.Items.push("Ebonyi");
$rootScope.state.Items.push("Edo");
$rootScope.state.Items.push("Ekiti");
$rootScope.state.Items.push("Enugu");
$rootScope.state.Items.push("Gombe");
$rootScope.state.Items.push("Imo");
$rootScope.state.Items.push("Jigawa");
$rootScope.state.Items.push("Kaduna");
$rootScope.state.Items.push("Kano");
$rootScope.state.Items.push("Katsina");
$rootScope.state.Items.push("Kebbi");
$rootScope.state.Items.push("Kogi");
$rootScope.state.Items.push("Kwara");
$rootScope.state.Items.push("Lagos");
$rootScope.state.Items.push("Nassarawa");
$rootScope.state.Items.push("Niger");
$rootScope.state.Items.push("Ogun");
$rootScope.state.Items.push("Ondo");
$rootScope.state.Items.push("Osun");
$rootScope.state.Items.push("Oyo");
$rootScope.state.Items.push("Plateau");
$rootScope.state.Items.push("Rivers");
$rootScope.state.Items.push("Sokoto");
$rootScope.state.Items.push("Taraba");
$rootScope.state.Items.push("Yobe");
$rootScope.state.Items.push("Zamfara");

$rootScope.city = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "City or Locality",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-sm ",
  Disabled: ""
};

$rootScope.plan = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "Subscription",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-sm ",
  Disabled: ""
};
$rootScope.plan.Items.push("Subscription:");
$rootScope.plan.Items.push("1000");

$rootScope.MsgSend = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Send",
  Class: "btn btn-primary btn-xs ",
  Disabled: ""
};

$rootScope.response = {
  ABRole: 9001,
  Hidden: "true",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: "true"
};

$rootScope.Label3 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Internet is required to send",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.activator = {
  ABRole: 2001,
  Hidden: "true",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Activate Now",
  Class: "btn btn-success btn-md ",
  Disabled: ""
};

$rootScope.Container2 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.HtmlContent63 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Label52 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "WhatsJAMB",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.HtmlContent64 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.HtmlContent65 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.HtmlContent66 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "",
  PopoverTitle: "",
  PopoverPos: ""
};

$rootScope.serial = {
  ABRole: 3001,
  Hidden: "true",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.donatek = {
  ABRole: 3001,
  Hidden: "true",
  Value: "Input1",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.TimerSersverResp = {
  ABRole: 30002,
  Interval: 1000
};
$rootScope.App._Timers.TimerSersverResp = null;

$rootScope.Container47 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Container52 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.HtmlContent55 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Label45 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "WhatsJAMB",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.HtmlContent60 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.HtmlContent61 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.HtmlContent62 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "",
  PopoverTitle: "",
  PopoverPos: ""
};

$rootScope.Button22 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "PAY ONLINE",
  Class: "btn btn-success btn-sm ",
  Disabled: ""
};

$rootScope.Button26 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "PAY TO BANK",
  Class: "btn btn-info btn-sm ",
  Disabled: ""
};

$rootScope.Label16 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "SIGN UP / Help?  08065286007",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.HtmlContent21 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.HtmlContent22 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.HtmlContent24 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Container53 = {
  ABRole: 1001,
  Hidden: "true",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Button27 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "X",
  Class: "btn btn-danger btn-xs ",
  Disabled: ""
};

$rootScope.HtmlContent25 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Label35 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "BANK DETAILS",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Button23 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "REGISTER DEVICE",
  Class: "btn btn-warning btn-sm ",
  Disabled: ""
};

$rootScope.Button30 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "ACTIVATE DEVICE",
  Class: "btn btn-primary btn-sm ",
  Disabled: ""
};

$rootScope.Container54 = {
  ABRole: 1001,
  Hidden: "true",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Button3 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "X",
  Class: "btn btn-danger btn-xs ",
  Disabled: ""
};

$rootScope.HtmlContent36 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Label31 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "ONLINE PAYMENT",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Button18 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "PAY (N1,000) Activate full",
  Class: "btn btn-success btn-xs ",
  Disabled: ""
};

$rootScope.Label32 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "PRACTICE OFFLINE (ALL)",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label33 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "PRACTICE ONLINE (ALL)",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Button51 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "PAY (N500)  Remove Ads",
  Class: "btn btn-warning btn-xs ",
  Disabled: ""
};

$rootScope.Label36 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "We accept Verv, Visa and  MasterCard",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Container55 = {
  ABRole: 1001,
  Hidden: "true",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Button70 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "X",
  Class: "btn btn-danger btn-xs ",
  Disabled: ""
};

$rootScope.HtmlContent49 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Label44 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "REGISTER DEVICE",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Button71 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "BY INTERNET",
  Class: "btn btn-default btn-xs ",
  Disabled: ""
};

$rootScope.Label49 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Internet Data Required",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label50 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "1 SMS Credit Required",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Button72 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "BY SMS",
  Class: "btn btn-default btn-xs ",
  Disabled: ""
};

$rootScope.Container56 = {
  ABRole: 1001,
  Hidden: "true",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Button68 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "X",
  Class: "btn btn-danger btn-xs ",
  Disabled: ""
};

$rootScope.Container57 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Input5 = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Enter Your Email",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Button69 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "glyphicon glyphicon-envelope",
  Text: "Send SMS",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.Input6 = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Enter Your Name",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Input10 = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: "true"
};

$rootScope.Select5 = {
  ABRole: 20004,
  Hidden: "",
  Items: [],
  ItemIndex: 0,
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "custom-select custom-select-sm ",
  Disabled: ""
};
$rootScope.Select5.Items.push("Subscription:");
$rootScope.Select5.Items.push("N1000");

$rootScope.Input1 = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Phone Number",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Label42 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "SMS ACTIVATION",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.PhoneInput = {
  ABRole: 3008,
  Hidden: "true",
  Value: "08065286007",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Phone number",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Container3 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Button24 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "X",
  Class: "btn btn-danger btn-xs ",
  Disabled: ""
};

$rootScope.Container72 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.UserKey = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Enter Activation Code Here",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Label23 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "No Internet Required",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Button14 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "ACTIVATE",
  Class: "btn btn-info btn-xs ",
  Disabled: ""
};

$rootScope.HtmlContent47 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Label1 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "PASTE ACTIVATION CODE",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label5 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Request for Code",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: "fa fa-unlock"
};

$rootScope.Container48 = {
  ABRole: 1001,
  Hidden: "true",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.Button33 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "X",
  Class: "btn btn-danger btn-xs ",
  Disabled: ""
};

$rootScope.Container49 = {
  ABRole: 1001,
  Hidden: "",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Class: ""
};

$rootScope.InputUserID = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "User Device ID",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.InputResult = {
  ABRole: 3001,
  Hidden: "true",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "Result",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Button46 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Push",
  Class: "btn btn-info btn-md ",
  Disabled: ""
};

$rootScope.Button47 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Copy",
  Class: "btn btn-success btn-md ",
  Disabled: ""
};

$rootScope.Button36 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "glyphicon glyphicon-envelope",
  Text: "Send",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.InputUserPhone = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "User Phone",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.InputPIN = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "PIN",
  Class: "form-control form-control-sm ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Textarea1 = {
  ABRole: 9001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Clipboard1 = {
  ABRole: 30012,
  Error: ""
};

$rootScope.Textarea3 = {
  ABRole: 9001,
  Hidden: "",
  Value: "The app must be run on a mobile device ie. Phone or Tablet that are powered by Android OS.",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.HttpClient28 = {
  ABRole: 30001,
  Transform: "data",
  Status: 0,
  StatusText: "",
  Response: "",
  Request: {
    data: {},
    headers: {},
    url: "http://www.justclickk.com/post.php",
    method: "POST"
  }
};

$rootScope.Textarea4 = {
  ABRole: 9001,
  Hidden: "",
  Value: "If you think this is by error, then CHAT with us bellow.",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Label64 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Try Again...",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: "fas fa-sign-in-alt"
};

$rootScope.Button5 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Chat with US",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};
    };

    return {
      init : function () {
        setControlVars();
      }
    };
  }
]);

window.App.Plugins = {};

window.App.Module.service
(
  'AppPluginsService',

  ['$rootScope',

  function ($rootScope) {

    return {
      init : function () {
        Object.keys(window.App.Plugins).forEach(function (plugin) {
          if (angular.isFunction(window.App.Plugins[plugin])) {
            plugin = window.App.Plugins[plugin].call();
            if (angular.isFunction(plugin.PluginSetupEvent)) {
              plugin.PluginSetupEvent();
            }
            if (angular.isUndefined(window.App.Cordova) &&
             angular.isFunction(plugin.PluginAppReadyEvent)) {
               document.addEventListener('deviceready',
                plugin.PluginAppReadyEvent, false);
            }
          }
        });
      },
      docReady : function () {
        Object.keys(window.App.Plugins).forEach(function (plugin) {
          if (angular.isFunction(window.App.Plugins[plugin])) {
            plugin = window.App.Plugins[plugin].call();
            if (angular.isFunction(plugin.PluginDocumentReadyEvent)) {
              angular.element(window.document).ready(
               plugin.PluginDocumentReadyEvent);
            }
          }
        });
      }      
    };
  }
]);

window.App.Ctrls = angular.module('AppCtrls', []);

window.App.Ctrls.controller
(
  'AppCtrl',

  ['$scope', '$rootScope', '$location', '$uibModal', '$http', '$sce', '$timeout', '$window', '$document', 'blockUI', '$uibPosition',
    '$templateCache', 'AppEventsService', 'AppGlobalsService', 'AppControlsService', 'AppPluginsService',

  function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition,
   $templateCache, AppEventsService, AppGlobalsService, AppControlsService, AppPluginsService) {

    window.App.Scope = $scope;
    window.App.RootScope = $rootScope;

    AppEventsService.init();
    AppGlobalsService.init();
    AppControlsService.init();
    AppPluginsService.init();
     
    $scope.trustAsHtml = function (html) {
      return $sce.trustAsHtml(html);
    };    

    $scope.showView = function (viewName) {
      window.App.Modal.closeAll();
      $timeout(function () {
        $location.path(viewName);
      });
    };

    $scope.replaceView = function (viewName) {
      window.App.Modal.closeAll();
      $timeout(function () {
        $location.path(viewName).replace();
      });      
    };

    $scope.showModalView = function (viewName, callback) {
      var
        execCallback = null,
        modal = window.App.Modal.insert(viewName);

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        windowClass: 'dialogView',
        controller: viewName + 'Ctrl',
        templateUrl: 'app/views/' + viewName + '.html'
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );      
    };

    $scope.closeModalView = function (modalResult) {
      var
        modal = window.App.Modal.getCurrent();

      if (modal !== null) {
        modal.close(modalResult);
      }
    };

    $scope.loadVariables = function (text) {

      var
        setVar = function (name, value) {
          var
            newName = '',
            dotPos = name.indexOf('.');

          if (dotPos !== -1) {
            newName = name.split('.');
            if (newName.length === 2) {
              $rootScope[newName[0].trim()][newName[1].trim()] = value;
            } else if (newName.length === 3) {
              // We support up to 3 levels here
              $rootScope[newName[0].trim()][newName[1].trim()][newName[2].trim()] = value;
            }
          } else {
            $rootScope[name] = value;
          }
        };

      var
        varName = '',
        varValue = '',
        isArray = false,
        text = text || '',
        separatorPos = -1;

      angular.forEach(text.split('\n'), function (value, key) {
        separatorPos = value.indexOf('=');
        if ((value.trim() !== '') && (value.substr(0, 1) !== ';') && (separatorPos !== -1)) {
          varName = value.substr(0, separatorPos).trim();
          if (varName !== '') {
            varValue = value.substr(separatorPos + 1, value.length).trim();
            isArray = varValue.substr(0, 1) === '|';
            if (!isArray) {
              setVar(varName, varValue);
            } else {
              setVar(varName, varValue.substr(1, varValue.length).split('|'));
            }
          }
        }
      });
    };
    
    $scope.alertBox = function (content, type) {
      var
        execCallback = null,
        aType = type || 'info',
        modal = window.App.Modal.insert('builder/views/alertBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: true,        
        animation: false,
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/alertBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Content: content
            };
          }
        }
      });
      execCallback = function () {
        window.App.Modal.removeCurrent();     
      };
      modal.instance.result.then(
        function (modalResult){execCallback();},
        function (modalResult){execCallback();}
      );
    };  

    $scope.autoCloseAlertBox = function (content, type, seconds, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        modal = window.App.Modal.insert('builder/views/autoCloseAlertBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/autoCloseAlertBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Content: content
            };
          }
        }
      });
      execCallback = function () {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback();
        }        
      };
      modal.instance.result.then(
        function (modalResult){execCallback();},
        function (modalResult){execCallback();}
      );
      setTimeout(function () {
        $scope.closeModalView();
      }, seconds !== '' ? parseFloat(seconds) * 1000 : 5000);
    };
    
    $scope.inputBox = function (header, buttons,
     inputVar, defaultVal, type, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        aButtons = buttons || 'Ok|Cancel',
        modal = window.App.Modal.insert('builder/views/inputBox.html');

      $rootScope[inputVar] = defaultVal;

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/inputBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Header: header,
              Buttons: aButtons.split('|'),
              InputVar: $rootScope.inputVar
            };
          }
        }
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult, $rootScope[inputVar]);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.messageBox = function (header,
     content, buttons, type, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        aButtons = buttons || null,
        modal = window.App.Modal.insert('builder/views/messageBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/messageBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Header: header,
              Content: content,
              Buttons: aButtons !== null ? aButtons.split('|') : null
            };
          }
        }
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.alert = function (title, text) {
      if (window.App.Cordova || !('notification' in navigator)) {
        window.alert(text);
      } else {
        navigator.notification.alert(
         text, null, title, null);
      }
    };

    $scope.confirm = function (title, text, callback) {
      if (window.App.Cordova || !('notification' in navigator)) {
        callback(window.confirm(text));
      } else {
        navigator.notification.confirm
        (
          text,
          function (btnIndex) {
            callback(btnIndex === 1);
          },
          title,
          null
        );
      }
    };

    $scope.prompt = function (title, text, defaultVal, callback) {
      if (window.App.Cordova || !('notification' in navigator)) {
        var
          result = window.prompt(text, defaultVal);
        callback(result !== null, result);
      } else {
        navigator.notification.prompt(
          text,
          function (result) {
            callback(result.buttonIndex === 1, result.input1);
          },
          title,
          null,
          defaultVal
        );
      }
    };

    $scope.beep = function (times) {
      if (window.App.Cordova || !('notification' in navigator)) {
        window.App.Utils.playSound
        (
          'builder/sounds/beep/beep.mp3',
          'builder/sounds/beep/beep.ogg'
        );
      } else {
        navigator.notification.beep(times);
      }
    };

    $scope.vibrate = function (milliseconds) {
      if (window.App.Cordova || !('notification' in navigator)) {
        var
          body = angular.element(document.body);
        body.addClass('animated shake');
        setTimeout(function () {
          body.removeClass('animated shake');
        }, milliseconds);
      } else {
        navigator.vibrate(milliseconds);
      }
    };

    $scope.setLocalOption = function (key, value) {
      window.localStorage.setItem(key, value);
    };

    $scope.getLocalOption = function (key) {
      return window.localStorage.getItem(key) || '';
    };

    $scope.removeLocalOption = function (key) {
      window.localStorage.removeItem(key);
    };

    $scope.clearLocalOptions = function () {
      window.localStorage.clear();
    };

    $scope.log = function (text, lineNum) {
      window.App.Debugger.log(text, lineNum);
    };

    $window.TriggerAppOrientationEvent = function () {
      $rootScope.OnAppOrientation();
      $rootScope.$apply();
    };

    $scope.idleStart = function (seconds) {

      $scope.idleStop();
      $rootScope.App.IdleIsIdling = false;

      if($rootScope.App._IdleSeconds !== seconds) {
        $rootScope.App._IdleSeconds = seconds;
      }

      $document.on('mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll', $scope._resetIdle);

      $rootScope.App.IdleIsRunning = true;

      $rootScope.App._IdleTimer = setTimeout(function () {
        $rootScope.App.IdleIsIdling = true;
        $rootScope.OnAppIdleStart();
        $scope.$apply();
      }, $rootScope.App._IdleSeconds * 1000);
    };

    $scope._resetIdle = function () {
      if($rootScope.App.IdleIsIdling) {
        $rootScope.OnAppIdleEnd();
        $rootScope.App.IdleIsIdling = false;
        $scope.$apply();
      }
      $scope.idleStart($rootScope.App._IdleSeconds);
    };

    $scope.idleStop = function () {
      $document.off('mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll', $scope._resetIdle);
      clearTimeout($rootScope.App._IdleTimer);
      $rootScope.App.IdleIsRunning = false;
    };

    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    $scope.openWindow = function (url, showLocation, target) {
      var
        options = 'location=';

      if (showLocation) {
        options += 'yes';
      } else {
        options += 'no';
      }

      if (window.App.Cordova) {
        options += ', width=500, height=500, resizable=yes, scrollbars=yes';
      }

      return window.open(url, target, options);
    };

    $scope.closeWindow = function (winRef) {
      if (angular.isObject(winRef) && angular.isFunction (winRef.close)) {
        winRef.close();
      }
    };    
    
    $scope.fileDownload = function(url, subdir, fileName,
     privatelly, headers, errorCallback, successCallback) {
     
      if (window.App.Cordova) {
        if (angular.isFunction(errorCallback)) { 
          errorCallback('-1'); 
        }
        return;
      }
      
      var
        ft = new FileTransfer(),
        root = privatelly.toString() === 'true' ? cordova.file.dataDirectory :
         (device.platform.toLowerCase() === 'ios') ?
          cordova.file.documentsDirectory : cordova.file.externalRootDirectory;

      window.resolveLocalFileSystemURL(root, function (dir) {
        dir.getDirectory(subdir, { create: true, exclusive: false }, function (downloadDir) {
          downloadDir.getFile(fileName, { create: true, exclusive: false }, function (file) {
            ft.download(url, file.toURL(), function(entry) { 
              if (angular.isFunction(successCallback)) { successCallback(entry.toURL(), entry); } 
            }, 
            function(error) {
              if (angular.isFunction(errorCallback)) { errorCallback(4, error); }               
            }, 
            false, 
            { "headers": angular.isObject(headers) ? headers : {} });
          }, 
          function(error) {
            if (angular.isFunction(errorCallback)) { 
              errorCallback(3, error); 
            }               
          });
        }, 
        function(error) {
          if (angular.isFunction(errorCallback)) { 
            errorCallback(2, error); 
          }               
        });
      }, 
      function(error) {
        if (angular.isFunction(errorCallback)) { 
          errorCallback(1, error); 
        }               
      });
    };        

   
$scope.SetOurAppScaled = function()
{

if ($rootScope.App.InnerWidth <= 640) {

angular.element(document.getElementById("appStyle")).attr("href", "app/styles/" + window.App.Utils.lowerCase("scaled") + ".css");
$rootScope.App.Scaled = "scaled";

} else {

angular.element(document.getElementById("appStyle")).attr("href", "app/styles/" + window.App.Utils.lowerCase("fixed") + ".css");
$rootScope.App.Scaled = "fixed";

}
};

$scope.DoHideSwipeMenu = function()
{

angular.element(document.getElementById("Container30")).css("transform", "");
};

$scope.DoShowSwipeMenu = function()
{

$rootScope.W = window.getComputedStyle(document.getElementById("Container30"), null).getPropertyValue("width");

angular.element(document.getElementById("Container30")).css("transition", "200ms");

angular.element(document.getElementById("Container30")).css("transform", "translateX("+$rootScope.W+")");
};

$scope.AdMobDismissEvent = function()
{

$rootScope.EventsTextarea.Value = ""+$rootScope.EventsTextarea.Value+"\nEvent Dismiss, Netwok: "+$rootScope.AdMobNetwork+"";
};

$scope.AdMobFailEvent = function()
{

if (""+$rootScope.AdMobErrorMessage+"" == -1) {

} else {

$rootScope.EventsTextarea.Value = ""+$rootScope.EventsTextarea.Value+"\nEvent Fail, Netwok: "+$rootScope.AdMobNetwork+" - Error: "+$rootScope.AdMobErrorMessage+"";

}
};

$scope.AdMobLeaveAppEvent = function()
{

$rootScope.EventsTextarea.Value = ""+$rootScope.EventsTextarea.Value+"\nEvent Leave, Netwok: "+$rootScope.AdMobNetwork+"";
};

$scope.AdMobLoadedEvent = function()
{

$rootScope.EventsTextarea.Value = ""+$rootScope.EventsTextarea.Value+"\nEvent Loaded, Netwok: "+$rootScope.AdMobNetwork+"";
};

$scope.AdMobPresentEvent = function()
{

$rootScope.EventsTextarea.Value = ""+$rootScope.EventsTextarea.Value+"\nEvent Present, Netwok: "+$rootScope.AdMobNetwork+"";
};

$scope.DevotonalDate = function()
{

$rootScope.Date = moment($rootScope.AppFirstRunDate || undefined, "" || undefined);

$rootScope.Year = $rootScope.Date.get("year");

$rootScope.Month = $rootScope.Date.get("month");

$rootScope.Month = parseFloat($rootScope.Month + 1);

$rootScope.Day = $rootScope.Date.get("date");

if ($rootScope.Month == 1) {

$rootScope.DevoDate.Text = "January, "+$rootScope.Day+"";

$rootScope.Yange.Text = "January, "+$rootScope.Day+"";

} else if ($rootScope.Month == 2) {

$rootScope.DevoDate.Text = "February, "+$rootScope.Day+"";

$rootScope.Yange.Text = "February, "+$rootScope.Day+"";

} else if ($rootScope.Month == 3) {

$rootScope.DevoDate.Text = "March, "+$rootScope.Day+"";

$rootScope.Yange.Text = "March, "+$rootScope.Day+"";

} else if ($rootScope.Month == 4) {

$rootScope.DevoDate.Text = "April, "+$rootScope.Day+"";

$rootScope.Yange.Text = "April, "+$rootScope.Day+"";

} else if ($rootScope.Month == 5) {

$rootScope.DevoDate.Text = "May, "+$rootScope.Day+"";

$rootScope.Yange.Text = "May, "+$rootScope.Day+"";

} else if ($rootScope.Month == 6) {

$rootScope.DevoDate.Text = "June, "+$rootScope.Day+"";

$rootScope.Yange.Text = "June, "+$rootScope.Day+"";

} else if ($rootScope.Month == 7) {

$rootScope.DevoDate.Text = "July, "+$rootScope.Day+"";

$rootScope.Yange.Text = "July, "+$rootScope.Day+"";

} else if ($rootScope.Month == 8) {

$rootScope.DevoDate.Text = "August, "+$rootScope.Day+"";

$rootScope.Yange.Text = "August, "+$rootScope.Day+"";

} else if ($rootScope.Month == 9) {

$rootScope.DevoDate.Text = "September, "+$rootScope.Day+"";

$rootScope.Yange.Text = "September, "+$rootScope.Day+"";

} else if ($rootScope.Month == 10) {

$rootScope.DevoDate.Text = "October, "+$rootScope.Day+"";

$rootScope.Yange.Text = "October, "+$rootScope.Day+"";

} else if ($rootScope.Month == 11) {

$rootScope.DevoDate.Text = "November, "+$rootScope.Day+"";

$rootScope.Yange.Text = "November, "+$rootScope.Day+"";

} else if ($rootScope.Month == 12) {

$rootScope.DevoDate.Text = "December, "+$rootScope.Day+"";

$rootScope.Yange.Text = "December, "+$rootScope.Day+"";

}
};

$scope.DialogeMSG = function()
{

$rootScope.Date = moment($rootScope.AppFirstRunDate || undefined, "" || undefined);

$rootScope.Day = $rootScope.Date.get("date");

if ($rootScope.Day == 1) {

$scope.ShowRateUs();

} else if ($rootScope.Day == 5) {

$scope.ShowRateUs();

} else if ($rootScope.Day == 10) {

$scope.ShowRateUs();

} else if ($rootScope.Day == 15) {

$scope.ShowRateUs();

$scope.AppNotificate();

} else if ($rootScope.Day == 20) {

$scope.ShowRateUs();

} else if ($rootScope.Day == 25) {

$scope.ShowRateUs();

} else if ($rootScope.Day == 30) {

$scope.ShowRateUs();

$scope.AppNotificate();

} else if ($rootScope.Day == 7) {

$scope.ShowDialogMsg();

$rootScope.NotifyUsers = 0;

$scope.setLocalOption("AppNotifications", $rootScope.NotifyUsers);

} else if ($rootScope.Day == 13) {

$scope.ShowDialogMsg();

$rootScope.NotifyUsers = 0;

$scope.setLocalOption("AppNotifications", $rootScope.NotifyUsers);

} else if ($rootScope.Day == 17) {

$scope.ShowDialogMsg();

$rootScope.NotifyUsers = 0;

$scope.setLocalOption("AppNotifications", $rootScope.NotifyUsers);

} else if ($rootScope.Day == 22) {

$scope.ShowDialogMsg();

$rootScope.NotifyUsers = 0;

$scope.setLocalOption("AppNotifications", $rootScope.NotifyUsers);

} else if ($rootScope.Day == 28) {

$scope.ShowDialogMsg();

$rootScope.NotifyUsers = 0;

$scope.setLocalOption("AppNotifications", $rootScope.NotifyUsers);

} else if ($rootScope.Day == 31) {

$scope.ShowDialogMsg();

$rootScope.NotifyUsers = 0;

$scope.setLocalOption("AppNotifications", $rootScope.NotifyUsers);

}
};

$scope.DevotionDays = function()
{

$rootScope.Date = moment($rootScope.AppFirstRunDate || undefined, "" || undefined);

$rootScope.Day = $rootScope.Date.get("date");

$rootScope.GospLang = $scope.getLocalOption("GospelLanguage");

if ($rootScope.GospLang == 2) {

if ($rootScope.Day == 1) {

$http.get("app/files/tiv/Day1.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo1.jpg";

} else if ($rootScope.Day == 2) {

$http.get("app/files/tiv/Day2.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo2.jpg";

} else if ($rootScope.Day == 3) {

$http.get("app/files/tiv/Day3.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo3.jpg";

} else if ($rootScope.Day == 4) {

$http.get("app/files/tiv/Day4.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo4.jpg";

} else if ($rootScope.Day == 5) {

$http.get("app/files/tiv/Day5.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo5.jpg";

} else if ($rootScope.Day == 6) {

$http.get("app/files/tiv/Day6.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo6.jpg";

} else if ($rootScope.Day == 7) {

$http.get("app/files/tiv/Day7.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo7.jpg";

} else if ($rootScope.Day == 8) {

$http.get("app/files/tiv/Day8.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo1.jpg";

} else if ($rootScope.Day == 9) {

$http.get("app/files/tiv/Day9.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo2.jpg";

} else if ($rootScope.Day == 10) {

$http.get("app/files/tiv/Day10.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo3.jpg";

} else if ($rootScope.Day == 11) {

$http.get("app/files/tiv/Day11.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo4.jpg";

} else if ($rootScope.Day == 12) {

$http.get("app/files/tiv/Day12.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo5.jpg";

} else if ($rootScope.Day == 13) {

$http.get("app/files/tiv/Day13.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo6.jpg";

} else if ($rootScope.Day == 14) {

$http.get("app/files/tiv/Day14.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo7.jpg";

} else if ($rootScope.Day == 15) {

$http.get("app/files/tiv/Day15.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo7.jpg";

} else if ($rootScope.Day == 16) {

$http.get("app/files/tiv/Day16.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo1.jpg";

} else if ($rootScope.Day == 17) {

$http.get("app/files/tiv/Day17.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo2.jpg";

} else if ($rootScope.Day == 18) {

$http.get("app/files/tiv/Day18.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo3.jpg";

} else if ($rootScope.Day == 19) {

$http.get("app/files/tiv/Day19.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo4.jpg";

} else if ($rootScope.Day == 20) {

$http.get("app/files/tiv/Day20.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo5.jpg";

} else if ($rootScope.Day == 21) {

$http.get("app/files/tiv/Day21.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo6.jpg";

} else if ($rootScope.Day == 22) {

$http.get("app/files/tiv/Day22.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo7.jpg";

} else if ($rootScope.Day == 23) {

$http.get("app/files/tiv/Day23.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo8.jpg";

} else if ($rootScope.Day == 24) {

$http.get("app/files/tiv/Day24.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo2.jpg";

} else if ($rootScope.Day == 25) {

$http.get("app/files/tiv/Day25.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo3.jpg";

} else if ($rootScope.Day == 26) {

$http.get("app/files/tiv/Day26.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo4.jpg";

} else if ($rootScope.Day == 27) {

$http.get("app/files/tiv/Day27.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo5.jpg";

} else if ($rootScope.Day == 28) {

$http.get("app/files/tiv/Day28.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo6.jpg";

} else if ($rootScope.Day == 29) {

$http.get("app/files/tiv/Day29.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo7.jpg";

} else if ($rootScope.Day == 30) {

$http.get("app/files/tiv/Day30.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo1.jpg";

} else if ($rootScope.Day == 31) {

$http.get("app/files/tiv/Day31.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo8.jpg";

} else {

$scope.alert("Justclickk", "Invalid time and date on your device, please update now!");

}

} else {

if ($rootScope.Day == 1) {

$http.get("app/files/eng/Day1.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo1.jpg";

} else if ($rootScope.Day == 2) {

$http.get("app/files/eng/Day2.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo2.jpg";

} else if ($rootScope.Day == 3) {

$http.get("app/files/eng/Day3.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo3.jpg";

} else if ($rootScope.Day == 4) {

$http.get("app/files/eng/Day4.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo4.jpg";

} else if ($rootScope.Day == 5) {

$http.get("app/files/eng/Day5.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo5.jpg";

} else if ($rootScope.Day == 6) {

$http.get("app/files/eng/Day6.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo6.jpg";

} else if ($rootScope.Day == 7) {

$http.get("app/files/eng/Day7.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo7.jpg";

} else if ($rootScope.Day == 8) {

$http.get("app/files/eng/Day8.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo1.jpg";

} else if ($rootScope.Day == 9) {

$http.get("app/files/eng/Day9.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo2.jpg";

} else if ($rootScope.Day == 10) {

$http.get("app/files/eng/Day10.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo3.jpg";

} else if ($rootScope.Day == 11) {

$http.get("app/files/eng/Day11.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo4.jpg";

} else if ($rootScope.Day == 12) {

$http.get("app/files/eng/Day12.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo5.jpg";

} else if ($rootScope.Day == 13) {

$http.get("app/files/eng/Day13.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo6.jpg";

} else if ($rootScope.Day == 14) {

$http.get("app/files/eng/Day14.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo7.jpg";

} else if ($rootScope.Day == 15) {

$http.get("app/files/eng/Day15.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo7.jpg";

} else if ($rootScope.Day == 16) {

$http.get("app/files/eng/Day16.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo1.jpg";

} else if ($rootScope.Day == 17) {

$http.get("app/files/eng/Day17.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo2.jpg";

} else if ($rootScope.Day == 18) {

$http.get("app/files/eng/Day18.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo3.jpg";

} else if ($rootScope.Day == 19) {

$http.get("app/files/eng/Day19.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo4.jpg";

} else if ($rootScope.Day == 20) {

$http.get("app/files/eng/Day20.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo5.jpg";

} else if ($rootScope.Day == 21) {

$http.get("app/files/eng/Day21.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo6.jpg";

} else if ($rootScope.Day == 22) {

$http.get("app/files/eng/Day22.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo7.jpg";

} else if ($rootScope.Day == 23) {

$http.get("app/files/eng/Day23.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo8.jpg";

} else if ($rootScope.Day == 24) {

$http.get("app/files/eng/Day24.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo2.jpg";

} else if ($rootScope.Day == 25) {

$http.get("app/files/eng/Day25.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo3.jpg";

} else if ($rootScope.Day == 26) {

$http.get("app/files/eng/Day26.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo4.jpg";

} else if ($rootScope.Day == 27) {

$http.get("app/files/eng/Day27.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo5.jpg";

} else if ($rootScope.Day == 28) {

$http.get("app/files/eng/Day28.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo6.jpg";

} else if ($rootScope.Day == 29) {

$http.get("app/files/eng/Day29.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo7.jpg";

} else if ($rootScope.Day == 30) {

$http.get("app/files/eng/Day30.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo1.jpg";

} else if ($rootScope.Day == 31) {

$http.get("app/files/eng/Day31.txt")
.then(function(response){
  $scope.loadVariables(response.data);
});

$rootScope.Image1.Image = "app/images/devo8.jpg";

} else {

$scope.alert("Justclickk", "Invalid time and date on your device, please update now!");

}

}
};

$scope.ShowRateUs = function()
{

$rootScope.YouRated = $scope.getLocalOption("UserRating");

if ($rootScope.YouRated == 1) {

} else {

if (""+$rootScope.VisitorsCounter+"" >= 10) {

$scope.showModalView("DialogMsgRate");

$rootScope.VisitorsCounter = 1;

$scope.setLocalOption("VisitorCounting", $rootScope.VisitorsCounter);

} else if ($rootScope.VisitorsCounter < 10) {

$rootScope.VisitCount.Value = 1;

$rootScope.VisitorsCounter = parseFloat($rootScope.VisitCount.Value);

$scope.setLocalOption("VisitorCounting", $rootScope.VisitorsCounter);

}

}
};

$scope.ShowDialogMsg = function()
{

$rootScope.ActivateCode = $scope.getLocalOption("ePracticeKey");

if ($rootScope.ActivateCode == $rootScope.DeviceCode) {

} else if ($rootScope.ActivateCode == $rootScope.DonateKey) {

} else if ($rootScope.ActivateCode == $rootScope.OfflineCode) {

} else {

if ($rootScope.VisitorsCounter >= 10) {

$scope.showModalView("DialogMsg");

$rootScope.VisitorsCounter = 1;

$scope.setLocalOption("VisitorCounting", $rootScope.VisitorsCounter);

} else if ($rootScope.VisitorsCounter < 10) {

$rootScope.VisitCount.Value = parseFloat($rootScope.VisitCount.Value + 1);

$rootScope.VisitorsCounter = parseFloat($rootScope.VisitCount.Value);

$scope.setLocalOption("VisitorCounting", $rootScope.VisitorsCounter);

}

}
};

$scope.AdMobShowInterst = function()
{

window.App.Plugins.AdMob.call().AdMobShowInterstitial("ca-app-pub-1498246355762505/5191058072", "false");
};

$scope.SendSMSErrorEvent = function()
{

if (""+$rootScope.ErrorMsg+"" == -1) {

$scope.alertBox("This application must be builded with Apache Cordova before!", "warning");

} else {

$scope.alert("An error occur", "Please make sure there is Credid in SIM-1, then try again.");

}
};

$scope.SendSMSSuccessEvent = function()
{

$scope.alertBox("The message has been sent!", "success");

$rootScope.Button69.Disabled = "true";

$scope.beep(1)
};

$scope.AppNotificate = function()
{

$rootScope.NotifyUsers = $scope.getLocalOption("AppNotifications");

if ($rootScope.NotifyUsers != 1) {

$rootScope.BadgeBtn.Hidden = "";

$rootScope.BadgeBtn.Badge = parseFloat($rootScope.BadgeBtn.Badge + 1);

$rootScope.NotifyClickCount = 0;

}
};

$scope.SetOperator = function(AOperator)
{

$rootScope.Operator = AOperator;

if (""+$rootScope.FirstNumber+"" == "") {

$rootScope.FirstNumber = ""+$rootScope.ResultInput.Value+"";

} else if (""+$rootScope.SecondNumber+"" != "") {

$scope.Calculate();

}
};

$scope.AddHistory = function(Expression, Result)
{

if (""+$rootScope.HistoryTextarea.Value+"" == "") {

$rootScope.HistoryTextarea.Value = ""+Expression+" = "+Result+"\n";

} else {

$rootScope.HistoryTextarea.Value = ""+Expression+" = "+Result+"\n"+$rootScope.HistoryTextarea.Value+"";

}

$scope.setLocalOption("Historial", $rootScope.HistoryTextarea.Value);
};

$scope.InitVariables = function()
{

$rootScope.Operator = "";

$rootScope.FirstNumber = "";

$rootScope.SecondNumber = "";

$rootScope.HistoryTextarea.Value = $scope.getLocalOption("Historial");
};

$scope.InsertNumber = function(Number)
{

if ($rootScope.Operator == "") {

$rootScope.FirstNumber = ""+$rootScope.FirstNumber+""+Number+"";

$rootScope.ResultInput.Value = $rootScope.FirstNumber;

} else {

$rootScope.SecondNumber = ""+$rootScope.SecondNumber+""+Number+"";

$rootScope.ResultInput.Value = $rootScope.SecondNumber;

}
};

$scope.Calculate = function()
{

if(($rootScope.FirstNumber != '') && ($rootScope.SecondNumber != '') && ($rootScope.Operator != '')) {

$rootScope.Expression = ""+$rootScope.FirstNumber+" "+$rootScope.Operator+" "+$rootScope.SecondNumber+"";

$rootScope.ResultInput.Value = Parser.parse($rootScope.Expression).evaluate();

$scope.AddHistory($rootScope.Expression, $rootScope.ResultInput.Value);

$scope.InitVariables();

}
};

$scope.PrepareAppTheme = function()
{

$rootScope.ThemesSelect.Items = $rootScope.App.Themes.concat($rootScope.ThemesSelect.Items);

$rootScope.Theme = $scope.getLocalOption("SavedTheme");

if(($rootScope.Theme != '') && ($rootScope.Theme != $rootScope.App.Theme)) {

angular.element(document.getElementById("appTheme")).attr("href", "builder/styles/" + window.App.Utils.lowerCase($rootScope.Theme) + ".css");
angular.element(document.querySelector("body")).removeClass($rootScope.App.Theme.toLowerCase());
$rootScope.App.Theme = $rootScope.Theme;
angular.element(document.querySelector("body")).addClass($rootScope.App.Theme.toLowerCase());

}

if ($rootScope.Theme == "") {

$rootScope.Theme = "Default";

}

$rootScope.ItemIndex = $rootScope.ThemesSelect.Items.indexOf($rootScope.Theme);

$rootScope.ThemesSelect.ItemIndex = parseFloat($rootScope.ItemIndex);
};

$scope.SaveAppTheme = function()
{

$rootScope.Theme = $rootScope.ThemesSelect.Items[$rootScope.ThemesSelect.ItemIndex];

angular.element(document.getElementById("appTheme")).attr("href", "builder/styles/" + window.App.Utils.lowerCase($rootScope.Theme) + ".css");
angular.element(document.querySelector("body")).removeClass($rootScope.App.Theme.toLowerCase());
$rootScope.App.Theme = $rootScope.Theme;
angular.element(document.querySelector("body")).addClass($rootScope.App.Theme.toLowerCase());

$scope.setLocalOption("SavedTheme", $rootScope.Theme);
};

$scope.MessageBoxCallback = function(ModalResult)
{
};

$scope.MessageBoxCallbackActivate = function(ModalResult)
{

if (ModalResult == 1) {

$scope.showModalView("activate");

} else {

$scope.alertBox("Thank you.  Please make payment before REGISTERING.", "warning");

$scope.showView("Activation");

}
};

$scope.MessageBoxCallbackNotHere = function(ModalResult)
{

if (ModalResult == 1) {

$rootScope.RateApp = $scope.openWindow("https://play.google.com/store/apps/details?id=com.justclickk.utmecbt.pro", "", "_system");

$scope.vibrate(8)

} else {

$scope.alertBox("Thank you.", "warning");

}
};

$scope.ArraySubjects = function()
{

$scope.loadVariables("EnglishArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("MathematicsArray=|SetYear|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("PhysicsArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("ChemistryArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("BiologyArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("GeographyArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("AgricArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("EconomicsArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("HEconomicsArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("AccountingArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("GovernmentArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("CommerceArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("LiteratureArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("HistoryArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("ArtsArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("CRSArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("IRSArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("YorubaArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("HausaArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("FrenchArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");

$scope.loadVariables("MusicArray=|SetYear|All|2017|2016|2015|2014|2013|2012|2011|2010");
};

$scope.ArrayConcatenateItems = function()
{

$rootScope.SelectYear.Items = [];

if (""+$rootScope.SingleIndexRead+"" == 1) {

$rootScope.SelectYear.Items = $rootScope.EnglishArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 2) {

$rootScope.SelectYear.Items = $rootScope.MathematicsArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 3) {

$rootScope.SelectYear.Items = $rootScope.PhysicsArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 4) {

$rootScope.SelectYear.Items = $rootScope.ChemistryArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 5) {

$rootScope.SelectYear.Items = $rootScope.BiologyArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 6) {

$rootScope.SelectYear.Items = $rootScope.GeographyArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 7) {

$rootScope.SelectYear.Items = $rootScope.AgricArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 8) {

$rootScope.SelectYear.Items = $rootScope.EconomicsArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 9) {

$rootScope.SelectYear.Items = $rootScope.HEconomicsArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 10) {

$rootScope.SelectYear.Items = $rootScope.AccountingArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 11) {

$rootScope.SelectYear.Items = $rootScope.GovernmentArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 12) {

$rootScope.SelectYear.Items = $rootScope.CommerceArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 13) {

$rootScope.SelectYear.Items = $rootScope.LiteratureArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 14) {

$rootScope.SelectYear.Items = $rootScope.HistoryArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 15) {

$rootScope.SelectYear.Items = $rootScope.ArtsArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 16) {

$rootScope.SelectYear.Items = $rootScope.CRSArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 17) {

$rootScope.SelectYear.Items = $rootScope.IRSArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 18) {

$rootScope.SelectYear.Items = $rootScope.YorubaArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 19) {

$rootScope.SelectYear.Items = $rootScope.HausaArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 20) {

$rootScope.SelectYear.Items = $rootScope.FrenchArray.concat($rootScope.SelectYear.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 21) {

$rootScope.SelectYear.Items = $rootScope.MusicArray.concat($rootScope.SelectYear.Items);

}
};

$scope.ArrayConcatenateItemsTwo = function()
{

$rootScope.DateSelect.Items = [];

if (""+$rootScope.SingleIndexRead+"" == 1) {

$rootScope.DateSelect.Items = $rootScope.EnglishArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 2) {

$rootScope.DateSelect.Items = $rootScope.MathematicsArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 3) {

$rootScope.DateSelect.Items = $rootScope.PhysicsArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 4) {

$rootScope.DateSelect.Items = $rootScope.ChemistryArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 5) {

$rootScope.DateSelect.Items = $rootScope.BiologyArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 6) {

$rootScope.DateSelect.Items = $rootScope.GeographyArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 7) {

$rootScope.DateSelect.Items = $rootScope.AgricArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 8) {

$rootScope.DateSelect.Items = $rootScope.EconomicsArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 9) {

$rootScope.DateSelect.Items = $rootScope.HEconomicsArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 10) {

$rootScope.DateSelect.Items = $rootScope.AccountingArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 11) {

$rootScope.DateSelect.Items = $rootScope.GovernmentArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 12) {

$rootScope.DateSelect.Items = $rootScope.CommerceArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 13) {

$rootScope.DateSelect.Items = $rootScope.LiteratureArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 14) {

$rootScope.DateSelect.Items = $rootScope.HistoryArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 15) {

$rootScope.DateSelect.Items = $rootScope.ArtsArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 16) {

$rootScope.DateSelect.Items = $rootScope.CRSArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 17) {

$rootScope.DateSelect.Items = $rootScope.IRSArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 18) {

$rootScope.DateSelect.Items = $rootScope.YorubaArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 19) {

$rootScope.DateSelect.Items = $rootScope.HausaArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 20) {

$rootScope.DateSelect.Items = $rootScope.FrenchArray.concat($rootScope.DateSelect.Items);

} else if (""+$rootScope.SingleIndexRead+"" == 21) {

$rootScope.DateSelect.Items = $rootScope.MusicArray.concat($rootScope.DateSelect.Items);

}
};

$scope.Array_LGA_WARD_PUNITS = function()
{

$scope.loadVariables("AGAIEArray=|Select Ward|BARO|BOKU|EKOBADEGGI|EKOSSA|EKOWUGI|EKOWUNA|ETSUGAIE|DAUACI|KUTIRIKO|MAGAJI|TAGAGI");

$scope.loadVariables("BAROArray=|Select Polling Unit|AKWANO_001|BARO I_002|BARO II_003|BAWALAGI_004|ESSUN_005|EVUNTAGI_006|KAKPI_007|KIBBAN_008|KOROKA KPASA_009|GUREGI_010|LAKAN‐EKAGI_011|LOGUMA_012|AKWAGI_013|ZAGO_014");

$scope.loadVariables("BOKUArray=|Select Polling Unit|BOKU_001|CHEKPADAN_002|EDOKO_003|ESSANGI I_004|ESSANGI II_005|JIPO_006|KUSOGBOGI_007|MANFARA_008|NAMI_009|KUNGURU_010");

$scope.loadVariables("EKOBADEGGIArray=|Select Polling Unit|ABDULKADIR UBANDAWAKI_001|ALKALI MUSA_002|BABA DAUDU WAMBAI_003|EMI BABA HALILU_004|ETSU MOH. BELLO_005|MUSA NASIRU GHANATA I_006|MUSA NASIRU GHANATA II_007");

$scope.loadVariables("EKOSSAArray=|Select Polling Unit|EMI DZWAFU_001|EMI FULAKO I_002|EMI FULAKO II_003|ISIYAKU PRIMARY SCHOOL_004|EMI KPOKPOTA_005|NUHU LAFARMA PRIMARY SCHOOL_006|YAKATCHA YABUZUMA_007|WALI SULEIMAN_008|KPOTUN WORO_009");

$scope.loadVariables("EKOWUGIArray=|Select Polling Unit|EFU KENCHI_001|EMI ALIYU BANTIGI_002|EMI LAILA_003|MAN YAHAYA_004|NDAGI KPANU_005|NDAGI KWADZA_006|NDANUSA JIKADA_007|NUHU PRIMARY SCHOOL I_008|NUHU PRIMARY SCHOOL II_009|MUSA GARKUWA_010|OLD POST OFFICE_011");

$scope.loadVariables("EKOWUNAArray=|Select Polling Unit|ABUBAKAR PRIMARY SCHOOL I_001|ABUBAKAR PRIMARY SCHOOL II_002|ABUBAKAR A.G._003|EMI GULUCHI_004|EMI SHESHI_005|ETSU MOH ATTAHIRU_006|LIMAN YUNUSA KENCHI_007|S.I. JIYA GATSHA_008|SULEMAN PRIMARY SCHOOL_009|TELEVISION_010");

$scope.loadVariables("ETSUGAIEArray=|Select Polling Unit|BORORO‐KASANAGI_001|BOROROKO_002|BATAKO_003|EKOGI LANBOWORO_004|EKPAGI_005|EWUGI DAGACHI_006|EYE_007|EWUGI_008|SALAWU_009|SANTALI_010");

$scope.loadVariables("DAUACIArray=|Select Polling Unit|KUTIRIKO NDABATA_001|KUTIRIKO PRIMARY SCHOOL I_002|KUTURIKO PRIMARY SCHOOL II_003|MABA_004|NDA MARAKI_005|NDA KOTSU_006|NUGBAN / KAPAGI_007|SALAWU CIKAN_008|TSADZA_009|TSWA CHIKO_010");

$scope.loadVariables("KUTIRIKOArray=|Select Polling Unit|KUTIRIKO NDABATA_001|KUTIRIKO PRIMARY SCHOOL I_002|KUTURIKO PRIMARY SCHOOL II_003|MABA_004|NDA MARAKI_005|NDA KOTSU_006|NUGBAN / KAPAGI_007|SALAWU CIKAN_008|TSADZA_009|TSWA CHIKO_010");

$scope.loadVariables("MAGAJIArray=|Select Polling Unit|BUGANA_001|EMI SHESHI / UMAR_002|GBENKU_003|GOYIKO_004|JITU MAGAJI_005|SHABA WOSHI_006|SHIPOGI_007|TSADU ZAYIKO_008|TSAKPATI_009|WUNA DAGACHI_010|YELWA_011");

$scope.loadVariables("TAGAGIArray=|Select Polling Unit|ALIKO_001|BINI_002|EGUNKPA_003|FOGBE_004|GBIMINGI_005|GUTSUNGI_006|LAKAN_007|MAKUN‐MALLAM BUBBA_008|MASHINA_009|NDAKO_010|TAGAGI_011|TSWANYA DOKA_012|WONIGI_013|KUSOYABA_014");

$scope.loadVariables("AGWARAArray=|Select Ward|ADEHE|AGWATA|BUSURU|GALLAH|KASHINI|MAGO|PAPIRI|ROFIA|SUTEKU");

$scope.loadVariables("ADEHEArray=|Select Polling Unit|ADEHE PRIMARY SCHOOL I_001|ADEHE PRIMARY SCHOOL II_002|PAPIRI GAJERE_003|KATANDA_004|ANG. KIRYA_005|ANG. MAKERI MASANI_006");

$scope.loadVariables("AGWATAArray=|Select Polling Unit|KASABO_001|KOMALA_002|HAKIYA_003|TUNGAN AJIYA_004");

$scope.loadVariables("BUSURUArray=|Select Polling Unit|BUNSURU PRIMARY_001|GANDIGA_002|BAKATARA_003|KAYALA_004|UNG. AZAKUYA_005");

$scope.loadVariables("GALLAHArray=|Select Polling Unit|GALLA PRI. SCH. I_001|GALLA PRI. SCH. II_002|ANG. PASTOR I_003|ANG. PASTOR II_004|KEGBEDE MASAJI_005|RAFIN KALLAH_006|ZAMALO CHEDO_007");

$scope.loadVariables("KASHINIArray=|Select Polling Unit|AGWARA SANKE I_001|AGWARA SANKE II_002|UNGUWAR BARMANI I_003|UNGUWAR BARMANI II_004|CENTRAL PRIMARY SCHOOL_005|TASHAN FULANI_006|ANACHA_007");

$scope.loadVariables("MAGOArray=|Select Polling Unit|PAPIRI PRIMARY SCHOOL I_001|PAPIRI PRIMARY SCHOOL II_002|TUNGAN LIMAN_003|TUNGAN DORAWA_004|TUNGAN MAGAJI D/ SANGO_005|AZAMA KOSHI_006|KWANA_007");

$scope.loadVariables("PAPIRIArray=|Select Polling Unit|PAPIRI PRIMARY SCHOOL I_001|PAPIRI PRIMARY SCHOOL II_002|TUNGAN LIMAN_003|TUNGAN DORAWA_004|TUNGAN MAGAJI D/ SANGO_005|AZAMA KOSHI_006|KWANA_007");

$scope.loadVariables("ROFIAArray=|Select Polling Unit|ROFIA PRIMARY SCHOOL I_001|ROFIA PRIMARY SCHOOL II_002|JIJIMA_003|ORORO BAKIN RUWA_004|TSOHON ROFIA_005");

$scope.loadVariables("SUTEKUArray=|Select Polling Unit|SUTEKO PRIMARY SCHOOL_001|MAHUTA PRI. SCH_002|BAYAN DUTSE_003|TUNGAN KADAI_004");

$scope.loadVariables("BIDAArray=|Select Ward|BARIKI|CENIYAN|DOKODZA|KYARI|LANDZUN|MASABA I|MASABA II|MASAGA I|MASAGA II|MAYAKI NDAJIYA|NASSARAFU|UMARU/MAJIGI I|UMARU/MAJIGI II|WADATA");

$scope.loadVariables("BARIKIArray=|Select Polling Unit|GOVERNMENT MODEL SCHOOL_001|EMI GBATE I_002|EMI GBATE II_003|EMI BABA AMA_004|SABON GIDA PRIMAR SCHOOL_005|EMI BELLO DZWAFU_006|EMI DAUDA SHESHI I_007|EMI TAKA_008|EMI MANZURUKU I_009|EMI MANZURUKU II_010|ETSU GBARI I_011|ETSU GBARI II_012|EMI SONFADA SHABA_013|GUDU NDASA_014|EMI RANI_015|");

$scope.loadVariables("CENIYANArray=|Select Polling Unit|ALHAJI TAFA_001|CHENIYA_002|ALH. SALIHU ZANFARA_003 |BAMISUN ESSO_004|EMI BOKANNICHI_005|EMI SAGANNUWAN_006|EMI ALHAJI DEWO_007|EMI ALHAJI NMAYAWO_008|EFFENGI GALADIMA_009|DZWAYAGI_010|IBRAHIM TAIKO G/ PRIMARY SCHOOL_011|LAFIYAGI KPEBBEGI_012|MAYAKI LEGBODZA_013|SARKIN KUDU_014|SHEHU MASANDU_015|YABAGI KARFI_016");

$scope.loadVariables("DOKODZAArray=|Select Polling Unit|ALHAJI NDADZUNGI B/WUYA_001|DOKODZA PRIMARY SCHOOL_002|EMI MAGAYAKI_003|EMI ALH. MAKANTA_004|EMI NDAISA MAIMAGANI_005|EMI BABA JABA I_006|GBAZHI VILLAGE_007|EBBANSHI K/WUYA_008|MAKANTA WAWAGI_009|NDAMARAKIPRIMARY SCHOOL_010|NDEJI AMINU_011|POLICE STATION_012|SOLLAWUTSU PRIMARY SCHOOL_013|TSWATA BABA NDEJI_014|TIFIN TSWAKO PRIMARY SCHOOL_015|YISANTA_016|BABA JABA II_017");

$scope.loadVariables("KYARIArray=|Select Polling Unit|BANGAIE LOW COST_001|EMI BAGBA_002|EMI NDATSWAKI_003|ETSU MUSA BELLO_004|GBAJIGI_005|IBRAHIM MAKUN_006|LIMAN BANGAIE_007|LUBASAFUBI_008|ALIKALI MUSA_009|MAJIN DADI WONIGI_010|MAISANDA ETSWAFURA_011|MASAGA MARKET_012|MOKWALA DISPENSARY_013|SARKIN AYYUKA_014|UMARU SHESHI PRIMARY SCHOOL_015|YAYAKO KPEGBE_016");

$scope.loadVariables("LANDZUNArray=|Select Polling Unit|ALH. IBRAHIM LEMU_001|BENU LONCHITA_002|BENU DZUKOGI_003|EMI GABISAYEDI_004|ALKALI ALFA LAGA_005|TAKO SHESHI_006|IBRAHIM DRIVER_007|MAN NDAGANA KATCHA_008|TSWATA MUKUN_009|TSWASHAGI RABBA_010");

$scope.loadVariables("MASABA_IArray=|Select Polling Unit|EMI ALHAJI NDAKOTSU	001|EMI ETSU YAGI_002|KPOTUN NAGYA_003|MAJIN LALEMI_004|EMI ALHAJI ATIKU_005|MUSA NDACHE_006|SARKIN GONA TSADO_007|SONFAWA SULEMAN_008");

$scope.loadVariables("MASABA_IIArray=|Select Polling Unit|ALHAJI BABA KPAKO_001|ALHAJI BABA KPAKO_001 |ALHAJI BABA KPAKO_001|EMI MANLABECHI_002|EMI ESU SABA_003|EMI NAKORDI_004|EFU TURI_005|EMI KOTONKOMU_006|MAZAWOJE_007|E. ROFYAN ABUBAKAR_008|EMI SONKYARA GOZAN_009|EMI ALHAJI NDAKURE_010");

$scope.loadVariables("MASAGA_IArray=|Select Polling Unit|ISLAMIYA PRIMARY SCHOOL_001|BANTUWA_002|IYARUWA PRIMARY SCHOOL_003|KOTONKO MU TADAFU_004|GBONGBOFU_005");

$scope.loadVariables("MASAGA_IIArray=|Select Polling Unit|EMI ALIKALI DAUDA_001|ALH. BABA NAGI YAWO_002|EMI ALFA DUKIYA_003|CIROMA SAMARI_004|EMI MANTAHIRU_005|EMI NDATSA_006");

$scope.loadVariables("MAYAKI_NDAJIYAArray=|Select Polling Unit|ALHAJI NDALIMAN_001|EMI KUTIGICHIZI_002|EMI GBATE_003|EMI MADAMI_004|MAYAKI NDAJIYAPRY.SCH._005|EMI SONFADA LUKPAN I_006|KATAMBAKO_007|EMI LAFARMA_008|NDALIMAN TAKO LANDZUN_009|NDAGI MAFARI_010|SONFADA LUKPAN II_011|SONFADA HALILU_012|SONFADA SHABA_013|WAMBAI PRI,ARY SCHOOL_014|EMI UBANDAWAKI_015");

$scope.loadVariables("NASSARAFUArray=|Select Polling Unit|DARACHITA GUDUKU_001|BABATAKO BANGAIE_002|BANGAYI SOFADA KPOTUN_003|ISAH LEJE_004|MAN MUSA GODOGI_005|DARACHITA PRIMARY SCHOOL_006|LIMAN PRIMARY SCHOOL_007|G.S.T.C._008|UMARU SANDA PRIMARY SCHOOL_009|ALH. SULE BANYAGI_010|KARAKO_011|EMI ALH. BABA KASHI_012");

$scope.loadVariables("UMARU_MAJIGI_IArray=|Select Polling Unit|ALH. ALFA YEKOKO_001|BANTIGI PRIMARY SCHOOL_002|EMI NDAIJI UMARU_003|EMI ETSU UMARU_004|EMI KPOTUN ABDULMALIK_005|MASALLACHI BANIN_006|LUKPAN NASIR_007");

$scope.loadVariables("UMARU_MAJIGI_IIArray=|Select Polling Unit|ABUBAKAR ANIKE PRIMARY SCHOOL_001|YATENGI EGBABORO_002|EDOGIFU PRIMARY SCHOOL_003|EMI NDAKPAYI_004|EMI CHEKPA_005|EMI ALIKALI DANGANA_006|EMI NATSU_007");

$scope.loadVariables("WADATAArray=|Select Polling Unit|EMI A. A. BADAKOSHI_001|BAGUDU B.C.C.C. I_002|BAGUDU B.C.C.C. II_003|BAGUDU MAIGORO_004|EMI GARI_005|EMI KOLOTAKI_006|EMI SUNNATSOZHI_007|EMI MAJINKIMPA_008|EMI SONFADAKO_009|KOFAR WUYA LOW COST_010|NDAYAKO PRIMARY SCHOOL_011|MAIYAKI ANNI PRIMARY SCHOOL_012|EMI MAJIN HASSAN_013|EMI LIMAN MAISHARA_014|MAHMUD PRY.SCH._015");

$scope.loadVariables("CHANCHAGA_LGA_Array=|Select Ward|LIMAWA 'A'|LIMAWA 'B'|MAKERA|MINNA CENTRAL|MINNA SOUTH|NASSARAWA 'A'|NASSARAWA 'B'|NASSARAWA 'C'|SABON GARI|TUDUN WADA NORTH|TUDUN WADA SOUTH");

$scope.loadVariables("LIMAWA_AArray=|Select Polling Unit|KOFAR TANKO GAJERE_001|FIRE SERVICE_002|W.T.C._003|KOFAR GARBA ZAGO_004|KOFAR UMAR BAYEREBE_005|KOFAR UMARU KURA I_006|KOFAR UMAR KURA II_007|KOFAR ALHAJI YABAGI_008|KASUWAN DARE_009|OFISHIN DAGACHI_010|OFISHIN DAGACHI_010|KOFAR BADUNGURE_011|ASIBITIN KUTARE_012|KOFAR DANJUMA_013|AIR PORT QUARTERS_014|INTERMEDIATE QUARTERS_015|KOFAR ALHAJI YARO_016|KOFAR MAHMUDU KUNDU_017");

$scope.loadVariables("LIMAWA_BArray=|Select Polling Unit|ZARUMAI MODEL SCHOOL_001|TYPE 'B' QUARTERS(HOUSE NO.1)_002|DUTSEN KURA PRIMARY SCHOOL_003 |DUTSEN KURA HAUSA I_004|DUTSEN KURA HAUSA II_005|SHANU AREA_006|GIDAN HASSAN_007|FADUKPE_008|DUTSEN KURA GWARI I_009|DUTSEN KURA GWARI II_010|ANGUNAN KWARKWATA_011|OLD TENNIS COURT_012");

$scope.loadVariables("MAKERAArray=|Select Polling Unit|KOFAR DANKAWU_001|KOFAR BAWA MAIWANKI_002|ANWUARUDEEN MOSQUE_003|FILIN QUARTERS_004|HASSAN KUKURUKU_005|KOFAR MADAKI_006|IKON ALLAH MOTORS_007|WARD HEAD OFFICE_008| ANSARUDEEN MOSQUE_009|HOSPITAL GATE_010|RAILWAY POLICE BARRACKS_011|POLICE BARRACKS_012|UMARU ERANA ROAD JUNCTION_013|PIGERY JUNCTION_014|POLICE TRAINIG SCHOOL_015");

$scope.loadVariables("MINNA_CENTRALArray=|Select Polling Unit|KASUWAN ZABARMA_001|GIDAN LIMAN GABAS_002|KOFAR YUSUF PAIKO_003|KOFAR BUSARI_004|KOFAR ALHAJI HARUNA_005|KOFAR TSWANYA_006|KUYAMBANA PRIMARY SCHOOL_007|OPPOSITE OGBARA PHARMACY_008|KOFAR SULE GARBA_009|KOFAR KWAKWARA_010|FOFAR TAUHID_011|MECHANIC WORKSHOP_012|ZAGURU BOOKSHOP_013|DR. FAROUK PRIMARY SCHOOL I_014|DR. FAROUK PRIMARY SCHOOL II_015");

$scope.loadVariables("MINNA_SOUTHArray=|Select Polling Unit|KUTIRKO /GBAGANU_001|NIKANGBE VILLAGE_002|KOFAR IBRAHIM SHABA_003|KOFAR BALA SULE_004|YAMAHA NIGHT CLUB_005|KOFAR MAI ANGUWAN SOJE_006|KOFAR D.P.O. SOJE_007|GINDIN MONGORO_008|KOFAR ISSAH GWAMNA_009|KOFAR LIMAN KUDU_010|KOFAR JOJI_011|NEAR DEEPER LIFE_012|KOFAR IBRAHIM SHABA 'N'_013|NEAR ST. MARY CHURCH_014");

$scope.loadVariables("NASSARAWA_AArray=|Select Polling Unit|KOFAR HAKIMI_001|KOFAR DABACHI_002|KOFAR ABDUL LASISI TELA_003|GUNI ROAD_004|KOFAR GARBA GWARI_005|KOFAR MAIKEKE_006|FILIN YANSANDA_007|KOFAR ALKALIN KUTA_008|KOFAR NDATSU_009|KOFAR NDAKO ISAH_010|ALH. GARBA MAI BABAA‐ALJIHU_011|KOFAR ISAH MAKERI_012|MAKARANTA (NEAR EMIR'S PALACE)_013|KOFAR DALLATU_014|KOFAR WAZIRI_015|FILIN LAMINGO_016|PAIDA JUNCTION_017|KOFAR ALIYU KWAKWARA_018|S.P. 105 PAIDA JUNCTION_019");

$scope.loadVariables("NASSARAWA_BArray=|Select Polling Unit|KOFAR MADAKI AYAWA_001|KOFAR SARKIN PADA_002|KOFAR UMARU AUDI_003|KOFAR SALIHU MAIJAKI_004|KOFAR ALI KATSINA_005|KOFAR NDAMAN_006|KOFAR DOGON‐MORO_007|VET. OFFICE_008|KOFAR TANKO KUTA I_009|KOFAR TANKO KUTA II_010|FILIN MAKANIKAI_011|FILIN WAKILI_012|KOFAR WAKILIN NUPAWA_013|NEAR JONAPAL SUPER MARKET_014");

$scope.loadVariables("NASSARAWA_CArray=|Select Polling Unit|KOFAR YAKUBU (DIREBAN SARKI)_001|KOFAR MALLAM MIKO_002|KOFAR ALHAJI SALAU (I)_003|KOFAR ALHAJI SALAU (II)_004|KOFAR KOROSO_005|CHIROMA PRIMARY SCHOOL_006|KOFAR WACHIKO_007|E.R.C_008|SIMBA GUEST INN_009|TAYI VILLAGE_010|KOFAR MAIANGUWA SABON NASSARAWA_011|KOFAR MALLAM SANI_012");

$scope.loadVariables("SABON_GARIArray=|Select Polling Unit|GBEDNAYI_001|TUDUN NATSIRA_002|FILIN YAKUBU_003|KOFAR AUDU GWARI_004|SABON GAREJI_005 |KOFAR BABA ABUJA_006|BAKINGADA UNGUWAN KAJE_007|KOFAR MAIANGUWA KAJE_008|HAUSA BAPTIST CHURCH_009|KOFAR ALHAJI ISYAKU_010|KUTA ROAD JUNCTION_011|TAIMAKO CLINIC_012|KOFAR BABA BUBU_013|GIDAN MARAFA_014|MARKET ROAD_015|WARD HEAD OFFICE_016|OPPOSITE GWARI MARKET_017|ABDUL STREET_018|KOFAR BABA MALLAM_019|UP‐HILL WATER TANK_020|KOFAR ALHAJI TANKO BARAU_021");

$scope.loadVariables("TUDUN_WADA_NORTHArray=|Select Polling Unit|TUNGA MARKET I_001|TUNGA MARKET II_002|FUSKAR GABAS_003|FUSKAR AREWA_004|OLD AREA COURT_005|KOFAR KUCHAZHI_006|NEW EAST ROAD_007|LIBERTY NIGHT CLUB_008|ISLAMIYA SCHOOL_009|OPPOSITE CBN QUARTERS_010|COCA‐COLA DEPOT_011|KAMPANI_012|FUSKAR YAMMA_013");

$scope.loadVariables("TUDUN_WADA_SOUTHArray=|Select Polling Unit|KOFAR UBANDOMA_001|KWAKWARA DANDAURA_002|KOFAR YELWA I_003|UNION OFFICE_004|KASUWAN MAJE I_005|KOFAR JIBRIN GAWU_006|SABON ASIBITI_007|LOCAL GOVERNMENT GUEST HOUSE_008|OLD NIGERIA AIRWAYS_009 |GIDAN KOLAWALE_010|SABON ASIBITI (MUSA UMARU CLOSE)_011|TILAPIA RESTAURANT_012|UMARU AUDI MEMORIAL PRIMARY SCHOOL_013|HOUSE NO. 48 TUNGA LOW COST_014|HOUSE NO 148 TUNGA LOW‐COST_015|KOFAR DOGON RUWA_016|OPPOSITE SHIRORO HOTEL_018|GIDAN MAI ANGUWAN GWAGWAPI_019|KASUWAN MAJE (II)_020|KOFAR YELWA (II)_021|KOFAR YELWA (II)_021");

$scope.loadVariables("GURARAArray=|Select Ward |BONU|DIKO|GAWU|IZOM|KABO|KWAKA|LAMBATA|LEFU|SHAKO|TUFA");

$scope.loadVariables("BONUArray=|Select Polling Unit|BAJI PRIMARY SCHOOL_001|BONU PIMARY SCHOOL_002|DADO VILLAGE_003|DAGIGBE VILLAGE_004|EBBAH VILLAGE_005|TUNA PRIMARY SCHOOL_006");

$scope.loadVariables("DIKOArray=|Select Polling Unit|UNGUWAN HAUSAWA PRIMARY SCHOOL I_001|UNGUWAN HAUSAWA PRIMARY SCHOOL II_002|BOYI PRIMARY SCHOOL_003|DAKU PRIMARY SCHOOL_004|DIKO CENTRAL PRIMARY SCHOOL_005|DIKO RESERVIOR_006|DIKO TASHA_007|KANYIGBANA_008|KOFAN GIDAN SARKIN DIKO_009|SULLU PRIMARY SCHOOL_010|SULLU PRIMARY SCHOOL_010|YAGURU VILLAGE_011");

$scope.loadVariables("GAWUArray=|Select Polling Unit|DAWAKI_001|GWADABE PRIMARY SCHOOL I_002|GWADABE PRMARY SCHOOL II_003|KOFAR GIDAN GALADIMA KITIKPA_004|KOFAR GIDAN HAKIMI BAKO_005|MODEL PRIMARY SCHOOL_006");

$scope.loadVariables("IZOMArray=|Select Polling Unit|ABUCHI PIMARY SCHOOL_001|BAKIN KASUWA_002|CENTRAL PRIMARY SCHOOL IZOM I_003|CENTRAL PRIMARY SCHOOL IZOM II_004|GWALE PRIMARY SCHOOL_005|KOFAR GIDAN A. SIDI IZOM_006|KOFAR GIDAN GALADIMA IZOM_007|KOFAR GIDAN HASSAN TAGWAI_008");

$scope.loadVariables("KABOArray=|Select Polling Unit|IWA PRIMARY SCHOOL_001|KABO PRIMARY SCHOOL I_002|KABO PRIMARY SCHOOL II_003|KOFAR GIDAN HAKIMIN KABO_004|SHANU PRIMARY SCHOOL_005");

$scope.loadVariables("KWAKAArray=|Select Polling Unit|BURUM PRIMARY SCHOOL_001|FYAKUCHI VILLAGE_002|GWACIPE PRIMARY SCHOOL_003|KWAKA PRIMARY SCHOOL_004|LAIBA VILLAGE_005|LAHU PRIMARY SCHOOL_006|TUCHI PRIMARY SCHOOL_007");

$scope.loadVariables("LAMBATAArray=|Select Polling Unit|GBAMITA_001|KOFAN GIDAN SARKIN KUNGO_002|KOKOGBE_003|LAMBATA PRIMARY SCHOOL I_004|LAMBATA PRIMARY SCHOOL II_005|PADAWA_006");

$scope.loadVariables("LEFUArray=|Select Polling Unit|KANJERE_001|LEFU PRIMARY SCHOOL I_002|LEFU PRIMARY SCHOOL II_003|PETEPE_004|PASELI PRIMARY SCHOOL_005|TAYELE PRIMARY SCHOOL_006");

$scope.loadVariables("SHAKOArray=|Select Polling Unit|GUNI PRIMARY SCHOOL_001|IKUMI PRIMARY SCHOOL_002|SHAKO PRIMARY SCHOOL I_003|SHAKO PRIMARY SCHOOL II_004|SEJI VILLAGE_005");

$scope.loadVariables("TUFAArray=|Select Polling Unit|BOKU MADAKI_001|BOKU SARKI_002|DOMI PRIMARY SCHOOL_003|KOFAR GIDAN MADAKI TUFA_004|KUDNA PRIMARY SCHOOL_005|TUFA PRIMARY SCHOOL I_006|TUFA PRIMARY SCHOOL II_007|TUFA LOLI TAPI_008");

$scope.loadVariables("KONTAGORAArray=|Select Ward|AREWA|CENTRAL|GABAS|KUDU|MAGAJIYA|MASUGA|MADARA|NAGWAMATSE|RAFIN GORA|TUNGANWAWA|TUNGAN KAWO|USALLE|YAMMA");

$scope.loadVariables("AREWAArray=|Select Polling Unit|SARKIN KANWA_001|LIMAN HABIBU_002|UNG. WAZIRI_003|TUKURA I_004|TUKURA II_005|TUKURA III_006|MAGAYAKI I_007|MAGAYAKI II_008|TURAKI I_009|TURAKI II_010");

$scope.loadVariables("CENTRALArray=|Select Polling Unit|KOFAR GIDAN BASHARI_001|GALADIMA I_002|GALADIMA II_003|ALKALI MUSTAPHA_004|MAJIDADI_005|KOFAR GIDAN MADAWAKI_006|ALERA_007|KOFAR BUNU_008|LIMAMIN GARI KANAWA I_009|LIMAMIN GARI KANAWA II_010|SARKIN YARBAWA I_011|SARKIN YARBAWA II_012|ALI YARA I_013|ALI YARA II_014");

$scope.loadVariables("GABASArray=|Select Polling Unit|ANGUWAN GWARI I CENTRAL PRIMARY SCHOOL_001|GABBAS_002|ANGUWAN YANSANDA T/WADA_003|SOJOJI I ARMY PRIMARY SCHOOL_004|SOJOJI II ARMY PRIMARY SCHOOL_005|SOJOJI III ARMY PRIMARY SCHOOL_006|SARKI BELLO (HODIO)_007|KOFAR GIDAN MALLAM AHAMADU_008");

$scope.loadVariables("KUDUArray=|Select Polling Unit|ANG. JANKIDI GARKUWA_001|SARKIN MAKERA_002|YAN SARKI (FADA)_003|SARKIN BAUCHI USMAN_004|ALH. DAN UMMA I_005|ALH. DAN UMMA II_006|SARKIN KIDI (GIDAN) ALI MARAFA_007|RIMAYE PRIMARY SCHOOL_008|UNG. ZABARMAWA I_009|UNG. ZABARMAWA II_010|LOWCOST GRA ZANGO PRIMARY SCHOOL_011|T/WADA I_012|T/WADA II_013|T/WADA III_014|YAN HAUSA I K/G ALI ANARUWA_015|YAN HAUSA II (CHADON DAJI CLOSE)_016|NASARAWA K/GIDAN MUSA (MAIDOYA)_017");

$scope.loadVariables("MAGAJIYAArray=|Select Polling Unit|SARKIN BINDIGA I_001|SARKIN BINDIGA II_002|MADAWAKIN BINDIGA_003|KOFAR GIDAN MAGAJIYA_004|KOFAR GIDAN ALH. ALI I_005|KOFAR GIDAN ALH. ALI II_006|UBANDOMA I_007|UBANDOMA II_008|K/GIDAN LIBA I_009|K/GIDAN LIBA II_010");

$scope.loadVariables("MASUGAArray=|Select Polling Unit|MASUGA PRIMARY SCHOOL_001|MATACHIBU MAIRA_002|MATACHIBU_003|MAGU DAKARKARI_004|K/MAJE BARUMI_005|UNG. S. DAKARKARI_006|FADAMA I_007|FADAMA II_008|FADAMA III_009|UNG. GA ALLAH_010|LIOJI KAMFANI_011|LIOJI NARUNGU_012|BATURE NOMA_013|S/DUKAWA G. DALA_014|UDARA GARI K/G LIMAN_015");

$scope.loadVariables("MADARAArray=|Select Polling Unit|MADARA GARI I_001|MADARA GARI II_002|KWANGWARA_003|IBANGA I_004|IBANGA II_005|F.C.E. I_006|F.C.E. II_007|USHINDA_008|TUNGAN MAIKOMO_009|RAGADAWA_010|MASAHA_011|TUNGAN HABU_012");

$scope.loadVariables("NAGWAMATSEArray=|Select Polling Unit|USALLE GARI_001|RAFIN GORA YAMMA I_002|RAFIN GORA YAMMA II_003|RAFIN GORA KUDU_004|SABUWAR KAGARA_005|TSOHUWAR KAGARA_006|NOMA KINTA I_007|NOMA KINTA II_008");

$scope.loadVariables("RAFIN_GORAArray=|Select Polling Unit|RAFIN GORA GABBAS_001|TADALI I RIJIYAN NAGWAMATSE_002|TADALI II RIJIYAN NAGWAMATSE_003|UCHAU FARIN SHINGE I_004|UCHAU FARIN SHINGE II_005|ALALAHO MACHANGA_006|GWADAN_007|RAFIN KARMA_008");

$scope.loadVariables("TUNGANWAWAArray=|Select Polling Unit|TUNGAN WAWA GABBAS I_001|TUNGAN WAWA GABBAS II_002|TUNGAN WAWA YAMMA_003|UTACHU GARI_004|UTACHU LIMAN_005|DAPPO_006|TUNGA NA UKU_007|MADANGYAN I_008|MADANGYAN II_009|MAGANDU GARI/DAJI_010|GANAWA_011|ALALA_012|ALALA (UNG. LIMAN)_013");

$scope.loadVariables("TUNGAN_KAWOArray=|Select Polling Unit| TUNGAN KAWO PRIMARY SCHOOL I_001|TUNGAN KAWO PRIMARY SCHOOL II_002|TUNGAN KAWO YAMMA_003|TUNGAN KAWO KUDU_004|TUNGA GARI_005|USUBU VILLAGE_006|TUNGAN MAILEHE_007");

$scope.loadVariables("USALLEArray=|Select Polling Unit|YAN DILLALAI I_001|YAN DILLALAI II_002|BISO KAROFI_003|SARKIN KASUWA_004|SARKIN PAWA_005|ALH. GWADABE I_006|ALH. GWADABE II_007|K/USMAN DATTI I_008|K/USMAN DATTI II_009|KOFAR ARA I_010|KOFAR ARA II_011|MATAWALE_012|ATTALOLI_013|YAN SANDA 'B' DIVISION_014");

$scope.loadVariables("YAMMAArray=|Select Polling Unit|YAN DILLALAI I_001|YAN DILLALAI II_002|BISO KAROFI_003|SARKIN KASUWA_004|SARKIN PAWA_005|ALH. GWADABE I_006|ALH. GWADABE II_007|K/USMAN DATTI I_008|K/USMAN DATTI II_009|KOFAR ARA I_010|KOFAR ARA II_011|MATAWALE_012|ATTALOLI_013|YAN SANDA 'B' DIVISION_014");

$scope.loadVariables("LAPAIArray=|Select Ward|AREWA/YAMMA|BIRNIN MAZA/TASHIBO|EBBO/GBACINKU|EVUTI/KPADA|GULU/ANGUWA VATSA|GUPA/ABUGI|GURDI/ZAGO|KUDU/GABAS|MUYE/EGBA|TAKUTI/SHAKU");

$scope.loadVariables("AREWA_YAMMAArray=|Select Polling Unit|BANI PRIMARY SCHOOL_001|KOBO PRIMARY SCHOOL (AREA COURT)_002|ONE POUND TWO_003|EFUMAJI OPEN SPACE (GIDAN ALHAJI YAKUBU)_004|BATAFU OPEN SPACE (GIDAN BARWA)_005|EFUKENCHI OPEN SPACE (GIDAN SARKIN HAUSAWA)_006|TUDUN FULANI PRY SCH_007|BARGU PRY SCH_008|STATE LOWCOST (LOWCOST FORMER BABA HOUSE)_009");

$scope.loadVariables("BIRNIN_MAZA_TASHIBOArray=|Select Polling Unit|SAMINAKA PRIMARY SCHOOL I_001|BIRNIN MAZA PRIMARY SCHOOL_002|DANGANA PRIMARY SCHOOL_003|TASHIBO PRIMARY SCHOOL_004|MAYAKI PRIMARY SCHOOL_005|MAWOGI PRIMARY SCHOOL_006|SONFADA PRY. SCH._007");

$scope.loadVariables("EBBO_GBACINKUArray=|Select Polling Unit|EBBO RUKO PRY. SCH_001|ADP STOES (GIDAN ALHAJI GIMBA)_002|KUCHI KEBBA PRY. SCH_003|GBACENKU PRY. SCH_004|KATAKPA PRY. SCH_005|BAZHI PRY. SCH_006|DAKUGATI OPEN SPACE (DAKUGATI KOFAR HAKIMI)_007|GBAGE PRIMARY SCHOOL_008|ELEGI OPEN SPACE (ELEGI KOFAR MAI ANGUWA)_009|RAKAPA RAKAPU OPEN SPACE (RAKAPA RAKAPU KOFAR MAI ANGUWA)_010");

$scope.loadVariables("EVUTI_KPADAArray=|Select Polling Unit|EVUTI PRIMARY SCHOOL_001|EKAN PRIMARY SCHOOL_002|NUGBAGI PRY. SCH_003|KPADA PRIMARY SCHOOL_004|DOBOGI PRY SCH_005|MUTI PRIMARY SCHOOL_006|GAWA PRIMARY SCHOOL_007|EFFAN OPEN SPACE (EFFAN KOFAR GIDAN SARKI)_008|EMILEBAN PRY SCH_009|KPADA GWARI OPEN SPACE (KPADA GWARI KOFAR MAI ANGUWA)_010");

$scope.loadVariables("GULU_ANGUWA_VATSAArray=|Select Polling Unit|KANDI PRIMARY SCHOOL_001|EDDO PRIMARY SCHOOL_002|VATSA PRIMARY SCHOOL_003|GULU CENTRAL PRIMARY SCHOOL_004|NDACE KOLO_005|ZABBO PRIMARY SCHOOL_006|EWUGI PRIMARY SCHOOL_007|GBEDAKO PRIMARY SCHOOL_008|VOLEGBO_009|GULU ANGUWA_010");

$scope.loadVariables("GUPA_ABUGIArray=|Select Polling Unit|opGUPA BOKYO PRIMARY SCHOOL_001|opBWAJE PRIMARY SCHOOL_002|opKIRIKIPO PRIMARY SCHOOL_003|GBEDU PRIMARY SCHOOL_004|GAYANKPA PRIMARY SCHOOL_005|EMIKO DISPENSARY_006|YELWA DISPENSARY_007|KAGBODU PRIMARY SCHOOL_008|FAVU PRIMARY SCHOOL_009|CEPA PRIMARY SCHOOL_010|DAGBAJE PRIMARY SCHOOL_011|JANKARA PRIMARY SCHOOL_012|JAKUCHITA PRIMARY SCHOOL_013|KANIGI PRIMARY SCHOOL_014|EBATI PRIMARY SCHOOL_015|GURUGUDU PRIMARY SCHOOL_016");

$scope.loadVariables("GURDI_ZAGOArray=|Select Polling Unit|ZAGO PRIMARY SCHOOL001|KAPAKO PRIMARY SCHOOL_002|NASARAWA PRIMARY SCHOOL I_003|NASRAWA PRIMARY SCHOOL II_004|GURDI_005|DUMA PRIMARY SCHOOL_006SABON OREHE_007");

$scope.loadVariables("KUDU_GABASArray=|Select Polling Unit|CENTRAL PRIMARY SCHOOL (GIDAN YARIMA)_001|MANGORO OPEN SPACE (GIDAN BADIDI)_002|VIO OFFICE (GIDAN VIO)_003|DANIYA I OPEN SPACE (GIDAN DANIYA I)_004|DANIYA II OPEN SPACE (GIDAN DANIYA II_005GIDAN LAPARMA_006|TUDUN FULANI DANKO_007|SANKURMI OPEN SPACE (GIDAN SARKIN HAUSAWA)_008");

$scope.loadVariables("MUYE_EGBAArray=|Select Polling Unit|MUYE PRIMARY SCHOOL_001|DERE PRIMARY SCHOOL_002|ESHIN_003|EGBA PRIMARY SCHOOL_004|EGBA PRIMARY SCHOOL_005|ARAH PRIMARY SCHOOL_006|ACHIBA PRIMARY SCHOOL_007|BINNA PRIMARY SCHOOL_008|CHEKU OLD PRIMARY SCHOOL_009|SOKUN PRIMARY SCHOOL_010|GBAMI PRIMARY SCHOOL_011|YAWA PRIMARY SCHOOL_012|BAKA PRIMARY SCHOOL_013|APATAKU PRIMARY SCHOOL_014");

$scope.loadVariables("TAKUTI_SHAKUArray=|Select Polling Unit|TAKUTI SHABA PRIMARY SCHOOL I_001|CECE RAFI_002|GABI PRIMARY SCHOOL_003|ETSUGI PRIMARY SCHOOL_004|GBACIDAN PRIMARY SCHOOL_005|SHAKU PRIMARY SCHOOL_006|DAPUGI PRIMARY SCHOOL_007|ZOLEGI_008|TAKWUTI ABUJA_009|DZWAFU_010|LEMFA_012|ACHITUKPA|SUDUGI_011_013");

$scope.loadVariables("MAGAMAArray=|Select Ward|AUNA CENTRAL|AUNA EAST CENTRAL|AUNA EAST|AUNA SOUTH EAST|AUNA SOUTH|IBELU CENTRAL|IBELU EAST|IBELU NORTH|IBELU WEST|NASKO|NASSARAWA|");

$scope.loadVariables("AUNA_CENTRALArray=|Select Polling Unit|ALANGASA_001|BALUGUT MANU_002|DOGON LAMBA_003|FARAR KASA_004|GWADE_005|MAKWALLA_006|MAKWALLA MAKARANTA I_007|MAKWALLA MAKARANTA II_008|MADUNGURU_009|MADADIN KOWA_010|SHIWATE_011|S. DAKA_012|T/BAKO_013|UNG. DABA_014");

$scope.loadVariables("AUNA_EAST_CENTRALArray=|Select Polling Unit|GWAGWADE_001|KAGMBA I_002|KACINBA I_003|UNG. YARBAWA_004|UNG. MAGAJI_005|UBANDAWAKI_006|FARA KASA_007|LIKO'O_008|UNG. MATASA_009|UNG. HAUSAWA I_010|UNG. HAUSAWA II_011|MAIDABO_012|MAMBA_013|KABALA_014|BARIKI D. SALKA_015|UNG. KUTUKU (BUSRA)_016|TUNGAN SARA_017|LADE_018");

$scope.loadVariables("AUNA_EASTArray=|Select Polling Unit|WANDO TSAKIYA_001|MAPAPU T. WADA_002|MEJEME_003|MAJINGA_004|T/KADE_005|NANDO TSAKIYA_006|RABA GARI_007|WANDO KETERE_008|UNG. SARKI KURA_009|UNG. SARKI RAHA_010|UNG. HAUSAWA KURA_011|UNG. AMALE_012");

$scope.loadVariables("AUNA_SOUTH_EASTArray=|Select Polling Unit|BALUGUN WADATA_001|GURAI_002|KAWO GARI_003|KAWO YAMMA_004|KOKOLO_005|KOSO_006|MADALLO_007|MAREVEM_008|MAZAKARI_009|MARA'A_010|WALAPU_011|MAKULU_012|MAKWARI_013|RAFI GORO_014|SARKPA J. RANA_015|SABON GARI I_016|SABON GARI II_017|SHAGWA_018|T/AGULU_019|T/BATURE_020|UNG. ABDU WAKILI_021|WAWU GADA_022");

$scope.loadVariables("AUNA_SOUTHArray=|Select Polling Unit|MOMOGI	001|MAKWANDO_002|MAKWANDO GAETEGI_003|MAKWANDO T/JIKA_004|SHAFINI KAMBARI I_005|SHAFINI KAMBARI II_006|TUNGAN JIKA_007|JANYAU_008");

$scope.loadVariables("IBELU_CENTRALArray=|Select Polling Unit|UNG. MASSALLACI_001|TUNGAN MAKWASHI_002|GIDAN GIDAWA_003|MARAGWASA_004|UNG. SARKI_005|TAKALAFIYA_006|UNG. MAKARANTA_007|LAGAN_008|T. ALALA_009|LAMINKIYA_010|UNG. NOMA YAKUWA I_011|UNG. NOMA YAKUWA II_012|T. MAGAJI LAGAN_013|UNG. KARA_014");

$scope.loadVariables("IBELU_EASTArray=|Select Polling Unit|IBILI BADO_001|ASHUWA_002|MABIRNI_003|YANGALU MAKARANTA_004|MATANDI_005|YANGALU GARI_006|T. DOMA_007|T. RAHA_008|T. GARI_009|MASAMAGU_010|DANTAI_011|SHASHUWA ATALI_012|ATABO_013");

$scope.loadVariables("IBELU_NORTHArray=|Select Polling Unit|ZOMA_001|MATALANGU_002|A. MAGAMA_003|AGIDO_004|MATSINKAYI_005|LAHURU_006|MAFILO_007|MAIGARAYA_008|YAR' ZARIYA_009|PAMBO_010|KADARKO S. FULANI_011|SUKUN TUMAI_012");

$scope.loadVariables("IBELU_WESTArray=|Select Polling Unit|RIGULO_001|ANABA MAKARANTA_002|ANABA DA KEWAYE_003|TUNGAN JIBO_004|GYENGI_005|KWANZO KWANZO_006|ISANA MAKARANTA_007|IPANA_008|LIBALE MAKARANTA_009|T. MAJE UNG. SARKI_010|MASANJI_011|MAJE MAKARANTA_012|TUNGAN WAKILI_013|WATA MARAYA_014|T/MALLAM_015|SANGO_016|UNG. SARKI LIBALE I_017|UNG. SARKI LIBALE II_018");

$scope.loadVariables("NASKOArray=|Select Polling Unit|ISSALLE_001|IZZALLO_002|MARA'MATSU_003|MAJE GAWURI_004|MALELA_005|NASKO PRIMARY SCHOOL_006|TUNGAN MANGORO_007|UCCU_008|UNG. MAGAJI_009|U.S. WATA_010|UNG. LUWO_011|USHAFA_012|UNG. DAGACI_013");

$scope.loadVariables("NASSARAWAArray=|Select Polling Unit|KWATAN GARAHUNI_001|SAKI JIKINKA_002|T. ALHAJI BAWA_003|KWATAN GUNGAWA_004|GARAHUNI_005|TASHAN SODANGI I_006|TASHAN SODANGI II_007|T. GOGE_008|D. LIMAN_009|T. ALHAJI MANU_010|NAMATA T. GARI_011");

$scope.loadVariables("MASHEGU_LGA_Array=|Select Ward|BABBAN  RAMI|DAPANGI/MAKERA|IBBI|KABOJI|KASANGA|KWATACHI|KULHO|MASHEGU|MAZAKUKA/LIKORO|SAHO‐RAMI");

$scope.loadVariables("BABBAN_RAMIArray=|Select Polling Unit|M. MAMAM B/RAMI I_001|UNG. M. MAMAM B/RAMI II_002|UNG. SALI_003|UNG. MAMAMCHADI_004|UNG. ALI MAIDOKI_005|MALLAM BARAU PRIMARY SCHOOL (MALLAM BARAU)_006|UNG. ALTINE HAYI_007|KARAMI RAMI PRIMARY SCHOOL (KARAMI RAMI GABAS)_008|UNG. SANI_009|MAGORO PRIMARY SCHOOL (MAGORO)_010|LIKYAULE PRIMARY SCHOOL (LIKYAULE I)_011|LIKYAULE CLINIC (LIKYAULE II)_012|KAWO MASUCI I_013|KAWO MASUCI PRIMARY SCHOOL (KAWO MASUCI II)_014|UNG. GAMA_015|UNG. ALI WANZAMI_016|KARAMI RAMI YAMA CLINIC (KARAMI RAMI YAMA)_017|UNG. MAI BUSA_018|IBETON KARE PRIMARY SCHOOL (IBETON KARE)_019|JIBAMU_020|JAGURUA PRIMARY SCHOOL (JAGURA)_021|UNG. MAI DAJI_023|SULU ‐ BAWA_024");

$scope.loadVariables("DAPANGI_MAKERAArray=|Select Polling Unit|UBEGI_001|EDAN GIDAN MALLAM PRIMARY SCHOOL (EDAN GIDAN MALLAM)_002|BISHE KACHI PRIMARY SCHOOL (BISHE KACHI)_003|DANSHE PRIMARY SCHOOL (DANSHE)_004|YENI GOGO PRIMARY SCHOOL (YENI GOGO_005|DAFFAN PRIMARY SCHOOL (DAFFAN)_006|KPANTU PRIMARY SCHOOL (KPANTU)_007|BOKUTA PRIMARY SCHOOL (BOKUTA)_008|TSWAFU PRIMARY SCHOOL (TSWAFU)_009|UNG. SARKI MANIGI_010|EDDAN PRIMARY SCHOOL (EDDAN MAIANGUWAN)_011|UNG. BUHARI_012|TUNGAN GERO PRIMARY SCHOOL I (TUNGAN GERO I)_013|TUNGAN GERO PRIMARY SCHOOL II (TUNGAN GERO II)_014|DAPAGI_015|BAKIN KASUWA MANIGI_016|GIDAN GARBA_017|PHIZHI_018|UNGUWAN MAKERI PRIMARY SCHOOL (UNGUWAN MAKERI)_019|PHIZHI MARARABA_020");

$scope.loadVariables("IBBIArray=|Select Polling Unit|DAGACHI IBBI_001|BODINGA_002|DAJA PRIMARY SCHOOL_003|T/MAI DAWA_005|UNG. SARKI IBBI_006|ZUGURMA PRIMARY SCHOOL_007|GWAJI PRIMARY SCHOOL (GWAJI)_008|LEAPU PRIMARY SCHOOL (LEAPU)_009|ZUGURUMA PRIMARY SCHOOL (ZUGURUMA)_010|TUNGA HASSANA_011|ZUGURUMA AREWA PRIMARY SCHOOL (ZUGURUMA AREWA)_012|KUSOKO PRIMARY SCHOOL KUSOKO (KUSOKO)_013|GUNNA PRIMARY SCHOOL (GUNNA)_014|MULEA PRIMARY SCHOOL (MULEA)_015");

$scope.loadVariables("KABOJIArray=|Select Polling Unit|DAKARKARI_001|UNG. KAMPANI_002|UNG. S/KABOJI I_003|UNG. S/KABOJI II_004|UNG. S/BAKWAI_005|TUNGAN BA’ARA PRIMARY SCHOOL (TUNGAN BA’ARE)_006|TUNGAN WANZAM_007|MAIDOBIYA PRIMARY SCHOOL (MAIDOBIYA)_008|UNG. S/ADOGO MALLAN I_009|UNG. S/ADOGO MALLAN II_010|UNG. S/ADOGU ARAWA_011|TUNG ANGO_012|UNG. S/SOBA_013|UNG. DADI KOWA_014|TUNGAN KANSHI_015|UNG. LANAWA_016|UNG. GAMU GAKU_017|UNG. BAGARUWA_018|UNG. NATA'ALA_019");

$scope.loadVariables("KASANGAArray=|Select Polling Unit|KOFAR SARIKIN KASANGA CLINIC (KOFAR SARIKIN KASANGA)_001|K/SARKIN GADA I_002|K/SARKIN GADA II_003|DAN GUNTU_004|KOFAR SARIKIN IGADE CLINIC (KOFAR SARIKIN IGADE)_005|GIDAN MAIDAWA PRIMARY SCHOOL (GIDAN MAIDAWA)_006|URO GARI PRIMARY SCHOOL (URO GARI)_007|LIFARI PRIMARY SCHOOL (LIFARI)_008|TOZON DAJI PRIMARY SCHOOL (TOZON DAJI)_009|TABANI_010|GIDAN KWANO PRIMARY SCHOOL (GIDAN KWANO)_011|GIDAN AHMADU_012|UNGUWAN GOBIRAWA PRIMARY CLINIC (UNGUWAN GOBIRAWA)_013");

$scope.loadVariables("KWATACHIArray=|Select Polling Unit|LIMAN KPATACHI_001|UNG. DANGACHI KPATACHI_002|UNG. ZAKI KPATACHI_003|KPALEGI PRIMARY SCHOOL (KPALEGI)_004|UNG. PATIKO_005|UNG. KPABU_006|UNG. LEABA_007|UNG. BAKOSHI_008|UNG. HAUSAWA_009|TUNGAN BALA_010|KANTI PRIMARY SCHOOL (KANTI)_011");

$scope.loadVariables("KULHOArray=|Select Polling Unit|KULHO MAKARANTA_001|KUPA SURU PRIMARY SCHOOL (KUPA SURU)_002|GWUIWAN KURMI_003|TALLE PRIMARY SCHOOL (TALLE)_004|KULUHO PRIMARY SCHOOL I_005|TUNGAN AJIYA PRIMARY SCHOOL I (TUNGAN AJIYA)_006|TUNGAN AJIYA PRIMARY SCHOOL II (TUNGAN AJIYA)_007|BABUGI PRIMARY SCHOOL (BABUGI)_008|JAGABA PRIMARY SCHOL (JAGABA)_009|SABON MASHIGA_010|SABON MASHIGI PRIMARY SCHOOL (SABON MASHIGI)_011|UNG. KAMBIRI FANGA_012|FANGA PRIMARY SCHOOL (FANGA)_013|MAI KADE PRIMARY SCHOOL (MAI KADE)_014");

$scope.loadVariables("MASHEGUArray=|Select Polling Unit|KAWO PRIMARY SCHOOL I (KAWO I)_001|KAWO PRIMARY SCHOOL II (KAWO II)_002|TANANGI PRIMARY SCHOOL (TANANGI)_003|UNG. SARKI JEMAKU_004|DUBA_005|BABAGI PRIMARY SCHOOL (BABAGI)_006|UNG. MADAWAKI JEMAKU_007|TUNGAN NAKOKO PRIMARY SCHOOL (TUNGAN NAKOKO)_008|RAFIN GORA PRIMARY SCHOOL (RAFIN GORA)_009|SABON BABAGI PRIMARY SCHOOL (SABON BABAGI)_010|ADOGO MATANE PRIMARY SCHOOL (ADOGO MATANE)_011|KOFAR FADA MASHEGU PRIMARY SCHOOL (KOFAR FADA MASHEGU)_012|UNG. LIMAN_013|SABON GIDA_014|MATANE PRIMARY SCHOOL (MATANE)_015|MAGAMA_016|KOFAR ADABO_017|BASA MASHEGU PRIMARY SCHOOL (BASA MASHEGU)_018|BUNZANA PRIMARY SCHOOL I (BUZANA I)_019|BUNZANA PRIMARY SCHOOL II (BUZANA II)_020|DUTSEN MAGAJI PRIMARY SCHOOL (DUTAEN MAGAJI)_021");

$scope.loadVariables("MAZAKUKA_LIKOROArray=|Select Polling Unit|MAKAZANTA PRIMARY SCHOOL_001|KOFAR SARKI PRIMARY SCHOOL (KOFAR SARKI)_002|KOKOROKO_003|GANWA I_004|GANWA II_005|KOSO PRIMARY SCHOOL (KOSO)_006|LIKORO PRIMARY SCHOOL (LIKORO)_007|ROBU PRIMARY SCHOOL (ROBU)_008|TUNGAN GERO PRIMARY SCHOOL (TUNGA GERO)_009|KUPA PRIMARY SCHOOL (KUPA)_010|RIJIYOYI PRIMARY SCHOOL (RIJIYOYI)_011|CHIKOGI PRIMARY SCHOOL (CHIKOGI)_012|UNGUWAN ZABAMMA PRIMARY SCHOOL (UNGUWAN ZABAMMA)_013");

$scope.loadVariables("SAHO_RAMIArray=|Select Polling Unit|UNG. SARKIN SAHO_001|UNG. BAKABE_002|UNG. KATSINAWA_003|KWATI PRIMARY SCHOOL (KWATI)_004|KAWO GABAS CLINIC (KAWO GABAS)_005|SABON RIJIYA GABAS PRIMARY SCHOOL (SABON RIJIYA GABAS)_006|SABON RIJIYA YAMMA CLINIC (SABON RIJIYA YAMMA)_007|NASARAWA MULO PTIMARY SCHOOL (NASARAWA MULO)_008|FAJE PRIMARY SCHOOL (FAJE)_009|MULO PRIMARY SCHOOL (MULO)_010|TUNGAN MAGAJI PRIMARY SCHOOL (TUNGAN MAGAJI)_011|BEJI PRIMARY SCHOOL (BEJI)_012|MAI AZARA_013|UNG. ABDU BAKI_014");

$scope.loadVariables("RIJAU_LGA_Array=|Select Ward|DANRANGI|DUGGE|DUKKU|GENU|JAMA'ARE|RIJAU|SHAMBO|T/BUNU|T/MAGAJIYA|USHE|WARARI");

$scope.loadVariables("DANRANGIArray=|Select Polling Unit|ANYAU GARI_001|KAKITA_002|UNG. DARANGI I_003|UNG. DARANGI II_004|UNG. GALADIMA GBI_005|UNG. ANYAU_006|UNG. KIRA_007|UNG. MANYA_008|UNG. TAMBAYA_009|UNG. ZANCE_010|UNG. GARADAYA_011|UNG. AFIKA_012|UNG. UBANWAILI_013|UNG. YAHAYA_014|UNG. YAMUSA_015|UNG. TAKALAFIYA_016|SABON GARI DOGOB_017");

$scope.loadVariables("DUGGEArray=|Select Polling Unit|UNG. MAGAJIN GARI_001|UNG. MAGAJIN GARI_001|UNG. SARKIN NOMA_002|UNG. KAMBARI_003|ZUTTU KAMBARI_004");

$scope.loadVariables("DUKKUArray=|Select Polling Unit|BASSAWA_001|BAKIN KASUWA I_002|BAKIN KASUWA II_003|DARGA_004|FARIN RUWA_005|MATSINKAYI_006|NAKACERI_007|SHAMAKI_008|SINDIRI_009|SABON GARIN YAKANA_010|TUNGAN MALLAM BAWA_011|TUNGAN FARA_012|TUNGAN YAKANA_013|TUNGAN RIMI_014|UGANDA I_015|UGANDA II_016|UNG. LIMAN_017|UNG. SARKI_018|UNG. UBANDAWAKI_019|MALLAM TSOHO_020|SHANTALI_021");

$scope.loadVariables("GENUArray=|Select Polling Unit|ARGIDA MAKARANTA_001|KAKIRA BEBEJI_002|KASSAU_003|HARDO DAWA_004|KOGOW KIFI_005|GENU ‐ GARI_006|TUNGAN DOGO_007|TAWKAKI_008|UNG. S/GENU_009|UNG. S/MALLINGO_010|UNG. HAKUKA_011|UNG. AHULU ISAMIYA_012|UNG. S/BUNI_013");

$scope.loadVariables("JAMA_AREArray=|Select Polling Unit|KWAROSO RUKUKUJE_001|JAMA'ARE PRIMARY SCHOOL_002|RUKUKUJA AYI TUMO_003|MAGAJI KAWU_004|MAGAJI KUDABO_005|UNG. KUKA_006|SAHOMA_007|UNG. GUGA DUTSE_008");

$scope.loadVariables("RIJAUArray=|Select Polling Unit|ALLAGA KURE_001|GUIBAIDU_002|H/MAKARANTA_003|KIRIYA_004|MARAFA_005|MOWORO_006|RAFIN KADA_007|SHAGARI_008|TUNGAN PANJAN_009|USUMBA UPANA_010");

$scope.loadVariables("SHAMBOArray=|Select Polling Unit|AUDU SAJE_001|AUDU SAJE_001|DAN RIMI TSOHON GARI_002|DAN MAJE I_003|DAN MAJE II_004|DAN RIMI HANYAN MAGAJIYA_005|KOFAR SALE MAI AGOGO_006|KOFAR SARKI_007|LOW COST_008|RATAYA GIWA_009|TSOHON GARI_010|TUDUN WADA_011|UNG. SARKI NOMA TSOHON GARI_012|UNG. NA‐ALLAH_013|UNG. MAGAJI WALI_014|UNG. MAMMAN SAMBO_015|UNG. BUDA_016|UNG. BARAU I_017|UNG. MARI NA_019|UNG. UMARU_020|UJAH_021");

$scope.loadVariables("T_BUNUArray=|Select Polling Unit|BIRNIN AMINA_001|HARDO AGULU_002|TUNGAN ABARA_003|TUNGAN BUNU_004|TUNGAN DOGO_005|TUNGAN MARKE_006|TUNGAN YAMMA_007|UNG. ZANTE_008|UNG. D/ZANTE_009|UNG. HAUSAWA SANJIR_010|UNG. BARDE_011|UNG. GALADIMA ABARSHI_012|UNG. MAGAJI ABARA_013|UNG. SARKIN YUNGU_014|UNG. HARDO MAI GARI_015|UNG. JATAU_016|NA ‐ GAMBO SANJIR_017");

$scope.loadVariables("T_MAGAJIYAArray=|Select Polling Unit|BAKIN KASUWA_001|FARIN DUTSE_002|UNG. S/KIRHO I_003|UNG. S/KIRHO II_004|UNG. HAKIMI I_005|UNG. HAKIMI II_006|UNG. GALADIMA KIRHO_007|UNG. S/HAUSAWA KAWO_008|UNG. MALELE_009|UNG. SANI_010|UNG. GANDI_011");

$scope.loadVariables("USHEArray=|Select Polling Unit|ABARA USHE_001|B/ZAURE_002|B/Z/KOROMBO_003|DAUDU TARU_004|HAUSAWA USHE_005|IRI UNG. MUSA_006|IRI GARI_007|SHARGI UDDU_008|U/S DUTSE_009|UNG. DAHURO_010|UNG. IFAKI ZANGE_011|UNG. TUKURA_012|UNG. DAUDU IDI_013|UNG. SHAMAKI_014|U/S UDDU_015");

$scope.loadVariables("WARARIArray=|Select Polling Unit|MAHOLA BIYAMU_001|MOMOMO_002|HANYU BIYAMU_003|RIGITO_004|TUNGAN RAFI_005|SULUBAWA I_006|SULUBAWA II_007|UNG. GIDADU_008|UNG. TATA GADU_009|UNG. YAWA I_010|UNG. YAWA II_011|UNG. UBANDAWAKI BAGASA_012|UNG. HUNGI_013|UNG. IDALE_014|UNG. UBANDAWAKI_015|UNG. WARARI_016");

$scope.loadVariables("SULEJAArray=|Select Ward|BAGMAMA 'A'|BAGAMA 'B'|HASHIMI 'A'|HASHIMI 'B'|IKU SOUTH I|IKU SOUTH II|KURMIN SARKI|MAGAJIYA|MAJE NORTH|WAMBAI");

$scope.loadVariables("BAGMAMA_A_Array=|Select Polling Unit|DAWAKI PRIMARY SCHOOL I_001|DAWAKI PRIMARY SCHOOL II_002|ANGWAN SALANKE AREA II OPEN SPACE (KOLANKE GIDAN ABDUL MAIGORO)_003|TOWN HALL (NORTH GATE)_004|TOWN HALL (SOUTH GATE)_005|GIDIN – RIMI OPEN SPACE (K/G DAN‐AZOMIK YAU)_006|NEW ‐ LONDON_007|BAKIN KASUWA PRIMARY SCHOOL I_008|BAKIN KASUWA PRIMARY SCHOOL II_009|FORMER A.C.B._010|WATER BOARD_011|ANGWAN SALANKE I OPEN SPACE (KOFAR GIDAN DAHIRU A. SALANKE)_012");

$scope.loadVariables("BAGAMA_B_Array=|Select Polling Unit|ANGWAN GWANDARA OPEN SPACE (K/DANTSHO KAFINTA)_001|BESIDE ISLAMIC SCHOOL_002|WOMEN CENTRE PUBLIC BUILDING (ANG. KABULA K/G DAKACHI)_003|OPPOSITE MOROCCO GUEST INN_004|ADAMA SHOPPING MALL OPEN SPACE (K/G GARBA HOUSE)_005|OPPOSITE EGWUAGWU SUPER MARKET_006|OPPOSITE EMINENCE HOTEL_007|Z.I.E. OFFICE LOW COST_008|FIELD BASE_009|OPPOSITE ETERNAL SACRED_010|FRONT OF IBB MARKET_011|OPPOSITE MOROCCO HOTEL_012|OPP. TRANSFORMER ANG. GWANDARA OPEN SPACE (K/G DANTSHO KAFINTA)_013|K/G ZAKARI MAI UNGUWA_014|INFRONT OF NEPA OFFICE_015");

$scope.loadVariables("HASHIMI_A_Array=|Select Polling Unit|STATE LIBRARY_001|KUSPA OPEN SPACE (K/G YAU KUSPA)_002|ANGWAN LIMAN JUMMA I OPEN SPACE (K/G LIMAN JUMMA I)_003|ANGWAN LIMAN JUMMA II OPEN SPACE (K/G LIMAN JUMMA II)_004|ANGWAN KUYAMBANA OPEN SPACE (K/G KATAMBA)_005|GORON KABUNU OPEN SPACE (K/G ADAMU MAIGORO)_006|ANGWAN BARIBARI OPEN SPACE (K/G ALH. KADUNA)_007|GARKI GARAGE INN‐GATE_008|GARKI GARAGE NORTH ‐ GATE I_009|GARKI GARAGE NORTH ‐ GATE II_010|ANGWAN KARFE OPEN SPACE (K/G ALH. HASSAN YAWA)_011|ANGWAN KUREN KAKA OPEN SPACE (K/G GIDAN BWARI)_012|ANGWAN DOKA OPEN SPACE (K/G DOKA ANG. DOKA)_013|PRIMARY HEALTH CARE_014|ANGWAN SHUWADA I OPEN SPACE (KOFAR GIDAN SHUWADA I)_015|ANGWAN SHUWADA II OPEN SPACE (KOFAR GIDAN SHUWADA II)_016");

$scope.loadVariables("HASHIMI_B_Array=|Select Polling Unit|SARKI PAWA OPEN SPACE (K/G MADALLA KORO)_001|MADALLA PRIMARY SCHOOL II_002|MADALLA PRIMARY SCHOOL III_003|ANGWAN SARKIN OLD MARKET OPEN SPACE (K/G SARKIN MADALLA I)_004|MADALLA CLINIC OPEN SPACE (K/G SARKIN MADALLA II_005|MADALLA JUNCTION I_006|MADALLA JUNCTION II_007|MAKURA OPEN SPACE (K/G ANGULU MAI ANG)_008");

$scope.loadVariables("IKU_SOUTH_IArray=|Select Polling Unit|MADALLA PRIMARY SCHOOL I_001|KAKA ADI ZARIYAWA JUNCTION OPEN SPACE (K/G UMARU USMAN)_002|ZARIYAWA MARKET ROAD, OPEN SPACE (K/G BABA AKWATA)_003|UNG. WAJE PRIMARY SCHOOL I_004|UNG. WAJE PRIMARY SCHOOL II_005|ANGWAN MAGAJIN MALLAM OPEN SPACE (K/G AKARE ANG. MAGIJI)_006|ANGWAN ZARIYAWA MINNA ROAD OPEN SPACE (K/G BABA TASKA ANG. ZARIYAWA)_007|OPP. NAT. FILLING STATION I OPEN SPACE (K/G JARMMAI OPP. OPP. NAT. FILLING STATION)_008|OPP. NAT. FILLING STATION I OPEN SPACE (K/G JARMMAI OPP. OPP. NAT. FILLING STATION)_009|DAUDU GYARA I OPEN SPACE (K/G IBRAHIM PIJI DAUDA)_010|MINNA GARAGE_011|MINNA GARAGE (INN GATE)_012|ANGWAN AHO I OPEN SPACE (K/G DANGANA AHO)_013|DAUDU GYARA II OPEN SPACE (K/G IBRAHIM PIJI)_014|ANGWAN ZARIYAWA OPEN SPACE (K/G ALH. NAIYA ANG. ZARIYAWA)_015|K/G ALHAJI JIMOH AND SONS_016|L.G.A.WORKS DEPT. (MAIN GATE)_017|N.R.C. (L.G. OFFICE)_018|KOFAR GIDAN BAWA TINKER ANG. GWARI_019");

$scope.loadVariables("IKU_SOUTH_IIArray=|Select Polling Unit|CHAZA PRIMARY SCHOOL_001|GOVERNMENT SECONDARY SCHOOL_002|ARMY BARRACK ARTILERY_003|ARMY BARRACK ENGINEERING_004|RAFIN SANYI I_005|RAFIN SANYI II_006|KWANKWASHE VILLAGE_007|GWAZUNU VILLAGE I_008|GWAZUNU VILLAGE II_009|LUXERIOUS PARK_010");

$scope.loadVariables("KURMIN_SARKIArray=|Select Polling Unit|ANG. IYA PRIMARY SCHOOL_001|OLD KWATA OPEN SPACE (PANGAMU PRI. SCH.)_002|CHURCH ROAD VET. OFFICE_003|SECRETARIAT OPP. L.G.A OPEN SPACE (K/G PAUL)_004|OPPOSITE JUBILEE HOTEL_005|KURMA SARKI PRIMARY SCHOOL_006|BACK OF GENERAL HOSPITAL_007|ANGWAN SARKI MINNA OPEN SPACE (K/G SARKI MINNA)_008|ANGUWA PAUGAMU OPEN SPACE (K/G MAI ANGNA PAUGAMU)_009|ABUCHI VILLAGE_010|ANG. IYA PRIMARY SCHOOL_011|CHURCH ROAD T. JUNCTION_012|CHURCH ROAD VETINARY OFFICE_013|TUNDUN WADA OPEN SPACE (K/G ABDULLAHI GAYYA)_014");

$scope.loadVariables("MAGAJIYAArray=|Select Polling Unit|TUNDU SALANKE OPEN SPACE (K/G SALANKE)_001|DAN‐DAURA I OPEN SPACE (K/G DAN DAUDA I)_002|DAN‐DAURA II OPEN SPACE (K/G DAN DAUDA II)_003|SARAUNIYA AREA OPEN SPACE (K/G SARAUNIYA)_004|ANGWAN DAHATU OPEN SPACE (K/G SARKIN MAGINA)_005|ANGWAN BAI OPEN SPACE (K/G MAI SAHURU ANG BAI)_006|ANGWAN MALL SHEHU OPEN SPACE (K/G. DAN BABA)_007|ANGWAN IYA OPEN SPACE (K/G MUMUNI ANG. IYA)_008");

$scope.loadVariables("MAJE_NORTHArray=|Select Polling Unit|KUCHIKO PRIMARY SCHOOL_001|DAGURU VILLAGE_002|NUMBWA TUKURA_003|MAJE PRIMARY SCHOOL_004|KWAMBA PRIMARY SCHOOL I_005|KWAMBA PRIMARY SCHOOL II_006|BAKIN IKU FILLING STATION_007|ANG. SARKIN KWAMBA OPEN SPACE (KOFAR GIDAN MAI ANG I)_008|ANGWAN DABARA OPEN SPACE (KOFAR GIDAN MAI ANG II)_009|ANGWAN BISA OPEN SPACE (K/G AMI ANG MAJE)_010|OPPOSITE INEC OFFICE_011|BAKIN IKU PRIMARY SCHOOL_012|TUNGAN TSAUNI_013|BAKIN IKU_014|KWAMBA TIMBER SHADE_015|KWAMBA LOWCOST_016|ZARIYAWA VILLAGE_017|NUMBAWA KORO PRIMARY SCHOOL_018|TUNGA SHANU VILLAGE_019|GABODNA KWAMBA_020");

$scope.loadVariables("WAMBAIArray=|Select Polling Unit|ANG. JUMA PRIMARY SCHOOL I_001|ANG. JUMMA PRIMARY SCHOOL II_002|BY SHARIA COURT OPEN SPACE (EMIR’S PALACE)_003|INFANT PRIMARY SCHOOL_004|DAY SECONDARY SCHOOL_005|ANG. GALADIMA_006|ANGWAN DAN ZARIA OPEN SPACE (KOFAR GIDAN SHUIABU)_007|ANG. TUDU PRIMARY SCHOOL_008");

$scope.loadVariables("WUSHISHIArray=|Select Ward|AKARE|BARWA|GWARJIKO|KANWURI|KODO|KWATA|LOKOGOMA|MAITO|SABON GARI|TUKUNJI/YAMIGI|ZUNGERU");

$scope.loadVariables("AKAREArray=|Select Polling Unit|AKARE PRIMARY SCHOOL (AKARE DISPENSARY)_001|AKARE KAMPANI PRIMARY SCHOOL (AKARE KAMPANI)|_002|BANGI GARI OPEN SPACE (BANGI)_003|CHEJI PRIMARY SCHOOL (CHEJI)_004|KPAKLARA RAILWAY STATION I (KPAKARA STATION I)_005|KPAKARA GARI PRIMARY SCHOOL (KPAKARA STATION II)_006|KPAKARA GARI PRIMARY SCHOOL (KPAKARA GARI)_007|AKARE GIRIN PRIMARY SCHOOL (AKARE GIRIN)_008");

$scope.loadVariables("BARWAArray=|Select Polling Unit|UNGUWAN BARWA OPEN SPACE (KOFAR GIDAN BARWA_001|UNGUWAN MA’AJI OPEN SPACE (KOFAR GIDAN MA’AJI)_002|CENTRAL PRIMARY SCHOOL_003|GUDUGI OPEN SPACE (GUDUGI B/MASALLACHI)_004|UNGUWAN KATSINAWA OPEN SPACE (UNGUWAN KATSINAWA)_005|UNGUWAN YABAGI I OPEN SPACE (KOFAR G/YABAGI I)_006|UNGUWAN YABAGI II OPEN SPACE (KOFAR G/YABAGI II)_007");

$scope.loadVariables("GWARJIKOArray=|Select Polling Unit|UNGUWAN SARKI GWARJIKO OPEN SPACE I (UNGUWAN SARKI GWARJIKO I)_001|UNGUWAN SARKI GWARJIKO OPEN SPACE II (UNGUWAN SARKI GWARJIKO II)_002|DABIRI PRIMARY SCHOOL (DABIRI TSOHO)_003|EKAGI PRIMARY SCHOOL (EKAGI/BINIWORO)_004|DABOGI PRIMARY SCHOOL (DABOGI/ PANGU)_005|CHAKWA CHAKWA PRIMARY SCHOOL (CHAKWA CHAKWA)_006|UNGUWAN BELLO JANGARGARI OPEN SPACE (GIDAN BELLO JANGARGARI)_007|DABIRI SABO OPEN SPACE (DABIRI SABO)_009");

$scope.loadVariables("KANWURIArray=|Select Polling Unit|TSOHON KASUWA OPEN SPACE (KOFAR GIDAN LARAN KOKO)_001|UNGUWAN SARKIN FAWA OPEN SPACE (KOFAR GIDAN SARKIN PAWA)_002|ENGINE SURFE (KOFAR GIDAN BADAMAMAKI)_003|UNGUWAN MAGAJIN ASKA OPEN SPACE (TSOHON MASALLACHI)_004|UNGUWAN MAKERI REZA OPEN SPACE (KOFAR GIDAN BALANGADA)_005|UNGUWAN NA’IBI OPEN SPACE (KOFAR GIDAN NA’IBI)_006|KANWURI DISPENSARY_008");

$scope.loadVariables("KODOArray=|Select Polling Unit|MAKERA PRIMARY SCHOOL (MAKERA)_001|MAKUSIDI PRIMARY SCHOOL (MAKUSIDI)_002|ALIKALIKO OPEN SPACE (ALIKALIKO)_003|KODO PRIMARY SCHOOL_004|GUDI PRIMARY SCHOOL (GUDI)_005|TASHAN JIRGI HEALTH CENTRE (TASHAN JIRGI WUSHISHI)_006|KUTUNKU_007|UNGUWAN SARKIN KWATA OPEN SPACE (UNGUWAN SARKI KWATA)_008");

$scope.loadVariables("KWATAArray=|Select Polling Unit|KWATA PRIMARY SCHOOL_001|NIGER POLY. STAFF SCHOOL_002|NIGER POLY. STUDENT HOSTEL_003|KANWA OPEN SPACE (KANWA)_004|MADEGI PRIMARY SCHOOL (MADEGI)_005|DANKUWAGI OPEN SPACE (DANKUWAGI)_006|YELWA PRIMARY SCHOOL_007|KANKO PRIMARY SCHOOL I_008|KANKO PRIMARY HEALTH CENTRE (KANKO PRIMARY SCHOOL II)_009");

$scope.loadVariables("LOKOGOMAArray=|Select Polling Unit|LOKOGOMA PRIMARY SCHOOL_001|CHADOZHIKO_002|TANGWAGI PRIMARY SCHOOL (TANGWAGI)_003|DUKUN SAKUN PRIMARY SCHOOL (DUKUN SAKUN)_004|NDACE MAMMAN PRIMARY SCHOOL (NDACE MAMMAN)_005|NAGENU PRIMARY SCHOOL (NAGENU)_006|BUTU OPEN SPACE (BUTU)_007");

$scope.loadVariables("MAITOArray=|Select Polling Unit|MAITO PRIMARY SCHOOL_001|MAITO OLD HEALTH CENTER (MAITO BAKIN KASUWA)_002|ROGOTA HEALTH CENTER (ROGOTA)_003|TUNGAN KAWO PRIMARY SCHOOL (TUNGAN KAWO)_004|ZAREGIN PRIMARY SCHOOL (ZAREGIN ALH. NDANA)_005|DABBE PRIMARY SCHOOL (DABBE UNGUWAN SARKI)_006");

$scope.loadVariables("SABON_GARIArray=|Select Polling Unit|TASHAN MOTA I_001|TASHAN MOTA II_002|EMIWORO_003|G.S.S. WUSHISHI_004|GIDAN GWARI_005|BANKOGI PRIMARY SCHOOL_006|KASAKOGI PRIMARY SCHOOL (KASAKOGI BAKIN MASALALACHI)_007|BUKO_008|NDAGOSHI_009");

$scope.loadVariables("TUKUNJI_YAMIGIArray=|Select Polling Unit|TUKUNJI PRIMARY SCHOOL (TUKUNJI)_001|GEKUN PRIMARY SCHOOL (GEKUN)_002|MATAJIYA PRIMARY SCHOOL (MATAJIYA)_003|ENAGI PRIMARY SCHOOL (ENAGI)_004|YAMIGI PRIMARY SCHOOL (YAMIGI)_005|BATANDABA PRIMARY SCHOOL (BATANDABA)_006|TUNGAN SAYYADI PRIMARY SCHOOL (TUNGA SAYYADI)_007|KACE I PRIMARY SCHOOL (KACE I)_008|KACE II HEALTH CARE (KACE II)_009|SAMINAKA HEALTH CENTRE (SAMINAKA)_010");

$scope.loadVariables("ZUNGERUArray=|Select Polling Unit|UNGUWAN NUFAWA OPEN SPACE (UNGUWAN NUFAWA)_001|LIBRARY (UNGUWAN YARBAWA)_002|CENTRAL PRIMARY SCHOOL ZUNGERU (UNGUWAN HAUSAWA)_003|UNGUWAN NDAKO T/KUKA OPEN SPACE (UNGUWAN NDAKO T/KUKA)_004|PANCI OPEN SPACE (UNGUWAN YARBAWA II)_005|R/STATION ENTRANCE GATE (R/STATION)_006|VET. OFFICE (TUDUN WADA VET. I)_007|VET. OFFICE OPEN SPACE (TUDUN WADA VET II)_008|KATODAN PRIMARY SCHOOL (KATODAN)_009|TUNGAN ALMU PRIMARY SCHOOL (TUNGA ALMU)_010|DOGON RUWA PRIMARY SCHOOL (DOGO RUWA)_011|KALIKO PRIMARY SCHOOL_012");

$scope.loadVariables("BORGUArray=|Select Ward|BABANNA|DUGGA|KARABONDE|KONKOSO|MALALE|NEW BUSSA|KABE/PISSA|SHAGUNU|WAWA|RIVERINE");

$scope.loadVariables("BABANNAArray=|Select Polling Unit|GUFFANTI Z.E.B._001|UJIJI ZEB_002|DUGGA Z.E.B._003|YAMMU TOWN_004|DUGA MASHAYA_005|ULAKAMIN GUNGAWA_006|TUNGA ALHAJI SAMAI_007|GUFFANTI B H	C_008|ULAKAMIN HAUSAWA_009");

$scope.loadVariables("DUGGAArray=|Select Polling Unit|GUFFANTI Z.E.B._001|UJIJI ZEB_002|DUGGA Z.E.B._003|YAMMU TOWN_004|DUGA MASHAYA_005|ULAKAMIN GUNGAWA_006|TUNGA ALHAJI SAMAI_007|GUFFANTI B H	C_008|ULAKAMIN HAUSAWA_009");

$scope.loadVariables("KARABONDEArray=|Select Polling Unit |KARABONDE Z.E.B._001|NEPA SENIOR STAFF SCHOOL_002|MONNAI Z.E.B_003|MONNAI Z.E.B_003|TUNGAN LEMI_004|KAGOGI_005|TUNGAN ALH. DAN BABA_006|KAINJI SUPER MARKET_007");

$scope.loadVariables("KONKOSOArray=|Select Polling Unit |KONKOSO Z.E.B_001|OLD GANGALE_002|OLD GANGALE_002|KOKANI_003|ZANGOJI_004|TUNGAN BUBEI_005|TUNGA BUDE_006|TUNGA MAKERI_007|SHAFACI_008|MAIMANGORO_009|TUNGAN AL JANNA_010|YAN ILORI_011|SINNA_012");

$scope.loadVariables("MALALEArray=|Select Polling Unit |DORO Z.E.B._001|GUNGUN BUSSA_002|TUGAN MAIRAKUMI_003|SADORO_004|TUNGA KWANI_005|DORO NEAR MARKET_006|TUNGA SANI AWAYE_007|TUNGA NAILO I_008|TUNGA SULE_009");

$scope.loadVariables("NEW_BUSSAArray=|Select Polling Unit |JAHI GROUND_001|BEHIND SECRETARIAT_002|UNGUWAR WAZIRI I_003|WANA_004|UNG. GALADIMA PRIMARY SCHOOL_005|WAZIRI ZEB SCHOOL I_006|WAZIRI OFFICE_007|KIGERA SCHOOL_008|AWURU GARAGE_009|BORGU SECONDARY SCHOOL I_010|ARMY ENGR. SCHOOL_011|KOBO DAM_012|AIR FORCE BASE_013|NEW MARKET_014|NEAR NIGER GUEST INN_015|OLD MARKET_016");

$scope.loadVariables("KABE_PISSAArray=|Select Polling Unit |KABE Z.E.B. SCHOOL_001|BAKON MISSION_002|SAKON BARA_003|TUNGA DEMMO_004|KIGBERA_005|PISSA Z.E.B. SCHOOL_006|ZATENNA_007|SAFE LUNMA_008");

$scope.loadVariables("SHAGUNUArray=|Select Polling Unit |UNGUWAR SARKI_001|MAIWUNDI_002|AMBOSHIDI_003|SWASHI_004|LUMA SANKE_005|LUMMAN BA'ARE_006|SHANGWA_007|NEW SANSANI_008|GBAGA SANSANI_009");

$scope.loadVariables("WAWAArray=|Select Polling Unit|NEAR DISTRICT OFFICE_001|BABURASA_002|LAGABI I_003|TUNGAN TAYA_004|LESHIGBE_005|GARAFINE_006|ARMY BARRACKS_007|GADA OLLI_008|LESU OLLI_009|NEW KALE_010|SAMAGIN_011|WOKO_012");

$scope.loadVariables("RIVERINEArray=|Select Polling Unit |DOGON GARI Z.E.B. I_001|DOGON GARI Z.E.B. II_002|TAMANAZ/YANGBA_003|KORO ZEB_004|FAKUN/GBAKA_005|NEW AWURU_006|NEW KURWASA_007|FARIN DUTSI_008|OLD AWURU_009|KERE/POPO_010|TAMAT YANGBA_011");

$scope.loadVariables("BOSSOArray=|Select Ward|BEJI|BOSSO CENTRAL I|BOSSO CENTRAL II|CHANCHAGA|GARATU|KAMPALA|KODO|MAIKUNKELE|MAITUMBI|SHATA");

$scope.loadVariables("BEJIArray=|Select Polling Unit|ANG NUPAWA_001|BEJI PRIMARY SCHOOL I_002|BEJI PRIMARY SCHOOL II_003|KAMPANI BABANGANA_004|BEJI GARI_005|JIGBEYI_006|ANG. BARIKUTA_007|ANG. BINNI_008|GIDAN ZAUNA_009|MUTUM DAYA_010|ANG. KUKA_011");

$scope.loadVariables("BOSSO_CENTRAL_IArray=|Select Polling Unit|JIKPAN I_001|JIKPAN II_002|KANAWA I_003|KANAWA II_004|ANG. TUKURA KUBI_005|GBAIKO SHANU_006|NUMUI_007|KUYAN BANA_008|BOSSO LOW COST_009|BMARIKICHI_010");

$scope.loadVariables("BOSSO_CENTRAL_IIArray=|Select Polling Unit |BOSSO CLINIC I(GIDAN SARKI BOSSO I)_001|BOSSO CLINIC II (GIDAN SARKI BOSSOII)_002|TUDUN FULANI I_003|TUDUN FULANI II_004|KADIRI I_005|KADIRI II_006|ANG. HAUSAWA_007|SHIKPADNA_008|TASAKPAN_009|KOFAR KAFINTA_010|KOFAR HUSSAINI DRIVER_011|NAUTIKO_012|ANG. MAI‐YAKI_013");

$scope.loadVariables("CHANCHAGAArray=|Select Polling Unit|ARMY BARRACKS I_001|ARMY BARRACKS II_002|BIRGI_003|DUBO_004|GBAKWAITA I_005|GBAKWAITA II_006|KOFAR TUKURA I_007|KOFAR TUKURA II_008|SHANGO PRIMARY SCHOOL_009|KOFAR SHABA_010|KANGIWA_011|KOFAR S. NOMA_012|ANG. DOKOKO_013|KADNA_014");

$scope.loadVariables("GARATUArray=|Select Polling Unit|GARATU_001|BAKIN GADA_002|SABON LUNKO_003|POMPOM_004|GINDA MANGORO_005|KPAIDNA_006|DAMA_007|GIDAN KWANU_008|DAGAH_009|SABON DAGAH_010|KUTANGI_011|EKPIGI_012|GIDAN S. NOMA_013");

$scope.loadVariables("KAMPALAArray=|Select Polling Unit|KOIKO BATA BATAI_001|GUSASE_002|POPOI_003|FYAIKOKUCHIKOBUI_004|KUYI_005|DNAKPANKUCHI_006|KONAPI_007|LEGBE_008|BAGUN‐DAGUN_009|DAMA_010|KAMPALA_011|LUBO_012");

$scope.loadVariables("KODOArray=|Select Polling Unit|TANDIGI_001|TUNGAN ROGO_002|LASHAMBE_003|KODO_004|TSOHON KAMPANI_005|SODIWORO_006|NANGAWU_007|PAI_008");

$scope.loadVariables("MAIKUNKELEArray=|Select Polling Unit|OLD INEC OFFICE MIAKUNKELE PUBLIC BUILDING (GIDAN SARKI MAIKUNKELE I)_001|GIDAN SARKIN MAIKUNKELE II_002|GAMU_003|SHITAKO_004|JITA KANGO_005|ZHIMI_006|JANGARU_007|DUWASHA_008|GBEDENAYI_009|RAFIN YASHI CLINIC PUBLIC BUILDING (RAFIN YASHI)_010|AREA COURT_011|NYI ‐ NYI_012|TUSHA_013|GADAKO_014");

$scope.loadVariables("MAITUMBIArray=|Select Polling Unit|MAKARANTA_001|GOVERNMENT SECONDARY SCHOOL MAITUMBI PUBLIC BUILDING (ANGUW AN SARKIN 002 KADARA)_002|ANG. SARKIN BUSSA I_003|ANG. SARKIN BUSSA II_004|ANG. MALLAM IBRAHIM_005|SABON GURUSU_006|MAGADA TAYI_007|PASSI_008");

$scope.loadVariables("SHATAArray=|Select Polling Unit|SHATA GARI_001|PYATA GARI_002|EZIM_003|ZINARI_004|TAWU_005|GBAIKO JITA_006|MADAKO_007|LUMA_008|SAIGBE_009|KUNGU_010");

$scope.loadVariables("EDATTIArray=|Select Ward|ENAGI|ETSU TASHA|FAZHI|GAZHE I|GAZHE II|GBANGBAN|GUZAN|ROKOTA|SAKPE");

$scope.loadVariables("ENAGIArray=|Select Polling Unit|EMI ‐ GABI_001|NDAGBE_002|EMI ‐ BIMA_003|SAFO_004|BUKUGI_005|NAGYA_006|GOGATA_007|EMI‐SWANSUN_008|WADATA_009|EDOGI_010|DIKO ‐ TAKO_011|NWOGI_012|EFU‐UMARUZAN_013|NTIFIN GI_014|M/GIWA_015|GORIBATA_016|KUSODU_017");

$scope.loadVariables("ETSU_TASHAArray=|Select Polling Unit|DONKO_001|GB OTINGI_002|EMI‐TASHA_003|BAFO_004|KUBO_005|EMI‐ NDAYISA_006|KPAYI_007|MAPA_008|KPATANTI_009|ETSU ‐ TASHA_010|EMI ‐ WORO TASHA_011|EMI ‐ DZANZHI_012|GAMUNU_013|NDAFA_014");

$scope.loadVariables("FAZHIArray=|Select Polling Unit|FAZHI_001|PATIKO ‐ FAZHI_002|MAKUFU_003|KUSOGI_004|LASSAGI_005");

$scope.loadVariables("GAZHE_IArray=|Select Polling Unit|GAZHE I_001|GAZHE II_002|BARATSU_003|EDO SWAROGI_004|BAFU_005|TAMA_006|DOKOKPAN_007|EMI ‐ MAN_008|NDAJIKO_009|KPATAGI_010|GAZHE ‐ TADIMA_011");

$scope.loadVariables("GAZHE_IIArray=|Select Polling Unit|LENFA ‐ BORORO_001|KAGBA_002|SAMBAYI_003|BONGI_004|LENFA_005|BOTAN_006");

$scope.loadVariables("GBANGBANArray=|Select Polling Unit|GBANGBAN_001|LUKORO_002|WUYA_003|CHENGUDUGI_004|WOTOKPAN_005|YAGBANTI_006|GBAMACE_007|YAKUNTAGI_008|GBAPIN_009|MALUNGI_010|SHARUFU_011|TSAWANYAGI_012|CECEFU_013");

$scope.loadVariables("PISSA_GONAGIArray=|Select Polling Unit|GONAGI I_001|GONAGI II_002|GATA ‐ LILE_003|CINGINI_004|KANTIGI_005|GONDAGI_006|NDALADA_007|GATA‐ WADATA_008|LACIN_009|KOKO_010|EZHIGI_011|EMI‐GBA_012");

$scope.loadVariables("GUZANArray=|Select Polling Unit|GUZAN_001|DIKO ‐ BAKE_002|DIKO ‐ NDALOCHI_003|GBANBU_004|GARA_005|GBODOTI I_006|GBODOTI II_007|DANGANA KOLO_008|VUNTAKO_009|KOCHILA_010");

$scope.loadVariables("ROKOTAArray=|Select Polling Unit|ROKOTA_001|KWALE_002|KOBO_003|NDAYANMA_004|EMIGI_005|GONDAGI_006|RWAN ‐ KWA_007|LAZHI ‐ KOLO_008|KWALE ‐ KPANGI_009");

$scope.loadVariables("SAKPEArray=|Select Polling Unit|SAKPE I_001|SAKPE II_002|FADA_003|GUDUKO_004|K/ESHATA_005|ZHINGANTI_006|MAFOGI_007|KATAMBA ‐ BOLOGI I_008|KATABA ‐ BOLOGI II_009|TSWATAGI_010");

$scope.loadVariables("GBAKOArray=|Select Ward|BATAGI|BATAKO|EDOKOTA|EDOZHIGI|ETSU AUDU|GBADAFU|GOGATA|LEMU|NUWANKOTA|SAMMAJIKO");

$scope.loadVariables("BATAGIArray=|Select Polling Unit|BATAGI PRIMARY SCHOOL_001|SAKIWA_002|MASAGA_003|CIDI MISUN_004|BATAGI TAKO_005");

$scope.loadVariables("BATAKOArray=|Select Polling Unit|MANTAFIEN_001|DIKKO_002|BATAWORO_003|TSAKPAZHI_004|MAMMAGI_005|BATAKO_006|TSADU KASHI_007|EMINDAJI_008|YAZHIGI_009|KUYIZHI_010|EMITSOWA_011|EMIBEZHI_012|ZANNAGI_013|TSATAGI_014|TSATAGI ‐ GIDANPANGU_015");

$scope.loadVariables("EDOKOTAArray=|Select Polling Unit|EDOKOTA_001|CHEGUGI_002|WORIKI_003|SONIYAN_004|DADA_005|ESSAN_006");

$scope.loadVariables("EDOZHIGIArray=|Select Polling Unit|EDOZHIGI MODEL PRIMARY SCHOOL_001|EDOZHIGI EMITSU YANKPA I_002|NDAIJI GOZAN_003|GUSADIN_004|EMITETEKO_005|DAKPAN_006|EDOZHIGI ADAMU EKOKO_007|KATAEREGI_008|SHESHI AUDU_009|KEDIGI_010|KEDIGI_010|KEDIGI_010|KEDIGI_010|NDAGI LADAN_011|GUBATA_012|PICIKO_013|TSWATAGI_014|KUSOTACHIN_015|EVUNTAGI_016|EDOZHIGI ‐ EMITSU YANKPA II_017");

$scope.loadVariables("ETSU_AUDUArray=|Select Polling Unit|FAKUMBA_001|AKOTE_002|NUWANYA_003|EMI SAGI_004|NDAKAMA_005|FEMBO_006|EMAGITI_007|MAGOYI_008|NDAGBACHI_009|EGBATI_010|EBUKOGI_011|ETSU AUDU_012|EDOGI_013|SAGANUWA_014|PATINDAJI_015|NDA'BA_016|SONFADAKO_017|SHESHIMANDIKO_018|KOCHIKOTA_019|EMI GOYI_020");

$scope.loadVariables("GBADAFUArray=|Select Polling Unit|GBADAFU_001|BIRAMAFU_002|EVUNGI_003|WUYA SUMMAN_004|KUSOKO_005|KANKO GANA_006|TSADZA_007|PATIGI ‐ LIMAN_008|PATIGI ‐ LIMAN_008|PATIGI ‐ LIMAN_008|KUSORUKPA_009|PATITAGI_010|ZACHITA_011|GBANGUBA_012|ELAGI_013|SWAJIYATSU_014");

$scope.loadVariables("GOGATAArray=|Select Polling Unit|EMIGOYI_001|KOMU_002|GBANGINIGI_003|GOGATA_004|KUDUGI TSWACHI_005|NDA YAGBA_006");

$scope.loadVariables("LEMUArray=|Select Polling Unit|SWASUN GABI_001|NUWAKOTA_002|EJIKO_003|LEGBOZUKUN_004|TOROKO_005|SOMMAJIGI_006|LAGA_007|BINI_008|MALAGI_009|EDOTSU_010|UKUNKUGI_011|YIKANGI ‐ CIKAN_012|LEGBO ZUKUN ‐ MAGI WAYA_013");

$scope.loadVariables("NUWANKOTAArray=|Select Polling Unit|YABATAGI_001|EWANKO_002|JSS LEMU_003|LEMU ‐ TIFIKENCHI_004|DASA ‐ MASALACHI_005|MAGI WORO_006|EMIWOROGI_007|TAKO DZUKO_008");

$scope.loadVariables("SAMMAJIKOArray=|Select Polling Unit|BIDAFU_001|NDAKO GANA_002|SHABA LEGBO_003|SOMMAJIKO_004|TIWUGI_005|GBANGBA_006|NDALADA_007|NUWANKO SONMA_008|KOWANGI_009|GUDUDZURU_010|YIKANGI TAKO_011|JANTO_012|MAINASARA_013");

$scope.loadVariables("KATCHA_LGA_Array=|Select Ward|BAKEKO|BADEGGI|BISANTI|DZWAFU|EDOTSU|ESSA|GBAKOGI|KATCHA|KATAREGI|SIDI SABA");

$scope.loadVariables("BAKEKOArray=|Select Polling Unit|BAKEKO PRIMARY SCHOOL I_001|BAKEKO PRIMARY SCHOOL II_002|CETUKO_003|DAGBA_004|LAFIAGI DZWAFU_005|GBOYAKO_006|BASHI MUGUN_007|MAJAHIDU_008|DAWA_009|DAGBA ALIYU GOYI_010|EMIGI/TSWAGULU_011");

$scope.loadVariables("BADEGGIArray=|Select Polling Unit|EMI ‐ ETSU ‐ YENKPA_001|KPANTIFU_002|TAKO GBAKO_003|NWOGI_004|LAFIAGI LAFE_005|KANSSANAGI_006|KPANTI_007|KAFA_008|TAKO NDAJIYA_009");

$scope.loadVariables("BISANTIArray=|Select Polling Unit|BISANTI PRMARY SCHOOL_001|KATAEREGI PRIMARY SCHOOL_002|MANTUNTUN_003|BISHE TIWOGI_004|KAKAKPANGI_005|NDA ‐ ABARSHI_006|TAKUNTU_007|BANGAGI_008|MIJINDADI_009");

$scope.loadVariables("DZWAFUArray=|Select Polling Unit|NDABISAN PRIMARY SCHOOL_001|GABI_002|DZANGBODO_003|DZWAFU PRIMARY SCHOOL_004|EYE BABBA_005|ASSANYI_006|TSWACHIKO_007");

$scope.loadVariables("EDOTSUArray=|Select Polling Unit|EDOTSU PRIMARY SCHOOL_001|KASHE_002|TSADOYAGI_003|FUYAKA_004|SHABAWOSHI_005|DANCHITA_006|SABA TAWACHI_007");

$scope.loadVariables("ESSAArray=|Select Polling Unit|ESSA PRIMARY SCHOOL_001|CECE PRIMARY SCHOOL_002|MAIYAKI LEGBODZA_003|NIWOYE_004|EBBA PRIMARY SCHOOL_005|KPOTUN_006|EDIKUSO_007");

$scope.loadVariables("GBAKOGIArray=|Select Polling Unit|EKUGI_001|TSWAKO_002|SAKU_003|GBAKOGI PRIMARY SCHOOL_004|GBAPO_005|YINTI PRIMARY SCHOOL_006|LAFIAGI KULI PRIMARY SCHOOL_007|JIBO PRIMARY SCHOOL_008|SAGI PRIMARY SCHOOL_009|ZANCHITA_010");

$scope.loadVariables("KATCHAArray=|Select Polling Unit|KATCHA DISPENSARY_001|EMI ‐ NDASHESHI_002|KATCHA NORTH PRIMARY SCHOOL_003|KUDUS_004|DAMA PRIMARY SCHOOL_005|BANGIFU PRIMARY SCHOOL_006|KIPO_007|ECEGI_008|SABON GARI_009|ANGUWAN MAHAUTA_010|ANGUWAN LADAN_011");

$scope.loadVariables("KATAREGIArray=|Select Polling Unit|KATAEREGI PRIMARY SCHOOL_001|ZUZUNGI_002|GOYIDZWA_003|LAFIAGI ZADIN_004|GADA EREGI PRIMARY SCHOOL_005|KATAEREGI GWARI (SABO‐EREGI)_006|ELEGI CECE_007|EREGI EKPANMAWO_008|EFUSAWAGI_009|BORORO_010");

$scope.loadVariables("SIDI_SABAArray=|Select Polling Unit|SIDI‐SABA PRIMARY SCHOOL_001|ALKUSU_002|EMI RANI_003|EBGANTI‐TWAKI_004 |SOMAJIN_005");

$scope.loadVariables(" LAVUNArray=|Select Ward|BUSU/KUCHI|BATATI|DASSUN|DOKO|DABBAN|EGBAKO|GABA|JIMA|KUTIGI|KUSOTACHI|LAGUN|MAMBE");

$scope.loadVariables("BUSU_KUCHIArray=|Select Polling Unit|AMGBASA_001|GBANCHITAKO_002|KUPAFU_003|KUCHI GBAKO_004|KUCHI WORO TIFIN_005|KUCHI WORO TAKO_006|GBADAGBAZU_007|KPANJE_008|JIKANAGI_009|ETSU ‐ ZAGI_010|DOKOGI_011|TAKPA_012|BOKANGI_013|TWAKI_014|BUSUTIFIN_015|BUSU TAKO_016|KOSO_017");

$scope.loadVariables("BATATIArray=|Select Polling Unit|CIBO_001|CHARATI_002|GBACI_003|YETTI_004|GBAKOTA_005|GIDAN ALH. MAGAJI_006|GIDAN ALH. HARUNA_007|JIPAN_008|DASSUN_009|YAKUDI_010|GBATAMANGI_011|DABBANGI_012|KUPE_013");

$scope.loadVariables("DASSUNArray=|Select Polling Unit|BATATI_001|SHAKU_002|SHEBE GBAKO_003|PANTI GBAKO_004|ETSU‐ WORO_005|PANTI ‐ WORO_006|LANLE_007|CHATAFU_008|MA'ALI_009|GBARIGI_010|DIKKO ‐ DABBAN_011|SATIFU_012|KUNIAWO LANLE_013");

$scope.loadVariables("DOKOArray=|Select Polling Unit|DOKO NORTH PRIMARY SCHOOL_001|EMI‐DAZHI_002|LANGBAFU TACHIN_003|UNGWAR LADAN_004|DAKIN SHAWARA I_005|DAKIN SHAWARA II_006|NTAKOGI_007|BOKU_008|BOKU NDAGBAJI_009|EMI GBA_010|KOPA_011|MAMBWARI_012|UNGUWAR LADAN_013|GBANGUBA_014|SHESHI SABA_015|VUNCHI TIFIN_016|VUNCHI TAKO_017|DADOFUGI_018|KPAKAFU_019|BAKA_020");

$scope.loadVariables("DABBANArray=|Select Polling Unit|LAFIYAGI_001|EMI‐KAMASHI_002|KUNGITI_003|EMI‐WANGWA_004|ZHIGUN_005|EMI‐BIRAMA_006|EGBANTI_007|NKOCI_008|LANGIFU_009|MANYISA_010|ZHIGUN_011");

$scope.loadVariables("EGBAKOArray=|Select Polling Unit|DADI BASAGI_001|SONFADA GABI_002|AJENATU_003|EGBAKO_004|EMIZHITSU TSOEGI_005|GOGATA EGBAKO_006|SHESHI YISA_007|NDAKO GITSU_008|SANTALI_009|GANA MARU_010|NDARUKA_011|KUBA_012|NNADINDI_013|KANKO_014|EBBO_015");

$scope.loadVariables("GABAArray=|Select Polling Unit|GABA_001|LATIKO_002|TSOWAGBA_003|KASHIKOKO_004|KPATAGI_005|ELOMI_006|SOMAZHI_007|SHESHI BIKUN_008|TSADU NKOCI_009|GABA_010");

$scope.loadVariables("JIMAArray=|Select Polling Unit|JIMA_001|EDOBABA_002|DANCHITAGI_003|LANDHIKAGI_004|KUDOGI_005|ZHIGICI_006|GOGA_007|KPACHITAGI_008|YAFU_009|EMI‐TSADU_010");

$scope.loadVariables("KUTIGIArray=|Select Polling Unit|ALH.NDAGI PRIMARY SCHOOL_001|DZUKO GBAKO_002|R.H.C. JUNCTION_003|YAFU LUNZHI_004|EFU‐GABI_005|NKO_006|TUMAKAKA_007|EMI‐HAKIMI_008|EFU‐NGAMA_009|EFU‐YINTSU_010|EFU‐LUBASA_011|YELWA_012|TSWAYAN_013|CIKANGI_014|GIGBADI_015|EMI‐SAMARI_016|EMI‐MANMASUN_017|DUMA_018|MAFOKO_019|NASARA_020|NTAKOGI_021|EFU‐WURU_022|EFU‐GABI EMILIMAN_023");

$scope.loadVariables("KUSOTACHIArray=|Select Polling Unit|SHABA MALIKI_001|SA'ACHI_002|NDALOKE_003|KUPAFU DZANA_004|DOTAKO_005|KUTUGI DADI_006|GOGATA MAJIN_007|SODANGI_008|KUSOTACHI NDAIJI_009|NNAFYANE_010|KAGOWOGI_011|CHANCHAGA_012|KUSOTACHI BANA I_013|BATAKO_014|SAKIWA_015|GADZAN_016");

$scope.loadVariables("LAGUNArray=|Select Polling Unit|CHATAFU_001|KOEGI_002|ZHILUKO_003|YIDDAN_004|DAGIDA_005|LAGUN CHUTA_006|TASHA HAJIYA_007|ROBIZHI_008|KUTIWONGI_009");

$scope.loadVariables("MAMBEArray=|Select Polling Unit|MAMBE_001|GBADE_002|EBANGI_003|SA'ACHI NKU_004|EGAGI_005|FOKPO_006|SOSSA_007|NKU_008|NUPEKO_009|DANKO‐EMIWOROGI_010|PATISHABA KOLO_011|TAFYAN_012|BATAGI NDALO_013|DANKO PATISHIN_014|SHESHI SHABAN_015|MAWOGI_016|MAMBE TAKO_017");

$scope.loadVariables("MARIGAArray=|Select Ward|BANGI|BERI|BOBI|GULBIN ‐ BOKA|GALMA/WAMBA|INKWAI|IGWAMA|KAKIHUM|KONTOKORO|KUMBASHI|MABURYA");

$scope.loadVariables("BANGIArray=|Select Polling Unit|AFAGA_001|FARAR DOKA_002|UNG. YAMMA BANGI_003|ISASA_004|UNG. AREWA II BANGI_005|MAKENKEME_006|UNG. GIMBINAWA_007|UNG. AREWA I BANGI_008|UNG. DANJUMA_009|UNG. GABAS I BANGI_010|UNG. GABAS II BANGI_011|UNG. GABAS I SHADADI_012|UNG. GABAS II SAADADI_013|UNG. YAMMA SHADADI I_014|MABINNI_015|UNG. YAMMA SHADADI II_016|UNG. YAMMA SHADADI III_017");

$scope.loadVariables("BERIArray=|Select Polling Unit|ALABANI_001|BERI PRIMARY SCHOOL_002|BEHINA_003|DAN AUTA_004|MA'UNDU PRIMARY SCHOOL_005|UNG. S FAGAI_006|UNG. SARKIN HAUSAWA_007|UNG. MALLAM UMARU_008|UNG. SARKIN NOMA_009|UNG. TSOHO_010|UNG. GADO MA'UNDU_011|UNG. SARKIN MATANDI_012");

$scope.loadVariables("BOBIArray=|Select Polling Unit|DURGU AREWA I_001|DURGU AREWA II_002|KASUWAN DOGO_003|DURGU KUDU_004|MAIGOGE I_005|MAIGOGE II_006|UNG. MATARI_007|RAGADA SABUWA_008|UN. SARKIN BOBI URUMA II_009|SARKIN KASUWAN BOBI_010|TUDUN TSIRA_011|UNG. BALA (MATARI)_012|UNG. GALADIMA_013|UNG. GATULMI_014|UNG. GESHE KARUWA_015|UNG. HAUSAWA (MATARI)_016|UNG. MA'AJI_017|UNG. SARKI URUMA I_018|UNG. TSOHON / GALADIMA_019|UNG. URUMA_020|UNG. UKURU_021|UNG. MARADAWA_022|KASUWAN KWAYA_023");

$scope.loadVariables("GULBIN_BOKAArray=|Select Polling Unit|UNG. ATTA_001|BATUREN NOMA I_002|BATUREN NOMA II_003|CHIFU MADINBU_004|DANDAURA_005|UNG. GABAS G/BOKA I_006|UNG. GABAS G/BOKA II_007|UNG. YAMMA G/BOKA_008|UNG. SHADADI G/BOKA_010|HUNYUN AMARYA_011|UNG. IBBE_012|KWAIMO PRIMARY SCHOOL_013|KURA_014|LAMBA ABANI_015|GULBIN LI'OJI_016|MASABA_017|SARKIN GARIN KWIMO_018|SARKIN GARIN MAHORO_019|UNG. HAKIMI (MAIZAGO)_020|UNG. HAUSAWA_021|URO CHIFU_022|WAR_023");

$scope.loadVariables("GALMA_WAMBAArray=|Select Polling Unit|GAZMA_001|IFARI_002|INDAGO_003|KWANJE_004|KUNAI_005|KASUWAN ANGO_006|TAKA TSABA_007|TUNGAN DANJUMA_008|TUNGAN MANGORO_009|UNG. MADAWAKI I_010|UNG. MADAWAKI II_011|UNG. BARAJE_012|UNG. BAZAWO_013|WAMBA_014|ANG. HAUSAWA_015");

$scope.loadVariables("INKWAIArray=|Select Polling Unit|ASHAMA_001|GAYARI_002|INKWAI_003|KAHIGO_004|KUMBASAWA I_005|KUMBASAWA II_006|UNG. BABAN DAJI_007|LIMAN ZUGU_008|UNG. LABBO_009|MAI BAGO_010|ABARAWA_011");

$scope.loadVariables("IGWAMAArray=|Select Polling Unit|IGWAMA PRIMARY SCHOOL_001|KUKUNGA_002|MAKICI_003|MAKICI MADAKI_004|MARUBA_005|UNG. ALH MAKAMA_006|UNG. MAKERI_007|UNG. MARAYA (KASUWAN GARBA)_008|UBUBA_009|URAGA GARI_010|UNG. SARKIN HAUSAWA I_011|UNG. SARKIN HAUSAWA II_012|UNG. UBANDAWAKI_013|UNG. SARKIN UCICI_014|UNG. TSOHON TASHA_015|UNG. DANDAURA_016|UNG. SARKIN MAJE_017");

$scope.loadVariables("KAKIHUMArray=|Select Polling Unit|UNG. ISHANGA_001|UNG. KAPAS_002|KANGIWA_003|UNG GALADIMA I_004|UNG. GALADIMA II_005|UNG. MADAKI MASUGA_006|UNG. MADAKI SARKIN DUTSE_007|UNG. MAGAJI_008|UNG. WANYA_009|KASUWAN KANYA_010|RUGGA_011");

$scope.loadVariables("KONTOKOROArray=|Select Polling Unit|DUTSEN MA'AJI_001|DANKO ZABIYA_002|DORAUWAI_003|DOGON DAWA_004|KAREN BANA_005|KURIGI_006|MAHUTA MAKAKA_007|MARAI_008|MATSERI_009|SARKIN GARIN KOTONKORO_010|TSOHON GARIN KOTONKORO I_011|TSOHON GARI KOTANKORO II_012|YANBARU/BARACE_013|MACCITA_014");

$scope.loadVariables("KUMBASHIArray=|Select Polling Unit|MAZAME I_001|MAZAME II_002|MAZAME III_003|UNG. FADA I_004|UNG. FADA II_005|UNG. UBANDAWAKI_006|UNG. WAZIRI I_007|UNG. WAZIRI II_008|UNG. ZAGO I_009|UNG. ZAGO II_010|AWALLA_011|MAHANGA_012");

$scope.loadVariables("MABURYAArray=|Select Polling Unit|KOFAR FADA_001|MARORO_002|RAGADA PRIMARY SCHOOL_003|RUNTUNA_004|SARKIN DUTSE IPANDO_005|UNG. MAIDA_006|UNG. MAGAJI I_007|UNG. MAGAJI II_008|UNG. GALADIMA_009|UNG. UBANDAWAKI_010|UNG. WAZIRI_011|UNG. YABAWA_012");

$scope.loadVariables("MOKWA_LGA_Array=|Select Ward|BOKANI|GBAJIBO/MUWO|GBARA|JA'AGI|JEBBA NORTH|KPAKI/TAKUMA|KUDU|LABOZHI|MOKWA|MUREGI|RABBA/NDAYAKO");

$scope.loadVariables("BOKANIArray=|Select Polling Unit|BOKANI TAKO_001|BOKANI DUKAWA_002|DAKPAN_003|GUZAN_004|KUSOGI_005|WA'ABI_006|SHETTI_007|BOKANI GARAGE_008|MASHA_009|EFENGI_010|TIKA_011");

$scope.loadVariables("GBAJIBO_MUWOArray=|Select Polling Unit|GBAJIBO_001|GBAJIBO KPATA_002|BUKKA_003|KANIYA_004|SHIKA_005|POLL‐ WAYA_006|EMI ‐ NDAKARA_007|EMI‐DAGACHI_008|TATABU_009|KUMIGI_010|GBAJIBO GBAKO_011|BYAGI_012|LAFIAGI NMADU_013|GUNGU ZAKI_014|TSAFA_015|TUNGA RUWA_016|");

$scope.loadVariables("GBARAArray=|Select Polling Unit|GBARA TIFFIN_001|CEKUNGI_002|FOFO_003|EPOGI_004|DOKOMBA_005|GBARA TAKO DOGI_006|MAGI ‐ IGENCHI_007|DANGI_008|DATSUN_009|BANZHI_010|TAYI_011|KPATA ‐ KATCHA_012|WUNANGI_013|EDOGI_014|YINFA_015|DZAKAGI_016|KPATA KATCHA PRIMARY SCHOOL_017");

$scope.loadVariables("JA_AGIArray=|Select Polling Unit|KPATSUWA_001|RABBA KEDE_002|KUSOGI_003|LWAFU TIFFIN_004|DUKUN_005|EDOGI_006|JA'AGI TAKO_007|JA'AGI TIFFIN_008|CEGAMA_009|KETSO_010|KPASHAFU_011|KANZHI_012|WUCHI_013|KPANBO_014|LWAFU TAKO_015|ZHIWU_016|KPACHITA_017|GUNJIGI_018|POTO_019|SUNTI_020|WUYA ‐ KEDE_021|YIDZUWUNGI_022|ALIGETA_023|NDAKOGITSU_024|TSOEGI TAKO_025|SHEGBA_026|DOKUNE_027");

$scope.loadVariables("JEBBA_NORTHArray=|Select Polling Unit|JEBBA EMI_001|JEBBA GANA_002|JEBBA DAM_003|JEBBA KARA_004|LABEFU_005|PATIZHIKO_006|LEMAFU_007|SAMUNAKA_008|NDAFU_009|UNG. SARKI HAUSAWA_010");

$scope.loadVariables("KPAKI_TAKUMAArray=|Select Polling Unit|EMI‐TSUYANKPAN_001|TAKUMA_002|EZHI_003|KPAKOGI_004|EDUGI_005|KPAUTAGI_006|KPATAKI_007|KODAN_008|GBETE_009|BASIC HEALTH CENTRE_010");

$scope.loadVariables("KUDUArray=|Select Polling Unit|CHIJI_001|EFU LIMAN_002|EFU TSWANKA_003|KPAKIKO_004|KIMBOKUN_005|WUPO_006|AREA COURT KUDU_007");

$scope.loadVariables("LABOZHIArray=|Select Polling Unit|LABOZHI_001|KUSOKO_002|IBBA_003|DANKOGI_004|TYABO_005|KUKPANTI_006|EKPAGI_007|BATAGI_008|NAKUPA_009|GUDU‐YIKO_010|SUNTI CAMP_011");

$scope.loadVariables("MOKWAArray=|Select Polling Unit|EMI‐ HAKIMI_001|EMI ‐ NDALILLE_002|EMI ‐ NDASHE_003|EFU ‐ GORO_004|EMI ‐ TACHIN_005|TAKO ‐ WANGWA_006|EMI ‐ LILEBONCHI_007|ETI ‐ SHESHI_008|EMIN ‐ MANZHI_009|MAIN GARAGE_010|EMI ‐ HAKIMI_011|MASALLACHI IDI_012|SARKI PAWA_013|TIFFIN MADZA_014|UNG. HAUSAWA_015|EMI ‐ YAMMAN_016|SABON GIDA KPEGE_017|EMI ALH. NDACHE_018|KANO GARAGE_019|EMI MADU LUKORO_020|EMI SHABA LILE_021");

$scope.loadVariables("MUREGIArray=|Select Polling Unit|TSWASHA_001|MUREGI_002|JIFFU_003|LANFA KUSO_004|SUNLATI I_005|YABAGI_006|SANTIYA_007|EGBAGI_008|EDOLUSA_009|DAKANI_010|MA'AGI BUKUN_011|TSWAKO_012|GUGA_013|GIRAGI_014|GBOJIFU_015|SUNLATI II_016");

$scope.loadVariables("RABBA_NDAYAKOArray=|Select Polling Unit|RABBA TIFFIN_001|KPEGE AREA_002|STATION JIRIGI_003|NDAYAKO_004|EPPA_005|JANGI_006|MANGBA_007|LAFIAGI PRY SCHOOL (LAFIAGI)_008|MILE FIVE_009|COLLEGE OF AGRIC_010|RABBA KOSHABA PRY SCHOOL (RABBA KOSHABA)_011|NNADEFU_012|KPEGE TIFFIN_013");

$scope.loadVariables("MUYAArray=|Select Ward|BENI|DANDAUDU|DANGUNU|DAZA|FUKA|GINI|GUNI|KABULA|KAZAI|KUCHI|SARKIN PAWA");

$scope.loadVariables("BENIArray=|Select Polling Unit|BENI GWARI_001|BENI HAUSA_002|KUBI_003|GWADARE_004|UNG. SARKIN KORO_005");

$scope.loadVariables("DANDAUDUArray=|Select Polling Unit|DANDAUDU PRIMARY SCHOOL_001|MAI UNGUWAN DANDAUDU_002|MAI UNGUWAN MANGOROTA_003|AMUZHIBUI_004|TABWARE_005|GWAIZO_006|MARARRABA_007|AYINTAYI_008");

$scope.loadVariables("DANGUNUArray=|Select Polling Unit|TSOHON DANGUNU_001|JOSSO B_002|MAGURE_003|HAYIN DOGO I_004|HAYIN DOGO II_005|UNGUWAN SIDI (I)_006|UNGUWAN BAKO_007|PAI_008|JIGBE_009|UNG. BAGUDU_010");

$scope.loadVariables("DAZAArray=|Select Polling Unit|GUNDUMA_001|JACE_002|LOBODNA_003|DNASINU_004|ZINDNA_005|GAKOLO_006|GUDUMA_007");

$scope.loadVariables("FUKAArray=|Select Polling Unit|FUKA PRIMARY SCH (I)_001|FUKA PRIMARY SCHOOL (II)_002|YANPANA_003|KUKPAN_004|GBEGBEDNAPA_005|ZAWUDNA_006|FUKA KADARA_007");

$scope.loadVariables("GINIArray=|Select Polling Unit|GINI PRY SCH_001|GBAKUKU_002|GWADAMI_003|SHENGU_004|INJITA_005|INTA_006");

$scope.loadVariables("GUNIArray=|Select Polling Unit|CENTRAL PRIMARY SCHOOL GUNI_001|UNG. SARKIN PAWA GUNI (I)_002|UNG. SARKIN PAWA GUNI II_003|TAWO_004|TASHAN GUNI_005|ZALAPE_006|DAGBADNA_007|UNG. DOMA_008|UNG. KADARA_009|DOGAYIPE_010");

$scope.loadVariables("KABULAArray=|Select Polling Unit|LUWI_001|KAMACHE_002|EKWA_003|KABULAWI_004|KAZAI KADARA_005");

$scope.loadVariables("KAZAIArray=|Select Polling Unit|KAZAI GWARI (I)_001|ZAZZAGA PRY SCH_002|DAWAKIN MUSA_003|SALAPE_004|MANGOROTA_005|KAHALA_006|MANGORO_007|BAKIN KASUWA ZAZZAGA_008");

$scope.loadVariables("KUCHIArray=|Select Polling Unit|KUCHI GARI_001|ANG TUNGA_002|MALE KURUBAKU_003|LOKODNA_004|KAMPANI_005|NUKUPE_006|KAKURU_007|CHIBANI_008|KAPANA_009|ULOTO_010|SHASHAWI_011");

$scope.loadVariables("SARKIN_PAWAArray=|Select Polling Unit|UDUN NATSIRA/MAGISTRATZ OFFICE_001|MAKARANTA_002|JAIFULU_003|SABON GARI_004|KACHIWE_005|KAKURU_006|KURIGA_007|IGU TSAUNI_008|LOCAL GOVERNMENT DISPENSARY_009");

$scope.loadVariables("PAIKOROArray=|Select Ward|ADUNU|CHIMBI|GWAM|ISHAU|JERE|KAFIN KORO|KWAGANA|KWAKUTI|NIKUCHI T/MALLAM|PAIKO CENTRAL|TUTUNGO JEDNA");

$scope.loadVariables("ADUNUArray=|Select Polling Unit|BAKIN KASUWA_001|BARAKWAI_002|KUSHIRI_003|UNGUWAN SARKI KORO (UNG. SARKI KORO)_004|UNG. MAKAMA_005|TUNGAN BARAU_006|PATA_007");

$scope.loadVariables("CHIMBIArray=|Select Polling Unit|UNGUWAN SARKI (UNG.SARKI CHIMBI)_001|ECWA CHURCH_002|SEKUDNA_003|CHIMBI MARKET I_004|CHIMBI MARKET II_005|BUKPESI_006|GWALLO NUWABWAI_007|GWALLO KASUN_008|GWALLO KUWANBUAI_009");

$scope.loadVariables("GWAMArray=|Select Polling Unit|NUBIPI_001|ESSAN KOBO KOBO_002|WABE_003|GWAM_004|ZURRUH_005|TAITAI_006|SHIKAPI_007|TUNGAN MAKERI_008|PITA_009|GUSIPI_010|ESSAN VILLAGE_011");

$scope.loadVariables("ISHAUArray=|Select Polling Unit|ISHAU TOWN_001|TUNGAN AMALE I_002|TUNGAN AMALE II_003|DAKOLO NEW_004|GWARI YAYI_005|GOTO KURMI_006|BEJI_007|KURMIN ‐ GIWA_008|YANKE_009|GOTO RISHI_010");

$scope.loadVariables("JEREArray=|Select Polling Unit|DOBWA_001|YANDAYI_002|DANDURU_003|TSOHO KWANAYI_004|TAWU_005|SABO_006|BUSSI_007|KAMPANI DOROWA_008|SABO KOTONGBA_009");

$scope.loadVariables("KAFIN KOROArray=|Select Polling Unit|ALKALAWA HAKIMI_001|ALKALAWA ECWA_002|ALKALAWA JINGBE_003|CHURCH KURUCHI_004|KUTAGBA_005|LIMAWA_006|MAKERA_007|MUYE_008|NASSARAWA_009|JIBIDIGA_010|SICHE SARKI_011|SHAKPERE_012|SISIDNA_013|TUNGAN SAMARI_014|UNG. SARKI GWARI K/KORO_015|DUHU_016");

$scope.loadVariables("KWAGANAArray=|Select Polling Unit|ABOLLO_001|ABOROSO_002|KWAGANA_003|KUDAMI_004|KAMARIMI_005|KAKURI KORO_006|UNG. TUKURA SICHE_007|ZUBAKPERE_008|KAMA_009|ZONKOLO_010|FERI_011|KUNU ‐ KUNU_012|GWAJAU_013|KUNA_014|SIKITI_015|NANATI_016");

$scope.loadVariables("KWAKUTIArray=|Select Polling Unit|UNG. WAMBAI BAIDNA_001|GAYEGI_002|KWAKUTI TOWN_003|SALA FARIN DOKI_004|GAMGBE_005|EBBAH_006|EKUN_007|BOKU_008|DODNA_009|IBRAHIM SABO_010|KWAKUTI PRIMARY SCHOOL_011");

$scope.loadVariables("NIKUCHI_T_MALLAMArray=|Select Polling Unit|TUNGAN MALAM_001|RAFIN JATAU_002|NAGOPITA_003|GAMI_004|NDAMARAKI_005|BUKO_006|SESITA_007|NIKUCHI I_008|NIKUCHI II_009|KUCHISAPA_010|SALLAH_011|JANKPA_012|LUPNA_013|TUNGAN GANA_014|ZANCHITA_015|GIDAN ADAMU YORUBA I_016|GIDAN ADAMU YORUBA II_017|LODNAGBE_018|BWAFI_019|ADURU_020|BUYI_021|BASSEGO_022|BAKAJEBA_023|YIDNA_024");

$scope.loadVariables("PAIKO_CENTRALArray=|Select Polling Unit|ZUBAIRU PRIMARY SCHOOL I_001|PAGGO_002|KARBWASHAKA_003|TUTUNGO_004|JEDNA_005|ANINIGI_006|FICHE_007|GABADNA_008|BUTU_009|DAGONDAGBE_010|SURUYI_011|GIRGODNA_012|DANU_013|KPANUWA_014|FICHE KUCHI_015|JITTA_016|TATIKO II_017");

$scope.loadVariables("TUTUNGO_JEDNAArray=|Select Polling Unit|TATIKO I_001|PAGGO_002|KARBWASHAKA_003|TUTUNGO_004|JEDNA_005|ANINIGI_006|FICHE_007|GABADNA_008|BUTU_009|DAGONDAGBE_010|SURUYI_011|GIRGODNA_012|DANU_013|KPANUWA_014|FICHE KUCHI_015|JITTA_016|TATIKO II_017");

$scope.loadVariables("RAFIArray=|Select Ward|KAGARA GARI|KAKURI|KONGOMA CENTRAL|KONGOMA WEST|KUSHERKI NORTH|KUSHERKI SOUTH|KUNDU|SABON GARI|TEGINA GARI|TEGINA WEST|YAKILA");

$scope.loadVariables("KAGARA_GARIArray=|Select Polling Unit|AHMADU ATTAHIRU PRIMARY SCHOOL_001|FEDERAL LOW COST_002|LIM PRI SCH (GIDAN S/KARAYA)_003|KARAKU PRIMARY SCHOOL_004|KARAYA PRIMARY SCHOOL_005|MATERNITY CLINIC MCH (KOFAR ADO ENGINE)_006|DISPENSARY T/WADA (SALIHU DAGARI)_007|OLD MARKET (SALIHU MAIKATIFAI I)_008|GINDIN MANGO (SALIHU MAIKATIFA II)_009|GAMZAKI HALL (UNG. MADAKI I)_010|GINDIN CHEDIYA (UNG. MADAKI II)_011|YALWA PRIMARY SCHOOL_012");

$scope.loadVariables("KAKURIArray=|Select Polling Unit|DISPENSARY MADAKA_001|KAMFANI PRI. SCH. (GIDAN MAGABA)_002|GIDA MAJIDADI_003|SUFANA PRI. SCH. (GIDAN S/SUFANA)_004|KASUWAN MADAKA (GIDAN S/MADAKA)_005|OPEN SPACE GINDIN RIMI (GIDAN DOYA)_006|KURA‐ANKAWA PRI. SCH. (KURU ANKAWA)_007|SAMBURO PRI. SCH. (SAMBURO)_008|RUBO PRI. SCH. (SARKIN RUBO)_009|UNG. WAKILI_010|GINDIN MANGO (SARKIN NOMA I)_011|UNG. SARKIN NOMA II_012|UNG. SARKIN RUWA_013");

$scope.loadVariables("KONGOMA_CENTRALArray=|Select Polling Unit|DISPENSARY PANDOGARI_001|DISPENSARY PANDOGARI II_002|DUTSE DISPENSARY (GIDAN SARKIN DUTSE)_003|GIDIN MANGO O/S (GIDAN SARKIN TASHA)_004|OPEN SPACE GIDIN KIWAKWARE (GIDAN ALI MAIANGUWA)_005|OPEN SPACE GIDIN SHEDIYA (GIDIN HAJIYA ZAMA)_006|AREA COURT PANDOGARI (HAYIN JADA GIDAN MUSA)_007|REVENUE OFFICE (KOFAR SARKIN PANDOGARI)_008|NURTW OFFICE (KOFAR MADAKAKU)_009|KAMBARI_010|KAWON CIBI_011|PRIMARY SCHOOL RINGA_012|PRIMARY SCHOOL MADAKI_013|TA’UTANA PRI. SCH. (TA’UTANA)_014|GINDIN MANGO (TUKURBE GARI)_015|GINDIN MANGO (UNG. DANJAJI)_016|OPEN SPACE GINDIN‐RIJIYA (UNG. ALKALIN GORO)_017|URANCHIKI PRIMARY SCHOOL_018");

$scope.loadVariables("KONGOMA_WESTArray=|Select Polling Unit|DISPENSARY MAIKUJERI_001|DISPENSARY T/BAKO_002|SABON TASHA PRI. SCH. (GIDAN S/USHIBA_003|MAIKUJERI KASUWA_004|MAIKUJERI PRIMARY SCHOOL_005|TUNGAN MAKERI PRIMARY SCHOOL_006|OPEN SPACE TSOHON TITI (TUGUWAMA GIDAN SARKI)_007|USHIBA PRIMARY SCHOOL_008|GINDIN MANGO O/S (UNG. WAKILI)_009");

$scope.loadVariables("KUSHERKI_NORTHArray=|Select Polling Unit|GINDIN MANGO (GIDAN ALLARAMA)_001|GINDIN MANGO (GIDAN GYARA UNG HALIMA)_002|OPEN SPACE (GINDIN DABO)_003|HAYIN GANDO KASUWA (HAYIN GANDO)_004|GANYE PRI. SCH. (GIDAN ABDUL MADAKI I)_005|GINDIN MANGO (GIDAN ABDUL MADAKI II)_006|AD J MAKERA OPEN SPACE (KOFAR GIDAN MAIWAINA S. LAYI)_007|KUSHERKI PRIMARY SCHOOL_008|GIDIGORO PRI. SCH. (KOFAR GIDAN GA‐ALLAH)_009|KASUWA GIDIGORI_010|UKUSU PRIMARY SCHOOL_011|LIM PRI. SCH. DANAZUMI (ANG. DAN‐AZUMI)_012|LIM PRI. SCH. JAKIRI (UNG. JAKIRI)_013|OPEN SPACE KASUWA (UNG. DAN MAYAWA)_014|DISPENSARY ZARA (GALADIMA)_015|GINDIN MANGO (UNG. SANI)_016|DISPENSARY GIDIGORO (UNG. ADARAWA)_017");

$scope.loadVariables("KUSHERKI_SOUTHArray=|Select Polling Unit|AFITA MAZA PRIMARY SCHOOL_001|ASHUWA PRIMARY SCHOOL_002|GINDIN MANGO (GIDAN SHIRIGI)_003|HAYIN KUSHERKI DISPENSARY (HAYIN KUSHERKI)_004|GINDIN MANGO (IKUSHE)_005|SAMBUGA PRIMARY SCHOOL_006|SHAMIYANBU PRIMARY SCHOOL_007|TUGUNGUNA PRIMARY SCHOOL_008|TUNGAN BUBA OPEN SPACE (TUNGAN BUBA)_009|GINDIN KADAI (TAMBARI)_010|KEREBO PRI. SCH. (KEREBO)_011|USHAMA MAKARANTA_012|GINDIN DOROWA (BIDAWA)_013|URAGI PRIMARY SCHOOL_014|GINDIN MANGO (UNG. KABIYA)_015");

$scope.loadVariables("KUNDUArray=|Select Polling Unit|GUSHI PRI. SCH (GUSHE)_001|KUNDU DISPENSARY_002|KWANGE PRI. SCH. (KWANGE GARI)_003|AJAMI PRI. SCH. (KOFAR S/AJAMI)_004|GIDIN RIMI (UNG. RIMI)_005|PRI. SCH. JIWAWA (UNG. WAKILI)_006|GIDIN MANGO (UNG. GAIYA)_007");

$scope.loadVariables("SABON_GARIArray=|Select Polling Unit|DISPENSARY KAGARA_001|WATER BOARD OFFICE (GUESS HOUSE KAGARA I)_002|PRI. SCH. TASHAN KWARA (GUESS HOUSE KAGARA II)_003|PRI. SCH. TASHAN DOGO (GIDAN ALI MAIANGUWA)_004|GINDIN MANGO O/S (GIDAN DANIEL)_005|GIDAN MANGO O/S (GIDAN GABIJO)_006|LIM PRI. SCH. (GIDAN HASSAN DANGU)_007|GINDIN MANGO O/S (GIDAN KARMA)_008|MOTOR PARK KAGARA (KOFAR FADA)_009|LAFENE PRIMARY SCHOOL_010|P.H.C. KAGARA_011|OLD GARAGE (SABON FADA)_012|COMM PRI. SCH. (SARKIN MAKANGARA)_013|LIM PRI. SCH. (SARKIN OGU)_014|GINDIN MANGO O/S (UNG. MA’AJI)_015|GINDIN MANGO O/S (UNG. BADUKU)_016|WAYAM PRIMARY SCHOOL_017");

$scope.loadVariables("TEGINA_GARIArray=|Select Polling Unit|OLD MOTOR PARK (AP SABON HANYA I)_001|U. B. E PRI. SCH. (AP SABON HANYA II)_002|ASIBITI GIMI_003|COMMUNITY OFFICE TEGINA_004|DISPENSARY TEGINA_005|GIDAN DANAZUMI_006|GIDAN MARAFA OPEN SPACE (GIDAN MAZAFA)_007|GULANGI PRI. SCH. (GULANGI)_008|KAMFANI PRI. SCH. (KAMFAMN DOGON YARO)_009|PRIMARY SCHOOL GIMI_010|PRIMARY SCHOOL KATAKO_011|TASHAN BAKO PRI. SCH. (TASHAN BAO/B ARNE)_012|GINDIN MANGO O/S (UNG GAFA)_013|UNG. TANKO OPEN SPACE (UNG. TANKO)_014|UNG. BANI OPEN SPACE (UNG. BANI)_015");

$scope.loadVariables("TEGINA_WESTArray=|Select Polling Unit|BABBAN GONA PRY. SCH_001|DISPENSARY KWANA_002|CHAKA PRI. SCH. (GIDAN DAUDU UFAKA)_003|GINDIN MANGO (GAMACHINDO)_004|INGA DADIN KOWA PRI. SCH. (INGA DADIN KOWA)_005|GODORO DISPENSARY (KOFAR MADUGU GODORO)_006|MATSERI PRI. SCH. (MATSERI)_007|MAHANGA_008|GINDIN MANGO O/S (MAIANGWAN S/GARI)_009|PRIMARY SCHOOL KWANA I_010|PRIMARY SCHOOL KWANA II_011|LEPROSY CLINIC KWANA (SARKIN GODORO)_012|UNG. HASSAN_013");

$scope.loadVariables("YAKILAArray=|Select Polling Unit|UNSHAMA PRI. SCH. (AUTA USHAMA)_001|KADAURA DISPENSARY (BARAJE KADAURA)_002|VIEWING CENTRE (DISPENSARY YAKILA)_003|PRI. SCH. PANGU GARI (GIDAN WAKILI)_004|GARIN GABAS PRIMARY SCHOOL_005|KASUWA YAKILA_006|GINDIN MANGO O/S (UNG. MADAKI)_007|OPEN SPACE UNG. MUSA KAMUKU (UNG MUSA KAMUKU)_008");

$scope.loadVariables("SHIROROArray=|Select Ward|ALLAWA|BANGAJIYA|BASSA/KUKOKI|EGWA/GWADA|ERANA|GALKOGO|GURMANA|GUSSORO|KATO|KUSHAKA/KUREBE|KWAKI/CHUKWUBA|MANTA|PINA|SHE|UBANDOMA");

$scope.loadVariables("ALLAWAArray=|Select Polling Unit|ALLAWA PRIMARY SCHOOL I_001|ALLAWA PRIMARY SCHOOL II_002|BURWAYE_003|GYARAMIYA_004|TEGINA GAUDE_005|UNG. SARKIN NOMA_006|KEKE_007|DAGAM_008|UNG. HAKIMI_009|BATARO_010");

$scope.loadVariables("BANGAJIYAArray=|Select Polling Unit|ISLAMIYA_001|UNG. GALADIMA_002|UNG. YAKUBU_003|UNG. KATUKA_004|TASHA KAWO_005|UNG. AGBOLO_006|GBAYI KUJI_007|UNG. ZOGALE_008|TAWALI PRIMARY SCHOOL_009|RAFIN KUKA_010|UNG. SULE_011|KPAKOSHI_012|PAI GADO_013|SHIPAPA_014|CENTRAL PRIMARY SCHOOL I_015|SHATA SABO_016|TALAWYI PRIMARY SCHOOL_017|CENTRAL PRIMARY SCHOOL II_018|UNG. SARKIN TASHA_019|UNG. BOKA_020");

$scope.loadVariables("BASSA_KUKOKIArray=|Select Polling Unit|BASSA PRIMARY SCHOOL_001|DURUMI_002|KUKOKI_003|MAGUGA_004|MASUKU_005|RUMACHE_006|TUDUN BATURIYA_007|TUNGAN GORA_008");

$scope.loadVariables("EGWA_GWADAArray=|Select Polling Unit|GIDAN AZUMI_001|GWADA GWARI_002|GIDAN TUKURA_003|UNGUWAN PABEYI_004|BANAPE VOLUKPA_005|TULUKU_006|GBAIKO_007|GIDAN SARKI_008|UNGUWAN ANGO_009|CHIRI_010|UNG. SANI GWADA_011|REST HOUSE_012|TASHAN MOTA_013|TAWALI GWADA_014|MADABIA_015|PAI ‐ ZARI_016|EGWA PRIMARY SCHOOL_017|KWAKWA PRIMARY SCHOOL_018");

$scope.loadVariables("ERANAArray=|Select Polling Unit|UNG. HAKIMI_001|UNG. ADAMU_002|GWADARA_003|FARIN DOKI_004|ERENA_005|GBAITA_006|UNG. RIMI_007|JAGABAN TASHA_008|GASKIYA BANA_009|ERENA PRIMARY SCHOOL_010|BADUKU JAGODNA_011|BAGA U.P.E.I._012|ALEN BAKIN KOGI_013|DNAKPALA_014|LANTA_015|UNG. SARKIN NOMA_016|UNG. MADI_017");

$scope.loadVariables("GALKOGOArray=|Select Polling Unit|GALKOGO_001|KUSHAKU_002|SHIRORO_003|GYIGBERE_004|KIBUI_005|UNG. GALADIMA_006|IBURO_007|KUSASU_008|KUDODO_009|MAKERA_010|NAKUPE_011|DNAIBUI_012");

$scope.loadVariables("GURMANAArray=|Select Polling Unit|AJATA ABOKI_001|FIYI_002|JABUKIN SAMA PRIMARY SCHOOL_003|KOKKI_004|YELWA_005|TSOHON GARIN GURMANA_006|SARKIN ZAMA_007|UNG. DALLATU_008");

$scope.loadVariables("GUSSOROArray=|Select Polling Unit|ZUMBA PRIMARY SCHOOL_001|GUSSORO PRIMARY SCHOOL_002|PEOPLE'S CLUB_003|BAKIN DAJI_004|KAMPANIN AUDU_005|BAHA_006|C.T.M._007|ZUKUCHI_008|PATUKO_009|BAKIN KASUWA_010|SHAKODNA_011|EBE DAKODNA_012");

$scope.loadVariables("KATOArray=|Select Polling Unit|GIJIWA_001|GUWA_002|KATO_003|KOFAR PADA KASA_004|LASHIN_005|MAIKAKAKI_006|SAYIDNA_007");

$scope.loadVariables("KUSHAKA_KUREBEArray=|Select Polling Unit|KUREBE_001|KOKON DOMA_002|U.P.E. KUSHAKA_003|CHIKAJI_004|UNG. JOJI_005|KOKON PADA_006|MASHEKARI_007|UNG. SARKIN NOMA_008|LUKOPE_009");

$scope.loadVariables("KWAKI_CHUKWUBAArray=|Select Polling Unit|KAZUMA_001|JATAYI_002|KAMPANI CHUKUBA_003|KAURE_004|EGBA_005|KWAKI PRIMARY SCHOOL_006|UNG. SARKIN CHUKUBA_007|UNG. ZARMAI_008|GOMPE_009|KASANYAN BANA_010|UNG. DAUDU YAMOLO_011");

$scope.loadVariables("MANTAArray=|Select Polling Unit|BERI_001|FARIN HULLA_002|GUNGU_003|JIKO_004|KINI_005|MAGAMI GARI_006|MANTA_007");

$scope.loadVariables("PINAArray=|Select Polling Unit|KOFAR JAMATA_001|OWU D.T._002|KOLU_003|PINA_004|SABON GIDA_005|GOTUPE_006|UNG. MADAKI (PINA)_007");

$scope.loadVariables("SHEArray=|Select Polling Unit|GBASSE_001|KUPE_002|SHE GARI_003|SHE MAKARANTA_004|GUNU PRIMARY SCHOOL_005|OPEN SPACE KOFAR SARKI (KOFAR SARKI)_006|NWALO_007|JIKO_008|MUTUM DAYA PRIMARY SCHOOL_009|OPEN SPACE GIDAN MAI UNGUWA (GIDAN MAI UNGUWA)_010|LAKPA_011|OPEN SPACE SARKIN GURUSU (SARKIN GURUSU)_012|SHAKWATU_013|NAVI_014|KOLA_015|NAKOMI_016");

$scope.loadVariables("UBANDOMAArray=|Select Polling Unit|GOVT. CLINIC SABON GARI (HAKIMI OFFICE)_001|UNG. MAMMAN_002|SHUWADNA_003|GODNAYARO_004|KAMPANI DANJUMA_005|E.R.C. OFFICE_006|ZAMFARA_007|KOBWA PRIMARY SCHOOL_008|SHIDNAYI_009|KASAN KARE_010|TAWO PRIMARY SCHOOL_011|JIGIRI_012|WONU_013|TAWALI DIAPE_014|PWAYI_015|AKPANSHI ANGUWAN MAKAMA_016|SHAPE_017|SHAGBA VILLAGE_018|GBYAIDNA_019|ANGUWAN BOKA_020|KAMI_021");

$scope.loadVariables("TAFAArray=|Select Ward|DOGON KURMI|GARAM|IJA GWARI|IJA KORO|IKU|NEW BWARI|WUSE WEST|WUSE  EAST|ZUMA EAST|ZUMA WEST");

$scope.loadVariables("DOGON_KURMIArray=|Select Polling Unit|DOGON KURMI PRIMARY SCHOOL_001|AZHI BISAI PRIMARY SCHOOL OPEN SPACE (AZHI BISAI)_002|CHAWA PRIMARY SCHOOL_003|AZHIKASA PRIMARY SCHOOL_004|K/GIDAN MAIUNGUWA KPADNA_005|AZHIN BICHI VILLAGE_006|CHAWA KIGIDAN SARKI_007|ANGUWANMALE_008");

$scope.loadVariables("GARAMArray=|Select Polling Unit|K/GIDAN SARKI GARAM_001|OPPOSITE ECWA CHURCH AZU_002|K/GIDAN SARKIN GYEDNA_003|GARAM PRIMARY SCHOOL_004|K/GIDAN SARKIN PAWA_005");

$scope.loadVariables("IJA_GWARIArray=|Select Polling Unit|IJA GWARI PRIMARY SCHOOL I_001|BAMPE APYA_002|JIDNA OPPOSITE ANG. MASALLACHI_003|DNAKOPA K/GIDAN ADAMU JEZHI_004|TOBA NYAGURU_005|K/GIDAN SARKIN IJA_006|K/GIDAN THOMAS TUKURA_007|K/GIDAN SARKIN BOWN_008");

$scope.loadVariables("IJA_KOROArray=|Select Polling Unit|IJA KORO PRIMARY SCHOOL_001|TUNGAN LADAN IJA KORO_002|KATA SARKI_003|KATA MADAKI_004");

$scope.loadVariables("IKUArray=|Select Polling Unit|BABAAN TUNGA PRIMARY SCHOOL I_001|BABAN TUNGA PRIMARY SCHOOL II_002|BUNTU IMPRESTI CAMP_003|KOFA PRIMARY SCHOOL_004|KARFE_005|TUNGAN LABARAN_006|YAGURU S/NOMA ALBARKA_007|TUNGAN SANAJE_008|TUNGAN TSAUNI_009");

$scope.loadVariables("NEW_BWARIArray=|Select Polling Unit|NEW BWARI_001|GOYIPE K/GIDAN MAIUNGUWA_002|SHESHI PEK/GIDAN MAJUNGUWA_003|ZHIDNA VILLAGE_004|TUNGA ADAKA PRIMARY SCHOOL I_005|NEW BWARI PRIMARY SCHOOL_006|K/GIDAN SARKIN BWARI_007|T / ADAKA PRI. SCH. II_008");

$scope.loadVariables("WUSE_WESTArray=|Select Polling Unit|MABUSHI_001|K/GIDAN PASTOR BULUS KATAMPE_002|KURUNDUMA VILLAGE_003|ASO KORO PRIMARY SCHOOL_004|K/GIDAN JATAU_005|K/GIDAN GALADIMA_006");

$scope.loadVariables("WUSE_EASTArray=|Select Polling Unit|K/GIDAN SARKIN WUSE_001|GAURAKA PRIMARY SCHOOL II_002|ANG. BARAU GAURAKA_003|APO K/GIDAN MAIUNGUWA_004|NASARAWA IKU PRIMARY SCHOOL_005|IMMANI MECH. WORKSHOP_006|B/IKU MOTOR PARK_007");

$scope.loadVariables("ZUMA_EASTArray=|Select Polling Unit|GAURAKA PRIMARY SCHOOL I_001|CHAUMA PRIMARY SCHOOL_002|K/GIDAN SARKIN GADE_003|DISPENSARY OPEN SPACE (K/GIDAN ALHAJI UBA)_004|K/GIDAN MADAKIN WUSE_005|K/GIDAN SARKIN MAGIJI_006|K/GIDAN SARKIN DADINKOWA_007|K/GIDAN KUYAN BANA_008|K/GIDAN BAWA_009");

$scope.loadVariables("ZUMA_WESTArray=|Select Polling Unit|CHACHI PRIMARY SCHOOL_001|SABONSHARE_002|DAUPE VILLAGE_003|K/GIDAN GARKUWA GAURAKA I_004|K/GIDAN GARKUWA GAURAKA II_005|ANG UWAN TIV I_006|K/GIDAN GWAMNA GAURAKA I_007|ZUMAMINING_008|K/GIDAN GWAMNA I_009|K/GIDAN ISUWA GAURAKA_010");
};

$scope.PrepareRandomChartData = function()
{

$rootScope.ChartKind = $rootScope.Select1.Items[$rootScope.Select1.ItemIndex];

$rootScope.Chart1.Kind = $rootScope.ChartKind;

$rootScope.Chart1.Data = [];

if(($rootScope.ChartKind == 'Pie') || ($rootScope.ChartKind == 'Doughnut') || ($rootScope.ChartKind == 'PolarArea')) {

for ($rootScope.I = 1; $rootScope.I <= 3; $rootScope.I++) {

$rootScope.Random = Math.floor(Math.random() * (10 - 1 + 1)) + 1;

$rootScope.Chart1.Data.push($rootScope.Random);

}

} else {

$rootScope.ChartData = [];

for ($rootScope.I = 1; $rootScope.I <= 3; $rootScope.I++) {

$rootScope.ChartData = [];

for ($rootScope.J = 1; $rootScope.J <= 3; $rootScope.J++) {

$rootScope.Random = Math.floor(Math.random() * (10 - 1 + 1)) + 1;

$rootScope.ChartData.push($rootScope.Random);

}

$rootScope.Chart1.Data.push($rootScope.ChartData);

}

}
};

$scope.UpdateDaySelect = function()
{

$rootScope.DaySelect.Items = [];

$rootScope.Year = $rootScope.YearSelect.Items[$rootScope.YearSelect.ItemIndex];

$rootScope.Month = $rootScope.MonthSelect.Items[$rootScope.MonthSelect.ItemIndex];

$rootScope.ChoosedDate = moment(""+$rootScope.Year+"-"+$rootScope.Month+"" || undefined, "YYYY-MM" || undefined);

$rootScope.MonthDays = $rootScope.ChoosedDate.daysInMonth();

for ($rootScope.I = 1; $rootScope.I <= $rootScope.MonthDays; $rootScope.I++) {

$rootScope.DaySelect.Items.push($rootScope.I);

}
};

}]);

window.App.Ctrls.controller
(
  'AppDialogsCtrl',

  ['$scope', 'properties',

  function ($scope, properties) {
    $scope.Properties = properties;
  }
]);

window.App.Ctrls.controller
(
  'AppEventsCtrl',

  ['$scope', '$rootScope', '$location', '$uibModal', '$http', '$sce', '$timeout', '$window', '$document', 'blockUI', '$uibPosition', '$templateCache',

  function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition, $templateCache) {

    $rootScope.OnAppClick = function () {
      
    };
    
    $rootScope.OnAppHide = function () {
      
    };
    
    $rootScope.OnAppShow = function () {
      
    };    

    $rootScope.OnAppReady = function () {
      
window.App.Plugins.Analytics.call().AnalyticsStart("UA-77332648-3");

$scope.Array_LGA_WARD_PUNITS();

$scope.InitVariables();

$scope.PrepareAppTheme();

$scope.ArraySubjects();

$rootScope.TimerDataCheck.TimerStart();

    };

    $rootScope.OnAppPause = function () {
      
    };

    $rootScope.OnAppKeyUp = function () {
      
    };

    $rootScope.OnAppKeyDown = function () {
      
    };

    $rootScope.OnAppMouseUp = function () {
      
    };

    $rootScope.OnAppMouseDown = function () {
      
    };
    
    $rootScope.OnAppMouseMove = function () {
      
    };    

    $rootScope.OnAppError = function () {
      
    };

    $rootScope.OnAppResize = function () {
      
    };

    $rootScope.OnAppResume = function () {
      
    };

    $rootScope.OnAppOnline = function () {
      
    };

    $rootScope.OnAppOffline = function () {
      
    };

    $rootScope.OnAppIdleEnd = function () {
      
    };

    $rootScope.OnAppIdleStart = function () {
      
    };

    $rootScope.OnAppBackButton = function () {
      
    };

    $rootScope.OnAppMenuButton = function () {
      
    };

    $rootScope.OnAppViewChange = function () {
      
    };

    $rootScope.OnAppOrientation = function () {
      
    };

    $rootScope.OnAppVolumeUpButton = function () {
      
    };

    $rootScope.OnAppVolumeDownButton = function () {
      
    };
    
    $rootScope.OnAppWebExtensionMsg = function () {
      
    };    
  }
]);

angular.element(window.document).ready(function () {
  angular.bootstrap(window.document, ['AppModule']);
});

window.App.Ctrls.controller("welcomeCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.welcome = {};
$rootScope.welcome.ABView = true;
$rootScope.welcome.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.welcome = {};
window.App.welcome.Scope = $scope;

angular.element(window.document).ready(function(event){
angular.element(document.querySelector("body")).addClass($rootScope.App.Theme.toLowerCase());
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.welcome.Event = event;

$rootScope.AppFirstRunTimestamp = $scope.getLocalOption("FirstRunTimestamp");

if ($rootScope.AppFirstRunTimestamp = "") {

$scope.setLocalOption("FirstRunTimestamp", $rootScope.App.Timestamp);

}

$rootScope.AppFirstRunTimestamp = $scope.getLocalOption("FirstRunTimestamp");

$rootScope.AppFirstRunDate = moment($rootScope.AppFirstRunTimestamp || undefined, "" || undefined);

$rootScope.Date = moment($rootScope.AppFirstRunDate || undefined, "" || undefined);

$rootScope.Year = $rootScope.Date.get("year");

$rootScope.Month = $rootScope.Date.get("month");

$rootScope.Month = parseFloat($rootScope.Month + 1);

$rootScope.Day = $rootScope.Date.get("date");

$rootScope.YearPlus = $rootScope.Year;

$rootScope.YearPlus = parseFloat($rootScope.YearPlus + 1);

$rootScope.Serial1 = window.App.Cordova ? navigator.userAgent : device.uuid;

$rootScope.Serial2 = window.App.Cordova ? navigator.appCodeName : device.model;

$rootScope.Serial4 = window.App.Cordova ? "" : device.serial;

$rootScope.AppName = "ePractice"+$rootScope.Year+"/"+$rootScope.YearPlus+"";

var shaObj = new jsSHA("SHA-512", "TEXT");
shaObj.update(""+$rootScope.Serial1+""+$rootScope.AppName+""+$rootScope.Serial2+""+$rootScope.Serial4+"");
$rootScope.DeviceBase = shaObj.getHash("HEX");

$rootScope.DeviceBase = window.App.Utils.subStr($rootScope.DeviceBase, 0, 25);

$rootScope.DeviceCode = $rootScope.DeviceBase;

$rootScope.DeviceCode = $rootScope.DeviceCode.match(/\d/g).join("");

var shaObj = new jsSHA("SHA-512", "TEXT");
shaObj.update(""+$rootScope.Serial1+""+$rootScope.Serial2+""+$rootScope.AppName+""+$rootScope.Serial4+"");
$rootScope.DonateUser = shaObj.getHash("HEX");

$rootScope.DonateUser = window.App.Utils.subStr($rootScope.DonateUser, 0, 25);

$rootScope.DonateKey = $rootScope.DonateUser;

$rootScope.DonateKey = $rootScope.DonateKey.match(/\d/g).join("");

$rootScope.SMSCodeOne = Base64.encode($rootScope.Serial1);

$rootScope.SMSCodeTwo = ""+$rootScope.Serial1+"01"+$rootScope.AppName+"10"+$rootScope.SMSCodeOne+"20"+$rootScope.SMSCodeOne+"30"+$rootScope.SMSCodeOne+"40"+$rootScope.Serial1+""+$rootScope.SMSCodeOne+"50"+$rootScope.SMSCodeOne+"100"+$rootScope.Serial1+"";

$rootScope.OfflineCode = $rootScope.SMSCodeTwo.match(/\d/g).join("");

$rootScope.OfflineCode = window.App.Utils.subStr($rootScope.OfflineCode, 0, 25);

$rootScope.W = window.getComputedStyle(document.getElementById("Container30"), null).getPropertyValue("width");

angular.element(document.getElementById("Container30")).css("top", "0px");

angular.element(document.getElementById("Container30")).css("left", "-"+$rootScope.W+"");

$rootScope.Result = $scope.getLocalOption("SavedImage");

if ($rootScope.Result != "") {

document.getElementById("UserImage1").setAttribute("src", ""+$rootScope.Result+"");

}

$rootScope.Peding = $scope.getLocalOption("PendPoll");

if ($rootScope.Peding == 1) {

$rootScope.BadgeBtn.Hidden = "";

} else {

$rootScope.BadgeBtn.Hidden = "true";

}

$rootScope.$apply();
});

$scope.welcomeSwipeleft = function($event) {
$rootScope.welcome.Event = $event;

$scope.DoHideSwipeMenu();

};

$scope.welcomeSwiperight = function($event) {
$rootScope.welcome.Event = $event;

$scope.DoShowSwipeMenu();

};

$scope.Container30Click = function($event) {
$rootScope.Container30.Event = $event;

$scope.DoHideSwipeMenu();

};

$scope.Container32Click = function($event) {
$rootScope.Container32.Event = $event;

$rootScope.Label20.Text = "Admin Area";

$rootScope.UrsLocation = "1";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

$scope.vibrate(8)

$rootScope.Progressbar3.Hidden = "";

};

$scope.Container39Click = function($event) {
$rootScope.Container39.Event = $event;

$rootScope.Label20.Text = "Reports";

$rootScope.UrsLocation = "2";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

$scope.vibrate(8)

$rootScope.Progressbar3.Hidden = "";

};

$scope.Container40Click = function($event) {
$rootScope.Container40.Event = $event;

$rootScope.Label20.Text = "Pending Result";

$rootScope.UrsLocation = "1";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

$scope.vibrate(8)

$rootScope.Progressbar3.Hidden = "";

};

$scope.Container41Click = function($event) {
$rootScope.Container41.Event = $event;

$rootScope.Label20.Text = "Poll Result";

$rootScope.UrsLocation = "1";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

$scope.vibrate(8)

$rootScope.Progressbar3.Hidden = "";

};

$scope.Container42Click = function($event) {
$rootScope.Container42.Event = $event;

$rootScope.Label20.Text = "Send Poll";

$scope.replaceView("SendPoll");

$scope.vibrate(8)

};

$scope.Container43Click = function($event) {
$rootScope.Container43.Event = $event;

$rootScope.Label20.Text = "Add Poll";

$rootScope.LGAselect.ItemIndex = $scope.getLocalOption("lga");

$rootScope.WARDselect.ItemIndex = $scope.getLocalOption("ward");

$rootScope.PUNITselect.ItemIndex = $scope.getLocalOption("punit");

$rootScope.ELECTIONselect.ItemIndex = $scope.getLocalOption("election");

$rootScope.PARTYselect.ItemIndex = $scope.getLocalOption("party");

$rootScope.RESPONSselect.ItemIndex = $scope.getLocalOption("respons");

$rootScope.REASONselect.ItemIndex = $scope.getLocalOption("reason");

$rootScope.VOTERname.Value = $scope.getLocalOption("vname");

$rootScope.VOTERphone.Value = $scope.getLocalOption("vphone");

$rootScope.VOTERage.ItemIndex = $scope.getLocalOption("vage");

$rootScope.VOTERvin.Value = $scope.getLocalOption("vvin");

$rootScope.VOTERgender.ItemIndex = $scope.getLocalOption("vgender");

$rootScope.VOTERreligion.ItemIndex = $scope.getLocalOption("vreligion");

$rootScope.AGENTname.Value = $scope.getLocalOption("aname");

$rootScope.AGENTphone.Value = $scope.getLocalOption("aphone");

$rootScope.YearSelect.ItemIndex = $scope.getLocalOption("vage1");

$rootScope.MonthSelect.ItemIndex = $scope.getLocalOption("vage2");

$rootScope.DaySelect.ItemIndex = $scope.getLocalOption("vage3");

$rootScope.LGAselect.ItemIndex = parseFloat($rootScope.LGAselect.ItemIndex);

$rootScope.WARDselect.ItemIndex = parseFloat($rootScope.WARDselect.ItemIndex);

$rootScope.PUNITselect.ItemIndex = parseFloat($rootScope.PUNITselect.ItemIndex);

$rootScope.ELECTIONselect.ItemIndex = parseFloat($rootScope.ELECTIONselect.ItemIndex);

$rootScope.PARTYselect.ItemIndex = parseFloat($rootScope.PARTYselect.ItemIndex);

$rootScope.RESPONSselect.ItemIndex = parseFloat($rootScope.RESPONSselect.ItemIndex);

$rootScope.REASONselect.ItemIndex = parseFloat($rootScope.REASONselect.ItemIndex);

$rootScope.VOTERname.Value = $rootScope.VOTERname.Value;

$rootScope.VOTERphone.Value = $rootScope.VOTERphone.Value;

$rootScope.VOTERvin.Value = $rootScope.VOTERvin.Value;

$rootScope.YearSelect.ItemIndex = parseFloat($rootScope.YearSelect.ItemIndex);

$rootScope.MonthSelect.ItemIndex = parseFloat($rootScope.MonthSelect.ItemIndex);

$rootScope.DaySelect.ItemIndex = parseFloat($rootScope.DaySelect.ItemIndex);

$rootScope.VOTERgender.ItemIndex = parseFloat($rootScope.VOTERgender.ItemIndex);

$rootScope.VOTERreligion.ItemIndex = parseFloat($rootScope.VOTERreligion.ItemIndex);

$rootScope.AGENTname.Value = $rootScope.AGENTname.Value;

$rootScope.AGENTphone.Value = $rootScope.AGENTphone.Value;

$scope.replaceView("SendPoll");

$scope.vibrate(8)

};

$scope.Container12Click = function($event) {
$rootScope.Container12.Event = $event;

$scope.alert("Alert", "No Notification available");

};

$scope.Container13Click = function($event) {
$rootScope.Container13.Event = $event;

$scope.vibrate(8)

};

$scope.HtmlConftent17Click = function($event) {
$rootScope.HtmlConftent17.Event = $event;

$rootScope.Label20.Text = "Send Poll";

$scope.replaceView("SendPoll");

};

$scope.HtmlContent56Click = function($event) {
$rootScope.HtmlContent56.Event = $event;

$scope.DoShowSwipeMenu();

};

$scope.HtmlContent2Click = function($event) {
$rootScope.HtmlContent2.Event = $event;

$rootScope.UrsLocation = "2";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

$scope.vibrate(8)

$rootScope.Progressbar3.Hidden = "";

};

$scope.Image1Click = function($event) {
$rootScope.Image1.Event = $event;

$rootScope.Label20.Text = "Send Poll";

$scope.replaceView("SendPoll");

};

$scope.Image2Click = function($event) {
$rootScope.Image2.Event = $event;

$rootScope.SelectedLGA = $scope.getLocalOption("lga2");

$rootScope.SelectedWARD = $scope.getLocalOption("ward2");

$rootScope.SelectedPUNIT = $scope.getLocalOption("punit2");

$scope.showModalView("PrendingPoll");

$scope.vibrate(8)

};

$scope.Image3Click = function($event) {
$rootScope.Image3.Event = $event;

$rootScope.Label20.Text = "Poll Result";

$rootScope.UrsLocation = "1";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

$scope.vibrate(8)

$rootScope.Progressbar3.Hidden = "";

};

$scope.Image5Click = function($event) {
$rootScope.Image5.Event = $event;

$rootScope.Label20.Text = "Reports";

$rootScope.UrsLocation = "2";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

$scope.vibrate(8)

$rootScope.Progressbar3.Hidden = "";

};

$scope.Image7Click = function($event) {
$rootScope.Image7.Event = $event;

$scope.alert("Alert", "No Notification available");

};

$scope.Image8Click = function($event) {
$rootScope.Image8.Event = $event;

$rootScope.Label20.Text = "Admin Area";

$rootScope.UrsLocation = "1";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

$scope.vibrate(8)

$rootScope.Progressbar3.Hidden = "";

};

$scope.BadgeBtnClick = function($event) {
$rootScope.BadgeBtn.Event = $event;

$rootScope.IFrameVisitor.Url = "https://tawk.to/chat/5ae1b2d8227d3d7edc24c177/default/?$_tawk_popout=true";

$rootScope.IFrameCHAT.Url = "app/files/index.html";

$rootScope.IFrameCHAT.Hidden = "true";

$rootScope.IFrameNEWS.Hidden = "true";

if ($rootScope.BadgeBtn.Badge == 0) {

} else {

$rootScope.BadgeBtn.Badge = 3;

$rootScope.BadgeBtnBadge = parseFloat($rootScope.BadgeBtn.Badge);

$scope.setLocalOption("BadgeCount", $rootScope.BadgeBtnBadge);

}

$rootScope.Progressbar3.Hidden = "";

$rootScope.Textarea3.Value = "";

$rootScope.Textarea4.Value = "";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

angular.element(document.getElementById("LabelCHAT")).css("border-bottom-style", "solid");

angular.element(document.getElementById("LabelCHAT")).css("border-bottom-color", "#ffffff");

angular.element(document.getElementById("LabelCHAT")).css("color", "#ffffff");

angular.element(document.getElementById("LabelCBT")).css("border-bottom-style", "");

angular.element(document.getElementById("LabelNOVEL")).css("border-bottom-style", "");

angular.element(document.getElementById("LabelNEWS")).css("border-bottom-style", "");

angular.element(document.getElementById("LabelPORTAL")).css("border-bottom-style", "");

angular.element(document.getElementById("LabelCBT")).css("color", "#bcecbb");

angular.element(document.getElementById("LabelNOVEL")).css("color", "#bcecbb");

angular.element(document.getElementById("LabelNEWS")).css("color", "#bcecbb");

angular.element(document.getElementById("LabelPORTAL")).css("color", "#bcecbb");

$rootScope.ContainerCBT.Hidden = "true";

$rootScope.ContainerNOVEL.Hidden = "true";

$rootScope.ContainerCHAT.Hidden = "";

$rootScope.ContainerNEWS.Hidden = "true";

$rootScope.ContainerPORTAL.Hidden = "true";

$rootScope.UserClicked = 1;

$scope.setLocalOption("UserClickedSaved", $rootScope.UserClicked);

};

$scope.BadgeBtnDblclick = function($event) {
$rootScope.BadgeBtn.Event = $event;

};

$rootScope.HttpClient3.Execute = function() {
  $rootScope.HttpClient3.Request.transformRequest = window.App.Utils.transformRequest($rootScope.HttpClient3.Transform);
  $http($rootScope.HttpClient3.Request)
  .then(function(response) {
    $rootScope.HttpClient3.Status = response.status;
    $rootScope.HttpClient3.Response = response.data;
    $rootScope.HttpClient3.StatusText = response.statusText;

$rootScope.HttpStatus = $rootScope.HttpClient3.Status;

$rootScope.HttpStatusText = $rootScope.HttpClient3.StatusText;

$rootScope.HttpResponse = $rootScope.HttpClient3.Response;

$rootScope.Progressbar3.Hidden = "true";

$rootScope.Button63.Hidden = "true";

if ($rootScope.HttpResponse ==  "ThisFileExist" ) {

if ($rootScope.UrsLocation == 1) {

$rootScope.Label4.Text = "Admin Area";

$rootScope.IFrame3.Url = "http://justclickk.com/adorihem/polls_result";

$scope.replaceView("Views");

} else if ($rootScope.UrsLocation == 2) {

$rootScope.Label4.Text = "Polls Report";

$rootScope.IFrame3.Url = "http://justclickk.com/adorihem/polls_report";

$scope.replaceView("Views");

}

} else {

$scope.alertBox("It appears you have run out of data! \nPlease Check and trya again.", "success");

}

  },
  function(response) {
    $rootScope.HttpClient3.Status = response.status;
    $rootScope.HttpClient3.Response = response.data;
    $rootScope.HttpClient3.StatusText = response.statusText;

$rootScope.Progressbar3.Hidden = "true";

$rootScope.Button63.Hidden = "";

$rootScope.HttpStatus = $rootScope.HttpClient3.Status;

$rootScope.HttpResponse = $rootScope.HttpClient3.Response;

$rootScope.TimerDataCheck.TimerStop();

if ($rootScope.HttpStatus == -1) {

$scope.alertBox("Internet connection problems? We couldn\x27t load your request.", "danger");

return null;

}

if ($rootScope.HttpStatus == 400) {

$scope.alertBox($rootScope.HttpResponse, "danger");

return null;

}

if ($rootScope.HttpStatus == 500) {

$scope.alertBox($rootScope.HttpResponse, "danger");

return null;

}

  });
};

$scope.Button63Click = function($event) {
$rootScope.Button63.Event = $event;

$rootScope.Progressbar3.Hidden = "";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

};

}]);
window.App.Ctrls.controller("SendPollCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.SendPoll = {};
$rootScope.SendPoll.ABView = true;
$rootScope.SendPoll.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.SendPoll = {};
window.App.SendPoll.Scope = $scope;

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.SendPoll.Event = event;

angular.element(document.getElementById("Container7")).css("height", ""+$rootScope.App.InnerHeight+"px");

$rootScope.$apply();
});

$rootScope.TimerDataCheck.OnInterval = function() {

$rootScope.dataSec = 1;

if ($rootScope.dataSec == 5) {

$rootScope.dataSec = 0;

$rootScope.HttpClientDataCheck.Request.data = {};

$rootScope.HttpClientDataCheck.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClientDataCheck.Execute();

}

};

$rootScope.TimerDataCheck.TimerStart = function() {
  $rootScope.TimerDataCheck.TimerStop();
  $rootScope.App._Timers.TimerDataCheck = $interval($rootScope.TimerDataCheck.OnInterval, $rootScope.TimerDataCheck.Interval);
};

$rootScope.TimerDataCheck.TimerStop = function() {
  if ($rootScope.App._Timers.TimerDataCheck !== null) {
    $interval.cancel($rootScope.App._Timers.TimerDataCheck);
  }
};

$rootScope.HttpClientDataCheck.Execute = function() {
  $rootScope.HttpClientDataCheck.Request.transformRequest = window.App.Utils.transformRequest($rootScope.HttpClientDataCheck.Transform);
  $http($rootScope.HttpClientDataCheck.Request)
  .then(function(response) {
    $rootScope.HttpClientDataCheck.Status = response.status;
    $rootScope.HttpClientDataCheck.Response = response.data;
    $rootScope.HttpClientDataCheck.StatusText = response.statusText;

$rootScope.Progressbar3.Hidden = "true";

$rootScope.Button63.Hidden = "true";

$rootScope.HttpStatus = $rootScope.HttpClientDataCheck.Status;

$rootScope.HttpStatusText = $rootScope.HttpClientDataCheck.StatusText;

$rootScope.HttpResponse = $rootScope.HttpClientDataCheck.Response;

if ($rootScope.HttpResponse ==  "ThisFileExist" ) {

$rootScope.HttpResponse = "";

$rootScope.IFrameMyVotes.Hidden = "";

} else {

$rootScope.IFrameMyVotes.Hidden = "true";

$rootScope.Progressbar3.Hidden = "true";

$rootScope.Button63.Hidden = "";

$scope.alertBox("It appears you have run out of data! \nPlease Check and trya again.", "success");

}

  },
  function(response) {
    $rootScope.HttpClientDataCheck.Status = response.status;
    $rootScope.HttpClientDataCheck.Response = response.data;
    $rootScope.HttpClientDataCheck.StatusText = response.statusText;

$rootScope.Progressbar3.Hidden = "true";

$rootScope.Button63.Hidden = "";

$rootScope.HttpStatus = $rootScope.HttpClientDataCheck.Status;

$rootScope.HttpStatusText = $rootScope.HttpClientDataCheck.StatusText;

$rootScope.HttpResponse = $rootScope.HttpClientDataCheck.Response;

if ($rootScope.HttpStatus == -1) {

$rootScope.IFrameMyVotes.Hidden = "true";

$rootScope.Progressbar3.Hidden = "true";

$rootScope.Button63.Hidden = "";

$scope.alertBox("Internet connection problems? We couldn\x27t continue.", "danger");

}

$rootScope.TimerDataCheck.TimerStop();

  });
};

$rootScope.NewClient.Execute = function() {
  $rootScope.NewClient.Request.transformRequest = window.App.Utils.transformRequest($rootScope.NewClient.Transform);
  $http($rootScope.NewClient.Request)
  .then(function(response) {
    $rootScope.NewClient.Status = response.status;
    $rootScope.NewClient.Response = response.data;
    $rootScope.NewClient.StatusText = response.statusText;

$rootScope.HttpStatus = $rootScope.NewClient.Status;

$rootScope.HttpStatusText = $rootScope.NewClient.StatusText;

$rootScope.HttpResponse = $rootScope.NewClient.Response;

$scope.alertBox("The Poll has been saved.", "success");

$rootScope.Progressbar4.Hidden = "true";

$rootScope.LGAselect.ItemIndex = 0;

$rootScope.WARDselect.ItemIndex = 0;

$rootScope.PUNITselect.ItemIndex = 0;

$rootScope.ELECTIONselect.ItemIndex = 0;

$rootScope.PARTYselect.ItemIndex = 0;

$rootScope.RESPONSselect.ItemIndex = 0;

$rootScope.REASONselect.ItemIndex = 0;

$rootScope.VOTERage.ItemIndex = 0;

$rootScope.VOTERgender.ItemIndex = 0;

$rootScope.VOTERgender.ItemIndex = 0;

$rootScope.VOTERreligion.ItemIndex = 0;

$rootScope.VOTERname.Value = "";

$rootScope.VOTERname.PlaceHolder = "Enter Voter Full Name";

$rootScope.VOTERphone.Value = "";

$rootScope.VOTERphone.PlaceHolder = "Enter Voter Phone Number";

$rootScope.AGENTname.Value = "";

$rootScope.AGENTname.PlaceHolder = "Enter Agent Full Name";

$rootScope.AGENTphone.Value = "";

$rootScope.AGENTphone.PlaceHolder = "Enter Agent Phone";

$rootScope.Button1.Text = "CONTINUE";

  },
  function(response) {
    $rootScope.NewClient.Status = response.status;
    $rootScope.NewClient.Response = response.data;
    $rootScope.NewClient.StatusText = response.statusText;

$scope.alertBox("Error while add the Poll", "danger");

$rootScope.Progressbar4.Hidden = "true";

$rootScope.Button1.Text = "Try Again";

  });
};

$scope.HtmlContent9Click = function($event) {
$rootScope.HtmlContent9.Event = $event;

$rootScope.SelectedLGA = $rootScope.LGAselect.Items[$rootScope.LGAselect.ItemIndex];

$rootScope.SelectedWARD = $rootScope.WARDselect.Items[$rootScope.WARDselect.ItemIndex];

$rootScope.SelectedPUNIT = $rootScope.PUNITselect.Items[$rootScope.PUNITselect.ItemIndex];

$scope.setLocalOption("lga", $rootScope.LGAselect.ItemIndex);

$scope.setLocalOption("lga2", $rootScope.SelectedLGA);

$scope.setLocalOption("ward", $rootScope.WARDselect.ItemIndex);

$scope.setLocalOption("ward2", $rootScope.SelectedWARD);

$scope.setLocalOption("punit", $rootScope.PUNITselect.ItemIndex);

$scope.setLocalOption("punit2", $rootScope.SelectedPUNIT);

$scope.setLocalOption("election", $rootScope.ELECTIONselect.ItemIndex);

$scope.setLocalOption("party", $rootScope.PARTYselect.ItemIndex);

$scope.setLocalOption("respons", $rootScope.RESPONSselect.ItemIndex);

$scope.setLocalOption("reason", $rootScope.REASONselect.ItemIndex);

$scope.setLocalOption("vname", $rootScope.VOTERname.Value);

$scope.setLocalOption("vphone", $rootScope.VOTERphone.Value);

$scope.setLocalOption("vvin", $rootScope.VOTERvin.Value);

$scope.setLocalOption("vage1", $rootScope.YearSelect.ItemIndex);

$scope.setLocalOption("vage2", $rootScope.MonthSelect.ItemIndex);

$scope.setLocalOption("vage3", $rootScope.DaySelect.ItemIndex);

$scope.setLocalOption("vgender", $rootScope.VOTERgender.ItemIndex);

$scope.setLocalOption("vreligion", $rootScope.VOTERreligion.ItemIndex);

$scope.setLocalOption("aname", $rootScope.VOTERname.Value);

$scope.setLocalOption("aphone", $rootScope.VOTERphone.Value);

$rootScope.Peding = 1;

$scope.setLocalOption("PendPoll", $rootScope.Peding);

$scope.alertBox("Draft Copy Saved (Pending Poll)", "success");

};

$scope.HtmlContent10Click = function($event) {
$rootScope.HtmlContent10.Event = $event;

$rootScope.Label20.Text = "Voters Poll";

$scope.replaceView("welcome");

};

$scope.HtmlContent11Click = function($event) {
$rootScope.HtmlContent11.Event = $event;

$rootScope.LGAselect.ItemIndex = $scope.getLocalOption("lga");

$rootScope.WARDselect.ItemIndex = $scope.getLocalOption("ward");

$rootScope.PUNITselect.ItemIndex = $scope.getLocalOption("punit");

$rootScope.ELECTIONselect.ItemIndex = $scope.getLocalOption("election");

$rootScope.PARTYselect.ItemIndex = $scope.getLocalOption("party");

$rootScope.RESPONSselect.ItemIndex = $scope.getLocalOption("respons");

$rootScope.REASONselect.ItemIndex = $scope.getLocalOption("reason");

$rootScope.VOTERname.Value = $scope.getLocalOption("vname");

$rootScope.VOTERphone.Value = $scope.getLocalOption("vphone");

$rootScope.VOTERage.ItemIndex = $scope.getLocalOption("vage");

$rootScope.VOTERvin.Value = $scope.getLocalOption("vvin");

$rootScope.VOTERgender.ItemIndex = $scope.getLocalOption("vgender");

$rootScope.VOTERreligion.ItemIndex = $scope.getLocalOption("vreligion");

$rootScope.AGENTname.Value = $scope.getLocalOption("aname");

$rootScope.AGENTphone.Value = $scope.getLocalOption("aphone");

$rootScope.YearSelect.ItemIndex = $scope.getLocalOption("vage1");

$rootScope.MonthSelect.ItemIndex = $scope.getLocalOption("vage2");

$rootScope.DaySelect.ItemIndex = $scope.getLocalOption("vage3");

$rootScope.LGAselect.ItemIndex = parseFloat($rootScope.LGAselect.ItemIndex);

$rootScope.WARDselect.ItemIndex = parseFloat($rootScope.WARDselect.ItemIndex);

$rootScope.PUNITselect.ItemIndex = parseFloat($rootScope.PUNITselect.ItemIndex);

$rootScope.ELECTIONselect.ItemIndex = parseFloat($rootScope.ELECTIONselect.ItemIndex);

$rootScope.PARTYselect.ItemIndex = parseFloat($rootScope.PARTYselect.ItemIndex);

$rootScope.RESPONSselect.ItemIndex = parseFloat($rootScope.RESPONSselect.ItemIndex);

$rootScope.REASONselect.ItemIndex = parseFloat($rootScope.REASONselect.ItemIndex);

$rootScope.VOTERname.Value = $rootScope.VOTERname.Value;

$rootScope.VOTERphone.Value = $rootScope.VOTERphone.Value;

$rootScope.VOTERvin.Value = $rootScope.VOTERvin.Value;

$rootScope.YearSelect.ItemIndex = parseFloat($rootScope.YearSelect.ItemIndex);

$rootScope.MonthSelect.ItemIndex = parseFloat($rootScope.MonthSelect.ItemIndex);

$rootScope.DaySelect.ItemIndex = parseFloat($rootScope.DaySelect.ItemIndex);

$rootScope.VOTERgender.ItemIndex = parseFloat($rootScope.VOTERgender.ItemIndex);

$rootScope.VOTERreligion.ItemIndex = parseFloat($rootScope.VOTERreligion.ItemIndex);

$rootScope.AGENTname.Value = $rootScope.AGENTname.Value;

$rootScope.AGENTphone.Value = $rootScope.AGENTphone.Value;

$rootScope.Peding = 0;

$scope.setLocalOption("PendPoll", $rootScope.Peding);

$scope.alertBox("Pending Poll Loaded (Draft Copy)", "danger");

};

$scope.VOTERageChange = function($event) {
$rootScope.VOTERage.Event = $event;

$rootScope.SelectedVOTERage = $rootScope.VOTERage.Items[$rootScope.VOTERage.ItemIndex];

};

$scope.LGAselectChange = function($event) {
$rootScope.LGAselect.Event = $event;

$rootScope.WARDselect.Items = [];

$rootScope.PUNITselect.Items = [];

$rootScope.SelectedLGA = $rootScope.LGAselect.Items[$rootScope.LGAselect.ItemIndex];

if ($rootScope.SelectedLGA ==  "AGAIE" ) {

$rootScope.WARDselect.Items = $rootScope.AGAIEArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "AGWARA" ) {

$rootScope.WARDselect.Items = $rootScope.AGWARAArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "BIDA" ) {

$rootScope.WARDselect.Items = $rootScope.BIDAArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "BORGU" ) {

$rootScope.WARDselect.Items = $rootScope.BORGUArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "BOSSO" ) {

$rootScope.WARDselect.Items = $rootScope.BOSSOArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "CHANCHAGA" ) {

$rootScope.WARDselect.Items = $rootScope.CHANCHAGA_LGA_Array.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "EDATTI" ) {

$rootScope.WARDselect.Items = $rootScope.EDATTIArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "GBAKO" ) {

$rootScope.WARDselect.Items = $rootScope.GBAKOArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "GURARA" ) {

$rootScope.WARDselect.Items = $rootScope.GURARAArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "KATCHA" ) {

$rootScope.WARDselect.Items = $rootScope.KATCHA_LGA_Array.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "KONTAGORA" ) {

$rootScope.WARDselect.Items = $rootScope.KONTAGORAArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "LAPAI" ) {

$rootScope.WARDselect.Items = $rootScope.LAPAIArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "LAVUN" ) {

$rootScope.WARDselect.Items = $rootScope.LAVUNArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "MAGAMA" ) {

$rootScope.WARDselect.Items = $rootScope.MAGAMAArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "MARIGA" ) {

$rootScope.WARDselect.Items = $rootScope.MARIGAArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "MASHEGU" ) {

$rootScope.WARDselect.Items = $rootScope.MASHEGU_LGA_Array.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "MOKWA" ) {

$rootScope.WARDselect.Items = $rootScope.MOKWA_LGA_Array.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "MUYA" ) {

$rootScope.WARDselect.Items = $rootScope.MUYAArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "PAIKORO" ) {

$rootScope.WARDselect.Items = $rootScope.PAIKOROArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "RAFI" ) {

$rootScope.WARDselect.Items = $rootScope.RAFIArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "RIJAU" ) {

$rootScope.WARDselect.Items = $rootScope.RIJAU_LGA_Array.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "SHIRORO" ) {

$rootScope.WARDselect.Items = $rootScope.SHIROROArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "SULEJA" ) {

$rootScope.WARDselect.Items = $rootScope.SULEJAArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "TAFA" ) {

$rootScope.WARDselect.Items = $rootScope.TAFAArray.concat($rootScope.WARDselect.Items);

} else if ($rootScope.SelectedLGA ==  "WUSHISHI" ) {

$rootScope.WARDselect.Items = $rootScope.WUSHISHIArray.concat($rootScope.WARDselect.Items);

}

$rootScope.WARDselect.Value = $rootScope.WARDselect.Items[$rootScope.WARDselect.ItemIndex];

$rootScope.WARDselect.ItemIndex = 0;

};

$scope.WARDselectChange = function($event) {
$rootScope.WARDselect.Event = $event;

$rootScope.PUNITselect.Items = [];

$rootScope.SelectedWARD = $rootScope.WARDselect.Items[$rootScope.WARDselect.ItemIndex];

if ($rootScope.SelectedWARD ==  "BARO" ) {

$rootScope.PUNITselect.Items = $rootScope.BAROArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BOKU" ) {

$rootScope.PUNITselect.Items = $rootScope.BOKUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EKOBADEGGI" ) {

$rootScope.PUNITselect.Items = $rootScope.EKOBADEGGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EKOSSA" ) {

$rootScope.PUNITselect.Items = $rootScope.EKOSSAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EKOWUGI" ) {

$rootScope.PUNITselect.Items = $rootScope.EKOWUGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EKOWUNA" ) {

$rootScope.PUNITselect.Items = $rootScope.EKOWUNAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ETSUGAIE" ) {

$rootScope.PUNITselect.Items = $rootScope.ETSUGAIEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DAUACI" ) {

$rootScope.PUNITselect.Items = $rootScope.DAUACIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUTIRIKO" ) {

$rootScope.PUNITselect.Items = $rootScope.KUTIRIKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAGAJI" ) {

$rootScope.PUNITselect.Items = $rootScope.MAGAJIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TAGAGI" ) {

$rootScope.PUNITselect.Items = $rootScope.TAGAGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ADEHE" ) {

$rootScope.PUNITselect.Items = $rootScope.ADEHEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "AGWATA" ) {

$rootScope.PUNITselect.Items = $rootScope.AGWATAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BUSURU" ) {

$rootScope.PUNITselect.Items = $rootScope.BUSURUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GALLAH" ) {

$rootScope.PUNITselect.Items = $rootScope.GALLAHArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KASHINI" ) {

$rootScope.PUNITselect.Items = $rootScope.KASHINIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KOKOLI" ) {

$rootScope.PUNITselect.Items = $rootScope.KOKOLIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAGO" ) {

$rootScope.PUNITselect.Items = $rootScope.MAGOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "PAPIRI" ) {

$rootScope.PUNITselect.Items = $rootScope.PAPIRIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ROFIA" ) {

$rootScope.PUNITselect.Items = $rootScope.ROFIAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SUTEKU" ) {

$rootScope.PUNITselect.Items = $rootScope.SUTEKUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BARIKI" ) {

$rootScope.PUNITselect.Items = $rootScope.BARIKIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "CENIYAN" ) {

$rootScope.PUNITselect.Items = $rootScope.CENIYANArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DOKODZA" ) {

$rootScope.PUNITselect.Items = $rootScope.DOKODZAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KYARI" ) {

$rootScope.PUNITselect.Items = $rootScope.KYARIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "LANDZUN" ) {

$rootScope.PUNITselect.Items = $rootScope.LANDZUNArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MASABA I" ) {

$rootScope.PUNITselect.Items = $rootScope.MASABA_IArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MASABA II" ) {

$rootScope.PUNITselect.Items = $rootScope.MASABA_IIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MASAGA I" ) {

$rootScope.PUNITselect.Items = $rootScope.MASAGA_IArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MASAGA II" ) {

$rootScope.PUNITselect.Items = $rootScope.MASAGA_IIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAYAKI NDAJIYA" ) {

$rootScope.PUNITselect.Items = $rootScope.MAYAKI_NDAJIYAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NASSARAFU" ) {

$rootScope.PUNITselect.Items = $rootScope.NASSARAFUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "UMARU/MAJIGI I" ) {

$rootScope.PUNITselect.Items = $rootScope.UMARU_MAJIGI_IArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "UMARU/MAJIGI II" ) {

$rootScope.PUNITselect.Items = $rootScope.UMARU_MAJIGI_IIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "WADATA" ) {

$rootScope.PUNITselect.Items = $rootScope.WADATAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BABANNA" ) {

$rootScope.PUNITselect.Items = $rootScope.BABANNAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DUGGA" ) {

$rootScope.PUNITselect.Items = $rootScope.DUGGAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KARABONDE" ) {

$rootScope.PUNITselect.Items = $rootScope.KARABONDEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KONKOSO" ) {

$rootScope.PUNITselect.Items = $rootScope.KONKOSOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MALALE" ) {

$rootScope.PUNITselect.Items = $rootScope.MALALEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NEW BUSSA" ) {

$rootScope.PUNITselect.Items = $rootScope.NEW_BUSSAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KABE/PISSA" ) {

$rootScope.PUNITselect.Items = $rootScope.KABE_PISSAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SHAGUNU" ) {

$rootScope.PUNITselect.Items = $rootScope.SHAGUNUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "WAWA" ) {

$rootScope.PUNITselect.Items = $rootScope.WAWAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "RIVERINE" ) {

$rootScope.PUNITselect.Items = $rootScope.RIVERINEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BEJI" ) {

$rootScope.PUNITselect.Items = $rootScope.BEJIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BOSSO CENTRAL I" ) {

$rootScope.PUNITselect.Items = $rootScope.BOSSO_CENTRAL_IArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BOSSO CENTRAL II" ) {

$rootScope.PUNITselect.Items = $rootScope.BOSSO_CENTRAL_IIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "CHANCHAGA" ) {

$rootScope.PUNITselect.Items = $rootScope.CHANCHAGAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GARATU" ) {

$rootScope.PUNITselect.Items = $rootScope.GARATUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KAMPALA" ) {

$rootScope.PUNITselect.Items = $rootScope.KAMPALAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KODO" ) {

$rootScope.PUNITselect.Items = $rootScope.KODOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAIKUNKELE" ) {

$rootScope.PUNITselect.Items = $rootScope.MAIKUNKELEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAITUMBI" ) {

$rootScope.PUNITselect.Items = $rootScope.MAITUMBIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SHATA" ) {

$rootScope.PUNITselect.Items = $rootScope.SHATAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "LIMAWA 'A'" ) {

$rootScope.PUNITselect.Items = $rootScope.LIMAWA_AArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "LIMAWA 'B'" ) {

$rootScope.PUNITselect.Items = $rootScope.LIMAWA_BArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAKERA" ) {

$rootScope.PUNITselect.Items = $rootScope.MAKERAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MINNA CENTRAL" ) {

$rootScope.PUNITselect.Items = $rootScope.MINNA_CENTRALArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MINNA SOUTH" ) {

$rootScope.PUNITselect.Items = $rootScope.MINNA_SOUTHArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NASSARAWA 'A'" ) {

$rootScope.PUNITselect.Items = $rootScope.NASSARAWA_AArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NASSARAWA 'B'" ) {

$rootScope.PUNITselect.Items = $rootScope.NASSARAWA_BArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NASSARAWA 'C'" ) {

$rootScope.PUNITselect.Items = $rootScope.NASSARAWA_CArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SABON GARI" ) {

$rootScope.PUNITselect.Items = $rootScope.SABON_GARIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TUDUN WADA NORTH" ) {

$rootScope.PUNITselect.Items = $rootScope.TUDUN_WADA_NORTHArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TUDUN WADA SOUTH" ) {

$rootScope.PUNITselect.Items = $rootScope.TUDUN_WADA_SOUTHArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ENAGI" ) {

$rootScope.PUNITselect.Items = $rootScope.ENAGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ETSU TASHA" ) {

$rootScope.PUNITselect.Items = $rootScope.ETSU_TASHAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "FAZHI" ) {

$rootScope.PUNITselect.Items = $rootScope.FAZHIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GAZHE I" ) {

$rootScope.PUNITselect.Items = $rootScope.GAZHE_IArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GAZHE II" ) {

$rootScope.PUNITselect.Items = $rootScope.GAZHE_IIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GBANGBAN" ) {

$rootScope.PUNITselect.Items = $rootScope.GBANGBANArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GONAGI" ) {

$rootScope.PUNITselect.Items = $rootScope.GONAGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GUZAN" ) {

$rootScope.PUNITselect.Items = $rootScope.GUZANArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ROKOTA" ) {

$rootScope.PUNITselect.Items = $rootScope.ROKOTAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SAKPE" ) {

$rootScope.PUNITselect.Items = $rootScope.SAKPEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BATAGI" ) {

$rootScope.PUNITselect.Items = $rootScope.BATAGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BATAKO" ) {

$rootScope.PUNITselect.Items = $rootScope.BATAKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EDOKOTA" ) {

$rootScope.PUNITselect.Items = $rootScope.EDOKOTAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EDOZHIGI" ) {

$rootScope.PUNITselect.Items = $rootScope.EDOZHIGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ETSU AUDU" ) {

$rootScope.PUNITselect.Items = $rootScope.ETSU_AUDUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GBADAFU" ) {

$rootScope.PUNITselect.Items = $rootScope.GBADAFUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GOGATA" ) {

$rootScope.PUNITselect.Items = $rootScope.GOGATAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "LEMU" ) {

$rootScope.PUNITselect.Items = $rootScope.LEMUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NUWANKOTA" ) {

$rootScope.PUNITselect.Items = $rootScope.NUWANKOTAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SAMMAJIKO" ) {

$rootScope.PUNITselect.Items = $rootScope.SAMMAJIKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BONU" ) {

$rootScope.PUNITselect.Items = $rootScope.BONUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DIKO" ) {

$rootScope.PUNITselect.Items = $rootScope.DIKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GAWU" ) {

$rootScope.PUNITselect.Items = $rootScope.GAWUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IZOM" ) {

$rootScope.PUNITselect.Items = $rootScope.IZOMArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KABO" ) {

$rootScope.PUNITselect.Items = $rootScope.KABOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KWAKA" ) {

$rootScope.PUNITselect.Items = $rootScope.KWAKAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "LAMBATA" ) {

$rootScope.PUNITselect.Items = $rootScope.LAMBATAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "LEFU" ) {

$rootScope.PUNITselect.Items = $rootScope.LEFUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SHAKO" ) {

$rootScope.PUNITselect.Items = $rootScope.SHAKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TUFA" ) {

$rootScope.PUNITselect.Items = $rootScope.TUFAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BAKEKO" ) {

$rootScope.PUNITselect.Items = $rootScope.BAKEKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BADEGGI" ) {

$rootScope.PUNITselect.Items = $rootScope.BADEGGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BISANTI" ) {

$rootScope.PUNITselect.Items = $rootScope.BISANTIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DZWAFU" ) {

$rootScope.PUNITselect.Items = $rootScope.DZWAFUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EDOTSU" ) {

$rootScope.PUNITselect.Items = $rootScope.EDOTSUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ESSA" ) {

$rootScope.PUNITselect.Items = $rootScope.ESSAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GBAKOGI" ) {

$rootScope.PUNITselect.Items = $rootScope.GBAKOGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KATCHA" ) {

$rootScope.PUNITselect.Items = $rootScope.KATCHAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KATAREGI" ) {

$rootScope.PUNITselect.Items = $rootScope.KATAREGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SIDI SABA" ) {

$rootScope.PUNITselect.Items = $rootScope.SIDI_SABAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "AREWA" ) {

$rootScope.PUNITselect.Items = $rootScope.AREWAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "CENTRAL" ) {

$rootScope.PUNITselect.Items = $rootScope.CENTRALArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GABAS" ) {

$rootScope.PUNITselect.Items = $rootScope.GABASArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUDU" ) {

$rootScope.PUNITselect.Items = $rootScope.KUDUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAGAJIYA" ) {

$rootScope.PUNITselect.Items = $rootScope.MAGAJIYAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MASUGA" ) {

$rootScope.PUNITselect.Items = $rootScope.MASUGAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MADARA" ) {

$rootScope.PUNITselect.Items = $rootScope.MADARAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NAGWAMATSE" ) {

$rootScope.PUNITselect.Items = $rootScope.NAGWAMATSEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "RAFIN GORA" ) {

$rootScope.PUNITselect.Items = $rootScope.RAFIN_GORAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TUNGANWAWA" ) {

$rootScope.PUNITselect.Items = $rootScope.TUNGANWAWAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TUNGAN KAWO" ) {

$rootScope.PUNITselect.Items = $rootScope.TUNGAN_KAWOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "USALLE" ) {

$rootScope.PUNITselect.Items = $rootScope.USALLEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "YAMMA" ) {

$rootScope.PUNITselect.Items = $rootScope.YAMMAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "AREWA/YAMMA" ) {

$rootScope.PUNITselect.Items = $rootScope.AREWA_YAMMAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BIRNIN MAZA/TASHIBO" ) {

$rootScope.PUNITselect.Items = $rootScope.BIRNIN_MAZA_TASHIBOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EBBO/GBACINKU" ) {

$rootScope.PUNITselect.Items = $rootScope.EBBO_GBACINKUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EVUTI/KPADA" ) {

$rootScope.PUNITselect.Items = $rootScope.EVUTI_KPADAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GULU/ANGUWA VATSA" ) {

$rootScope.PUNITselect.Items = $rootScope.GULU_ANGUWA_VATSAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GUPA/ABUGI" ) {

$rootScope.PUNITselect.Items = $rootScope.GUPA_ABUGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GURDI/ZAGO" ) {

$rootScope.PUNITselect.Items = $rootScope.GURDI_ZAGOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUDU/GABAS" ) {

$rootScope.PUNITselect.Items = $rootScope.KUDU_GABASArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MUYE/EGBA" ) {

$rootScope.PUNITselect.Items = $rootScope.MUYE_EGBAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TAKUTI/SHAKU" ) {

$rootScope.PUNITselect.Items = $rootScope.TAKUTI_SHAKUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BUSU/KUCHI" ) {

$rootScope.PUNITselect.Items = $rootScope.BUSU_KUCHIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BATATI" ) {

$rootScope.PUNITselect.Items = $rootScope.BATATIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DASSUN" ) {

$rootScope.PUNITselect.Items = $rootScope.DASSUNArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DOKO" ) {

$rootScope.PUNITselect.Items = $rootScope.DOKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DABBAN" ) {

$rootScope.PUNITselect.Items = $rootScope.DABBANArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EGBAKO" ) {

$rootScope.PUNITselect.Items = $rootScope.EGBAKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GABA" ) {

$rootScope.PUNITselect.Items = $rootScope.GABAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "JIMA" ) {

$rootScope.PUNITselect.Items = $rootScope.JIMAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUTIGI" ) {

$rootScope.PUNITselect.Items = $rootScope.KUTIGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUSOTACHI" ) {

$rootScope.PUNITselect.Items = $rootScope.KUSOTACHIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "LAGUN" ) {

$rootScope.PUNITselect.Items = $rootScope.LAGUNArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAMBE" ) {

$rootScope.PUNITselect.Items = $rootScope.MAMBEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "AUNA CENTRAL" ) {

$rootScope.PUNITselect.Items = $rootScope.AUNA_CENTRALArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "AUNA EAST CENTRAL" ) {

$rootScope.PUNITselect.Items = $rootScope.AUNA_EAST_CENTRALArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "AUNA EAST" ) {

$rootScope.PUNITselect.Items = $rootScope.AUNA_EASTArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "AUNA SOUTH EAST" ) {

$rootScope.PUNITselect.Items = $rootScope.AUNA_SOUTH_EASTArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "AUNA SOUTH" ) {

$rootScope.PUNITselect.Items = $rootScope.AUNA_SOUTHArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IBELU CENTRAL" ) {

$rootScope.PUNITselect.Items = $rootScope.IBELU_CENTRALArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IBELU EAST" ) {

$rootScope.PUNITselect.Items = $rootScope.IBELU_EASTArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IBELU NORTH" ) {

$rootScope.PUNITselect.Items = $rootScope.IBELU_NORTHArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IBELU WEST" ) {

$rootScope.PUNITselect.Items = $rootScope.IBELU_WESTArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NASKO" ) {

$rootScope.PUNITselect.Items = $rootScope.NASKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NASSARAWA" ) {

$rootScope.PUNITselect.Items = $rootScope.NASSARAWAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BANGI" ) {

$rootScope.PUNITselect.Items = $rootScope.BANGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BERI" ) {

$rootScope.PUNITselect.Items = $rootScope.BERIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BOBI" ) {

$rootScope.PUNITselect.Items = $rootScope.BOBIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GULBIN ‐ BOKA" ) {

$rootScope.PUNITselect.Items = $rootScope.GULBIN_BOKAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GALMA/WAMBA" ) {

$rootScope.PUNITselect.Items = $rootScope.GALMA_WAMBAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "INKWAI" ) {

$rootScope.PUNITselect.Items = $rootScope.INKWAIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IGWAMA" ) {

$rootScope.PUNITselect.Items = $rootScope.IGWAMAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KAKIHUM" ) {

$rootScope.PUNITselect.Items = $rootScope.KAKIHUMArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KONTOKORO" ) {

$rootScope.PUNITselect.Items = $rootScope.KONTOKOROArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUMBASHI" ) {

$rootScope.PUNITselect.Items = $rootScope.KUMBASHIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MABURYA" ) {

$rootScope.PUNITselect.Items = $rootScope.MABURYAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BABBAN  RAMI" ) {

$rootScope.PUNITselect.Items = $rootScope.BABBAN_RAMIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DAPANGI/MAKERA" ) {

$rootScope.PUNITselect.Items = $rootScope.DAPANGI_MAKERAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IBBI" ) {

$rootScope.PUNITselect.Items = $rootScope.IBBIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KABOJI" ) {

$rootScope.PUNITselect.Items = $rootScope.KABOJIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KASANGA" ) {

$rootScope.PUNITselect.Items = $rootScope.KASANGAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KWATACHI" ) {

$rootScope.PUNITselect.Items = $rootScope.KWATACHIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KULHO" ) {

$rootScope.PUNITselect.Items = $rootScope.KULHOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MASHEGU" ) {

$rootScope.PUNITselect.Items = $rootScope.MASHEGUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAZAKUKA/LIKORO" ) {

$rootScope.PUNITselect.Items = $rootScope.MAZAKUKA_LIKOROArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SAHO‐RAMI" ) {

$rootScope.PUNITselect.Items = $rootScope.SAHO_RAMIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BOKANI" ) {

$rootScope.PUNITselect.Items = $rootScope.BOKANIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GBAJIBO/MUWO" ) {

$rootScope.PUNITselect.Items = $rootScope.GBAJIBO_MUWOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GBARA" ) {

$rootScope.PUNITselect.Items = $rootScope.GBARAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "JA'AGI" ) {

$rootScope.PUNITselect.Items = $rootScope.JA_AGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "JEBBA NORTH" ) {

$rootScope.PUNITselect.Items = $rootScope.JEBBA_NORTHArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KPAKI/TAKUMA" ) {

$rootScope.PUNITselect.Items = $rootScope.KPAKI_TAKUMAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUDU" ) {

$rootScope.PUNITselect.Items = $rootScope.KUDUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "LABOZHI" ) {

$rootScope.PUNITselect.Items = $rootScope.LABOZHIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MOKWA" ) {

$rootScope.PUNITselect.Items = $rootScope.MOKWAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MUREGI" ) {

$rootScope.PUNITselect.Items = $rootScope.MUREGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MUREGI" ) {

$rootScope.PUNITselect.Items = $rootScope.MUREGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "RABBA/NDAYAKO" ) {

$rootScope.PUNITselect.Items = $rootScope.RABBA_NDAYAKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BENI" ) {

$rootScope.PUNITselect.Items = $rootScope.BENIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DANDAUDU" ) {

$rootScope.PUNITselect.Items = $rootScope.DANDAUDUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DANGUNU" ) {

$rootScope.PUNITselect.Items = $rootScope.DANGUNUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DAZA" ) {

$rootScope.PUNITselect.Items = $rootScope.DAZAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "FUKA" ) {

$rootScope.PUNITselect.Items = $rootScope.FUKAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GINI" ) {

$rootScope.PUNITselect.Items = $rootScope.GINIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GUNI" ) {

$rootScope.PUNITselect.Items = $rootScope.GUNIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KABULA" ) {

$rootScope.PUNITselect.Items = $rootScope.KABULAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KAZAI" ) {

$rootScope.PUNITselect.Items = $rootScope.KAZAIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUCHI" ) {

$rootScope.PUNITselect.Items = $rootScope.KUCHIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SARKIN PAWA" ) {

$rootScope.PUNITselect.Items = $rootScope.SARKIN_PAWAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ADUNU" ) {

$rootScope.PUNITselect.Items = $rootScope.ADUNUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "CHIMBI" ) {

$rootScope.PUNITselect.Items = $rootScope.CHIMBIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GWAM" ) {

$rootScope.PUNITselect.Items = $rootScope.GWAMArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ISHAU" ) {

$rootScope.PUNITselect.Items = $rootScope.ISHAUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "JERE" ) {

$rootScope.PUNITselect.Items = $rootScope.JEREArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KAFIN KORO" ) {

$rootScope.PUNITselect.Items = $rootScope.KAFIN_KOROArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KWAGANA" ) {

$rootScope.PUNITselect.Items = $rootScope.KWAGANAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KWAKUTI" ) {

$rootScope.PUNITselect.Items = $rootScope.KWAKUTIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NIKUCHI T/MALLAM" ) {

$rootScope.PUNITselect.Items = $rootScope.NIKUCHI_T_MALLAMArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "PAIKO CENTRAL" ) {

$rootScope.PUNITselect.Items = $rootScope.PAIKO_CENTRALArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TUTUNGO JEDNA" ) {

$rootScope.PUNITselect.Items = $rootScope.TUTUNGO_JEDNAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KAGARA GARI" ) {

$rootScope.PUNITselect.Items = $rootScope.KAGARA_GARIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KAKURI" ) {

$rootScope.PUNITselect.Items = $rootScope.KAKURIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KONGOMA CENTRAL" ) {

$rootScope.PUNITselect.Items = $rootScope.KONGOMA_CENTRALArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KONGOMA WEST" ) {

$rootScope.PUNITselect.Items = $rootScope.KONGOMA_WESTArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUSHERKI NORTH" ) {

$rootScope.PUNITselect.Items = $rootScope.KUSHERKI_NORTHArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUSHERKI SOUTH" ) {

$rootScope.PUNITselect.Items = $rootScope.KUSHERKI_SOUTHArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUNDU" ) {

$rootScope.PUNITselect.Items = $rootScope.KUNDUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SABON GARI" ) {

$rootScope.PUNITselect.Items = $rootScope.SABON_GARIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TEGINA GARI" ) {

$rootScope.PUNITselect.Items = $rootScope.TEGINA_GARIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TEGINA WEST" ) {

$rootScope.PUNITselect.Items = $rootScope.TEGINA_WESTArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "YAKILA" ) {

$rootScope.PUNITselect.Items = $rootScope.YAKILAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DANRANGI" ) {

$rootScope.PUNITselect.Items = $rootScope.DANRANGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DUGGE" ) {

$rootScope.PUNITselect.Items = $rootScope.DUGGEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DUKKU" ) {

$rootScope.PUNITselect.Items = $rootScope.DUKKUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GENU" ) {

$rootScope.PUNITselect.Items = $rootScope.GENUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "JAMA'ARE" ) {

$rootScope.PUNITselect.Items = $rootScope.JAMA_AREArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "RIJAU" ) {

$rootScope.PUNITselect.Items = $rootScope.RIJAUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SHAMBO" ) {

$rootScope.PUNITselect.Items = $rootScope.SHAMBOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "T/BUNU" ) {

$rootScope.PUNITselect.Items = $rootScope.T_BUNUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "T/MAGAJIYA" ) {

$rootScope.PUNITselect.Items = $rootScope.T_MAGAJIYAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "USHE" ) {

$rootScope.PUNITselect.Items = $rootScope.USHEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "WARARI" ) {

$rootScope.PUNITselect.Items = $rootScope.WARARIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ALLAWA" ) {

$rootScope.PUNITselect.Items = $rootScope.WARARIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BANGAJIYA" ) {

$rootScope.PUNITselect.Items = $rootScope.BANGAJIYAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BASSA/KUKOKI" ) {

$rootScope.PUNITselect.Items = $rootScope.BASSA_KUKOKIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "EGWA/GWADA" ) {

$rootScope.PUNITselect.Items = $rootScope.EGWA_GWADAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ERANA" ) {

$rootScope.PUNITselect.Items = $rootScope.ERANAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GALKOGO" ) {

$rootScope.PUNITselect.Items = $rootScope.GALKOGOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GURMANA" ) {

$rootScope.PUNITselect.Items = $rootScope.GURMANAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GUSSORO" ) {

$rootScope.PUNITselect.Items = $rootScope.GUSSOROArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KATO" ) {

$rootScope.PUNITselect.Items = $rootScope.KATOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KUSHAKA/KUREBE" ) {

$rootScope.PUNITselect.Items = $rootScope.KUSHAKA_KUREBEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KWAKI/CHUKWUBA" ) {

$rootScope.PUNITselect.Items = $rootScope.KWAKI_CHUKWUBAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MANTA" ) {

$rootScope.PUNITselect.Items = $rootScope.MANTAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "PINA" ) {

$rootScope.PUNITselect.Items = $rootScope.PINAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SHE" ) {

$rootScope.PUNITselect.Items = $rootScope.SHEArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "UBANDOMA" ) {

$rootScope.PUNITselect.Items = $rootScope.UBANDOMAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BAGMAMA 'A'" ) {

$rootScope.PUNITselect.Items = $rootScope.BAGMAMA_A_Array.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BAGAMA 'B'" ) {

$rootScope.PUNITselect.Items = $rootScope.BAGAMA_B_Array.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "HASHIMI 'A'" ) {

$rootScope.PUNITselect.Items = $rootScope.HASHIMI_A_Array.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "HASHIMI 'B'" ) {

$rootScope.PUNITselect.Items = $rootScope.HASHIMI_B_Array.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IKU SOUTH I" ) {

$rootScope.PUNITselect.Items = $rootScope.IKU_SOUTH_IArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IKU SOUTH II" ) {

$rootScope.PUNITselect.Items = $rootScope.IKU_SOUTH_IIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KURMIN SARKI" ) {

$rootScope.PUNITselect.Items = $rootScope.KURMIN_SARKIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAGAJIYA" ) {

$rootScope.PUNITselect.Items = $rootScope.MAGAJIYAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAJE NORTH" ) {

$rootScope.PUNITselect.Items = $rootScope.MAJE_NORTHArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "WAMBAI" ) {

$rootScope.PUNITselect.Items = $rootScope.WAMBAIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "DOGON KURMI" ) {

$rootScope.PUNITselect.Items = $rootScope.DOGON_KURMIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GARAM" ) {

$rootScope.PUNITselect.Items = $rootScope.GARAMArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IJA GWARI" ) {

$rootScope.PUNITselect.Items = $rootScope.IJA_GWARIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IJA KORO" ) {

$rootScope.PUNITselect.Items = $rootScope.IJA_KOROArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "IKU" ) {

$rootScope.PUNITselect.Items = $rootScope.IKUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "NEW BWARI" ) {

$rootScope.PUNITselect.Items = $rootScope.NEW_BWARIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "WUSE WEST" ) {

$rootScope.PUNITselect.Items = $rootScope.WUSE_WESTArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "WUSE  EAST" ) {

$rootScope.PUNITselect.Items = $rootScope.WUSE_EASTArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ZUMA EAST" ) {

$rootScope.PUNITselect.Items = $rootScope.ZUMA_EASTArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ZUMA WEST" ) {

$rootScope.PUNITselect.Items = $rootScope.ZUMA_WESTArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "AKARE" ) {

$rootScope.PUNITselect.Items = $rootScope.AKAREArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "BARWA" ) {

$rootScope.PUNITselect.Items = $rootScope.BARWAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "GWARJIKO" ) {

$rootScope.PUNITselect.Items = $rootScope.GWARJIKOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KANWURI" ) {

$rootScope.PUNITselect.Items = $rootScope.KANWURIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KODO" ) {

$rootScope.PUNITselect.Items = $rootScope.KODOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "KWATA" ) {

$rootScope.PUNITselect.Items = $rootScope.KWATAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "LOKOGOMA" ) {

$rootScope.PUNITselect.Items = $rootScope.LOKOGOMAArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "MAITO" ) {

$rootScope.PUNITselect.Items = $rootScope.MAITOArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "SABON GARI" ) {

$rootScope.PUNITselect.Items = $rootScope.SABON_GARIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "TUKUNJI/YAMIGI" ) {

$rootScope.PUNITselect.Items = $rootScope.TUKUNJI_YAMIGIArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ZUNGERU" ) {

$rootScope.PUNITselect.Items = $rootScope.ZUNGERUArray.concat($rootScope.PUNITselect.Items);

} else if ($rootScope.SelectedWARD ==  "ZUNGERU" ) {

$rootScope.PUNITselect.Items = $rootScope.ZUNGERUArray.concat($rootScope.PUNITselect.Items);

}

$rootScope.SelectedWARD = $rootScope.WARDselect.Items[$rootScope.WARDselect.ItemIndex];

$rootScope.PUNITselect.ItemIndex = 0;

$rootScope.SelectedPUNIT = $rootScope.PUNITselect.Items[$rootScope.PUNITselect.ItemIndex];

};

$scope.PUNITselectChange = function($event) {
$rootScope.PUNITselect.Event = $event;

$rootScope.SelectedPUNIT = $rootScope.PUNITselect.Items[$rootScope.PUNITselect.ItemIndex];

};

$scope.ELECTIONselectChange = function($event) {
$rootScope.ELECTIONselect.Event = $event;

$rootScope.SelectedELECTION = $rootScope.ELECTIONselect.Items[$rootScope.ELECTIONselect.ItemIndex];

};

$scope.PARTYselectChange = function($event) {
$rootScope.PARTYselect.Event = $event;

$rootScope.SelectedPARTY = $rootScope.PARTYselect.Items[$rootScope.PARTYselect.ItemIndex];

};

$scope.RESPONSselectChange = function($event) {
$rootScope.RESPONSselect.Event = $event;

$rootScope.SelectedRESPONS = $rootScope.RESPONSselect.Items[$rootScope.RESPONSselect.ItemIndex];

};

$scope.REASONselectChange = function($event) {
$rootScope.REASONselect.Event = $event;

$rootScope.SelectedREASON = $rootScope.REASONselect.Items[$rootScope.REASONselect.ItemIndex];

};

$scope.YearSelectChange = function($event) {
$rootScope.YearSelect.Event = $event;

$scope.UpdateDaySelect();

};

$scope.MonthSelectChange = function($event) {
$rootScope.MonthSelect.Event = $event;

$scope.UpdateDaySelect();

};

$scope.VOTERgenderChange = function($event) {
$rootScope.VOTERgender.Event = $event;

$rootScope.SelectedVOTERgender = $rootScope.VOTERgender.Items[$rootScope.VOTERgender.ItemIndex];

};

$scope.VOTERreligionChange = function($event) {
$rootScope.VOTERreligion.Event = $event;

$rootScope.SelectedVOTERreligion = $rootScope.VOTERreligion.Items[$rootScope.VOTERreligion.ItemIndex];

};

$scope.Button1Click = function($event) {
$rootScope.Button1.Event = $event;

$rootScope.NewClient.Request.data = {};

$rootScope.NewClient.Request.data["lga"] = $rootScope.SelectedLGA;

$rootScope.NewClient.Request.data["ward"] = $rootScope.SelectedWARD;

$rootScope.NewClient.Request.data["punit"] = $rootScope.SelectedPUNIT;

$rootScope.NewClient.Request.data["election"] = $rootScope.SelectedELECTION;

$rootScope.NewClient.Request.data["party"] = $rootScope.SelectedPARTY;

$rootScope.NewClient.Request.data["respons"] = $rootScope.SelectedRESPONS;

$rootScope.NewClient.Request.data["reason"] = $rootScope.SelectedREASON;

$rootScope.NewClient.Request.data["vname"] = $rootScope.VOTERname.Value;

$rootScope.NewClient.Request.data["vphone"] = $rootScope.VOTERphone.Value;

$rootScope.NewClient.Request.data["vvin"] = $rootScope.VOTERvin.Value;

$rootScope.NewClient.Request.data["vgender"] = $rootScope.SelectedVOTERgender;

$rootScope.NewClient.Request.data["vreligion"] = $rootScope.SelectedVOTERreligion;

$rootScope.NewClient.Request.data["aname"] = $rootScope.AGENTname.Value;

$rootScope.NewClient.Request.data["aphone"] = $rootScope.AGENTphone.Value;

if ($rootScope.SelectedPARTY ==  "APC" ) {

$rootScope.pscore = 1;

} else if ($rootScope.SelectedPARTY ==  "PDP" ) {

$rootScope.pscore = 1;

} else if ($rootScope.SelectedPARTY ==  "SDP" ) {

$rootScope.pscore = 1;

} else if ($rootScope.SelectedPARTY ==  "APGA" ) {

$rootScope.pscore = 1;

} else if ($rootScope.SelectedPARTY ==  "OTHERS" ) {

$rootScope.pscore = 0;

} else if ($rootScope.SelectedPARTY ==  "UNDECIDED" ) {

$rootScope.pscore = 0;

} else if ($rootScope.SelectedPARTY ==  "UNDISCLOSED" ) {

$rootScope.pscore = 0;

}

$rootScope.NewClient.Request.data["pscores"] = $rootScope.pscore;

$rootScope.Year = $rootScope.YearSelect.Items[$rootScope.YearSelect.ItemIndex];

$rootScope.Month = $rootScope.MonthSelect.Items[$rootScope.MonthSelect.ItemIndex];

$rootScope.Day = $rootScope.DaySelect.Items[$rootScope.DaySelect.ItemIndex];

$rootScope.SelectedVOTERage = ""+$rootScope.Day+"/"+$rootScope.Month+"/"+$rootScope.Year+"";

$rootScope.NewClient.Request.data["vage"] = $rootScope.SelectedVOTERage;

$scope.showModalView("PreviewEntry");

};

}]);
window.App.Ctrls.controller("PreviewEntryCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.PreviewEntry = {};
$rootScope.PreviewEntry.ABView = true;
$rootScope.PreviewEntry.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.PreviewEntry = {};
window.App.PreviewEntry.Scope = $scope;

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

$scope.Button2Click = function($event) {
$rootScope.Button2.Event = $event;


$rootScope.NewClient.Execute();

$rootScope.Progressbar4.Hidden = "";

$scope.closeModalView();

};

$scope.Button7Click = function($event) {
$rootScope.Button7.Event = $event;

$scope.closeModalView();

};

}]);
window.App.Ctrls.controller("ViewsCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Views = {};
$rootScope.Views.ABView = true;
$rootScope.Views.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Views = {};
window.App.Views.Scope = $scope;

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

$scope.Button52Click = function($event) {
$rootScope.Button52.Event = $event;

$scope.replaceView("welcome");

};

$scope.Label4Click = function($event) {
$rootScope.Label4.Event = $event;

$rootScope.Label20.Text = "Voters Poll";

$scope.replaceView("welcome");

};

$scope.HtmlConretent4Click = function($event) {
$rootScope.HtmlConretent4.Event = $event;

$rootScope.Label20.Text = "Send Polls";

$scope.replaceView("welcome");

};

$scope.HtmlContent5Click = function($event) {
$rootScope.HtmlContent5.Event = $event;

$rootScope.Label20.Text = "Voters Poll";

$scope.replaceView("welcome");

};

$scope.HtmlContent6Click = function($event) {
$rootScope.HtmlContent6.Event = $event;

$rootScope.Label20.Text = "Polls Report";

$rootScope.UrsLocation = "2";

$rootScope.HttpClient3.Request.data = {};

$rootScope.HttpClient3.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient3.Execute();

$scope.vibrate(8)

};

}]);
window.App.Ctrls.controller("PrendingPollCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.PrendingPoll = {};
$rootScope.PrendingPoll.ABView = true;
$rootScope.PrendingPoll.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.PrendingPoll = {};
window.App.PrendingPoll.Scope = $scope;

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.PrendingPoll.Event = event;

$rootScope.H = parseFloat($rootScope.App.InnerHeight+-100);

window.document.getElementById($rootScope.App.DialogView !== "" ? $rootScope.App.DialogView : $rootScope.App.CurrentView).style.width = "";
window.document.getElementById($rootScope.App.DialogView !== "" ? $rootScope.App.DialogView : $rootScope.App.CurrentView).style.height = ""+$rootScope.H+"px";

$rootScope.$apply();
});

$scope.Button45Click = function($event) {
$rootScope.Button45.Event = $event;

$scope.closeModalView();

};

$scope.Button4Click = function($event) {
$rootScope.Button4.Event = $event;

$rootScope.Label20.Text = "Send Poll";

$rootScope.LGAselect.ItemIndex = $scope.getLocalOption("lga");

$rootScope.WARDselect.ItemIndex = $scope.getLocalOption("ward");

$rootScope.PUNITselect.ItemIndex = $scope.getLocalOption("punit");

$rootScope.ELECTIONselect.ItemIndex = $scope.getLocalOption("election");

$rootScope.PARTYselect.ItemIndex = $scope.getLocalOption("party");

$rootScope.RESPONSselect.ItemIndex = $scope.getLocalOption("respons");

$rootScope.REASONselect.ItemIndex = $scope.getLocalOption("reason");

$rootScope.VOTERname.Value = $scope.getLocalOption("vname");

$rootScope.VOTERphone.Value = $scope.getLocalOption("vphone");

$rootScope.VOTERage.ItemIndex = $scope.getLocalOption("vage");

$rootScope.VOTERvin.Value = $scope.getLocalOption("vvin");

$rootScope.VOTERgender.ItemIndex = $scope.getLocalOption("vgender");

$rootScope.VOTERreligion.ItemIndex = $scope.getLocalOption("vreligion");

$rootScope.AGENTname.Value = $scope.getLocalOption("aname");

$rootScope.AGENTphone.Value = $scope.getLocalOption("aphone");

$rootScope.YearSelect.ItemIndex = $scope.getLocalOption("vage1");

$rootScope.MonthSelect.ItemIndex = $scope.getLocalOption("vage2");

$rootScope.DaySelect.ItemIndex = $scope.getLocalOption("vage3");

$rootScope.LGAselect.ItemIndex = parseFloat($rootScope.LGAselect.ItemIndex);

$rootScope.WARDselect.ItemIndex = parseFloat($rootScope.WARDselect.ItemIndex);

$rootScope.PUNITselect.ItemIndex = parseFloat($rootScope.PUNITselect.ItemIndex);

$rootScope.ELECTIONselect.ItemIndex = parseFloat($rootScope.ELECTIONselect.ItemIndex);

$rootScope.PARTYselect.ItemIndex = parseFloat($rootScope.PARTYselect.ItemIndex);

$rootScope.RESPONSselect.ItemIndex = parseFloat($rootScope.RESPONSselect.ItemIndex);

$rootScope.REASONselect.ItemIndex = parseFloat($rootScope.REASONselect.ItemIndex);

$rootScope.VOTERname.Value = $rootScope.VOTERname.Value;

$rootScope.VOTERphone.Value = $rootScope.VOTERphone.Value;

$rootScope.VOTERvin.Value = $rootScope.VOTERvin.Value;

$rootScope.YearSelect.ItemIndex = parseFloat($rootScope.YearSelect.ItemIndex);

$rootScope.MonthSelect.ItemIndex = parseFloat($rootScope.MonthSelect.ItemIndex);

$rootScope.DaySelect.ItemIndex = parseFloat($rootScope.DaySelect.ItemIndex);

$rootScope.VOTERgender.ItemIndex = parseFloat($rootScope.VOTERgender.ItemIndex);

$rootScope.VOTERreligion.ItemIndex = parseFloat($rootScope.VOTERreligion.ItemIndex);

$rootScope.AGENTname.Value = $rootScope.AGENTname.Value;

$rootScope.AGENTphone.Value = $rootScope.AGENTphone.Value;

$scope.replaceView("SendPoll");

$scope.vibrate(8)

};

$scope.Image4Click = function($event) {
$rootScope.Image4.Event = $event;

$rootScope.Label20.Text = "Add Poll";

$rootScope.LGAselect.ItemIndex = $scope.getLocalOption("lga");

$rootScope.WARDselect.ItemIndex = $scope.getLocalOption("ward");

$rootScope.PUNITselect.ItemIndex = $scope.getLocalOption("punit");

$rootScope.ELECTIONselect.ItemIndex = $scope.getLocalOption("election");

$rootScope.PARTYselect.ItemIndex = $scope.getLocalOption("party");

$rootScope.RESPONSselect.ItemIndex = $scope.getLocalOption("respons");

$rootScope.REASONselect.ItemIndex = $scope.getLocalOption("reason");

$rootScope.VOTERname.Value = $scope.getLocalOption("vname");

$rootScope.VOTERphone.Value = $scope.getLocalOption("vphone");

$rootScope.VOTERage.ItemIndex = $scope.getLocalOption("vage");

$rootScope.VOTERgender.ItemIndex = $scope.getLocalOption("vgender");

$rootScope.VOTERreligion.ItemIndex = $scope.getLocalOption("vreligion");

$rootScope.AGENTname.Value = $scope.getLocalOption("aname");

$rootScope.AGENTphone.Value = $scope.getLocalOption("aphone");

$rootScope.LGAselect.ItemIndex = parseFloat($rootScope.LGAselect.ItemIndex);

$rootScope.WARDselect.ItemIndex = parseFloat($rootScope.WARDselect.ItemIndex);

$rootScope.PUNITselect.ItemIndex = parseFloat($rootScope.PUNITselect.ItemIndex);

$rootScope.ELECTIONselect.ItemIndex = parseFloat($rootScope.ELECTIONselect.ItemIndex);

$rootScope.PARTYselect.ItemIndex = parseFloat($rootScope.PARTYselect.ItemIndex);

$rootScope.RESPONSselect.ItemIndex = parseFloat($rootScope.RESPONSselect.ItemIndex);

$rootScope.REASONselect.ItemIndex = parseFloat($rootScope.REASONselect.ItemIndex);

$rootScope.VOTERname.Value = $rootScope.VOTERname.Value;

$rootScope.VOTERphone.Value = $rootScope.VOTERphone.Value;

$rootScope.VOTERage.ItemIndex = parseFloat($rootScope.VOTERage.ItemIndex);

$rootScope.VOTERgender.ItemIndex = parseFloat($rootScope.VOTERgender.ItemIndex);

$rootScope.VOTERreligion.ItemIndex = parseFloat($rootScope.VOTERreligion.ItemIndex);

$rootScope.AGENTname.Value = $rootScope.AGENTname.Value;

$rootScope.AGENTphone.Value = $rootScope.AGENTphone.Value;

$scope.replaceView("SendPoll");

$scope.vibrate(8)

};

}]);
window.App.Ctrls.controller("registerCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.register = {};
$rootScope.register.ABView = true;
$rootScope.register.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.register = {};
window.App.register.Scope = $scope;

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.register.Event = event;

angular.element(document.getElementById("Container10")).css("height", ""+$rootScope.App.InnerHeight+"px");

$rootScope.serial.Value = $rootScope.DeviceCode;

$rootScope.donatek.Value = $rootScope.DonateKey;

$rootScope.state.Value = $rootScope.state.Items[$rootScope.state.ItemIndex];

$rootScope.city.Value = $rootScope.city.Items[$rootScope.city.ItemIndex];

$rootScope.plan.Value = $rootScope.plan.Items[$rootScope.plan.ItemIndex];

$rootScope.MsgSend.Disabled = "";

$scope.loadVariables("AbujaArray=|Gwagwalada|Kuje|Abaji|Abuja|Bwari|Kwali");

$scope.loadVariables("AbiaArray=|Aba North|Aba South|Arochukwu|Bende|Ikwuano|Isiala-Ngwa North|Isiala-Ngwa South|Isuikwato|Obi Nwa|Ohafia|Osisioma|Ngwa|Ukwa East|Ukwa West|Umuahia North|Umuahia South|Umu-Neochi");

$scope.loadVariables("AdamawaArray=|Demsa|Fufore|Ganaye|Gireri|Gombi|Guyuk|Hong|Jada|Lamurde|Madagali|Maiha|Mayo-Belwa|Michika|Mubi North|Mubi South|Numan|Shelleng|Song|Toungo|Yola North|Yola South");

$scope.loadVariables("AkwaIbormArray=|Abak|Eastern Obolo|Eket|Esit Eket|Essien Udim|Etim Ekpo|Etinan|Ibeno|Ibesikpo Asutan|Ibiono Ibom|Ikono");

$scope.loadVariables("AkwaIbormArray=|Abak|Eastern Obolo|Eket|Esit Eket|Essien Udim|Etim Ekpo|Etinan|Ibeno|Ibesikpo Asutan|Ibiono Ibom|Ikono|Ikot Abasi|Ikot Ekpene|Ini|Itu|Mbo|Mkpat Enin|Nsit Atai|Nsit Ibom|Nsit Ubium|Obot Akara|Okobo|Onna|Oron|Oruk Anam|Udung Uko|Ukanafun|Uruan|Urue-Offong/Oruko|Uyo");

$scope.loadVariables("AnambraArray=|Aguata|Anambra East|Anambra West|Anaocha|Awka North|Awka South|Ayamelum|Dunukofia|Ekwusigo|Idemili North|Idemili south|Ihiala|Njikoka|Nnewi North|Nnewi South|Ogbaru|Onitsha North|Onitsha South|Orumba North|Orumba South");

$scope.loadVariables("BauchiArray=|Alkaleri|Bauchi|Bogoro|Damban|Darazo|Dass|Ganjuwa|Giade|Itas/Gadau|Jamaare|Katagum|Kirfi|Misau|Ningi|Shira|Tafawa-Balewa|Toro|Warji|Zaki");

$scope.loadVariables("BayelsaArray=|Brass|Ekeremor|Kolokuma/Opokuma|Nembe|Ogbia|Sagbama|Southern Ijaw|Yenegoa");

$scope.loadVariables("BenueArray=|Ado|Agatu|Apa|Buruku|Gboko|Guma|Gwer East|Gwer West|Katsina-Ala|Konshisha|Kwande|Logo|Makurdi|Obi|Ogbadibo|Oju|Okpokwu|Ohimini|Otukpo|Tarka|Ukum|Ushongo|Vandeikya");

$scope.loadVariables("BornoArray=|Abadam|Askira/Uba|Bama|Bayo|Biu|Chibok|Damboa|Dikwa|Gubio|Guzamala|Gwoza|Hawul|Jere|Kaga|Kala/Balge|Konduga|Kukawa|Mafa|Magumeri|Maiduguri|Marte|Mobbar|Monguno|Ngala|Nganzai|Shani");

$scope.loadVariables("CrossRiverArray=|Akpabuyo|Odukpani|Akamkpa|Biase|Abi|Ikom|Yarkur|Odubra|Boki|Ogoja|Yala|Obanliku|Obudu|Calabar South|EtungBekwara|Bakassi|Calabar Municipality");

$scope.loadVariables("DeltaArray=|Oshimili|Aniocha|Aniocha South|Ika South|Ika North-East|Ndokwa West|Ndokwa East|Isoko south|Isoko North|Bomadi|Burutu|Ughelli South|Ughelli North|Ethiope West|Ethiope East|Sapele|Okpe|Warri North|Warri South|Uvwie|Udu|Ukwani|Oshimili North");

$scope.loadVariables("EbonyiArray=|Afikpo South|Afikpo North|Onicha|Ohaozara|Abakaliki|Ishielu|lkwo|Ezza South|Ohaukwu|Ebonyi|Ivo");

$scope.loadVariables("EdoArray=|Esan NorthEast|Esan Central|Esan West|Egor|Ukpoba|Central|Etsako Central|Igueben|Oredo|Ovia SouthWest|Ovia South-East|Orhionwon|Uhunmwonde|Etsako East|Esan South-East");

$scope.loadVariables("EkitiArray=|Ado|EkitiEast|EkitiWest|Emure/Ise/Orun|Ekiti SouthWest|Ikare|Irepodun|Ijero|Ido/Osi|Oye|Ikole|Moba|Gbonyin|Efon|Ise/Orun|IlejemTakali|Tofa|Tsanyawa||Ungogo|Warawaeje");

$scope.loadVariables("EnuguArray=|Enugu South|Igbo Eze South|Enugu North|Nkanu|Udi Agwu|Oji River|Oji River|IgboEze North|Isi Uzo|Nsukka|Igbo Ekiti|Uzo Uwani|Enugu EasAninri|Nkanu East|Udenu");

$scope.loadVariables("GombeArray=|Akko|Balanga|Billiri|Dukku|Kaltungo|Kwami|Shomgom|Funakaye|Gombe|Nafada/Bajoga|Yamaltu/Delta");

$scope.loadVariables("ImoArray=|Aboh Mbaise|Ahiazu-Mbaise|Ehime Mbano|Ezinihitte|Ideato North|Ideato South|Ihitte/Uboma|Ikeduru|Isiala Mbano|Isu|Mbaitoli|Ngor Okpala|Njaba|Nwangele|Nkwerre|Obowo|Oguta|Ohaji/Egbema|Okigwe|Orlu|Orsu|Oru East|Oru West|Owerri Municipal|Owerri North|Owerri West");

$scope.loadVariables("JigawaArray=|Auyo|Babura|Birni Kudu|Biriniwa|Buji|Dutse|Gagarawa|Garki|Gumel|Guri|Gwaram|Gwiwa|Hadejia|Jahun|Kafin Hausa|Kaugama Kazaure|Kiri Kasamma|Kiyawa|Maigatari|Malam Madori|Miga|Ringim|Sule-Tankarkar|Taura|Yankwashi");

$scope.loadVariables("KadunaArray=|Birni-Gwari|Chikun|Giwa|Igabi|Ikara|Jaba|Jemaa|Kachia|Kaduna North|Kaduna South|Kagarko|Kajuru|Kaura|Kauru|Kubau|Kudan|Lere|Makarfi|Sabon-Gari|Sanga|Soba|Zango-Kataf|Zaria");

$scope.loadVariables("KanoArray=|Ajingi|Albasu|Bagwai|Bebeji|Bichi|Bunkure|Dala|Dambatta|awakin Kudu|Dawakin Tofa|Doguwa|Fagge|Gabasawa|Garko|Garum|Mallam|Gaya|Gezawa|Gwale|Gwarzo|Kabo|Kano Municipal|Karaye|Kibiya|Kiru|kumbotso|Kunchi|Kura|Madobi|Makoda|Minjibir|Nasarawa|Rano|Rimin Gado|Shanono|Sumaila|Takali|Tofa|Tsanyawa|Tudun Wada|Ungogo|Warawa|Wudil");

$scope.loadVariables("KatsinaArray=|Bakori|Batagarawa|Batsari|Baure|Bindawa|Charanchi|Dandume|Danja|Dan Musa|Daura|Dutsi|Dutsin-Ma|Faskari|Funtua|Ingawa|Jibia|Kafur|Kankara|Kankia|Katsina|Kurfi|Kusada|Mai'Adua|Malumfashi|Bakori|Mani|Mashi|Matazuu|Musawa|Rimi|Sabuwa|Safana|Sandamu|Zango");

$scope.loadVariables("KebbiArray=|Aleiro|Arewa-Dandi|Argungu|Augie|Bagudo|Birnin Kebbi|Bunza|Dandi|Fakai|Gwandu|Jega|Kalgo|Koko/Besse|Maiyama|Ngaski|Sakaba|Shanga|Suru|Wasagu/Danko|Y Zuru");

$scope.loadVariables("KogiArray=|Adavi|Ajaokuta|Ankpa|Bassa|Dekina|Ibaji|Idah|Igalamela-Odolu|Ijumu|Kabba/Bunu|Kogi|Lokoja|Mopa-Muro|Ofu|Ogori/Mangongo'|Okehi|Okene|Olamaboro|Omala|Yagba East|Yagba West");

$scope.loadVariables("KwaraArray=|Asa|Baruten|Edu|Ekiti|Ifelodun|Ilorin East|Irepodun|Isin|Kaiama|Moro|Offa|Oke-Ero|Oyun|Pategi");

$scope.loadVariables("LagosArray=|Agege|Ajeromi-Ifelodun|Alimosho|Amuwo-Odofin|Apapa|Badagry|Epe|Eti-Osa|Ibeju/Lekki|Ifako-Ijaye|Ikeja|Ikorodu|Kosofe|Lagos Island|Lagos Mainland|Mushin|Ojo|Oshodi-Isolo|Shomolu|Surulere");

$scope.loadVariables("NasarawaArray=|Akwanga|Awe|Doma|Karu|Keana|Keffi|Kokona|Lafia|Nasarawa|Nasarawa-Eggon|Obi|Toto|Wamba");

$scope.loadVariables("NigerArray=|Agaie|Agwara|Bida|Borgu|Bosso|Chanchaga|Edati|Gbako|Gurara|Katcha|Kontagora|Lapai|Lavun|Magama|Mariga|Mashegu|Mokwa|Muya|Pailoro|Rafi|Rijau|Shiroro|Suleja|Tafa|Wushishi");

$scope.loadVariables("OgunArray=|Abeokuta North|Abeokuta South|Ado-Odo/Ota|Egbado North|Egbado South|Ewekoro|Ifo|Ijebu East|Ijebu North|Ijebu North East|Ijebu Ode|Ikenne|Imeko-Afon|Ipokia|Obafemi-Owode|Ogun Waterside|Odeda|Odogbolu|Remo North|Shagamu");

$scope.loadVariables("OndoArray=|Akoko North East|Akoko North West|Akoko South Akure East|Akoko South West|Akure North|Akure South|Ese-Odo|Idanre|Ifedore|Ilaje|Ile-Oluji|Okeigbo|Irele|Odigbo|Okitipupa|Ondo East|Ondo West|Owo|Ose");

$scope.loadVariables("OsunArray=|Aiyedade|Aiyedire|Atiba|Atakumosa East|Atakumosa West|Boluwaduro|Boripe|Ede North|Ede South|Egbedore|Ejigbo|Ife Central|Ife East|Ife North|Ife South|Ifedayo|Ifelodun|Ila|Ilesha East|Ilesha West|Irepodun|Irewole|Isokan|Iwo|Obokun|Odo-Otin|Ola-Oluwa|Olorunda|Oriade|Orolu|Osogbo");

$scope.loadVariables("OyoArray=|Afijio|Akinyele|Atiba|Atigbo|Egbeda|IbadanCentral|Ibadan North|Ibadan North West|Ibadan South East|Ibadan South West|Ibarapa Central|Ibarapa  North|Ibarapa East|Ido|Irepo|Iseyin|Itesiwaju|Iwajowa|Kajola|Lagelu Ogbomosho North|Ogbmosho South|Ogo Oluwa|Olorunsogo|Oluyole|Ona-Ara|Orelope|Ori Ire|Oyo East|Oyo West|Saki East|Saki West");

$scope.loadVariables("PlateauArray=|Barikin Ladi|Bassa|Bokkos|Jos East|Jos North|Jos South|Kanam|Kanke|Langtang North|Langtang South|Mangu|Mikang|Pankshin|Quaan Pan|Riyom|Shendam|Wase");

$scope.loadVariables("RiversArray=|Abua/Odual|Ahoada East|Ahoada West|Akuku Toru|Andoni|Asari-Toru|Bonny|Degema|Emohua|Eleme|Etche|Gokana|Ikwerre|Khana|Obia/Akpor");

$scope.loadVariables("SokotoArray=|Binji|Bodinga|Dange-shnsi|Gada|Goronyo|Gudu|Gawabawa|Illela|Isa|Kware|Kebbe|Rabah|Sabon birni|Shagari|Silame|Sokoto North|Sokoto South|Tambuwal|Tqngaza|Tureta|Wamako|Wurno|Yabo");

$scope.loadVariables("TarabaArray=|Ardo-kola|Bali|Donga|Gashaka|Cassol|Ibi|Jalingo|Karin-Lamido|Kurmi|Lau|Sardauna|Ussa|Wukari|Yorro|Zing");

$scope.loadVariables("YobeArray=|Bade|Bursari|Damaturu|Fika|Fune|Geidam|Gujba|Gulani|Jakusko|Karasuwa|Karawa|Machina|Nangere|Nguru Potiskum|Tarmua|Yunusari");

$scope.loadVariables("ZamfaraArray=|Anka|Bakura|Birnin Magaji|Bukkuyum|Bungudu|Gummi|Gusau|Kaura");

$rootScope.TimerJAMB.TimerStop();

$rootScope.TimerPUTME.TimerStop();

$rootScope.TimerSSCE.TimerStop();

$rootScope.TimerViews.TimerStop();

window.App.Plugins.AdMob.call().AdMobHideBanner();

$scope.alert("Notice!", "Internet is Required for Device Registeration. ");

$rootScope.$apply();
});

$scope.stateChange = function($event) {
$rootScope.state.Event = $event;

$rootScope.city.Items = [];

if ($rootScope.state.ItemIndex == 1) {

$rootScope.city.Items = $rootScope.AbujaArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 2) {

$rootScope.city.Items = $rootScope.AbiaArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 3) {

$rootScope.city.Items = $rootScope.AdamawaArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 4) {

$rootScope.city.Items = $rootScope.AkwaIbormArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 5) {

$rootScope.city.Items = $rootScope.AnambraArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 6) {

$rootScope.city.Items = $rootScope.BauchiArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 7) {

$rootScope.city.Items = $rootScope.BayelsaArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 8) {

$rootScope.city.Items = $rootScope.BenueArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 9) {

$rootScope.city.Items = $rootScope.BornoArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 10) {

$rootScope.city.Items = $rootScope.CrossRiverArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 11) {

$rootScope.city.Items = $rootScope.DeltaArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 12) {

$rootScope.city.Items = $rootScope.EbonyiArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 13) {

$rootScope.city.Items = $rootScope.EdoArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 14) {

$rootScope.city.Items = $rootScope.EkitiArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 15) {

$rootScope.city.Items = $rootScope.EnuguArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 16) {

$rootScope.city.Items = $rootScope.GombeArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 17) {

$rootScope.city.Items = $rootScope.ImoArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 18) {

$rootScope.city.Items = $rootScope.JigawaArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 19) {

$rootScope.city.Items = $rootScope.KadunaArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 20) {

$rootScope.city.Items = $rootScope.KanoArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 21) {

$rootScope.city.Items = $rootScope.KatsinaArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 22) {

$rootScope.city.Items = $rootScope.KebbiArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 23) {

$rootScope.city.Items = $rootScope.KogiArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 24) {

$rootScope.city.Items = $rootScope.KwaraArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 25) {

$rootScope.city.Items = $rootScope.LagosArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 26) {

$rootScope.city.Items = $rootScope.NasarawaArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 27) {

$rootScope.city.Items = $rootScope.NigerArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 28) {

$rootScope.city.Items = $rootScope.OgunArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 29) {

$rootScope.city.Items = $rootScope.OndoArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 30) {

$rootScope.city.Items = $rootScope.OsunArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 31) {

$rootScope.city.Items = $rootScope.OyoArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 32) {

$rootScope.city.Items = $rootScope.PlateauArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 33) {

$rootScope.city.Items = $rootScope.RiversArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 34) {

$rootScope.city.Items = $rootScope.SokotoArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 35) {

$rootScope.city.Items = $rootScope.TarabaArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 36) {

$rootScope.city.Items = $rootScope.YobeArray.concat($rootScope.city.Items);

} else if ($rootScope.state.ItemIndex == 37) {

$rootScope.city.Items = $rootScope.ZamfaraArray.concat($rootScope.city.Items);

}

$rootScope.state.Value = $rootScope.state.Items[$rootScope.state.ItemIndex];

};

$scope.cityChange = function($event) {
$rootScope.city.Event = $event;

$rootScope.city.Value = $rootScope.city.Items[$rootScope.city.ItemIndex];

};

$scope.planChange = function($event) {
$rootScope.plan.Event = $event;

$rootScope.plan.Value = $rootScope.plan.Items[$rootScope.plan.ItemIndex];

};

$scope.MsgSendClick = function($event) {
$rootScope.MsgSend.Event = $event;

$rootScope.NetWork = (navigator.connection !== undefined) && (navigator.connection.type !== undefined) ? navigator.connection.type.toString() : "unknown";

$rootScope.response.Hidden = "true";

$rootScope.SSec = 0;

if ($rootScope.NetWork ==  "none" ) {

$scope.alert("No Internet Found!", "Please connect Internet and try again.");

$scope.vibrate(15)

} else {

$rootScope.ResultEmail = window.validator.isEmail($rootScope.email.Value).toString();

$rootScope.ResultPhone = window.validator.isNumeric($rootScope.phone.Value).toString();

$rootScope.ResultPlan = window.validator.isNumeric($rootScope.plan.Value).toString();

if($rootScope.ResultEmail == 'true' && $rootScope.ResultPhone == 'true' && $rootScope.ResultPlan == 'true') {

if ($rootScope.response.Value ==  "UserRegistered" ) {

} else {

$http.post("http://www.justclickk.com/send_devotion.php", 
{"name":$rootScope.name.Value, "phone":$rootScope.phone.Value, "email":$rootScope.email.Value, "state":$rootScope.state.Value, "city":$rootScope.city.Value, "serial":$rootScope.serial.Value, "plan":$rootScope.plan.Value, "message":$rootScope.AppName, "donate":$rootScope.donatek.Value, "userid":"[DeviceID]", "build":$rootScope.App.BuildNumber})
.then(function(response){$rootScope.response.Value = response.data;});

$rootScope.TimerSersverResp.TimerStart();

$rootScope.MsgSend.Text = "Please Wait...";

}

} else {

$scope.alert("Please Check!", "Your data entries are not complete or correct.");

}

}

$scope.vibrate(8)

};

$scope.Label3Click = function($event) {
$rootScope.Label3.Event = $event;

$scope.showModalView("register");

};

$scope.activatorClick = function($event) {
$rootScope.activator.Event = $event;

$scope.showModalView("activate");

$scope.vibrate(8)

};

$scope.HtmlContent63Click = function($event) {
$rootScope.HtmlContent63.Event = $event;

$scope.replaceView("welcome");

$scope.vibrate(8)

};

$scope.HtmlContent64Click = function($event) {
$rootScope.HtmlContent64.Event = $event;

$scope.vibrate(8)

};

$scope.HtmlContent64Dblclick = function($event) {
$rootScope.HtmlContent64.Event = $event;

$scope.showModalView("Menu");

$scope.vibrate(30)

};

$scope.HtmlContent65Click = function($event) {
$rootScope.HtmlContent65.Event = $event;

window.App.Plugins.NativeSharing.call().NativeSharing("I recommend this App for you: ", "Install WhatsJAMB", "https://play.google.com/store/apps/details?id=com.justclickk.whatsjamb", "Sharing WhatsJAMB", "", "", "", "", "");

$scope.vibrate(12)

};

$scope.HtmlContent66Click = function($event) {
$rootScope.HtmlContent66.Event = $event;

$scope.replaceView("VPlayer");

};

$rootScope.TimerSersverResp.OnInterval = function() {

$rootScope.MsgSend.Text = "Please Wait...";

$rootScope.SSec = parseFloat($rootScope.SSec + 1);

if ($rootScope.SSec == 4) {

if ($rootScope.response.Value ==  "UserRegistered" ) {

$rootScope.response.Value = "Activation Successful, check Activation page for next step.";

$rootScope.MsgSend.Text = "Message Sent";

$scope.alert("Justclickk", "Registraation Successful");

$rootScope.MsgSend.Disabled = "true";

$rootScope.activator.Hidden = "";

$rootScope.response.Hidden = "";

$rootScope.response.Value = "THANK YOU! \nYou can proceed with Activation.";

} else {

$rootScope.response.Value = "Not successful, please try again connection failed. ";

$rootScope.MsgSend.Text = "Try Again";

$scope.alert("Justclickk", "Not successful, please try again this might be a network problem.");

$rootScope.MsgSend.Disabled = "";

}

$rootScope.SSec = 0;

$rootScope.TimerSersverResp.TimerStop();

$rootScope.response.Hidden = "";

}

};

$rootScope.TimerSersverResp.TimerStart = function() {
  $rootScope.TimerSersverResp.TimerStop();
  $rootScope.App._Timers.TimerSersverResp = $interval($rootScope.TimerSersverResp.OnInterval, $rootScope.TimerSersverResp.Interval);
};

$rootScope.TimerSersverResp.TimerStop = function() {
  if ($rootScope.App._Timers.TimerSersverResp !== null) {
    $interval.cancel($rootScope.App._Timers.TimerSersverResp);
  }
};

}]);
window.App.Ctrls.controller("ActivationCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Activation = {};
$rootScope.Activation.ABView = true;
$rootScope.Activation.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Activation = {};
window.App.Activation.Scope = $scope;

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Activation.Event = event;

angular.element(document.getElementById("Container47")).css("height", ""+$rootScope.App.InnerHeight+"px");

$rootScope.SelectedMyPlan = $rootScope.Select5.Items[$rootScope.Select5.ItemIndex];

$rootScope.Label10.Text = "ePractice "+$rootScope.Year+"/"+$rootScope.YearPlus+"";

$scope.alert("Notification!", "Please read information here carefully.");

$rootScope.TimerJAMB.TimerStop();

$rootScope.TimerPUTME.TimerStop();

$rootScope.TimerSSCE.TimerStop();

$rootScope.TimerViews.TimerStop();

$rootScope.$apply();
});

$scope.HtmlContent55Click = function($event) {
$rootScope.HtmlContent55.Event = $event;

$scope.replaceView("welcome");

$scope.vibrate(8)

};

$scope.HtmlContent60Click = function($event) {
$rootScope.HtmlContent60.Event = $event;

$scope.vibrate(8)

};

$scope.HtmlContent60Dblclick = function($event) {
$rootScope.HtmlContent60.Event = $event;

$scope.showModalView("Menu");

$scope.vibrate(30)

};

$scope.HtmlContent61Click = function($event) {
$rootScope.HtmlContent61.Event = $event;

window.App.Plugins.NativeSharing.call().NativeSharing("I recommend this App for you: ", "Install WhatsJAMB", "https://play.google.com/store/apps/details?id=com.justclickk.whatsjamb", "Sharing WhatsJAMB", "", "", "", "", "");

$scope.vibrate(12)

};

$scope.HtmlContent62Click = function($event) {
$rootScope.HtmlContent62.Event = $event;

$scope.replaceView("VPlayer");

};

$scope.Button22Click = function($event) {
$rootScope.Button22.Event = $event;

$rootScope.Container54.Hidden = "";

$scope.vibrate(8)

};

$scope.Button26Click = function($event) {
$rootScope.Button26.Event = $event;

$rootScope.Container53.Hidden = "";

$scope.vibrate(8)

};

$scope.Button27Click = function($event) {
$rootScope.Button27.Event = $event;

$rootScope.Container53.Hidden = "true";

};

$scope.Button23Click = function($event) {
$rootScope.Button23.Event = $event;

$rootScope.Container55.Hidden = "";

$scope.vibrate(8)

};

$scope.Button30Click = function($event) {
$rootScope.Button30.Event = $event;

$scope.showModalView("activate");

$scope.vibrate(8)

};

$scope.Button3Click = function($event) {
$rootScope.Button3.Event = $event;

$rootScope.Container54.Hidden = "true";

};

$scope.Button18Click = function($event) {
$rootScope.Button18.Event = $event;

$rootScope.NetWork = (navigator.connection !== undefined) && (navigator.connection.type !== undefined) ? navigator.connection.type.toString() : "unknown";

if ($rootScope.NetWork ==  "none" ) {

$scope.alert("No Internet Found!", "Please connect Internet and try again.");

} else {

$rootScope.IFrame10.Url = "http://justclickk.com/cbt/1000.php";

$scope.replaceView("PayView");

}

$scope.vibrate(8)

};

$scope.Button51Click = function($event) {
$rootScope.Button51.Event = $event;

$rootScope.NetWork = (navigator.connection !== undefined) && (navigator.connection.type !== undefined) ? navigator.connection.type.toString() : "unknown";

if ($rootScope.NetWork ==  "none" ) {

$scope.alert("No Internet Found!", "Please connect Internet and try again.");

} else {

$rootScope.IFrame10.Url = "http://justclickk.com/cbt/500.php";

$scope.replaceView("PayView");

}

$scope.vibrate(8)

};

$scope.Button70Click = function($event) {
$rootScope.Button70.Event = $event;

$rootScope.Container55.Hidden = "true";

};

$scope.Button71Click = function($event) {
$rootScope.Button71.Event = $event;

$scope.replaceView("register");

$scope.vibrate(8)

};

$scope.Button72Click = function($event) {
$rootScope.Button72.Event = $event;

$rootScope.Input10.Value = $rootScope.Serial1;

$rootScope.Container56.Hidden = "";

$scope.vibrate(8)

};

$scope.Button68Click = function($event) {
$rootScope.Button68.Event = $event;

$rootScope.Container56.Hidden = "true";

};

$scope.Button69Click = function($event) {
$rootScope.Button69.Event = $event;

$scope.messageBox("Please Confirm", "Are You Sure, You Have Made Payment? ", "Yes|No", "info", (("MessageBoxCallback".length > 0) && angular.isFunction($scope["MessageBoxCallback"])) ? $scope["MessageBoxCallback"] : null);

$scope.vibrate(8)

};

$scope.Select5Change = function($event) {
$rootScope.Select5.Event = $event;

$rootScope.SelectedMyPlan = $rootScope.Select5.Items[$rootScope.Select5.ItemIndex];

};

}]);
window.App.Ctrls.controller("activateCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.activate = {};
$rootScope.activate.ABView = true;
$rootScope.activate.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.activate = {};
window.App.activate.Scope = $scope;

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.activate.Event = event;

$rootScope.H = parseFloat($rootScope.App.InnerHeight+-150);

window.document.getElementById($rootScope.App.DialogView !== "" ? $rootScope.App.DialogView : $rootScope.App.CurrentView).style.width = "";
window.document.getElementById($rootScope.App.DialogView !== "" ? $rootScope.App.DialogView : $rootScope.App.CurrentView).style.height = ""+$rootScope.H+"px";

$rootScope.TimerJAMB.TimerStop();

$rootScope.TimerPUTME.TimerStop();

$rootScope.TimerSSCE.TimerStop();

$rootScope.TimerViews.TimerStop();

$rootScope.$apply();
});

$scope.Button24Click = function($event) {
$rootScope.Button24.Event = $event;

$scope.closeModalView();

$scope.showView("Activation");

$rootScope.TimerJAMB.TimerStop();

$rootScope.TimerPUTME.TimerStop();

$rootScope.TimerSSCE.TimerStop();

$rootScope.TimerViews.TimerStop();

};

$scope.Button14Click = function($event) {
$rootScope.Button14.Event = $event;

$rootScope.UserCode = $rootScope.UserKey.Value;

if ($rootScope.UserCode == $rootScope.DeviceCode) {

$scope.beep(1)

$rootScope.ActivateCode = $rootScope.DeviceCode;

$scope.setLocalOption("ePracticeKey", $rootScope.ActivateCode);

$scope.alert("Justclickk", "Successful.  PREMIUM PLAN Activated");

window.App.Utils.sleep(300);

$scope.replaceView("welcome");

} else if ($rootScope.UserCode == $rootScope.DonateKey) {

$scope.beep(1)

$rootScope.ActivateCode = $rootScope.DonateKey;

$scope.setLocalOption("ePracticeKey", $rootScope.ActivateCode);

$scope.alert("Justclickk", "Successful.  BASIC PLAN Activated");

window.App.Utils.sleep(300);

$scope.replaceView("welcome");

} else if ($rootScope.UserCode == $rootScope.OfflineCode) {

$rootScope.ActivateCode = $rootScope.OfflineCode;

$scope.setLocalOption("ePracticeKey", $rootScope.ActivateCode);

$scope.alert("Justclickk", "Successful. SMS PLAN Activated");

window.App.Utils.sleep(300);

window.App.Plugins.SendSMS.call().SendSMS($rootScope.PhoneInput.Value, "ePractice Activated\nDevice ID: "+$rootScope.Serial1+"\nSERIAL: "+$rootScope.OfflineCode+"", "false");

} else {

$scope.vibrate(15)

$scope.alertBox("Activation Code is not correct!", "danger");

}

$scope.vibrate(12)

};

$scope.HtmlContent47Click = function($event) {
$rootScope.HtmlContent47.Event = $event;

$rootScope.ActivateCode = $scope.getLocalOption("ePracticeKey");

if ($rootScope.ActivateCode == $rootScope.DeviceCode) {

$rootScope.Container48.Hidden = "";

}

};

$scope.Label5Click = function($event) {
$rootScope.Label5.Event = $event;

$scope.replaceView("Activation");

$scope.vibrate(12)

};

$scope.Button33Click = function($event) {
$rootScope.Button33.Event = $event;

$rootScope.Container48.Hidden = "true";

};

$scope.Button46Click = function($event) {
$rootScope.Button46.Event = $event;

$rootScope.Serial1 = $rootScope.InputUserID.Value;

if ($rootScope.InputPIN.Value == 6775) {

$rootScope.SMSCodeOne = Base64.encode($rootScope.Serial1);

$rootScope.SMSCodeTwo = ""+$rootScope.Serial1+"01"+$rootScope.AppName+"10"+$rootScope.SMSCodeOne+"20"+$rootScope.SMSCodeOne+"30"+$rootScope.SMSCodeOne+"40"+$rootScope.Serial1+""+$rootScope.SMSCodeOne+"50"+$rootScope.SMSCodeOne+"100"+$rootScope.Serial1+"";

$rootScope.OfflineCode = $rootScope.SMSCodeTwo.match(/\d/g).join("");

$rootScope.OfflineCode = window.App.Utils.subStr($rootScope.OfflineCode, 0, 25);

$rootScope.Textarea1.Value = $rootScope.OfflineCode;

}

$scope.vibrate(8)

};

$scope.Button47Click = function($event) {
$rootScope.Button47.Event = $event;

$rootScope.CutAfterCopy = "false";

if ($rootScope.Textarea1.Value !== "") {
  $rootScope.Clipboard1.Clipboard = new Clipboard(".btn", {text: function() {return $rootScope.Textarea1.Value;}});
  $rootScope.Clipboard1.Clipboard.on("error", function(e) {$rootScope.Clipboard1.onError(e)});
  $rootScope.Clipboard1.Clipboard.on("success", function(e) {$rootScope.Clipboard1.onSuccess(e)});
}

};

$rootScope.Clipboard1.onSuccess = function(event) {



$scope.alertBox("Text copied!", "success");

if ($rootScope.CutAfterCopy ==  "true" ) {

$rootScope.Textarea1.Value = "";

}


$rootScope.Clipboard1.Clipboard.destroy();
};

$rootScope.Clipboard1.onError = function(error) {
  $rootScope.Clipboard1.Error = error;



$scope.alertBox("An error occur: "+$rootScope.Clipboard1.Error+"", "danger");


$rootScope.Clipboard1.Clipboard.destroy();
};

}]);
window.App.Ctrls.controller("View3Ctrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.View3 = {};
$rootScope.View3.ABView = true;
$rootScope.View3.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.View3 = {};
window.App.View3.Scope = $scope;

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

$rootScope.HttpClient28.Execute = function() {
  $rootScope.HttpClient28.Request.transformRequest = window.App.Utils.transformRequest($rootScope.HttpClient28.Transform);
  $http($rootScope.HttpClient28.Request)
  .then(function(response) {
    $rootScope.HttpClient28.Status = response.status;
    $rootScope.HttpClient28.Response = response.data;
    $rootScope.HttpClient28.StatusText = response.statusText;

$rootScope.HttpStatus = $rootScope.HttpClient28.Status;

$rootScope.HttpStatusText = $rootScope.HttpClient28.StatusText;

$rootScope.HttpResponse = $rootScope.HttpClient28.Response;

if ($rootScope.HttpResponse ==  "ThisFileExist" ) {

$rootScope.home = $scope.openWindow("http://justclickk.com/cbt/potals_chat.php", "", "_system");

$scope.vibrate(8)

} else {

$scope.alertBox("It appears you have run out of data! \nPlease Check and trya again.", "success");

}

  },
  function(response) {
    $rootScope.HttpClient28.Status = response.status;
    $rootScope.HttpClient28.Response = response.data;
    $rootScope.HttpClient28.StatusText = response.statusText;

$rootScope.HttpStatus = $rootScope.HttpClient28.Status;

$rootScope.HttpResponse = $rootScope.HttpClient28.Response;

$scope.alert("Info", "Connection Problem!");

  });
};

$scope.Label64Click = function($event) {
$rootScope.Label64.Event = $event;

$scope.replaceView("welcome");

};

$scope.Button5Click = function($event) {
$rootScope.Button5.Event = $event;

$rootScope.HttpClient28.Request.data = {};

$rootScope.HttpClient28.Request.data["name"] = $rootScope.App.Name;


$rootScope.HttpClient28.Execute();

};

}]);

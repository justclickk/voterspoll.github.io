/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2018 App Builder - https://www.davidesperalta.com
 */
window.App.Plugins.AdMob = function() {

  /* Private plugin's stuff */

  var
    setEventVariables = function(data) {
      window.App.RootScope.AdMobType = data.adType || '';
      window.App.RootScope.AdMobNetwork = data.adNetwork || '';
      window.App.RootScope.AdMobErrorMessage = data.error || '';
      window.App.RootScope.AdMobErrorReason = data.reason || '';
    };

  var
    pluginNotFoundError = function() {
      if (angular.isFunction(window.App.Scope.AdMobFailEvent)) {
        setEventVariables({"error": "-1", "reason": "-1"});
        window.App.Scope.AdMobFailEvent();
      }
    };

  /* Public interface: actions exposed by the plugin */

  return {

    AdMobShowBanner: function(adID, position, size, isTesting) {
      if (window.AdMob) {
        window.AdMob.createBanner
        ({
          adId: adID,
          adSize: size,
          autoShow: true,
          position: window.AdMob.AD_POSITION[position],
          isTesting: (isTesting && isTesting.toLowerCase() === 'true')
        });
      } else {
        pluginNotFoundError();
      }
    },

    AdMobHideBanner: function() {
      if (window.AdMob) {
       window.AdMob.removeBanner();
      } else {
        pluginNotFoundError();
      }
    },

    AdMobShowInterstitial: function(adID, isTesting) {
      if (window.AdMob) {
        window.AdMob.prepareInterstitial
        ({
          adId: adID,
          autoShow: true,
          isTesting: (isTesting && isTesting.toLowerCase() === 'true')
        });
      } else {
        pluginNotFoundError();
      }
    },

    /* Optional plugin's events (called by App Builder) */

    PluginSetupEvent: function() {
      // Nothing to do here
    },

    PluginDocumentReadyEvent: function() {
      // Nothing to do here
    },

    PluginAppReadyEvent: function() {

      window.document.addEventListener('onAdFailLoad', function (data) {
        if (angular.isFunction(window.App.Scope.AdMobFailEvent)) {
          setEventVariables(data);
          window.App.Scope.AdMobFailEvent();
        }
      }, false);

      window.document.addEventListener('onAdLoaded', function (data) {
        if (angular.isFunction(window.App.Scope.AdMobLoadedEvent)) {
          setEventVariables(data);
          window.App.Scope.AdMobLoadedEvent();
        }
      }, false);

      window.document.addEventListener('onAdPresent', function (data) {
        if (angular.isFunction(window.App.Scope.AdMobPresentEvent)) {
          setEventVariables(data);
          window.App.Scope.AdMobPresentEvent();
        }
      }, false);

      window.document.addEventListener('onAdLeaveApp', function (data) {
        if (angular.isFunction(window.App.Scope.AdMobLeaveAppEvent)) {
          setEventVariables(data);
          window.App.Scope.AdMobLeaveAppEvent();
        }
      }, false);

      window.document.addEventListener('onAdDismiss', function (data) {
        if (angular.isFunction(window.App.Scope.AdMobDismissEvent)) {
          setEventVariables(data);
          window.App.Scope.AdMobDismissEvent();
        }
      }, false);
    }
  };
};

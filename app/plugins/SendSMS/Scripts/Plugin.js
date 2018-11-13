/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2018 App Builder - https://www.davidesperalta.com
 */

window.App.Plugins.SendSMS = function() {

  /* Public interface: actions exposed by the plugin */

  return {

    SendSMS: function(number, message, intent) {

      if (angular.isUndefined(window.sms)) {
        if (angular.isFunction(window.App.Scope.SendSMSErrorEvent)) {
          window.App.Scope.SendSMSErrorEvent(-1);
        }
        return;
      }

      sms.send
      (
        number,
        message,
        {"android": { "intent": (intent === 'true') ? 'INTENT' : '' }},  
        function() {
          if (angular.isFunction(window.App.Scope.SendSMSSuccessEvent)) {
            window.App.Scope.SendSMSSuccessEvent();
          }
        },
        function(error) {
          if (angular.isFunction(window.App.Scope.SendSMSErrorEvent)) {
            window.App.Scope.SendSMSErrorEvent(error);
          }
        }
      );
    },

    /* Optional plugin's events (called by App Builder) */

    PluginSetupEvent: function() {
      // Nothing to do here
    },

    PluginAppReadyEvent: function() {
      // Nothing to do here
    },

    PluginDocumentReadyEvent: function() {
      // Nothing to do here
    }
  };
};

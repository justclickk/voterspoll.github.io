/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2018 App Builder - https://www.davidesperalta.com
 */

window.App.Plugins.Analytics = function() {

  /* Private plugin's stuff */
  
  var
    clientIdKey = 'AbAnalyticsClientId';

  var 
    createGa = function(userTrackingId) {
    
      ga('create', {storage:'none', trackingId: userTrackingId, 
       clientId: localStorage.getItem(clientIdKey)});

      ga('set', 'checkProtocolTask', null);
      ga('set', 'appId', window.App.RootScope.App.ID);
      ga('set', 'appName', window.App.RootScope.App.Name);
      ga('set', 'appVersion', window.App.RootScope.App.Version);
      ga('set', 'transportUrl', 'https://www.google-analytics.com/collect');

      ga(function(tracker) {
        if (!localStorage.getItem(clientIdKey)) {
          localStorage.setItem(clientIdKey, tracker.get('clientId'));
        }
      });
    };

  /* Public interface: actions exposed by the plugin */

  return {

    AnalyticsStart: function(userTrackingId) {
      createGa(userTrackingId);
    },
    
    AnalyticsSendView: function(viewName) {
      ga('send', 'screenview', {screenName: viewName});
    },

    /* Optional plugin's events (called by App Builder) */

    PluginSetupEvent: function() {
      //alert('Hello from the Template plugin Setup event!');
    },

    PluginAppReadyEvent: function() {
      //alert('Hello from the Template plugin App ready event!');
    },

    PluginDocumentReadyEvent: function() {
      //alert('Hello from the Template plugin Document ready event!');
    }
  };
};

/*!
 * Native Sharing plugin for Android, iOS and Windows Phone
 * ©2016 Andreas Klein
 */

window.App.Plugins.NativeSharing = function() {

  /* Public interface: actions exposed by the plugin */
  return {

    NativeSharing: function(ShareMessage, ShareSubject, ShareURL, ShareChooserTitle, File1, File2, File3, File4, File5) {
      	var options = {
  	message: ShareMessage, 
  	subject: ShareSubject, 
  	files: [File1, File2, File3, File4, File5], 
  	url: ShareURL,
	chooserTitle: ShareChooserTitle
	}

	var onSuccess = function(result) {

	}

	var onError = function(msg) {
	
	}

	window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);

    }
  };
};

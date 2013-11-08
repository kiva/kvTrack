(function ($, global) {

	/**
	 *
	 * @param {Object} options
	 * @constructor
	 */
	function KvTrack (options) {

	}


	/**
	 *
	 * @param {String} cookieName
	 */
	KvTrack.removeMpCookie = function (cookieName) {

	};


	/**
	 *
	 * @param {Array} cookieNames
	 */
	KvTrack.removeMpCookies = function (cookieNames) {
		$.each(cookieNames, function (index, name) {
			KvTrack.removeMpCookie(name);
		});
	};


	/**
	 *
	 * @param {String} projectName
	 */
	KvTrack.makeMixPanelAliased = function (projectName) {

	};


	KvTrack.prototype = {
		initMp: function () {

		}


		, initGa: function () {

		}


		, initMono: function () {

		}


		, track: function (name, properties, options, callback) {

		}


		, setSessionProperty: function (name, property) {

		}


		, removeSessionProperty: function (name) {

		}


		, setUserProperty: function (name, property) {

		}


		, removeUserProperty: function (name) {

		}


		, trackLink: function () {

		}


		, trackForm: function () {

		}
	};


	global.KvTrack = KvTrack;

}(jQuery, this));

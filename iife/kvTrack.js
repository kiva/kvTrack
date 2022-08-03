'use strict';

/**
 * @typedef {Object} Promise
 */

/**
 *
 * @param {string} uaID
 * @param {Function} logHandler
 * @constructor
 */
function kvTrack(uaID) {
	var self = this
	, trackDeferred = $.Deferred();

	// Local copies
	this._gaID = '';
	this.gtag = null;
	this.isReady = trackDeferred;

	// Initialize Google Analytics
	self.setUAId(uaID);
	self.initGA(uiID);

	// Contextualize all kvTrack methods
	$.each(this, function (methodName, fn) {
		if (typeof fn == 'function') {
			self[methodName] = $.proxy(self, methodName);
		}
	});
}


kvTrack.prototype = {
	init: function () {
	}


	, setUAId: function (uaID) {
		this._gaID = uaID;
	}


	, initGA: function () {
		// initialize the global methods and dataLayer
		// https://developers.google.com/analytics/devguides/migration/ua/analyticsjs-to-gtagjs#analyticsjs_2_gtagjs
		window.dataLayer = window.dataLayer || [];
		window.gtag = function(){window.dataLayer.push(arguments);}

		var self = this;

		// Get analytics.js from Google
		$.ajax({
			url:'//www.googletagmanager.com/gtag/js?id=' + uaId
			, dataType: 'script'
			, cache: true
			, crossDomain: true // forces jQuery to create a script-tag as apposed to loading via ajax
		}).fail(function(){
			this.isReady.reject();
		}).done(function(){
			self.gtag = window.gtag;
			self.gtag('js', new Date());
			self.gtag('config', uaId, { 'send_page_view': false });
			self.isReady.resolve();
		});
	}


	, trackEvent: function (category, action, label, value) {
		this.gtag('event', String(action), {
			event_category: String(category),
			event_label: String(label),
			value: parseInt(value)
		});
	}
};

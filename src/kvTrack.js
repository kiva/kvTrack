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
	this.ga = null;
	this.isReady = trackDeferred;

	// Initialize Google Analytics
	self.setUAId(uaID);
	self.initGA();

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
		var self = this;

		// Get analytics.js from Google
		$.ajax({
			url: '//www.google-analytics.com/analytics.js'
			, dataType: 'script'
			, cache: true
			, crossDomain: true // forces jQuery to create a script-tag as apposed to loading via ajax
		}).fail(function(){
			this.isReady.reject();
		}).done(function(){
			self.ga = window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date; // jshint ignore:line
			self.ga('create', self._gaID, 'auto'); // jshint ignore:line
			self.isReady.resolve();
		});
	}


	, trackEvent: function (category, action, label, value) {
		this.ga('send', 'event', {
			'eventCategory': String(category),
			'eventAction': String(action),
			'eventLabel': String(label),
			'eventValue': parseInt(value)
		});
	}

	/**
	 * Google Analytics's Page View wrapper
	 *
	 * @param {string} path
	 * @param {string} category
	 * @param {string} action
	 * @param {string} label
	 * @param {int} value
	 */
	, trackPageView: function (path, category, action, label, value) {
		this.ga('send', 'pageview', String(path), {
			'eventCategory': String(category),
			'eventAction': String(action),
			'eventLabel': String(label),
			'eventValue': parseInt(value)
		});
	}
};

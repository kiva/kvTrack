'use strict';

/**
 * @typedef {Object} Promise
 */

/**
 *
 * @param {string} uaID
 * @constructor
 */
function kvTrack(uaID) {
	var self = this
	, trackDeferred = $.Deferred();

	// if uaID is not an array, make it one
	if (Object.prototype.toString.call(uaID) !== '[object Array]'){
		uaID = [uaID];
	}

	// Local copies
	this._gaID = [];
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
	/**
	 * Generic init
	 */
	init: function () {
	}

	/**
	 * Sets UA IDs for various upstream services
	 */
	, setUAId: function (uaID) {
		this._gaID = uaID;
	}

	/**
	 * Initialize Google Analytics
	 * Sets isReady
	 */
	, initGA: function () {
		var self = this;

		// Get analytics.js from Google
		$.ajax({
			url: '//www.google-analytics.com/analytics.js'
			, dataType: 'script'
			, cache: true
			, crossDomain: true // forces jQuery to create a script-tag as apposed to loading via ajax
		}).fail(function(){
			self.isReady.reject();
		}).done(function(){
			self.ga = window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date; // jshint ignore:line
			// create and label each tracker requested
			self._gaID.forEach(function(id, count){
				self.ga('create', id, 'auto', 'tracker' + count); // jshint ignore:line
			});
			self.isReady.resolve();
		});
	}
	/**
	 * Google Analytics's Track Event wrapper
	 *
	 * @param {string} category
	 * @param {string} action
	 * @param {string} label
	 * @param {int} value
	 */
	, trackEvent: function (category, action, label, value) {
		label = (label !== undefined) ? String(label) : null;
		value = (value !== undefined) ? parseInt(value) : null;

		this.ga('send', 'event', {
			'eventCategory': String(category),
			'eventAction': String(action),
			'eventLabel': label,
			'eventValue': value
		});
	}

	/**
	 * Google Analytics's Page View wrapper
	 *
	 * @param {string} page
	 * @param {string} title
	 * @param {int} loc
	 */
	, trackPageView: function (page, title, loc) {
		var self = this;

		title = (title !== undefined) ? String(title) : null;
		loc = (loc !== undefined) ? String(loc) : null;

		self._gaID.forEach(function(id, count){
			self.ga('tracker' + count + '.send', 'pageview', String(page), {
				'title': title,
				'location': loc
			});
		});
	}
};

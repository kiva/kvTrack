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

	// Contextualize all kvTrack methods
	$.each(this, function (methodName, fn) {
		if (typeof fn == 'function') {
			self[methodName] = $.proxy(self, methodName);
		}
	});

	// Initialize Google Analytics
	self.setUAId(uaID);
	// Use existing lib if present
	if (typeof ga === 'function') {
		this.ga = ga;
		this._gaID.forEach(function(id, count){
			self.ga('create', id, 'auto', 'tracker' + count); // jshint ignore:line
		});
		this.isReady.resolve();
	} else {
		self.initGA();
	}

	// Check for Snowplow
	this.sp = (typeof snowplow === "function") ? snowplow : null;
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
			if (typeof ga !== 'undefined'){
				self.ga = window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date; // jshint ignore:line
				// create and label each tracker requested
				self._gaID.forEach(function(id, count){
					self.ga('create', id, 'auto', 'tracker' + count); // jshint ignore:line
				});
				self.isReady.resolve();
			} else {
				self.isReady.reject();
			}
		});
	}

	/**
	 * Google Analytics's Track Event wrapper
	 * -> extended to fire to Snowplow
	 *
	 * @param {string} category
	 * @param {string} action
	 * @param {string} label
	 * @param {int} value
	 * @param {boolean} fireSnowplow
	 */
	, trackEvent: function (category, action, label, value, fireSnowplow) {

		var self = this;

		label = (label !== undefined && label !== null) ? String(label) : null;
		value = (value !== undefined && value !== null) ? parseInt(value) : null;

		// Attempt GA event
		try {
			self._gaID.forEach(function(id, count){
				self.ga('tracker' + count + '.send', 'event', {
					'eventCategory': String(category),
					'eventAction': String(action),
					'eventLabel': label,
					'eventValue': value
				});
			});
		} catch (error) {
		}

		// Attempt Snowplow event
		try {
			if (fireSnowplow) {
				self.sp('trackStructEvent', category, action, label, value);
			}
		} catch (error) {
		}

		return;
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

		try {
			self._gaID.forEach(function(id, count){
				self.ga('tracker' + count + '.send', 'pageview', String(page), {
					'title': title,
					'location': loc
				});
			});
		} catch (error) {
			return;
		}
	}

	/**
	 * Google Analytics's set dimension wrapper
	 *
	 * @param {string} dimension
	 * @param {string} value
	 */
	, trackSetDimension: function (dimension, value) {
		var self = this;

		dimension = (dimension !== undefined) ? String(dimension) : null;
		value = (value !== undefined) ? String(value) : null;

		try {
			self._gaID.forEach(function(id, count) {
				self.ga('tracker' + count + '.set', dimension, value);
			});
		} catch (error) {
			return;
		}
	}
};

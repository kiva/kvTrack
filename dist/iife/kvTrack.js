/**
 * kvTrack - v1.0.0 
 * Copyright (c) 2021 Kiva Microfunds
 * 
 * Licensed under the MIT license.
 * http://github.com/kiva/kvTrack/license.txt
 */
(function ($, global) {
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
		this.sp = null;
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
		this.setUAId(uaID);
	
		var readyStateTimeout;
		var readyStateInterval = window.setInterval(function() {
			if (typeof window.ga === 'function') {
				// Setup Global GA
				self.ga = window.ga;
				self._gaID.forEach(function(id, count){
					self.ga('create', id, 'auto', 'tracker' + count); // jshint ignore:line
				});
			}
	
			if (typeof window.snowplow === 'function') {
				// Setup Global Snowplow
				self.sp = window.snowplow;
	
				// resovle deferred for next steps
				// We currently resolve with snowplow as a priority analytics lib
				self.isReady.resolve();
	
				clearInterval(readyStateInterval);
				clearTimeout(readyStateTimeout);
			}
		}, 100);
	
		readyStateTimeout = window.setTimeout(function() {
			// resolve the promise
			self.isReady.resolve();
			// clean up interval and timeout
			clearInterval(readyStateInterval);
			clearTimeout(readyStateTimeout);
		}, 5000);
		
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
				if (typeof self.sp === 'function') {
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
	
			try {
				// Snowplow pageview
				if (typeof self.sp === 'function') {
					// track page view
					self.sp('trackPageView');
				}
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

	global.kvTrack = kvTrack;
}(jQuery, this));
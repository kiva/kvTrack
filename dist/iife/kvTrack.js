/**
 * kvTrack - v2.0.2 
 * Copyright (c) 2022 Kiva Microfunds
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
		this.gtag = null;
		this.isReady = trackDeferred;
	
		// Contextualize all kvTrack methods
		$.each(this, function (methodName, fn) {
			if (typeof fn == 'function') {
				self[methodName] = $.proxy(self, methodName);
			}
		});
	
		// Initialize Google Analytics
		this.init();
		this.setUAId(uaID);
	
		var readyStateTimeout;
		var readyStateInterval = window.setInterval(function() {
			if (typeof window.gtag === 'function') {
				// Setup Global GA
				self.gtag = window.gtag;
				self._gaID.forEach(function(id, count){
					self.gtag('js', new Date());
					self.gtag('config', id, { 'send_page_view': false });
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
			// initialize the global methods and dataLayer
			// https://developers.google.com/analytics/devguides/migration/ua/analyticsjs-to-gtagjs#analyticsjs_2_gtagjs
			window.dataLayer = window.dataLayer || [];
			window.gtag = function(){
				window.dataLayer.push(arguments);
			};
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
					self.gtag('event', String(action), {
						event_category: String(category),
						event_label: String(label),
						value: parseInt(value),
						send_to: id
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
					self.gtag('event', 'page_view', {
						page_path: String(page),
						title: title,
						location: loc,
						send_to: id
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
					self.gtag('config', id, {
						dimension: value,
						'send_page_view': false
					});
				});
			} catch (error) {
				return;
			}
		}
	};

	global.kvTrack = kvTrack;
}(jQuery, this));
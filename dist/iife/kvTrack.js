/**
 * kvTrack - v0.0.8 
 * Copyright (c) 2016 Kiva Microfunds
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
				this.isReady.reject();
			}).done(function(){
				self.ga = window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date; // jshint ignore:line
				self.ga('create', self._gaID, 'auto'); // jshint ignore:line
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
			label = (label !== undefined) ? label : null;
			value = (value !== undefined) ? value : null;
	
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

	global.kvTrack = kvTrack;
}(jQuery, this));
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

	// Use existing lib if present
	if (typeof ga === 'function') {
		this.ga = ga;
		self.ga('create', id, 'auto', 'tracker' + count); // jshint ignore:line
	}

	// Contextualize all kvTrack methods
	$.each(this, function (methodName, fn) {
		if (typeof fn == 'function') {
			self[methodName] = $.proxy(self, methodName);
		}
	});

	// Check for Snowplow
	this.sp = (typeof snowplow === "function") ? snowplow : null;

	// resolve deferred
	self.isReady.resolve();
}


kvTrack.prototype = {
	init: function () {
	}

	, setUAId: function (uaID) {
		this._gaID = uaID;
	}

	, trackEvent: function (category, action, label, value) {
		this.ga('send', 'event', {
			'eventCategory': String(category),
			'eventAction': String(action),
			'eventLabel': String(label),
			'eventValue': parseInt(value)
		});
	}
};

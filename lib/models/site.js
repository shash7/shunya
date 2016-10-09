/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * routes.js
 * 
 * Contains all routes
 * ---------------------------------------------------------------- */


(function() {

	'use strict';
	
	var mongoose   = require('mongoose');
	var bcrypt     = require('bcrypt-nodejs');

	var schema = new mongoose.Schema({
		name        : String,
		metadata    : String,
		homepage    : Object,
		errorpage   : Object
	});

	module.exports = mongoose.model('Site', schema);
	
})();
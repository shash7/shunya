/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * fields.js
 *
 * Manages form fields
 * - Validates fields
 * - Interpolates fields with db data
 * ---------------------------------------------------------------- */


(function() {

	'use strict';


	var async    = require('async');
	var mongoose = require('mongoose');
	var bcrypt   = require('bcrypt-nodejs');
	var shortid  = require('shortid');
	var helper   = require('./../helper');
	var _        = require('underscore');

	module.exports = [
		/*{ // Sample field
				name : 'hubolt', // Required. In lowercase
				validate : function(obj, name) { // This function runs whenver a template is loaded. This basically sets all the defaults
					return obj; // Always return the object.
				},
				pre : function(err, field, cb) {
					cb();
				},
				post : function(err, field, cb) {
					
				}
		},*/
		{
			name : 'text',
			validate : function(obj, name) {
				obj.name        = name;
				obj.size        = obj.size || 12;
				obj.label       = obj.label || name;
				obj.description = obj.description || '';
				return obj;
			},
			pre : function(err, field, cb) {
				cb();
			},
			post : function(err, field, cb) {
				cb();
			}
		}
	];


})();
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
	var helper   = require('./helper.js');
	var _        = require('underscore');

	var fields = require('./defaults/fields.js');

	/**
	 * Check if a field exists. If yes, return the field.
	 * @param  {Object} field   [The field]
	 * @return {Object | false} [The field]
	 */
	function fieldExists(field) {

		var type = field.type || '';
		var success = null;
		fields.map(function(f) {
			if(f.name === type) {
				success = f;
			}
		});

		return success;
	}

	var exports = {

		/**
		 * Interpolates fields and much more. Pass the correct params or else..
		 * @param  {Object}   doc    [Db document]
		 * @param  {Array}   fields  [An array containing the fields]
		 * @param  {Function} cb     [Callback function, similar to next() in usage]
		 */
		runPipeline : function(doc, fields, cb) {
			doc = doc || {};
			var metadata;
			if(doc.metadata) {
				metadata = this.parseJson(doc.metadata);
				metadata = this._interpolateFields(fields, metadata);
			}

			if(metadata) {
				this.preFieldHook(metadata);
			}

		},

		preFieldHook : function(fs, cb) {
			var arr = [];
			fs.map(function(field) {
				fields.map(function(f) {
					if(f.name === field.name) {
						arr.push(f.pre);
					}
				});
			});

			/*async.series(arr, function(err, results, () {
				cb(err, results);
			}));*/
		},

		_interpolateFields : function(fields, data) {
			// Clone fields old skool style
			fields = JSON.parse(JSON.stringify(fields));

			// Loop through template fields
			for(var key in fields) {
				if(fields.hasOwnProperty(key)) {

					if(data[key]) {
						fields[key].value = data[key];
					}

				}
			}

			return fields;
		},

		parseJson : function(metadata) {
			metadata = metadata || '{}';
			return JSON.parse(metadata);
		},

		/**
		 * Validates form fields.
		 * @param  {Object} fields [Form fields]
		 * @return {Object}        [Modified form fields]
		 */
		validateFields : function(fields) {

			for(var key in fields) {
				if(fields.hasOwnProperty(key)) {

					var field = fields[key];
					var ruleset = fieldExists(field);
					if(ruleset) {
						field = ruleset.validate(field, key);
					} else {
						delete fields[key];
					}

				}
			}

			return fields;
		},

		/**
		 * Interpolates fields with form data. Returns a new cloned object
		 * @param  {Object} fields [Form fields template]
		 * @param  {Object}   data [Metadata retrieved from database]
		 * @return {Object}        [Form fields with data values]
		 */
		interpolateFields : function(fields, data) {

			// Clone fields old skool style
			fields = JSON.parse(JSON.stringify(fields));

			// Loop through template fields
			for(var key in fields) {
				if(fields.hasOwnProperty(key)) {

					if(fields[key].type === 'list') {
						if(data[key]) {
							// loop though fields[key].fields
						}
					}


					if(data[key]) {
						fields[key].value = data[key];
					}

				}
			}

			return fields;
		}
	};


	module.exports = exports;
	
})();
/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * db.js
 * 
 * Contains database functions and handles the connection
 * ---------------------------------------------------------------- */


(function() {

	'use strict';


	var async    = require('async');
	var mongoose = require('mongoose');
	var bcrypt   = require('bcrypt-nodejs');
	var shortid  = require('shortid');
	var helper   = require('./helper');

	var mongoosePaginate = require('mongoose-paginate');
	var URLSlugs         = require('mongoose-url-slugs');

	var dbName   = 'test';		


	/**
	 * Generates connection string based on the env variables
	 * @return {String} [connection strin]
	 */
	function connectionString(vars) {
		vars = vars || {};
		if(vars.connectionString) {
			return vars.connectionString;
		} else {
			var str = '';
			str = vars.host + ':' + vars.port + '/' + vars.name;
			return str;
		}
	}

	var User = require('./models/user.js');
	var Page = require('./models/page.js');
	var Site = require('./models/site.js');

	var exports = {
		User : User,
		Page : Page,
		Site : Site,

		/**
		 * Sets up mongodb connection. Only run once
		 * @return {[type]} [description]
		 */
		setup : function(app) {
			mongoose.connect(connectionString(app.locals.db));
		},

		/**
		 * Creates schema for content types
		 * @param  {Object} schema [Object describing schema]
		 * @param  {String} name   [Name of the schema]
		 */
		createType : function(schema, name) {
			schema.dateCreated = Date;
			var schema = new mongoose.Schema(schema);
			schema.plugin(mongoosePaginate);
			//schema.plugin(URLSlugs('title'));
			this[name] = mongoose.model(name, schema);
		},

		/**
		 * Gets db stats
		 * @return callback {Object} [Stats object]
		 */
		getStats : function(cb) {
			mongoose.connection.db.stats(function(err, stats) {
				if(err)
					throw err;

				cb(stats);
			});
		},
		getCollectionNames : function(cb) {
			mongoose.connection.db.listCollections().toArray(function (err, names) {
        cb(names);
    	});
		}
	};
	
	module.exports = exports;
	
})();
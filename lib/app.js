/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * routes.js
 * 
 * Contains all routes
 * ---------------------------------------------------------------- */


(function() {

	'use strict';
	
	var express   = require('express');
	var _         = require('underscore');
	var appConfig = require('../config.js');
	var db        = require('./db.js');
	var backend   = require('./backend.js');
	var helper    = require('./helper.js');
	var fs        = require('fs');
	var YAML      = require('yamljs');
	var async     = require('async');
	var globals   = require('./globals.js');
	var form      = require('./fields.js');

	var frontend = require('./frontend.js');
	var backend  = require('./backend.js');

	var app = express();

	
/* ----------------------------------------------------------------
 * $options
 * ---------------------------------------------------------------- */
	var frontend;
	var backend;
	var defaults = {
		local : {
			port: process.env.PORT,
			host : 'localhost'
		},
		server : {
			port : process.env.PORT,
			host : '127.0.0.1'
		},
		site : {
			name : 'Shash7\'s toolbox of death and doom',
			isActive : false,
			version : '0.8.0',
			uploads : '/uploads'
		},
		deploymentPath : '/deployment',

		db : {
			name : 'test',
			host : '127.0.0.1',
			port : 27017
		},

		paths : {
			backend : '/backend',
			deployment : '/deployment'
		}
	};


/* ----------------------------------------------------------------
 * $cms
 * ---------------------------------------------------------------- */
	var cms = {

		hooks : {},
		scripts : [],
		styles : [],
		meta : [],

		/**
		 * Define Content types
		 * @param  {Object} obj [Type object literal. See main.js]
		 */
		defineType : function(obj) {
			if(obj.schema && obj.name) {
				db.createType(obj.schema, obj.name);
				obj.typeFields = parseSchema(obj.schema);
				if(app.locals.types) {
					app.locals.types.push(obj);
				} else {
					app.locals.types = [obj];
				}
			}
		},

		addDocuments : function(typeName, arr) {
			console.log(db);
			db[typeName].collection.insert(arr, function() {
			});
		},

		/**
		 * Define User roles
		 * @param  {[type]} obj [description]
		 */
		defineRole : function(obj) {

		},

		/**
		 * Define Hook
		 */
		defineHook : function() {

		},

		addScript : function() {

		},

		addStyle : function() {

		},

		addMeta : function() {

		},

		addHook : function(name, cb) {

		}
	};


	/**
	 * Transforms a type schema to a standard fields array;
	 * @return {[type]} [description]
	 */
	function parseSchema(schema) {
		var arr = [];
		for(var key in schema) {
			var obj = {};
			obj.name = key;
			obj.label = schema[key].label || key;
			obj.size  = schema[key].size || 12;
			var type = schema[key].type;
			if(schema[key].fieldType) {
				obj.type = schema[key].fieldType;
			} else if(type === String) {
				obj.type = 'text';
			} else {
				obj.type = 'text';
			}
			arr.push(obj);
		}
		return arr;
	}

	/**
	 * Will merge defaults with yaml config options and populates app.locals variables
	 * @param  {Object} vars [yaml config options]
	 */
	function parseOptions(vars) {
		if(vars.paths) {
			defaults.paths.backend    = vars.paths.backend    || defaults.paths.backend;
			defaults.paths.deployment = vars.paths.deployment || defaults.paths.deployment;
		}
		defaults.paths.deploymentDir = __dirname + '/..' + defaults.paths.deployment;
		
		if(vars.local) {
			defaults.local.port = vars.local.port  || defaults.local.port;
			defaults.local.host = vars.local.host  || defaults.local.host;
		}
		if(vars.server) {
			defaults.server.port = vars.server.port || defaults.server.port;
			defaults.server.host = vars.server.host || defaults.server.host;
		}
		if(vars.site) {
			defaults.site.name    = vars.site.name    || defaults.site.name;
			defaults.site.uploads = vars.site.uploads || defaults.site.uploads;
		}
		if(vars.db) {
			defaults.db.name = vars.db.name || defaults.db.name;
			defaults.db.host = vars.db.host || defaults.db.host;
			defaults.db.port = vars.db.port || defaults.db.port;
			defaults.db.connectionString = vars.db.connectionString || process.env.MONGODB_URI || null;
		}

		app.locals.local  = defaults.local;
		app.locals.server = defaults.server;
		app.locals.paths  = defaults.paths;
		app.locals.site   = defaults.site;
		app.locals.db     = defaults.db;
	}


/* ----------------------------------------------------------------
 * $app
 * ---------------------------------------------------------------- */
	function App(vars) {
		parseOptions(vars);
		db.setup(app);
	}

	App.prototype.start = function() {

		async.series([

			/**
			 * Load templates into the options object
			 */
			function(callback) {
				helper.loadTemplates(app.locals.paths.deploymentDir, function(templates) {
					app.locals.templates = {
						all     : templates.templates,
						options : form.validateFields(templates.options)
					};
					callback(null, null);
				});
			},

			/**
			 * Find a user. If not then initialize the signup process
			 */
			function(callback) {
				db.User.findOne({}, function(err, user) {
					if(user) {
						app.locals.user = user;
						app.locals.site.isActive = true;
					}
					callback(null, null);
				});
			},

			/**
			 * Find site variables and cache them into the options object. If not found, create one
			 */
			function(callback) {
				db.Site.find({}, function(err, docs) {
					var doc = docs[0];
					if(!doc) {
						var site = new db.Site();
						site.name = defaults.site.name;
						site.save(function(err) {
							app.locals.templates.optionsID = site._id;
							app.locals.templates.optionsCache = '{}';
							callback(null, null);
						});
					} else {
						app.locals.templates.optionsID = doc._id;
						app.locals.templates.optionsCache = doc.metadata || '{}';
						app.locals.cache = {
							homepage : doc.homepage,
							errorpage : doc.errorpage
						};
						/**
						 * Set options here
						 */
						callback(null, null);
					}
				});
			}
		], function(err, results) {
			initializeRoutes();
		});

	}


	function initializeRoutes() {

		/**
		 * At this point, app.locals will contain:
		 * local           Local host and port
		 * server          Production host and port
		 * paths           Backend and deployment path
		 * site            Site name and isActive
		 * templates
		 *   all           All compiled templates
		 *   options       Options template
		 *   optionsID     OptionsID to update options
		 *   optionsCache  Options data
		 * user            Admin User data
		 * types           Content Types(Array)
		 *
		 * Now we will proceed to setup routes:-
		 */
		require(app.locals.paths.deploymentDir + '/main.js')(cms, app, db);

		/**
		 * Setup routes
		 * Note the order of routes
		 */
		
		// Express middleware
		appConfig.setup(app, express);

		// Backend routes
		app.use(app.locals.paths.backend, backend(app));

		// Frontend routes
		app.use(frontend(app));

		// Start server. Use host,port based on the env         
		if(app.get('env') === 'production') {
			app.listen(app.locals.server.port);
		} else {
			app.listen(app.locals.local.port);
		}  
	}


	module.exports = App;
	
})();
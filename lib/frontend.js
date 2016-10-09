/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * frontend.js
 * 
 * Contains all frontend routes
 * ---------------------------------------------------------------- */


(function() {

	'use strict';
	
	var express   = require('express');
	var _         = require('underscore');
	var appConfig = require('../config.js');
	var db        = require('./db.js');
	var helper    = require('./helper.js');
	var globals   = require('./globals.js');

	var router    = express.Router();


	/**
	 * Serves page
	 * @param  {Object} req  [express response object]
	 * @param  {Object} res  [Page object]
	 * @param  {Object} page [express request object]
	 */
	function servePage(req, res, page) {

		if(page) {
			res.locals.fields = '';
			if(page.metadata) {
				res.locals.fields = JSON.parse(page.metadata);
			}

			// Fetches options and sets them as globals
			var options = req.app.locals.templates.optionsCache || '{}';
			options = JSON.parse(options);
			res.locals.globals = options;
			res.locals.page = {
				dateCreated : page.dateCreated,
				dateModified : page.dateModified,
				id : page._id
			};

			// Sets requests
			// Why are we calling the below method? Find out
			var template = helper.findTemplate(req.app.locals.templates.all, page.template);

			// Send json if requested
			var contentType = req.headers['content-type'] || '';
			if(contentType === 'application/json' || contentType.indexOf('application/json') === 0) {
				res.type('json').status(200).json(res.locals);
			} else {
				if(!page.template) {
					page.template = 'index';
				}
				res.render(page.template);
			}
		} else {
			res.end(); // Setup a 404 handler here
		}
	}

	/**
	 * Middleware to set paths to the locals
	 */
	function setPaths(req, res, next) {
		res.locals.paths = req.app.locals.paths || {};
		res.locals.paths.site = req.protocol + '://' + req.get('host');
		next();
	}

	function setHeader(req, res, next) {
		next();
	}

	function setFooter(req, res, next) {
		next();
	}

	/**
	 * Middleware to check if a type exists
	 */
	function checkTypes(req, res, next) {
		var types = req.app.locals.types || [];
		var slug = '/' + req.params.type;
		var success = false;

		types.map(function(obj) {
			if(obj.slug === slug) {
				success = true;
				res.locals.type = {
					namePlural : obj.plural,
					name       : obj.name,
					//fields     : obj.typeFields,
					slug       : obj.slug,
					template   : obj.template
					//table      : obj.table || null,
					//queryLimit : obj.queryLimit || 10
				}
			}
		});

		if(success) {
			next();
		} else {
			res.send(404);
		}
	}

	var handler = {
		get : {
			page : function(req, res, next) {
				var slug = req.params.page;
				db.Page.findOne({
					slug : slug
				}, function(err, page) {
					if(page) {
						servePage(req, res, page);
					} else {
						next(); // It may be a content type
					}
				});
			},
			type : function(req, res, next) {
				console.log(req.path);
				var type = res.locals.type.name;
				res.locals.pageName = 'types';
				var pageNumber = 1;
				next();
			},
			typePage : function(req, res, next) {
				var type = res.locals.type.name;
				var slug = req.params.id;
				db[type].findById({_id : slug}, function(err, page) {

					if(err) throw err;

					if(page) {
						var template = {};
						//var fields = JSON.parse(JSON.stringify(res.locals.type.fields));
						//fields = helper.interpolateFieldData(fields, page);
						//res.locals.type.fields = fields;
						res.locals.pageName = 'type';
						var contentType = req.headers['content-type'] || '';
						if(contentType === 'application/json' || contentType.indexOf('application/json') === 0) {
							res.locals.page = page;
							res.type('json').status(200).json(res.locals);
						} else {
							var template = helper.findTemplate(req.app.locals.templates.all, page.template);
							/*helper.render(res, template, {
								fields : template,
								page : page,
								templates : req.app.locals.templates.all
							});*/
							res.render(res.locals.type.template);
						}
					} else {
						next();
					}
				});
			}
		},
		post : {

		}
	};


/* ----------------------------------------------------------------
 * $routes
 * ---------------------------------------------------------------- */
	module.exports = function(app) {

		/**
		 * Handles home page requests
		 */
		router.route('/')
			.all(setHeader)
			.all(setFooter)
			.all(setPaths)
			.get(function(req, res) {
				if(app.locals.cache.homepage) {
					db.Page.findById(app.locals.cache.homepage.id, function(err, page) {
						servePage(req, res, page);
					});
				} else {
					next();
				}
			});

		router.route('/:page')
			.all(setHeader)
			.all(setFooter)
			.get(handler.get.page);

		router.route('/:type')
			.all(checkTypes)
			.get(handler.get.type)
			//.post(handler.post.type)

		router.route('/:type/:id')
			.all(setHeader)
			.all(setFooter)
			.all(checkTypes)
			.all(setPaths)
			.get(handler.get.typePage)
			//.post(handler.post.page);

		/**
		 * Handles Content types
		 */
		router.get('/:type', function(req, res) {
			var slug = req.params.type;
			console.log(slug);
			res.send('huh?');
		});

		/**
		 * Handles single content type
		 */
		router.get('/:type/:id', function(req, res) {
			res.send(404)
		});

		/**
		 * Sets up static assets
		 */
		
		var path = app.locals.paths.deploymentDir + '/public';
		router.use('/public', express.static(path));

		return router;
	}
	
})();
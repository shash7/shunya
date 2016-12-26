/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * types.js
 *
 * Handles and serves custom Content Types
 * ---------------------------------------------------------------- */


(function() {

	'use strict';
	
	var express   = require('express');
	var _         = require('underscore');
	var appConfig = require('../config.js');
	var db        = require('./db.js');
	var helper    = require('./helper.js');
	
	var app        = express();
	var router     = express.Router();
	



/* ----------------------------------------------------------------
 * $routes
 * ---------------------------------------------------------------- */
	module.exports = function(app) {
		var handler = {
			post   : {},
			get    : {},
			delete : {}
		};

		/**
		 * Middleware to check if a type exists
		 */
		function checkTypes(req, res, next) {
			var types = app.locals.types || [];
			var slug = '/' + req.params.type;
			var success = false;

			types.map(function(obj) {
				if(obj.slug === slug) {
					success = true;
					res.locals.type = {
						namePlural : obj.plural,
						name       : obj.name,
						fields     : obj.typeFields,
						slug       : obj.slug,
						table      : obj.table || null,
						queryLimit : obj.queryLimit || 10
					}
				}
			});

			if(success) {
				next();
			} else {
				res.send(404);
			}
		}


		/* ----------------------------------------------------------------
 		 * $handlers
 		 * ---------------------------------------------------------------- */
		/**
		 * Gets pages root page
		 */
		handler.get.pages = function(req, res) {
			var type = res.locals.type.name;

			// Manual override
			res.locals.pageName = 'types';
			var pageNumber = 1;
			if(req.query.page) {
				pageNumber = req.query.page;
			}
			db[type].paginate({}, {page:pageNumber, limit:res.locals.type.queryLimit},function(err, data) {
				var pagination = {
					total : data.total,
					limit : data.limit,
					page  : data.page,
					pages : data.pages
				};
				helper.render(res, 'wrapper.html', {
					pages : data.docs,
					pagination : pagination
				});
			});
		};


		/**
		 * Creates a new page
		 */
		handler.post.pages = function(req, res) {
			var data = req.body;
			var typeName = res.locals.typeName;
			if(data.fields) {
				data = data.fields[0];
				data.dateCreated = new Date();
				var obj =  new db[typeName](data);
				obj.save(function() {
					res.send(obj);
				});
			} else {
				res.send(500);
			}
		};

		/**
		 * Finds and gets a single page
		 */
		handler.get.page = function(req, res) {
			var type = res.locals.type.name;
			var slug = req.params.id;
			db[type].findById({_id : slug}, function(err, page) {

				if(err) throw err;

				if(page) {
					var template = {};
					var fields = JSON.parse(JSON.stringify(res.locals.type.fields));
					fields = helper.interpolateFieldData(fields, page);
					res.locals.type.fields = fields;
					if(page.template) {
						template = helper.findTemplate(app.locals.templates.all, page.template);
						template = template.fields;
						template = helper.interpolateTemplateData(template, page.metadata);
					}
					console.log(template);
					res.locals.pageName = 'type';
					helper.render(res, 'wrapper.html', {
						fields : template,
						page : page,
						templates : app.locals.templates.all
					});
				} else {
					res.send(404);
				}
			});
		};

		/**
		 * Updates a single page
		 */
		handler.post.page = function(req, res) {
			var slug = req.params.id;
			var data = req.body;
			var type = res.locals.type.name;
			
			var fields = '';
			if(data.fields) {
				fields = JSON.stringify(data.fields[0]);
			}

			data.typeFields = data.typeFields || [];
			var typeFields = data.typeFields[0] || {};
			typeFields.metadata = fields;

			db[type].findOneAndUpdate({_id : slug}, {$set: typeFields}, function(err, doc) {
				if(doc) {
					req.flash('success', 'Document has been updated.');
				} else {
					req.flash('error', 'Something went wrong on our side, please try again.');
				}
				res.redirect('back');
			});
		};

		/**
		 * Deletes a single page
		 */
		handler.delete.page = function(req, res) {
			var slug = req.params.page;
			db.Page.remove({slug: slug}, function(err) {
				res.redirect(app.locals.paths.backend + '/pages');
			});
			res.send(200);
		};


		/* ----------------------------------------------------------------
		 * $routes
 		 * ---------------------------------------------------------------- */
		router.route('/:type')
			.all(checkTypes)
			.get(handler.get.pages)
			.post(handler.post.pages)

		router.route('/:type/:id')
			.all(checkTypes)
			.get(handler.get.page)
			.post(handler.post.page);

		return router;
	}
	
})();
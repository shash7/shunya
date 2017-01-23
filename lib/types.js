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
		 * Middle to set query in the locals
		 */
		function setQuery(req, res, next) {
			var i = req.url.indexOf('?');
			var query = (i>=0)?req.url.slice(i+1):'';
			res.locals.query = {
				query : req.query,
				raw   : query
			};
			next();
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
			var search = '';
			var query = {};
			if(req.query.page) {
				pageNumber = req.query.page;
			}
			if(req.query.search) {
				search = req.query.search;
			}
			if(search) {
				query = {
					$text: {
						$search: search
					}
				}
			}
			db[type].paginate(query, {page:pageNumber, limit:res.locals.type.queryLimit},function(err, data) {
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

					if(res.locals.type.pageTitle) {
						res.locals.type.pageTitle = page[res.locals.type.pageTitle];
					} else {
						res.locals.type.pageTitle = page._id;
					}

					var template = {};
					var fields = JSON.parse(JSON.stringify(res.locals.type.fields));
					fields = helper.interpolateFieldData(fields, page);
					res.locals.type.fields = fields;
					if(page.template) {
						template = helper.findTemplate(app.locals.templates.all, page.template);
						template = template.fields;
						template = helper.interpolateTemplateData(template, page.metadata);
					}

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
					req.flash('success', type + ' '+ doc._id + ' has been updated.');
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
			.all(setQuery)
			.get(handler.get.pages)
			.post(handler.post.pages)

		router.route('/:type/:id')
			.all(setQuery)
			.get(handler.get.page)
			.post(handler.post.page);

		return router;
	}
	
})();
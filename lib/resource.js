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
	var helper    = require('./helper.js');
	var form      = require('./fields.js');
	var util      = require('util');
	
	var app          = express();
	var router       = express.Router();




	/* ----------------------------------------------------------------
	 * $archive
	 * Archive page routes
	 * ---------------------------------------------------------------- */
	function archive (resourceName) {
		return {
			get : function(req, res) {
				var pageNumber = 1;
				if(req.query.page) {
					pageNumber = req.query.page;
				}
				db[resourceName].paginate({}, {page:pageNumber, limit:10},function(err, data) {

					if(err) throw err;

					if(!data) res.status(404);	
					var pagination = {
						total : data.total,
						limit : data.limit,
						page  : data.page,
						pages : data.pages
					};
					helper.render(res, 'wrapper.html', {
						pages      : data.docs,
						pagination : pagination
					});
				
				});
			},

			post : function(req, res) {
				if(req.body.title) {
					var obj = {
						title       : req.body.title,
						metadata    : '',
						template    : '',
						dateCreated : new Date(),
						homepage    : false
					};
					var page = new db[resourceName](obj);
					page.save(function() {
						res.send(page);
					});
				} else {
					res.send(500);
				}
			},

			put : function(req, res) {
				res.end();
			},

			delete : function(req, res) {
				res.end();
			}
		}
	}


	/* ----------------------------------------------------------------
	 * $page
	 * Single page routes
	 * ---------------------------------------------------------------- */
	function page(resourceName) {
		return  {
			get : function(req, res) {
				var slug = req.params.page;
				db[resourceName].findById({_id : slug}, function(err, page) {

					if(err) throw err;

					if(page) {
						var template = [];

						if(res.locals.resource.pageTitle) {
							res.locals.vars.pageTitle = page[res.locals.resource.pageTitle];
						} else {
							res.locals.vars.pageTitle = page._id;
						}

						if(page.template) {
							
							// Important to note that we're gonna clone dis, not reference
							template = helper.findTemplate(req.app.locals.templates.all, page.template);

							// Get the unmodified template and pass it to the front end in case they need it
							var rawTemplate = JSON.stringify(template);

							template = template.fields;

							//console.log(util.inspect(template, {showHidden: false, depth: null}));
							
							// Parse json into data and merge it with the template
							var metadata = page.metadata || '{}';
							metadata = JSON.parse(metadata);
							template = form.interpolateFields(template, metadata);
						}
						helper.render(res, 'wrapper.html', {
							fields : template,
							rawTemplate : rawTemplate,
							page : page,
							templates : req.app.locals.templates.all
						});
					} else {
						res.send(404);
					}
				});
			},

			post : function() {
				var slug = req.params.page;
				var data = req.body;
				
				var fields = '';
				//console.log('-----');
				//console.log(util.inspect(data.fields, {showHidden: false, depth: null}));
				if(data.fields) {
					fields = JSON.stringify(data.fields[0]);
				}
				data.metadata = fields;
				db[resourceName].findOneAndUpdate({_id : slug}, data, function(err, doc) {
					if(doc) {
						req.flash('success', 'Document has been updated.');
						res.redirect('back');
					} else {
						res.send(300);
					}
				});
			},

			put : function(req, res) {
				res.end();
			},

			delete : function(req, res) {
				var slug = req.params.page;
				console.log(slug + ' deleted.');
				db[resourceName].remove({_id: slug}, function(err) {
					if(err) {
						throw err;
					}
					req.flash('success', 'Page has been deleted.');
					res.redirect(req.app.locals.paths.backend + '/pages');
				});
			}
		}
	}


	var middleware = {
		setPageNumber : function(req, res, next) {
			res.locals.vars = res.locals.vars || {};
			var pageNumber = 1;
			if(req.query.page) {
				pageNumber = req.query.page;
			}
			res.locals.vars.pageNumber = pageNumber;
			next();
		},
		setQuery : function(req, res, next) {
			var i = req.url.indexOf('?');
			var query = (i>=0)?req.url.slice(i+1):'';
			res.locals.query = {
				query : req.query,
				raw   : query
			};
			next();
		}
	}


	function Resource(obj) {
		this.vars    = obj;
		this.router  = express.Router();
		this._setRoutes();
	}

	Resource.prototype.getVars = function() {
		return this.vars;
	}

	Resource.prototype._setRoutes = function() {
		this.archive = archive(this.vars.name);
		this.page = page(this.vars.name);
	}


	Resource.prototype.start = function() {
		this.router.route('/')
			.all(middleware.setPageNumber)
			.all(middleware.setQuery)
			.get(this.archive.get)
			.post(this.archive.post)
			.put(this.archive.put)
			.delete(this.archive.delete);

		this.router.route('/:page')
			.all(middleware.setQuery)
			.get(this.page.get)
			.post(this.page.post)
			.put(this.page.put)
			.delete(this.page.delete);

		return this.router;
	}

	module.exports = Resource;
	
})();
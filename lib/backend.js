/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * backend.js
 * 
 * Contains all backend routes
 * ---------------------------------------------------------------- */


(function() {

	'use strict';
	
	var express   = require('express');
	var _         = require('underscore');
	var appConfig = require('../config.js');
	var db        = require('./db.js');
	var helper    = require('./helper.js')
	var shortid   = require('shortid');
	var globals   = require('./globals.js');
	var form      = require('./fields.js');
	var auth      = require('./auth.js');
	var Resource  = require('./resource.js');
	var nav       = require('./nav.js');

	var router     = express.Router();
	
/* ----------------------------------------------------------------
 * $routes
 * ---------------------------------------------------------------- */
	module.exports = function(app, resources) {


		/**
		 * Setup nav
		 */
		nav.setup(resources);

		/**
		 * Initiate resource routers
		 */
		var routers = [];
		resources.map(function(resource) {
			if(resource.type === 'resource') {
				routers.push(new Resource(resource));
			}
		});


		/**
		 * Initiate types routes
		 */
		var typeRouter = require('./types.js')(app);


		// -------- Backend handler -------- //
		var handler = {
			get : {},
			post : {},
			middleware : {}
		};

		handler.get.login = function(req, res) {
			if(req.isSignedIn()) {
				res.redirect(app.locals.paths.backend);
			} else {
				helper.render(res, 'login.html');
			}
		};

		handler.get.logout = function(req, res) {
			req.logout();
			res.redirect('/');
		};

		handler.get.signup = function(req, res) {
			if(!app.locals.site.isActive) {
				helper.render(res, 'signup.html');
			} else {
				res.redirect(app.locals.paths.backend);
			}
		};

		handler.auth = function(req, res, next) {
			if(req.isSignedIn()) {
				res.locals.user = req.session.user;
				return next();
			} else {
				res.redirect(req.protocol + '://' + req.get('host') + app.locals.paths.backend + '/login');
			}
		}
		// -------- Backend handler END -------- //
		

		// -------- Middleware -------- //
		handler.middleware.setupBodyClasses = function(req, res, next) {
			var path  = req.originalUrl;
			path      = path.split('?')[0]; // Remove querystring if any
			var arr   = path.split('/');

			var type  = ''; // Type of page. Eg: root, page, subpage, etc.
			var name  = ''; // Name of the page template. Can be overriden later on
			var len   = arr.length; // Not needed
			var page  = ''; // The name of the resource

			var temp = arr[len - 1];
			if(!temp[temp.length - 1]) {
				arr.pop(len - 1);
				len -= 1;
			}
			var info = '';

			// 2 : root /
			// 3 : Either a single page or pages/types root /page
			// 4 : Subpage of pages or a single type /page/subpage
			// 5 : Type subpage
			if(len === 2) {        // ROOT
				type = 'root';
				name = 'dashboard';
				page = name;
				info = helper.findInResource('Dashboard', resources);
			} else if(len === 3) { // PAGE
				type = 'page';
				info = helper.findInResource('/' + arr[2], resources, 'slug');
				page = info.name || '';
				if(info.type === 'resource') {
					name = 'resources';
				} else if(info.type === 'page') {
					name = 'page';
				} else if(arr[2] === 'login' || arr[2] === 'signup') {
					name = arr[2];
				} else {
					name = 'types';
				}
				name = info.template || name;
			} else if(len === 4) { // SUBPAGE
				type = 'subpage';
				info = helper.findInResource('/' + arr[2], resources, 'slug');
				page = info.name || '';
				if(info.type === 'resource') {
					name = 'resource';
				} else if(info.type === 'page') {
					name = 'page';
				} else {
					name = 'types';
				}
				name = info.template || name;
			}

			path = req.app.locals.paths.backend;

			// Check if path contains backslash. Just in case..
			if(path[0] === '/') {
				path = path.substr(1);
			}

			var bodyClasses = [
				'admin',
				'path-' + path,
				type,
				name,
				page
			];

			// Attach vars to locals and pass along
			res.locals.pageName     = name;
			res.locals.bodyClasses  = bodyClasses.join(' ');
			res.locals.resource     = info;
			res.locals.vars         = res.locals.vars || {};
			res.locals.vars.rawSlug = '/' + arr[arr.length - 1];
			
			next();
		}
		handler.middleware.paths = function(req, res, next) {
			res.locals.site = req.app.locals.site;
			res.locals.paths = {
				host    : req.protocol + '://' + req.get('host'),
				backend : req.protocol + '://' + req.get('host') + req.app.locals.paths.backend,
				url     : req.originalUrl
			};

			// Set flash variables
			res.locals.messages = req.flash();

			next();
		}
		handler.middleware.checkTypes = function(req, res, next) {
			var types = res.app.locals.types || [];
			var slug = res.locals.vars.rawSlug;
			var success = false;

			types.map(function(obj) {
				if(obj.slug === slug) {
					success = true;
					res.locals.type = {
						namePlural : obj.plural,
						name       : obj.name,
						fields     : obj.typeFields,
						slug       : obj.slug,
						table      : obj.table      || null,
						queryLimit : obj.queryLimit || 10,
						search     : obj.search     || {},
						pageTitle  : obj.pageTitle  || null,
						color      : obj.color      || null
					}
				}
			});
			if(success) {
				next();
			} else {
				if (req.xhr || req.headers.accept.indexOf('json') > -1) {
					res.send(404);
				} else {
					helper.render(res, 'wrapper.html', {
						pageName : '404',
						content : res.locals.vars.rawSlug || 'undefined'
					});
				}
			}
		}
		// -------- Middleware END -------- //
		

		// -------- Backend routes -------- //
		router.route('/login')
			.all(handler.middleware.paths)
    	.all(handler.middleware.setupBodyClasses)
			.get(handler.get.login)
			.post(auth.login);
		
		router.route('/signup')
			.all(handler.middleware.paths)
			.get(handler.get.signup)
			.post(auth.signup);

    router.get('/logout', auth.logout);
		// -------- Backend routes END -------- //
		

		/**
		 * Page class
		 * Provides defaults for page routes.
		 */
		function Page(resource) {
			this.resource    = resource;
			this.routes      = this._init()
			this.middleware = function(req, res, next) {
				next();
			}
			this.generic = function(req, res, next) {
				next();
			}
		}

		Page.prototype._init = function() {
			return {
				get : function(req, res) {
					res.end();
				},
				post : function(req, res) {
					res.end();
				},
				put : function(req, res) {
					res.end();
				},
				delete : function(req, res) {
					res.end();
				}
			}
		}

		Page.prototype.setMiddleware = function(fx) {
			this.middleware = fx;
		}

		Page.prototype.setRoutes = function(obj) {
			if(obj.get) {
				this.routes.get = obj.get;
			}
			if(obj.post) {
				this.routes.post = obj.post;
			}
			if(obj.put) {
				this.routes.put = obj.put;
			}
			if(obj.delete) {
				this.routes.delete = obj.delete;
			}
		}


		var pages = [

			/**
			 * Dashboard
			 */
			{
				name : 'Dashboard',
				get : function(req, res) {
					if(app.locals.site.isActive) {
						var pageName = 'dashboard';
						db.getStats(function(stats) {
							var port = app.locals.local.port;
							if(app.get('env') === 'production') {
								port = app.locals.server.port;
							}
							var widgets = {
								stats : stats,
								env   : app.get('env'),
								port  : port
							};
							helper.render(res, 'wrapper.html', {
								page : 'dashboard',
								widgets : widgets
							});
						});
					} else {
						res.redirect(req.protocol + '://' + req.get('host') + app.locals.paths.backend + '/signup');
					}
				}
			},

			/**
			 * Options page
			 */
			{
				name : 'Options',
				get : function(req, res) {
					var options = app.locals.templates.optionsCache;
					if(typeof options === 'string') {
						options = JSON.parse(options);
					}
					options = form.interpolateFields(app.locals.templates.options,options)
					res.locals.fields = options;
					res.locals.homepage = app.locals.cache.homepage;
					res.locals.errorpage = app.locals.cache.errorpage;
					helper.render(res, 'wrapper.html');
				},
				post : function(req, res) {
					var data = req.body.fields;
					var id   = app.locals.templates.optionsID;
					var temp = helper.parseOptionsFields(req.body);
					if(data) {
						app.locals.templates.optionsCache = JSON.parse(JSON.stringify(data[0]));
						data = JSON.stringify(data[0]);
						var update = {
							metadata : data,
						};
						if(temp.homepage) {
							app.locals.cache.homepage = temp.homepage;
							update.homepage = temp.homepage;
						}
						if(temp.errorpage) {
							app.locals.cache.errorpage = temp.errorpage;
							update.errorpage = temp.errorpage;
						}
						db.Site.update({_id : id}, update, function(err, doc) {
							if(doc) {
								res.redirect('back');
							}
						});
					} else {
						res.redirect('back');
					}
				}
			},

			/**
			 * Settings page
			 */
			{
				name : 'Settings',
				get : function(req, res) {
					var options = app.locals.templates.optionsCache;
					if(typeof options === 'string') {
						options = JSON.parse(options);
					}
					options = form.interpolateFields(app.locals.templates.options,options)
					res.locals.fields = options;
					helper.render(res, 'wrapper.html');
				},
				post : function(req, res) {
					var data = req.body.fields;
					var id   = app.locals.templates.optionsID;
					if(data) {
						app.locals.templates.optionsCache = JSON.parse(JSON.stringify(data[0]));
						data = JSON.stringify(data[0]);
						db.Site.update({_id : id}, {metadata: data}, function(err, doc) {
							if(doc) {
								res.redirect('back');
							}
						});
					} else {
						res.redirect('back');
					}
				}
			}
		];
		

		/**
		 * Sets up admin pages routes
		 */
		resources.map(function(resource) {
			if(resource.type === 'page') {

				var page = new Page(resource);

				pages.map(function(p) {
					if(p.name === page.resource.name) {
						page.setRoutes(p);
					}
				});

				router.route(page.resource.slug)
					.all(handler.auth)
					.all(handler.middleware.paths)
					.all(handler.middleware.setupBodyClasses)
					.all(nav.nav)
					.all(page.middleware)
					.all(page.generic)
					.get(page.routes.get)
					.post(page.routes.post)
					.put(page.routes.put)
					.delete(page.routes.delete)
			}
		});


		/**
		 * Setup resource routes
		 */
		routers.map(function(r) {
			router.use(r.getVars().slug,
				[
					handler.auth,
					handler.middleware.paths,
					handler.middleware.setupBodyClasses,
					nav.nav
				],
				r.start()
			);
		});

		/**
		 * Sets static file routes
		 */
		router.use(express.static(__dirname + '/../public'));

		/**
		 * Sets up types router
		 */
		router.use('/', [
			handler.auth,
			handler.middleware.paths,
			handler.middleware.setupBodyClasses,
			nav.nav,
			handler.middleware.checkTypes
		], typeRouter);


		return router;
	}
	
})();
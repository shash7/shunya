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

	var router     = express.Router();
	
	
/* ----------------------------------------------------------------
 * $routes
 * ---------------------------------------------------------------- */
	module.exports = function(app) {


		var pageRouter = require('./pages.js')(app);
		var typeRouter = require('./types.js')(app);

		// -------- Backend handler -------- //
		var handler = {
			get : {},
			post : {}
		};


		/**
		 * Renders dashboard
		 */
		handler.get.dashboard = function(req, res) {
			if(app.locals.site.isActive) {
				var pageName = 'dashboard';
				db.getStats(function(stats) {
					var widgets = {
						stats : stats
					};
					helper.render(res, 'wrapper.html', {
						page : 'dashboard',
						widgets : widgets
					});
				});
			} else {
				res.redirect(req.protocol + '://' + req.get('host') + app.locals.paths.backend + '/signup');
			}
		};

		/**
		 * Renders login page
		 */
		handler.get.login = function(req, res) {
			if(req.isSignedIn()) {
				res.redirect(app.locals.paths.backend);
			} else {
				helper.render(res, 'login.html');
			}
		};

		/**
		 * Renders options page
		 */
		handler.get.options = function(req, res) {
			var options = app.locals.templates.optionsCache;
			if(typeof options === 'string') {
				options = JSON.parse(options);
			}
			options = form.interpolateFields(app.locals.templates.options,options)
			res.locals.fields = options;
			res.locals.homepage = app.locals.cache.homepage;
			res.locals.errorpage = app.locals.cache.errorpage;
			helper.render(res, 'wrapper.html');
		};

		handler.post.options = function(req, res) {
			var data = req.body.fields;
			var id   = app.locals.templates.optionsID;
			console.log(req.body);
			if(data) {
				app.locals.templates.optionsCache = JSON.parse(JSON.stringify(data[0]));
				data = JSON.stringify(data[0]);
				var update = {
					metadata : data,
				};
				if(req.body.homepage) {
					update.homepage = req.body.homepage;
				}
				if(req.body.errorpage) {
					update.errorpage = req.body.errorpage;
				}
				db.Site.update({_id : id}, update, function(err, doc) {
					if(doc) {
						res.redirect('back');
					}
				});
			} else {
				res.redirect('back');
			}
			
		};


		/**
		 * Renders settings page
		 */
		handler.get.settings = function(req, res) {
			var options = app.locals.templates.optionsCache;
			if(typeof options === 'string') {
				options = JSON.parse(options);
			}
			options = form.interpolateFields(app.locals.templates.options,options)
			res.locals.fields = options;
			helper.render(res, 'wrapper.html');
		};

		handler.post.settings = function(req, res) {
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



		// -------- Backend routes -------- //
		router.route('/login')
    	.all(helper.setupVars)
			.get(handler.get.login)
			.post(auth.login);
		
		router.route('/signup')
			.get(handler.get.signup)
			.post(auth.signup);

    router.get('/logout', auth.logout);

    router.route('/')
    	.all(handler.auth)
    	.all(helper.setupVars)
			.get(handler.get.dashboard);

		router.route('/options')
			.all(handler.auth)
    	.all(helper.setupVars)
			.get(handler.get.options)
			.post(handler.post.options);

		router.route('/settings')
			.all(handler.auth)
    	.all(helper.setupVars)
			.get(handler.get.settings)
			//.post(handler.post.options);
		// -------- Backend routes END -------- //
		

		router.use('/pages', [handler.auth, helper.setupVars], pageRouter);
		router.use(express.static(__dirname + '/../public'));
		router.use('/', [handler.auth, helper.setupVars], typeRouter);

		

		router.use('*', function(req, res) {
			res.send(404);
		});

		return router;
	}
	
})();
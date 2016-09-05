/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * auth.js
 * 
 * Handles user authentication and sessions
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


/* ----------------------------------------------------------------
 * $routes
 * These are all middlewares
 * ---------------------------------------------------------------- */
	module.exports = {

		// set
		init : function(req, res, next) {
			req.isSignedIn = function() {
				if(req.session.user) {
					return true;
				} else {
					return false;
				}
			}
			next();
		},

		// post
		login : function(req, res, next) {
			var email = req.body.email;
			var password = req.body.password;
			db.User.findOne({email : email}, function(err, user) {
				if (err) {
					req.flash('error', 'Something went wrong on our side. Apologies for that.');
					res.redirect(req.app.locals.paths.backend + '/login');
				}
				if (!user || user.length === 0) {
					req.flash('error', 'Incorrect email');
					res.redirect(req.app.locals.paths.backend + '/login');
				}
				if (user) {
					if(!user.validPassword(password)) {
 						req.flash('error', 'Wrong password');
						res.redirect(req.app.locals.paths.backend + '/login');
					} else {
						req.session = null;
					
						user.password = null;
						req.session = {
							user : user
						};
						res.redirect(req.app.locals.paths.backend);
					}
				}
			});
		},

		// get
		logout : function(req, res, next) {
			console.log(req.session);
			req.session = null;
			res.redirect(req.app.locals.paths.backend + '/login');
			
		},

		// post
		signup : function(req, res, next) {
			var email = req.body.email || '';
			db.User.findOne({ 'email' :  email }, function(err, user) {
				// if there are any errors, return the error
				if (err) {
					req.flash('message', 'Something went wrong on our side. Apologies for that.');
					res.redirect(req.app.locals.paths.backend + '/signup');
				}

				if (user) {
					req.flash('message', 'That email is already taken. Use another one.');
					res.redirect(req.app.locals.paths.backend + '/signup');
				} else {
					// if there is no user with that email
					// create the user
					var newUser            = new db.User();

					// set the user's local credentials
					newUser.name     = req.body.name;
					newUser.email    = email;
					newUser.password = newUser.generateHash(password);
					newUser.date     = new Date();

					// save the user
					newUser.save(function(err) {
						if (err)
							throw err;

						req.app.locals.site.isActive = true;
						res.redirect(req.app.locals.paths.backend);
					});
				}

			});
		}
	}
	
})();
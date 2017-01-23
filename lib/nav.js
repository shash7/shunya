/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * nav.js
 * 
 * Exposes a single middleware used to construct the sidebar navigation
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

	var resources = [];


	/* ----------------------------------------------------------------
	 * Middleware
	 * ---------------------------------------------------------------- */
	 module.exports = {
	 	setup : function(res) {
	 		resources = res;
	 	},
	 	nav : function(req, res, next) {
	 		var types = res.app.locals.types || null;
			var arr = [];
			var temp = '';
			resources.map(function(resource) {
				if(resource.name === 'Page' && types) {
					types.map(function(type) {
						arr.push({
							name    : type.name,
							slug    : type.slug,
							navName : type.navName
						});
					});
				}
				arr.push(resource);
			});

			// Cause we'll be deleting references to the original object later on.
			arr = JSON.parse(JSON.stringify(arr));

			// Check which one is active
			arr = arr.map(function(item) {
				item.active = false;
				if(res.locals.vars.rawSlug === item.slug) {
					item.active = true;
				}

				// Special usecase for root
				temp = res.locals.paths.url;
				if(temp[temp.length - 1] === '/') {
					temp = temp.slice(0, -1);
				}
				if(res.locals.vars.rawSlug === temp && item.slug === '/') {
					item.active = true;
				}

				// A bit of cleaning
				if(item.table) delete item.table;
				if(item.description) delete item.description;
				if(item.queryLimit) delete item.queryLimit;
				if(item.search) delete item.search;

				return item;
			});
			console.log(res.locals.resource);
			res.locals.nav = arr;
			next();
	 	}
	 }


})();
/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * filters.js
 * 
 * Contains default filters
 * ---------------------------------------------------------------- */


(function() {

	'use strict';

	var YAML      = require('yamljs');
	var fs        = require('fs');
	var async     = require('async');
	var _         = require('underscore');
	var nunjucks  = require('nunjucks');
	var moment    = require('moment');
	var shortid   = require('shortid');
	var form      = require('./fields.js');


	module.exports = [
	{
		name : 'dump',
		fx   : function(obj) {
			var str = '<script>console.log(' + JSON.stringify(obj) + ');</script>';
			return str;
		},
	},
	{
		name : 'render',
		fx   : function(obj) {
			var str = JSON.stringify(obj, null, "\t");
			str = '<pre><code>' + str + '</pre></code>';
			return str;
		}
	},
	{
		name : 'renderDate',
		fx   : function(obj) {
			return moment(obj).format("Do MMMM YYYY");
		}
	},
	{
		name : 'generateId',
		fx   : function(obj) {
			return obj + '_' + shortid.generate();
		}
	},
	{
		name : 'renderFormattedDate',
		fx   : function() {
			return moment().format("dddd, MMMM") + " the " + moment().format("Do, h:mma");
		}
	},
	{
		name : 'format',
		fx   : function(obj, str) {
			return moment(obj).format(str);
		}
	},
	{
		name : 'setObject',
		fx   : function(obj, str) {
			if(str) {
				return obj = str;
			} else {
				return obj;
			}
		}
	},
	{
		name : 'removeSlash',
		fx   : function(val) {
			if(val[0] === '/' || val[0] === '\\') {
				val = val.substr(1);
			}
			return val;
		}
	}
	];

	
})();
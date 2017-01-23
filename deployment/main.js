#!/bin/env node

/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * index.js
 * 
 * Boots the server
 * ---------------------------------------------------------------- */

(function() {

	//var Chance = require('chance');

	function generatePictures(limit) {
		var chance = new Chance();
		var arr = [];
		limit = limit || 50;
		for(var i = 0; i < limit; i++) {
			arr.push({
				title       : chance.word(),
				author      : chance.name({ nationality: "it" }),
				description : chance.paragraph(),
				dateCreated : new Date(chance.date())
			});
		}
		return arr;
	}
	
	module.exports = function(cms, app, db) {

		var obj = {

			name      : 'Picture',   // Will be used for creating the database
			plural    : 'Pictures',  // Will be used in the backend UI
			slug      : '/pictures', // Will be used in creating urls
			navName   : 'Pictures',   // Optional; Will be used for the menu name
			schema : {
 				title : {
 					type      : String,
 					default   : 'Post title',
 					fieldType : 'text'
 				},
 				author : {
 					type      : String,
 					fieldType : 'text'
 				},
 				description : {
 					type      : String,
 					fieldType : 'textarea'
 				},
 				alignment : {
 					type : String,
 					fieldType : 'table'
 				}
 			},

 			table : [
 				{
 					name  : 'Title',
 					field : 'title'
 				},
 				{
 					name : 'Author',
 					field : 'author'
 				},
 				{
 					name  : 'Date Created',
 					field : 'dateCreated',
 					align : 'right',
 					type  : Date
 				}
 			],

 			queryLimit : 10,
 			template : 'about',
 			archiveTemplate : 'index',
 			pageTitle : 'title',
 			
 			search : {
 				field : 'title'
 			}

		};

		//cms.defineType(obj);

		//cms.addDocuments('Picture', generatePictures(10000));
	}

})();
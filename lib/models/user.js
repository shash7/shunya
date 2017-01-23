/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * routes.js
 * 
 * Contains all routes
 * ---------------------------------------------------------------- */


(function() {

	'use strict';
	
	var mongoose         = require('mongoose');
	var mongoosePaginate = require('mongoose-paginate');
	var bcrypt           = require('bcrypt-nodejs');

	/**
	 * 2 types of roles by default
	 * admin  : All access everywhere
	 * editor : [read, create, edit, delete], [pages] 
	 *
	 * Default permissions - read, create, edit, delete
	 */
	var schema = new mongoose.Schema({
		name        : String,
		email       : String,
		password    : String,
		dateCreated : Date,
		fields      : {},
		role        : String
	});

	schema.plugin(mongoosePaginate);

	schema.methods.generateHash = function(password) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};

	// checking if password is valid
	schema.methods.validPassword = function(password) {
		return bcrypt.compareSync(password, this.password);
	};

	module.exports = mongoose.model('User', schema);
	
})();
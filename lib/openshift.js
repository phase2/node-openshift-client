/*
 * node-openshift-client
 * https://github.com/shekhargulati/node-openshift-client
 *
 * Copyright (c) 2013 Shekhar Gulati
 * Licensed under the MIT license.
 */

'use strict';

var request = require('request');

var BASE_URL = "https://openshift.redhat.com/broker/rest/";

module.exports = OpenShift;

function OpenShift(options){
	this.options = options;
	this.credentials = new Buffer(options.username +":" + options.password).toString('base64');
}

OpenShift.prototype.authorizationToken = function(){
	request.post(options(this.credentials , 'user/authorizations', {scope:'session'}) , callback);
};

OpenShift.prototype.showUser = function() {
	request.get(options(this.credentials , 'user'),callback);
};

OpenShift.prototype.listDomains = function(){
	request.get(options(this.credentials,'domains') , callback);
};

OpenShift.prototype.createDomain = function(){
	request.post(options(this.credentials , 'domains' , {id:"shekhargulati"}) , callback);
}

function options(credentials , rest_url_fragment , form_data){
	var options = {
	  url : BASE_URL + rest_url_fragment,
	  headers : {
	    'Accept' : 'application/json',
	    'Authorization' : 'Basic ' + credentials
	  },
	  form : form_data
  	};
  	return options;
}

function callback(error, response, body) {
	if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
        var info = JSON.parse(body);
       	console.log(info);
    }else{
    	console.log("Error Response code : "+response.statusCode);
    	var info = JSON.parse(body);
       	console.log(info.messages[0].text);
    }
 };
/*
 * node-openshift-client
 * https://github.com/shekhargulati/node-openshift-client
 *
 * Copyright (c) 2013 Shekhar Gulati
 * Licensed under the MIT license.
 */

'use strict';

var qs = require('qs');

function OpenShift(config){
  this.config = config;
  this.config.credentials = new Buffer(config.username + ":" + config.password).toString('base64');
  this.config.base_url = config.base_url ? config.base_url : "https://openshift.redhat.com/broker/rest/";
  this.options = function (rest_url_fragment, data, method){
    var optionsObj = {
      method : method || 'GET',
      url : this.config.base_url + rest_url_fragment,
      headers : {
        'Accept' : 'application/json',
        'Authorization' : 'Basic ' + this.config.credentials
      },
      form : data
    };

    return optionsObj;
  }
}

function noop() {}

OpenShift.prototype.authorizationToken = function(resultCallback){
  this._request(this.options('user/authorizations', {scope:'session'},'POST'),resultCallback);
};

OpenShift.prototype.showUser = function(resultCallback) {
  this._request(this.options('user'),resultCallback);
};

OpenShift.prototype.listDomains = function(resultCallback){
  this._request(this.options('domains'),resultCallback);
};

OpenShift.prototype.createDomain = function(domain_name , resultCallback){
  this._request(this.options('domains' , {id:domain_name},'POST'),resultCallback);
};

OpenShift.prototype.viewDomainDetails = function(domain_name, resultCallback){
  this._request(this.options('domains/'+domain_name),resultCallback);
};

OpenShift.prototype.updateDomain = function(old_domain_name , new_domain_name,resultCallback){
  this._request(this.options('domains/'+old_domain_name , {id : new_domain_name},'PUT'), resultCallback);
};

OpenShift.prototype.deleteDomain = function(domain_name , resultCallback){
  var force = true;
  this._request(this.options('domains/'+domain_name, {force : force},'DELETE'), resultCallback);
};

OpenShift.prototype.listApplications = function(domain_name , resultCallback){
  var rest_url_fragment = 'domains/'+ domain_name+ '/applications';
  this._request(this.options(rest_url_fragment), resultCallback);
};

OpenShift.prototype.listApplicationsAndCartridges = function(domain_name , resultCallback){
  var rest_url_fragment = 'domains/'+ domain_name+ '/applications?include=cartridges';
  this._request(this.options(rest_url_fragment), resultCallback);
};

OpenShift.prototype.createApplication = function(domain_name, app_options, resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications';
  this._request(this.options(rest_url_fragment , app_options,'POST') , resultCallback);
};

OpenShift.prototype.viewApplicationDetails = function(domain_name,app_name ,resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications/'+app_name;
  this._request(this.options(rest_url_fragment),resultCallback);
};

OpenShift.prototype.startApplication = function(domain_name,app_name, resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications/'+app_name+'/events';
  this._request(this.options(rest_url_fragment,{event:'start'},'POST'),resultCallback);
};

OpenShift.prototype.stopApplication = function(domain_name,app_name, resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications/'+app_name+'/events';
  this._request(this.options(rest_url_fragment,{event:'stop'},'POST'),resultCallback);
};

OpenShift.prototype.forceStopApplication = function(domain_name,app_name, resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications/'+app_name+'/events';
  this._request(this.options(rest_url_fragment,{event:'force-stop'},'POST'),resultCallback);
};

OpenShift.prototype.restartApplication = function(domain_name,app_name, resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications/'+app_name+'/events';
  this._request(this.options(rest_url_fragment,{event:'restart'},'POST'),resultCallback);
};

OpenShift.prototype.deleteApplication = function(domain_name , app_name, resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications/'+app_name;
  this._request(this.options(rest_url_fragment,null, 'DELETE'),resultCallback);
};

OpenShift.prototype.scaleUpApplication = function(domain_name , app_name, resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications/'+app_name+'/events';
  this._request(this.options(rest_url_fragment,{event:'scale-up'},'POST'),resultCallback);
};

OpenShift.prototype.scaleDownApplication = function(domain_name , app_name, resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications/'+app_name+'/events';
  this._request(this.options(rest_url_fragment,{event:'scale-down'},'POST'),resultCallback);
};

OpenShift.prototype.listCartridges = function(resultCallback){
  this._request(this.options('cartridges'), resultCallback);
};

OpenShift.prototype.addCartridge = function(domain_name,app_name, cartridge_name, resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications/'+app_name+'/cartridges';
  this._request(this.options(rest_url_fragment,{cartridge: cartridge_name},'POST'),resultCallback);
};

OpenShift.prototype.viewCartridgeDetails = function(domain_name,app_name, cartridge_name, resultCallback){
  var rest_url_fragment = 'domains/'+domain_name+'/applications/'+app_name+'/cartridges/'+cartridge_name;
  this._request(this.options(rest_url_fragment), resultCallback);
};

OpenShift.prototype._request = function(options, callback) {
  var request_options = require('url').parse(options.url);
  for (var i in options) {
    if (i != 'url') {
      request_options[i] = options[i];
    }
  }

  callback = callback || noop;
  var http = (request_options.protocol == 'https:') ? require('https') : require('http');
  var req = http.request(request_options, function(res) {
    res.on('data', function(body) {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return callback(new Error((body && body.error) || 'HTTP ' + res.statusCode), body || {});
      }
      callback(null, body || {});
    });
  });
  req.on('error', function(err) {
    return callback(err, undefined);
  });

  if (request_options.method == 'POST') {
    var data = '';
    if (typeof request_options.form == 'string' || request_options.form instanceof String) {
      // Stupid qs.
      data = request_options.form;
    }
    else {
      data = qs.stringify(request_options.form);
    }

    req.write(data);
  }

  req.end();
};

module.exports = OpenShift;

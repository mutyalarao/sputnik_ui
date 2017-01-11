var path = require('path')
, http = require('http')
,engines=require('consolidate');
var express = require ('express');

var setViewEngine=function(app,engineName){
	if(engineName=='html'){
		app.engine('html',engines.ejs);
		app.set('views',path.join(process.cwd(),'views'));
		app.set('view engine', 'html')		
		
	}	
}

exports.setViewEngine =  setViewEngine;
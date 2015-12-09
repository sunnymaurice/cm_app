module.exports = exports = (function export_http_server () {
	
	var express = require('express');
	var bodyParser = require('body-parser');	
	var serverSetting = require('../config/http_server.json');
	

	var http_app = express();

	var  init_http_srv = function init_http_srv(path, router) {

		// configure everything, just basic setup
			
		// for parsing application/json
		http_app.use(bodyParser.json()); 
		// for parsing application/x-www-form-urlencoded
		http_app.use(bodyParser.urlencoded({ extended: true })); 
		
		// only requests to /getDBapi/* will be sent to our router: "dbApiRoute"
		http_app.use(path, router);
		// TODO: add another path to handle other requests
		// Maybe the input should be path array and router array
		// 
		/*
		var x;
		var path;
		for (x in pathobj) 
		{
			path.push(pathobj[x]);
		}
		*/			

		//http_app.set('port', process.env.PORT || serv_setting.HTTP_SRV_PORT);
		//console.log('Finish http configure...');
		

		var server = http_app.listen(serverSetting.HTTP_SRV_PORT, function () {
	  		var host = server.address().address;
	  		var port = server.address().port;

	  		console.log('HTTP Server listening at http://%s:%s', host, port);
		});	
		//for test
		http_app.set('title', 'CM HTTP Server');

		return http_app;
	};

	return {
		init_http_srv: init_http_srv
	};
	
})();



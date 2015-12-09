module.exports = exports = (function export_getDB_api() {

	var express = require('express');

	var router = express.Router();

	//TODO: Send the proper response according to the value of reqBody.action	
	function handleRequest(reqBody)
	{	
		//console.log("Request Action: "+reqBody.action);
		
	}
	
	
	var  init_router = function init_router(mysql_db, mysql_db_setting, sql_pool) {
		//console.log('init_routner...');
		// simple logger for this router's requests
		// all requests to this router will first hit this middleware
		router.use(function getDBLog(req, res, next) {
			var datetime = new Date();
			console.log('Time: ', datetime);
			//console.log(req);
		  	console.log('Method: %s, Host: %s, BaseUrl: %s', req.method, req.headers.host, req.baseUrl);  
		  	next();
		});


		// define the home page route
		router.post('/', function(req, res) {
			var respMsg;
			//console.log(req.body);
			handleRequest(req.body);
			//TODO: call cm_db functions to get DB data and response according to json request!		
			respMsg = 'Got request body: ' +  JSON.stringify(req.body);
		  	res.json({message: respMsg});
		  	res.end();
		});

		router.post('/test', function(req, res) {
			console.log(req.body);
			res.json({test: 'ok'});
			res.end();
		});

		return router;
	};

	// public property and method
	return {		
		init_router: init_router,		
	};
})();
//module.exports = router;
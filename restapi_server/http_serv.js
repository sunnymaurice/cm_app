module.exports = exports = (function export_rest_api_srv() {
	// var https = require('https');
	var http = require('http');

	var serv_setting 	= require('../config/restful_api_serv.json');
	var express			= require('express');
	var serv_app		= express();
	var bodyParser		= require('body-parser');             // define our app using express

	// configure app to use bodyParser()
	// this will let us get the data from a POST
	serv_app.use(bodyParser.urlencoded({ extended: true }));
	serv_app.use(bodyParser.json());

	// ROUTES FOR OUR API
	// =============================================================================
	var router = express.Router(); // get an instance of the express Router

	var external_events = {
		get: null,
		post: null
	};

	// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
	router.get('/get', function (req, res) {
		console.log(req);

		res.json({
			message: 'hello, welcome to our api!'
		});

		if (external_events.get) { external_events.get('GET'); }
	});

	router.post('/post', function (req, res) {

		console.log(req.body);

		var respMsg;
		if (req.body) {
			respMsg = req.body.name ? 'I Got you name, ' + req.body.name : 'I don\'t know who you are';
		}

		res.json({
			message: respMsg
		});

		if (external_events.post) { external_events.post('POST'); }
	});

	// more routes for our API will happen here

	// REGISTER OUR ROUTES -------------------------------
	// all of our routes will be prefixed with /api
	serv_app.use('/api', router);

	// START THE SERVER
	// =============================================================================
	var custom_port = serv_setting.CUSTOM_LISTEN_POST; // set our port
	var httpServer = http.createServer(serv_app);
	httpServer.listen(custom_port, function httpServerListening() {
		console.log('RESTful API Server Listening on ' + 
			httpServer.address().address + ':' + 
			httpServer.address().port);
	});

	// start port < 1024, need root permssion
	// httpServer.listen(80, function httpServerListening() {
	// 	console.log('RESTful API Server Listening on ' + httpServer.address().address + ':' + httpServer.address().port);
	// });


	return {
    	setOnGET: function (func) { external_events.get = func; },
		setOnPOST: function (func) { external_events.post = func; }
	};
})();
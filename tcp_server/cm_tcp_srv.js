module.exports = exports = (function export_cm_tcp_srv() {
	var net			= require('net');
	var fs			= require('fs');
	var os          = require('os');
	var pkt_parser	= require('./cm_proto_parser.js');

	var tcpConnOptions = { 
		ip: 'localhost', //Get the ip of wlan0 by getWlan0IP() 
		port: 60001,
		alt_port: 6969	
	};

	// Store the raw data sent from scales.
	//var logFileName = '/var/run/cmTcpServerD.log';
	var logFileName = 'wifiCM.log';

	// list of currently connected clients (users)
	var WsClients = [];


	// tcpConnOptions.ip = (function getWlan0IP() {
	// 	//First public IP of wlan0 (usually IPv4) as string
	// 	var ip = os.networkInterfaces().wlan0[0].address;
	// 	//var netmask = os.networkInterfaces().wlan0[0].netmask;
	// 	//var mac = os.networkInterfaces().wlan0[0].mac;
	// 	return ip;
	// })();

	var cm_db, cm_db_setting;

	var init_tcp_srv = function init_tcp_srv(mysql_db, mysql_db_setting, sql_pool) {
		cm_db = mysql_db;
		cm_db_setting = mysql_db_setting;

		// Create a server instance, 
		var tcpServer = net.createServer(function (socket) {
			if (socket) {
				//socket.end('goodbye\n');
			}
		});

		//Allow the max 64 clients to get connected to us.
		tcpServer.maxConnections = 64;

		// Start to listen any income clients
		tcpServer.listen(tcpConnOptions.port, tcpConnOptions.ip);	
		console.log('opened server on %j', tcpConnOptions.ip);

		//console.log('MS3710 GW offset: ' + ms3500_config.pkt_format.GROSS_WEIGHT_OFFSET + ' Length: ' + ms3500_config.pkt_format.GROSS_WEIGHT_LEN);
		/*
			One issue some users run into is getting EADDRINUSE errors. 
			This means that another server is already running on the requested port. 
			One way of handling this would be to wait a second and then try again. 
		*/
		tcpServer.on('error', function (e) {
			if (e.code == 'EADDRINUSE') {
				console.log('Port in use, retrying...');
					
				setTimeout(function () {
					tcpServer.close();
					console.log('Try listening on alternative port: ' + tcpConnOptions.alt_port);
					tcpServer.listen(tcpConnOptions.alt_port, tcpConnOptions.ip);
				}, 1000);
			}
		});

		tcpServer.on('listening', function () {
			console.log('waiting incoming client ...');
		});

		// Handle a "new connection" event
		tcpServer.on('connection', function (sock) {		
			// Identify this client		
			sock.name = sock.remoteAddress+':'+sock.remotePort;
			// Add thie new client in the list
			WsClients.push(sock);
			
			// We have a connection - a socket object is assigned to the connection automatically		
			console.log((new Date()) +'\nCONNECTED with: ' + sock.name +'\n');
				
			// Add a 'data' event handler to this instance of socket
			sock.on('data', function(data) {
				var message = sock.name + '> ' + data.toString();
				var data_str = data.toString();
				var dbData = {};        
				
				// data_str = pkt_parser.hex2String(data);        
				// parse packet and prepare to insert the retrieved data into DB.
				dbData = pkt_parser.pktInterpreter(data_str);

				// Save the measured data in the mysql DB.      
				// cm_db.handleNewData(sql_pool, cm_db_setting.DEFAULT_TABLE, dbData);
				// 2015.11.10 by Maurice.
				// Don't do any check, just insert every record. For demo use only.
				cm_db.insertData(sql_pool, cm_db_setting.DEFAULT_TABLE, dbData);
							
				// Write the data back to the socket, the client will receive it as data from the server
				sock.write('Server received:\n'+data+'\n');
				// Log it to the server output!
				process.stdout.write(message);

				fs.appendFile(logFileName, data + '\n', function (err) {
					if (err) {
						console.log('Append file: ' + logFileName + ' error...\n');
					}
				});					   
			});
			
			// Add a 'close' event handler to this instance of socket
			sock.on('close', function () {
				//remove the end connection with the client: sock.name
				WsClients.splice(WsClients.indexOf(sock), 1);    		
				console.log('Connection CLOSED: ' + sock.name);	
				/*NOTICE: do not call this since socket close occurs before sql operation. */
				//End database pool connections 
				//cm_db.endConnections();
			});

			// Add a 'error' event handler to this instance of socket	
			sock.on('error', function (e) {		
				console.error('sock error with return code: ' + e.code);
				//We should end mysql pool due to the database operation error instead.
				//TODO: Need to find a good point to call endConnections() somewhere else.
				//The other side of the TCP conversation abruptly closed its end of the connection
				if(e.code != 'ECONNRESET')  
				{
				  //End database pool connections    
				  cm_db.endConnections();    
				}
			});	
			
		});

		// after init, return the tcpServer Object
		return tcpServer;
	};

	// public property and method
	return {
		init_tcp_srv: init_tcp_srv
	};
})();
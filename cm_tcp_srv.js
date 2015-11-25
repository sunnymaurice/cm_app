/*
 *   2015.10.26 First commited 
 *   Author: Maurice Sun
 *   Function: Main scrip to be executed as a TCP server listening on
 *   port: 60001 and store the data from TCP clients after parseing phase
 *   in the mysql database.
 *
 *   Revision History:
 *      1. 2015.10.30 Maurice Sun 
 *         Add 'gSn' as one of three primary keys and change the checking rule
 *      2. 2015.11.02 Maurice Sun
 *         Get listening IP from wlan0 instead of static IP assignment.
 *      3. 2015.11.10 Maurice Sun
 *         Use new database table to meet the requirments of ordering date date and time
 *         , allow insertion of every data from scales, and the same number of weight digits 
 *         shown on the scales.
 */ 
var net         = require('net');
var fs          = require('fs');
var pkt_parser  = require('./cm_proto_parser.js');
var db_config   = require('./db_settings.js');
var cm_db       = require('./cm_db.js');
var os          = require('os');

// Remark the startup time in the system log file, /var/log/cmTcpServerD.log
var datetime = new Date();
console.log('\nStart cmTcpServerD at: '+datetime);

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

var sql_pool = null;

function getWlan0IP()
{
  //First public IP of wlan0 (usually IPv4) as string
  var ip = os.networkInterfaces().wlan0[0].address;
  //var netmask = os.networkInterfaces().wlan0[0].netmask;
  //var mac = os.networkInterfaces().wlan0[0].mac;
  return ip;
}

//tcpConnOptions.ip = getWlan0IP();

/* ---------------------------------------------------------------------------- */
/* Main flow */

sql_pool = cm_db.createNewPool();

cm_db.db_init(sql_pool);

// Create a server instance, 
var tcpServer = net.createServer(function (socket) {
  //socket.end('goodbye\n');
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

tcpServer.on('listening', function() {
	console.log('waiting incoming client ...');
});

// Handle a "new connection" event
tcpServer.on('connection', function(sock) {		
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
        
        //data_str = pkt_parser.hex2String(data);        
        //parse packet and prepare to insert the retrieved data into DB.
        dbData = pkt_parser.pktInterpreter(data_str);

        // Save the measured data in the mysql DB.      
        //cm_db.handleNewData(sql_pool, db_config.db_setting.DEFAULT_TABLE, dbData);
        // 2015.11.10 by Maurice.
        // Don't do any check, just insert every record. For demo use only.
        cm_db.insertData(sql_pool, db_config.db_setting.DEFAULT_TABLE, dbData);
                	
	   	  // Write the data back to the socket, the client will receive it as data from the server
  	    sock.write('Server received:\n'+data+'\n');
  	    // Log it to the server output!
  	    process.stdout.write(message);

		    fs.appendFile(logFileName, data + '\n', function (err) {
				  if(err) console.log('Append file: ' + logFileName + ' error...\n');
		    });					   
    });
    
	// Add a 'close' event handler to this instance of socket
    sock.on('close', function() {
    		//remove the end connection with the client: sock.name
    		WsClients.splice(WsClients.indexOf(sock), 1);    		
        	console.log('Connection CLOSED: ' + sock.name);	
        /*NOTICE: do not call this since socket close occurs before sql operation. */
        //End database pool connections 
        //cm_db.endConnections();
	});

	// Add a 'error' event handler to this instance of socket	
	sock.on('error', function(e){		
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



/*
 *   2015.10.26 First commited 
 *   Author: Maurice Sun
 *   Function: Main scrip to be executed as a TCP server listening on
 *   port: 60001 and store the data from TCP clients after parseing phase
 *   in the mysql database.
 *
 *   Revision History:
 */

var net         = require('net');
var fs          = require('fs');
var pkt_parser  = require('./cm_proto_parser.js');
var db_config   = require('./db_settings.js');
var cm_db       = require('./cm_db.js');

var tcpConnOptions = {    
	ip: 'localhost', //Notice: need to be modified to the ip of wlan0 once migrated to pi system.
	port: 60001,
	alt_port: 6969	
};
var logFileName = '/var/run/cmTcpServerD.log';
//var logFileName = 'wifiCM.log';
// list of currently connected clients (users)
var WsClients = [];	

var sql_pool = null;

//For columns in 'recordList' table in DB: CM_TEST
//TBD: Shall we create an patient information table so that we can find the 'name' via 'id' we retrieved from scale?
//     Is is possible to access hospital's patient health information?

/*
  Assumption: Only keep one record at a day. That is, no more than one record of a patient in a day.
  If the new record of the patient with pId is existing at the same day, update the old one.
    
  Check if this is the updated record of the patient measured at the same day, otherwise, 
  insert the new record.
  tableName: string type
  record: object   
 */
function handleNewData(pool, tableName, record)
{
  //var check_sql = 'SELECT * from '+tableName+' WHERE pId = \''+record.pId+'\' AND measure_date = \''+record.measure_date+'\'';
  /*
   *  If the data is from the same device, patient, and on the same day, just update it without insert a new record.
   *  TODO: Make it flexible so that we can create a check_sql string accordingly later.
   */
  var check_sql = 'SELECT * from '+tableName+' WHERE gSn = ? AND pId = ? AND measure_date = ?';
  cm_db.getConnection(pool, function(err, connection) {
    if (err) {      
      if(connection)  connection.release();
      console.error(err);
      return; 
      //TODO: What could we do in case of the pool has been ended?      
    }   

    var factors = [];
    factors.push(record.gSn);
    factors.push(record.pId);    
    factors.push(record.measure_date);

    var check = connection.query(check_sql, factors, function(err, result){
      //console.log(check.sql+'\n'); 
      if (err) 
      {
        if(connection)  connection.release();      
        console.log(err);
        return;
      }
      else {
        //console.log('Found ' + result.length + ' existing record of '+ record.pId +' at date:' + record.measure_date);

        if(connection) 
        {
          //console.log(connection);
          connection.release();
        }  

        if(result.length > 0)              
        {          
          //Update query to replace the existing record eariler at the same day.
          var updateFields = [];
          // fields to be updated
          updateFields.push(record.gWeight);
          updateFields.push(record.tWeight);
          updateFields.push(record.nWeight);
          updateFields.push(record.pBMI);
          updateFields.push(record.measure_time); 
          // select condition: where gSn = '123456789' AND pid = 'A' AND measure_date = '2015-10-19'
          updateFields.push(record.gSn);   
          updateFields.push(record.pId);
          updateFields.push(record.measure_date);
          /*
           * TODO: fine tune to check if there is any change in major columns of a patient in order to avoid redundant updates later.
           */
          updateData(pool, tableName, updateFields);
        }            
        else
        {          
          //Insert query to add a new record.
          insertData(pool, tableName, record);
        }        
      }
    });

  });  
}

/*
  Insert data, 'record' into the table, 'tableName'.
*/

function insertData(pool, tableName, record)
{  
  var insert_sql = 'INSERT INTO ' + tableName + ' SET ?';  
  //console.log('insertData : '+ tableName);
  
  cm_db.getConnection(pool, function(err, connection) {    
    if (err){
      if(connection)  connection.release();      
      console.log(err);
      /*
      for(var i in err)
      {    
        console.log(i + ': ' + err[i]);
      }
      */
      return;
    }     
   
    //console.log('connected as id ' + connection.threadId);     
    // Use the connection
    var insertQuery = connection.query(insert_sql, record, function(err, result){
      if (err)
      { 
        if(connection)  connection.release();
        console.error(err);
        return; 
      }  
      else {    
        //console.log('Last insert ID:', result.insertId);
        // And done with the connection.
        if(connection) connection.release();
      }
    });
    //console.log(insertQuery.sql+'\n');   
  });
}

function updateData(pool, tableName, fields)
{
  var update_sql = 'UPDATE '+ tableName +' SET gWeight = ?, tWeight = ?, nWeight = ?, pBMI = ?, measure_time = ? WHERE gSn = ? AND pId = ? AND measure_date = ?';
  
  cm_db.getConnection(pool, function(err, connection) {
    if (err) {
      connection.release();      
      return;
    }   

    connection.query(update_sql, fields, function(err, result){
      if (err) throw err;
      else {
        console.log('Changed ' + result.changedRows + ' rows');
        connection.release();
      }
    });

  });  
}


function deleteData(pool, tableName, del_field)
{
  var delete_sql = 'DELETE FROM '+ tableName +' WHERE pId = ? AND measure_date = ?';  
  //var delete_sql = 'DELETE FROM '+ mydb.db_setting.DEFAULT_TABLE +' WHERE id = \'213012345\''; 
  
  cm_db.getConnection(pool, function(err, connection) {
      if (err) {
        connection.release();
        //res.json({'code' : 100, 'status' : 'Error in connection database'});
        return;
      }   

      connection.query(delete_sql, del_field, function(err, result){      
        if (err) throw err;
        else {
          console.log('Deleted ' + result.affectedRows + ' rows');
          connection.release();
        }
      });

  });
}

function showAllData(pool, tableName)
{  
  var selectALL_sql = 'SELECT * FROM '+ tableName;  
  
  cm_db.getConnection(pool, function(err, connection) {

    if (err) {
      connection.release();
      console.error('Error in connection database');
      return;
    }         
   
    // Use the connection
    var selAllQuery = connection.query(selectALL_sql, function(err, rows){
      if (err) throw err;
      else {        
        // And done with the connection.        
        connection.release();
        if(rows.length !== 0) 
        {
          for (var i = 0; i < rows.length; i++) {
            console.log( 'ID: '  + rows[i].pId + ', Gross Weight: ' + rows[i].gWeight + '\n');
            
          }         
          //console.log(rows);    
        }
        else console.log('table is empty!\n');          
      }
    });
    //console.log(selAllQuery.sql); 

    connection.on('error', function() {      
      //res.json({'code' : 100, 'status' : 'Error in connection database'});
      console.error('Error in connection database');
      return;    
    });
  });
}

function dropTable(pool, tableName)
{
  var dropTable_sql = 'DROP table ' + tableName;
  
  cm_db.getConnection(pool, function(err, connection) {  
    connection.query(dropTable_sql, function(err){

      if(err) throw err;
      else {
        console.log('The '+ tableName +' table is removed.');
      }
    });    
  });
}

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
console.log('opened server on %j', tcpServer.address());

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
        handleNewData(sql_pool, db_config.db_setting.DEFAULT_TABLE, dbData);
                	
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



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

var db_setting			= require('./config/db_settings.json');
var cm_db				= require('./database/cm_db.js');
var tcp_srv_interface	= require('./tcp_server/cm_tcp_srv.js');
var restapi_srv			= require('./restapi_server/http_serv.js');

// Remark the startup time in the system log file, /var/log/cmTcpServerD.log
var datetime = new Date();
console.log('\nStart cmTcpServerD at: ' + datetime);

/* ---------------------------------------------------------------------------- */
/* Main flow */

var sql_pool = cm_db.createNewPool();
cm_db.db_init(sql_pool);
var tcpServer = tcp_srv_interface.init_tcp_srv(cm_db, db_setting, sql_pool);


restapi_srv.setOnGET(function onGET() {
	console.log('I Got a GET Message!');
});

restapi_srv.setOnPOST(function onPOST() {
	console.log('I Got a POST Message!');
});
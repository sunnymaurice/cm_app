/*
 *   Copyright (c) 2015, Charder Electronic CO. LTD. All rights reserved.
 *   Redistribution and use in source and binary forms, with or without modification, 
 *   are permitted provided that the following conditions are met:
 *		1. Redistributions of source code must retain the above copyright notice, this list
 *      of conditions and the following disclaimer.
 *      2. Redistributions in binary form must reproduce the above copyright notice, this list 
 *      of conditions and the following disclaimer in the documentation and/or other materials 
 *      provided with the distribution.
 *
 *   2015.10.26 First created 
 *   Author: Maurice Sun
 *   Function: Main scrip to be executed as a TCP server listening on
 *   port: 60001 and store the data from TCP clients after parseing phase
 *   in the mysql database. 
 */ 

var db_setting			= require('./config/db_settings.json');
var htppSrvSetting 		= require('./config/http_server.json');
var path_set 			= require('./config/route_path.json');

var cm_db				= require('./database/cm_db.js');
var tcp_srv_interface	= require('./tcp_server/cm_tcp_srv.js');

var getDB_api_interface = require('./route/getDBapi.js');
var http_srv_interface	= require('./http_server/http_server.js');

// Remark the startup time in the system log file, /var/log/cmTcpServerD.log
var datetime = new Date();
console.log('\nStart cmTcpServerD at: ' + datetime);


/* ---------------------------------------------------------------------------- */
/* Main flow */

var sql_pool = cm_db.createNewPool();
cm_db.db_init(sql_pool);


var tcpServer = tcp_srv_interface.init_tcp_srv(cm_db, db_setting, sql_pool);

var getDBapiRouter = getDB_api_interface.init_router(cm_db, db_setting, sql_pool);

var httpServer = http_srv_interface.init_http_srv(path_set.DB_API_ROUTE, getDBapiRouter);
console.log('Http Server Title: ' + httpServer.get('title'));
// test tcpServer Object
//console.log('tcpServer.maxConnections: ' + tcpServer.maxConnections);



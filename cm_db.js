var mysql = require('mysql');
var mydb = require('./db_settings.js');

var createDB_sql = 'CREATE DATABASE IF NOT EXISTS '+ mydb.db_setting.DEFAULT_DB;
var useDB_sql = 'USE ' + mydb.db_setting.DEFAULT_DB;

var createTABLE_sql = 'CREATE TABLE IF NOT EXISTS '+ mydb.db_setting.DEFAULT_TABLE +
    ' (' +
      'model VARCHAR(8) NOT NULL,' +
      'gSn VARCHAR(9) NOT NULL,' +
      'pId VARCHAR(16) NOT NULL,' +
      'gWeight VARCHAR(6) NOT NULL,' +
      'tWeight VARCHAR(6) NOT NULL,' +
      'nWeight VARCHAR(6) NOT NULL,' +
      'pHeight VARCHAR(5),'+
      'pBMI VARCHAR(4),'+
      'measure_date DATE NOT NULL,'+
      'measure_time TIME NOT NULL,'+
      'PRIMARY KEY ( pId, measure_date, measure_time )'+
    ');';

exports.createNewPool = function()
{

  var pool = mysql.createPool({
    connectionLimit: mydb.db_setting.CONNECTION_LIMIT,
    host: mydb.db_setting.DEFAULT_HOST,
    port: mydb.db_setting.DEFAULT_PORT,
    user: mydb.db_setting.DEFAULT_USER,
    password: mydb.db_setting.DEFAULT_PASSWD,
    database: mydb.db_setting.DEFAULT_DB,
    //insecureAuth: false,
    trace: true,
    debug: false  //set true for debugging trace 
  });

  console.log('Create a new mysql pool on: ' + mydb.db_setting.DEFAULT_HOST + ', port :' + mydb.db_setting.DEFAULT_PORT);

  return pool;  
};

exports.db_init = function(pool)
{
  //Create default database if it does not exist
  pool.query(createDB_sql);
  //Use default database
  pool.query(useDB_sql);
  //Create default table if it does not exist
  pool.query(createTABLE_sql);
};

exports.getConnection = function(pool, callback) {
    pool.getConnection(callback);
};

exports.endConnections = function(pool) {
  console.log('endConnections: end mysql pool');
  pool.end();
};



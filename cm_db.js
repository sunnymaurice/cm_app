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

exports.db_init = function(myPool)
{
  //Create default database if it does not exist
  myPool.query(createDB_sql);
  //Use default database
  myPool.query(useDB_sql);
  //Create default table if it does not exist
  myPool.query(createTABLE_sql);
};

/*
exports.getConnection = function(myPool, callback) {
    myPool.getConnection(callback);
};
*/

exports.endConnections = function(myPool) {
  console.log('endConnections: end mysql pool');
  myPool.end();
};

/*
 *   Description: Show all data in a table: tableName
 *   TODO: Add one more parameter, res, for HTTP sever's call 
 */
function showAllData(myPool, tableName)
{
  var selectALL_sql = 'SELECT * FROM '+ tableName;

  myPool.getConnection( function(err, connection){

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

  } );

}

/*
 *  Description: Insert data, 'record' into the table, 'tableName'.
 *  TODO:
 */
exports.insertData = function(myPool, tableName, record)
{
  var insert_sql = 'INSERT INTO ' + tableName + ' SET ?';
  //console.log('insertData : '+ tableName);

  myPool.getConnection( function(err, connection) {
    if (err){
      connection.release(); 
      console.error('Error in connection database');     
      /*
      console.log(err);  
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
};
// This is a simple template for extension in the future.
function updateData(myPool, tableName, changeFields)
{
  var update_sql = 'UPDATE '+ tableName +' SET gWeight = ?, tWeight = ?, nWeight = ?, pBMI = ?, measure_time = ? WHERE gSn = ? AND pId = ? AND measure_date = ?';
  
  myPool.getConnection( function(err, connection) {
    if (err) {
      connection.release();      
      return;
    }   

    connection.query(update_sql, changeFields, function(err, result){
      if (err) throw err;
      else {
        console.log('Changed ' + result.changedRows + ' rows');
        connection.release();
      }
    });

  });  
}
// This is a simple template for extension in the future.
function deleteData(myPool, tableName, delField)
{
  var delete_sql = 'DELETE FROM '+ tableName +' WHERE pId = ? AND measure_date = ?';  
  //var delete_sql = 'DELETE FROM '+ mydb.db_setting.DEFAULT_TABLE +' WHERE id = \'213012345\''; 
  
  myPool.getConnection( function(err, connection) {
      if (err) {
        connection.release();
        //res.json({'code' : 100, 'status' : 'Error in connection database'});
        return;
      }   

      connection.query(delete_sql, delField, function(err, result){      
        if (err) throw err;
        else {
          console.log('Deleted ' + result.affectedRows + ' rows');
          connection.release();
        }
      });

  });
}

exports.dropTable = function(myPool, tableName)
{
  var dropTable_sql = 'DROP table ' + tableName;
  
  myPool.getConnection( function(err, connection) {
    connection.query(dropTable_sql, function(err){

      if(err) throw err;
      else {
        console.log('The '+ tableName +' table is removed.');
      }
    });    
  });
};

/*
  Assumption: Only keep one record at a day. That is, no more than one record of a patient in a day.
  If the new record of the patient with pId is existing at the same day, update the old one.
    
  Check if this is the updated record of the patient measured at the same day, otherwise, 
  insert the new record.
  tableName: string type
  record: object   
 */
 /*
   *  If the data is from the same device, patient, and on the same day, just update it without insert a new record.
   *  TODO: Make it flexible so that we can create a check_sql string accordingly later.
   */
/*
function handleNewData(pool, tableName, record)
{
  //var check_sql = 'SELECT * from '+tableName+' WHERE pId = \''+record.pId+'\' AND measure_date = \''+record.measure_date+'\'';
  
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
*/
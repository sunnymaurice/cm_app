exports.db_setting = (function () {
		
	return {
		//DB_CONNECTION: db_conn;
		// 連線池可建立的總連線數上限(預設最多為100個連線數)
		CONNECTION_LIMIT: 100,	
		DEFAULT_DB: 'CM_TEST',
		DEFAULT_TABLE: 'record_list',
		DEFAULT_HOST: 'localhost',
		DEFAULT_PORT: 3306,
		DEFAULT_USER: 'wificm',
		DEFAULT_PASSWD: 'wificm'		
		/* calculate_BMI: cal_BMI,*/
	};
})();
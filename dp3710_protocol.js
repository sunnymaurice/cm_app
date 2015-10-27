/*
	DP3710 Protocol

	Length (5): #xxxx  ex:79bytes ASCII: 23 30 30 37 38
	Model number (8): DP3710△△ (△: 20H) ASCII:44 50 33 37 31 30 20 20
	Serial number (9): T140000xx  ASCII:54 31 34 30 30 30 30 30 31
	ID (16): xxxxxxxxxx ex: 0123456789012345 ASCII: 30 31 32 33 34 35 36 37 38 39 30 31 32 33 34 35	
	Gross weight (5): xxxx.x ex: 50.5 ASCII: 30 30 35 30 35
	Tare weight (5): xxxx.x ex: 50.5 ASCII: 30 30 35 30 35
	NET weight (5): xxxx.x ex: 50.5 ASCII: 30 30 35 30 35	
	Decimal place (1): x ex: 1/2 (Depends on how many weight it is) ASCII: 31/32 // 小數點後顯示位數
	Patient height (4): xxx.x ex: 170.5 ASCII: 31 37 30 35
	Patient BMI (3): xx.x ex: 20.5 ASCII: 32 30 35 
	Year/Month/Day (8): yyyy/MM/dd ex: 2015/10/01  ASCII: 32 30 31 3E 3A 30 30 31
	Time (6): xx:xx:xx ex:12:00:05 ASCII: 31 32 30 30 30 35
	CS (2): Counting total bytes, select the last byte. ex: 45H ASCII: 34 35
	Stop (2): 0D 0A ASCII: 0D 0A
 */
exports.pkt_format = (function () {
	
	/*
	var cal_BMI = function() {
		return 'BMI';
	};
	*/

	return {
		MODEL_OFFSET: 5,
		MODEL_LEN: 8,
		SN_OFFSET: 13,
		SN_LEN: 9,
		ID_OFFSET: 22,
		ID_LEN: 16,
		GROSS_WEIGHT_OFFSET: 38,
		GROSS_WEIGHT_LEN: 5,
		TARE_WEIGHT_OFFSET: 43,
		TARE_WEIGHT_LEN: 5,
		NET_WEIGHT_OFFSET: 48,
		NET_WEIGHT_LEN: 5,
		DEC_PLACE_OFFSET: 53,
		DEC_PLACE_LEN: 1,
		HEIGHT_OFFSET: 54,
		HEIGHT_LEN: 4,
		BMI_OFFSET: 58,
		BMI_LEN: 3,
		DAY_OFFSET: 61,
		DAY_LEN: 8,
		TIME_OFFSET: 69,
		TIME_LEN: 6,		
		/* calculate_BMI: cal_BMI,*/
	};
})();
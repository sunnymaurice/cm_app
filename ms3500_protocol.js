/*
	NEW MS3500 Protocol

	Length (5): #xxxx  ex:69 bytes ASCII: 23 30 30 36 37
	Model number (8): MS3500△△ (△: 20H) ASCII: 4D 53 33 35 30 30 20 20
	Serial number (9): T140000xx  ASCII:54 31 34 30 30 30 30 30 31
	ID (16): xxxxxxxxxx ex: 0123456789012345 ASCII: 30 31 32 33 34 35 36 37 38 39 30 31 32 33 34 35
	Gross weight (5): xx.xxx ex: 15.001 ASCII: 31 35 30 30 31
	Tare weight (5): xx.xxx ex: 15.001ASCII: 31 35 30 30 31
	NET weight (5): xx.xxx ex: 15.001 ASCII: 31 35 30 30 31
	DATE/Month/Year (8): xx/xx/xxxx ex: 01/01/2015 ASCII: 30 31 30 31 32 30 31 35
	Time (4): xx:xx ex:12:00 ASCII: 31 32 30 30
	CS (2): Counting total bytes, select the last byte. ex: 45H ASCII: 34 35
	Stop (2): 0D 0A  ASCII: 0D 0A
 */
exports.pkt_format = (function () {
	
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
		DAY_OFFSET: 53,
		DAY_LEN: 8,
		TIME_OFFSET: 61,
		TIME_LEN: 4,
		DECIMAL_PLACE: 3    // 小數點後顯示位數		
	};
})();
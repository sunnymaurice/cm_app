var dp3710_config = require('./dp3710_protocol.js');
var ms3500_config = require('./ms3500_protocol.js');
// DP3710 & MS3510 use the same data transformation format.
//var ms3510_config = require('./ms3510_protocol.js'); 

function scaleData (model, sn, id, gWeight, tWeight, nWeight, height, bmi, measuredDate, measuredTime) {
	var wsData = {};
	wsData.model = model;
	wsData.gSn = sn;
	wsData.pId = id;
	wsData.gWeight = gWeight;
	wsData.tWeight = tWeight;
	wsData.nWeight = nWeight;
	wsData.pHeight = height ? height : null;
	wsData.pBMI = bmi ? bmi : null;
	wsData.measure_date = measuredDate;
	wsData.measure_time = measuredTime;
	return wsData;
/*
	return {
		model: model,
		gSn: sn,		
		pId: id,	
		gWeight: gWeight,
		tWeight: tWeight,
		nWeight: nWeight,
		pHeight: height ? height : null,
		pBMI: bmi ? bmi : null,
		measure_date: measuredDate,
		measure_time: measuredTime	
	};
*/	
}
// Transform the 'YEAR'+'Month'+'DAY'(20150924) to  Year-Month-Day (2015-09-24)
function transformDbDate(dateStr)
{
	//return dateStr.substr(4, 4) + '-' + dateStr.substr(2, 2) + '-' + dateStr.substr(0, 2);
	return dateStr.substr(0, 4) + '-' + dateStr.substr(4, 2) + '-' + dateStr.substr(6, 2);
}
// Transform the Hour+Minute (1015) to Hour:Minute (10:15)/ Hour+Minute+Second to Hour:Mintue:Second
function transformDbTime(timeStr)
{
	//console.log('time string len:' + timeStr.length);	
	if(timeStr.length == 4) 	// hh:mm format of old DP3710 and MS3500
	{
		return timeStr.substr(0, 2) + ':' + timeStr.substr(2, 2);
	}
	else if(timeStr.length == 6)// hh:mm:ss format of MS3510, DP3710
	{
		return timeStr.substr(0, 2) + ':' + timeStr.substr(2, 2) + ':' + timeStr.substr(4, 2);
	}
	else
	{
		console.log('In Function \'transformDbTime\': unsupported time format...');
		return undefined;
	}

}

/* 
	Author: Maurice Sun
	Function Description: 
		Transform hex to string
	Input Arguments:
	Return Value: 	
 */
exports.hex2String = function (pkt_data)
{
	var pkt_str;
	var i;
	for(i in pkt_data){
		pkt_str += String.fromCharCode(pkt_data[i]); 
	}
	//console.log('hex2String return:\n' + pkt_str);

	return pkt_str;
};

function DP3710parser(pkt_str)
{
	// Attain the decimal place of the measured weight
	var decimalPlace = parseInt(pkt_str.substr(dp3710_config.pkt_format.DEC_PLACE_OFFSET, dp3710_config.pkt_format.DEC_PLACE_LEN));

	var modelNum = 	pkt_str.substr(dp3710_config.pkt_format.MODEL_OFFSET, dp3710_config.pkt_format.MODEL_LEN);
	modelNum = modelNum.trim(modelNum);
	var SN = pkt_str.substr(dp3710_config.pkt_format.SN_OFFSET, dp3710_config.pkt_format.SN_LEN);
	var ID = pkt_str.substr(dp3710_config.pkt_format.ID_OFFSET, dp3710_config.pkt_format.ID_LEN);
	var gWeight = parseInt(pkt_str.substr(dp3710_config.pkt_format.GROSS_WEIGHT_OFFSET, dp3710_config.pkt_format.GROSS_WEIGHT_LEN))/Math.pow(10, decimalPlace);
	var tWeight = parseInt(pkt_str.substr(dp3710_config.pkt_format.TARE_WEIGHT_OFFSET, dp3710_config.pkt_format.TARE_WEIGHT_LEN))/Math.pow(10, decimalPlace);
	var nWeight = parseInt(pkt_str.substr(dp3710_config.pkt_format.NET_WEIGHT_OFFSET, dp3710_config.pkt_format.NET_WEIGHT_LEN))/Math.pow(10, decimalPlace);
	var heightStr = pkt_str.substr(dp3710_config.pkt_format.HEIGHT_OFFSET, dp3710_config.pkt_format.HEIGHT_LEN);
	var height;
	if(heightStr !== '----')
	{
		height = parseInt(heightStr)/10;
	}
	var bmiStr = pkt_str.substr(dp3710_config.pkt_format.BMI_OFFSET, dp3710_config.pkt_format.BMI_LEN);
	var BMI;
	if(bmiStr !== 'N/A')
	{
		BMI = parseInt(bmiStr)/10;
	}	
	var date = transformDbDate(pkt_str.substr(dp3710_config.pkt_format.DAY_OFFSET, dp3710_config.pkt_format.DAY_LEN));
	//console.log('Date:' + date);
	var time = transformDbTime(pkt_str.substr(dp3710_config.pkt_format.TIME_OFFSET, dp3710_config.pkt_format.TIME_LEN));
	
	var DP3710_record = scaleData(modelNum, SN, ID, gWeight, tWeight, nWeight, height, BMI, date, time);

	/*
	for(i in DP3710_record)
	{
		console.log(i+':'+DP3710_record[i]);
	}
	*/
	return DP3710_record;
	
}
// Parser for New MS3500 Protocol
function MS3500parser(pkt_str)
{	
	var modelNum = pkt_str.substr(ms3500_config.pkt_format.MODEL_OFFSET, ms3500_config.pkt_format.MODEL_LEN);
	modelNum = modelNum.trim(modelNum);
	var SN = pkt_str.substr(ms3500_config.pkt_format.SN_OFFSET, ms3500_config.pkt_format.SN_LEN);
	var ID = pkt_str.substr(ms3500_config.pkt_format.ID_OFFSET, ms3500_config.pkt_format.ID_LEN);
	var gWeight = parseInt(pkt_str.substr(ms3500_config.pkt_format.GROSS_WEIGHT_OFFSET, ms3500_config.pkt_format.GROSS_WEIGHT_LEN))/1000;
	var tWeight = parseInt(pkt_str.substr(ms3500_config.pkt_format.TARE_WEIGHT_OFFSET, ms3500_config.pkt_format.TARE_WEIGHT_LEN))/1000;
	var nWeight = parseInt(pkt_str.substr(ms3500_config.pkt_format.NET_WEIGHT_OFFSET, ms3500_config.pkt_format.NET_WEIGHT_LEN))/1000;
	var date = transformDbDate(pkt_str.substr(ms3500_config.pkt_format.DAY_OFFSET, ms3500_config.pkt_format.DAY_LEN));
	var time = transformDbTime(pkt_str.substr(ms3500_config.pkt_format.TIME_OFFSET, ms3500_config.pkt_format.TIME_LEN));
	
	var MS3500_record = scaleData(modelNum, SN, ID, gWeight, tWeight, nWeight, undefined, undefined, date, time);	
	return MS3500_record;
}

// Parser for MS3510 Protocol
/*
function MS3510parser(pkt_str)
{	
	var modelNum = pkt_str.substr(ms3510_config.pkt_format.MODEL_OFFSET, ms3510_config.pkt_format.MODEL_LEN);
	modelNum = modelNum.trim(modelNum);
	var SN = pkt_str.substr(ms3510_config.pkt_format.SN_OFFSET, ms3510_config.pkt_format.SN_LEN);
	var ID = pkt_str.substr(ms3510_config.pkt_format.ID_OFFSET, ms3510_config.pkt_format.ID_LEN);
	var gWeight = parseInt(pkt_str.substr(ms3510_config.pkt_format.GROSS_WEIGHT_OFFSET, ms3510_config.pkt_format.GROSS_WEIGHT_LEN))/1000;
	var tWeight = parseInt(pkt_str.substr(ms3510_config.pkt_format.TARE_WEIGHT_OFFSET, ms3510_config.pkt_format.TARE_WEIGHT_LEN))/1000;
	var nWeight = parseInt(pkt_str.substr(ms3510_config.pkt_format.NET_WEIGHT_OFFSET, ms3510_config.pkt_format.NET_WEIGHT_LEN))/1000;
	var date = transformDbDate(pkt_str.substr(ms3510_config.pkt_format.DAY_OFFSET, ms3510_config.pkt_format.DAY_LEN));
	var time = transformDbTime(pkt_str.substr(ms3510_config.pkt_format.TIME_OFFSET, ms3510_config.pkt_format.TIME_LEN));
	
	var MS3510_record = scaleData(modelNum, SN, ID, gWeight, tWeight, nWeight, undefined, undefined, date, time);
	
	return MS3510_record;
}
*/


/* 	
	Author: Maurice Sun
	Function Description: 
		Packet Parsing according to its model type to collect measured weight information of a patient.
	Input Arguments:

	Return Value: 
 */
exports.pktInterpreter = function (pkt_str)
{

	var modelNum = pkt_str.substr(5, 6);
	var record;
	

	//console.log('pkt to parse:\n'+pkt_str + '\n');

	switch(modelNum) {
		case 'DP3710':
		case 'MS3510':
			record = DP3710parser(pkt_str);			
			break;			
		case 'MS3500':
			record = MS3500parser(pkt_str);
			break;
		/*	
		case 'MS3510':
			record = MS3510parser(pkt_str);
			break;			
		*/
		// add case here!
		/*	
		case 'TBD':	
			break;
		*/
		default:
		 	console.error('Unsupported weighting scale model number: '+ modelNum);
	}	
	return record;
};

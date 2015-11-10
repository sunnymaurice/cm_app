var net = require('net');

var HOST = 'localhost'; // TCP Server IP on Pi
var PORT = 60001;		// TCP Server listening port on Pi
//data formatted in compliance of DP3710 protocol
var DP3710_Content = {
	/* Prefix */
	length: '#0078',		//5 bytes
	modelNum: 'DP3710  ',	//8 bytes
	sn: 'T14000081',		//9 bytes
	/* Data */
	id: '2123456789000000',	//16 bytes
	grossWeight: '00875',	//5 bytes ps:小數點必定有decPlace位數 (87.5 kg)
	tareWeight: '00023',	//5 bytes ps:小數點必定有decPlace位數 (2.3 kg)
	netWeigth: '00852',		//5 bytes ps:小數點必定有decPlace位數 (85.2 kg)
	decPlace: 2,			//1 bytes ps:體重量測值的準確度 
	height: '1765',			//4 bytes ps:小數點必定有1位數 (176.5 cm)
	bmi: '247',				//3 bytes ps:小數點必定有1位數 (24.7)
	date: '20151019',		//8 bytes (Year/Month/Day 2015/10/19)
	time: '101507',			//6 bytes (Hour:Minute:Second 10:15:07)
	cs: '45',				//2 bytes (Data bytes: 45)
	/* Suffix */
	stop: '\r\n'			//2 bytes CR+LF
};


var packetNum2Send = 1;

function zerofill(number, size) 
{
  number = number.toString();
  while (number.length < size) number = '0' + number;
  return number;
}

function randomMaxDigitInteger(length)
{
	return Math.floor(Math.random()*Math.pow(10, length));
}

function randomFixedInteger(length) 
{
	var randomInteger = Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
    return randomInteger.toString();
}


function constructInfoObject()
{
	var dataObj = {};
	var d = new Date();
	dataObj.length = '#0079';
	dataObj.modelNum = 'DP3710  ';
	dataObj.sn = 'T15' + randomFixedInteger(6);
	//dataObj.id = zerofill(randomMaxDigitInteger(16), 16);
	dataObj.id = '3123456789000001';	
	dataObj.grossWeight = '00690';
	dataObj.tareWeight = '00000';
	dataObj.netWeight = '00690';
	dataObj.decPlace = 3;
	/*
	dataObj.grossWeight = zerofill(randomFixedInteger(4), 5);
	dataObj.tareWeight = zerofill(randomMaxDigitInteger(2), 5);
	dataObj.netWeight = zerofill((parseInt(dataObj.grossWeight) - parseInt(dataObj.tareWeight)), 5);
	

	if(dataObj.grossWeight < 10)
	{
		dataObj.decPlace = 3;
	}
	else{
		dataObj.decPlace = 2;
	}
	*/
	if(dataObj.modelNum === 'MS3510  ' || dataObj.modelNum === 'MS3500  ')
	{
		dataObj.height = '----';
		dataObj.bmi = 'N/A';	
	}
	else
	{
		dataObj.height = '0872';
		dataObj.bmi = '150';
	}
	dataObj.date = d.getFullYear().toString() + zerofill(d.getMonth()+1 ,2) + zerofill(d.getDate().toString(), 2);
	dataObj.time = zerofill(d.getHours(), 2) + zerofill(d.getMinutes(), 2) + zerofill(d.getSeconds(), 2);
	dataObj.cs = 'EF'; //Don't know how to create it, so use fixed value temporarily. 
	dataObj.stop = '\r\n';

	return dataObj;
}

/*
	先將傳入的某類型的scale 傳輸資料樣本各欄位組成字串，
	接著轉換成網路封包格式準備送出
 */
function construtScalePacket(pkt_obj)
{
	//var pkt_hex = [];
	var pkt_str = '';
	//var readStr = '';

	var i;
	for (i in pkt_obj){
		pkt_str += pkt_obj[i];
	}
	//console.log('packet string:' + pkt_str + '\n');
	//console.log('string length:' + pkt_str.length);

	// for(i in pkt_str){
	// 	pkt_hex.push(pkt_str.charCodeAt(i));
	// }
	//console.log('packet hex:' + pkt_hex + '\n');
	//console.log('bytes length:' + pkt_hex.length);

	// restore the hex array into readable string
	/*
	for(i in pkt_hex){
		readStr += String.fromCharCode(pkt_hex[i]); 
	}
	
	console.log('restored string:' + readStr + '\n');
	console.log('string length:' + pkt_str.length);
	*/
	return pkt_str;
}

//packet1_str = construtScalePacket(DP3710_Content);

//var client = new net.Socket();
var i;
var delay=1000; //1 seconds

for(i = 0; i < packetNum2Send; i++)
{
	setTimeout(function(){
	//your code to be executed after 1 seconds
		var client = net.connect(PORT, HOST, function() {
		
	    	console.log('CONNECTED TO tcp server: ' + HOST + ':' + PORT);
	    
	    	//Simmulate DP3710 formated data	        
	    	var pktObj = constructInfoObject();
	    	var pktStr = construtScalePacket(pktObj);
	    	client.write(pktStr);
	    	
	    	/*
	    	var testStr = '#0079DP3710  T15000075000000000000000000020000000002011591000201511061513338E';
	    	client.write(testStr);
	    	*/
		});

		// Add a 'data' event handler for the client socket
		// data is what the server sent to this socket
		client.on('data', function(data) {
		    
		    console.log('DATA: ' + data);
		    // Close the client socket completely
		    client.destroy();
		    
		});

		// Add a 'close' event handler for the client socket
		client.on('close', function() {
		    console.log('Client close connection');
		});

		client.on('error', function(ex) {
		  console.log('handled error');
		  console.log(ex);
		});	

	}, delay); 
}


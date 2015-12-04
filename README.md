CM_TCP_SERVER
============
This CLI application is designed to behave as a TCP server to receive data transfered from multiple tcp clients via WiFi connections.

After that, data is stored in mysql database for later access via Web service.
Meanwhile, some file formats will be implemented later so that these files can be uploaded to the cloud system.

This application is owned by charder electronics corporation.(http://charder.com.tw). 

## Languages

* English
* Traditional Chinese

## Contributors


```
    Maurice Sun
    Mingho Pan  
```

## Major Revision History
	1. 2015.10.30 Maurice Sun 
       Add 'gSn' as one of three primary keys and change the checking rule.

 	2. 2015.11.02 Maurice Sun
 	   Get listening IP from wlan0 instead of static IP assignment.

	3. 2015.11.10 Maurice Sun
       Use new database table to meet the requirments of ordering date date and time
       , allow insertion of every data from scales, and the same number of weight digits 
       shown on the scales.

    4. 2015.12.02 Ming-Ho Pan, Maurice Sun
       Adjust the code architecture to be modular so that we can reduce the effort to maintain 
       or add new functions as well as increase the flexibility to reuse code. 
    5. 

## Necessary Module Installation

Run & install locally:

*Note 1*: cm_app_srv depends on a local copy of mysql being available. Make sure to do
`$ npm install mysql` before your running this application.

Built-in module requried: [net, fs]

*Note 2*: In order to run it as a service in Debian system, put the shell script in dir: /etc/init.d/. 
Make sure to do `$ npm install -g forever` before installment of the bash shell script .

# Usage

This application can be executed with the following ways:

```
Usage

  node main.js &
  (Shell script would be provided for the raspbian environment.)
  
```

# More Information

Contact Maurice Sun(mail to: maurice_sun@charder.com.tw).

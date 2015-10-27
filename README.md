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
```

## Necessary Module Installation

Run & install locally:

*Note*: cm_app_srv depends on a local copy of mysql being available. Make sure to do
`$ npm install mysql` before your running this application.

Built-in module requried: [net, fs]

# Usage

This application can be executed with the following ways:

```
Usage

  node cm_tcp_srv.js &
  (Shell script would be provided for the raspbian environment.)
  
```

# More Information

Contact Maurice Sun(mail to: maurice_sun@charder.com.tw).

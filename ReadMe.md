# CrabTunnel | Yet Another Simple Proxy Server

CrabTunnel is a simple Proxy Server implementation.



## Index
+ [Installation](#installation)
+ [Usage](#usage)
+ [API](#api)



## Installation
You could use CrabTunnel as a CLI tool
```sh
npm i -g crabtunnel
```
You could also use it programmatically
```sh
npm i crabtunnel
```



## Usage
To use from CLI command
```sh
crabtunnel -p ${Proxy server port}

crabtunnel -h # for help
```

Or use it programmatically
```js
const CrabTunnel = require('crabtunnel')

CrabTunnel(
{
	Port : 3389
})
```



## API

### CrabTunnel(Option)
+ `Option` : `Object`
	+ `Port?` : `number | (number | string)[]`. The number for port to listen, or an array to be applied by listen function.
	+ `Server?` : `import('http').Server`. The custom server object, will handle `request` and `connect` events on it.
	+ `Proxy?` : `string | import('http').RequestOptions`. The proxy server for the next hop. You may add additional headers when passing an object.
	+ `OnReq?` : `<U = boolean>(Req : import('http').IncomingMessage,Res : import('http').ServerResponse) => U`. Function to be called when a proxy request initiated through the `request` event. Return `false` to reject the request, or `true` to take over control of the request.
	+ `OnReqReq?` : `(Req : import('http').ClientRequest) => any`. Function to be called when a request object is created. You may add additional headers to send.
	+ `OnReqRes?` : `(Res : import('http').ServerResponse,Code : number,Message : string) => any`. Function to be called before forwarding the responsed headers. You may modify the headers or the status to send. The original responsed status will be forwarded if the header is not sent after invoking this function.
	+ `OnConn?` : `<U = boolean>(Req : import('http').IncomingMessage,Soc : import('net').Socket,Head : Buffer) => U`. Function to be called when a proxy request initiated through the `connect` event. Return `false` to reject the request, or `true` to take over control of the request.
	+ `OnConnProxy?` : `(Req : import('http').ClientRequest) => any`. Function to be called when a request to the proxy server of the next hop using `CONNECT` method. You may add additional headers and/or body data. The request will be automatically sent after invoking this function.
+ Returns : `import('http').Server`

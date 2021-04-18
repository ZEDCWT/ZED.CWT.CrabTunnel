#!/usr/bin/env node
'use strict'
var
WW = require('@zed.cwt/wish'),

Package = require('./package.json'),

Arg = WW.N.ArgParse(
{
	Port : ['P','Proxy server port','Number'],
	Proxy : ['X','Proxy to the next hop','[Protocol]Host:Port'],
},{
	Name : Package.name,
	Version : Package.version
})[0],

Fail = Q => console.log(Q) || process.exit(9);

if ('Port' in Arg)
	WW.IsIn(Arg.Port = +Arg.Port,0,65536) ||
		Fail('Port should be an integer in range [0,65535]')

require('.')(Arg)
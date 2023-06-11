'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,N : WN} = WW,
HTTP = require('http'),
HTTPS = require('https'),
Net = require('net'),

ConnHeader = Buffer.from('HTTP/1.1 200 Connection established\r\n\r\n'),
HopByHopHeader = new Set(
[
	'Connection',
	'Keep-Alive',
	'Proxy-Authenticate',
	'Proxy-Authorization',
	'TE',
	'Trailer',
	'Transfer-Encoding',
	'Upgrade',
].map(WR.Up));

module.exports = Option =>
{
	var
	Port = Option.Port,
	Server = Option.Server || HTTP.createServer(),
	Proxy = Option.Proxy,
	OnReq = Option.OnReq,
	OnReqReq = Option.OnReqReq,
	OnReqRes = Option.OnReqRes,
	OnConn = Option.OnConn,
	OnConnProxy = Option.OnConnProxy,

	PerReqProxy,
	PerReqInit = () =>
	{
		PerReqProxy = Proxy
	},
	PerReq =
	{
		Proxy : P =>
		{
			PerReqProxy = P ? WN.ReqPU(P) : null
		},
	},

	ServerOnReq = (Q,S) =>
	{
		var
		Head = (Q,S) => {for (var F = 0;F < Q.length;) S(Q[F++],Q[F++])},
		End,
		T;
		PerReqInit()
		if (OnReq)
		{
			T = OnReq(Q,S,PerReq)
			if (true === T) return
			if (false === T)
			{
				S.destroy()
				return
			}
		}

		T = {}
		Head(Q.rawHeaders,(F,V) => HopByHopHeader.has(F.toUpperCase()) || (T[F] = V))
		T =
		{
			URL : Q.url,
			Med : Q.method,
			Head : T,
			Acc : false,
			UA : false,
			Write : true,
			AC : true,
			TO : false,
			Red : false,
			Pro : PerReqProxy || false,
			GZ : false,
			OnD : D => S.writable && S.write(D),
			OnE : () => S.writable && S.end(),
		}
		End = WN.Req(T)
			.On('Head',H =>
			{
				Head(H.W,(F,V) => HopByHopHeader.has(F.toUpperCase()) || S.setHeader(F,V))
				OnReqRes && OnReqRes(S,H.Code,H.Msg)
				S.headersSent || S.writeHead(H.Code,H.Msg)
			})
			.On('Req',R =>
			{
				Q.pipe(R)
				OnReqReq && OnReqReq(R)
			})
			.On('Err',() =>
			{
				Q.destroy()
				S.destroy()
			})
			.End
		Q.once('error',End)
		S.once('error',End)
			.once('close',End)
	},
	ServerOnConn = (Q,S,H) =>
	{
		var
		R,
		End = () =>
		{
			S.destroy()
			R && R.destroy()
		},
		T;
		PerReqInit()
		if (OnConn)
		{
			T = OnConn(Q,S,H,PerReq)
			if (true === T) return
			if (false === T) return End()
		}

		T = /^(.+):(\d+)$/.exec(Q.url)
		if (!T && !WW.IsIn(T[2],0,65536)) return End()

		S
			.once('error',WW.O)
			.once('close',End)

		if (PerReqProxy)
		{
			R = ('https:' === PerReqProxy.protocol ? HTTPS : HTTP).request(WW.Merge(false,
			{
				method : 'CONNECT',
				path : Q.url,
				agent : false,
				setHost : false,
			},PerReqProxy)).once('connect',(Res,Soc) =>
			{
				R.removeAllListeners()
				if (200 === Res.statusCode)
				{
					S.write(ConnHeader)
					R = Soc.pipe(S).pipe(Soc)
						.once('error',WW.O)
						.once('close',End)
				}
				else End()
			})
			OnConnProxy && OnConnProxy(R)
			R.writableEnded || R.end()
		}
		else R = Net.connect(
		{
			port : +T[2],
			host : T[1],
			autoSelectFamilyAttemptTimeout : 1E3,
		})
			.once('connect',() =>
			{
				S.write(ConnHeader)
				S.pipe(R).pipe(S)
			})
		R
			/*
				github.com/nodejs/node/issues/48426
				It is not trustable that close event will always be emitted...
			*/
			.once('error',End)
			.once('close',End)
	};

	Proxy = Proxy ? WN.ReqPU(Proxy) : null

	Server.on('request',ServerOnReq)
		.on('connect',ServerOnConn)
	if (Port)
	{
		WW.IsArr(Port) ?
			Server.listen(...Port) :
			Server.listen(Port)
	}
	return Server
}
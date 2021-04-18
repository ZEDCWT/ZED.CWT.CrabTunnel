declare module CrabTunnelNS
{
	import HTTP = require('http')
	import Net = require('net')
	interface CrabTunnel
	{
		(Q :
		{
			Port? : number | (number | string)[]
			Server? : HTTP.Server
			Proxy? : string | HTTP.RequestOptions
			OnReq?<U = boolean>(Req : HTTP.IncomingMessage,Res : HTTP.ServerResponse) : U
			OnReqReq?(Req : HTTP.ClientRequest) : any
			OnReqRes?(Res : HTTP.ServerResponse,Code : number,Message : string) : any
			OnConn?<U = boolean>(Res : HTTP.IncomingMessage,Soc : Net.Socket,Head : Buffer) : U
			OnConnProxy?(Req : HTTP.ClientRequest) : any
		}) : HTTP.Server
	}
}
declare module 'crabtunnel'
{
	var CrabTunnel : CrabTunnelNS.CrabTunnel
	export = CrabTunnel
}
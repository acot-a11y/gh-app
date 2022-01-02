import fetch, { Headers, Request, Response } from 'node-fetch';

globalThis.Window = window.Window;
globalThis.fetch = fetch as any;
globalThis.Headers = Headers;
globalThis.Request = Request as any;
globalThis.Response = Response as any;

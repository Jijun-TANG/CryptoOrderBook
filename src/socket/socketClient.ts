import WebSocket from "ws";
import logger from "@src/utils/loggers/loggers";
import { call, Fn } from "ramda";
import { BinanceSocketParameters } from "@src/prototypes/data_types";
import { log } from "console";

class SocketClient {
  baseUrl: string = "wss://stream.binance.com/";
  _path: string;
  _handlers: Map<any, any> = new Map();
  _params: Object;
  _ws!: WebSocket;
  _oneMessage?: BinanceSocketParameters;
  constructor(path: string, baseUrl: string, params: any = {}) {
    this.baseUrl = baseUrl || "wss://stream.binance.com/";
    this._path = path;
    this._createSocket();
    this._handlers = new Map();
    this._params = params;
  }

  _createSocket() {
    // console.log(`baseURL: ${this.baseUrl}  path: ${this._path}`);
    if (this._params && Object.values(this._params).length > 0) {
      this._ws = new WebSocket(`${this.baseUrl}${this._path}`, this._params);
    } else {
      this._ws = new WebSocket(`${this.baseUrl}${this._path}`);
    }

    this._ws.onopen = () => {
      logger.info("ws connected");
      if (this._params && Object.values(this._params).length > 0) {
        this._ws.send(JSON.stringify(this._params));
      }
    };

    this._ws.on("pong", () => {
      logger.debug("receieved pong from server");
    });
    this._ws.on("ping", () => {
      logger.debug("==========receieved ping from server");
      this._ws.pong();
    });

    this._ws.onclose = () => {
      logger.warn("ws closed");
    };

    this._ws.onerror = (err) => {
      logger.warn("ws error", err);
    };

    this._ws.onmessage = (msg) => {
      // logger.info(`On message receive from ${this.baseUrl}:\n`, msg); // debug: check content of messages
      try {
        const message = JSON.parse(msg.data as string);
        try {
          this._oneMessage = message as BinanceSocketParameters;
        } catch (err) {
          logger.debug("message type doesn't correspond");
        }
        if (message && this.isMultiStream(msg)) {
          let callbacks: Fn[] = this._handlers.get(message.stream);
          for (let i = 0; i < callbacks.length; ++i) {
            callbacks[i](message);
          }
          //this._handlers.get(message.stream).forEach(cb => cb(message)); cannot pass type check
        } else if (message.e && this._handlers.has(message.e)) {
          let callbacks: Fn[] = this._handlers.get(message.e);
          for (let i = 0; i < callbacks.length; ++i) {
            callbacks[i](message);
          }
        } else if (message && this.isMsgForUpdate(message)) {
          let callbacks: Fn[] = this._handlers.get("KrakenDataUpdate");
          for (let i = 0; i < callbacks.length; ++i) {
            callbacks[i](message);
          }
        } else if (message.e == null || message.e == undefined) {
          logger.warn("Unknown type of messages: ", message);
        } else {
          logger.warn("Unknown method: ", message);
        }
      } catch (e) {
        logger.warn("Message parsing failed: ", e);
      }
    };

    this.heartBeat();
  }

  isMultiStream(message: any) {
    return message.stream && this._handlers.has(message.stream);
  }

  isMsgForUpdate(message: any) {
    return (
      (message.data && message.data.length > 0 && message.data[0].checksum) ||
      (message.E && (message.b || message.a))
    );
  }

  heartBeat() {
    if (!this._ws) {
      return;
    }
    setInterval(() => {
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.ping();
        logger.debug("ping server");
      }
    }, 5000);
  }

  setHandler(method: any, callback: Fn) {
    if (!this._handlers.has(method)) {
      this._handlers.set(method, []);
    }
    this._handlers.get(method).push(callback);
  }

  getOneMessage(): BinanceSocketParameters {
    return this._oneMessage!;
  }
}

export default SocketClient;

import logger from "@src/utils/loggers/loggers";
import OrderBook from "@src/orderbook/orderBook";
import SocketClient from "@src/socket/socketClient";
import {
  orderbookUpdateFromWebsocket,
  orderBookUpdateFromRESTfulAPI,
  UpdateKrakenOrderbookFromWebsocket,
} from "@src/orderbook/orderBookManager";
import {
  BinanceSocketParameters,
  krakenMessageType,
} from "./prototypes/data_types";
import express from "express";
import asyncHandler from "express-async-handler";

const SYMBOL = process.env.SYMBOL || "BTCUSDT";
const KrakenSymbol = process.env.KrakenSymbol || "BTC/USD";

const basicKrakenWs = process.env.basicKrakenWs || "wss://ws.kraken.com/";
const basicBinanceWs =
  process.env.basicBinanceWs || "wss://stream.binance.com/";
const basicHuobiWs = process.env.basicHuobiWs || "wss://api.huobi.pro/feed";

const basicHuobiAPIURL =
  process.env.basicHuobiAPIURL || "https://api.huobi.pro/market/";

export default async function createApp() {
  logger.info("Start application");

  /*
  // const socketApi = new SocketClient(`ws/${SYMBOL.toLowerCase()}@depth`, basicKrakenWs);
  // const orderBook = new OrderBook(SYMBOL.toUpperCase());
  // socketApi.setHandler('depthUpdate', (params) => orderbookUpdateFromWebsocket(params)(orderBook));*/

  // Binance data by web Socket
  const BinanceSocketApi = new SocketClient(
    `ws/${SYMBOL.toLowerCase()}@depth`,
    basicBinanceWs
  );
  const BinanceOrderBook = new OrderBook(SYMBOL.toUpperCase());
  BinanceSocketApi.setHandler(
    "depthUpdate",
    (params: BinanceSocketParameters) =>
      orderbookUpdateFromWebsocket(params)(BinanceOrderBook)
  );

  let krakenSubscriptionPayload = {
    method: "subscribe",
    params: {
      channel: "book",
      symbol: [KrakenSymbol],
    },
  };

  // Kraken data by web Socket
  const KrakenSocketApi: SocketClient = new SocketClient(
    `v2`,
    basicKrakenWs,
    krakenSubscriptionPayload
  );
  const KrakenOrderBook: OrderBook = new OrderBook(KrakenSymbol.toUpperCase());
  KrakenSocketApi.setHandler("KrakenDataUpdate", (message: krakenMessageType) =>
    UpdateKrakenOrderbookFromWebsocket(message)(KrakenOrderBook)
  );

  // const socketApi = new SocketClient(`ws/${SYMBOL.toLowerCase()}@depth`, basicKrakenWs);
  // const orderBook = new OrderBook(SYMBOL.toUpperCase());
  // socketApi.setHandler('depthUpdate', (params) => orderbookUpdateFromWebsocket(params)(orderBook));

  // leave a time gap to wait for websocket connection first
  setTimeout(() => {
    orderbookUpdateFromWebsocket(BinanceSocketApi.getOneMessage())(
      BinanceOrderBook
    );
    // orderBookUpdateFromRESTfulAPI(KrakenOrderBook, "0/public/Depth?pair=", "https://api.kraken.com/");
    // orderbookUpdateFromWebsocket({"channel":"book", "type":"snapshot", "data": [KrakenOrderBook.getOrderbook()]})(KrakenOrderBook);
  }, 3000);

  // inspection
  //BinanceOrderBook.best_price(SYMBOL);
  //KrakenOrderBook.best_price(KrakenSymbol, "Kraken");
  // KrakenOrderBook.inspect();
  KrakenOrderBook.inspectBitAsk(100);

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const PORT_NUMBER = 3030;
  app.listen(PORT_NUMBER, () => {
    console.log(`Server is running on port ${PORT_NUMBER}`);
  });

  // ########################## Below is the sections of APIs ##########################

  // Presentation Page
  app.get("/", (req, res) => {
    res.send("Roaster Ride Infos App Launched!");
  });

  //   app.get("/bestBidBinance", (req, res) => {
  //     try{
  //         res.status(200).json(BinanceOrderBook.getBestBid())
  //     } catch (error) {
  //         res.status(500).json({message: error});
  //     }
  //   });

  app.get("/bestBidKraken", (req, res) => {
    try {
      res.status(200).json(KrakenOrderBook.getBestBid());
    } catch (error) {
      res.status(500).json({ message: error });
    }
  });

  // exports.getBestBidBinance = asyncHandler(async (req: any, res: any) => {
  //     try{
  //         res.status(200).json(orderBook.ge)
  //     } catch (error) {
  //         res.status(500).json({message: error.message});
  //     }
  // });

  // const getBestAskBinance = async (req: any, res: any) => {
  //     try{
  //         res.status(200).json(orderBook.ge)
  //     } catch (error) {
  //         res.status(500).json({message: error.message});
  //     }
  // }

  // const getBestMidBinance = async (req: any, res: any) => {
  //     try{
  //         res.status(200).json(orderBook.ge)
  //     } catch (error) {
  //         res.status(500).json({message: error.message});
  //     }
  // }
}

createApp();

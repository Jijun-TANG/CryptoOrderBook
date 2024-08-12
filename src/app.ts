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
import { loadHuobiOrderBook } from "./orderbook/loadHuobiData";

const SYMBOL = process.env.SYMBOL || "BTCUSDT";
const KrakenSymbol = process.env.KrakenSymbol || "BTC/USD";

const basicKrakenWs = process.env.basicKrakenWs || "wss://ws.kraken.com/";
const basicBinanceWs =
  process.env.basicBinanceWs || "wss://stream.binance.com/";



export default async function createApp() {
  logger.info("Start application");

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


  // leave a time gap to wait for websocket connection first
  setTimeout(() => {
    orderbookUpdateFromWebsocket(BinanceSocketApi.getOneMessage())(
      BinanceOrderBook
    );
    // orderBookUpdateFromRESTfulAPI(KrakenOrderBook, "0/public/Depth?pair=", "https://api.kraken.com/");
    // orderbookUpdateFromWebsocket({"channel":"book", "type":"snapshot", "data": [KrakenOrderBook.getOrderbook()]})(KrakenOrderBook);
  }, 3000);

  // Calculate best prices and load them into the databases
  BinanceOrderBook.best_price(SYMBOL);
  KrakenOrderBook.best_price(KrakenSymbol, "Kraken");
  setInterval(() => {
    loadHuobiOrderBook();
    // load huobi data and store them in the designated json file
    //onst orderBookData = loadSourceData(basicHuobiAPIURL + `depth?symbol=${symbol.toLowerCase()}&type=${step}`);
  }, 5000);


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

  
  // app.get("/huobiOrderBook/:symbol/:step", (req, res,) => {
  //   const symbol: string = req.params.symbol;
  //   var stepValue: number = 0;
  //   try{
  //     stepValue = parseInt(req.params.step);
  //   }
  //   catch(err){
  //     console.log("Step not correctly specified ", err);
  //   }
  //   const step = "step" + stepValue.toString();
  //   try {
  //     const orderBookData = loadSourceData(basicHuobiAPIURL + `depth?symbol=${symbol.toLowerCase()}&type=${step}`);
  //     const { b } = orderBookData;
  //     const sortedBids = b.sort((a, b) => b[0] - a[0]);
  //     const bestBid = sortedBids[step - 1][0];
  //     res.status(200).json({ bestBid });
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // });


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

createApp()

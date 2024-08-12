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
import { HuobiSYMBOL, loadHuobiOrderBook } from "./orderbook/loadHuobiData";
import { router } from "@src/routes/pricings.route";

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
    basicBinanceWs,
  );
  const BinanceOrderBook = new OrderBook(SYMBOL.toUpperCase());
  BinanceSocketApi.setHandler(
    "depthUpdate",
    (params: BinanceSocketParameters) =>
      orderbookUpdateFromWebsocket(params)(BinanceOrderBook),
  );

  // Subscript to the orderbook update from Kraken ws
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
    krakenSubscriptionPayload,
  );
  const KrakenOrderBook: OrderBook = new OrderBook(KrakenSymbol.toUpperCase());
  KrakenSocketApi.setHandler("KrakenDataUpdate", (message: krakenMessageType) =>
    UpdateKrakenOrderbookFromWebsocket(message)(KrakenOrderBook),
  );

  // leave a time gap to wait for websocket connection first
  setTimeout(() => {
    orderbookUpdateFromWebsocket(BinanceSocketApi.getOneMessage())(
      BinanceOrderBook,
    );
  }, 3000);

  // Calculate best prices and load them into the databases
  BinanceOrderBook.best_price(SYMBOL);
  KrakenOrderBook.best_price(KrakenSymbol, "Kraken");
  setInterval(() => {
    // load huobi data and store them in the designated json file
    loadHuobiOrderBook(HuobiSYMBOL);
  }, 5000);
}

createApp();

// initialize an Express application to expose the orderBook data

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(router);

const PORT_NUMBER = 3030;
app.listen(PORT_NUMBER, () => {
  console.log(`Server is running on port ${PORT_NUMBER}`);
});

// Presentation Page
app.get("/", (req, res) => {
  res.send("Orderbook App Launched!");
});

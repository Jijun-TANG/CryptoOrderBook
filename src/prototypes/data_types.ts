export interface orderBookData {
  symbol: string;
  ask: (number | string)[][];
  bid: (number | string)[][];
  lastUpdateId: string;
}

export interface snapShotOrderBookData {
  lastUpdateId: string;
  asks: (number | string)[][];
  bids: (number | string)[][];
}

export interface BinanceSocketParameters {
  U: number;
  u: string;
  a: (number | string)[][];
  b: (number | string)[][];
}

export class depthUpdateMessage {
  e: string; //"depthUpdate", // Event type
  E: number; // 1672515782136, // Event time
  s: string; // "BNBBTC",      // Symbol
  U: number; //157,           // First update ID in event
  u: number; //160,           // Final update ID in event
  b: string[][];
  a: string[][];
  /*
    [              // Bids to be updated
        [
        "0.0024",       // Price level to be updated
        "10"            // Quantity
        ]
    ],*/

  constructor(
    e: string,
    E: number,
    s: string,
    U: number,
    u: number,
    b: string[][],
    a: string[][]
  ) {
    this.e = e;
    this.E = E;
    this.s = s;
    this.U = U;
    this.u = u;
    this.b = b;
    this.a = a;
  }
  /* 
    [              // Asks to be updated
        [
        "0.0026",       // Price level to be updated
        "100"           // Quantity
        ]
    ]*/
}

export interface priceInformation {
  price: number;
  qty: number;
}

export interface krakenDataType {
  symbol: string;
  bids: priceInformation[];
  asks: priceInformation[];
  checksum: number;
  timestamp: string;
}

export interface krakenMessageType {
  channel: string;
  type: string;
  data: krakenDataType[];
}

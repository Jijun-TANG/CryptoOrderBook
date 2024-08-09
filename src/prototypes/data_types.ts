export interface orderBookData{
    symbol: string,
    ask: (number|string)[][],
    bid: (number|string)[][],
    lastUpdateId: string
};


export interface snapShotOrderBookData{
    lastUpdateId: string
    asks: (number|string)[][],
    bids: (number|string)[][],
};


export interface BinanceSocketParameters{
    U: number,
    u: string,
    a: (number|string)[][],
    b: (number|string)[][],
};
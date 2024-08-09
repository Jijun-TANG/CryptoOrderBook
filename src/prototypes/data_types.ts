export interface orderBookData{
    symbol: string,
    ask: (number|string)[][],
    bid: (number|string)[][],
    lastUpdateId: string
};


export interface snapShotOrderBookData{
    lastUpdateId: string
    ask: (number|string)[][],
    bid: (number|string)[][],
};
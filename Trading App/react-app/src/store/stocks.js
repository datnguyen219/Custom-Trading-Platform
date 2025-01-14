const SET_STOCKS = "stocks/SET_STOCKS"
const SET_STOCK_GRAPH_DATA = "stocks/SET_GRAPH_DATA"
const SET_WATCHLIST_GRAPH_DATA = "stocks/SET_WATCHLIST_GRAPH_DATA"
const SET_HOLDING_GRAPH_DATA = "stocks/SET_HOLDING_GRAPH_DATA"

export const getStocks = () => async dispatch =>{
    const response = await fetch("/api/stocks")

    if (response.ok) {
        const stocks = await response.json();
        dispatch(setStocks(stocks))
        return null;
      } else if (response.status < 500) {
        const data = await response.json();
        if (data.errors) {
          return data.errors;
        }
      } else {
        return ['An error occurred. Please try again.']
      }
}

export const setStocks = (stocks) => {
    return {
        type:SET_STOCKS,
        payload:stocks
    }
}

const setWatchlistGraphData = data => {
  return {
    type:SET_WATCHLIST_GRAPH_DATA,
    payload:data
  }
}

const setHoldingGraphData = data => {
  return {
    type:SET_HOLDING_GRAPH_DATA,
    payload:data
  }
}

const setStockGraphData = data => {
  return {
    type:SET_STOCK_GRAPH_DATA,
    payload:data
  }
}

export const getHoldingGraphData = (stocks) => async dispatch => {
  for (let stock of stocks) {
    stock.max = 0;
    stock.min = Infinity;
    stock.data = [];
  }

  for (let stock of stocks) {
    const candleResponse = await fetch(`/api/stocks/get_stock_historical?symbol=${stock.symbol}&span=day`);
    const candleData = await candleResponse.json();

    if (candleData && Array.isArray(candleData)) {
      candleData.forEach(item => {
        const newObj = {
          price: parseFloat(item.close_price),
          dateTime: new Date(item.begins_at)
        };

        stock.max = Math.max(stock.max, newObj.price);
        stock.min = Math.min(stock.min, newObj.price);
        stock.data.push(newObj);
      });

      stock.data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

      if (stock.data.length) {
        stock.price = stock.data[stock.data.length - 1].price; // Last candle close price as current price
        stock.change = ((stock.price - stock.data[0].price) / stock.data[0].price) * 100; // Change from first to last candle
      } else {
        stock.data = ["no_data"];
      }
    }
  }

  dispatch(setHoldingGraphData(stocks));
};



export const getWatchlistGraphData = (stocks) => async dispatch => {
  for (let stock of stocks) {
    stock.max = 0;
    stock.min = Infinity;
    stock.data = [];
  }

  for (let stock of stocks) {
    const candleResponse = await fetch(`/api/stocks/get_stock_historical?symbol=${stock.symbol}&span=day`);
    const candleData = await candleResponse.json();

    if (candleData && Array.isArray(candleData)) {
      candleData.forEach(item => {
        const newObj = {
          price: parseFloat(item.close_price),
          dateTime: new Date(item.begins_at)
        };

        stock.max = Math.max(stock.max, newObj.price);
        stock.min = Math.min(stock.min, newObj.price);
        stock.data.push(newObj);
      });

      stock.data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

      if (stock.data.length) {
        stock.price = stock.data[stock.data.length - 1].price; // Last candle close price as current price
        stock.change = ((stock.price - stock.data[0].price) / stock.data[0].price) * 100; // Change from first to last candle
      } else {
        stock.data = ["no_data"];
      }
    }
  }

  dispatch(setWatchlistGraphData(stocks));
};


export const getStockData = (symbol, resolution) => async dispatch => {
  const stockData = { "max": 0, "min": Infinity, data: [], symbol };
  const spanMap = {
    "1D": "day",
    "1W": "week",
    "1M": "month",
    "3M": "3month",
    "1Y": "year",
    "ALL": "5year"
  };
  const span = spanMap[resolution] || "day";  // Adjust span based on your resolution

  const candleResponse = await fetch(`/api/stocks/get_stock_historical?symbol=${symbol}&span=${span}`);
  
  const candleData = await candleResponse.json();

  if (candleData && Array.isArray(candleData)) {
    candleData.forEach(item => {
      const newObject = {
        unixTime: new Date(item.begins_at).getTime() / 1000,
        dateTime: new Date(item.begins_at),
        price: parseFloat(item.close_price)
      };

      stockData.max = Math.max(stockData.max, newObject.price);
      stockData.min = Math.min(stockData.min, newObject.price);
      stockData.data.push(newObject);
    });

    stockData.data.sort((a, b) => a.unixTime - b.unixTime);
  }


  if (stockData.data.length) {
    const lastPrice = stockData.data[stockData.data.length - 1].price;
    stockData.price = lastPrice; 
    stockData.change = ((stockData.price - lastPrice) / lastPrice) * 100;
  } else {
    stockData.data = ["no_data"];
  }

  dispatch(setStockGraphData(stockData));
};



const initialState = {}
export default function stocksReducer(state = initialState, action) {
    let newState = {...state}
    switch (action.type) {
      case SET_STOCKS:
          newState.stocks = action.payload
      case SET_STOCK_GRAPH_DATA:
          newState.stockData = action.payload
          return newState
        case SET_WATCHLIST_GRAPH_DATA:
          newState.watchlistStockData = {}
          for(let stock of action.payload){
            newState.watchlistStockData[stock.symbol] = stock
          }
          return newState
          case SET_HOLDING_GRAPH_DATA:
            newState.holdingStockData = {}
            for(let stock of action.payload){
              newState.holdingStockData[stock.symbol] = stock
            }
            return newState
      default:
        return newState;
    }
  }

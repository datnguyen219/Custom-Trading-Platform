import { config } from 'dotenv';
config()

const SET_PORTFOLIO_DATA = "portfolio/SET_PORTFOLIO_DATA"

export const setPortfolioData = (portfolioData) => {
  return {
    type:SET_PORTFOLIO_DATA,
    payload:portfolioData
  }
}

export const getPortfolioData = (holdings, resolution) => async dispatch => {
  const portfolioData = { "max": 0, "min": Infinity };
  let prices = [];
  const spanMap = {
    "1D": "day",
    "1W": "week",
    "1M": "month",
    "3M" : "3month",
    "1Y": "year",
    "ALL": "5year"
  };
  const span = spanMap[resolution] || "day";  // Adjust span based on your resolution

  for (let i = 0; i < holdings.length; i++) {
    const response = await fetch(`/api/stocks/get_stock_historical?symbol=${holdings[i].symbol}&span=${span}`);
    const data = await response.json();
    if (data && Array.isArray(data)) {
          data.forEach(item => {
            const newObject = {
              unixTime: new Date(item.begins_at).getTime() / 1000,
              dateTime: new Date(item.begins_at),
              price: holdings[i].shares * parseFloat(item.close_price)
            };

            const existingEntryIndex = prices.findIndex(p => p.unixTime === newObject.unixTime);
            if (existingEntryIndex !== -1) {
              prices[existingEntryIndex].price += newObject.price;
            } else {
              prices.push(newObject);
            }
          });
        }
    }

  prices.sort((a, b) => a.unixTime - b.unixTime);
  for (let i = 0; i < prices.length; i++) {
    if (prices[i].price > portfolioData.max) portfolioData.max = Number(prices[i].price.toFixed(0));
    if (prices[i].price < portfolioData.min) portfolioData.min = Number(prices[i].price.toFixed(0));
  }

  if (prices.length) portfolioData.data = prices;
  else portfolioData.data = ["no_data"];

  dispatch(setPortfolioData(portfolioData));
}


const initialState = {}
export default function portfolioReducer(state = initialState, action) {
    let newState = {...state}
    switch (action.type) {
      case SET_PORTFOLIO_DATA:
          newState.portfolioData = action.payload
          return newState

      default:
        return newState;
    }
  }

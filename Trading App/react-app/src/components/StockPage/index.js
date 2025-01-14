import "./StockPage.css"
import { useDispatch, useSelector } from "react-redux"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router";
import { getStockData } from "../../store/stocks";
import 'odometer/themes/odometer-theme-minimal.css';
import {AiOutlinePlus} from "react-icons/ai"
import FormModal from "../Modal/Modal";
import ReactLoading from "react-loading"
import { addBuyingPower, toggleModalView, addModal, addHolding, sellHolding, addBuyThreshold, addSellThreshold} from "../../store/session";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Scatter, ScatterChart} from 'recharts';
import Odometer from 'react-odometerjs';

const months = {
    0:"JAN",
    1:"FEB",
    2:"MAR",
    3:"APR",
    4:"MAY",
    5:"JUN",
    6:"JUL",
    7:"AUG",
    8:"SEP",
    9:"OCT",
    10:"NOV",
    11:"DEC"
}

const Stockpage = () => {
    const dispatch = useDispatch()
    const params = useParams()
    const [graphData,setGraphData] = useState("")
    const [actualScatterData,setActualScatterData] = useState("")
    const [estimatedScatterData,setEstimatedScatterData] = useState("")
    const [renderLineChart,setRenderLineChart] = useState("")
    const [stockValue,setStockValue] = useState(0.00)
    const [stockValueDynamic,setStockValueDynamic] = useState(0)
    const [unixStart,setUnixStart] = useState("")
    const [unixEnd,setUnixEnd] = useState("")
    const [interval,setTimeInterval] = useState("5")
    const [yMax,setYmax] = useState(0)
    const [yMin,setYmin] = useState(Infinity)
    const [render,forceRerender] = useState(false)
    const [investType,setInvestType] = useState("dollars")
    const [buySell,setBuySell] = useState("buy")
    const [investValue,setInvestValue] = useState("")
    const [buyThresholdValue, setBuyThresholdValue] = useState(0.00)
    const [sellThresholdValue, setSellThresholdValue] = useState(0.00)
    const [buyOrderQuantity, setBuyOrderQuantity] = useState(0.00)
    const [sellOrderQuantity, setSellOrderQuantity] = useState(0.00)
    const [currentShares,setCurrentShares] = useState("")
    const [performance,setPerformance] = useState(true)
    const [errors,setErrors] = useState([])
    const [pageLoaded,setPageLoaded] = useState("")
    const [modifyBuyOrder, setModifyBuyOrder] = useState(false);
    const [modifySellOrder, setModifySellOrder] = useState(false);
    const theme = useSelector(state=>state.session.theme)

    const user = useSelector(state=>state.session.user)
    const stockData = useSelector(state=>state.stocks.stockData)

    useEffect(()=>{
        setErrors([])
    },[investValue])
    useEffect(()=>{
        document.title = `${params.symbol}`
        forceRerender(!render)
    },[params])
    useEffect(()=>{
        if(stockData && stockData.symbol){
            if(!isNaN(Number(stockData.price)))setStockValue(stockData.price)
            if(stockData.data){
                if(stockData.data[0]){
                    if(stockData.data.length > 3){
                        setGraphData(stockData.data)
                        setYmin(stockData.min)
                        setYmax(stockData.max)
                    }
                }

            }


            setActualScatterData(stockData.actual)
            setEstimatedScatterData(stockData.estimated)
            if(params){
                if(stockData.symbol === params.symbol){
                    setPageLoaded(params.symbol)
                }
            }

        }
    },[stockData])

    
    const CustomTooltip = ({ active, payload }) => {
    if(payload && payload[0]){
            let year = payload[0].payload.dateTime.getFullYear()
            let month = months[payload[0].payload.dateTime.getMonth()]
            let day = payload[0].payload.dateTime.getDate()
            let hours = payload[0].payload.dateTime.getHours()
            let minutes = payload[0].payload.dateTime.getMinutes()
            if(minutes === 0)minutes = "00"
            if(minutes === 5)minutes = "05"
            let zone
            if(hours >= 12) {
                zone = "PM"
                if(hours > 12){
                    hours = hours % 12
                }
            }
            else zone = "AM"
            setStockValueDynamic(payload[0].payload.price)
            if (interval ==="1W"){
                return (<div className = "chart-date-label">{month} {day}, {year}</div>)
            } else if (interval === "1M" || interval === "3M" || interval === "1Y" || interval === "ALL"){
                return (<div className = "chart-date-label">{month}, {year}</div>)
            }
            else return (<div className = "chart-date-label">{month} {day}, {hours}:{minutes} {zone}</div>)
    }
    return null
}

    useEffect(()=>{
        setErrors([])
        setInvestValue("")
    },[investType,buySell])

    useEffect(()=>{
        if(user && stockData){
            let holding = user.holdings.find(holding => holding.symbol === stockData.symbol);
            let sellLimitOrder = user.sell_limit_orders.find(order => order.stock_symbol === stockData.symbol);
            let buyLimitOrder = user.buy_limit_orders.find(order => order.stock_symbol === stockData.symbol);

            if (holding) {
                setCurrentShares(Number(holding.shares));
            } else {
                setCurrentShares(0);
            }
            if (buyLimitOrder) {
                setBuyThresholdValue(buyLimitOrder.buy_threshold);
                setBuyOrderQuantity(buyLimitOrder.buy_quantity);
            } else{
                setBuyThresholdValue(0);
                setBuyOrderQuantity(0);
            }
            if (sellLimitOrder) {
                setSellOrderQuantity(sellLimitOrder.sell_quantity);
                setSellThresholdValue(sellLimitOrder.sell_threshold);
            } else{
                setSellOrderQuantity(0);
                setSellThresholdValue(0);
            }
        }
    },[user,stockData])

    useEffect(()=>{
        let start = new Date()
              let end = new Date()
              if(start.getDay() === 6){
                  start.setDate(start.getDate()-1)
                  end.setDate(end.getDate()-1)
                  end.setHours(23,0,0,0)

              }
              if(start.getDay() === 0){
                  start.setDate(start.getDate()-2)
                  end.setDate(end.getDate()-2)
                  end.setHours(23,0,0,0)
              } else if (start.getHours() < 6 || (start.getHours() === 6 && start.getMinutes() < 30)){
                  if(start.getDate() === 1){
                    start.setDate(start.getDate()-3)
                    end.setDate(end.getDate()-3)
                    end.setHours(23,0,0,0)
                  }
                  else {
                    start.setDate(start.getDate()-1)
                    end.setDate(end.getDate()-1)
                    end.setHours(23,0,0,0)
                  }

              }
              start.setHours(0,0,0,0)

              let startUnix = Math.floor(Number(start.getTime() / 1000))
              let endUnix = Math.floor(Number(end.getTime() / 1000))
              setUnixStart(startUnix)
              setUnixEnd(endUnix)

    },[params])
    useEffect(()=>{
        setErrors([])
    },[buySell])
    useEffect(()=>{
        if(unixEnd && interval) {
            dispatch(getStockData(params.symbol, interval))
        }
    },[render,interval,unixEnd,unixStart])

    const chartHoverFunction = (e) => {
        if(e.activePayload){
            setStockValueDynamic(e.activePayload[0].payload.price);
        }
    }

    const stockReset = (e) => {
        setStockValueDynamic(0)
    }

    const timeFrameClick = (time, frame) => {
      setTimeInterval(frame);
    };

    const getAbbreviatedNumber = (num) => {
        if(num >= 1000000000000000000000000000000000000000){
            return "Unk."
        }
        if (num >= 1000000000000000000000000000000000000){
            return `${(num / 1000000000000000000000000000000000000).toFixed(3)}U`
        }
        if (num >= 1000000000000000000000000000000000){
            return `${(num / 1000000000000000000000000000000000).toFixed(3)}D`
        }
        if (num >= 1000000000000000000000000000000){
            return `${(num / 1000000000000000000000000000000).toFixed(3)}N`
        }
        if (num >= 1000000000000000000000000000){
            return `${(num / 1000000000000000000000000000).toFixed(3)}O`
        }
        if (num >= 1000000000000000000000000){
            return `${(num / 1000000000000000000000000).toFixed(3)}S`
        }
        if (num >= 1000000000000000000000){
            return `${(num / 1000000000000000000000).toFixed(3)}S`
        }
        if (num >= 1000000000000000000){
            return `${(num / 1000000000000000000).toFixed(3)}P`
        }
        if (num >= 1000000000000000){
            return `${(num / 1000000000000000).toFixed(3)}Q`
        }
        if (num >= 1000000000000){
            return `${(num / 1000000000000).toFixed(3)}T`
        }
        else if (num >= 1000000000){
            return `${(num / 1000000000).toFixed(3)}B`
        }
        else if(num >= 1000000){
            return `${(num / 1000000).toFixed(3)}M`
        } else return Number(Number(num).toFixed(4))
    }

    useEffect(()=>{

        if(graphData){
            if(graphData[graphData.length-1]){
                if(graphData[graphData.length-1].price > graphData[0].price){
                    setPerformance(true)
                    setRenderLineChart((
                      <LineChart onMouseMove = {e=> chartHoverFunction(e)} onMouseLeave = {e=>stockReset(e)} width={1000} height={700} data={graphData}>
                        <Line dot = {false} type="monotone" dataKey="price" stroke="rgb(0, 200, 5)" />
                        <XAxis tick = {false} tickSize = {1.5} interval={0} axisLine = {false} dataKey="dateTime" angle={0} textAnchor="end" />
                        <YAxis tick = {false} axisLine = {false} tickLine = {false} domain={[yMin-1,yMax+1]} allowDecimals={false}/>
                        <Tooltip position={{ y: -16 }} cursor = {true} content = {<CustomTooltip/>}/>
                      </LineChart>))
                } else {
                    setPerformance(false)
                    setRenderLineChart((
                      <LineChart onMouseMove = {e=> chartHoverFunction(e)} onMouseLeave = {e=>stockReset(e)} width={1000} height={700} data={graphData}>
                        <Line dot = {false} type="monotone" dataKey="price" stroke="rgb(255, 80, 0)" />
                        <XAxis  tick = {false} axisLine = {false} dataKey="dateTime" angle={0} textAnchor="end" />
                        <YAxis tick = {false} axisLine = {false} tickLine = {false} domain={[yMin-1,yMax+1]} allowDecimals={false}/>
                        <Tooltip position={{ y: -16 }} cursor = {true} content = {<CustomTooltip/>}/>
                      </LineChart>))
                }
            } else {
                setRenderLineChart((
                  <LineChart onMouseMove = {e=> chartHoverFunction(e)} onMouseLeave = {e=>stockReset(e)} width={1000} height={700}>
                    <Line dot = {false} type="monotone" dataKey="price" stroke="rgb(255, 80, 0)" />
                    <XAxis  tick = {false} axisLine = {false} dataKey="dateTime" angle={0} textAnchor="end" />
                    <YAxis tick = {false} axisLine = {false} tickLine = {false} domain={[yMin-1,yMax+1]} allowDecimals={false}/>
                    <Tooltip position={{ y: -16 }} cursor = {true} content = {<CustomTooltip/>}/>
                  </LineChart>))
            }
        }
    },[graphData])

    const submitBuyLimit = () => {
        let errors = [];
        
        if (isNaN(Number(buyThresholdValue)) || isNaN(Number(buyOrderQuantity))) {
            errors.push("Letters are not allowed");
            setErrors(errors);
            return;
        }
        if (buyThresholdValue.toString()[0] === "-" || buyOrderQuantity.toString()[0] === "-") {
            setErrors(["Negative numbers are not allowed"]);
            return;
        }
        if (isNaN(buyThresholdValue) || isNaN(buyOrderQuantity) || buyThresholdValue < 0 || buyOrderQuantity < 0) {
            setErrors(["You must enter a valid number"]);
            return;
        }
        if (buyThresholdValue >= 100000000000000000000 || buyOrderQuantity >= 100000000000000000000) {
            setErrors(['You must enter a smaller number']);
            return;
        }
        
        if (buyOrderQuantity > user.buying_power) {
            errors.push("Not enough funds");
        }
        if (!errors.length) {
            dispatch(addBuyThreshold(user.id, stockData.symbol, Number(Number(buyThresholdValue).toFixed(4)), Number(Number(buyOrderQuantity).toFixed(4))));
            setModifyBuyOrder(false);
        } else {
            setErrors(errors);
        }
      }


    const submitSellLimit = () => {
        let errors = [];
        
        if (isNaN(Number(sellThresholdValue)) || isNaN(Number(sellOrderQuantity))) {
            errors.push("Letters are not allowed");
            setErrors(errors);
            return;
        }
        if (sellThresholdValue.toString()[0] === "-" || sellOrderQuantity.toString()[0] === "-") {
            setErrors(["Negative numbers are not allowed"]);
            return;
        }
        if (isNaN(sellThresholdValue) || isNaN(sellOrderQuantity) || sellThresholdValue <= 0 || sellOrderQuantity <= 0) {
            setErrors(["You must enter a valid number greater than 0"]);
            return;
        }
        if (sellThresholdValue >= 100000000000000000000 || sellOrderQuantity >= 100000000000000000000) {
            setErrors(['You must enter a smaller number']);
            return;
        }
        
        if (sellOrderQuantity > user.selling_power) {
            errors.push("Not enough funds");
        }
        if (!errors.length) {
            dispatch(addSellThreshold(user.id, stockData.symbol, Number(Number(sellThresholdValue).toFixed(4)), Number(Number(sellOrderQuantity).toFixed(4))));
            setModifySellOrder(false)
        } else {
            setErrors(errors);
        }
      }
    

    const submitOrder = (type) => {
        let errors = []
        if(isNaN(Number(investValue))){
            errors.push("Letters are not allowed")
            setErrors(errors)
            return
        }
        if(investValue.toString()[0] === "-"){
            setErrors(["Negative numbers are not allowed"])
            return
        }
        if(!Number(investValue) && type === "buy"){
            setErrors(["You must enter an amount to purchase"])
            return
        }
        setErrors([])
        if(investValue >= 100000000000000000000){
            setErrors(['You must enter a smaller number'])
            return
        }
        let num = Number(investValue).toFixed(5)
        if(num[num.length-1] !== "0"){
            num = Number(num)
            if(investType === "shares"){
                setErrors(['Less than one ten-thousandth of a share'])
            }
            else if (investType === "dollars"){
                setErrors(["Less than one one-hundredth of a penny"])
            }

            return
        }

        if(!Number(investValue) && type === "sell"){
            setErrors(["You must enter an amount to sell"])
            return
        }
        if(investValue && investType === "shares" && type === "buy"){
            if(investValue*stockData.price > user.buying_power)errors.push("Not enough funds")
            if(!errors.length){
                dispatch(addHolding(stockData.symbol,Number(Number(investValue).toFixed(4)),user.id))
                dispatch(addBuyingPower(user.id,Number(-Number(stockData.price*investValue).toFixed(4))))
                setInvestValue(0)
            } else setErrors(errors)
        } else if (investValue && investType === "dollars" && type === "buy"){
            if(investValue > user.buying_power)errors.push("Not enough funds")
            if(!errors.length){
                dispatch(addHolding(stockData.symbol,Number((Number(investValue/stockData.price).toFixed(4))),user.id))
                dispatch(addBuyingPower(user.id,Number(-Number(investValue).toFixed(4))))
                setInvestValue(0)
            } else setErrors(errors)

        } else if (investValue && investType === "shares" && type === "sell"){
            if(user.holdings.filter(holding=>holding.symbol === stockData.symbol.toUpperCase()).length && user.holdings.filter(holding=>holding.symbol === stockData.symbol.toUpperCase())[0].shares >= investValue){
                dispatch(sellHolding(stockData.symbol,Number(Number(investValue).toFixed(4)),user.id))
                dispatch(addBuyingPower(user.id,Number(Number(stockData.price*investValue).toFixed(4))))
                setInvestValue(0)
            } else setErrors(["Not enough shares"])

        } else if (investValue && investType === "dollars" && type === "sell"){
            if(user.holdings.filter(holding=>holding.symbol === stockData.symbol.toUpperCase()).length && user.holdings.filter(holding=>holding.symbol === stockData.symbol.toUpperCase())[0].shares >= (investValue/stockData.price)){
                dispatch(sellHolding(stockData.symbol,Number((Number(investValue/stockData.price).toFixed(4))),user.id))
                dispatch(addBuyingPower(user.id,Number(Number(investValue).toFixed(4))))
                setInvestValue(0)
            } else setErrors(["Not enough shares"])

        }
    }

    let scatterChart = (<ScatterChart width={600} height={300} >
                          <CartesianGrid />
                          <XAxis dataKey="period" interval = {0} allowDuplicatedCategory={false}/>
                          <YAxis type="number" dataKey="data" />
                          <Legend height = {1}/>
                          <Scatter name = "Actual" data={actualScatterData} fill={performance ? "rgb(0, 200, 5)" :"rgb(255, 80, 0)"} />
                          <Scatter name = "Estimated" data={estimatedScatterData} fill={performance ? "rgb(0, 122, 4)" :"rgb(167, 53, 0)"} />
                          <Tooltip/>
                        </ScatterChart>)


        const addToList = (symbol) => {
            dispatch(toggleModalView(true))
            dispatch(addModal("add-to-watchlist"))
        }

    if(pageLoaded !== params.symbol){
        return (<div id = "react-loading-container" style = {theme === "light" ? {backgroundColor:"white"} : {backgroundColor:"black"}}><div id = "react-loading"><ReactLoading color = {theme === "light" ? "black" : "white"} height={100} width={700}/></div></div>
            );
    }
    return (
        <div id = "stockpage-outermost" style = {theme === "dark" ? {backgroundColor:"black"} : {backgroundColor:"white"}}>
        <div id = "stockpage-outer-container" style = {theme === "dark" ? {backgroundColor:"black"} : {backgroundColor:"white"}}>
            <div id = "stockpage-left-container">
                <div id = "stockpage-upper-container">
                    <div id = "stockpage-stock-value"><h1>$<Odometer value={(!isNaN(Number(stockValueDynamic)) && stockValueDynamic)? Number(stockValueDynamic) : Number(stockValue.toFixed(2))} format="(,ddd).dd" /></h1></div>
                    <div id = "stockpage-graph-container">
                        <div id = "stockpage-graph">
                            {renderLineChart}
                        </div>
                        <div id = "stockpage-graph-timeframes-container">
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("5","1D")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>1D</button></span>
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("30","1W")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>1W</button></span>
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("D","1M")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>1M</button></span>
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("D","3M")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>3M</button></span>
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("D","1Y")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>1Y</button></span>
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("M","ALL")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>ALL</button></span>
                        </div>
                    </div>
                </div>
            </div>
            <div id = "stockpage-right-container">
                <div id = "stockpage-right-inner-container">
                <div id = "stock-purchase-container" style = {{height:"600px"}}>
                    <div id = "stock-purchase-titles">
                        <div id = {performance ? "stock-buy-title-good" : "stock-buy-title-bad"} style = {buySell === "buy" ? {borderBottom:"30px"} : {}} onClick = {()=>setBuySell('buy')}>Buy {(stockData && stockData.symbol) ? stockData.symbol.toUpperCase(): ""}</div>
                        <div id = {performance ? "stock-sell-title-good" : "stock-sell-title-bad"} style = {buySell === "sell" ? {borderBottomWidth:"1px"} : {borderBottomWidth:"0px"}} onClick = {()=>setBuySell('sell')}>Sell {(stockData && stockData.symbol) ? stockData.symbol.toUpperCase(): ""}</div>
                    </div>
                    <div id = "stock-purchase-middle">
                    {errors.map((error, ind) => (
                <div className = "errors" style = {{color:"red",position:"absolute",top:"49px",width:"100%"}}key={ind}>{error}</div>
              ))}
                        <div id ="stock-purchase-inner">
                            <div id = "invest-in-container">
                                <div id = "invest-in-label">{buySell === "buy" ? "Invest In" : "Sell"}</div>
                                <select id = "invest-in-value" value = {investType} onChange = {e=>setInvestType(e.target.value)}>
                                    <option value = "shares" >Shares</option>
                                    <option value = "dollars">Dollars</option>
                                </select>
                            </div>
                            <div id = "amount-container" style = {{marginBottom:"15px", paddingBottom:"7px", borderBottom:"1px solid var(--border-color)"}}>
                                <div id = "amount-label">{investType === "shares" ? 'Shares' : 'Amount'}</div>
                                <input id = "amount-value" autoComplete = "off" value = {investValue} onChange = {e=>setInvestValue(e.target.value)} type = "text" placeholder = {investType === "shares" ? 0 :'$0.00'}></input>
                            </div>

                            {investType === "shares" ? (
                                <div id = "market-price-container">
                                    <div id = {performance ? "market-price-label-good" : "market-price-label-bad"}>Market Price</div>
                                    <div id ="market-price-value">{(stockData && stockData.price) ? `$${stockData.price}`: "-"}</div>
                                </div>
                            ) : null}

                            <div id = "est-quantity-container">
                                <div id = "est-quantity-label">{investType === "shares" ? 'Estimated Cost' : 'Est. Shares' }</div>
                                {investType === "shares" ? (
                                    <div id = "est-quantity-value">{((stockData && stockData.price) && !isNaN(Number(investValue))) ? `$${getAbbreviatedNumber(Number((stockData.price * investValue).toFixed(4)))}` : "-"}</div>
                                ) : (
                                    <div id = "est-quantity-value">{((stockData && stockData.price) && !isNaN(Number(investValue))) ? getAbbreviatedNumber(Number((investValue / stockData.price).toFixed(4))) : "-"}</div>
                                )}
                            </div>
                        </div>
                        <button id = {performance ? "review-order-button-good":"review-order-button-bad"} onClick = {()=>submitOrder(buySell)} >{buySell === "buy" ? "Purchase Stock" : "Sell Stock"}</button>
                        <div id ="stock-purchase-inner">
                          {buySell === "buy" && user?.buy_limit_orders?.find(order => order.stock_symbol === stockData.symbol) && !modifyBuyOrder ? (
                          <div>
                            <div id="amount-container">
                              <div id="est-quantity-label">Pending buy order at {buyThresholdValue} for {buyOrderQuantity} shares</div>
                            </div>
                            <button id="review-order-button-good" onClick={() => {
                              setBuyThresholdValue(0);
                              setBuyOrderQuantity(0);
                              setModifyBuyOrder(true);
                            }}>Modify Buy Order</button>
                          </div>
                        ) : (
                          buySell === "buy" && (<>
                            <div id="amount-container" style={ {marginBottom:"15px", paddingBottom:"7px", borderBottom:"1px solid var(--border-color)"}}>
                              <div id="amount-label">Auto Buy At Price</div>
                              <input 
                                id="amount-value" 
                                autoComplete="off" 
                                value={buyThresholdValue} 
                                onChange={e => setBuyThresholdValue(e.target.value)} 
                                type="text" 
                                placeholder={buyThresholdValue}
                              />
                            </div>
                            <div id="amount-container" style={ {marginBottom:"15px", paddingBottom:"7px", borderBottom:"1px solid var(--border-color)"}}>
                              <div id="amount-label">Auto Buy Quantity</div>
                              <input 
                                id="amount-value" 
                                autoComplete="off" 
                                value={buyOrderQuantity} 
                                onChange={e => setBuyOrderQuantity(e.target.value)} 
                                type="text" 
                                placeholder={buyOrderQuantity}
                              />
                            </div>
                            <button 
                              id="review-order-button-good" 
                              disabled={parseFloat(buyThresholdValue) < 0 || parseFloat(buyOrderQuantity) < 0} 
                              onClick={() => submitBuyLimit()}
                            >
                              Set Auto Buy Order
                            </button>
                          </>)
                        )}


                        {buySell === "sell" && user?.sell_limit_orders?.find(order => order.stock_symbol === stockData.symbol) && !modifySellOrder ? (
                          <div>
                            <div id="amount-container">
                              <div id="est-quantity-label">Pending sell order at {sellThresholdValue} for {sellOrderQuantity} shares</div>
                            </div>
                            <button id="review-order-button-good" onClick={() => {
                              setSellThresholdValue(0);
                              setSellOrderQuantity(0);
                              setModifySellOrder(true);
                            }}>Modify Sell Order</button>
                          </div>
                        ) : (
                          buySell === "sell" && (<>
                            <div id="amount-container" style={ {marginBottom:"15px", paddingBottom:"7px", borderBottom:"1px solid var(--border-color)"}}>
                              <div id="amount-label">Auto Sell At Price</div>
                              <input 
                                id="amount-value" 
                                autoComplete="off" 
                                value={sellThresholdValue} 
                                onChange={e => setSellThresholdValue(e.target.value)} 
                                type="text" 
                                placeholder={sellThresholdValue}
                              />
                            </div>
                            <div id="amount-container" style={ {marginBottom:"15px", paddingBottom:"7px", borderBottom:"1px solid var(--border-color)"}}>
                              <div id="amount-label">Auto Sell Quantity</div>
                              <input 
                                id="amount-value" 
                                autoComplete="off" 
                                value={sellOrderQuantity} 
                                onChange={e => setSellOrderQuantity(e.target.value)} 
                                type="text" 
                                placeholder={sellOrderQuantity}
                              />
                            </div>
                            <button 
                              id="review-order-button-good" 
                              disabled={parseFloat(sellThresholdValue) < 0 || parseFloat(sellOrderQuantity) < 0} 
                              onClick={() => submitSellLimit()}
                            >
                              Set Auto Sell Order
                            </button>
                          </>)
                        )}
                        </div>
                      </div>
                    <div id = {performance ? "stock-purchase-lower-good" : "stock-purchase-lower-bad"}>
                        {(buySell === "buy" && user) ? `$${getAbbreviatedNumber(user.buying_power)} buying power available`: `${currentShares === 0 ? `You have no shares available to sell` : `${currentShares === 1 ? `${getAbbreviatedNumber(currentShares)} share available`: `${getAbbreviatedNumber(currentShares)} shares available`}` }`}
                    </div>
                </div>
                <div id = "add-to-list-container">
                    <button onClick = {()=>addToList(stockData.symbol)}id = {performance ? "add-to-list-button-good" : "add-to-list-button-bad"}><AiOutlinePlus/> Add to Lists</button>
                </div>
                </div>
            </div>
            <FormModal symbol={stockData && stockData.symbol} performance = {performance}/>
        </div>
        </div>
    )
}

export default Stockpage

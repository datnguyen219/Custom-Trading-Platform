import {useSelector,useDispatch} from "react-redux"
import { useState, useEffect } from "react"
import "./Dashboard.css"
import { addBuyingPower, toggleModalView, addModal, addWatchlistThunk, editWatchlistThunk, deleteWatchlistThunk, addModalInfo, deleteWatchlistStock} from "../../store/session";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie
  } from 'recharts';
import Odometer from 'react-odometerjs';
import {CgInfinity} from "react-icons/cg"
import { getPortfolioData } from "../../store/portfolio";
import ReactLoading from "react-loading"
import { getWatchlistGraphData,getHoldingGraphData } from "../../store/stocks";
import 'odometer/themes/odometer-theme-minimal.css';
import {IoIosArrowDown,IoIosArrowUp} from "react-icons/io"
import {BiDotsHorizontal} from "react-icons/bi"
import {BsGear, BsFillXCircleFill} from "react-icons/bs"
import {NavLink} from "react-router-dom"
import {MdDeleteOutline} from "react-icons/md"
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


const Dashboard = () => {
    const dispatch = useDispatch()
    const [portfolioValue,setPortfolioValue] = useState(0.00)
    const [portfolioValueDynamic,setPortfolioValueDynamic] = useState(0)
    const [buyingPower,toggleBuyingPower] = useState(false)
    const [buyingPowerValue,editBuyingPowerValue] = useState("")
    const [openLists,setOpenLists] = useState([])
    const [watchlistInputValue,setWatchlistInputValue] = useState("")
    const [graphData,setGraphData] = useState("")
    const [yMax,setYmax] = useState(0)
    const [yMin,setYmin] = useState(Infinity)
    const [dotsOpen,setDotsOpen] = useState([])
    const [interval,setTimeInterval] = useState("day")
    const [depositClick,setDepositClick] = useState(false)
    const [renderLineChart,setRenderLineChart] = useState("")
    const [performance,setPerformance] = useState(true)
    const [errors,setErrors] = useState([])
    const [buyingPowerErrors,setBuyingPowerErrors] = useState([])
    const [watchlistChanges,setWatchlistChanges] = useState({})
    const [watchlistPrices,setWatchlistPrices] = useState({})
    const [holdingChanges,setHoldingChanges] = useState({})
    const [holdingPrices,setHoldingPrices] = useState({})
    const theme = useSelector(state=>state.session.theme)
    const user = useSelector(state=>state.session.user)
    const portfolioData = useSelector(state=>state.portfolio.portfolioData)
    const watchlistStockData = useSelector(state=>state.stocks.watchlistStockData)
    const holdingStockData = useSelector(state => state.stocks.holdingStockData)
    const [pageLoaded,setPageLoaded] = useState("")

    useEffect(()=>{setErrors([])},[watchlistInputValue])
    useEffect(()=>{
        if(watchlistStockData){
          let newChanges = {}
          let newPrices = {}
          for(let symbol of Object.keys(watchlistStockData)){
            newChanges[symbol] = watchlistStockData[symbol].change
            newPrices[symbol] = watchlistStockData[symbol].price
          }
          setWatchlistChanges(newChanges)
          setWatchlistPrices(newPrices)

            for(let symbol of Object.keys(watchlistStockData)){
                if(watchlistStockData[symbol].data[watchlistStockData[symbol].data.length-1]){
                    if(watchlistStockData[symbol].data[watchlistStockData[symbol].data.length-1].price > watchlistStockData[symbol].data[0].price){
                        watchlistStockData[symbol].graph=(
                                <LineChart width = {90} height = {45} data={watchlistStockData[symbol].data}>
                                    <Line dot = {false} type="monotone" dataKey="price" stroke = "rgb(0, 200, 5)"/>
                                    <XAxis dataKey="dateTime" angle={0} textAnchor="end" tick={{ fontSize: 13 }} />
                                    <YAxis tick = {false} axisLine={false} tickline = {false} width = {10} domain={[watchlistStockData[symbol].min,watchlistStockData[symbol].max]} allowDecimals={false}/>
                                </LineChart>

                        )
                    } else {
                        watchlistStockData[symbol].graph=(
                                <LineChart width = {90} height = {45} data={watchlistStockData[symbol].data}>
                                    <Line dot = {false} type="monotone" dataKey="price" stroke = "rgb(255, 80, 0)"/>
                                    <XAxis dataKey="dateTime" angle={0} textAnchor="end" tick={{ fontSize: 13 }} />
                                    <YAxis tick = {false} axisLine={false} tickline = {false} width = {10} domain={[watchlistStockData[symbol].min,watchlistStockData[symbol].max]} allowDecimals={false}/>
                                </LineChart>
                        )
                    }
                }
            }
            let foundAll = true
            for(let symbol of Object.keys(watchlistStockData)){
                if(watchlistStockData[symbol]){
                    if(!watchlistStockData[symbol].graph){
                        foundAll = false
                    }
                }}
                if(foundAll)setPageLoaded("Dashboard")
        }
    },[watchlistStockData])


    useEffect(()=>{
        if(holdingStockData){
          let newChanges = {}
          let newPrices = {}
          for(let symbol of Object.keys(holdingStockData)){
            newChanges[symbol] = holdingStockData[symbol].change
            newPrices[symbol] = holdingStockData[symbol].price
          }
          setHoldingChanges(newChanges)
          setHoldingPrices(newPrices)

            for(let symbol of Object.keys(holdingStockData)){
                if(holdingStockData[symbol].data[holdingStockData[symbol].data.length-1]){
                if(holdingStockData[symbol].data[holdingStockData[symbol].data.length-1].price > holdingStockData[symbol].data[0].price){
                    holdingStockData[symbol].graph=(
                            <LineChart width = {90} height = {30} data={holdingStockData[symbol].data}>
                                <Line dot = {false} type="monotone" dataKey="price" stroke = "rgb(0, 200, 5)"/>
                                <XAxis dataKey="dateTime" angle={0} textAnchor="end" tick={{ fontSize: 12 }} hide={true}/>
                                <YAxis tick = {false} axisLine={false} tickline = {false} width = {10} domain={[holdingStockData[symbol].min,holdingStockData[symbol].max]} allowDecimals={false} hide={true}/>
                            </LineChart>
                    )
                } else {
                    holdingStockData[symbol].graph=(
                            <LineChart width = {90} height = {30} data={holdingStockData[symbol].data}>
                                <Line dot = {false} type="monotone" dataKey="price" stroke = "rgb(255, 80, 0)"/>
                                <XAxis dataKey="dateTime" angle={0} textAnchor="end" tick={{ fontSize: 12 }} hide={true}/>
                                <YAxis tick = {false} axisLine={false} tickline = {false} width = {10} domain={[holdingStockData[symbol].min,holdingStockData[symbol].max]} allowDecimals={false} hide={true}/>
                            </LineChart>

                    )
                }

            }}
        }
    },[holdingStockData])

    useEffect(()=>{
        if(user){
          let allWatchListStocks = []
          let allWatchListStockSymbols = []
          editBuyingPowerValue(user.buyingPower)
          for(let watchlist of user.watchlists){
              allWatchListStocks = [...allWatchListStocks,...watchlist.stocks.filter(stock => !allWatchListStockSymbols.includes(stock.symbol))]
              allWatchListStockSymbols = [...allWatchListStockSymbols,...watchlist.stocks.map(stock => stock.symbol)]
          }
          dispatch(getWatchlistGraphData(allWatchListStocks))
          dispatch(getHoldingGraphData(user.holdings))

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
        }
    },[])

    useEffect(()=>{
        if(portfolioData){
            setGraphData(portfolioData.data)
            setYmin(portfolioData.min)
            setYmax(portfolioData.max)
        }
    },[portfolioData])


    const handleWatchlistStockDelete = (stock,watchlist) => {
        dispatch(deleteWatchlistStock(watchlist.id,stock.symbol,user.id))
    }

    const toggleOpenLists = (watchlist) => {
        let newList = []
        let newData = {}
        let found = false

        for(let i=0;i<openLists.length;i++){
            if(openLists[i] !== watchlist.id){
                newList.push(openLists[i])
            } else {
                found = true
            }
        }

        if (!found){
            newList.push(watchlist.id)

        }
        setOpenLists(newList)
    }

    useEffect(() => {
      if (interval) {
        dispatch(getPortfolioData(user.holdings, interval));
      }
    }, [interval, user.holdings, dispatch]);
    
    const timeFrameClick = (time, frame) => {
      setTimeInterval(frame);
    };



    const CustomTooltip = ({ active, payload }) => {
    // if (!active || !tooltip)    return null
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
            setPortfolioValueDynamic(payload[0].payload.price)
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
    setBuyingPowerErrors([])
},[buyingPowerValue])

const chartHoverFunction = (e) => {
    if(e.activePayload){
        setPortfolioValueDynamic(e.activePayload[0].payload.price);
    }
}

const deposit = (value) => {
    if(!value){
        if(isNaN(Number(buyingPowerValue))){
            setBuyingPowerErrors(["Letters are not allowed"])
            return
        }
        if(buyingPowerValue.toString()[0] === "-"){
            setBuyingPowerErrors(["Negative numbers are not allowed"])
            return
        }
        if(!Number(buyingPowerValue)){
            setBuyingPowerErrors(["You must deposit more than $0"])
            return
        }
        let num = Number(buyingPowerValue).toFixed(5)

        if(buyingPowerValue>= 100000000000000000000){
            setBuyingPowerErrors(['You must enter a smaller number'])
            return
        }
        if(num[num.length-1] !== "0"){
            num = Number(num)
            setBuyingPowerErrors(["Less than one one-hundredth of a penny"])
            return
        }
        dispatch(addBuyingPower(user.id,Number(Number(buyingPowerValue).toFixed(4))))
    }
    setDepositClick(value)
    editBuyingPowerValue("")
}


const portfolioReset = (e) => {
    if(portfolioData?.data){
        setPortfolioValueDynamic(portfolioData.data[portfolioData.data.length-1].price)
    } else {
        setPortfolioValueDynamic(0)
    }
}

useEffect(()=>{
    portfolioReset()
},[portfolioData])


const deleteListHandler = (watchlist) => {
    setDotsOpen(false)
    dispatch(deleteWatchlistThunk(watchlist.id))
}

const editListHandler = (watchlist) => {
    setDotsOpen(false)
    dispatch(addModal("edit-watchlist"))
    dispatch(addModalInfo(watchlist))
    dispatch(toggleModalView(true))

}

const handleOpenDots = (e,watchlist) => {

    e.stopPropagation()

    if(dotsOpen === watchlist.id){
        setDotsOpen("")
    }
    else setDotsOpen(watchlist.id)
}

    useEffect(()=>{
      if(graphData){
        if(graphData.length && graphData[0] !== "no_data"){

            if(graphData[graphData.length-1].price > graphData[0].price){
              setPerformance(true)
              setRenderLineChart((
                  <LineChart onMouseMove = {e=> chartHoverFunction(e)} onMouseLeave = {e=>portfolioReset(e)} width={1000} height={700} data={graphData}>
                    <Line dot = {false} type="monotone" dataKey="price" stroke="rgb(0, 200, 5)" />
                    <XAxis tickSize = {1.5} tick = {false} interval={0} axisLine = {false} dataKey="dateTime" angle={0} textAnchor="end" />
                    <YAxis tick = {false} axisLine = {false} tickLine = {false} domain={[yMin-1,yMax+1]} allowDecimals={false}/>
                    <Tooltip position={{ y: -16 }} cursor = {true} content = {<CustomTooltip/>}/>
                  </LineChart>))
            } else {
                setPerformance(false)
                setRenderLineChart((
                    <LineChart onMouseMove = {e=> chartHoverFunction(e)} onMouseLeave = {e=>portfolioReset(e)} width={1000} height={700} data={graphData}>
                      <Line dot = {false} type="monotone" dataKey="price" stroke="rgb(255, 80, 0)" />
                      <XAxis  tick = {false} axisLine = {false} dataKey="dateTime" angle={0} textAnchor="end" />
                      <YAxis tick = {false} axisLine = {false} tickLine = {false} domain={[yMin-1,yMax+1]} allowDecimals={false}/>
                      <Tooltip position={{ y: -16 }} cursor = {true} content = {<CustomTooltip/>}/>
                    </LineChart>))
            }
        }
        else if (portfolioData && portfolioData.data[0] === "no_data"){
            setRenderLineChart((        
              <LineChart onMouseMove = {e=> chartHoverFunction(e)} onMouseLeave = {e=>portfolioReset(e)} width={1000} height={700} data={graphData}>
                <Line dot = {false} type="monotone" dataKey="price" stroke="rgb(255, 80, 0)" />
                <XAxis  axisLine = {false} dataKey="dateTime" angle={0} textAnchor="end" />
                <YAxis tick = {false} axisLine = {false} tickLine = {false} domain={[yMin-1,yMax+1]} allowDecimals={false}/>
                <Tooltip position={{ y: -16 }} cursor = {true} content = {<CustomTooltip/>}/>
              </LineChart>))
        }
      }
    },[graphData])

    if(pageLoaded !== "Dashboard"){
        return (<div id = "react-loading"><ReactLoading color = {theme === "light" ? "black" : "white"} height={100} width={700}/></div>
            );
    }

    return (
        <div id = "dashboard-outermost" style = {theme === "dark" ? {backgroundColor:"black"} : {backgroundColor:"white"}}>
        <div id = "dashboard-outer-container" style = {theme === "dark" ? {backgroundColor:"black"} : {backgroundColor:"white"}}>

            <div id = "dashboard-left-container">
                <div id = "dashboard-upper-container">
                    <div id = "dashboard-portfolio-value"><h1>$<Odometer value={portfolioValueDynamic ? Number(portfolioValueDynamic.toFixed(2)) : Number(portfolioValue.toFixed(2))} format="(,ddd).dd" /></h1></div>
                    <div id = "dashboard-graph-container">
                        <div id = "dashboard-graph">{renderLineChart}</div>
                        <div id = "dashboard-graph-timeframes-container">
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("5","1D")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>1D</button></span>
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("30","1W")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>1W</button></span>
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("D","1M")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>1M</button></span>
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("D","3M")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>3M</button></span>
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("D","1Y")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>1Y</button></span>
                            <span className = "stockpage-graph-timeframe"><button onClick = {()=>{timeFrameClick("M","ALL")}} className = {performance ? "dashboard-graph-timeframe-button-good" : "dashboard-graph-timeframe-button-bad"}>ALL</button></span>
                        </div>
                    </div>

                    <div id = {buyingPower ? "dashboard-buying-power-container-closed" : "dashboard-buying-power-container" } >
                        <div id = {buyingPower ? "dashboard-buying-power-container-heading-open" : "dashboard-buying-power-container-heading-closed"} onClick={()=>toggleBuyingPower(!buyingPower)}>
                            <div id = "dashboard-buying-power-text">Buying Power</div>
                            <div id = {buyingPower ? "dashboard-buying-power-value-invisible" : "dashboard-buying-power-value-visible" }>${(user && user.buying_power) ? user.buying_power : 0.00.toFixed(2)}</div>
                        </div>
                            <div id = {buyingPower ? "dashboard-buying-power-container-bottom-visible" : "dashboard-buying-power-container-bottom-invisible"}>
                                <div id = "dashboard-buying-power-container-left">
                                    <div id = "brokerage-cash-container">
                                        <div>Brokerage Cash</div>
                                        <div style = {{fontSize:"30px"}}><CgInfinity/></div>
                                    </div>
                                    <div id = "buying-power-container">
                                        <div>Buying Power</div>
                                        <div>${(user && user.buying_power) ? user.buying_power : 0.00.toFixed(2)}</div>
                                    </div>
                                    <button id = {performance ? "buying-power-deposit-button-good" : "buying-power-deposit-button-bad"} onClick = {()=>deposit(!depositClick)} >{depositClick ? "Confirm" : `Deposit Funds`}</button>
                                </div>
                                <div id = "dashboard-buying-power-container-right">
                                    <div id = "buying-power-description">Buying Power represents the total value of assets you can purchase.</div>
                                    {buyingPowerErrors.map((error, ind) => (
                        <div className = "errors" style = {{color:"red",position:"absolute",top:"115px",right:"25px",width:"100%"}}key={ind}>{error}</div>
                    ))}
                                    <input type = "text" placeholder = "Deposit Amount" id = "buying-power-deposit-input" value = {buyingPowerValue} onChange = {(e)=>editBuyingPowerValue(e.target.value)} style = {depositClick ? {display:"block"}: {display:"none"}}></input>
                                </div>
                        </div>
                    </div>
                </div>

            </div>
            <div id = "watchlist-outer-container">
                    <div id = "stocks-list-outer-title">Your Stocks</div>
                    {user && user.holdings.map(stock => {
                        return (
                            <NavLink key = {stock.symbol} className = "holding-stock-navlink" to = {`/stocks/${stock.symbol}`}>
                            <div className = "watchlist-stock-outer-container">
                                <div className = "watchlist-stock-symbol" style = {{marginLeft:"25px"}}>{stock.symbol}</div>
                                <div className = "watchlist-stock-graph">{(holdingStockData && holdingStockData[stock.symbol]) ? holdingStockData && holdingStockData[stock.symbol].graph : "-"}</div>
                                <div className = "watchlist-stock-price-container">
                                <div className = "watchlist-stock-price">${(holdingPrices[stock.symbol]) ? holdingPrices[stock.symbol].toFixed(2) : "-"}</div>
                                <div className = "watchlist-stock-change" style = {holdingChanges[stock.symbol] < 0 ? {color:"rgb(255, 80, 0)"}:{color:"rgb(0, 200, 5)"}}>{(holdingChanges[stock.symbol] && !isNaN(Number(holdingChanges[stock.symbol]))) ? `${holdingChanges[stock.symbol].toFixed(2)}%` : "" }</div>
                                </div>
                            </div>
                            </NavLink>
                        )
                    })}

                    {user && user.watchlists.map(watchlist=>{
                        return (
                            <div key = {watchlist.id} className = "watchlist-inner-container">
                                <div className = "watchlist-title" onClick = {()=>toggleOpenLists(watchlist)}>
                                    <div className = "watchlist-name">{watchlist.name}</div>
                                    <div className = "watchlist-title-right">
                                        <div className = "watchlist-dots" onClick = {(e)=>handleOpenDots(e,watchlist)}><BiDotsHorizontal/></div>
                                        <div className = "watchlist-arrow"> {openLists.includes(watchlist.id) ? (<IoIosArrowUp/>) : (<IoIosArrowDown/>)}</div>

                                    </div>
                                    <div className = "watchlist-dots-dropdown" style = { dotsOpen === watchlist.id ? {position:"absolute", display:"flex", zIndex:100} :{display:"none"}}>
                                            <div className = "watchlist-edit" onClick = {()=>editListHandler(watchlist)}><BsGear/> Edit List</div>
                                            <div className = "watchlist-delete" onClick = {()=>deleteListHandler(watchlist)}><BsFillXCircleFill/> Delete List</div>
                                    </div>

                                    </div>
                                    {watchlist.stocks.map(stock=>{
                                        return (
                                            <div key = {stock.symbol} className = "watchlist-stock-outer-container" style = {openLists.includes(watchlist.id) ? {display:"flex"} : {display:"none"}}>
                                            <div className = "watchlist-stock-delete">{<MdDeleteOutline onClick = {()=>handleWatchlistStockDelete(stock,watchlist)}/>}</div>
                                            <div className = "watchlist-stock-inner-container">
                                            <NavLink  className = "watchlist-stock-navlink" to = {`/stocks/${stock.symbol}`}>
                                                <div className = "watchlist-stock-symbol">{stock.symbol}</div>
                                                <div className = "watchlist-stock-graph">{(watchlistStockData && watchlistStockData[stock.symbol]) ? watchlistStockData && watchlistStockData[stock.symbol].graph : "-"}</div>
                                                <div className = "watchlist-stock-price-container">
                                                    <div className = "watchlist-stock-price">${watchlistPrices[stock.symbol] ? watchlistPrices[stock.symbol].toFixed(2) : "-"}</div>
                                                    <div className = "watchlist-stock-change" style = {watchlistChanges[stock.symbol] < 0 ? {color:"rgb(255, 80, 0)"}:{color:"rgb(0, 200, 5)"}}>{watchlistChanges[stock.symbol] && watchlistChanges[stock.symbol].toFixed(2)}%</div>
                                                </div>
                                            </NavLink>
                                            </div>
                                            </div>
                                        )
                                    })}

                            </div>
                        )})}
            </div>

        </div>
        </div>

    )
}

export default Dashboard

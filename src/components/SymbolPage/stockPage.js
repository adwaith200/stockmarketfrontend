import React from "react";
import firebase from "firebase/app";
import {defaults} from "react-chartjs-2";
import {Link} from "react-router-dom";
import "chartjs-plugin-annotation";

import News from "./News.js";
import Leftbar from "../Elements/leftbar";
import Topbar from "../Elements/topbar";
import Loader from "../Elements/Loader.js";
import FullChart from "./FullChart";
import KeyInfo from "./KeyInfo";

defaults.global.defaultFontStyle = "Bold";
defaults.global.defaultFontFamily = "Quantico";
defaults.global.animation.duration = 200;

const db = firebase.firestore();

var options = {
  layout: {
    padding: {
      right: 25,
      left: 25,
    },
  },
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label(tooltipItems, data) {
        return `INR${tooltipItems.yLabel}`;
      },
    },
    displayColors: false,
  },
  hover: {
    mode: "index",
    intersect: false,
  },
  maintainAspectRatio: false,
  responsive: true,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
      },
    ],
    fontStyle: "bold",
    yAxes: [
      {
        gridLines: {
          color: "rgba(0, 0, 0, 0)",
        },
        fontStyle: "bold",

        ticks: {
          callback(value) {
            return "$" + value.toFixed(2);
          },
        },
      },
    ],
  },
  elements: {
    point: {
      radius: 0,
    },
    line: {
      borderCapStyle: "round",
      borderJoinStyle: "round",
    },
  },
};

const apiKeys = [
  "SAOS0Y8B63XM4DPK",
  "4LPH6E70R1XQR2L5",
  "NOBPQ2OPX7E1XRT3",
  "7V0Q0N46CBIPHA2K",
];

let symbol="TCS.NS";

// CHARTS



let stockData = {};
let keyData = [];
let keyDataLabel = [];
let labels=[]
let chartData=[]


export default class stockPage extends React.Component {
 
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      loaded: "",
      fundsWithoutCommas: "",
      accountValue: "",
      changeColor: "",
      extendedColor: "",
      marketStatus: "",
      valid: "",
      latestPrice: "",
      buyConfirmation: "",
      keyData:[],
      keyDataLabel:[],
      chartData1:[],
      labels:[],
    };

    
    this.results = React.createRef();
    this.buyInput = React.createRef();
    this.searchBar = React.createRef();
    this.searchBarEl = React.createRef();
    this.day = React.createRef();
    this.month = React.createRef();
    this.year = React.createRef();
    this.years = React.createRef();
    this.ytd = React.createRef();

   

    this.data1 = canvas => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 600, 10);
      gradient.addColorStop(0, "#7c83ff");
      gradient.addColorStop(1, "#7cf4ff");
      let gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
      gradientFill.addColorStop(0, "rgba(124, 131, 255,.3)");
      gradientFill.addColorStop(0.2, "rgba(124, 244, 255,.15)");
      gradientFill.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      return {
        labels:this.labels,
        datasets: [
          {
            lineTension: 0.1,
            label: "",
            pointBorderWidth: 0,
            pointHoverRadius: 0,
            borderColor: gradient,
            backgroundColor: gradientFill,
            pointBackgroundColor: gradient,
            fill: true,
            borderWidth: 2,
            data: this.chartData1,
          },
        ],
      };
    };
  }

  getOneMonthChart(){
    fetch(`http://localhost:5000/stockdetail/${symbol}`)
    .then(res=>res.json())
    .then(res=>{
      this.chartData1=Object.values(res.Close);
      this.labels=Object.keys(res.Close);
      let size=Object.values(res.Close).length
      let changed=(Object.values(res.Close)[size-1].toFixed(2)-Object.values(res.Close)[0].toFixed(2))/(Object.values(res.Close)[0].toFixed(2))*100
      let color="";
      if(changed<0)
        color="#F45385"
      else 
        color="#3ae885"
      this.setState({
        ...this.state,
        valid:true,
        loaded:true,
        latestPrice:Object.values(res.Close)[size-1].toFixed(2),
        change:Object.values(res.Close)[0].toFixed(2),
        changePercent:changed.toFixed(2),
        changeColor: color,
        keyDataLabel:["Month High","Month Low","Volume"],
        keyData:[res.high.toFixed(2),res.low.toFixed(2),res.volume.toFixed(2)]
      });
      console.log(this.state.keyData);
    });
  }

  getOneMonthFutureChart(){
    fetch(`http://localhost:5000/stockforecast/${symbol}`)
    .then(res=>res.json())
    .then(res=>{
      this.chartData1=Object.values(res.future);
      this.labels=Object.keys(res.future);
      
      this.setState({
        ...this.state,
        valid:true,
        loaded:true,
      });
      console.log(this.state)
    });
  }
  
  componentDidMount() {
    this._isMounted = true;
    
    this.setState({
      marketStatus: true,
    });

    symbol = window.location.href.split("/")[
      window.location.href.split("/").length - 1
    ];

    console.log("Symbol is ",symbol);
    
    this.getOneMonthChart();

    

  }
 
  componentWillUnmount() {
    this._isMounted = false;
  }

  async handleBuyStock(num) {
    let obj={
      "name":firebase.auth().currentUser.displayName,
      "symbol":symbol,
      "shares":this.buyInput.current.value,
      "gainloss":this.state.changePercent,
      "boughtPrice":this.buyInput.current.value * this.state.latestPrice
    }

    console.log(obj);
    
    const response =await fetch("http://localhost:5000/stockorder", {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(obj) // body data type must match "Content-Type" header
    }).then(()=>window.location.reload());;
    console.log(response.json());
    this.setState({
      ...this.state,
      buyConfirmation:false
    })
  }

  getFunds() {
    if (this._isMounted) {
      this.setState({
        fundsWithoutCommas: "",
      });
    }
    let user = firebase.auth().currentUser.uid;
    let docRef = db.collection("users").doc(user);

    docRef
      .get()
      .then(doc => {
        if (this._isMounted) {
          this.setState({
            funds: "INR" + this.numberWithCommas(doc.data()["currentfunds"]),
          });
          this.setState({
            fundsWithoutCommas: doc.data()["currentfunds"],
          });
        }
      })
      .catch(function(error) {
        console.log("Error getting document:", error);
      });
  }

  render() {
    return (
      <section className="stock">
        {this.state.buyConfirmation === true && <div className="black-bg" />}
        {this.state.buyConfirmation === true && (
          <div className="buyConfirmation">
            <h3>
              Are you sure you want to buy {this.buyInput.current.value} shares
              of {symbol} for{" "}
              <span style={{fontWeight: "bold"}}>
                {parseFloat(
                  (
                    this.buyInput.current.value * this.state.latestPrice
                  ).toFixed(2),
                )}
              </span>{" "}
              INR
            </h3>
            <div>
              <button
                className="stockPage__buy-button"
                onClick={() => {
                  if (
                    true
                  ) {
                    console.log("Confirm hit")
                    this.handleBuyStock(this.buyInput.current.value);
                  } else if (this._isMounted) {
                    console.log("Not confirmed");
                    this.setState({
                      buyConfirmation: false,
                    });
                  }
                }}>
                CONFIRM
              </button>
              <button
                className="stockPage__buy-button cancel"
                onClick={() => {
                  if (this._isMounted) {
                    this.setState({
                      buyConfirmation: false,
                    });
                  }
                }}>
                CANCEL
              </button>
            </div>
          </div>
        )}
        {this.state.valid === "" && <Loader />}
        {this.state.valid && (
          <div style={{display: "flex", height: "100%"}}>
            <Leftbar />
            <div className="stockPage">
              <Topbar />
              {this.state.loaded ? (
                <div className="stockPage__top">
                  <FullChart
                    getOneMonthChart={this.getOneMonthChart.bind(this)}
                    getOneMonthFutureChart={this.getOneMonthFutureChart.bind(this)}
                    data1={this.data1}
                    stockData={stockData}
                    month={this.month}
                  />
                  <div className="stockPage__trade">
                    <div className="stockPage__mobile">
                      <h4>{stockData.name}</h4>
                      <div className="stockPage__trade-top">
                        <h2>INR {this.state.latestPrice}</h2>
                        <h6 style={{color: this.state.changeColor}}>
                          {this.state.change} ({this.state.changePercent}%)
                        </h6>
                      </div>
                    </div>
                    {!this.state.marketStatus &
                    (stockData.extendedChange !== null) ? (
                      <h6>
                        Extended Hours:{" "}
                        <span style={{color: this.state.extendedColor}}>
                          INR{stockData.extendedPrice} ({stockData.extendedChange}
                          )
                        </span>
                      </h6>
                    ) : (
                      <div />
                    )}
                    <h5>Buy {symbol}</h5>
                    <div className="stockPage__buy-container">
                      <input
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        className="stockPage__buy-input"
                        ref={this.buyInput}
                        id="buy-input"
                        type="number"
                        
                      />

                      <button
                        onClick={function() {
                         
                          let value = this.buyInput.current.value;
                          console.log("Clicked buy",value,this.state.marketStatus,this._isMounted);
                          if (   
                            value > 0
                          )
                          {
                            console.log("bought");
                            this.setState({
                              buyConfirmation: true,
                            });
                          } else {
                            console.log("not bought");
                            this.buyInput.current.style.border =
                              "solid 1px #f45485";
                          }
                        }.bind(this)}
                        className="stockPage__buy-button">
                        BUY
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Loader />
              )}
              <div className="stockPage__keyStats">
                <KeyInfo keyDataLabel={this.state.keyDataLabel} keyData={this.state.keyData} />
              </div>
            </div>
          </div>
        )}
        {this.state.valid === false && (
          <div className="wrongSymbol">
            <h1>Unknown Symbol</h1>
            <div
              className="topbar__searchbar"
              ref={this.searchBar}
              id="topbar__searchbar">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}>
                <svg
                  enableBackground="new 0 0 250.313 250.313"
                  version="1.1"
                  viewBox="0 0 250.313 250.313"
                  xmlSpace="preserve"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="m244.19 214.6l-54.379-54.378c-0.289-0.289-0.628-0.491-0.93-0.76 10.7-16.231 16.945-35.66 16.945-56.554 0-56.837-46.075-102.91-102.91-102.91s-102.91 46.075-102.91 102.91c0 56.835 46.074 102.91 102.91 102.91 20.895 0 40.323-6.245 56.554-16.945 0.269 0.301 0.47 0.64 0.759 0.929l54.38 54.38c8.169 8.168 21.413 8.168 29.583 0 8.168-8.169 8.168-21.413 0-29.582zm-141.28-44.458c-37.134 0-67.236-30.102-67.236-67.235 0-37.134 30.103-67.236 67.236-67.236 37.132 0 67.235 30.103 67.235 67.236s-30.103 67.235-67.235 67.235z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  />
                </svg>
                <input
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  type="text"
                  id="searchBar"
                  ref={this.searchBarEl}
                  onKeyUp={this.searchStocks}
                  placeholder="Search by symbol"
                  onFocus={() => {
                    if (this.results.current.firstChild) {
                      this.results.current.style.display = "flex";
                    }
                    this.searchBar.current.style.boxShadow =
                      "0px 0px 30px 0px rgba(0,0,0,0.10)";
                    this.results.current.style.boxShadow =
                      "0px 30px 20px 0px rgba(0,0,0,0.10)";
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      if (this.results.current) {
                        this.results.current.style.display = "none";
                      }
                    }, 300);
                    this.searchBar.current.style.boxShadow = "none";
                  }}
                  autoComplete="off"
                />
              </div>
              <ul className="topbar__results" id="results" ref={this.results} />
            </div>
            <h2>OR</h2>
            <h3>
              Go to <Link to="/dashboard">Dashboard</Link>
            </h3>
          </div>
        )}
      </section>
    );
  }
}

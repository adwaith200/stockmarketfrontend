import React from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import {Link} from "react-router-dom";
import Leftbar from "./leftbar";

const db = firebase.firestore();

let allSymbols;
let admin;

export default class Topbar extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      fundsLoader: "",
      funds: "",
      menuActive: false,
    };

    this.mobileMenu = React.createRef();
    this.hamburger = React.createRef();
    this.results = React.createRef();
  }


  numberWithCommas(x) {
    return x.toLocaleString();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async componentDidMount() {
    this._isMounted = true;
    let user = firebase.auth().currentUser.uid;
    
    db.collection("users")
      .doc(user)
      .onSnapshot(
        function(doc) {
          if (typeof doc.data() !== "undefined" && this._isMounted) {
            this.setState({
              ...this.state,
              fundsLoader: true,
            });
            admin = doc.data()["admin"];
          }
        }.bind(this),
      );
    let mobileMenu = this.mobileMenu.current;
    let hamburger = this.hamburger.current;
    hamburger.addEventListener("click", e => {
      e.currentTarget.classList.toggle("is-active");
      if (!this.state.menuActive && this._isMounted) {
        mobileMenu.style.display = "flex";
        this.setState({menuActive: true});
        setTimeout(() => {
          mobileMenu.style.left = "0px";
        }, 200);
      } else if (this._isMounted) {
        mobileMenu.style.left = "-100%";
        this.setState({menuActive: false});
        setTimeout(() => {
          mobileMenu.style.display = "none";
        }, 400);
      }
    });
    
    let obj={
      "name":firebase.auth().currentUser.displayName,
      "currency":100000
    }
    fetch("http://localhost:5000/user",{
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
    }).then(res=>res.json())
    .then(response=>{
      this.setState({
        ...this.state,
        funds: response.currency.toFixed(2),
        fundsLoader: true,
      });
    })
    
  }
  render() {
    let user = firebase.auth().currentUser.displayName;
    return (
      <nav style={{display: "flex", alignItems: "center"}}>
        <div ref={this.mobileMenu} className="mobileMenu" id="mobileMenu">
          <Leftbar></Leftbar>
        </div>
        <div className="topbar">
          <div className="hamburger" ref={this.hamburger}>
            <div className="hamburger__container">
              <div className="hamburger__inner" />
              <div className="hamburger__hidden" />
            </div>
          </div>
          
          <div className="topbar__container">
            <div className="topbar__user">
              {admin && (
                <Link to="/admin">
                  <div className="topbar__dev">
                    <h4>DEV</h4>
                  </div>
                </Link>
              )}
              {this.state.fundsLoader === true && (
                <div className="topbar__power">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g>
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M18 7h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h15v4zM4 9v10h16V9H4zm0-4v2h12V5H4zm11 8h3v2h-3v-2z" />
                    </g>
                  </svg>
                  <h3>INR {this.state.funds}</h3>
                </div>
              )}
              <span className="topbar__name"> &nbsp;{user}</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

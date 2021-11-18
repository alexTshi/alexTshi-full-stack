import React, { Fragment } from "react";
import  {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Landing from "./components/Layout/Landing";
import Navbar from "./components/Layout/Navbar";
import Login from "./components/auth/Login";
import Alert from "./components/Layout/Alert";
import Register from "./components/auth/Register";
import setAuthToken from "./utils/setAuthToken";
//Redux 
import {Provider} from 'react-redux';
import store from './store'
import "./App.css";

if(localStorage.token){
  setAuthToken(localStorage.token);
}

function App() {
  return(
    <div>
    <Provider store={store}>
      <Router>
        <Navbar />
        <Route exact path='/'> <Landing/> </Route>
        <section class="container">
          <Alert/>
          <Switch>
            <Route exact path='/register'> <Register/> </Route>
            <Route exact path='/login'> <Login/> </Route>
          </Switch>
        </section>
      </Router>
      </Provider>
    </div>
  );
}

export default App;

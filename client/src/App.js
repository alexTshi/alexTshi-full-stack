import React, { Fragment } from "react";
import  {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Landing from "./components/Layout/Landing";
import Navbar from "./components/Layout/Navbar";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
//Redux 
import {Provider} from 'react-redux';
import store from './store'
import "./App.css";
function App() {
  return(
    <div>
    <Provider store={store}>
      <Router>
        <Navbar />
        <Route exact path='/'> <Landing/> </Route>
        <section class="container">
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

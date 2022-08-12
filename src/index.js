import React  from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import { Auth0Provider,useAuth0 } from "@auth0/auth0-react";

import axios from "axios";

import { config } from "./config";
import Simulator from "./simulator";
import Login from "./login";


function App() {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    user
  } = useAuth0();

  return (<div>
    {
      isAuthenticated && user ? <Simulator /> : <Login />
    }
  </div>)
}


const rootElement = document.getElementById("root");
ReactDOM.render(
  <Auth0Provider
    domain={config.AUTH0_DOMAIN}
    clientId={config.AUTH0_CLIENTID}
    redirectUri={config.APP_URL}
  >
   <App />
  </Auth0Provider>
  , rootElement);

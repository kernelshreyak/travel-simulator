import React, { useEffect }  from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Login(){
    const {loginWithRedirect,user} = useAuth0();
  
    return <div>
        <div className="login-container">
            <button onClick={loginWithRedirect} className="login-button">Login</button>
        </div>
    </div>
}
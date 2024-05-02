import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";

import { Login, CreateAccount } from "./pages/account";
import { UserProvider } from "./pages/userInfo";


function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/createAcc" element={<CreateAccount/>} />
        </Routes>
        
      </Router>
    </UserProvider>
    
  );
}

export default App;

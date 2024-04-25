import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";

import { Login, CreateAccount } from "./pages/account";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />}/>
        <Route path="/createAcc" element={<CreateAccount/>} />
      </Routes>
      
    </Router>
  );
}

export default App;

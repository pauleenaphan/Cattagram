import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Login, CreateAccount } from "./pages/account";
import { Home } from "./pages/homepage"
import { UserProvider } from "./pages/userInfo";
import { Settings } from "./pages/settings";
import { Cover } from "./pages/cover";

function App() {
  // const [isLogged, setLogged] = useState("false");

  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Cover/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/createAcc" element={<CreateAccount/>}/>
          <Route path="/homepage" element={<Home/>}/>
          <Route path="/settings" element={<Settings/>}/>
        </Routes>
        </Router>
    </UserProvider>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import '../src/App';
import '../src/style/global.css'
import { Login, CreateAccount } from "./pages/account";
import { Home } from "./pages/homepage"
import { Settings } from "./pages/settings";
import { Cover } from "./pages/cover";
import { Profile } from "./pages/profile";
import { Friend } from "./pages/friend";
import { Chat } from "./pages/chat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Cover/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/createAcc" element={<CreateAccount/>}/>
        <Route path="/homepage" element={<Home/>}/>
        <Route path="/profilepage" element={<Profile/>}/>
        <Route path="/friendpage" element={<Friend/>}/>
        <Route path="/chatpage" element={<Chat/>}/>
        <Route path="/settings" element={<Settings/>}/>
      </Routes>
      </Router>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Roadmap from "./pages/Roadmap";
import Contest from "./pages/Contest";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/roadmap" element={<Roadmap />} />

        <Route path="/contest" element={<Contest />} />

        <Route path="/profile" element={<Profile />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;
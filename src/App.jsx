import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Roadmap from "./pages/Roadmap";
import Contest from "./pages/Contest";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";


function AppContent() {

  const location = useLocation();

  // Check if current page is login
  const isLoginPage = location.pathname === "/login" || location.pathname==="/signup";

  return (
    <>

      {/* Don't show Navbar on Login page */}
      {!isLoginPage && <Navbar />}


      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/roadmap" element={<Roadmap />} />

        <Route path="/contest" element={<Contest />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/signup" element={<Signup />} />

      </Routes>


      {/* Don't show Footer on Login page */}
      {!isLoginPage && <Footer />}

    </>
  );
}


function App() {

  return (
    <BrowserRouter>

      <AppContent />

    </BrowserRouter>
  );
}


export default App;
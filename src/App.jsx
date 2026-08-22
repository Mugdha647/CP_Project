import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Roadmap from "./pages/Roadmap";
import Contest from "./pages/Contest";
import Profile from "./pages/Profile";


function AppContent() {

  const location = useLocation();


  // Hide Navbar and Footer
  // on authentication pages

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";


  return (

    <>

      {!isAuthPage && <Navbar />}


      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/roadmap"
          element={<Roadmap />}
        />

        <Route
          path="/contest"
          element={<Contest />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Routes>


      {!isAuthPage && <Footer />}

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
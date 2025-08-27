import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import LandingPage from "./components/LandingPage";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import Dashboard from "./components/Dashboad";
import Chatbot from "./components/Chatbot";
import Room from "./components/Videocall/Room";
import Login from "./components/Auth/Login";
import Singup from "./components/Auth/SingUp";
import { AuthContext } from "./context/AuthContext";
import Chat from "./components/chat/Chat";
import Prepration from "./components/Prepration";
import Messages from "./components/chat/Messages";
//chat groups
import Interview from "./components/chat/Interview";
import English from "./components/chat/English";
import Aptitude from "./components/chat/Aptitude";
import Programming from "./components/chat/Programming";

function App() {
  const { currentUser } = useContext(AuthContext);
  // console.log("Logged in user:", currentUser);

  // Protected route: Only accessible if logged in
  const ProtectedRoute = () => {
    return currentUser ? <Outlet /> : <Navigate to="/" />;
  };

  // Public route: Only accessible if NOT logged in
  const PublicRoute = () => {
    return !currentUser ? <Outlet /> : <Navigate to="/dashboard" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages: Only show if not logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/singup" element={<Singup />} />
        </Route>

        {/* Public pages accessible by all */}
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Protected routes: Only show if logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/prepration" element={<Prepration />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/english" element={<English />} />
          <Route path="/aptitude" element={<Aptitude />} />
          <Route path="/programming" element={<Programming />} />
        </Route>

        {/* Fallback: If no route matches, redirect based on login */}
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

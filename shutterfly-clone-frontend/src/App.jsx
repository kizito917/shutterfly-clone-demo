// External imports
import { Routes, Route } from "react-router"

// Internal imports
import Toastify from "./components/Alert"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Signup from "./pages/onboarding/Signup"
import Signin from "./pages/onboarding/Signin"
import SigninSuccess from "./pages/onboarding/SigninSuccess"
import Editor from "./pages/Editor"
import Editor2 from "./pages/Editor2"
import Profile from "./pages/Profile"

function App() {
    return (
        <>
            <Toastify />
            <Navbar />
            <Routes>
                <Route path="/" element={<Signin />} />
                <Route path="/home" element={<Home />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/login" element={<Signin />} />
                <Route path="/signin-success" element={<SigninSuccess />} />
                <Route path="/editor/:imageId" element={<Editor />} />
                <Route path="/editor2/:imageId" element={<Editor2 />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </>
    )
}

export default App

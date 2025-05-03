// External imports
import { Routes, Route } from "react-router"

// Internal imports
import Toastify from "./components/Alert"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Signup from "./pages/onboarding/Signup"
import Signin from "./pages/onboarding/Signin"
import SigninSuccess from "./pages/onboarding/SigninSuccess"
import Editor from "./pages/editor/Editor"
import CanvaEditor from "./pages/editor/CanvaEditor"
import Profile from "./pages/Profile"
import CheckoutSuccess from "./pages/checkout/CheckoutSuccess"
import CheckoutFailure from "./pages/checkout/CheckoutFailure"

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
                <Route path="/canva-editor/:imageId" element={<CanvaEditor />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout-success" element={<CheckoutSuccess />} />
                <Route path="/checkout-failure" element={<CheckoutFailure />} />
            </Routes>
        </>
    )
}

export default App

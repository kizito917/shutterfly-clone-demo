// External imports
import { Routes, Route } from "react-router"

// Internal imports
import Toastify from "./components/Alert"
import Home from "./pages/Home"
import Editor from "./pages/Editor"

function App() {
    return (
        <>
            <Toastify />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/editor/:imageId" element={<Editor />} />
            </Routes>
        </>
    )
    }

export default App

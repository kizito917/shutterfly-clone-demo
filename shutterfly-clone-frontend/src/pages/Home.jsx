// External imports
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Internal imports
import { uploadImage } from "../services/imageService";
import SignUp from "../components/Signup";
import SignIn from "../components/Signin";

export default function Home() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [signinModalOpen, setSigninModalOpen] = useState(false);
    const [signupModalOpen, setSignupModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const authToken = localStorage.getItem("shutterfly-auth-token");
        if (authToken) {
            setIsLoggedIn(true);
        }
    }, [])

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        setLoading(true);
        
        if (!isLoggedIn) {
            setLoading(false);
            toast.error('User is not logged in');
            return;
        }

        if (!file) {
            setLoading(false);
            toast.error("Select an image to upload");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('image', file);

        const { status, message, data } = await uploadImage(formDataToSend);
        if (status !== 200) {
            setLoading(false)
            toast.error(message);
            return 400;
        }

        setLoading(false)
        toast.success("Image uploaded successfully. Redirecting to image editor page");
        setTimeout(() => {
            navigate(`/editor/${data.id}`)
        }, 3000);
        return 200;
    }

    return (
        <>
            <div className="min-h-screen">
                <div className="flex flex-col md:flex-row h-screen">
                    {/* Left side with background image */}
                    <div className="relative w-full md:w-1/2 h-64 md:h-full">
                        <img 
                            src="https://images.unsplash.com/photo-1738771321771-972e87edffa7" 
                            alt="Background" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>

                    {/* Right side with content */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-blue-100">
                        {
                            !isLoggedIn ? <div className="flex gap-6 w-[40%] mx-auto">
                                <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setSigninModalOpen(true)}>Login</button>
                                <button className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setSignupModalOpen(true)}>Sign up</button>
                            </div> : <div className="flex gap-6 w-[40%] mx-auto">
                                User is logged in successfully
                            </div>
                        }
                        <div className="md:p-24">
                            <h1 className="text-4xl font-bold mb-6 text-gray-800">
                                Welcome to Our Platform
                            </h1>
                            
                            <p className="text-md text-gray-600 mb-8">
                                Upload your image securely and easily. Start applying effects and filter on your image to get the desired result you wish. We support various image formats 
                                and provide instant processing for your convenience.
                            </p>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="sr-only">Choose file</span>
                                    <input
                                        type="file"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>

                                <button 
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    onClick={handleUpload}
                                >
                                    {
                                        loading && <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    }
                                    Upload Image
                                </button>
                            </div>

                            {file && (
                                <p className="mt-4 text-sm text-blue-600">
                                    Selected file: {file.name}
                                </p>
                            )}

                            <p className="mt-4 text-sm text-gray-500">
                                Supported image formats: PNG, JPG, JPEG, AVIF, GIF, WEBP
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <SignUp isSignupModalOpen={signupModalOpen} closeSignupModal={() => setSignupModalOpen(false)} />
            <SignIn isSigninModalOpen={signinModalOpen} closeSigninModal={() => setSigninModalOpen(false)} />
        </>
    )
}
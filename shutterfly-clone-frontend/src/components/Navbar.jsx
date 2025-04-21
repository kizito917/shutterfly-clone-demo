// External Imports
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

// Internal imports
import { LocalStorage } from "../helpers/localstorageHelper";

const Navbar = () => {
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(LocalStorage.getItem('shutterfly-user' || null));
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            // fetchProfile();
            const data = LocalStorage.getItem('shutterfly-user') || null;
            setUser(data)
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const handleLogout = () => {
        LocalStorage.clearStorage();
        toast.success('Logout successful! Redirecting to login...');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    }

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <a href="/" className="text-xl font-bold text-gray-900">
                            Image App
                        </a>
                    </div>

                    <div className="ml-4 flex items-center md:ml-6">
                        {/* <a href='/pricing' className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                            Pricing
                        </a> */}
                        {loading ? (
                        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                        ) : user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                <span className="text-sm font-medium text-gray-700">
                                    {user.firstName || user.email}
                                </span>
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    {user.firstName?.charAt(0) || user.email?.charAt(0)}
                                </div>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <a
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Profile
                                    </a>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                        ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Sign up
                            </button>
                        </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
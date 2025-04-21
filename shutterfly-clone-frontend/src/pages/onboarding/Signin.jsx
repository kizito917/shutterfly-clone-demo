// External imports
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
import { toast } from "react-toastify";

// Internal imports
import TextField from "../../components/TextField";
import { LocalStorage } from "../../helpers/localstorageHelper";
import { loginUser } from "../../services/onboardingService";

const loginValidationSchema = Yup.object().shape({
    email: Yup.string()
        .required('Email is required')
        .email('Email is invalid'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

export default function Signin() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginValidationSchema),
    });

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormdata] = useState({
        email: "",
        password: "",
    });

    const handleChange = (event) => {
        setFormdata({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    // Function to submit form
    const onSubmit = async (values) => {
        setIsLoading(true)
        const { status, message, data } = await loginUser(values);
        if (status !== 200) {
            setIsLoading(false);
            toast.error(message);
            return;
        }

        toast.success(message);
        setIsLoading(false);
        LocalStorage.setItem("shutterfly-auth-token", data.token);
        LocalStorage.setItem("shutterfly-refresh-token", data.refreshToken);
        LocalStorage.setItem('shutterfly-user', data.user);
        setTimeout(() => {
            window.location.href = '/home';
        }, 3000);
    };

    return (
        <div className="bg-white rounded-lg mt-30 p-6 w-full md:w-[60%] mx-auto">
            <h4 className="text-center text-xl font-bold">Login to your account</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="lg:grid lg:grid-cols-1 lg:gap-8 mt-4 md:flex md:flex-col">
                    <div className="mt-2">
                        <p className="mb-2 font-bold text-xs lg:text-md">
                            Email
                        </p>
                        <div className="relative">
                            <TextField
                                type="email"
                                name="email"
                                placeholder="johndoe@gmail.com"
                                register={register}
                                errors={errors}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="lg:grid lg:grid-cols-1 lg:gap-8 mt-4 md:flex md:flex-col">
                    <div className="mt-2">
                        <p className="mb-2 font-bold text-xs lg:text-md">
                            Password
                        </p>
                        <div className="relative">
                            <TextField
                                type='password'
                                name="password"
                                placeholder="**********"
                                register={register}
                                errors={errors}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button 
                        type="submit" 
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                        disabled={isLoading }
                    >
                        {isLoading ? 'Processing...' : 'Sign in' }
                    </button>
                </div>
                <div className="relative mb-4 mt-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Or continue with
                        </span>
                    </div>
                </div>
                <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>
            </form>
        </div>
    )
}
// External imports
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
import { toast } from "react-toastify";

// Internal imports
import Dialog from "./Dialog"
import TextField from "./TextField";
import { LocalStorage } from "../helpers/localstorageHelper";
import { loginUser } from "../services/onboardingService";

const loginValidationSchema = Yup.object().shape({
    email: Yup.string()
        .required('Email is required')
        .email('Email is invalid'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

export default function SignIn({isSigninModalOpen, closeSigninModal}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginValidationSchema),
    });

    const handleChange = (event) => {
        const [formData, setFormdata] = useState({
            email: "",
            password: "",
        });

        setFormdata({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    // Function to submit form
    const onSubmit = async (values) => {
        const { status, message, data } = await loginUser(values);
        if (status !== 200) {
            toast.error(message);
            return;
        }

        toast.success(message);
        LocalStorage.setItem("shutterfly-auth-token", data.token);
        LocalStorage.setItem("shutterfly-refresh-token", data.refreshToken);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    };

    return (
        <Dialog isOpen={isSigninModalOpen} closeDialog={closeSigninModal}>
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
                    <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2">Signin</button>
                </div>
            </form>
        </Dialog>
    )
}
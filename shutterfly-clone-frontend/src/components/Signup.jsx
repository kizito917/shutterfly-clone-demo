// External imports
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
import { toast } from "react-toastify";

// Internal imports
import Dialog from "./Dialog"
import TextField from "./TextField";
import { registerUser } from "../services/onboardingService";

const registerValidationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string()
        .required('Email is required')
        .email('Email is invalid'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
});

export default function SignUp({isSignupModalOpen, closeSignupModal}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerValidationSchema),
    });

    const handleChange = (event) => {
        const [formData, setFormdata] = useState({
            firstName: "",
            lastName: "",
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
        const { status, message } = await registerUser(values);
        if (status !== 200) {
            toast.error(message);
            return;
        }

        toast.success(`${message}...You can proceed to login.`);
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    };

    return (
        <Dialog isOpen={isSignupModalOpen} closeDialog={closeSignupModal}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 mt-4 md:flex md:flex-col">
                    <div className="mt-2">
                        <p className="mb-2 font-bold text-xs lg:text-md">
                            First name
                        </p>
                        <TextField
                            type="text"
                            name="firstName"
                            placeholder="John"
                            register={register}
                            errors={errors}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mt-2">
                        <p className="mb-2 font-bold text-xs lg:text-md">
                            Last name
                        </p>
                        <TextField
                            type="text"
                            name="lastName"
                            placeholder="Doe"
                            register={register}
                            errors={errors}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 mt-4 md:flex md:flex-col">
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
                    <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2">Signup</button>
                </div>
            </form>
        </Dialog>
    )
}
// External Imports
import { useEffect, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

// Internal Imports
import { LocalStorage } from "../../helpers/localstorageHelper";
import { fetchProfile } from '../../services/profile/profile';

const SignInProcessor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processSignIn = async () => {
        try {
            const token = searchParams.get("token");
            const refreshToken = searchParams.get("refreshToken");

            if (!token && !refreshToken) {
                toast.error("Unable to process signin");
                return;
            }
            
            LocalStorage.setItem("shutterfly-auth-token", token);
            LocalStorage.setItem("shutterfly-refresh-token", refreshToken);

            // Fetch user profile
            const { status, message, data } = await fetchProfile();
            if (status !== 200) {
                toast.error('Unable to process signin');
                LocalStorage.clearStorage();
                navigate("/?error=authentication_failed");
            }

            LocalStorage.setItem('shutterfly-user', data);
            setTimeout(() => {
                window.location.href = '/home';
            }, 2000);
        } catch(err) {
            toast.error("Authentication failed");
            navigate("/?error=authentication_failed");
        }
    };

    processSignIn();
  }, [searchParams, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Sign In Successful
                    </h1>
                    <p className="mt-2 text-gray-600">Setting up your account...</p>
                </div>
                <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    );
};

const SigninSuccess = () => {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800">
                        Loading...
                        </h1>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        }>
        <SignInProcessor />
        </Suspense>
    );
};

export default SigninSuccess;
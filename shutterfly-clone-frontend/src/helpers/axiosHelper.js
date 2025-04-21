import axios from "axios";
import { LocalStorage } from "./localstorageHelper";

axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL;
axios.defaults.withCredentials = true;
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 401) {
            window.location.href = '/';
            // TODO:: Implement refresh token logic 
            // call api to get new refresh token
            //refreshTokenCall();
        }
        return Promise.reject(error);
    }
);

axios.interceptors.request.use((config) => {
    const authToken = LocalStorage.getItem("shutterfly-auth-token");
    if (authToken) {
        config.headers.Authorization = `${authToken}`;
    }
    
    return config;
});

const refreshTokenCall = async () => {
    try {
        localStorage.setItem("redirect_url", window.location.href);

        await Axios({
            url: "/auth/request-access-token",
            method: "post",
            body: {
                refreshToken: LocalStorage.getItem("refresh_token"),
            },
        });

        const redirectUrl = localStorage.getItem("redirect_url");
        window.location.href = redirectUrl || "/dashboard";
    } catch (err) {
        window.location.href = "/";
    }
};

export const Axios = async ({ url, method, body, headers, responseType }) => {
    const res = await axios({
        method: method,
        url: url,
        data: body,
        headers: headers,
        responseType: responseType
    });
    return res.data;
};

import { Axios } from "../helpers/axiosHelper";

let status;
let message;
let data;

export const registerUser = async (payload) => {
    try {
        const response = await Axios({
            url: '/auth/signup', 
            method: 'post',
            body: payload
        });

        status = 200;
        message = response.message;
        data = response.data;
    } catch (err) {
        status = err.response.status;
        message = err.response.data.message;
    }
    return { status, message, data };
}

export const loginUser = async (payload) => {
    try {
        const response = await Axios({
            url: '/auth/signin', 
            method: 'post',
            body: payload
        });

        status = 200;
        message = response.message;
        data = response.data;
    } catch (err) {
        status = err.response.status;
        message = err.response.data.message;
    }
    return { status, message, data };
}
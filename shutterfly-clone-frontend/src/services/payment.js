import { Axios } from "../helpers/axiosHelper";

let status;
let message;
let data;

export const processCheckout = async (payload) => {
    try {
        const response = await Axios({
            url: "/payment/checkout",
            method: "post",
            body: payload,
        });
    
        status = 200;
        message = response.message;
        data = response.data;
    } catch (err) {
        status = err.response.status;
        message = err.response.data.message;
    }

    return { status, message, data };
};
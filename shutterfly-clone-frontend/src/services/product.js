import { Axios } from "../helpers/axiosHelper";

let status;
let message;
let data;

export const retrieveProducts = async () => {
    try {
        const response = await Axios({
            url: "/product/all",
            method: "get"
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
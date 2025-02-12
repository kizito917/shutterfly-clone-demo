import { Axios } from "../helpers/axiosHelper";

let status;
let message;
let data;

export const uploadImage = async (formPayload) => {
    try {
        const response = await Axios({
            url: '/file/upload', 
            method: 'post',
            body: formPayload
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

export const retrieveRequestedImage = async (imagedId) => {
    try {
        const response = await Axios({
            url: `/file/image/${imagedId}`, 
            method: 'get',
            responseType: 'blob'
        });

        status = 200;
        message = 'Image retrieved successfully';
        data = response;
    } catch (err) {
        console.log(err);
        status = err.response.status;
        message = err.response.data.message;
    }
    return { status, message, data };
}
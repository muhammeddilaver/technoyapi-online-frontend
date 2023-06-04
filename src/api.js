import axios from "axios";

axios.interceptors.request.use(
    function (config) {
        const { origin } = new URL(config.url);
        const allowedOrigins = [import.meta.env.VITE_BASE_ENDPOINT];

        const token = localStorage.getItem("access-token");

        if (allowedOrigins.includes(origin)) {
            config.headers.authorization = token;
        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

export const fetchOrder = async (order_id) => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order/${order_id}`
    );
    return data;
};

export const fetchOrdersList = async ({ pageParam = 1 }) => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order?page=${pageParam}`
    );
    return data;
};

export const fetchCreateOrder = async (basket, description) => {
    const dataForm = {
        products: JSON.stringify(basket),
        description: description,
    };
    const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order`,
        dataForm
    );
    return data;
};

export const fetchProductsList = async ({ pageParam = 0 }) => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_ENDPOINT}/product?page=${pageParam}`
    );
    return data;
};

export const fetchSearchList = async (pageParam) => {
    if (pageParam.pageParam === undefined) {
        pageParam.pageParam = 1;
    }
    if (pageParam.queryKey[1] === "") {
        pageParam.queryKey[1] = " ";
    }
    const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_ENDPOINT}/product/search/${
            pageParam.queryKey[1]
        }?page=${pageParam.pageParam}`
    );
    return data;
};

export const fetchLogin = async (input) => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_ENDPOINT}/auth/login`,
        input
    );
    return data;
};

export const fetchLogout = async () => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_ENDPOINT}/auth/logout`,
        {
            refresh_token: localStorage.getItem("refresh-token"),
        }
    );
    return data;
};

export const fetchMe = async () => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_ENDPOINT}/auth/me`
    );
    return data;
};

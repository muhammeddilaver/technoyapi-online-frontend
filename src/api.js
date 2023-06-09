import axios from "axios";
import querystring from "querystring";

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

export const acceptOrRejectOffer = async ({status, orderId}) => {
    const dataForm = {
        status: status
    };

    const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order/${orderId}/offer`,
        dataForm
    );
    return data;
};

export const addProductToOrder = async ({product_id, orderId}) => {
    const dataForm = {
        product_id: product_id,
    };

    const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order/${orderId}/addone`,
        dataForm
    );
    return data;
};

export const returnProductFromOrder = async ({productId, count, orderId}) => {
    const dataForm = {
        returnProductId: productId,
        returnCount: count
    };

    const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order/${orderId}/return`,
        dataForm
    );
    return data;
};

export const deleteProductFromOrder = async ({productId, orderId}) => {
    const dataForm = {
        deleteProductId: productId,
    };
    const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order/${orderId}/delete`,
        dataForm
    );
    return data;
};

export const updateOrder = async (order) => {
    const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order/${order._id}`,
        order
    );
    return data;
};

export const fetchOrder = async (order_id) => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order/${order_id}`
    );
    return data;
};

export const fetchOrderAdmin = async (order_id) => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order/admin/${order_id}`
    );
    return data;
};

export const fetchOrdersList = async ({ pageParam = 1 }) => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order?page=${pageParam}`
    );
    return data;
};

export const fetchSearchUsersAdmin = async (keyword) => {
    if (keyword === "") {
        keyword = "a";
    }
    const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_ENDPOINT}/auth/users/search/${keyword}`
    );
    return data;
};

export const fetchOrdersListAdmin = async ({ pageParam = 1}) => {
    //const queryString = querystring.stringify(filter);
    const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_ENDPOINT}/order/admin/?page=${pageParam}`
    );
    return data;
};

export const createOrder = async ({items, description, status}) => {
    const dataForm = {
        products: JSON.stringify(items),
        description: description,
        status: status,
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

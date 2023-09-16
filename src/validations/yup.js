import { object, string, number, array, boolean } from "yup";

export const neworderValidations = object().shape({
    status: number().required(),
    user_id: string().required(),
    products: array().of(
        object().shape({
            _id: string(),
            category_id: string(),
            exact_price: number().required(),
            factor: number().required(),
            inventory: number().required(),
            name: string().required(),
            photos: array().of(string()),
            piece: number().required(),
            price: number().required(),
            status: boolean().required(),
        })
    ),
    total_price: number().required(),
    description: string(),
});

export const shortOrderAdminValidations = object().shape({
    status: number().required(),
    products: array().of(
        object().shape({
            _id: string(),
            name: string().required(),
            photos: array().of(string()),
            piece: number().required(),
            price: number().required(),
            status: boolean().required(),
        })
    ),
    total_price: number().required(),
    description: string(),
});

export const basketValidations = object().shape({
    status: number().required(),
    products: array().of(
        object().shape({
            _id: string(),
            name: string().required(),
            photos: array().of(string()),
            piece: number().required(),
            price: number(),
            status: boolean(),
        })
    ),
    description: string(),
});

import { useState, createContext, useContext, useEffect } from "react";
import { fetchCreateOrder } from "../api";

const BasketContext = createContext();

const defaultBasket = JSON.parse(localStorage.getItem("basket")) || [];

const BasketProvider = ({ children }) => {
    const [items, setitems] = useState(defaultBasket);

    useEffect(() => {
        localStorage.setItem("basket", JSON.stringify(items));
    }, [items]);

    const order = async (description) => {
        try {
            await fetchCreateOrder(
                items,
                description === "" ? " " : description
            );
            setitems([]);
            return true;
        } catch (error) {
            console.log(error);
        }
    };

    const isInBasket = (data) => {
        return items.find((item) => item._id === data._id) === undefined
            ? false
            : true;
    };

    const addToBasket = (data, piece) => {
        if (!isInBasket(data)) {
            data.piece = piece;
            setitems((prev) => [...prev, data]);
        }
    };

    const delFromBasket = (id) => {
        setitems((prevItems) => prevItems.filter((item) => item._id !== id));
    };

    const changePieceFromBasket = (id, key, piece) => {
        const value = key === "up" ? 1 : -1;
        if (value === -1 && piece === 1) {
            delFromBasket(id);
        }
        setitems((prevItems) =>
            prevItems.map((item) =>
                item._id === id ? { ...item, piece: item.piece + value } : item
            )
        );
    };

    const values = {
        items,
        setitems,
        addToBasket,
        delFromBasket,
        changePieceFromBasket,
        isInBasket,
        order,
    };

    return (
        <BasketContext.Provider value={values}>
            {children}
        </BasketContext.Provider>
    );
};

const useBasket = () => useContext(BasketContext);

export { BasketProvider, useBasket };

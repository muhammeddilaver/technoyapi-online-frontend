import { useState, createContext, useContext, useEffect } from "react";

const BasketContext = createContext();

const defaultBasket = JSON.parse(localStorage.getItem("basket")) || [];

const BasketProvider = ({ children }) => {
    const [items, setitems] = useState(defaultBasket);

    useEffect(() => {
        localStorage.setItem("basket", JSON.stringify(items));
    }, [items]);


    const isInBasket = (data) => {
        return items.find((item) => item.name === data.name) === undefined
            ? false
            : true;
    };

    const addToBasket = (data, piece) => {
        if (!isInBasket(data)) {
            data.piece = piece;
            setitems((prev) => [...prev, data]);
        }
    };

    const delFromBasket = (name) => {
        setitems((prevItems) => prevItems.filter((item) => item.name !== name));
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
    };

    return (
        <BasketContext.Provider value={values}>
            {children}
        </BasketContext.Provider>
    );
};

const useBasket = () => useContext(BasketContext);

export { BasketProvider, useBasket };

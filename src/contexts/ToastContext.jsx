import { useState, createContext, useContext, useEffect } from "react";

const ToastContext = createContext();

const ToastProvider = ({children}) => {

    const [toastInfo, settoastInfo] = useState({
        title: "",
        text: "",
    });

    const [showToast, setshowToast] = useState(false);

    const createToast = (data) => {
        settoastInfo({
            title: data.title,
            text: data.text,
        });
        setshowToast(true);
    };
    
    const values = {
        createToast,
        toastInfo,
        showToast,
        setshowToast
    };

    return (
        <ToastContext.Provider value={values}>
            {children}
        </ToastContext.Provider>
    );
};

const useToast = () => useContext(ToastContext);

export { ToastProvider, useToast };
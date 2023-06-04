import { useState, createContext, useEffect, useContext } from "react";
import { fetchLogout, fetchMe } from "../api";
import PropTypes from "prop-types";
import Spinner from "react-bootstrap/Spinner";
import { redirect } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setuser] = useState(null);
    const [loggedIn, setloggedIn] = useState(false);
    const [loading, setloading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const me = await fetchMe();
                setloggedIn(true);
                setuser(me);
                setloading(false);
                redirect('/');
            } catch (error) {
                setloading(false);
            }
        })();
    }, []);

    const login = (data) => {
        setloggedIn(true);
        setuser(data.user);

        localStorage.setItem("access-token", data.accessToken);
        localStorage.setItem("refresh-token", data.refreshToken);
    };

    const logout = async () => {
        setloggedIn(false);
        setuser(null);

        await fetchLogout();

        localStorage.removeItem('access-token');
        localStorage.removeItem('refresh-token');
    };

    const values = {
        loggedIn,
        user,
        login,
        logout,
    };

    if (loading) {
        return (
            <Spinner className="min-vh-100 d-flex justify-content-center align-items-center" animation="border" variant="danger" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        );
    }

    return (
        <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
    );
};

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

const useAuth = () => useContext(AuthContext);

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };

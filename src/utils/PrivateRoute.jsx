import { useAuth } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
    const { loggedIn } = useAuth();

	return (
		loggedIn ? <Outlet/> : <Navigate to="/login" />
	);
};

export default PrivateRoutes;
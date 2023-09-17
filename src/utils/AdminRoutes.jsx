import { Toast, ToastContainer } from "react-bootstrap";
import AdminNavbar from "../components/Admin/AdminNavbar";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

const AdminRoutes = () => {
    const { loggedIn, user } = useAuth();
    const { showToast, toastInfo, setshowToast } = useToast();

    return (
        <>
            <AdminNavbar />
            {loggedIn && user.role == "admin" ? (
                <Outlet />
            ) : (
                <Navigate to="/" />
            )}
            <ToastContainer
                className="p-3"
                position="bottom-end"
                style={{ zIndex: 1, position: "fixed" }}
            >
                <Toast
                    onClose={() => setshowToast(false)}
                    show={showToast}
                    delay={5000}
                    autohide
                >
                    <Toast.Header>
                        <strong className="me-auto">{toastInfo.title}</strong>
                    </Toast.Header>
                    <Toast.Body className="h5">{toastInfo.text}</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default AdminRoutes;

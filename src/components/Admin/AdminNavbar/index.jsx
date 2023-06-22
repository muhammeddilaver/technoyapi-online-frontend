import {
    Container,
    Nav,
    NavDropdown,
    Navbar,
    Offcanvas,
} from "react-bootstrap";
import { NavLink, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useEffect, useState } from "react";

function AdminNavbar() {
    const { logout, user } = useAuth();
    const { pathname } = useLocation();
    const [navbarOpen, setnavbarOpen] = useState(false);
    const toggleNavbar = () => {
        setnavbarOpen(!navbarOpen);
    };
    useEffect(() => {
        setnavbarOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        logout();
        return <Navigate to="/login" />;
    };
    return (
        <Container fluid>
            <Navbar
                key="md"
                bg="light"
                expand="md"
                fixed="top"
                className="mb-3"
            >
                <Container fluid>
                    <NavLink className="navbar-brand" to="/">
                        Techno Yapı Online
                    </NavLink>
                    <Navbar.Toggle
                        onClick={toggleNavbar}
                        aria-controls={`offcanvasNavbar-expand-md`}
                    />
                    <Navbar.Offcanvas
                        onHide={toggleNavbar}
                        show={navbarOpen}
                        id={`offcanvasNavbar-expand-md`}
                        aria-labelledby={`offcanvasNavbarLabel-expand-md`}
                        placement="start"
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title
                                id={`offcanvasNavbarLabel-expand-md`}
                            >
                                Techno Yapı Online
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="justify-content-start flex-grow-1 pe-3">
                                <NavLink className="nav-link" to="/admin/orders">
                                    Siparişler
                                </NavLink>
                                <NavLink className="nav-link" to="/admin/users">
                                    Müşteriler
                                </NavLink>
                                <NavLink className="nav-link" to="/admin/products">
                                    Ürünler
                                </NavLink>
                            </Nav>

                            <Nav className="justify-content-end flex-grow-1 pe-3">
                                <NavDropdown
                                    title={user && user.company_name}
                                    id="collasible-nav-dropdown"
                                >
                                    <NavDropdown.Item>Hesabım</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>
                                        Çıkış
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
        </Container>
    );
}

export default AdminNavbar;

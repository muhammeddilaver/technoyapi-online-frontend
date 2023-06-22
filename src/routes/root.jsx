import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import {
    Button,
    Container,
    Nav,
    NavDropdown,
    Navbar,
    Offcanvas,
    Toast,
    ToastContainer,
} from "react-bootstrap";

import "../index.css";

import { useAuth } from "../contexts/AuthContext";
import BasketNavbar from "../components/Basket";
import { useEffect, useState } from "react";
import { useBasket } from "../contexts/BasketContext";
import { useToast } from "../contexts/ToastContext";

export default function Root() {
    const { logout, user } = useAuth();
    const { items } = useBasket();
    const { showToast, toastInfo, setshowToast } = useToast();

    const { pathname } = useLocation();
    // basket
    const [basketShow, setbasketShow] = useState(false);
    const basketCloseHandle = () => setbasketShow(false);
    const basketShowHandle = () => setbasketShow(true);

    //navbar canvas
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
        <>
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
                        <Nav className="d-md-none justify-content-start flex-grow-1 pe-3">
                            {items.length != 0 && (
                                <Button
                                    variant="danger"
                                    className="me-1 d-md-none"
                                    onClick={basketShowHandle}
                                >
                                    <span className="h5">
                                        {items.length}{" "}
                                        <i className="fa fa-shopping-basket"></i>
                                    </span>
                                </Button>
                            )}
                        </Nav>
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
                                    <NavLink className="nav-link" to="/">
                                        Anasayfa
                                    </NavLink>
                                    <NavLink
                                        className="nav-link"
                                        to="/orders"
                                    >
                                        Siparişler
                                    </NavLink>
                                </Nav>

                                <Nav className="justify-content-end flex-grow-1 pe-3">
                                    {items.length != 0 && (
                                        <Button
                                            variant="warning"
                                            className="me-1 d-none d-md-block"
                                            onClick={basketShowHandle}
                                        >
                                            <span className="h5">
                                                {items.length}{" "}
                                                <i className="fa fa-shopping-basket"></i>
                                            </span>
                                        </Button>
                                    )}
                                    <NavDropdown
                                        title={ user && user.company_name}
                                        id="collasible-nav-dropdown"
                                    >
                                        <NavDropdown.Item>
                                            Hesabım
                                        </NavDropdown.Item>
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
                <Offcanvas
                    show={basketShow}
                    style={{ width: "100%" }}
                    onHide={basketCloseHandle}
                    placement="end"
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Sepetim</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <BasketNavbar handleClose={basketCloseHandle} />
                    </Offcanvas.Body>
                </Offcanvas>
            </Container>
            <Container style={{ marginTop: "80px" }}>
                <Outlet />
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
                            <strong className="me-auto">
                                {toastInfo.title}
                            </strong>
                        </Toast.Header>
                        <Toast.Body className="h5">{toastInfo.text}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </Container>
        </>
    );
}

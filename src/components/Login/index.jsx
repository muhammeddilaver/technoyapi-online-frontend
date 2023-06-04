import { Button, Container, Row, Col, Form, Alert } from "react-bootstrap";

import { useFormik } from "formik";
import validationSchema from "./validations";
import { fetchLogin } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";


function LoginForm() {
    const { login, loggedIn, user } = useAuth();
    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema,
        onSubmit: async (values, bag) => {
            try {
                const registerResponse = await fetchLogin(values);
                login(registerResponse);
            } catch (error) {
                bag.setErrors({ general: error.response.data.message });
            }
        },
    });

    if(user && loggedIn){
        return <Navigate to="/" />;
    }

    return (
        <Container className="min-vh-100 d-flex justify-content-center align-items-center">
            <Form onSubmit={formik.handleSubmit}>
                {formik.errors.general && (
                    <Alert key="danger" variant="danger">
                        Hatalı giriş.
                    </Alert>
                )}
                <Form.Group
                    as={Row}
                    className="mb-3"
                    controlId="formHorizontalEmail"
                >
                    <Form.Label column sm={2}>
                        Email
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Lütfen email adresinizi giriniz."
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            autoComplete="true"
                            isInvalid={
                                formik.touched.email && formik.errors.email
                            }
                        />
                    </Col>
                </Form.Group>

                <Form.Group
                    as={Row}
                    className="mb-3"
                    controlId="formHorizontalPassword"
                >
                    <Form.Label column sm={2}>
                        Şifre
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Lütfen şifrenizi giriniz."
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            autoComplete="true"
                            isInvalid={
                                formik.touched.password &&
                                formik.errors.password
                            }
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                    <Col sm={{ span: 10, offset: 2 }}>
                        <Button variant="success" type="submit">
                            Giriş
                        </Button>
                    </Col>
                </Form.Group>
            </Form>
        </Container>
    );
}

export default LoginForm;

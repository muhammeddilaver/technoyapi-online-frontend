import { Button, Col, Form, Row } from "react-bootstrap";
import { useBasket } from "../../contexts/BasketContext";
import { useFormik } from "formik";
import { useToast } from "../../contexts/ToastContext";

function ProductRequest({ keyword, setkeyword }) {
    const { addToBasket } = useBasket();
    const { createToast } = useToast();

    const formik = useFormik({
        initialValues: {
            name: keyword,
            piece: 1,
        },
        onSubmit: async (values, bag) => {
            addToBasket({ name: values.name }, values.piece);
            setkeyword("");
            createToast({
                title: "Bilgi",
                text: "Ürün sepete eklendi.",
            });
        },
    });

    return (
        <Row>
            <h4>
                Aradığınız ürün henüz sisteme kaydedilmemiş olabilir. Lütfen
                aşağıdaki formu kullanınız.
            </h4>
            <Col md={3}>
                <form onSubmit={formik.handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ürün adı:</Form.Label>
                        <Form.Control
                            name="name"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Ürünü tanımlayınız..."
                            value={formik.values.name}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Ürün Adedi:</Form.Label>
                        <Form.Control
                            type="number"
                            name="piece"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Ürünü adedini giriniz..."
                            value={formik.values.piece}
                        />
                    </Form.Group>
                    <Button type="submit">Sepete Ekle</Button>
                </form>
            </Col>
        </Row>
    );
}

export default ProductRequest;

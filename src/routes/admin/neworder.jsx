import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createAdminOrder,
    currencyRates,
    fetchAdminSearchList,
    fetchSearchUsersAdmin,
} from "../../api";
import { useEffect, useState } from "react";
import { Button, Container, Form, Row, Table } from "react-bootstrap";
import { useFormik } from "formik";
import Select, { components } from "react-select";
import { useToast } from "../../contexts/ToastContext";
import { useNavigate } from "react-router-dom";
import { neworderValidations } from "../../validations/yup";
import { Breadcrumb } from "antd";

function NewOrder() {
    const { createToast } = useToast();
    const navigate = useNavigate();
    const [userKeyword, setuserKeyword] = useState("");
    const [productKeyword, setproductKeyword] = useState("");
    const [dolar, setDolar] = useState(null);
    const [euro, setEuro] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);

    const { data: userData } = useQuery(
        ["userSearch", userKeyword],
        () => fetchSearchUsersAdmin(userKeyword),
        {
            retry: false,
        }
    );

    const { data: productData } = useQuery(
        ["order", productKeyword],
        fetchAdminSearchList,
        {
            retry: false,
        }
    );

    const queryClient = useQueryClient();

    const newOrderMutation = useMutation(createAdminOrder, {
        onSuccess: () => {
            queryClient.invalidateQueries(["orderListAdmin"]);
            queryClient.refetchQueries(["orderListAdmin"]);
            createToast({
                title: "Bilgi",
                text: "İşlem başarılı.",
            });
            navigate("/admin");
        },
    });

    const getCurrency = async () => {
        const { dolar, euro } = await currencyRates();
        setDolar(dolar);
        setEuro(euro);
    };

    useEffect(() => {
        getCurrency();
    }, []);

    useEffect(() => {
        formik.setFieldValue("total_price", totalPrice);
    }, [totalPrice]);

    const formik = useFormik({
        initialValues: {
            products: [],
            description: "",
            user_id: "",
            status: 4,
        },
        onSubmit: async (values, bag) => {
            newOrderMutation.mutate(values);
        },
        validationSchema: neworderValidations,
    });

    useEffect(() => {
        for (let i = 0; i < formik.values.products.length; i++) {
            formik.values.products[i].price =
                parseFloat(formik.values.products[i].exact_price) *
                    (formik.values.products?.[i]?.currency === "DOLAR"
                        ? dolar
                        : formik.values.products?.[i]?.currency === "EURO"
                        ? euro
                        : 1) +
                (parseFloat(formik.values.products[i].exact_price) *
                    (formik.values.products?.[i]?.currency === "DOLAR"
                        ? dolar
                        : formik.values.products?.[i]?.currency === "EURO"
                        ? euro
                        : 1) *
                    parseFloat(formik.values.products[i].factor)) /
                    100;
            formik.values.products[i].last_price =
                parseFloat(formik.values.products[i].price) *
                parseFloat(formik.values.products[i].piece);
        }

        let newTotalPrice = 0;
        formik.values.products.forEach((product) => {
            newTotalPrice += product.price * product.piece;
        });
        setTotalPrice(newTotalPrice);
    }, [formik.values.products]);

    const handleUserSearchChange = (selectedOption) => {
        formik.setFieldValue("user_id", selectedOption.value._id);
    };

    const handleUserInputChange = (inputValue, { action }) => {
        if (action === "input-change") {
            setuserKeyword(inputValue);
        }
    };

    const userOptions =
        userData?.map((data) => ({
            value: data,
            label: data.company_name + " - " + data.name,
        })) || [];

    const handleProductSearchChange = (selectedOption) => {
        const product = {
            ...selectedOption.value,
            exact_price: selectedOption.value.price,
        };

        formik.setFieldValue("products", [...formik.values.products, product]);
        setproductKeyword("");
    };

    const handleProductInputChange = (inputValue, { action }) => {
        if (action === "input-change") {
            setproductKeyword(inputValue);
        }
    };

    const newProduct = (name) => {
        formik.setFieldValue("products", [
            ...formik.values.products,
            {
                exact_price: 0,
                currency: "TL",
                factor: 0,
                inventory: 1000,
                name: name,
                photos: [],
                piece: 0,
                price: 0,
                status: false,
            },
        ]);
    };

    const normalizeText = (text) => {
        text = text
            .replace(/ı/g, "i")
            .replace(/I/g, "i")
            .replace(/İ/g, "i")
            .replace(/ş/g, "s")
            .replace(/Ş/g, "s")
            .replace(/ç/g, "c")
            .replace(/Ç/g, "c")
            .replace(/ğ/g, "g")
            .replace(/Ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/Ü/g, "u")
            .replace(/ö/g, "o")
            .replace(/Ö/g, "o");
        text = text.toLowerCase();
        return text;
    };

    const productOptions =
        productData?.map((data) => ({
            value: data,
            label: data.name,
            normalizedLabel: normalizeText(data.name),
        })) || [];

    const msgStyles = {
        background: "green",
        color: "white",
    };

    const NoOptionsMessage = (props) => {
        return (
            <components.NoOptionsMessage {...props}>
                <option onClick={() => newProduct(props.selectProps.value)}>
                    Yeni ürün ekle: {props.selectProps.value}
                </option>
            </components.NoOptionsMessage>
        );
    };

    return (
        <Container style={{ marginTop: 80 }}>
            <Row>
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <a onClick={() => navigate(`/admin`)}>
                                    Tüm Siparişler
                                </a>
                            ),
                        },
                        {
                            title: "Yeni Sipariş",
                        },
                    ]}
                />
            </Row>
            <Row>
                <Form noValidate onSubmit={formik.handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>İşlem Tipi:</Form.Label>
                        <Form.Select
                            name={`status`}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isValid={
                                formik.touched.status && !formik.errors.status
                            }
                            isInvalid={
                                formik.touched.status && formik.errors.status
                            }
                        >
                            <option value={4}>Sipariş Al</option>
                            <option value={2}>Teklif ver.</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Firma:</Form.Label>
                        <Select
                            onChange={handleUserSearchChange}
                            onInputChange={handleUserInputChange}
                            options={userOptions}
                            isValid={
                                formik.touched.user_id && !formik.errors.user_id
                            }
                            isInvalid={
                                formik.touched.user_id && formik.errors.user_id
                            }
                            placeholder="Siparişi veren firma bilgileri."
                        />
                        {formik.touched.user_id && formik.errors.user_id && (
                            <div className="text-danger">
                                Siparişi alacak müşteriyi seçiniz.
                            </div>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Ürün Ekle:</Form.Label>
                        <Select
                            isClearable
                            isSearchable
                            value={productKeyword}
                            components={{ NoOptionsMessage }}
                            styles={{
                                noOptionsMessage: (base) => ({
                                    ...base,
                                    ...msgStyles,
                                }),
                            }}
                            filterOption={(option, inputValue) => {
                                return option.data.normalizedLabel.includes(
                                    normalizeText(inputValue)
                                );
                            }}
                            onChange={handleProductSearchChange}
                            onInputChange={handleProductInputChange}
                            options={productOptions}
                            placeholder="Eklemek istediğiniz ürünü giriniz."
                        />
                    </Form.Group>

                    <Table
                        striped
                        responsive
                        bordered
                        hover
                        style={{ minWidth: 900 }}
                    >
                        <thead>
                            <tr>
                                <th style={{ minWidth: 250 }}>Ürün Adı</th>
                                <th className="col-lg-2">Adet</th>
                                <th className="col-lg-2">Ham Fiyat</th>
                                <th className="col-lg-2">Para Birimi</th>
                                <th className="col-lg-2">Çarpan</th>
                                <th className="col-lg-2">Fiyat (TL)</th>
                                <th className="col-lg-2">Tutar (TL)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formik.values.products.map((product, key) => (
                                <tr key={key}>
                                    <td>{product.name}</td>
                                    <td style={{ width: 140 }}>
                                        <Form.Control
                                            name={`products.${key}.piece`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isValid={
                                                formik.touched.products?.[key]
                                                    ?.piece &&
                                                !formik.errors.products?.[key]
                                                    ?.piece
                                            }
                                            isInvalid={
                                                formik.touched.products?.[key]
                                                    ?.piece &&
                                                formik.errors.products?.[key]
                                                    ?.piece
                                            }
                                            value={
                                                formik.values.products?.[key]
                                                    ?.piece
                                            }
                                            autoComplete="off"
                                        />
                                    </td>
                                    <td
                                        style={{
                                            width: 160,
                                        }}
                                    >
                                        <Form.Control
                                            type="text"
                                            name={`products.${key}.exact_price`}
                                            isValid={
                                                formik.touched.products?.[key]
                                                    ?.exact_price &&
                                                !formik.errors.products?.[key]
                                                    ?.exact_price
                                            }
                                            isInvalid={
                                                formik.touched.products?.[key]
                                                    ?.exact_price &&
                                                formik.errors.products?.[key]
                                                    ?.exact_price
                                            }
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={
                                                formik.values.products?.[key]
                                                    ?.exact_price
                                            }
                                            autoComplete="off"
                                        />
                                    </td>
                                    <td
                                        style={{
                                            width: 120,
                                        }}
                                    >
                                        <Form.Select
                                            name={`products.${key}.currency`}
                                            isValid={
                                                formik.touched.products?.[key]
                                                    ?.currency &&
                                                !formik.errors.products?.[key]
                                                    ?.currency
                                            }
                                            isInvalid={
                                                formik.touched.products?.[key]
                                                    ?.currency &&
                                                formik.errors.products?.[key]
                                                    ?.currency
                                            }
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={
                                                formik.values.products?.[key]
                                                    ?.currency || "TL"
                                            }
                                        >
                                            <option value="TL">TL</option>
                                            <option value="DOLAR">DOLAR</option>
                                            <option value="EURO">EURO</option>
                                        </Form.Select>
                                    </td>
                                    <td
                                        style={{
                                            width: 110,
                                        }}
                                    >
                                        <Form.Control
                                            name={`products.${key}.factor`}
                                            isValid={
                                                formik.touched.products?.[key]
                                                    ?.factor &&
                                                !formik.errors.products?.[key]
                                                    ?.factor
                                            }
                                            isInvalid={
                                                formik.touched.products?.[key]
                                                    ?.factor &&
                                                formik.errors.products?.[key]
                                                    ?.factor
                                            }
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={
                                                formik.values.products?.[key]
                                                    ?.factor
                                            }
                                            autoComplete="off"
                                        />
                                    </td>

                                    <td style={{ width: 140 }}>
                                        <Form.Control
                                            disabled
                                            type="number"
                                            name={`products.${key}.price`}
                                            isValid={
                                                formik.touched.products?.[key]
                                                    ?.price &&
                                                !formik.errors.products?.[key]
                                                    ?.price
                                            }
                                            isInvalid={
                                                formik.touched.products?.[key]
                                                    ?.price &&
                                                formik.errors.products?.[key]
                                                    ?.price
                                            }
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={
                                                formik.values.products?.[key]
                                                    ?.price
                                            }
                                            autoComplete="off"
                                        />
                                    </td>
                                    <td style={{ width: 200 }}>
                                        <Form.Control
                                            disabled
                                            type="number"
                                            name={`products.${key}.last_price`}
                                            isValid={
                                                formik.touched.products?.[key]
                                                    ?.last_price &&
                                                !formik.errors.products?.[key]
                                                    ?.last_price
                                            }
                                            isInvalid={
                                                formik.touched.products?.[key]
                                                    ?.last_price &&
                                                formik.errors.products?.[key]
                                                    ?.last_price
                                            }
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={
                                                formik.values.products?.[key]
                                                    ?.last_price
                                            }
                                            autoComplete="off"
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            onClick={() => {
                                                const updatedProducts =
                                                    formik.values.products.filter(
                                                        (_, index) =>
                                                            index !== key
                                                    );
                                                formik.setFieldValue(
                                                    "products",
                                                    updatedProducts
                                                );
                                            }}
                                            variant="danger"
                                        >
                                            Sil
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>Toplam tutar (TL):</td>
                                <td>
                                    <Form.Control
                                        disabled
                                        type="number"
                                        value={totalPrice}
                                        onChange={formik.handleChange}
                                        name={`total_price`}
                                        onBlur={formik.handleBlur}
                                    />
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </Table>
                    <Form.Group className="mb-3" controlId="validationFormik01">
                        <Form.Label>Açıklama:</Form.Label>
                        <Form.Control
                            name={`description`}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isValid={
                                formik.touched.description &&
                                !formik.errors.description
                            }
                            isInvalid={
                                formik.touched.description &&
                                formik.errors.description
                            }
                            value={formik.values.description || ""}
                            autoComplete="off"
                        />
                    </Form.Group>
                    <Button type="submit">Sipariş Oluştur</Button>
                    {/* <Button onClick={() => console.log(formik.values)}>
                        Test
                    </Button> */}
                </Form>
            </Row>
        </Container>
    );
}

export default NewOrder;

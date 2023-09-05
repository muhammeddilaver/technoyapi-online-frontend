import { useQuery } from "@tanstack/react-query";
import {
    currencyRates,
    fetchSearchList,
    fetchSearchUsersAdmin,
} from "../../api";
import { useEffect, useState } from "react";
import { Button, Container, Form, Row, Table } from "react-bootstrap";
import { useFormik } from "formik";
import Select, { components } from "react-select";

function NewOrder() {
    const [userKeyword, setuserKeyword] = useState("");
    const [productKeyword, setproductKeyword] = useState("");
    const [dolar, setDolar] = useState(null);
    const [euro, setEuro] = useState(null);

    const { data: userData } = useQuery(["userSearch", userKeyword], () =>
        fetchSearchUsersAdmin(userKeyword)
    );

    const { data: productData } = useQuery(
        ["order", productKeyword],
        fetchSearchList
    );

    const getCurrency = async () => {
        const { dolar, euro } = await currencyRates();
        setDolar(dolar);
        setEuro(euro);
    };

    useEffect(() => {
        getCurrency();
    }, []);

    const formik = useFormik({
        initialValues: {
            products: [],
            description: "",
            user_id: "",
        },
        onSubmit: async (values, bag) => {
            console.log(values);
        },
    });

    useEffect(() => {
        for (let i = 0; i < formik.values.products.length; i++) {
            formik.values.products[i].price =
                formik.values.products[i].exact_price *
                    (formik.values.products?.[i]?.currency === "DOLAR"
                        ? dolar
                        : formik.values.products?.[i]?.currency === "EURO"
                        ? euro
                        : 1) +
                (formik.values.products[i].exact_price *
                    (formik.values.products?.[i]?.currency === "DOLAR"
                        ? dolar
                        : formik.values.products?.[i]?.currency === "EURO"
                        ? euro
                        : 1) *
                    formik.values.products[i].factor) /
                    100;
            if (!formik.values.products[i].piece) {
                formik.values.products[i].piece = 0;
            }
        }

        let totalPrice = 0;
        formik.values.products.forEach((product) => {
            totalPrice += product.price * product.piece;
        });
        formik.setFieldValue("total_price", totalPrice);
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
                factor: 0,
                inventory: 1000,
                name: name,
                photos: [],
                price: 0,
                status: false,
            },
        ]);
    };

    const productOptions =
        productData?.map((data) => ({
            value: data,
            label: data.name,
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
                <Form.Group className="mb-3">
                    <Form.Label>Firma:</Form.Label>
                    <Select
                        onChange={handleUserSearchChange}
                        onInputChange={handleUserInputChange}
                        options={userOptions}
                        placeholder="Siparişi veren firma bilgileri."
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Ürün Ekle:</Form.Label>
                    <Select
                        value={productKeyword}
                        components={{ NoOptionsMessage }}
                        styles={{
                            noOptionsMessage: (base) => ({
                                ...base,
                                ...msgStyles,
                            }),
                        }}
                        onChange={handleProductSearchChange}
                        onInputChange={handleProductInputChange}
                        options={productOptions}
                        placeholder="Eklemek istediğiniz ürünü giriniz."
                    />
                </Form.Group>
                <form onSubmit={formik.handleSubmit}>
                    <Table
                        striped
                        responsive
                        bordered
                        hover
                        style={{ minWidth: 800 }}
                    >
                        <thead>
                            <tr>
                                <th style={{ minWidth: 250 }}>Ürün Adı</th>
                                <th className="col-lg-2">Adet</th>
                                <th className="col-lg-2">Ham Fiyat</th>
                                <th className="col-lg-2">Para Birimi</th>
                                <th className="col-lg-2">Çarpan</th>
                                <th className="col-lg-2">Fiyat</th>
                                <th className="col-lg-2">Tutar</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formik.values.products.map((product, key) => (
                                <tr key={key}>
                                    <td>{product.name}</td>
                                    <td style={{ width: 40 }}>
                                        <Form.Control
                                            type="number"
                                            name={`products.${key}.piece`}
                                            min={1}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={
                                                formik.values.products?.[key]
                                                    ?.piece || 0
                                            }
                                        />
                                    </td>
                                    <td
                                        style={{
                                            width: 110,
                                        }}
                                    >
                                        <Form.Control
                                            type="number"
                                            min={1}
                                            name={`products.${key}.exact_price`}
                                            onChange={(event) => {
                                                formik.handleChange(event);
                                                const updatedValue =
                                                    parseFloat(
                                                        event.target.value
                                                    ) *
                                                        (formik.values
                                                            .products?.[key]
                                                            ?.currency ===
                                                        "DOLAR"
                                                            ? dolar
                                                            : formik.values
                                                                  .products?.[
                                                                  key
                                                              ]?.currency ===
                                                              "EURO"
                                                            ? euro
                                                            : 1) || 0;
                                                formik.setFieldValue(
                                                    `products.${key}.price`,
                                                    updatedValue +
                                                        (updatedValue *
                                                            formik.values
                                                                .products?.[key]
                                                                ?.factor) /
                                                            100 || 0
                                                );
                                                formik.setFieldValue(
                                                    `products.${key}.last_price`,
                                                    (updatedValue +
                                                        (updatedValue *
                                                            formik.values
                                                                .products?.[key]
                                                                ?.factor) /
                                                            100) *
                                                        parseFloat(
                                                            formik.values
                                                                .products?.[key]
                                                                ?.piece
                                                        ) || 0
                                                );
                                            }}
                                            onBlur={formik.handleBlur}
                                            value={
                                                formik.values.products?.[key]
                                                    ?.exact_price || 0
                                            }
                                        />
                                    </td>
                                    <td
                                        style={{
                                            width: 80,
                                        }}
                                    >
                                        <Form.Select
                                            name={`products.${key}.currency`}
                                            onChange={(event) => {
                                                formik.handleChange(event);
                                                formik.setFieldValue(
                                                    `products.${key}.price`,
                                                    (parseFloat(
                                                        formik.values
                                                            .products?.[key]
                                                            ?.exact_price
                                                    ) *
                                                        (event.target.value ===
                                                        "DOLAR"
                                                            ? dolar
                                                            : event.target
                                                                  .value ===
                                                              "EURO"
                                                            ? euro
                                                            : 1) || 0) +
                                                        (parseFloat(
                                                            formik.values
                                                                .products?.[key]
                                                                ?.factor
                                                        ) *
                                                            parseFloat(
                                                                formik.values
                                                                    .products?.[
                                                                    key
                                                                ]?.exact_price
                                                            ) *
                                                            (event.target
                                                                .value ===
                                                            "DOLAR"
                                                                ? dolar
                                                                : event.target
                                                                      .value ===
                                                                  "EURO"
                                                                ? euro
                                                                : 1) || 0) /
                                                            100 || 0
                                                );
                                                formik.setFieldValue(
                                                    `products.${key}.last_price`,
                                                    ((parseFloat(
                                                        formik.values
                                                            .products?.[key]
                                                            ?.exact_price
                                                    ) || 0) +
                                                        (parseFloat(
                                                            formik.values
                                                                .products?.[key]
                                                                ?.factor
                                                        ) *
                                                            parseFloat(
                                                                formik.values
                                                                    .products?.[
                                                                    key
                                                                ]?.exact_price
                                                            ) || 0) /
                                                            100) *
                                                        parseFloat(
                                                            formik.values
                                                                .products?.[key]
                                                                ?.piece
                                                        ) || 0
                                                );
                                            }}
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
                                            type="number"
                                            name={`products.${key}.factor`}
                                            onChange={(event) => {
                                                formik.handleChange(event);
                                                const updatedValue =
                                                    parseFloat(
                                                        event.target.value
                                                    ) || 0;
                                                formik.setFieldValue(
                                                    `products.${key}.price`,
                                                    (parseFloat(
                                                        formik.values
                                                            .products?.[key]
                                                            ?.exact_price
                                                    ) *
                                                        (formik.values
                                                            .products?.[key]
                                                            ?.currency ===
                                                        "DOLAR"
                                                            ? dolar
                                                            : formik.values
                                                                  .products?.[
                                                                  key
                                                              ]?.currency ===
                                                              "EURO"
                                                            ? euro
                                                            : 1) || 0) +
                                                        (updatedValue *
                                                            parseFloat(
                                                                formik.values
                                                                    .products?.[
                                                                    key
                                                                ]?.exact_price
                                                            ) *
                                                            (formik.values
                                                                .products?.[key]
                                                                ?.currency ===
                                                            "DOLAR"
                                                                ? dolar
                                                                : formik.values
                                                                      .products?.[
                                                                      key
                                                                  ]
                                                                      ?.currency ===
                                                                  "EURO"
                                                                ? euro
                                                                : 1) || 0) /
                                                            100 || 0
                                                );
                                                formik.setFieldValue(
                                                    `products.${key}.last_price`,
                                                    ((parseFloat(
                                                        formik.values
                                                            .products?.[key]
                                                            ?.exact_price
                                                    ) *
                                                        (formik.values
                                                            .products?.[key]
                                                            ?.currency ===
                                                        "DOLAR"
                                                            ? dolar
                                                            : formik.values
                                                                  .products?.[
                                                                  key
                                                              ]?.currency ===
                                                              "EURO"
                                                            ? euro
                                                            : 1) || 0) +
                                                        (updatedValue *
                                                            parseFloat(
                                                                formik.values
                                                                    .products?.[
                                                                    key
                                                                ]?.exact_price
                                                            ) *
                                                            (formik.values
                                                                .products?.[key]
                                                                ?.currency ===
                                                            "DOLAR"
                                                                ? dolar
                                                                : formik.values
                                                                      .products?.[
                                                                      key
                                                                  ]
                                                                      ?.currency ===
                                                                  "EURO"
                                                                ? euro
                                                                : 1) || 0) /
                                                            100) *
                                                        parseFloat(
                                                            formik.values
                                                                .products?.[key]
                                                                ?.piece
                                                        ) || 0
                                                );
                                            }}
                                            onBlur={formik.handleBlur}
                                            value={
                                                formik.values.products?.[key]
                                                    ?.factor || 0
                                            }
                                        />
                                    </td>

                                    <td style={{ width: 110 }}>
                                        <Form.Control
                                            disabled
                                            type="number"
                                            name={`products.${key}.price`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={
                                                (parseFloat(
                                                    formik.values.products?.[
                                                        key
                                                    ]?.exact_price
                                                ) * (formik
                                                    .values
                                                    .products?.[
                                                    key
                                                ]
                                                    ?.currency ===
                                                "DOLAR"
                                                    ? dolar
                                                    : formik
                                                          .values
                                                          .products?.[
                                                          key
                                                      ]
                                                          ?.currency ===
                                                      "EURO"
                                                    ? euro
                                                    : 1) || 0) +
                                                    ((parseFloat(
                                                        formik.values
                                                            .products?.[key]
                                                            ?.exact_price
                                                    ) * (formik
                                                        .values
                                                        .products?.[
                                                        key
                                                    ]
                                                        ?.currency ===
                                                    "DOLAR"
                                                        ? dolar
                                                        : formik
                                                              .values
                                                              .products?.[
                                                              key
                                                          ]
                                                              ?.currency ===
                                                          "EURO"
                                                        ? euro
                                                        : 1) || 0) *
                                                        parseFloat(
                                                            formik.values
                                                                .products?.[key]
                                                                ?.factor
                                                        )) /
                                                        100 || 0
                                            }
                                        />
                                    </td>
                                    <td style={{ width: 110 }}>
                                        <Form.Control
                                            disabled
                                            type="number"
                                            name={`products.${key}.last_price`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={
                                                (parseFloat(
                                                    formik.values.products?.[
                                                        key
                                                    ]?.exact_price
                                                ) * (formik
                                                    .values
                                                    .products?.[
                                                    key
                                                ]
                                                    ?.currency ===
                                                "DOLAR"
                                                    ? dolar
                                                    : formik
                                                          .values
                                                          .products?.[
                                                          key
                                                      ]
                                                          ?.currency ===
                                                      "EURO"
                                                    ? euro
                                                    : 1) +
                                                    (parseFloat(
                                                        formik.values
                                                            .products?.[key]
                                                            ?.exact_price
                                                    ) * (formik
                                                        .values
                                                        .products?.[
                                                        key
                                                    ]
                                                        ?.currency ===
                                                    "DOLAR"
                                                        ? dolar
                                                        : formik
                                                              .values
                                                              .products?.[
                                                              key
                                                          ]
                                                              ?.currency ===
                                                          "EURO"
                                                        ? euro
                                                        : 1) *
                                                        parseFloat(
                                                            formik.values
                                                                .products?.[key]
                                                                ?.factor
                                                        )) /
                                                        100) *
                                                    parseFloat(
                                                        formik.values
                                                            .products?.[key]
                                                            ?.piece
                                                    ) || 0
                                            }
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
                                <td>Toplam tutar:</td>
                                <td>
                                    <Form.Control
                                        disabled
                                        type="number"
                                        name={`total_price`}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.total_price || 0}
                                    />
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </Table>
                    <Form.Group className="mb-3">
                        <Form.Label>Açıklama:</Form.Label>
                        <Form.Control
                            name={`description`}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description || ""}
                        ></Form.Control>
                    </Form.Group>
                    <Button type="submit">Sipariş Oluştur</Button>
                    <Button onClick={() => console.log(formik.values)}>
                        test
                    </Button>
                </form>
            </Row>
        </Container>
    );
}

export default NewOrder;

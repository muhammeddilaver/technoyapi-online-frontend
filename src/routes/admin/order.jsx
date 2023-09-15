import { Button, Container, Form, Row, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addProductToOrder,
    currencyRates,
    deleteProductFromOrder,
    fetchOrderAdmin,
    fetchSearchList,
    returnProductFromOrder,
    updateOrder,
} from "../../api";
import { useToast } from "../../contexts/ToastContext";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import Select from "react-select";
import {
    neworderValidations,
    shortOrderAdminValidations,
} from "../../validations/yup";

function OrderAdmin() {
    const { order_id } = useParams();
    const { createToast } = useToast();
    const [keyword, setkeyword] = useState("");
    const [dolar, setDolar] = useState(null);
    const [euro, setEuro] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [validationSchema, setValidationSchema] =
        useState(neworderValidations);

    const { isLoading, isError, data, error } = useQuery(
        ["order", order_id],
        () => fetchOrderAdmin(order_id)
    );

    const {
        isLoading: searchIsLoading,
        isError: searchIsError,
        data: searchData,
        error: searchError,
    } = useQuery(["order", keyword], fetchSearchList);

    const formik = useFormik({
        initialValues: {},
        onSubmit: async (values, bag) => {
            const prepareValues = {
                ...values,
                products: [...values.products],
            };
            delete prepareValues.client;
            delete prepareValues.description;
            delete prepareValues.order_date;
            delete prepareValues.user_id;
            delete prepareValues.__v;
            for (let i = 0; i < prepareValues.products.length; i++) {
                delete prepareValues.products[i].brand;
                delete prepareValues.products[i].category_id;
                prepareValues.products[i].status &&
                    delete prepareValues.products[i].name;
                delete prepareValues.products[i].photos;
            }
            prepareValues.status = values.status + 1;
            try {
                updateMutation.mutate(prepareValues);

                let message = null;

                if (values.status === 1) {
                    message = "Teklif gönderildi.";
                } else if (values.status === 3) {
                    message =
                        "Sipariş onaylanarak hazırlanma aşamasına alındı.";
                } else if (values.status === 4) {
                    message = "Sipariş teslimat aşamasına alındı.";
                } else if (values.status === 5) {
                    message = "Sipariş teslim edildi.";
                }

                createToast({
                    title: "Bilgi",
                    text: message,
                });
            } catch (error) {
                console.log(error);
            }
        },
        validationSchema,
    });

    useEffect(() => {
        if (data) {
            formik.setValues(data[0]);
        }
    }, [data]);

    useEffect(() => {
        if (formik.values.products && formik.values.products.length > 0) {
            for (let i = 0; i < formik.values.products.length; i++) {
                if (
                    formik.values.products[i].return !==
                    formik.values.products[i].piece
                ) {
                    if (
                        formik.values.status === 1 ||
                        formik.values.status === 3
                    ) {
                        formik.values.products[i].price =
                            parseFloat(formik.values.products[i].exact_price) *
                                (formik.values.products?.[i]?.currency ===
                                "DOLAR"
                                    ? dolar
                                    : formik.values.products?.[i]?.currency ===
                                      "EURO"
                                    ? euro
                                    : 1) +
                            (parseFloat(formik.values.products[i].exact_price) *
                                (formik.values.products?.[i]?.currency ===
                                "DOLAR"
                                    ? dolar
                                    : formik.values.products?.[i]?.currency ===
                                      "EURO"
                                    ? euro
                                    : 1) *
                                parseFloat(formik.values.products[i].factor)) /
                                100;
                        formik.values.products[i].last_price =
                            parseFloat(formik.values.products[i].price) *
                            parseFloat(formik.values.products[i].piece);
                    }
                    if (
                        formik.values.status === 2 ||
                        formik.values.status === 4 ||
                        formik.values.status === 5 ||
                        formik.values.status === 6
                    ) {
                        formik.values.products[i].last_price =
                            parseFloat(formik.values.products[i].price) *
                            parseFloat(formik.values.products[i].piece);
                    }
                }
            }

            let newTotalPrice = 0;
            formik.values.products.forEach((product) => {
                newTotalPrice += product.price * product.piece;
            });
            setTotalPrice(newTotalPrice);
        }
        setValidationSchema(
            formik.values.status !== 1 &&
                formik.values.status !== 3 &&
                shortOrderAdminValidations
        );
    }, [formik.values.products]);

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

    const queryClient = useQueryClient();

    const returnMutation = useMutation(returnProductFromOrder, {
        onSuccess: () => {
            //queryClient.invalidateQueries(["order", order_id]);
            queryClient.refetchQueries(["order", order_id]);
            createToast({
                title: "Bilgi",
                text: "Ürünler iade alındı.",
            });
        },
    });

    const deleteMutation = useMutation(deleteProductFromOrder, {
        onSuccess: () => {
            //queryClient.invalidateQueries(["order", order_id]);
            queryClient.refetchQueries(["order", order_id]);
            createToast({
                title: "Bilgi",
                text: "Ürün başarıyla silindi.",
            });
        },
    });

    const updateMutation = useMutation(updateOrder, {
        onSuccess: () => {
            queryClient.invalidateQueries(["order", order_id]);
            queryClient.refetchQueries(["order", order_id]);
            createToast({
                title: "Bilgi",
                text: "Ürün başarıyla düzenlendi.",
            });
        },
    });

    const addProductMutation = useMutation(addProductToOrder, {
        onSuccess: () => {
            queryClient.invalidateQueries(["order", order_id]);
            queryClient.refetchQueries(["order", order_id]);
            createToast({
                title: "Bilgi",
                text: "Ürün başarıyla düzenlendi.",
            });
        },
    });

    if (isLoading) {
        return <div>Yükleniyor...</div>;
    }

    if (isError) {
        return <div>Sipariş bulunamadı</div>;
    }

    const orderStatusMessage = (status) => {
        switch (status) {
            case 1:
                return "Teklif bekliyor.";
            case 2:
                return "Teklif verildi.";
            case 3:
                return "Sipariş verildi.";
            case 4:
                return "Sipariş hazırlanıyor.";
            case 5:
                return "Sipariş teslimatta.";
            case 6:
                return "Sipariş teslim edildi.";
            case 7:
                return "Sipariş iptal edildi";
        }
    };

    const handleReturn = (product, orderId) => {
        const returnCount = prompt(
            "İade almak istediğiniz ürün adedini giriniz.",
            product.return === 0 ? product.piece : product.return
        );
        returnMutation.mutate({
            productId: product._id,
            count: returnCount,
            orderId: orderId,
        });
    };

    const handleSearchChange = (selectedOption) => {
        addProductMutation.mutate({
            product_id: selectedOption.value._id,
            orderId: order_id,
        });
        setkeyword("");
    };

    const handleInputChange = (inputValue, { action }) => {
        if (action === "input-change") {
            setkeyword(inputValue);
        }
    };

    const options =
        searchData?.map((data) => ({
            value: data,
            label: data.name,
        })) || [];

    return (
        <Container style={{ marginTop: 80 }}>
            <Row>
                <Table striped responsive bordered hover>
                    <tbody>
                        <tr>
                            <td>Alıcı Firma</td>
                            <td>{data[0].client.company_name}</td>
                        </tr>
                        <tr>
                            <td>Sipariş Tarihi</td>
                            <td>
                                {moment(data[0].order_date).format(
                                    "DD.MM.YYYY HH:mm"
                                )}
                            </td>
                        </tr>
                        {data[0].delivery_date && (
                            <tr>
                                <td>Teslimat Tarihi</td>
                                <td>
                                    {moment(data[0].delivery_date).format(
                                        "DD.MM.YYYY HH:mm"
                                    )}
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td>Açıklama</td>
                            <td>{data[0].description}</td>
                        </tr>
                        <tr>
                            <td>Durum</td>
                            <td>{orderStatusMessage(data[0].status)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Row>
            <Row>
                <p>
                    <b>Siparişler:</b>
                </p>
                <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                >
                    <Form.Label>Ürün ekle:</Form.Label>
                    <Select
                        value={keyword}
                        onChange={handleSearchChange}
                        onInputChange={handleInputChange}
                        options={options}
                        placeholder="Listeye eklemek istediğiniz ürünü giriniz."
                    />
                </Form.Group>

                <Form noValidate onSubmit={formik.handleSubmit}>
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
                                {(formik.values.status === 1 ||
                                    formik.values.status === 3) && (
                                    <>
                                        <th className="col-lg-2">Ham Fiyat</th>
                                        <th className="col-lg-2">
                                            Para Birimi
                                        </th>
                                        <th className="col-lg-2">Çarpan</th>
                                    </>
                                )}

                                <th className="col-lg-2">Fiyat (TL)</th>
                                <th className="col-lg-2">Tutar (TL)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data[0].products.map(
                                (product, key) =>
                                    product.piece > 0 && (
                                        <tr
                                            key={key}
                                            className={
                                                !product.status
                                                    ? "table-danger"
                                                    : ""
                                            }
                                        >
                                            <td>
                                                {product.status ? (
                                                    product.name
                                                ) : (
                                                    <Form.Control
                                                        name={`products.${key}.name`}
                                                        onChange={
                                                            formik.handleChange
                                                        }
                                                        onBlur={
                                                            formik.handleBlur
                                                        }
                                                        value={
                                                            formik.values
                                                                .products?.[key]
                                                                ?.name || ""
                                                        }
                                                    />
                                                )}
                                            </td>
                                            <td style={{ width: 40 }}>
                                                <Form.Control
                                                    name={`products.${key}.piece`}
                                                    isValid={
                                                        formik.touched
                                                            .products?.[key]
                                                            ?.piece &&
                                                        !formik.errors
                                                            .products?.[key]
                                                            ?.piece
                                                    }
                                                    isInvalid={
                                                        formik.touched
                                                            .products?.[key]
                                                            ?.piece &&
                                                        formik.errors
                                                            .products?.[key]
                                                            ?.piece
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    value={
                                                        formik.values
                                                            .products?.[key]
                                                            ?.piece
                                                    }
                                                />
                                            </td>
                                            {(formik.values.status === 1 ||
                                                formik.values.status === 3) && (
                                                <>
                                                    <td
                                                        style={{
                                                            width: 110,
                                                        }}
                                                    >
                                                        <Form.Control
                                                            disabled={
                                                                (formik.values
                                                                    .status ===
                                                                    2 ||
                                                                    formik
                                                                        .values
                                                                        .status ===
                                                                        4 ||
                                                                    formik
                                                                        .values
                                                                        .status ===
                                                                        5 ||
                                                                    formik
                                                                        .values
                                                                        .status ===
                                                                        6) &&
                                                                true
                                                            }
                                                            type="text"
                                                            name={`products.${key}.exact_price`}
                                                            isValid={
                                                                formik.touched
                                                                    .products?.[
                                                                    key
                                                                ]
                                                                    ?.exact_price &&
                                                                !formik.errors
                                                                    .products?.[
                                                                    key
                                                                ]?.exact_price
                                                            }
                                                            isInvalid={
                                                                formik.touched
                                                                    .products?.[
                                                                    key
                                                                ]
                                                                    ?.exact_price &&
                                                                formik.errors
                                                                    .products?.[
                                                                    key
                                                                ]?.exact_price
                                                            }
                                                            onChange={
                                                                formik.handleChange
                                                            }
                                                            onBlur={
                                                                formik.handleBlur
                                                            }
                                                            value={
                                                                formik.values
                                                                    .products?.[
                                                                    key
                                                                ]?.exact_price
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
                                                            onChange={
                                                                formik.handleChange
                                                            }
                                                            onBlur={
                                                                formik.handleBlur
                                                            }
                                                            value={
                                                                formik.values
                                                                    .products?.[
                                                                    key
                                                                ]?.currency ||
                                                                "TL"
                                                            }
                                                        >
                                                            <option value="TL">
                                                                TL
                                                            </option>
                                                            <option value="DOLAR">
                                                                DOLAR
                                                            </option>
                                                            <option value="EURO">
                                                                EURO
                                                            </option>
                                                        </Form.Select>
                                                    </td>
                                                    <td
                                                        style={{
                                                            width: 110,
                                                        }}
                                                    >
                                                        <Form.Control
                                                            disabled={
                                                                (formik.values
                                                                    .status ===
                                                                    2 ||
                                                                    formik
                                                                        .values
                                                                        .status ===
                                                                        4 ||
                                                                    formik
                                                                        .values
                                                                        .status ===
                                                                        5 ||
                                                                    formik
                                                                        .values
                                                                        .status ===
                                                                        6) &&
                                                                true
                                                            }
                                                            type="number"
                                                            name={`products.${key}.factor`}
                                                            isValid={
                                                                formik.touched
                                                                    .products?.[
                                                                    key
                                                                ]?.factor &&
                                                                !formik.errors
                                                                    .products?.[
                                                                    key
                                                                ]?.factor
                                                            }
                                                            isInvalid={
                                                                formik.touched
                                                                    .products?.[
                                                                    key
                                                                ]?.factor &&
                                                                formik.errors
                                                                    .products?.[
                                                                    key
                                                                ]?.factor
                                                            }
                                                            onChange={
                                                                formik.handleChange
                                                            }
                                                            onBlur={
                                                                formik.handleBlur
                                                            }
                                                            value={
                                                                formik.values
                                                                    .products?.[
                                                                    key
                                                                ]?.factor
                                                            }
                                                        />
                                                    </td>
                                                </>
                                            )}

                                            <td style={{ width: 110 }}>
                                                <Form.Control
                                                    disabled
                                                    type="number"
                                                    name={`products.${key}.price`}
                                                    isValid={
                                                        formik.touched
                                                            .products?.[key]
                                                            ?.price &&
                                                        !formik.errors
                                                            .products?.[key]
                                                            ?.price
                                                    }
                                                    isInvalid={
                                                        formik.touched
                                                            .products?.[key]
                                                            ?.price &&
                                                        formik.errors
                                                            .products?.[key]
                                                            ?.price
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    value={
                                                        formik.values
                                                            .products?.[key]
                                                            ?.price
                                                    }
                                                />
                                            </td>
                                            <td style={{ width: 110 }}>
                                                <Form.Control
                                                    disabled
                                                    type="number"
                                                    name={`products.${key}.last_price`}
                                                    isValid={
                                                        formik.touched
                                                            .products?.[key]
                                                            ?.last_price &&
                                                        !formik.errors
                                                            .products?.[key]
                                                            ?.last_price
                                                    }
                                                    isInvalid={
                                                        formik.touched
                                                            .products?.[key]
                                                            ?.last_price &&
                                                        formik.errors
                                                            .products?.[key]
                                                            ?.last_price
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    onBlur={formik.handleBlur}
                                                    value={
                                                        formik.values
                                                            .products?.[key]
                                                            ?.last_price
                                                    }
                                                />
                                            </td>
                                            <td>
                                                {data[0].status === 6 && (
                                                    <Button
                                                        variant="primary"
                                                        onClick={() =>
                                                            handleReturn(
                                                                product,
                                                                data[0]._id
                                                            )
                                                        }
                                                    >
                                                        İade Al
                                                    </Button>
                                                )}
                                                {data[0].status > 0 &&
                                                    data[0].status < 6 && (
                                                        <Button
                                                            onClick={() =>
                                                                deleteMutation.mutate(
                                                                    {
                                                                        productId:
                                                                            product._id,
                                                                        orderId:
                                                                            data[0]
                                                                                ._id,
                                                                    }
                                                                )
                                                            }
                                                            variant="danger"
                                                        >
                                                            Sil
                                                        </Button>
                                                    )}
                                                {data[0].status === 6 &&
                                                    product.status === 2 &&
                                                    "İade istendi"}
                                            </td>
                                        </tr>
                                    )
                            )}
                            <tr>
                                {(formik.values.status === 1 ||
                                    formik.values.status === 3) && (
                                    <>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </>
                                )}

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
                    {data[0].products.some(
                        (product) => product.return !== 0
                    ) && (
                        <>
                            <p>
                                <b>İadeler:</b>
                            </p>
                            <Table
                                striped
                                responsive
                                bordered
                                hover
                                style={{ minWidth: 800 }}
                            >
                                <thead>
                                    <tr>
                                        <th>Ürün Adı</th>
                                        <th>Adet</th>
                                        <th>Fiyat (TL)</th>
                                        <th>Tutar (TL)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data[0].products.map(
                                        (product, key) =>
                                            product.return > 0 && (
                                                <tr key={key}>
                                                    <td>{product.name}</td>
                                                    <td>{product.return}</td>
                                                    <td>{product.price}</td>
                                                    <td>
                                                        {product.price *
                                                            product.return}
                                                    </td>
                                                </tr>
                                            )
                                    )}
                                </tbody>
                            </Table>
                        </>
                    )}
                    {formik.values.status !== 6 && (
                        <Button
                            type="submit"
                            disabled={formik.values.status === 2 && true}
                        >
                            {formik.values.status === 1 && "Teklif Gönder"}
                            {formik.values.status === 2 && "Onay Bekleniyor"}
                            {formik.values.status === 3 && "Siparişi Al"}
                            {formik.values.status === 4 && "Teslimata Gönder"}
                            {formik.values.status === 5 && "Teslim Et"}
                        </Button>
                    )}
                    {/*                     <Button onClick={() => console.log(formik.values)}>
                        Test
                    </Button> */}
                </Form>
            </Row>
        </Container>
    );
}

export default OrderAdmin;

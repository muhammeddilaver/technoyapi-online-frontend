import { CloseButton, Container, Form } from "react-bootstrap";
import Icon from "antd/lib/icon";
import { useBasket } from "../../contexts/BasketContext";
import { useToast } from "../../contexts/ToastContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "../../api";
import { useFormik } from "formik";
import { basketValidations } from "../../validations/yup";
import { ConfigProvider, Spin, Table, Tooltip, Button } from "antd";
import { useState } from "react";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";

function BasketNavbar({ handleClose }) {
    const { setitems, items, delFromBasket, changePieceFromBasket } =
        useBasket();
    const { createToast } = useToast();
    const [isSpin, setisSpin] = useState(false);

    const queryClient = useQueryClient();

    const createOrderMutation = useMutation(createOrder, {
        onSuccess: () => {
            queryClient.invalidateQueries("orderList");
            queryClient.refetchQueries("orderList");
            queryClient.invalidateQueries("orderListAdmin");
            queryClient.refetchQueries("orderListAdmin");
            handleClose();
            setitems([]);
            setisSpin(false);
            createToast({
                title: "Bilgi",
                text: "Siparişiniz oluşturuldu. Siparişler bölümünden takip edebilirsiniz.",
            });
        },
    });

    const formik = useFormik({
        initialValues: {
            products: items,
            description: "",
            status: 1,
        },
        onSubmit: async (values, bag) => {
            setisSpin(true);
            createOrderMutation.mutate(values);
        },
        validationSchema: basketValidations,
    });

    const columns = [
        {
            title: "Ürün adı",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Adet",
            dataIndex: "piece",
            key: "piece",
            width: 120,
            render: (text, record, index) => (
                <Form.Control
                    name={`products.${index}.piece`}
                    isValid={
                        formik.touched.products?.[index]?.piece &&
                        !formik.errors.products?.[index]?.piece
                    }
                    isInvalid={
                        formik.touched.products?.[index]?.piece &&
                        formik.errors.products?.[index]?.piece
                    }
                    onChange={(e) => {
                        formik.handleChange(e);
                        changePieceFromBasket(record._id, e.target.value);
                    }}
                    onBlur={formik.handleBlur}
                    value={formik.values.products?.[index]?.piece}
                />
            ),
        },
        {
            align: "left",
            render: (text, record) => (
                <Tooltip title="Sil">
                    <Button
                        type="primary"
                        onClick={() => delFromBasket(record.name)}
                        icon={<DeleteOutlined />}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <Container>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: "red",
                        controlHeightLG: 200,
                    },
                }}
            >
                <Spin spinning={isSpin} size="large">
                    <Form noValidate onSubmit={formik.handleSubmit}>
                        <Table
                            pagination={false}
                            columns={columns}
                            dataSource={items.map((item) => ({
                                ...item,
                                key: item._id,
                            }))}
                        />
                        {/* <Table
                            striped
                            responsive
                            bordered
                            hover
                            style={{ minWidth: 500 }}
                        >
                            <thead>
                                <tr>
                                    <th className="col-lg-1">#</th>
                                    <th style={{ minWidth: 300 }}>Ürün adı</th>
                                    <th className="col-lg-2 col-xs-6 col-sm-6">
                                        Adet
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, key) => (
                                    <tr key={key}>
                                        <td style={{ width: 40 }}>{key + 1}</td>
                                        <td>{item.name}</td>
                                        <td style={{ width: 100 }}>
                                            <Form.Control
                                                name={`products.${key}.piece`}
                                                isValid={
                                                    formik.touched.products?.[
                                                        key
                                                    ]?.piece &&
                                                    !formik.errors.products?.[
                                                        key
                                                    ]?.piece
                                                }
                                                isInvalid={
                                                    formik.touched.products?.[
                                                        key
                                                    ]?.piece &&
                                                    formik.errors.products?.[
                                                        key
                                                    ]?.piece
                                                }
                                                onChange={(e) => {
                                                    formik.handleChange(e);
                                                    changePieceFromBasket(
                                                        item._id,
                                                        e.target.value
                                                    );
                                                }}
                                                onBlur={formik.handleBlur}
                                                value={
                                                    formik.values.products?.[
                                                        key
                                                    ]?.piece
                                                }
                                            />
                                        </td>
                                        <td style={{ width: 30 }}>
                                            <CloseButton
                                                onClick={() =>
                                                    delFromBasket(item.name)
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table> */}
                        <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlTextarea1"
                        >
                            <Form.Label>
                                Siparişinizle ilgili açıklama (isteğe bağlı):
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.description}
                                rows={3}
                            />
                        </Form.Group>
                        <Button
                            onClick={() => {
                                formik.setFieldValue("status", 3);
                                formik.handleSubmit();
                            }}
                        >
                            Sipariş oluştur
                        </Button>
                        <Button
                            className="ms-3"
                            type="primary"
                            onClick={() => {
                                formik.setFieldValue("status", 1);
                                formik.handleSubmit();
                            }}
                        >
                            Teklif İste
                        </Button>
                        {/* <Button onClick={() => console.log(formik.values)}>Test</Button> */}
                    </Form>
                </Spin>
            </ConfigProvider>
        </Container>
    );
}

export default BasketNavbar;

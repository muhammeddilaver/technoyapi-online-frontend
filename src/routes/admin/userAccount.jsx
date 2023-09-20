import { Alert, Container, Row } from "react-bootstrap";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAccountPDF, createPayment, fetchAccount, getBalance, userFetch } from "../../api";
import { format } from "number-currency-format-2";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Button, Form, Input, Modal, Space, Table } from "antd";
import { useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import Title from "antd/es/typography/Title";
import { PrinterOutlined } from "@ant-design/icons";

function UserAccount() {
    const navigate = useNavigate();
    const { user_id } = useParams();

    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const { createToast } = useToast();

    const queryClient = useQueryClient();
    queryClient.setDefaultOptions({
        queries: {
            refetchOnMount: true,
            refetchOnWindowFocus: true,
        },
    });

    const addPaymentMutation = useMutation(createPayment, {
        onSuccess: (val) => {
            queryClient.invalidateQueries(["account", user_id]);
            queryClient.refetchQueries(["account", user_id]);
            queryClient.invalidateQueries(["balance", user_id]);
            queryClient.refetchQueries(["balance", user_id]);
            form.resetFields();
            setOpen(false);
            setConfirmLoading(false);
            createToast({
                title: "Bilgi",
                text: "Ödeme sisteme eklendi.",
            });
        },
        onError: (err) => {
            console.log(err);
            setConfirmLoading(false);
        },
    });

    const { isLoading, isError, data, error } = useQuery(
        ["account", user_id],
        () => fetchAccount(user_id)
    );

    const { data: userData, isLoading: userLoading } = useQuery(
        ["user", user_id],
        () => userFetch(user_id)
    );

    const {
        isLoading: balanceIsLoading,
        isError: balanceIsError,
        data: balanceData,
        error: balanceError,
    } = useQuery(["balance", user_id], () => getBalance(user_id));

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        setConfirmLoading(true);
        form.validateFields()
            .then((values) => {
                addPaymentMutation.mutate(values);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
                setConfirmLoading(false);
            });
    };
    const handleCancel = () => {
        setOpen(false);
    };

    const columns = [
        {
            title: "Tarih",
            dataIndex: "date",
            key: "date",
            render: (text, record) => (
                <>
                    {text
                        ? moment(text).format("DD.MM.YYYY HH:mm")
                        : record.delivery_date
                        ? moment(record.delivery_date).format(
                              "DD.MM.YYYY HH:mm"
                          )
                        : ""}
                </>
            ),
        },
        {
            title: "Açıklama",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "İşlem",
            dataIndex: "delivery_date",
            key: "delivery_date",
            render: (text, record) => (
                <>{text ? "Sipariş" : record.price ? "Ödeme" : ""}</>
            ),
        },
        {
            title: "Alacak",
            dataIndex: "price",
            key: "price",
            render: (text) => (
                <>
                    {format(text, {
                        currency: "₺",
                        decimalSeparator: ",",
                        thousandSeparator: ".",
                    })}
                </>
            ),
        },
        {
            title: "Borç",
            dataIndex: "total_price",
            key: "total_price",
            render: (text) => (
                <>
                    {format(text, {
                        currency: "₺",
                        decimalSeparator: ",",
                        thousandSeparator: ".",
                    })}
                </>
            ),
        },
    ];

    return (
        <Container style={{ marginTop: 80 }}>
            <Row>
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <a onClick={() => navigate(`/admin`)}>
                                    Anasayfa
                                </a>
                            ),
                        },
                        {
                            title: (
                                <a onClick={() => navigate(`/admin/users`)}>
                                    Müşteriler
                                </a>
                            ),
                        },
                        {
                            title: "Hesap Özeti",
                        },
                    ]}
                />
            </Row>
            <Row className="mt-3">
                <Space>
                    <Title level={2} strong>
                        Hesap Dökümü
                    </Title>
                    <Button
                        icon={<PrinterOutlined />}
                        onClick={() => createAccountPDF(user_id)}
                    >
                        Çıktı al
                    </Button>
                </Space>
                <Modal
                    title="Yeni Ödeme Girişi"
                    open={open}
                    onOk={handleOk}
                    okText="Gönder"
                    cancelText="İptal"
                    confirmLoading={confirmLoading}
                    onCancel={handleCancel}
                >
                    <Form
                        name="basic"
                        form={form}
                        labelCol={{
                            span: 8,
                        }}
                        wrapperCol={{
                            span: 16,
                        }}
                        style={{
                            maxWidth: 600,
                        }}
                        initialValues={{
                            remember: true,
                        }}
                        autoComplete="off"
                    >
                        <Form.Item
                            label=""
                            name="user_id"
                            initialValue={!userLoading && userData._id}
                        >
                            <Input type="hidden" />
                        </Form.Item>
                        <Form.Item
                            label="Ödeme Tutarı"
                            name="price"
                            rules={[
                                {
                                    required: true,
                                    message: "Lütfen ödeme tutarını giriniz!",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Açıklama"
                            name="description"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Lütfen ödeme ile ilgili açıklama giriniz!",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Form>
                </Modal>
                <Space>
                    <Title level={3} strong>
                        {!userLoading &&
                            userData.name + " - " + userData.company_name}
                    </Title>
                    <Button type="primary" className="mb-3" onClick={showModal}>
                        Yeni Ödeme
                    </Button>
                </Space>
            </Row>
            <Row className="flex-nowrap overflow-auto">
                <Table
                    loading={isLoading}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                record.delivery_date &&
                                    navigate(`/admin/${record._id}`);
                            }, // click row
                        };
                    }}
                    pagination={false}
                    columns={columns}
                    dataSource={
                        !isLoading &&
                        data.map((item) => ({
                            ...item,
                            key: item._id,
                        }))
                    }
                    footer={() =>
                        !balanceIsLoading && (
                            <Alert
                                className="text-center"
                                key={
                                    balanceData.result > 0
                                        ? "danger"
                                        : "success"
                                }
                                variant={
                                    balanceData.result > 0
                                        ? "danger"
                                        : "success"
                                }
                            >
                                {balanceData.result !== 0 &&
                                    format(
                                        balanceData.result *
                                            (balanceData.result < 0 ? -1 : 1),
                                        {
                                            currency: "₺",
                                            decimalSeparator: ",",
                                            thousandSeparator: ".",
                                        }
                                    )}
                                {balanceData.result > 0 &&
                                    " borcu bulunmaktadır."}
                                {balanceData.result < 0 && " alacaklı."}
                                {balanceData.result === 0 &&
                                    "Borcu bulunmamaktadır."}
                            </Alert>
                        )
                    }
                />
            </Row>
        </Container>
    );
}

export default UserAccount;

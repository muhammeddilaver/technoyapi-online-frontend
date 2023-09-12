import { Alert, Button, Container, Row } from "react-bootstrap";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPayment, fetchAccount, getBalance, userFetch } from "../../api";
import { format } from "number-currency-format-2";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Modal, Table } from "antd";
import { useState } from "react";
import { useToast } from "../../contexts/ToastContext";

function UserAccount() {
    const navigate = useNavigate();
    const { user_id } = useParams();

    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const { createToast } = useToast();

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

    const { data: userData } = useQuery(["user", user_id], () =>
        userFetch(user_id)
    );

    const {
        isLoading: balanceIsLoading,
        isError: balanceIsError,
        data: balanceData,
        error: balanceError,
    } = useQuery(["balance", user_id], () => getBalance(user_id));

    if (isLoading || balanceIsLoading) {
        return <div>Yükleniyor...</div>;
    }

    if (isError || balanceIsError) {
        return <div>Sipariş bulunamadı</div>;
    }

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
                <h2>
                    Hesap Dökümü{" "}
                    <Button type="primary" className="mb-3" onClick={showModal}>
                        Ödeme Al
                    </Button>
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
                                initialValue={userData._id}
                            >
                                <Input type="hidden" />
                            </Form.Item>
                            <Form.Item
                                label="Ödeme Tutarı"
                                name="price"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Lütfen ödeme tutarını giriniz!",
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
                </h2>
                <h3>{userData.name + " - " + userData.company_name}</h3>
            </Row>
            <Row className="flex-nowrap overflow-auto">
                <Table
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                record.delivery_date &&
                                    navigate(`/admin/${record._id}`);
                            }, // click row
                        };
                    }}
                    /* pagination={{
                        position: ["topRight"],
                    }} */
                    columns={columns}
                    dataSource={data.map((item) => ({
                        ...item,
                        key: item._id,
                    }))}
                />
            </Row>
            <Row>
                <Alert
                    className="text-center"
                    key={balanceData.result > 0 ? "danger" : "success"}
                    variant={balanceData.result > 0 ? "danger" : "success"}
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
                    {balanceData.result > 0 && " borcu bulunmaktadır."}
                    {balanceData.result < 0 && " alacaklı."}
                    {balanceData.result === 0 && "Borcu bulunmamaktadır."}
                </Alert>
            </Row>
        </Container>
    );
}

export default UserAccount;

import { Container, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    acceptOrRejectOffer,
    deleteProductFromOrder,
    fetchOrder,
} from "../api";
import { format } from "number-currency-format-2";
import { useToast } from "../contexts/ToastContext";
import {
    Breadcrumb,
    Button,
    ConfigProvider,
    Descriptions,
    Space,
    Spin,
    Tooltip,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Title from "antd/es/typography/Title";

function Order() {
    const { order_id } = useParams();
    const { createToast } = useToast();
    const navigate = useNavigate();

    const { isLoading, isError, data, error } = useQuery(
        ["order", order_id],
        () => fetchOrder(order_id)
    );

    const queryClient = useQueryClient();

    queryClient.setDefaultOptions({
        queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    });

    const offerMutation = useMutation(acceptOrRejectOffer, {
        onSuccess: () => {
            //queryClient.invalidateQueries(["order", order_id]);
            queryClient.refetchQueries(["order", order_id]);
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

    const orderStatusMessage = (status) => {
        switch (status) {
            case 1:
                return "Teklif talebi gönderildi.";
            case 2:
                return "Teklif alındı.";
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

    if (isLoading) {
        return (
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: "red",
                        controlHeightLG: 200,
                    },
                }}
            >
                <Spin size="large">
                    <Container className="min-vh-100 d-flex justify-content-center align-items-center"></Container>
                </Spin>
            </ConfigProvider>
        );
    }

    const descriptionInfos = [
        {
            key: "1",
            label: "Alıcı Firma",
            children: data[0].client.name + " " + data[0].client.company_name,
        },
        {
            key: "2",
            label: "Sipariş Tarihi",
            children: moment(data[0].order_date).format("DD.MM.YYYY HH:mm"),
        },
        {
            key: "3",
            label: "Açıklama",
            children: data[0].description,
        },
        {
            key: "4",
            label: "Teslimat Tarihi",
            children:
                data[0].delivery_date &&
                moment(data[0].delivery_date).format("DD.MM.YYYY HH:mm"),
        },
        {
            key: "5",
            label: "Durum",
            children: orderStatusMessage(data[0].status),
        },
    ];

    if (isError) {
        return <div>Sipariş bulunamadı</div>;
    }

    return (
        <Container>
            <Row>
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <a onClick={() => navigate(`/`)}>Anasayfa</a>
                            ),
                        },
                        {
                            title: (
                                <a onClick={() => navigate(`/orders/`)}>
                                    Siparişler
                                </a>
                            ),
                        },
                        {
                            title: "Sipariş detay",
                        },
                    ]}
                />
            </Row>
            <Row className="mt-3">
                <Descriptions
                    title="Sipariş Bilgileri"
                    bordered
                    items={descriptionInfos}
                />
            </Row>
            <Row className="mt-4">
                <Space>
                    <Title level={5} strong>
                        Siparişler
                    </Title>
                </Space>
                <Table responsive hover style={{ minWidth: 900 }}>
                    <thead>
                        <tr>
                            <th style={{ minWidth: 250 }}>Ürün Adı</th>
                            <th className="col-lg-2">Adet</th>
                            <th className="col-lg-2">Fiyat</th>
                            <th className="col-lg-2">Tutar</th>
                            <th className="col-lg-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data[0].products.map(
                            (product, key) =>
                                product.piece > 0 && (
                                    <tr key={key}>
                                        <td>{product.name}</td>
                                        <td>{product.piece}</td>
                                        {data[0].status > 3 ||
                                        data[0].status === 2 ? (
                                            <>
                                                <td>
                                                    {format(product.price, {
                                                        currency: "₺",
                                                        decimalSeparator: ",",
                                                        thousandSeparator: ".",
                                                    })}
                                                </td>
                                                <td>
                                                    {format(
                                                        product.price *
                                                            product.piece,
                                                        {
                                                            currency: "₺",
                                                            decimalSeparator:
                                                                ",",
                                                            thousandSeparator:
                                                                ".",
                                                        }
                                                    )}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>Onay bekleniyor...</td>
                                                <td>Onay bekleniyor...</td>
                                            </>
                                        )}

                                        <td>
                                            {data[0].status > 0 &&
                                                data[0].status < 6 && (
                                                    <Tooltip title="Sil">
                                                        <Button
                                                            danger
                                                            type="primary"
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
                                                            icon={
                                                                <DeleteOutlined />
                                                            }
                                                        />
                                                    </Tooltip>
                                                )}
                                        </td>
                                    </tr>
                                )
                        )}
                        {(data[0].status > 3 || data[0].status === 2) && (
                            <tr>
                                <td></td>
                                <td></td>
                                <td>
                                    <b>Toplam tutar:</b>
                                </td>
                                <td>
                                    {format(data[0].total_price, {
                                        currency: "₺",
                                        decimalSeparator: ",",
                                        thousandSeparator: ".",
                                    })}
                                </td>
                                <td></td>
                            </tr>
                        )}
                    </tbody>
                </Table>
                {data[0].products.some((product) => product.return !== 0) && (
                    <>
                        <Space>
                            <Title level={5} strong>
                                İadeler
                            </Title>
                        </Space>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Ürün Adı</th>
                                    <th>Adet</th>
                                    <th>Fiyat</th>
                                    <th>Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data[0].products.map(
                                    (product, key) =>
                                        product.return > 0 && (
                                            <tr key={key}>
                                                <td>{product.name}</td>
                                                <td>{product.return}</td>
                                                <td>
                                                    {format(product.price, {
                                                        currency: "₺",
                                                        decimalSeparator: ",",
                                                        thousandSeparator: ".",
                                                    })}
                                                </td>
                                                <td>
                                                    {format(
                                                        product.price *
                                                            product.return,
                                                        {
                                                            currency: "₺",
                                                            decimalSeparator:
                                                                ",",
                                                            thousandSeparator:
                                                                ".",
                                                        }
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                )}
                            </tbody>
                        </Table>
                    </>
                )}
            </Row>
            {data[0].status === 2 && (
                <>
                    <Button
                        type="primary"
                        onClick={() =>
                            offerMutation.mutate({
                                status: data[0].status,
                                orderId: data[0]._id,
                            })
                        }
                    >
                        Teklifi Onayla
                    </Button>
                    <Button
                        danger
                        type="primary"
                        className="ms-3"
                        onClick={() =>
                            offerMutation.mutate({
                                status: 1,
                                orderId: data[0]._id,
                            })
                        }
                    >
                        Teklifi Reddet
                    </Button>
                </>
            )}
            {/* <Button onClick={console.log(data[0])}>Test</Button> */}
        </Container>
    );
}

export default Order;

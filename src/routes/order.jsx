import { Button, Container, Row, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    acceptOrRejectOffer,
    deleteProductFromOrder,
    fetchOrder,
} from "../api";
import { format } from "number-currency-format-2";
import { useToast } from "../contexts/ToastContext";
import { ConfigProvider, Descriptions, Spin } from "antd";

function Order() {
    const { order_id } = useParams();
    const { createToast } = useToast();

    const { isLoading, isError, data, error } = useQuery(
        ["order", order_id],
        () => fetchOrder(order_id)
    );

    const queryClient = useQueryClient();

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
            key: '1',
            label: 'Alıcı Firma',
            children: data[0].client.name + " " + data[0].client.company_name,
        },
        {
            key: '2',
            label: 'Sipariş Tarihi',
            children: moment(data[0].order_date).format(
                "DD.MM.YYYY HH:mm"
            ),
        },
        {
            key: '3',
            label: 'Açıklama',
            children: data[0].description,
        },
        {
            key: '4',
            label: 'Teslimat Tarihi',
            children: data[0].delivery_date && moment(data[0].delivery_date).format(
                "DD.MM.YYYY HH:mm"
            ),
        },
        {
            key: '5',
            label: 'Durum',
            children: orderStatusMessage(data[0].status),
        }
    ];

    

    if (isError) {
        return <div>Sipariş bulunamadı</div>;
    }

    return (
        <Container>
            <Row>
            <Descriptions title="Sipariş Bilgileri" bordered items={descriptionInfos} />
                {/* <Table striped responsive bordered>
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
                                    {moment(data[0].order_date).format(
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
                </Table> */}
            </Row>
            <Row>
                <p>
                    <b>Siparişler:</b>
                </p>
                <Table striped responsive bordered hover>
                    <thead>
                        <tr>
                            <th>Ürün Adı</th>
                            <th>Adet</th>
                            <th>Fiyat</th>
                            <th>Tutar</th>
                            <th></th>
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
                                                <td>
                                                    Onay bekleniyor...
                                                </td>
                                                <td>
                                                    Onay bekleniyor...
                                                </td>
                                            </>
                                        )}

                                        <td>
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
                                        </td>
                                    </tr>
                                )
                        )}
                        {(data[0].status > 3 || data[0].status === 2) && (
                            <tr>
                                <td></td>
                                <td></td>
                                <td><b>Toplam tutar:</b></td>
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
                        <p>
                            <b>İadeler:</b>
                        </p>
                        <Table striped responsive bordered hover>
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
                        variant="primary"
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
                        variant="danger"
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
        </Container>
    );
}

export default Order;

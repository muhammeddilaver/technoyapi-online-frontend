import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import { fetchOrder } from "../api";
import { format } from "number-currency-format-2";

function Order() {
    const { order_id } = useParams();

    const { isLoading, isError, data, error } = useQuery(
        ["order", order_id],
        () => fetchOrder(order_id)
    );

    if (isLoading) {
        return <div>Yükleniyor...</div>;
    }

    if (isError) {
        return <div>Sipariş bulunamadı</div>;
    }

    const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "YTL" })

    return (
        <Container className="">
            <Row>
                <p>
                    <b>Sipariş Tarihi: </b>
                    {moment(data[0].order_date).format("DD-MM-YYYY hh:mm")}
                </p>
                {data[0].delivery_date && (
                    <p>
                        <b>Teslimat Tarihi: </b>
                        {moment(data[0].order_date).format("DD-MM-YYYY hh:mm")}
                    </p>
                )}
                <p>
                    <b>Açıklama: </b>
                    {data[0].description}
                </p>
                <p>
                    <b>Durum: </b>
                    {data[0].status}
                </p>
            </Row>
            <Row>
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
                        {data[0].products.map((product, key) => (
                            <tr key={key}>
                                <td>{product.name}</td>
                                <td>{product.piece}</td>
                                <td>{format(product.price, { currency: '₺', decimalSeparator: ',', thousandSeparator: '.'})}</td>
                                <td>{format(product.price * product.piece, { currency: '₺', decimalSeparator: ',', thousandSeparator: '.'})}</td>
                                <td><Button variant="primary">İade iste</Button><Button variant="danger">Sil</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Row>
        </Container>
    );
}

export default Order;

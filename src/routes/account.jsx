import { Container, Row, Table } from "react-bootstrap";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import { fetchAccount, getBalance } from "../api";
import { format } from "number-currency-format-2";
import { useNavigate } from "react-router-dom";

function Account() {
    const navigate = useNavigate();
    const { isLoading, isError, data, error } = useQuery(["account"], () =>
        fetchAccount()
    );

    const { isLoading: balanceIsLoading, isError: balanceIsError, data: balanceData, error: balanceError } = useQuery(["balance"], () =>
        getBalance()
    );

    if (isLoading || balanceIsLoading) {
        return <div>Yükleniyor...</div>;
    }

    if (isError || balanceIsError) {
        return <div>Sipariş bulunamadı</div>;
    }

    const handleRowClick = (order) => {
        navigate(`/orders/${order._id}`);
    };

    return (
        <Container style={{ marginTop: 80 }}>
            <Row>
                <Table responsive bordered>
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>Açıklama</th>
                            <th>İşlem</th>
                            <th>Alacak</th>
                            <th>Borç</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, key) =>
                            row.delivery_date ? (
                                <tr key={key} style={{cursor: "pointer"}} onClick={() => handleRowClick(row)}>
                                    <td>
                                        {moment(row.delivery_date).format(
                                            "DD.MM.YYYY HH:mm"
                                        )}
                                    </td>
                                    <td>{row.description}</td>
                                    <td>Sipariş</td><td></td>
                                    <td>{format(row.total_price, {
                                            currency: "₺",
                                            decimalSeparator: ",",
                                            thousandSeparator: ".",
                                        })}</td>
                                </tr>
                            ) : (
                                <tr className="table-success" key={key}>
                                    <td>
                                        {moment(row.date).format(
                                            "DD.MM.YYYY HH:mm"
                                        )}
                                    </td>
                                    <td>{row.description}</td>
                                    <td>Ödeme</td>
                                    <td>
                                        {format(row.price, {
                                            currency: "₺",
                                            decimalSeparator: ",",
                                            thousandSeparator: ".",
                                        })}
                                    </td><td></td>
                                </tr>
                            )
                        )}
                        <tr><td></td></tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Kalan Toplam Borç</td>
                            <td>{format(balanceData.result, {
                                            currency: "₺",
                                            decimalSeparator: ",",
                                            thousandSeparator: ".",
                                        })}</td>
                        </tr>
                    </tbody>
                </Table>
            </Row>
        </Container>
    );
}

export default Account;

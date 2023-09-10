import { Alert, Container, Row } from "react-bootstrap";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import { fetchAccount, getBalance, userFetch } from "../../api";
import { format } from "number-currency-format-2";
import { useNavigate, useParams } from "react-router-dom";
import { Table } from "antd";

function UserAccount() {
    const navigate = useNavigate();

    const { user_id } = useParams();

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
    } = useQuery(["balance"], () => getBalance(user_id));

    if (isLoading || balanceIsLoading) {
        return <div>Yükleniyor...</div>;
    }

    if (isError || balanceIsError) {
        return <div>Sipariş bulunamadı</div>;
    }

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
                <h2>Hesap Dökümü</h2>
				<h3>{userData.name + " - " + userData.company_name}</h3>
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
                    {balanceData.result > 0 && " borcunuz bulunmaktadır."}
                    {balanceData.result < 0 && " alacaklısınız."}
                    {balanceData.result === 0 && "Borcunuz bulunmamaktadır."}
                </Alert>
            </Row>
        </Container>
    );
}

export default UserAccount;

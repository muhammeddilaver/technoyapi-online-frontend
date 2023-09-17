import { Alert, Container, Row } from "react-bootstrap";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import { fetchAccount, getBalance } from "../api";
import { format } from "number-currency-format-2";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, Space, Table } from "antd";
import Title from "antd/es/typography/Title";

function Account() {
    const navigate = useNavigate();

    const { isLoading, isError, data, error } = useQuery(["account"], () =>
        fetchAccount()
    );

    const {
        isLoading: balanceIsLoading,
        isError: balanceIsError,
        data: balanceData,
        error: balanceError,
    } = useQuery(["balance"], () => getBalance());

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
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <a onClick={() => navigate(`/`)}>Anasayfa</a>
                            ),
                        },
                        {
                            title: "Hesap Dökümü",
                        },
                    ]}
                />
            </Row>
            <Row className="mt-3">
                <Space>
                    <Title level={3} strong>
                        Hesap Dökümü
                    </Title>
                </Space>
                <Table
                    className="flex-nowrap overflow-auto"
                    loading={isLoading}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                record.delivery_date &&
                                    navigate(`/orders/${record._id}`);
                            }, // click row
                        };
                    }}
                    /* pagination={{
                        position: ["topRight"],
                    }} */
                    columns={columns}
                    dataSource={
                        !isLoading &&
                        data.map((item) => ({
                            ...item,
                            key: item._id,
                        }))
                    }
                />
                {!balanceIsLoading && (
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
                        {balanceData.result === 0 &&
                            "Borcunuz bulunmamaktadır."}
                    </Alert>
                )}
            </Row>
        </Container>
    );
}

export default Account;

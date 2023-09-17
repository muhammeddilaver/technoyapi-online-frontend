import { Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { format } from "number-currency-format-2";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrdersListAdmin } from "../../api";
import { useEffect } from "react";
import { Button, ConfigProvider, Space, Spin, Table } from "antd";
/* import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import tr from "date-fns/locale/tr";
registerLocale("tr", tr);
<DatePicker
    className="form-control"
    locale="tr"
    dateFormat="dd-MM-yyyy"
    selected={endDate}
    onChange={(date) => setEndDate(date)}
/>
 */
function AdminHome() {
    const { ref, inView } = useInView();

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    queryClient.setDefaultOptions({
        queries: {
            refetchOnMount: true,
            refetchOnWindowFocus: true,
        },
    });

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["orderListAdmin"],
        queryFn: fetchOrdersListAdmin,
        getNextPageParam: (lastGroup, allGroups) => {
            const morePageExist = lastGroup?.length === 12;

            if (!morePageExist) {
                return;
            }
            return allGroups.length + 1;
        },
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, inView, hasNextPage]);

    const columns = [
        {
            title: "Sipariş Tarihi",
            dataIndex: "order_date",
            key: "order_date",
            render: (text, record) => {
                return moment(record.order_date).format("DD.MM.YYYY HH:mm");
            },
        },
        {
            title: "Müşteri Adı",
            dataIndex: "company_name",
            key: "company_name",
            render: (text, record) => {
                return record.client.company_name;
            },
        },
        {
            title: "Durum",
            dataIndex: "status",
            key: "status",
            render: (text, record) => {
                return orderStatusMessage(record.status);
            },
        },
        {
            title: "Tutar",
            dataIndex: "total_price",
            key: "total_price",
            render: (text, record) => {
                return format(record.total_price, {
                    currency: "₺",
                    decimalSeparator: ",",
                    thousandSeparator: ".",
                });
            },
        },
        {
            title: "Açıklama",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Teslimat Tarihi",
            dataIndex: "delivery_date",
            key: "delivery_date",
            render: (text, record) => {
                return record.delivery_date
                    ? moment(record.delivery_date).format("DD.MM.YYYY HH:mm")
                    : "";
            },
        },
        {
            dataIndex: "button",
            key: "button",
            align: "right",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        danger
                        onClick={() => navigate(`/orders/${record._id}`)}
                    >
                        Sipariş Detay
                    </Button>
                </Space>
            ),
        },
    ];

    if (status === "error") return "Sipariş bulunamadı.";

    const orderStatusMessage = (status) => {
        switch (status) {
            case 1:
                return "Teklif talebi alındı.";
            case 2:
                return "Teklif verildi.";
            case 3:
                return "Sipariş alındı.";
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

    return (
        <>
            <Container style={{ marginTop: 80 }}>
                <Row>
                    <div className="d-flex justify-content-end mb-3">
                        <Space size="middle">
                            <Button
                                size="large"
                                danger
                                type="primary"
                                onClick={() => navigate(`/admin/new_order`)}
                            >
                                Yeni Sipariş
                            </Button>
                        </Space>
                    </div>
                </Row>
                <Row>
                    <Table
                        className="flex-nowrap overflow-auto"
                        loading={isFetching || isFetchingNextPage}
                        pagination={false}
                        columns={columns}
                        rowClassName={(record, index) => "data-row active-row"}
                        onRow={(record) => {
                            return {
                                onClick: () => {
                                    navigate(`/admin/${record._id}`);
                                }, // click row
                            };
                        }}
                        dataSource={
                            status !== "loading" &&
                            data.pages
                                .map((page) =>
                                    page.map((item) => ({
                                        ...item,
                                        key: item._id,
                                    }))
                                )
                                .flat()
                        }
                    />
                    <div>
                        <span
                            ref={ref}
                            onClick={() => fetchNextPage()}
                            disabled={!hasNextPage || isFetchingNextPage}
                            className="d-flex justify-content-center align-items-center"
                        >
                            <ConfigProvider
                                theme={{
                                    token: {
                                        colorPrimary: "red",
                                        controlHeightLG: 200,
                                    },
                                }}
                            >
                                <Spin
                                    spinning={isFetchingNextPage}
                                    size="large"
                                ></Spin>
                            </ConfigProvider>
                        </span>
                    </div>
                </Row>
            </Container>
        </>
    );
}

export default AdminHome;

import { useInView } from "react-intersection-observer";
import { fetchOrdersList } from "../api";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import { useLoaderData, useNavigate } from "react-router-dom";
import moment from "moment";
import { format } from "number-currency-format-2";
import { Breadcrumb, Button, ConfigProvider, Space, Spin, Table } from "antd";

const orderQuery = () => ({
    queryKey: ["orderList"],
    queryFn: fetchOrdersList,
});

export const loader = (queryClient) => async () => {
    const query = orderQuery();
    return (
        queryClient.getQueryData(query.queryKey) ??
        (await queryClient.fetchInfiniteQuery(query))
    );
};

function Orders() {
    const { ref, inView } = useInView();

    const navigate = useNavigate();

    const initialData = useLoaderData();

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
        ...orderQuery(initialData),
        initialData,
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
            title: "Ürün Adedi",
            dataIndex: "products_count",
            key: "products_count",
            render: (text, record) => {
                return record.products.length;
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
            title: "Durum",
            dataIndex: "status",
            key: "status",
            render: (text, record) => {
                return orderStatusMessage(record.status);
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
                            title: "Siparişler",
                        },
                    ]}
                />
            </Row>
            <Row className="mt-3">
                <Table
                    className="flex-nowrap overflow-auto"
                    loading={isFetching || isFetchingNextPage}
                    pagination={false}
                    columns={columns}
                    rowClassName={(record, index) => "data-row active-row"}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                navigate(`/orders/${record._id}`);
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
    );
}

export default Orders;

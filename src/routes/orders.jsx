import { useInView } from "react-intersection-observer";
import { fetchOrdersList } from "../api";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Container, Table } from "react-bootstrap";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import moment from "moment";
import { format } from "number-currency-format-2";

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
        if (inView) {
            fetchNextPage();
        }
    }, [fetchNextPage, inView]);

    if (status === "loading") return "yükleniyor...";

    if (status === "error") return "Sipariş bulunamadı.";

    const handleRowClick = (order) => {
        navigate(`/orders/${order._id}`);
    };

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
        <Container className="">
            <Table responsive bordered hover>
                <thead>
                    <tr>
                        <th>Sipariş Tarihi</th>
                        <th>Ürün Sayısı</th>
                        <th>Tutar</th>
                        <th>Açıklama</th>
                        <th>Teslimat Tarihi</th>
                        <th>Durum</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {data.pages.map((page, pageIndex) => (
                        <React.Fragment key={pageIndex}>
                            {page.map((order, orderIndex) => (
                                <tr
                                    onClick={() => handleRowClick(order)}
                                    className={
                                        order.status === 7
                                            ? "table-danger"
                                            : order.status === 6
                                            ? "table-success"
                                            : order.status === 1 ||
                                              order.status === 3
                                            ? "table-warning"
                                            : "table-info"
                                    }
                                    key={orderIndex}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td>
                                        {moment(order.order_date).format(
                                            "DD.MM.YYYY HH:mm"
                                        )}
                                    </td>
                                    <td>{order.products.length}</td>
                                    {order.status > 3 || order.status === 2 ? (
                                        <td>
                                            {format(order.total_price, {
                                                currency: "₺",
                                                decimalSeparator: ",",
                                                thousandSeparator: ".",
                                            })}
                                        </td>
                                    ) : (
                                        <td>Onay bekleniyor...</td>
                                    )}

                                    <td>{order.description}</td>
                                    <td>
                                        {order.delivery_date &&
                                            moment(order.delivery_date).format(
                                                "DD.MM.YYYY HH:mm"
                                            )}
                                    </td>
                                    <td>{orderStatusMessage(order.status)}</td>
                                    <td>
                                        <Link
                                            className="btn btn-primary"
                                            to={order._id}
                                        >
                                            <i className="fa fa-search"></i>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>
            <>
                <span
                    ref={ref}
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                    style={{ opacity: 0 }}
                >
                    asdasd
                </span>
            </>

            <>{isFetching && !isFetchingNextPage ? "" : null}</>
        </Container>
    );
}

export default Orders;

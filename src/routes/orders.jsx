import { useInView } from "react-intersection-observer";
import { fetchOrdersList } from "../api";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Col, Container, Table } from "react-bootstrap";
import { Link, useLoaderData } from "react-router-dom";
import moment from "moment";

const orderQuery = () => ({
    queryKey: ["orderList"],
    queryFn: fetchOrdersList,
});

export const loader =
    (queryClient) =>
    async () => {
        const query = orderQuery();
        return (
            queryClient.getQueryData(query.queryKey) ??
            (await queryClient.fetchInfiniteQuery(query))
        );
    };

function Orders() {
    const { ref, inView } = useInView();

    const initialData = useLoaderData();

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

    return (
        <Container className="">
            <Table striped responsive bordered hover>
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
                                <tr key={orderIndex} style={{cursor: "pointer"}}>
                                    <td>
                                        {moment(order.order_date).format(
                                            "DD.MM.YYYY hh:mm"
                                        )}
                                    </td>
                                    <td>{order.products.length}</td>
                                    <td>{order.total_price}</td>
                                    <td>{order.description}</td>
                                    <td>
                                        {order.delivery_date &&
                                            order.delivery_date}
                                    </td>
                                    <td>{order.status}</td>
                                    <td><Link className="btn btn-primary" to={order._id}><i className="fa fa-search"></i></Link></td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}

                    <div>
                        <span
                            ref={ref}
                            onClick={() => fetchNextPage()}
                            disabled={!hasNextPage || isFetchingNextPage}
                            style={{ opacity: 0 }}
                        >
                            asdasd
                        </span>
                    </div>

                    <div>
                        {isFetching && !isFetchingNextPage
                            ? "Yükleniyor"
                            : null}
                    </div>
                </tbody>
            </Table>
        </Container>
    );
}

export default Orders;

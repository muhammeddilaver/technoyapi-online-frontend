import { Button, Container, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { format } from "number-currency-format-2";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrdersListAdmin } from "../../api";
import React, { useEffect } from "react";
import { ConfigProvider, Spin } from "antd";
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
        if (inView) {
            fetchNextPage();
        }
    }, [fetchNextPage, inView]);

    if (status === "loading") return (
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

    if (status === "error") return "Sipariş bulunamadı.";

    const handleRowClick = (order) => {
        navigate(`/admin/${order._id}`);
    };

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
                <div className="d-flex justify-content-end mb-3">
                    <Link to="/admin/new_order">
                        <Button>Yeni Sipariş</Button>
                    </Link>
                </div>

                <Table responsive bordered>
                    <thead>
                        <tr>
                            <th>Müşteri adı</th>
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
                                        <td>{order.client.company_name}</td>
                                        <td>
                                            {moment(order.order_date).format(
                                                "DD.MM.YYYY HH:mm"
                                            )}
                                        </td>
                                        <td>{order.products.length}</td>
                                        <td>
                                            {format(order.total_price, {
                                                currency: "₺",
                                                decimalSeparator: ",",
                                                thousandSeparator: ".",
                                            })}
                                        </td>
                                        <td>{order.description}</td>
                                        <td>
                                            {order.delivery_date &&
                                                moment(
                                                    order.delivery_date
                                                ).format("DD.MM.YYYY HH:mm")}
                                        </td>
                                        <td>
                                            {orderStatusMessage(order.status)}
                                        </td>
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
        </>
    );
}

export default AdminHome;

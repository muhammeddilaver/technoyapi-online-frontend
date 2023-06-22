import { Container, Table } from "react-bootstrap";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { format } from "number-currency-format-2";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchOrdersListAdmin } from "../../api";
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
    
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["orderList"],
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

    if (status === "loading") return "yükleniyor...";

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

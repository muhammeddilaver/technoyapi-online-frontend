import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Container } from "react-bootstrap";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { fetchSearchList } from "../../../api";
import ProductRequest from "../../ProductRequest";
import { Button, ConfigProvider, Spin, Table } from "antd";
import { useBasket } from "../../../contexts/BasketContext";

function SearchList({ keyword, setkeyword }) {
    const { ref, inView } = useInView();
    const queryClient = useQueryClient();

    const { addToBasket, isInBasket } = useBasket();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["productList", keyword],
        queryFn: fetchSearchList,
        getNextPageParam: (lastGroup, allGroups) => {
            const morePageExist = lastGroup?.length === 12;

            if (!morePageExist) {
                return;
            }
            return allGroups.length + 1;
        },
        retry: false,
        onError: (error) => {
            if (error.statusCode === 404) {
                queryClient.setQueryData("productList", keyword, []);
            }
        },
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, inView, hasNextPage]);

    const columns = [
        {
            title: "Ürün adı",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "",
            dataIndex: "button",
            key: "button",
            align: "right",
            render: (text, record) => (
                <Button
                    danger={true}
                    type={isInBasket(record) ? "primary" : "default"}
                    onClick={() => addToBasket(record, 1)}
                >
                    {!isInBasket(record) ? "Sepete Ekle" : "Sepete Eklendi"}
                </Button>
            ),
        },
    ];

    if (status === "loading")
        return (
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

    if (status === "error")
        return <ProductRequest keyword={keyword} setkeyword={setkeyword} />;

    return (
        <>
            <Table
                loading={isFetching || isFetchingNextPage}
                pagination={false}
                columns={columns}
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
                        <Spin spinning={isFetchingNextPage} size="large"></Spin>
                    </ConfigProvider>
                </span>
            </div>
        </>
    );
}

export default SearchList;

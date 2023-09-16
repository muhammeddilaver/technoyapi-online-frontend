import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Container, ListGroup } from "react-bootstrap";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { fetchSearchList } from "../../../api";

import ProductCard from "../../ProductCard";
import ProductRequest from "../../ProductRequest";
import { ConfigProvider, Spin } from "antd";

function SearchList({ keyword, setkeyword }) {
    const { ref, inView } = useInView();
    const queryClient = useQueryClient();

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
        if (inView) {
            fetchNextPage();
        }
    }, [fetchNextPage, inView]);

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
        <ListGroup as="ol">
            {data.pages.map((group, i) => (
                <React.Fragment key={i}>
                    {group.map((product, key) => (
                        <ProductCard key={key} item={product} />
                    ))}
                </React.Fragment>
            ))}
            <div>
                <span
                    ref={ref}
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                    style={{ margin: "auto" }}
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
        </ListGroup>
    );
}

export default SearchList;

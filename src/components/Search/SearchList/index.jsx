import { useInfiniteQuery } from "@tanstack/react-query";
import { Container } from "react-bootstrap";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { fetchSearchList } from "../../../api";

import ProductCard from "../../ProductCard";

function SearchList({ keyword }) {
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
        queryKey: ["productList", keyword],
        queryFn: fetchSearchList,
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

    if (status === "error") return "Ürün bulunamadı.";

    return (
        <Container className="justify-content-left d-xl-flex">
            <div className="card-deck mb-3 text-center">
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
                    style={{ opacity: 0 }}
                >
                    asdasd
                </span>
            </div>
            </div>
        </Container>
    );
}

export default SearchList;

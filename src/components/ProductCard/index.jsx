import { Badge, Button, Card, Image, ListGroup } from "react-bootstrap";
import PropTypes from "prop-types";
import "./style.css";
import { useState } from "react";
import { useBasket } from "../../contexts/BasketContext";
import { format } from "number-currency-format-2";

function ProductCard({ item }) {
    const { addToBasket, isInBasket } = useBasket();

    const Add = () => {
        addToBasket(item, 1);
    };

    return (
        <ListGroup.Item
            as="li"
            className="d-flex justify-content-between align-items-start"
        >
            <div className="ms-2 me-auto">
                <div className="fw-bold">{item.name}</div>
                {item.brand}
            </div>
            <Button
                    className="mt-auto"
                    onClick={Add}
                    variant={!isInBasket(item) ? "danger" : "success"}
                >
                    {!isInBasket(item) ? "Sepete Ekle" : "Sepete Eklendi"}{" "}
                </Button>
        </ListGroup.Item>
    );
}
{/* <Card className="card mt-3 col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12">
            <div className="image-md">
                <Image
                    className="img-responsive"
                    src="https://picsum.photos/200/300"
                />
            </div>
            <div className="text card-body d-flex flex-column">
                <h6>{item.brand}</h6>
                <h5>{item.name}</h5>

                <div className="price mt-auto">

                </div>
                <Button
                    className="mt-auto"
                    onClick={Add}
                    variant={!isInBasket(item) ? "danger" : "success"}
                >
                    {!isInBasket(item) ? "Sepete Ekle" : "Sepete Eklendi"}{" "}
                </Button>
            </div>
        </Card> */}
ProductCard.propTypes = {
    item: PropTypes.shape({
        name: PropTypes.string.isRequired,
        /* description: PropTypes.string.isRequired, */
        brand: PropTypes.string.isRequired,
        /* price: PropTypes.number.isRequired, */
    }).isRequired,
};

export default ProductCard;

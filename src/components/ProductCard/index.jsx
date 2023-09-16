import { Button, ListGroup } from "react-bootstrap";
import PropTypes from "prop-types";
import "./style.css";
import { useBasket } from "../../contexts/BasketContext";

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
ProductCard.propTypes = {
    item: PropTypes.shape({
        name: PropTypes.string.isRequired,
        /* description: PropTypes.string.isRequired, */
        brand: PropTypes.string.isRequired,
        /* price: PropTypes.number.isRequired, */
    }).isRequired,
};

export default ProductCard;

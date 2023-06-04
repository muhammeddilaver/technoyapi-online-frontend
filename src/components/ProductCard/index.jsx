import { Button, Card, Col, Image } from "react-bootstrap";
import PropTypes from "prop-types";
import "./style.css";
import { useState } from "react";
import { useBasket } from "../../contexts/BasketContext";

function ProductCard({ item }) {
    const [piece, setpiece] = useState(1);
    const { addToBasket, isInBasket } = useBasket();

    const Add = () => {
        addToBasket(item, piece);
    };

    const UpBag = () => {
        setpiece(piece + 1);
    };

    const DecBag = () => {
        if (piece >= 1) {
            setpiece(piece - 1);
        }
    };

    return (
        <Card className="card mt-3 col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12">
            <div className="image-md">
                <Image
                    className="img-responsive"
                    src="https://picsum.photos/200/300"
                />
            </div>
            <div className="text card-body d-flex flex-column">
                <h6>{item.brand}</h6>
                <h5>{item.name}</h5>
                <div className="description">
                    <p>{item.description}</p>
                </div>
                <div className="price mt-auto">
                    <h5>{item.price} ₺</h5>
                    <div className="qty">
                        <i onClick={DecBag} className="fa fa-minus"></i>
                        <p>{piece}</p>
                        <i onClick={UpBag} className="fa fa-plus"></i>
                    </div>
                </div>
                <Button
                    className="mt-auto"
                    onClick={Add}
                    variant={!isInBasket(item) ? "danger" : "success"}
                >
                    {!isInBasket(item) ? "Sepete Ekle" : "Sepete Eklendi"}{" "}
                </Button>
            </div>
        </Card>
    );
}

ProductCard.propTypes = {
    item: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        brand: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
    }).isRequired,
};

export default ProductCard;

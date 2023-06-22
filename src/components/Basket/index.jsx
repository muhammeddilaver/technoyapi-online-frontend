import { useState } from "react";
import { Button, CloseButton, Form, Table } from "react-bootstrap";
import { useBasket } from "../../contexts/BasketContext";
import { useToast } from "../../contexts/ToastContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "../../api";

function BasketNavbar({ handleClose }) {
    const { setitems, items, delFromBasket, changePieceFromBasket } =
        useBasket();
    const { createToast } = useToast();

    /* const [totalPrice, settotalPrice] = useState(0); */
    const [description, setdescription] = useState("");

    const queryClient = useQueryClient();

    const createOrderMutation = useMutation(createOrder, {
        onSuccess: () => {
            //queryClient.invalidateQueries("orderList");
            queryClient.refetchQueries("orderList");
            handleClose();
            setitems([]);
            createToast({
                title: "Bilgi",
                text: "Siparişiniz oluşturuldu. Siparişler bölümünden takip edebilirsiniz.",
            });
        },
    });
    
    /* useEffect(() => {
        settotalPrice(0);
        items.map((item) => {
            settotalPrice(
                (prevTotalPrice) => prevTotalPrice + item.price * item.piece
            );
        });
    }, [items]); */

    return (
        <>
            <Table striped bordered hover size="sm" responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Ürün adı</th>
                        <th>Adet</th>
                        {/* <th>Fiyat</th> */}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, key) => (
                        <tr key={key}>
                            <td>{key + 1}</td>
                            <td className="text-nowrap">{item.name}</td>
                            <td>
                                <div className="qty" style={{ height: 20 }}>
                                    <i
                                        onClick={() =>
                                            changePieceFromBasket(
                                                item._id,
                                                "down",
                                                item.piece
                                            )
                                        }
                                        className="fa fa-minus"
                                    ></i>
                                    <p style={{ fontSize: 19 }}>{item.piece}</p>
                                    <i
                                        onClick={() =>
                                            changePieceFromBasket(
                                                item._id,
                                                "up",
                                                item.piece
                                            )
                                        }
                                        className="fa fa-plus"
                                    ></i>
                                </div>
                            </td>
                            {/* <td className="text-nowrap">
                                {format(item.price, {
                                    currency: "₺",
                                    decimalSeparator: ",",
                                    thousandSeparator: ".",
                                })}
                            </td> */}
                            <td>
                                <CloseButton
                                    onClick={() => delFromBasket(item.name)}
                                />
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td></td>
                        <td></td>
                        {/* <td>Toplam tutar:</td>
                        <td className="text-nowrap">
                            {format(totalPrice, {
                                currency: "₺",
                                decimalSeparator: ",",
                                thousandSeparator: ".",
                            })}
                        </td> */}
                    </tr>
                </tbody>
            </Table>
            <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
            >
                <Form.Label>
                    Siparişinizle ilgili açıklama (isteğe bağlı):
                </Form.Label>
                <Form.Control
                    as="textarea"
                    onChange={(e) => setdescription(e.target.value)}
                    rows={3}
                />
            </Form.Group>
            <Button
                onClick={() => createOrderMutation.mutate({items: items, description: description+" ", status: 3})}
                variant="primary"
            >
                Sipariş oluştur
            </Button>
            <Button
                className="ms-3"
                onClick={() => createOrderMutation.mutate({items: items, description: description+" ", status: 1})}
                variant="danger"
            >
                Teklif İste
            </Button>
            <Button onClick={() => console.log(items)}>Test</Button>
        </>
    );
}

export default BasketNavbar;

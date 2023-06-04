import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

function SearchForm() {
    const [keyword, setkeyword] = useState(" ");

    const handleSearch = (event) => {
        event.preventDefault();
        const newKeyword = event.target.value;
        setkeyword(newKeyword);
    };

    return (
        <InputGroup className="mb-3">
                <Form.Control
                    value={keyword}
                    onChange={handleSearch}
                    placeholder="Aradığınız ürünü giriniz."
                    aria-label="Aradığınız ürünü giriniz."
                    aria-describedby="basic-addon2"
                />
                <Button variant="outline-danger" id="button-addon2">
                    <i className="fa fa-search"></i> Ara
                </Button>
            </InputGroup>
    );
}

export default SearchForm;

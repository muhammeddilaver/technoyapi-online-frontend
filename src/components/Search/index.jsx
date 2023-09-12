import { useState } from "react";
import { Button, Form, InputGroup, Row } from "react-bootstrap";
import SearchList from "./SearchList";

function Search() {
    const [keyword, setkeyword] = useState("");

    const handleSearch = (event) => {
        event.preventDefault();
        const newKeyword = event.target.value;
        setkeyword(newKeyword);
    };

    return (
        <>
            <Row>
                <InputGroup className="mb-3" style={{paddingLeft:0}}>
                    <Form.Control 
                        type="search"
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
            </Row>
            <Row>
                <SearchList keyword={keyword} setkeyword={setkeyword} />
            </Row>
        </>
    );
}

export default Search;

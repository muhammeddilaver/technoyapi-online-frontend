import { useState } from "react";
import {
    Container,
    Form,
    InputGroup,
    Button as ButtonBootstrap,
} from "react-bootstrap";
import UserList from "../../components/Admin/Users/UserList";
import { Button, Input, Modal, Form as AntForm } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../../api";
import { useToast } from "../../contexts/ToastContext";

function Users() {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [userKeyword, setuserKeyword] = useState("");
    const [form] = AntForm.useForm();
    const queryClient = useQueryClient();
    const { createToast } = useToast();

    const addUserMutation = useMutation(createUser, {
        onSuccess: (val) => {
            console.log(val);
            queryClient.invalidateQueries(["users"]);
            queryClient.refetchQueries(["users"]);
            form.resetFields();
            setOpen(false);
            setConfirmLoading(false);
            createToast({
                title: "Bilgi",
                text: "Müşteri sisteme eklendi.",
            });
        },
        onError: (err) => {
            console.log(err);
            setConfirmLoading(false);
        }
    });

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        setConfirmLoading(true);
        form.validateFields()
            .then((values) => {
                console.log("Validate Failed:", values);
                addUserMutation.mutate(values);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
                setConfirmLoading(false);
            });
    };
    const handleCancel = () => {
        setOpen(false);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const newKeyword = event.target.value;
        setuserKeyword(newKeyword);
    };

    return (
        <Container style={{ marginTop: 80 }}>
            <InputGroup className="mb-3">
                <Form.Control
                    type="search"
                    value={userKeyword}
                    onChange={handleSearch}
                    placeholder="Aradığınız ürünü giriniz."
                    aria-label="Aradığınız ürünü giriniz."
                    aria-describedby="basic-addon2"
                />
                <ButtonBootstrap variant="outline-danger" id="button-addon2">
                    <i className="fa fa-search"></i> Ara
                </ButtonBootstrap>
            </InputGroup>
            <Button type="primary" onClick={showModal}>
                Yeni Müşteri
            </Button>
            <Modal
                title="Yeni Müşteri"
                open={open}
                onOk={handleOk}
                okText="Ekle"
                cancelText="İptal"
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                <AntForm
                    name="basic"
                    form={form}
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    style={{
                        maxWidth: 600,
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    autoComplete="off"
                >
                    <AntForm.Item
                        label="Müşteri Adı"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: "Lütfen müşteri adını giriniz!",
                            },
                        ]}
                    >
                        <Input />
                    </AntForm.Item>

                    <AntForm.Item
                        label="İşletme Adı"
                        name="company_name"
                        rules={[
                            {
                                required: true,
                                message: "Lütfen işletme adını giriniz!",
                            },
                        ]}
                    >
                        <Input />
                    </AntForm.Item>

                    <AntForm.Item
                        label="Telefon"
                        name="phone"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Lütfen müşterinin telefon numarasını giriniz!",
                            },
                            {
                                type: "phone",
                            },
                        ]}
                    >
                        <Input />
                    </AntForm.Item>

                    <AntForm.Item
                        label="E-mail"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Lütfen müşterinin e-mailini giriniz!",
                            },
                            {
                                type: "email",
                                message: "Geçerli bir email giriniz.",
                            },
                        ]}
                    >
                        <Input />
                    </AntForm.Item>

                    <AntForm.Item
                        label="Adres"
                        name="address"
                        rules={[
                            {
                                message: "Lütfen müşterinin adresini giriniz!",
                            },
                        ]}
                    >
                        <Input />
                    </AntForm.Item>

                    <AntForm.Item
                        label="Vergi/TC No"
                        name="vno"
                        rules={[
                            {
                                message:
                                    "Lütfen müşterinin vergi numarasını giriniz!",
                            },
                            {
                                type: "number",
                                message: "Vergi numarası sadece sayılardan oluşabilir."
                            }
                        ]}
                    >
                        <Input />
                    </AntForm.Item>

                    <AntForm.Item
                        label="Şifre"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Lütfne müşteri için bir şifre belirleyiniz!",
                            },
                            {
                                min: 6,
                                message:
                                    "En az 6 karakterli şifre belirleyiniz!",
                            },
                        ]}
                    >
                        <Input.Password />
                    </AntForm.Item>
                </AntForm>
            </Modal>
            <UserList userKeyword={userKeyword} />
        </Container>
    );
}

export default Users;
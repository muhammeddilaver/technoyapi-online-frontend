import { fetchSearchUsersAdmin } from "../../../../api";
import { useQuery } from "@tanstack/react-query";
import { Space, Table } from "antd";
import { useNavigate } from "react-router-dom";

function UserList({ userKeyword }) {
    const navigate = useNavigate();

    const { data, status, loading } = useQuery(["users", userKeyword], () =>
        fetchSearchUsersAdmin(userKeyword)
    );

    const columns = [
        {
            title: "Kullanıcı",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Firma",
            dataIndex: "company_name",
            key: "company_name",
        },
        {
            title: "Telefon",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "e-mail",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <a
                        onClick={() =>
                            navigate(`/admin/user/${record._id}/account`)
                        }
                    >
                        Hesap Dökümü
                    </a>
                    <a>Kullanıcıyı Düzenle</a>
                </Space>
            ),
        },
    ];

    return (
        <Table
            loading={status === "loading"}
            style={{ marginTop: "10px" }}
            /* onRow={(record) => {
                        return {
                            onClick: () => {
                                record.delivery_date &&
                                    navigate(`/orders/${record._id}`);
                            }, // click row
                        };
                    }} */
            /* pagination={{
                        position: ["topRight"],
                    }} */
            columns={columns}
            dataSource={
                status !== "loading" &&
                status !== "error" &&
                data.map((item) => ({
                    ...item,
                    key: item._id,
                }))
            }
        />
    );
}

export default UserList;

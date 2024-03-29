import { fetchSearchUsersAdmin } from "../../../../api";
import { useQuery } from "@tanstack/react-query";
import { Space, Table } from "antd";
import { useNavigate } from "react-router-dom";

function UserList({ userKeyword }) {
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery(
        ["users", userKeyword],
        () => fetchSearchUsersAdmin(userKeyword),
        {
            retry: false,
        }
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
                </Space>
            ),
        },
    ];

    return (
        <Table
            loading={isLoading}
            style={{ marginTop: "10px" }}
            onRow={(record) => {
                return {
                    onClick: () => {
                        navigate(`/admin/user/${record._id}/account`);
                    }, // click row
                };
            }}
            pagination={false}
            columns={columns}
            dataSource={
                !isLoading &&
                !error &&
                data.map((item) => ({
                    ...item,
                    key: item._id,
                }))
            }
        />
    );
}

export default UserList;

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";

import ErrorPage from "./error-page.jsx";

import Root from "./routes/root.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import LoginForm from "./components/Login/index.jsx";
import Search from "./components/Search/index.jsx";
import { BasketProvider } from "./contexts/BasketContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import Orders, { loader as orderLoader } from "./routes/orders.jsx";
import PrivateRoutes from "./utils/PrivateRoute.jsx";
import Order from "./routes/order.jsx";
import AdminHome from "./routes/admin/home.jsx";
import AdminRoutes from "./utils/AdminRoutes.jsx";
import OrderAdmin from "./routes/admin/order.jsx";
import Account from "./routes/account.jsx";
import NewOrder from "./routes/admin/neworder.jsx";
import Users from "./routes/admin/users.jsx";
import UserAccount from "./routes/admin/userAccount.jsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount:true,
            refetchOnWindowFocus: false,
        }
    }
});

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                errorElement: <ErrorPage />,
                element: <PrivateRoutes />,
                children: [
                    {
                        path: "/",
                        element: <Search />,
                    },
                    {
                        path: "/orders",
                        loader: orderLoader(queryClient),
                        element: <Orders />,
                    },
                    {
                        path: "/orders/:order_id",
                        element: <Order />
                    },
                    {
                        path: "/account/",
                        element: <Account />
                    }
                ],
            },
            
        ],
    },
    {
        path: "/login",
        element: <LoginForm />,
    },
    {
        errorElement: <ErrorPage />,
        element: <AdminRoutes />,
        children: [
            {
                path: "/admin",
                element: <AdminHome />,
            },
            {
                path: "/admin/users",
                element: <Users />,
            },
            {
                path: "/admin/:order_id",
                element: <OrderAdmin />,
            },
            {
                path: "/admin/new_order",
                element: <NewOrder />,
            },
            {
                path: "/admin/user/:user_id/account",
                element: <UserAccount />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ToastProvider>
                    <BasketProvider>
                        <RouterProvider router={router} />
                    </BasketProvider>
                </ToastProvider>
            </AuthProvider>
        </QueryClientProvider>
    </React.StrictMode>
);

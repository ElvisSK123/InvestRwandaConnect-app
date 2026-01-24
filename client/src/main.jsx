import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout from './Layout'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

// Placeholder for Pages imports - we need to verify paths after move
// We'll dynamically import or setup a basic router for now
import Home from './Pages/Home';
import Dashboard from './Pages/Dashboard';
import Marketplace from './Pages/Marketplace';
import InvestmentGoals from './Pages/InvestmentGoals';
import ListOpportunity from './Pages/ListOpportunity';
import ListingDetails from './Pages/ListingDetails';
import KYCVerification from './Pages/KYCVerification';
import Portfolio from './Pages/Portfolio';
import ProfileSettings from './Pages/ProfileSettings';
import MyFavorites from './Pages/MyFavorites';
import Login from './Pages/Login';
import Register from './Pages/Register';
import AdminDashboard from './Pages/AdminDashboard';
import AdminPortal from './Pages/AdminPortal';
import { Toaster } from "@/Components/ui/sonner";

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout currentPageName="Home"><Home /></Layout>,
    },
    {
        path: "/dashboard",
        element: <Layout currentPageName="Dashboard"><Dashboard /></Layout>
    },
    {
        path: "/marketplace",
        element: <Layout currentPageName="Marketplace"><Marketplace /></Layout>
    },
    {
        path: "/investment-goals",
        element: <Layout currentPageName="InvestmentGoals"><InvestmentGoals /></Layout>
    },
    {
        path: "/list-opportunity",
        element: <Layout currentPageName="ListOpportunity"><ListOpportunity /></Layout>
    },
    {
        path: "/listing-details",
        element: <Layout currentPageName="ListingDetails"><ListingDetails /></Layout>
    },
    {
        path: "/kyc-verification",
        element: <Layout currentPageName="KYCVerification"><KYCVerification /></Layout>
    },
    {
        path: "/portfolio",
        element: <Layout currentPageName="Portfolio"><Portfolio /></Layout>
    },
    {
        path: "/profile-settings",
        element: <Layout currentPageName="ProfileSettings"><ProfileSettings /></Layout>
    },
    {
        path: "/my-favorites",
        element: <Layout currentPageName="MyFavorites"><MyFavorites /></Layout>
    },
    {
        path: "/auth/login",
        element: <Login />
    },
    {
        path: "/auth/register",
        element: <Register />
    },
    {
        path: "/admin/dashboard",
        element: <Layout currentPageName="AdminDashboard"><AdminDashboard /></Layout>
    },
    {
        path: "/admin/portal",
        element: <Layout currentPageName="AdminPortal"><AdminPortal /></Layout>
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster />
        </QueryClientProvider>
    </React.StrictMode>,
)

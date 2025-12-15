// src/routes/index.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

import AdminDashboard from "../pages/AdminDashboard";
import AdminTickets from "../pages/AdminTickets";
import AdminActivity from "../pages/AdminActivity";
import AdminDetailTicket from "../pages/AdminDetailTicket";

import UserDashboard from "../pages/UserDashboard";
import UserTickets from "../pages/UserTickets";
import UserTicketDetail from "../pages/UserTicketDetail";
import UserCreateTicket from "../pages/UserCreateTickets";
import UserProfile from "../pages/UserProfile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* App = layout utama (Navbar + Outlet + Footer) */}
        <Route element={<App />}>
          {/* HOME */}
          <Route index element={<Home />} />
          {/* atau kalau mau eksplisit:
              <Route path="/" element={<Home />} /> 
              tapi jangan dua-duanya sekaligus
          */}

          {/* AUTH */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* ADMIN */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/tickets" element={<AdminTickets />} />
          <Route path="admin/tickets/:id" element={<AdminDetailTicket />} />
          <Route path="admin/activity" element={<AdminActivity />} />

          {/* USER */}
          <Route path="user" element={<UserDashboard />} />
          <Route path="user/tickets" element={<UserTickets />} />
          <Route path="user/tickets/create" element={<UserCreateTicket />} />
          <Route path="user/tickets/:id" element={<UserTicketDetail />} />
          <Route path="user/profile" element={<UserProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

import ForgotPassword from "../pages/ForgotPassword"; 
import ResetPassword from "../pages/ResetPassword";

import AdminDashboard from "../pages/AdminDashboard";
import AdminTickets from "../pages/AdminTickets";
import AdminActivity from "../pages/AdminActivity";
import AdminDetailTicket from "../pages/AdminDetailTicket";

import UserDashboard from "../pages/UserDashboard";
import UserTickets from "../pages/UserTickets";
import UserTicketDetail from "../pages/UserTicketDetail";

import UserCreateTicket from "../pages/UserCreateTickets";
import UserProfile from "../pages/UserProfile";
import UserFAQ from "../pages/UserFAQ";
import UserServiceHours from "../pages/UserServicesHours";
import UserHowItWorks from "../pages/UserHowItWorks";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Home />} />

          {/* AUTH */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* FORGOT / RESET */}
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

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
          <Route path="user/faq" element={<UserFAQ />} />
          <Route path="user/service-hours" element={<UserServiceHours />} />
          <Route path="user/how-it-works" element={<UserHowItWorks />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

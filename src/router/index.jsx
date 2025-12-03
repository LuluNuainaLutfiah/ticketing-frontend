import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/AdminDashboard";
import UserDashboard from "../pages/UserDashboard";
import UserTicketDetail from "../pages/UserTicketDetail"; 
import AdminTickets from "../pages/AdminTickets";
import AdminActivity from "../pages/AdminActivity";
import UserTickets from "../pages/UserTickets";
import UserCreateTicket from "../pages/UserCreateTickets";
import UserProfile from "../pages/UserProfile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/user/tickets/:id" element={<UserTicketDetail />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/activity" element={<AdminActivity />} />
          <Route path="/user/tickets" element={<UserTickets />} />
          <Route path="/user/tickets/create" element={<UserCreateTicket />} />
          <Route path="/user/profile" element={<UserProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

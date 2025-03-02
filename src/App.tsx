// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          {/* Add other routes as needed */}
          <Route path="/analytics" element={<div>Analytics Page</div>} />
          <Route path="/users" element={<div>Users Page</div>} />
          <Route path="/reports" element={<div>Reports Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="/help" element={<div>Help Page</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

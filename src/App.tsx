// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { ClientsPage } from "./pages/ClientsPage";
import { EntrepriseDetailsPage } from "./pages/EntrepriseDetailsPage";

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<EntrepriseDetailsPage />} />
          <Route
            path="/personnel"
            element={<div>Liste du personnel des clients</div>}
          />
          <Route
            path="/documents"
            element={<div>Liste des types de documents</div>}
          />
          <Route
            path="/dimona"
            element={<div>Toutes les demandes de DIMONA</div>}
          />
          <Route path="/settings" element={<div>Paramètres</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

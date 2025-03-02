// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { EntreprisePage } from "./pages/EntreprisePage.tsx";
import { EntrepriseDetailsPage } from "./pages/EntrepriseDetailsPage";
import { PersonnelDetailsPage } from "./pages/PersonnelDetailsPage";
import { PersonnelPage } from "./pages/PersonnelPage.tsx";
import { DimonaPage } from "./pages/DimonaPage.tsx";

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clients" element={<EntreprisePage />} />
          <Route path="/clients/:id" element={<EntrepriseDetailsPage />} />
          <Route path="/personnel" element={<PersonnelPage />} />
          <Route path="/personnel/:id" element={<PersonnelDetailsPage />} />
          <Route
            path="/documents"
            element={<div>Liste des types de documents</div>}
          />
          <Route path="/dimona" element={<DimonaPage />} />
          <Route path="/settings" element={<div>Paramètres</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

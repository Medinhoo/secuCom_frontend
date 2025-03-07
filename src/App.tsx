// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
  Navigate,
} from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { EntreprisePage } from "./pages/EntreprisePage.tsx";
import { EntrepriseDetailsPage } from "./pages/EntrepriseDetailsPage";
import { PersonnelDetailsPage } from "./pages/PersonnelDetailsPage";
import { PersonnelPage } from "./pages/PersonnelPage.tsx";
import { DimonaPage } from "./pages/DimonaPage.tsx";
import { DocumentsPage } from "./pages/DocumentsPage.tsx";
import { DocumentsListPage } from "./pages/DocumentsListPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";

function App() {
  return (
    <BrowserRouter>
      {/* <AuthProvider> */}
      <Routes>
        {/* Routes publiques - en dehors du MainLayout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes protégées - avec MainLayout */}
        {/* <Route element={<ProtectedRoute />}> */}
        <Route element={<MainLayout children={undefined} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dimona" element={<DimonaPage />} />
          <Route path="/documents" element={<DocumentsListPage />} />
          <Route path="/documents/:id" element={<DocumentsPage />} />
          <Route path="/entreprise" element={<EntreprisePage />} />
          <Route path="/entreprise/:id" element={<EntrepriseDetailsPage />} />
          <Route path="/personnel" element={<PersonnelPage />} />
          <Route path="/personnel/:id" element={<PersonnelDetailsPage />} />

          {/* Routes protégées par rôle spécifique */}
          {/* <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route> */}
        </Route>
        {/* </Route> */}

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      {/* </AuthProvider> */}
    </BrowserRouter>
  );
}

export default App;

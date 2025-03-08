// src/App.tsx
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
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
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />

          {/* Routes protégées avec MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dimona" element={<DimonaPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/documents/:id" element={<DocumentsListPage />} />
              <Route path="/entreprises" element={<EntreprisePage />} />
              <Route
                path="/entreprises/:id"
                element={<EntrepriseDetailsPage />}
              />
              <Route path="/personnel" element={<PersonnelPage />} />
              <Route path="/personnel/:id" element={<PersonnelDetailsPage />} />

              {/* Routes avec rôle spécifique */}
              <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "./config/routes.config";
import { MainLayout } from "./components/layout/MainLayout";
import { CompanyPage } from "./pages/CompanyPage.tsx";
import { CompanyDetailsPage } from "./pages/CompanyDetailsPage";
import { CreateCompanyPage } from "./pages/CreateCompanyPage";
import { CollaboratorDetailsPage } from "./pages/CollaboratorDetailsPage";
import { CollaboratorPage } from "./pages/CollaboratorPage.tsx";
import { CreateCollaboratorPage } from "./pages/CreateCollaboratorPage";
import { DimonaPage } from "./pages/DimonaPage.tsx";
import { DocumentsPage } from "./pages/DocumentsPage.tsx";
import { DocumentsListPage } from "./pages/DocumentsListPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SocialSecretariatDetailsPage from "./pages/SocialSecretriatDetailsPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster theme="light" />
        <Routes>
          {/* Routes publiques */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />

          {/* Routes protégées avec MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.DIMONA} element={<DimonaPage />} />
              <Route path={ROUTES.DOCUMENTS} element={<DocumentsPage />} />
              <Route
                path={`${ROUTES.DOCUMENTS}/:categoryId`}
                element={<DocumentsListPage />}
              />
              <Route path={ROUTES.COMPANIES} element={<CompanyPage />} />
              <Route
                path={ROUTES.COMPANY_CREATE}
                element={<CreateCompanyPage />}
              />
              <Route
                path={`${ROUTES.COMPANIES}/:id`}
                element={<CompanyDetailsPage />}
              />
              <Route
                path={ROUTES.COLLABORATORS}
                element={<CollaboratorPage />}
              />
              <Route
                path={ROUTES.COLLABORATOR_CREATE}
                element={<CreateCollaboratorPage />}
              />
              <Route
                path={`${ROUTES.COLLABORATORS}/:id`}
                element={<CollaboratorDetailsPage />}
              />
              <Route
                path={`/secretariat/:id`}
                element={<SocialSecretariatDetailsPage />}
              />

              {/* Routes avec rôle spécifique */}
              <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
                <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Redirection par défaut */}
          <Route
            path={ROUTES.ROOT}
            element={<Navigate to={ROUTES.LOGIN} replace />}
          />
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

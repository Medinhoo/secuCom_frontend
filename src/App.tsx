import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "@/config/routes.config";
import { MainLayout } from "@/components/layout";
import {
  LoginPage,
  CompanyPage,
  CompanyDetailsPage,
  CreateCompanyPage,
  CollaboratorDetailsPage,
  CollaboratorPage,
  CreateCollaboratorPage,
  DimonaPage,
  DimonaDetailsPage,
  CreateDimonaPage,
  EditDimonaPage,
  DocumentsPage,
  DocumentsListPage,
  DocumentGenerationPage,
  ProfilePage,
  SocialSecretariatDetailsPage,
  NotificationsPage,
  DashboardRouter,
  AdminUsersPage,
  CreateCompanyContactPage,
  AdminUserDetailsPage,
} from "@/pages";
import { ProtectedRoute, PendingAccountGuard } from "@/components/guards";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui";

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
            <Route element={<PendingAccountGuard><MainLayout /></PendingAccountGuard>}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardRouter />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.DIMONA} element={<DimonaPage />} />
              <Route
                path={ROUTES.CREATE_DIMONA}
                element={<CreateDimonaPage />}
              />
              <Route
                path={ROUTES.EDIT_DIMONA(":id")}
                element={<EditDimonaPage />}
              />
              <Route
                path={`${ROUTES.DIMONA}/:id`}
                element={<DimonaDetailsPage />}
              />
              <Route path={ROUTES.DOCUMENTS} element={<DocumentsPage />} />
              <Route
                path={`${ROUTES.DOCUMENTS}/generate/:templateName`}
                element={<DocumentGenerationPage />}
              />
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
              <Route
                path={ROUTES.NOTIFICATIONS}
                element={<NotificationsPage />}
              />
              

              {/* Routes avec rôle spécifique */}
              <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
                <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
                <Route 
                  path={ROUTES.ADMIN_USERS_CREATE_COMPANY_CONTACT} 
                  element={<CreateCompanyContactPage />} 
                />
                <Route 
                  path={`${ROUTES.ADMIN_USERS}/:id`} 
                  element={<AdminUserDetailsPage />} 
                />
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

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Building2, Shield, Mail, Phone, Calendar, Edit } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { AdminUserService } from "@/services/api/adminUserService";
import { AdminUser, AccountStatus } from "@/types/AdminUserTypes";
import { ROUTES } from "@/config/routes.config";
import { toast } from "sonner";

export function AdminUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (userId: string) => {
    try {
      setLoading(true);
      const userData = await AdminUserService.getUserById(userId);
      setUser(userData);
    } catch (error) {
      toast.error("Erreur lors du chargement de l'utilisateur");
      console.error("Error loading user:", error);
      navigate(ROUTES.ADMIN_USERS);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (roles: string[]) => {
    const roleColors: Record<string, string> = {
      ROLE_ADMIN: "bg-red-100 text-red-700",
      ROLE_COMPANY: "bg-blue-100 text-blue-700",
      ROLE_SECRETARIAT: "bg-green-100 text-green-700",
    };

    return (
      <div className="flex gap-2 flex-wrap">
        {roles.map((role) => (
          <Badge
            key={role}
            variant="secondary"
            className={roleColors[role] || "bg-gray-100 text-gray-700"}
          >
            {role.replace("ROLE_", "")}
          </Badge>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: AccountStatus) => {
    const statusColors: Record<AccountStatus, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      INACTIVE: "bg-gray-100 text-gray-700",
      LOCKED: "bg-red-100 text-red-700",
      PENDING: "bg-yellow-100 text-yellow-700",
    };

    const statusLabels: Record<AccountStatus, string> = {
      ACTIVE: "Actif",
      INACTIVE: "Inactif",
      LOCKED: "Bloqué",
      PENDING: "En attente",
    };

    return (
      <Badge variant="secondary" className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Utilisateur introuvable"
          description="L'utilisateur demandé n'existe pas ou n'est plus accessible"
        />
        <Button onClick={() => navigate(ROUTES.ADMIN_USERS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}`}
        description="Détails de l'utilisateur"
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate(ROUTES.ADMIN_USERS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
        <Button onClick={() => navigate(ROUTES.ADMIN_USER_EDIT(user.id))}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Prénom</label>
                <p className="text-sm">{user.firstName || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nom</label>
                <p className="text-sm">{user.lastName || "-"}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Nom d'utilisateur</label>
              <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">{user.username}</p>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm">{user.email || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                <p className="text-sm">{user.phoneNumber || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Rôle(s)</label>
              <div className="mt-1">{getRoleBadge(user.roles)}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Statut du compte</label>
              <div className="mt-1">{getStatusBadge(user.accountStatus)}</div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Créé le</label>
                <p className="text-sm">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Dernière connexion</label>
                <p className="text-sm">{formatDate(user.lastLogin)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Information */}
        {(user.companyName || user.secretariatName) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Organisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.companyName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Entreprise</label>
                  <p className="text-sm font-medium">{user.companyName}</p>
                </div>
              )}

              {user.secretariatName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Secrétariat social</label>
                  <p className="text-sm font-medium">{user.secretariatName}</p>
                </div>
              )}

              {user.fonction && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Fonction</label>
                  <p className="text-sm">{user.fonction}</p>
                </div>
              )}

              {user.position && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Poste</label>
                  <p className="text-sm">{user.position}</p>
                </div>
              )}

              {user.specialization && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Spécialisation</label>
                  <p className="text-sm">{user.specialization}</p>
                </div>
              )}

              {user.permissions && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Permissions</label>
                  <p className="text-sm">{user.permissions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AdminUserDetailsPage;

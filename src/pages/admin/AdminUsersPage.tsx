import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, Building2, Shield, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/layout/DataTable";
import { SearchBar } from "@/components/layout/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminUserService } from "@/services/api/adminUserService";
import { AdminUser, UserFilters, UserRole, AccountStatus } from "@/types/AdminUserTypes";
import { ROUTES } from "@/config/routes.config";
import { toast } from "sonner";

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "ALL",
    status: "ALL",
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Apply filters when users or filters change
  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await AdminUserService.getAllUsers();
      setUsers(userData);
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.companyName?.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (filters.role && filters.role !== "ALL") {
      filtered = filtered.filter((user) => user.roles.includes(filters.role as string));
    }

    // Status filter
    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((user) => user.accountStatus === filters.status);
    }

    setFilteredUsers(filtered);
  };

  const getRoleBadge = (roles: string[]) => {
    const roleColors: Record<string, string> = {
      ROLE_ADMIN: "bg-red-100 text-red-700",
      ROLE_COMPANY: "bg-blue-100 text-blue-700",
      ROLE_SECRETARIAT: "bg-green-100 text-green-700",
    };

    return (
      <div className="flex gap-1 flex-wrap">
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

  const columns: Column<AdminUser>[] = [
    {
      header: "Nom",
      accessor: (user) => (
        <div className="font-medium">
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username}
        </div>
      ),
    },
    {
      header: "Nom d'utilisateur",
      accessor: "username",
    },
    {
      header: "Email",
      accessor: (user) => user.email || "-",
    },
    {
      header: "Rôle(s)",
      accessor: (user) => getRoleBadge(user.roles),
    },
    {
      header: "Statut",
      accessor: (user) => getStatusBadge(user.accountStatus),
    },
    {
      header: "Organisation",
      accessor: (user) => (
        <div className="text-sm">
          {user.companyName && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-blue-500" />
              <span>{user.companyName}</span>
            </div>
          )}
          {user.secretariatName && (
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span>{user.secretariatName}</span>
            </div>
          )}
          {!user.companyName && !user.secretariatName && "-"}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des utilisateurs"
        description="Gérez tous les utilisateurs du système"
      />

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder="Rechercher par nom, email, entreprise..."
              value={filters.search || ""}
              onChange={(value) => setFilters({ ...filters, search: value })}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={filters.role || "ALL"}
              onValueChange={(value) => setFilters({ ...filters, role: value as UserRole | "ALL" })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les rôles</SelectItem>
                <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                <SelectItem value="ROLE_COMPANY">Entreprise</SelectItem>
                <SelectItem value="ROLE_SECRETARIAT">Secrétariat</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "ALL"}
              onValueChange={(value) => setFilters({ ...filters, status: value as AccountStatus | "ALL" })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
                <SelectItem value="LOCKED">Bloqué</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Create User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Créer un utilisateur
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={ROUTES.ADMIN_USERS_CREATE_COMPANY_CONTACT}>
                <Building2 className="h-4 w-4 mr-2" />
                Contact d'entreprise
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Shield className="h-4 w-4 mr-2" />
              Employé de secrétariat
              <Badge variant="secondary" className="ml-2 text-xs">
                Bientôt disponible
              </Badge>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Users Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        loading={loading}
        detailsRoute={ROUTES.ADMIN_USER_DETAILS}
        detailsButtonLabel="Voir détails"
        emptyStateMessage={{
          title: "Aucun utilisateur trouvé",
          description: "Essayez de modifier vos critères de recherche ou créez un nouvel utilisateur",
        }}
      />
    </div>
  );
}

export default AdminUsersPage;

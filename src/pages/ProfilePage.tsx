import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  User,
  ShieldCheck,
  AtSign,
  Phone,
  Clock,
  Calendar,
  AlertCircle,
  Building2,
  Briefcase,
  Star,
} from "lucide-react";

import PasswordChange from "../components/layout/PasswordChange";
import LoadingSpinner from "@/components/layout/LoadingSpinner";

const API_URL = import.meta.env.VITE_SECUCOM_API;

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position?: string;
  specialization?: string;
}

interface ValidationErrors {
  email?: string;
}

interface SecretariatInfo {
  id: string;
  name: string;
}

const ProfilePage: React.FC = () => {
  const { user, token, fetchUserDetails } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("information");
  const [secretariatInfo, setSecretariatInfo] =
    useState<SecretariatInfo | null>(null);
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    position: "",
    specialization: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // Check if user is a secretariat employee
  const isSecretariatEmployee = user?.roles.includes("ROLE_SECRETARIAT");

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        position: user.position || "",
        specialization: user.specialization || "",
      });

      // If user is a secretariat employee, fetch secretariat info
      if (isSecretariatEmployee && user.secretariatId) {
        fetchSecretariatInfo(user.secretariatId);
      }
    }
  }, [user, isSecretariatEmployee]);

  // Fetch secretariat info if user is a secretariat employee
  const fetchSecretariatInfo = async (secretariatId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/social-secretariat/${secretariatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSecretariatInfo({
        id: data.id,
        name: data.name,
      });
    } catch (error) {
      console.error("Error fetching secretariat info:", error);
    }
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validate email input
    if (name === "email") {
      if (!validateEmail(value) && value.length > 0) {
        setValidationErrors((prev) => ({
          ...prev,
          email: "Format d'email invalide",
        }));
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          email: undefined,
        }));
      }
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTabChange = (value: string) => {
    // Cancel editing mode when switching tabs
    if (isEditing) {
      cancelEdit();
    }
    setActiveTab(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !token) return;

    // Validate email before submission
    if (formData.email && !validateEmail(formData.email)) {
      setValidationErrors({
        email: "Format d'email invalide",
      });
      toast.error("Erreur de validation", {
        description: "Veuillez corriger les erreurs dans le formulaire.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create an object containing only the fields that have changed
      const updates: Record<string, string> = {};

      if (formData.firstName !== user.firstName) {
        updates.firstName = formData.firstName;
      }

      if (formData.lastName !== user.lastName) {
        updates.lastName = formData.lastName;
      }

      if (formData.email !== user.email) {
        updates.email = formData.email;
      }

      if (formData.phoneNumber !== user.phoneNumber) {
        updates.phoneNumber = formData.phoneNumber;
      }

      // Add employee-specific fields if applicable
      if (isSecretariatEmployee) {
        if (formData.position !== user.position) {
          updates.position = formData.position || "";
        }

        if (formData.specialization !== user.specialization) {
          updates.specialization = formData.specialization || "";
        }
      }

      // Only proceed if there are actual changes
      if (Object.keys(updates).length === 0) {
        toast.info("Aucune modification", {
          description: "Aucune modification n'a été apportée au profil.",
        });
        setIsEditing(false);
        setIsLoading(false);
        return;
      }

      // Determine the endpoint based on user role
      const endpoint = isSecretariatEmployee
        ? `${API_URL}/users/secretariat-employees/${user.id}`
        : `${API_URL}/users/${user.id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Échec de la mise à jour du profil"
        );
      }

      // Refresh user data
      await fetchUserDetails(user.id);

      setIsEditing(false);
      toast.success("Profil mis à jour", {
        description:
          "Vos informations personnelles ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);

      // Handle specific error messages
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue";

      // Provide more user-friendly error messages
      let description =
        "Une erreur est survenue lors de la mise à jour de votre profil";

      if (errorMessage.includes("Email is already in use")) {
        description =
          "Cette adresse email est déjà utilisée par un autre compte.";
      } else if (error instanceof Error) {
        description = error.message;
      }

      toast.error("Échec de la mise à jour", { description });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        position: user.position || "",
        specialization: user.specialization || "",
      });
    }
    // Clear validation errors
    setValidationErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="w-full p-6">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center">
              <LoadingSpinner />
              <p className="text-slate-500">
                Chargement des informations du profil...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Mon Profil
          </h1>
          <p className="text-slate-500">
            Consultez et gérez les informations de votre compte
          </p>
        </div>
        {/* Only show edit button on information tab and not already editing */}
        {activeTab === "information" && !isEditing ? (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => setIsEditing(true)}
          >
            Modifier le Profil
          </Button>
        ) : isEditing ? (
          <div className="space-x-2">
            <Button
              variant="outline"
              className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
              onClick={cancelEdit}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        ) : null}
      </div>

      <Tabs
        defaultValue="information"
        className="space-y-4"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="bg-white p-1 rounded-lg mb-4 shadow-sm">
          <TabsTrigger
            value="information"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            Informations Personnelles
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            Détails du Compte
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="information" className="mt-0">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-white p-6 pb-2">
              <CardTitle className="text-xl font-bold text-blue-700">
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      Prénom
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Nom
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Adresse Email
                    </Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`pl-9 border-slate-200 focus-visible:ring-blue-500 ${
                          validationErrors.email
                            ? "border-red-300 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      {validationErrors.email && (
                        <div className="flex items-center mt-1 text-red-500 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {validationErrors.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumber"
                      className="text-sm font-medium"
                    >
                      Numéro de Téléphone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Additional fields for secretariat employees */}
                  {isSecretariatEmployee && (
                    <>
                      <div className="space-y-2">
                        <Label
                          htmlFor="position"
                          className="text-sm font-medium"
                        >
                          Poste
                        </Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                            placeholder={
                              !isEditing && !formData.position
                                ? "Non défini"
                                : ""
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="specialization"
                          className="text-sm font-medium"
                        >
                          Spécialisation
                        </Label>
                        <div className="relative">
                          <Star className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            id="specialization"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                            placeholder={
                              !isEditing && !formData.specialization
                                ? "Non définie"
                                : ""
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-0">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-white p-6 pb-2">
              <CardTitle className="text-xl font-bold text-blue-700">
                Détails du Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Nom d'utilisateur
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="username"
                        name="username"
                        value={user.username}
                        disabled={true}
                        className="pl-9 border-slate-200 bg-slate-50"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Le nom d'utilisateur ne peut pas être modifié.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show secretariat info for secretariat employees */}
                {isSecretariatEmployee && secretariatInfo && (
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="font-medium mb-2 text-blue-700">
                      Secrétariat Social
                    </h3>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-slate-700">
                        {secretariatInfo.name}
                      </span>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4">
                  <h3 className="font-medium mb-2 text-blue-700">
                    Statut du Compte
                  </h3>
                  <Badge
                    className={`
                      ${
                        user.accountStatus === "ACTIVE"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : ""
                      }
                      ${
                        user.accountStatus === "PENDING"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : ""
                      }
                      ${
                        user.accountStatus === "LOCKED"
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : ""
                      }
                      ${
                        user.accountStatus === "INACTIVE"
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : ""
                      }
                    `}
                  >
                    {user.accountStatus === "ACTIVE"
                      ? "ACTIF"
                      : user.accountStatus === "PENDING"
                      ? "EN ATTENTE"
                      : user.accountStatus === "LOCKED"
                      ? "VERROUILLÉ"
                      : user.accountStatus === "INACTIVE"
                      ? "INACTIF"
                      : "INCONNU"}
                  </Badge>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h3 className="font-medium mb-2 text-blue-700">Rôles</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          {role.replace("ROLE_", "") === "CLIENT"
                            ? "CLIENT"
                            : role.replace("ROLE_", "") === "SECRETARIAT"
                            ? "SECRÉTARIAT"
                            : role.replace("ROLE_", "") === "ADMIN"
                            ? "ADMINISTRATEUR"
                            : role.replace("ROLE_", "")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h3 className="font-medium mb-2 text-blue-700">
                    Informations du Compte
                  </h3>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Créé le:</span>{" "}
                      {formatDate(user.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        Dernière connexion:
                      </span>{" "}
                      {formatDate(user.lastLogin)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <PasswordChange />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;

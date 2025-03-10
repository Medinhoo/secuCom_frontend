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
} from "lucide-react";

import PasswordChange from "../components/layout/PasswordChange";

const API_URL = import.meta.env.VITE_SECUCOM_API;

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
}

const ProfilePage: React.FC = () => {
  const { user, token, fetchUserDetails } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    username: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        username: user.username || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !token) return;

    setIsLoading(true);
    try {
      // Créer un objet complet qui combine les données utilisateur existantes avec les modifications
      const updatedUserData = {
        ...user, // Garder toutes les données utilisateur existantes
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        username: formData.username,
      };

      // Supprimer les champs que le backend ne devrait pas recevoir lors d'une mise à jour
      // (par exemple, les dates qui sont générées côté serveur)
      const { createdAt, lastLogin, ...userToUpdate } = updatedUserData;

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userToUpdate),
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
      toast.error("Échec de la mise à jour", {
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la mise à jour de votre profil",
      });
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
        username: user.username || "",
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <p className="text-slate-500">
              Chargement des informations du profil...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Mon Profil
          </h1>
          <p className="text-slate-500">
            Consultez et gérez les informations de votre compte
          </p>
        </div>
        {!isEditing ? (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => setIsEditing(true)}
          >
            Modifier le Profil
          </Button>
        ) : (
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
        )}
      </div>

      <Tabs defaultValue="information" className="space-y-4">
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
                        className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                      />
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
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

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

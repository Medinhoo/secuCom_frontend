import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Lock, AlertCircle, Check } from "lucide-react";

const API_URL = import.meta.env.VITE_SECUCOM_API;

const PasswordChange: React.FC = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing again
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const validateForm = () => {
    if (!passwordData.currentPassword) {
      setError("Le mot de passe actuel est requis");
      return false;
    }

    if (!passwordData.newPassword) {
      setError("Le nouveau mot de passe est requis");
      return false;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!user?.id || !token) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Échec de la mise à jour du mot de passe"
        );
      }

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess(true);
      toast.success("Mot de passe mis à jour", {
        description: "Votre mot de passe a été changé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la mise à jour de votre mot de passe"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader className="bg-white p-6 pb-2">
        <CardTitle className="text-xl font-bold text-blue-700">
          Changer le Mot de Passe
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>
              Mot de passe mis à jour avec succès
            </AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Mot de Passe Actuel
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handleChange}
                className="pl-9 border-slate-200 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              Nouveau Mot de Passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handleChange}
                className="pl-9 border-slate-200 focus-visible:ring-blue-500"
              />
            </div>
            <p className="text-xs text-slate-500">
              Le mot de passe doit contenir au moins 8 caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmer le Nouveau Mot de Passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className="pl-9 border-slate-200 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm mt-2"
            disabled={isLoading}
          >
            {isLoading
              ? "Mise à jour en cours..."
              : "Mettre à Jour le Mot de Passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordChange;

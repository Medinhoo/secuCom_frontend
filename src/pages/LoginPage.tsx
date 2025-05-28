import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  BuildingIcon,
  AlertCircle,
  ShieldCheckIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(username, password);
  };

  useEffect(() => {
    clearError();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo and Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src="/secucomLogo.png" 
                alt="Secucom Logo" 
                className="h-20 w-auto object-contain drop-shadow-lg"
              />
              <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenue sur Secucom
          </h1>
          <p className="text-gray-600 text-lg">
            Votre plateforme de gestion sécurisée
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-center gap-3">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Connexion sécurisée</h2>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Erreur de connexion</p>
                  <p className="text-sm text-red-600">Vérifiez vos identifiants et réessayez</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <BuildingIcon className="h-4 w-4" />
                  Nom d'utilisateur
                </Label>
                <div className="relative group">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Entrez votre nom d'utilisateur"
                    className="pl-4 pr-4 py-3 text-base border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all duration-200 group-hover:border-gray-300"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <LockIcon className="h-4 w-4" />
                    Mot de passe
                  </Label>
                  <Button
                    variant="link"
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto text-sm font-medium transition-colors"
                    type="button"
                  >
                    Mot de passe oublié?
                  </Button>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    className="pl-4 pr-12 py-3 text-base border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all duration-200 group-hover:border-gray-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg py-3 text-base font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connexion en cours...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5" />
                    Se connecter
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              Besoin d'aide ?{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline">
                Contactez l'administrateur
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <ShieldCheckIcon className="h-3 w-3" />
            Secucom V1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

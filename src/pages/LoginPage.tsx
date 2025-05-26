import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  AlertCircle,
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-xl px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-blue-700">
            Secrétariat Social
          </h1>
          <p className="text-xl text-slate-500 mt-2">
            Accédez à votre espace partagé
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-100">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Connexion</h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>Connexion échouée</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-lg text-slate-700 font-medium"
                >
                  Nom de votre entreprise
                </Label>
                <div className="relative">
                  <MailIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="mon enteprise"
                    className="pl-12 py-6 text-lg border-slate-200 rounded-lg focus-visible:ring-blue-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="text-lg text-slate-700 font-medium"
                  >
                    Mot de passe
                  </Label>
                  <Button
                    variant="link"
                    className="text-blue-600 p-0 h-auto text-base font-medium"
                    type="button"
                  >
                    Mot de passe oublié?
                  </Button>
                </div>
                <div className="relative">
                  <LockIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-12 pr-12 py-6 text-lg border-slate-200 rounded-lg focus-visible:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-slate-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md py-6 text-lg font-medium rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white mr-2"
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
                  "Se connecter"
                )}
              </Button>
            </form>
          </div>

          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 text-center rounded-b-xl">
            <p className="text-slate-500">
              Problème de connexion?{" "}
              <span className="text-blue-600 font-medium">
                Contactez votre administrateur
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

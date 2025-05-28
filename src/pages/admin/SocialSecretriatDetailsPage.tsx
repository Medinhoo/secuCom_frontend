import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserService } from "@/services/api/userService";
import { SecretariatService } from "@/services/api/secretariatService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Save,
  AlertCircle,
  Users,
  User,
  Briefcase,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { SocialSecretariat } from "@/types/SocialSecretariatTypes";
import { User as Employee } from "@/context/AuthContext";

interface ValidationErrors {
  email?: string;
  [key: string]: string | undefined;
}

interface FormData {
  name: string;
  companyNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

const SocialSecretariatDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [secretariat, setSecretariat] = useState<SocialSecretariat | null>(
    null
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [employeesLoading, setEmployeesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    companyNumber: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  useEffect(() => {
    const fetchSecretariatDetails = async () => {
      if (!id) {
        setError("ID du secrétariat social non fourni");
        return;
      }

      try {
        setLoading(true);
        const data = await SecretariatService.getSecretariatDetails(id);
        setSecretariat(data);
        setFormData({
          name: data.name || "",
          companyNumber: data.companyNumber || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
        });
        setError(null);
      } catch (err) {
        setError(
          "Échec du chargement des détails du secrétariat social. " +
            (err instanceof Error ? err.message : String(err))
        );
        console.error(
          "Erreur lors de la récupération des détails du secrétariat social:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSecretariatDetails();
    }
  }, [id]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!id) return;

      try {
        setEmployeesLoading(true);
        const data = await UserService.getSecretariatEmployees(id);
        setEmployees(data);
        setEmployeesError(null);
      } catch (err) {
        setEmployeesError(
          "Échec du chargement des employés. " +
            (err instanceof Error ? err.message : String(err))
        );
        console.error("Erreur lors de la récupération des employés:", err);
      } finally {
        setEmployeesLoading(false);
      }
    };

    if (activeTab === "employees") {
      fetchEmployees();
    }
  }, [id, activeTab]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !email || email.length === 0 || emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validate email input
    if (name === "email") {
      if (!validateEmail(value)) {
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!validateEmail(formData.email)) {
      setValidationErrors({
        email: "Format d'email invalide",
      });
      toast.error("Erreur de validation", {
        description: "Veuillez corriger les erreurs dans le formulaire.",
      });
      return;
    }

    if (!id) {
      toast.error("Erreur", {
        description: "ID du secrétariat social non fourni",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create an object containing only the fields that have changed
      const updates: Partial<FormData> = {};

      if (!secretariat) return;

      if (formData.name !== secretariat.name) {
        updates.name = formData.name;
      }

      if (formData.companyNumber !== secretariat.companyNumber) {
        updates.companyNumber = formData.companyNumber;
      }

      if (formData.address !== secretariat.address) {
        updates.address = formData.address;
      }

      if (formData.phone !== secretariat.phone) {
        updates.phone = formData.phone;
      }

      if (formData.email !== secretariat.email) {
        updates.email = formData.email;
      }

      if (formData.website !== secretariat.website) {
        updates.website = formData.website;
      }

      // Only proceed if there are actual changes
      if (Object.keys(updates).length === 0) {
        toast.info("Aucune modification", {
          description:
            "Aucune modification n'a été apportée au secrétariat social.",
        });
        setIsEditing(false);
        setIsSubmitting(false);
        return;
      }

      const updatedData = await SecretariatService.updateSecretariat(
        id,
        updates
      );
      setSecretariat(updatedData);

      setIsEditing(false);
      toast.success("Secrétariat social mis à jour", {
        description:
          "Les informations du secrétariat social ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du secrétariat social:",
        error
      );

      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue";

      toast.error("Échec de la mise à jour", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to current secretariat data
    if (secretariat) {
      setFormData({
        name: secretariat.name || "",
        companyNumber: secretariat.companyNumber || "",
        address: secretariat.address || "",
        phone: secretariat.phone || "",
        email: secretariat.email || "",
        website: secretariat.website || "",
      });
    }
    // Clear validation errors
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleAddEmployee = () => {
    if (id) {
      navigate(`/secretariat-employees/new?secretariatId=${id}`);
    }
  };

  const handleViewEmployee = (employeeId: string) => {
    navigate(`/secretariat-employees/${employeeId}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center">
              <LoadingSpinner />
              <p className="text-slate-500 ml-2">
                Chargement des détails du secrétariat social...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-red-600 font-medium">Erreur</p>
              <p className="text-slate-500">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!secretariat) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-500">Aucun secrétariat social trouvé</p>
        </div>
      </div>
    );
  }

  // Check if user has edit permission (admin or secretariat role)
  const hasEditPermission =
    user &&
    (user.roles.includes("ROLE_ADMIN") ||
      user.roles.includes("ROLE_SECRETARIAT"));

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-blue-700">
          Détails du Secrétariat Social
        </h1>
        <div className="flex space-x-4">
          {hasEditPermission && !isEditing && activeTab === "details" && (
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Activer l'édition
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                disabled={isSubmitting}
                className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isSubmitting ? (
                  "Enregistrement..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs
        defaultValue="details"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-white p-1 rounded-lg mb-4 shadow-sm">
          <TabsTrigger
            value="details"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Informations
          </TabsTrigger>
          <TabsTrigger
            value="employees"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Employés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-0">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-100 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-blue-700">
                    {isEditing ? (
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="text-2xl font-bold border-slate-200 focus-visible:ring-blue-500"
                      />
                    ) : (
                      secretariat.name
                    )}
                  </CardTitle>
                  <CardDescription className="text-slate-500 mt-1">
                    Numéro d'entreprise:{" "}
                    {isEditing ? (
                      <Input
                        name="companyNumber"
                        value={formData.companyNumber}
                        onChange={handleChange}
                        className="ml-1 border-slate-200 focus-visible:ring-blue-500"
                      />
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700 border-0 ml-1"
                      >
                        {secretariat.companyNumber}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-blue-700 mb-4">
                    Coordonnées
                  </h3>
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="address"
                          className="text-sm font-medium"
                        >
                          Adresse
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Numéro de téléphone
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
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
                          htmlFor="website"
                          className="text-sm font-medium"
                        >
                          Site web
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium text-blue-800">Adresse</p>
                          <p className="text-slate-500">
                            {secretariat.address || "Non fournie"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium text-blue-800">
                            Numéro de téléphone
                          </p>
                          <p className="text-slate-500">
                            {secretariat.phone || "Non fourni"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium text-blue-800">Email</p>
                          <p className="text-slate-500">
                            {secretariat.email || "Non fourni"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Globe className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium text-blue-800">Site web</p>
                          {secretariat.website ? (
                            <a
                              href={
                                secretariat.website.startsWith("http")
                                  ? secretariat.website
                                  : `https://${secretariat.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {secretariat.website}
                            </a>
                          ) : (
                            <p className="text-slate-500">Non fourni</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-6 border-slate-100" />

                {/* Additional sections could be added here as needed */}
                <div>
                  <h3 className="text-xl font-bold text-blue-700 mb-4">
                    Aperçu des services
                  </h3>
                  <p className="text-slate-500">
                    Cette section afficherait les services proposés par ce
                    secrétariat social. Le modèle de données devrait être étendu
                    pour inclure ces informations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="mt-0">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-white p-6 pb-2 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-blue-700">
                  Employés du secrétariat
                </CardTitle>
                {hasEditPermission && (
                  <Button
                    onClick={handleAddEmployee}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Ajouter un employé
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {employeesLoading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingSpinner />
                  <p className="text-slate-500 ml-2">
                    Chargement des employés...
                  </p>
                </div>
              ) : employeesError ? (
                <div className="flex justify-center items-center py-10">
                  <div className="text-center">
                    <p className="text-red-600 font-medium mb-2">Erreur</p>
                    <p className="text-slate-500">{employeesError}</p>
                  </div>
                </div>
              ) : employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <Users className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-xl font-medium text-slate-700 mb-1">
                    Aucun employé trouvé
                  </p>
                  <p className="text-slate-500 text-center mb-4">
                    Ce secrétariat social n'a pas encore d'employés enregistrés
                    dans le système.
                  </p>
                  {hasEditPermission && (
                    <Button
                      onClick={handleAddEmployee}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Ajouter le premier employé
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 font-medium text-blue-700">
                          Nom
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-blue-700">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-blue-700">
                          Poste
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-blue-700">
                          Spécialisation
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-blue-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="border-b border-slate-100 hover:bg-slate-50 group"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <User className="h-5 w-5 text-slate-400 mr-2" />
                              <div>
                                <p className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                                  {employee.firstName} {employee.lastName}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {employee.username}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {employee.email}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 text-slate-400 mr-1" />
                              <span className="text-slate-600">
                                {employee.position || "Non défini"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-slate-400 mr-1" />
                              <span className="text-slate-600">
                                {employee.specialization || "Non définie"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              onClick={() => handleViewEmployee(employee.id)}
                              className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                              size="sm"
                            >
                              Voir détails
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialSecretariatDetailsPage;

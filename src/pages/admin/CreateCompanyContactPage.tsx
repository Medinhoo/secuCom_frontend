import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, User, Check, AlertCircle, Plus, Search, Copy, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminUserService } from "@/services/api/adminUserService";
import { CreateCompanyRequest, CreateCompanyContactRequest, CreateCompanyResponse } from "@/types/AdminUserTypes";
import { ROUTES } from "@/config/routes.config";
import { toast } from "sonner";

interface FormErrors {
  [key: string]: string;
}

export function CreateCompanyContactPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdCompany, setCreatedCompany] = useState<CreateCompanyResponse | null>(null);
  
  // Company selection state
  const [companyChoice, setCompanyChoice] = useState<'new' | 'existing' | null>(null);
  const [existingCompanies, setExistingCompanies] = useState<CreateCompanyResponse[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [companiesLoading, setCompaniesLoading] = useState(false);
  
  // Step 1: Company form data
  const [companyData, setCompanyData] = useState<CreateCompanyRequest>({
    name: "",
    bceNumber: "",
    onssNumber: "",
  });

  // Step 2: User form data
  const [userData, setUserData] = useState<CreateCompanyContactRequest>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    fonction: "",
    permissions: "",
    roles: ["ROLE_COMPANY"],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Modal state for credentials
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Load existing companies when component mounts
  useEffect(() => {
    loadExistingCompanies();
  }, []);

  const loadExistingCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const companies = await AdminUserService.getAllCompanies();
      setExistingCompanies(companies);
    } catch (error) {
      console.error("Error loading companies:", error);
      toast.error("Erreur lors du chargement des entreprises");
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Handle company choice selection
  const handleCompanyChoice = (choice: 'new' | 'existing') => {
    setCompanyChoice(choice);
    setErrors({});
  };

  // Handle existing company selection
  const handleExistingCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const selectedCompany = existingCompanies.find(c => c.id === companyId);
    if (selectedCompany) {
      setCreatedCompany(selectedCompany);
    }
  };

  // Handle proceed to step 2 with existing company
  const handleProceedWithExistingCompany = () => {
    if (!selectedCompanyId) {
      setErrors({ company: "Veuillez sélectionner une entreprise" });
      return;
    }
    setCurrentStep(2);
    toast.success("Entreprise sélectionnée avec succès");
  };

  // Validation functions
  const validateCompanyForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!companyData.name.trim()) {
      newErrors.name = "Le nom de l'entreprise est requis";
    }

    if (!companyData.bceNumber.trim()) {
      newErrors.bceNumber = "Le numéro BCE est requis";
    } else if (!/^\d{10}$/.test(companyData.bceNumber.replace(/\D/g, ""))) {
      newErrors.bceNumber = "Le numéro BCE doit contenir 10 chiffres";
    }

    if (!companyData.onssNumber.trim()) {
      newErrors.onssNumber = "Le numéro ONSS est requis";
    } else if (!/^\d{7}$/.test(companyData.onssNumber.replace(/\D/g, ""))) {
      newErrors.onssNumber = "Le numéro ONSS doit contenir 7 chiffres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUserForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!userData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!userData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!userData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (userData.username.length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    if (!userData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!userData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    } else if (userData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Step 1: Create Company
  const handleCreateCompany = async () => {
    if (!validateCompanyForm()) return;

    try {
      setLoading(true);
      
      // Check for duplicate BCE and ONSS numbers
      const [bceExists, onssExists] = await Promise.all([
        AdminUserService.checkBceNumber(companyData.bceNumber),
        AdminUserService.checkOnssNumber(companyData.onssNumber),
      ]);

      if (bceExists) {
        setErrors({ bceNumber: "Ce numéro BCE existe déjà" });
        return;
      }

      if (onssExists) {
        setErrors({ onssNumber: "Ce numéro ONSS existe déjà" });
        return;
      }

      const company = await AdminUserService.createCompany(companyData);
      setCreatedCompany(company);
      setCurrentStep(2);
      toast.success("Entreprise créée avec succès");
    } catch (error: any) {
      console.error("Error creating company:", error);
      if (error.message?.includes("BCE")) {
        setErrors({ bceNumber: "Ce numéro BCE existe déjà" });
      } else if (error.message?.includes("ONSS")) {
        setErrors({ onssNumber: "Ce numéro ONSS existe déjà" });
      } else {
        toast.error("Erreur lors de la création de l'entreprise");
      }
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field === 'username' ? 'Nom d\'utilisateur' : 'Mot de passe'} copié !`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  // Copy all credentials function
  const copyAllCredentials = async () => {
    if (!createdUserCredentials) return;
    
    const credentialsText = `Identifiants de connexion :

Nom d'utilisateur : ${createdUserCredentials.username}
Mot de passe : ${createdUserCredentials.password}

Veuillez conserver ces informations en sécurité.`;

    try {
      await navigator.clipboard.writeText(credentialsText);
      setCopiedField("all");
      toast.success("Tous les identifiants copiés !");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  // Handle Step 2: Create User
  const handleCreateUser = async () => {
    if (!validateUserForm() || !createdCompany) return;

    try {
      setLoading(true);
      await AdminUserService.createCompanyContact(createdCompany.id, userData);
      
      // Store credentials and show modal
      setCreatedUserCredentials({
        username: userData.username,
        password: userData.password,
      });
      setShowCredentialsModal(true);
      
      toast.success("Contact d'entreprise créé avec succès");
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.message?.includes("username")) {
        setErrors({ username: "Ce nom d'utilisateur existe déjà" });
      } else if (error.message?.includes("email")) {
        setErrors({ email: "Cet email existe déjà" });
      } else {
        toast.error("Erreur lors de la création de l'utilisateur");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close and navigation
  const handleModalClose = () => {
    setShowCredentialsModal(false);
    setCreatedUserCredentials(null);
    navigate(ROUTES.ADMIN_USERS);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCreatedCompany(null);
    setCompanyData({ name: "", bceNumber: "", onssNumber: "" });
    setUserData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      fonction: "",
      permissions: "",
      roles: ["ROLE_COMPANY"],
    });
    setErrors({});
  };

  const handleCancel = () => {
    if (companyChoice) {
      // Si on a fait un choix, revenir au choix initial
      setCompanyChoice(null);
      setSelectedCompanyId("");
      setCreatedCompany(null);
      setErrors({});
    } else {
      // Si on est au choix initial, quitter complètement
      navigate(ROUTES.ADMIN_USERS);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer un contact d'entreprise"
        description="Processus en 2 étapes : créer l'entreprise puis le contact"
      />

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
          }`}>
            {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep >= 1 ? "text-blue-600" : "text-gray-500"
          }`}>
            Créer l'entreprise
          </span>
        </div>
        
        <div className={`w-12 h-0.5 ${currentStep > 1 ? "bg-blue-600" : "bg-gray-200"}`} />
        
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
          }`}>
            {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep >= 2 ? "text-blue-600" : "text-gray-500"
          }`}>
            Créer le contact
          </span>
        </div>
      </div>

      {/* Step 1: Company Selection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Étape 1: Sélection de l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Choice Selection */}
            {!companyChoice && (
              <div className="space-y-4">
                <Label className="text-base font-medium">Choisissez une option :</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-blue-500 hover:bg-blue-50"
                    onClick={() => handleCompanyChoice('new')}
                  >
                    <Plus className="h-6 w-6 text-blue-600" />
                    <span className="font-medium">Créer une nouvelle entreprise</span>
                    <span className="text-xs text-gray-500">Ajouter une entreprise au système</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-blue-500 hover:bg-blue-50"
                    onClick={() => handleCompanyChoice('existing')}
                    disabled={companiesLoading}
                  >
                    <Search className="h-6 w-6 text-blue-600" />
                    <span className="font-medium">Sélectionner une entreprise existante</span>
                    <span className="text-xs text-gray-500">
                      {companiesLoading ? "Chargement..." : `${existingCompanies.length} entreprises disponibles`}
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {/* Create New Company Form */}
            {companyChoice === 'new' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Créer une nouvelle entreprise</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-3">
                    <Label htmlFor="name" className="block">Nom de l'entreprise *</Label>
                    <Input
                      id="name"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      placeholder="Nom de l'entreprise"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bceNumber" className="block">Numéro BCE *</Label>
                    <Input
                      id="bceNumber"
                      value={companyData.bceNumber}
                      onChange={(e) => setCompanyData({ ...companyData, bceNumber: e.target.value })}
                      placeholder="0123456789"
                      className={errors.bceNumber ? "border-red-500" : ""}
                    />
                    {errors.bceNumber && (
                      <p className="text-sm text-red-500 mt-1">{errors.bceNumber}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="onssNumber" className="block">Numéro ONSS *</Label>
                    <Input
                      id="onssNumber"
                      value={companyData.onssNumber}
                      onChange={(e) => setCompanyData({ ...companyData, onssNumber: e.target.value })}
                      placeholder="1234567"
                      className={errors.onssNumber ? "border-red-500" : ""}
                    />
                    {errors.onssNumber && (
                      <p className="text-sm text-red-500 mt-1">{errors.onssNumber}</p>
                    )}
                  </div>
                </div>

                <Alert className="bg-sky-50 border-sky-200">
                  <AlertCircle className="h-4 w-4 text-sky-600" />
                  <AlertDescription className="text-sky-800">
                    Seuls les champs obligatoires sont demandés pour la création rapide. 
                    Les autres informations pourront être ajoutées ultérieurement.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Select Existing Company */}
            {companyChoice === 'existing' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Sélectionner une entreprise existante</Label>
                </div>
                
                <div>
                  <Label htmlFor="existingCompany" className="mb-2 block">Entreprise *</Label>
                  <Select value={selectedCompanyId} onValueChange={handleExistingCompanySelect}>
                    <SelectTrigger className={errors.company ? "border-red-500" : ""}>
                      <SelectValue placeholder="Sélectionnez une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{company.name}</span>
                            <span className="text-xs text-gray-500">
                              BCE: {company.bceNumber} | ONSS: {company.onssNumber}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.company && (
                    <p className="text-sm text-red-500 mt-1">{errors.company}</p>
                  )}
                </div>

                {selectedCompanyId && (
                  <Alert className="bg-sky-50 border-sky-200">
                    <Check className="h-4 w-4 text-sky-600" />
                    <AlertDescription className="text-sky-800">
                      Entreprise sélectionnée : <strong>{existingCompanies.find(c => c.id === selectedCompanyId)?.name}</strong>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              
              {companyChoice === 'new' && (
                <Button onClick={handleCreateCompany} disabled={loading}>
                  {loading ? "Création..." : "Créer l'entreprise"}
                </Button>
              )}
              
              {companyChoice === 'existing' && (
                <Button onClick={handleProceedWithExistingCompany} disabled={!selectedCompanyId}>
                  Continuer avec cette entreprise
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: User Form */}
      {currentStep === 2 && createdCompany && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Étape 2: Contact pour {createdCompany.name}
            </CardTitle>
            <Badge variant="secondary" className="w-fit">
              {companyChoice === 'new' ? 'Entreprise créée avec succès' : 'Entreprise sélectionnée'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="block">Prénom *</Label>
                <Input
                  id="firstName"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  placeholder="Prénom"
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="lastName" className="block">Nom *</Label>
                <Input
                  id="lastName"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  placeholder="Nom"
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="username" className="block">Nom d'utilisateur *</Label>
                <Input
                  id="username"
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  placeholder="nom.utilisateur"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">{errors.username}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="block">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="email@exemple.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="block">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  placeholder="Mot de passe"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="phoneNumber" className="block">Téléphone</Label>
                <Input
                  id="phoneNumber"
                  value={userData.phoneNumber}
                  onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                  placeholder="+32 123 45 67 89"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="fonction" className="block">Fonction</Label>
                <Input
                  id="fonction"
                  value={userData.fonction}
                  onChange={(e) => setUserData({ ...userData, fonction: e.target.value })}
                  placeholder="Directeur, Manager, etc."
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="permissions" className="block">Permissions</Label>
                <Input
                  id="permissions"
                  value={userData.permissions}
                  onChange={(e) => setUserData({ ...userData, permissions: e.target.value })}
                  placeholder="Permissions spéciales"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleCreateUser} disabled={loading}>
                {loading ? "Création..." : "Créer le contact"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credentials Modal */}
      <Dialog open={showCredentialsModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Contact créé avec succès !
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Voici les identifiants de connexion du nouveau contact. Vous pouvez les copier pour les envoyer à l'utilisateur.
            </p>
            
            {/* All Credentials Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Identifiants de connexion</Label>
              <div className="relative">
                <textarea
                  value={`Nom d'utilisateur :\n${createdUserCredentials?.username || ""}\n\nMot de passe :\n${createdUserCredentials?.password || ""}`}
                  readOnly
                  className="w-full min-h-[120px] px-3 py-2 pr-12 text-sm border border-input bg-gray-50 rounded-md resize-none"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyAllCredentials}
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                >
                  {copiedField === "all" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Assurez-vous de transmettre ces identifiants de manière sécurisée à l'utilisateur.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end pt-4">
              <Button onClick={handleModalClose}>
                Fermer et retourner à la liste
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateCompanyContactPage;

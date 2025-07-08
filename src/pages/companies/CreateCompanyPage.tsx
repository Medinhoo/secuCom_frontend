import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, FileCheck, MapPin, Settings, Check, AlertCircle, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { companyService } from "@/services/api/companyService";
import { ROUTES } from "@/config/routes.config";
import { toast } from "sonner";
import { CompanyLookupField } from "@/components/features/company-lookup";
import { useCompanyValidation } from "@/hooks/useCompanyValidation";
import { ValidationError } from "@/components/common/forms";
import type { CompanyFormData } from "@/types/CompanyLookupTypes";
import type { CompanyDto } from "@/types/CompanyTypes";

interface FormErrors {
  [key: string]: string;
}

// Options for select fields
const LEGAL_FORMS = [
  "SPRL", "SA", "SRL", "SNC", "SCS", "SCRL", "ASBL", "Fondation", "GIE", "EEIG", "Autre"
];

const CATEGORIES = [
  "Micro-entreprise", "Petite entreprise", "Moyenne entreprise", "Grande entreprise"
];

const ACTIVITY_SECTORS = [
  "Construction", "Transport", "Horeca", "Commerce", "Services"
];

const JOINT_COMMITTEES = [
  "100", "102", "106", "111", "112", "116", "118", "120", "124", "140", "200", "201", "202", "209", "210", "218", "220", "224", "226"
];

const WORK_REGIMES = [
  "Temps plein", "Temps partiel", "Horaire flexible", "Télétravail", "Mixte"
];

const DECLARATION_FREQUENCIES = [
  "Mensuelle", "Trimestrielle", "Annuelle"
];

const SUBSCRIPTION_FORMULAS = [
  "Basique", "Standard", "Premium", "Enterprise"
];

export function CreateCompanyPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCompanyId, setCreatedCompanyId] = useState<string>("");

  // État pour tracker les champs préremplis
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());
  
  // État pour tracker les champs synchronisés depuis l'autre champ
  const [syncedFields, setSyncedFields] = useState<Set<string>>(new Set());

  // Steps configuration
  const steps = [
    { id: 1, title: "Numéros d'enregistrement", icon: FileCheck, description: "BCE, TVA et ONSS" },
    { id: 2, title: "Informations de base", icon: Building2, description: "Nom et secteur d'activité" },
    { id: 3, title: "Coordonnées", icon: MapPin, description: "Contact et adresse" },
    { id: 4, title: "Paramètres", icon: Settings, description: "Collaboration et souscription" },
  ];

  // Form data state
  const [formData, setFormData] = useState<Partial<CompanyDto>>({
    name: "",
    companyName: "",
    legalForm: "",
    activitySector: "",
    category: "",
    bceNumber: "",
    onssNumber: "",
    vatNumber: "",
    jointCommittees: [],
    email: "",
    phoneNumber: "",
    iban: "",
    address: {
      street: "",
      number: "",
      box: "",
      postalCode: "",
      city: "",
      country: "Belgique",
    },
    creationDate: undefined,
    collaborationStartDate: undefined,
    subscriptionFormula: "",
    declarationFrequency: "",
    workRegime: "",
    salaryReduction: "",
    securityFund: "",
    workAccidentInsurance: "",
    workCalendar: "",
  });

  // Validation hook
  const validation = useCompanyValidation(formData as CompanyDto);

  // Step validation
  const isStep1Valid = () => {
    const hasRequiredFields = !!(formData.bceNumber && formData.onssNumber);
    const hasNoValidationErrors = !validation.errors.bceNumber && !validation.errors.onssNumber && !validation.errors.vatNumber && !validation.errors.jointCommittees;
    const isNotValidating = !validation.validating.bceNumber && !validation.validating.onssNumber && !validation.validating.vatNumber;
    
    return hasRequiredFields && hasNoValidationErrors && isNotValidating;
  };

  const isStep2Valid = () => {
    const hasRequiredFields = !!(formData.name && formData.activitySector && formData.legalForm);
    const hasNoValidationErrors = !validation.errors.name && !validation.errors.activitySector && !validation.errors.legalForm && !validation.errors.creationDate;
    
    return hasRequiredFields && hasNoValidationErrors;
  };

  const isStep3Valid = () => {
    const hasRequiredFields = !!(formData.email);
    const hasNoValidationErrors = !validation.errors.email && !validation.errors.phoneNumber && !validation.errors.iban;
    
    return hasRequiredFields && hasNoValidationErrors;
  };

  const isStep4Valid = () => {
    const hasNoValidationErrors = !validation.errors.collaborationStartDate;
    return hasNoValidationErrors;
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return isStep1Valid();
      case 2:
        return isStep2Valid();
      case 3:
        return isStep3Valid();
      case 4:
        return isStep4Valid();
      default:
        return false;
    }
  };

  const canProceedToStep = (targetStep: number): boolean => {
    for (let i = 1; i < targetStep; i++) {
      if (!isStepValid(i)) {
        return false;
      }
    }
    return true;
  };

  const handleStepChange = (step: number) => {
    if (step > currentStep) {
      // Moving forward - validate current step first
      if (!isStepValid(currentStep)) {
        toast.error("Veuillez remplir tous les champs obligatoires avant de continuer");
        return;
      }
    }
    
    if (canProceedToStep(step)) {
      setCurrentStep(step);
      setErrors({});
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      handleStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        street: prev.address?.street || "",
        number: prev.address?.number || "",
        box: prev.address?.box || "",
        postalCode: prev.address?.postalCode || "",
        city: prev.address?.city || "",
        country: prev.address?.country || "Belgique",
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyLookupConfirmed = (lookupData: CompanyFormData) => {
    // Tracker les champs préremplis
    const newPrefilledFields = new Set<string>();
    const newSyncedFields = new Set<string>();
    
    // Ajouter les champs qui seront préremplis
    if (lookupData.name) newPrefilledFields.add('name');
    if (lookupData.companyName) newPrefilledFields.add('companyName');
    if (lookupData.legalForm) newPrefilledFields.add('legalForm');
    if (lookupData.bceNumber) {
      newPrefilledFields.add('bceNumber');
      // Le numéro TVA est automatiquement généré à partir du BCE
      newPrefilledFields.add('vatNumber');
      // Marquer le champ TVA comme synchronisé depuis BCE
      newSyncedFields.add('vatNumber');
    }
    if (lookupData.email) newPrefilledFields.add('email');
    if (lookupData.phoneNumber) newPrefilledFields.add('phoneNumber');
    if (lookupData.street) newPrefilledFields.add('street');
    if (lookupData.number) newPrefilledFields.add('number');
    if (lookupData.postalCode) newPrefilledFields.add('postalCode');
    if (lookupData.city) newPrefilledFields.add('city');
    if (lookupData.creationDate) newPrefilledFields.add('creationDate');

    setPrefilledFields(newPrefilledFields);
    setSyncedFields(newSyncedFields);

    // Pré-remplir les champs avec les données du lookup
    setFormData(prev => ({
      ...prev,
      name: lookupData.name || prev.name,
      companyName: lookupData.companyName || prev.companyName,
      legalForm: lookupData.legalForm || prev.legalForm,
      bceNumber: lookupData.bceNumber || prev.bceNumber,
      vatNumber: lookupData.bceNumber ? `BE${lookupData.bceNumber}` : prev.vatNumber,
      email: lookupData.email || prev.email,
      phoneNumber: lookupData.phoneNumber || prev.phoneNumber,
      address: {
        street: lookupData.street || prev.address?.street || "",
        number: lookupData.number || prev.address?.number || "",
        box: prev.address?.box || "",
        postalCode: lookupData.postalCode || prev.address?.postalCode || "",
        city: lookupData.city || prev.address?.city || "",
        country: prev.address?.country || "Belgique",
      },
      creationDate: lookupData.creationDate ? new Date(lookupData.creationDate) : prev.creationDate,
    }));

    toast.success("Données pré-remplies avec succès", {
      description: "Les informations de l'entreprise ont été mises à jour"
    });
  };

  const handleSyncField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRemoveFromPrefilled = (field: string) => {
    setPrefilledFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  };

  // Fonction utilitaire pour déterminer si un champ est prérempli
  const getInputClassName = (fieldName: string) => {
    const baseClasses = "border-slate-200 focus-visible:ring-blue-500";
    const prefilledClasses = "bg-green-50 border-green-300 focus-visible:ring-green-500";
    
    return prefilledFields.has(fieldName) 
      ? `${baseClasses} ${prefilledClasses}` 
      : baseClasses;
  };

  // Fonction utilitaire pour les Select préremplis
  const getSelectClassName = (fieldName: string) => {
    const baseClasses = "border-slate-200 focus:ring-blue-500";
    const prefilledClasses = "bg-green-50 border-green-300 focus:ring-green-500";
    
    return prefilledFields.has(fieldName) 
      ? `${baseClasses} ${prefilledClasses}` 
      : baseClasses;
  };

  const handleSubmit = async () => {
    // Validate all steps
    if (!isStep1Valid() || !isStep2Valid() || !isStep3Valid()) {
      toast.error("Veuillez corriger toutes les erreurs avant de soumettre");
      return;
    }

    if (!validation.isValid || Object.values(validation.validating).some(Boolean)) {
      toast.error("Veuillez attendre la fin de la validation");
      return;
    }

    try {
      setIsSubmitting(true);
      const company = await companyService.createCompany({
        ...formData,
        jointCommittees: Array.isArray(formData.jointCommittees) ? formData.jointCommittees : [],
      } as any);

      setCreatedCompanyId(company.id);
      setShowSuccessModal(true);
      toast.success("Entreprise créée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la création de l'entreprise");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate(ROUTES.COMPANY_DETAILS(createdCompanyId));
  };

  const handleCancel = () => {
    navigate(ROUTES.COMPANIES);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all ${
              currentStep >= step.id
                ? "bg-blue-600 text-white"
                : canProceedToStep(step.id)
                ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            onClick={() => canProceedToStep(step.id) && handleStepChange(step.id)}
          >
            {currentStep > step.id ? (
              <Check className="h-5 w-5" />
            ) : (
              <step.icon className="h-5 w-5" />
            )}
          </div>
          <div className="ml-3 hidden md:block">
            <div className={`text-sm font-medium ${
              currentStep >= step.id ? "text-blue-600" : "text-gray-500"
            }`}>
              {step.title}
            </div>
            <div className="text-xs text-gray-400">{step.description}</div>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-4 ${
              currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-blue-600" />
          Numéros d'enregistrement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required fields alert */}
        {Object.keys(errors).length > 0 && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Veuillez corriger les erreurs ci-dessous avant de continuer.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <CompanyLookupField
              type="bce"
              value={formData.bceNumber || ""}
              onChange={(value) => setFormData(prev => ({ ...prev, bceNumber: value }))}
              onDataConfirmed={handleCompanyLookupConfirmed}
              onSyncField={handleSyncField}
              onRemoveFromPrefilled={handleRemoveFromPrefilled}
              isSyncedFromOtherField={syncedFields.has('bceNumber')}
              placeholder="Ex: 0751.606.280"
              isPrefilledField={prefilledFields.has('bceNumber')}
            />
            <ValidationError 
              error={validation.errors.bceNumber} 
              isValidating={validation.validating.bceNumber}
            />
          </div>

          <div className="space-y-2">
            <CompanyLookupField
              type="vat"
              value={formData.vatNumber || ""}
              onChange={(value) => setFormData(prev => ({ ...prev, vatNumber: value }))}
              onDataConfirmed={handleCompanyLookupConfirmed}
              onSyncField={handleSyncField}
              onRemoveFromPrefilled={handleRemoveFromPrefilled}
              isSyncedFromOtherField={syncedFields.has('vatNumber')}
              placeholder="Ex: BE0751.606.280"
              isPrefilledField={prefilledFields.has('vatNumber')}
            />
            <ValidationError 
              error={validation.errors.vatNumber} 
              isValidating={validation.validating.vatNumber}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onssNumber" className="text-blue-700">
              Numéro ONSS *
            </Label>
            <Input
              id="onssNumber"
              name="onssNumber"
              value={formData.onssNumber || ""}
              onChange={handleInputChange}
              className="border-slate-200 focus-visible:ring-blue-500"
              placeholder="Ex: 1234567"
            />
            <ValidationError 
              error={validation.errors.onssNumber} 
              isValidating={validation.validating.onssNumber}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jointCommittees" className="text-blue-700">
              Commissions paritaires
            </Label>
            <Select
              value={formData.jointCommittees?.[0] || ""}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  jointCommittees: value ? [value] : [],
                }));
              }}
            >
              <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                <SelectValue placeholder="Sélectionnez une commission paritaire" />
              </SelectTrigger>
              <SelectContent>
                {JOINT_COMMITTEES.map((committee) => (
                  <SelectItem key={committee} value={committee}>
                    {committee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ValidationError error={validation.errors.jointCommittees} />
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Saisissez le numéro BCE et cliquez sur la loupe pour rechercher automatiquement les informations de l'entreprise.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Informations de base
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(errors).length > 0 && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Veuillez corriger les erreurs ci-dessous avant de continuer.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-blue-700">
              Nom de l'entreprise *
              {prefilledFields.has('name') && (
                <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
              )}
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              className={getInputClassName("name")}
              placeholder="Nom de l'entreprise"
            />
            <ValidationError error={validation.errors.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-blue-700">
              Dénomination sociale
              {prefilledFields.has('companyName') && (
                <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
              )}
            </Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName || ""}
              onChange={handleInputChange}
              className={getInputClassName("companyName")}
              placeholder="Dénomination sociale"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalForm" className="text-blue-700">
              Forme juridique *
              {prefilledFields.has('legalForm') && (
                <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
              )}
            </Label>
            <Select
              value={formData.legalForm || ""}
              onValueChange={(value) => handleSelectChange("legalForm", value)}
            >
              <SelectTrigger className={getSelectClassName("legalForm")}>
                <SelectValue placeholder="Sélectionnez une forme juridique" />
              </SelectTrigger>
              <SelectContent>
                {LEGAL_FORMS.map((form) => (
                  <SelectItem key={form} value={form}>
                    {form}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ValidationError error={validation.errors.legalForm} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activitySector" className="text-blue-700">
              Secteur d'activité *
            </Label>
            <Select
              value={formData.activitySector || ""}
              onValueChange={(value) => handleSelectChange("activitySector", value)}
            >
              <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                <SelectValue placeholder="Sélectionnez un secteur d'activité" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ValidationError error={validation.errors.activitySector} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-blue-700">
              Catégorie
            </Label>
            <Select
              value={formData.category || ""}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creationDate" className="text-blue-700">
              Date de création
              {prefilledFields.has('creationDate') && (
                <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
              )}
            </Label>
            <Input
              id="creationDate"
              name="creationDate"
              type="date"
              value={
                formData.creationDate
                  ? new Date(formData.creationDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleInputChange}
              className={getInputClassName("creationDate")}
            />
            <ValidationError error={validation.errors.creationDate} />
          </div>
        </div>

        {prefilledFields.size > 0 && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Les champs avec un fond vert ont été pré-remplis automatiquement grâce à la recherche dans la Banque Carrefour. Vous pouvez les modifier si nécessaire.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Coordonnées et adresse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(errors).length > 0 && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Veuillez corriger les erreurs ci-dessous avant de continuer.
            </AlertDescription>
          </Alert>
        )}

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-700">Contact</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-700">
                Email *
                {prefilledFields.has('email') && (
                  <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
                )}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className={getInputClassName("email")}
                placeholder="contact@entreprise.be"
              />
              <ValidationError error={validation.errors.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-blue-700">
                Numéro de téléphone
                {prefilledFields.has('phoneNumber') && (
                  <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
                )}
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleInputChange}
                className={getInputClassName("phoneNumber")}
                placeholder="+32 2 123 45 67"
              />
              <ValidationError error={validation.errors.phoneNumber} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban" className="text-blue-700">
                IBAN
              </Label>
              <Input
                id="iban"
                name="iban"
                value={formData.iban || ""}
                onChange={handleInputChange}
                className="border-slate-200 focus-visible:ring-blue-500"
                placeholder="BE68 5390 0754 7034"
              />
              <ValidationError error={validation.errors.iban} />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-700">Adresse</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="street" className="text-blue-700">
                Rue
                {prefilledFields.has('street') && (
                  <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
                )}
              </Label>
              <Input
                id="street"
                name="street"
                value={formData.address?.street || ""}
                onChange={handleAddressChange}
                className={getInputClassName("street")}
                placeholder="Rue de la Paix"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number" className="text-blue-700">
                Numéro
                {prefilledFields.has('number') && (
                  <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
                )}
              </Label>
              <Input
                id="number"
                name="number"
                value={formData.address?.number || ""}
                onChange={handleAddressChange}
                className={getInputClassName("number")}
                placeholder="123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="box" className="text-blue-700">
                Boîte (optionnel)
              </Label>
              <Input
                id="box"
                name="box"
                value={formData.address?.box || ""}
                onChange={handleAddressChange}
                className="border-slate-200 focus-visible:ring-blue-500"
                placeholder="A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-blue-700">
                Code postal
                {prefilledFields.has('postalCode') && (
                  <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
                )}
              </Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.address?.postalCode || ""}
                onChange={handleAddressChange}
                className={getInputClassName("postalCode")}
                placeholder="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-blue-700">
                Ville
                {prefilledFields.has('city') && (
                  <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
                )}
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.address?.city || ""}
                onChange={handleAddressChange}
                className={getInputClassName("city")}
                placeholder="Bruxelles"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-blue-700">
                Pays
              </Label>
              <Input
                id="country"
                name="country"
                value={formData.address?.country || ""}
                onChange={handleAddressChange}
                className="border-slate-200 focus-visible:ring-blue-500"
                placeholder="Belgique"
              />
            </div>
          </div>
        </div>

        {prefilledFields.size > 0 && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Les champs avec un fond vert ont été pré-remplis automatiquement grâce à la recherche dans la Banque Carrefour. Vous pouvez les modifier si nécessaire.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Paramètres de collaboration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="collaborationStartDate" className="text-blue-700">
              Date de début de collaboration
            </Label>
            <Input
              id="collaborationStartDate"
              name="collaborationStartDate"
              type="date"
              value={
                formData.collaborationStartDate
                  ? new Date(formData.collaborationStartDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleInputChange}
              className="border-slate-200 focus-visible:ring-blue-500"
            />
            <ValidationError error={validation.errors.collaborationStartDate} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscriptionFormula" className="text-blue-700">
              Formule d'abonnement
            </Label>
            <Select
              value={formData.subscriptionFormula || ""}
              onValueChange={(value) => handleSelectChange("subscriptionFormula", value)}
            >
              <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                <SelectValue placeholder="Sélectionnez une formule d'abonnement" />
              </SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_FORMULAS.map((formula) => (
                  <SelectItem key={formula} value={formula}>
                    {formula}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="declarationFrequency" className="text-blue-700">
              Fréquence de déclaration
            </Label>
            <Select
              value={formData.declarationFrequency || ""}
              onValueChange={(value) => handleSelectChange("declarationFrequency", value)}
            >
              <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                <SelectValue placeholder="Sélectionnez une fréquence de déclaration" />
              </SelectTrigger>
              <SelectContent>
                {DECLARATION_FREQUENCIES.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {frequency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workRegime" className="text-blue-700">
              Régime de travail
            </Label>
            <Select
              value={formData.workRegime || ""}
              onValueChange={(value) => handleSelectChange("workRegime", value)}
            >
              <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                <SelectValue placeholder="Sélectionnez un régime de travail" />
              </SelectTrigger>
              <SelectContent>
                {WORK_REGIMES.map((regime) => (
                  <SelectItem key={regime} value={regime}>
                    {regime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workCalendar" className="text-blue-700">
              Calendrier de travail
            </Label>
            <Input
              id="workCalendar"
              name="workCalendar"
              value={formData.workCalendar || ""}
              onChange={handleInputChange}
              className="border-slate-200 focus-visible:ring-blue-500"
              placeholder="Calendrier de travail"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryReduction" className="text-blue-700">
              Réduction salariale
            </Label>
            <Input
              id="salaryReduction"
              name="salaryReduction"
              value={formData.salaryReduction || ""}
              onChange={handleInputChange}
              className="border-slate-200 focus-visible:ring-blue-500"
              placeholder="Réduction salariale"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityFund" className="text-blue-700">
              Fonds de sécurité
            </Label>
            <Input
              id="securityFund"
              name="securityFund"
              value={formData.securityFund || ""}
              onChange={handleInputChange}
              className="border-slate-200 focus-visible:ring-blue-500"
              placeholder="Fonds de sécurité"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workAccidentInsurance" className="text-blue-700">
              Assurance accidents du travail
            </Label>
            <Input
              id="workAccidentInsurance"
              name="workAccidentInsurance"
              value={formData.workAccidentInsurance || ""}
              onChange={handleInputChange}
              className="border-slate-200 focus-visible:ring-blue-500"
              placeholder="Assurance accidents du travail"
            />
          </div>
        </div>

        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Toutes les informations sont maintenant complètes. Vous pouvez créer l'entreprise.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer une entreprise"
        description="Processus en 4 étapes pour ajouter une nouvelle entreprise"
      />

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Annuler
        </Button>

        <div className="flex gap-4">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              Précédent
            </Button>
          )}

          {currentStep < steps.length ? (
            <Button 
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
            >
              Suivant
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !isStep1Valid() || !isStep2Valid() || !isStep3Valid()}
            >
              {isSubmitting ? "Création en cours..." : "Créer l'entreprise"}
            </Button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Entreprise créée avec succès !
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              L'entreprise a été ajoutée au système avec succès. Vous allez être redirigé vers sa page de détails.
            </p>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Vous pouvez maintenant consulter et modifier les informations de l'entreprise si nécessaire.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSuccessModalClose}>
                Voir l'entreprise
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

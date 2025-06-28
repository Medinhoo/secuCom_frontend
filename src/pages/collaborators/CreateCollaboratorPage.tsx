import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Briefcase, MapPin, CreditCard, Check, AlertCircle, CheckCircle } from "lucide-react";
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
import {
  CollaboratorType,
  WorkDurationType,
  Day,
} from "@/types/CollaboratorTypes";
import { collaboratorService } from "@/services/api/collaboratorService";
import { companyService } from "@/services/api/companyService";
import { CompanyDto } from "@/types/CompanyTypes";
import { ROUTES } from "@/config/routes.config";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface FormErrors {
  [key: string]: string;
}

// Utility functions for national number handling
const formatNationalNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply formatting: xx.xx.xx-xxx.xx
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 6) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  if (digits.length <= 9) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 6)}-${digits.slice(6, 9)}.${digits.slice(9, 11)}`;
};

const extractBirthDateFromNationalNumber = (nationalNumber: string): string | null => {
  // Remove formatting to get just digits
  const digits = nationalNumber.replace(/\D/g, '');
  
  if (digits.length < 6) return null;
  
  const year = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const day = digits.slice(4, 6);
  
  // Convert 2-digit year to 4-digit year
  // Belgian national numbers: if year >= 00 and <= current year's last 2 digits, it's 20xx
  // Otherwise it's 19xx
  const currentYear = new Date().getFullYear();
  const currentYearLastTwoDigits = currentYear % 100;
  const yearNum = parseInt(year, 10);
  
  let fullYear: number;
  if (yearNum <= currentYearLastTwoDigits) {
    fullYear = 2000 + yearNum;
  } else {
    fullYear = 1900 + yearNum;
  }
  
  // Validate month and day
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);
  
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
    return null;
  }
  
  // Create date and validate it exists (handles leap years, etc.)
  const date = new Date(fullYear, monthNum - 1, dayNum);
  if (date.getFullYear() !== fullYear || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
    return null;
  }
  
  // Return in YYYY-MM-DD format for HTML date input
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const validateNationalNumberWithBirthDate = (nationalNumber: string, birthDate: string): boolean => {
  if (!nationalNumber || !birthDate) return true; // Skip validation if either is empty
  
  const extractedDate = extractBirthDateFromNationalNumber(nationalNumber);
  if (!extractedDate) return true; // Skip validation if national number is invalid
  
  return extractedDate === birthDate;
};

const validateIban = (iban: string): string | undefined => {
  if (!iban) return undefined;
  const ibanRegex = /^BE\d{14}$/;
  if (!ibanRegex.test(iban.replace(/\s/g, ''))) {
    return 'Format IBAN belge invalide (ex: BE12 3456 7890 1234)';
  }
  return undefined;
};

export function CreateCollaboratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCollaboratorId, setCreatedCollaboratorId] = useState<string>("");

  // Steps configuration
  const steps = [
    { id: 1, title: "Informations personnelles", icon: User, description: "Identité et état civil" },
    { id: 2, title: "Informations professionnelles", icon: Briefcase, description: "Poste et entreprise" },
    { id: 3, title: "Adresses", icon: MapPin, description: "Domicile et lieu de travail" },
    { id: 4, title: "Informations financières", icon: CreditCard, description: "Salaire et compte bancaire" },
  ];

  // Personal Information
  const [gender, setGender] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [civilStatusDate, setCivilStatusDate] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [dependents, setDependents] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [nationality, setNationality] = useState("");
  const [language, setLanguage] = useState("");

  // Contact Information
  const [nationalNumber, setNationalNumber] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [box, setBox] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  // Professional Details
  const [type, setType] = useState<CollaboratorType>(CollaboratorType.EMPLOYEE);
  const [workDurationType, setWorkDurationType] = useState<WorkDurationType>(
    WorkDurationType.FIXED
  );
  const [taskDescription, setTaskDescription] = useState("");
  const [extraLegalBenefits, setExtraLegalBenefits] = useState<string[]>([]);
  const [contractType, setContractType] = useState("");
  const [typicalSchedule, setTypicalSchedule] = useState<Record<Day, string>>({
    [Day.MONDAY]: "",
    [Day.TUESDAY]: "",
    [Day.WEDNESDAY]: "",
    [Day.THURSDAY]: "",
    [Day.FRIDAY]: "",
    [Day.SATURDAY]: "",
    [Day.SUNDAY]: "",
  });

  // Establishment Unit Address
  const [establishmentStreet, setEstablishmentStreet] = useState("");
  const [establishmentNumber, setEstablishmentNumber] = useState("");
  const [establishmentBox, setEstablishmentBox] = useState("");
  const [establishmentPostalCode, setEstablishmentPostalCode] = useState("");
  const [establishmentCity, setEstablishmentCity] = useState("");
  const [establishmentCountry, setEstablishmentCountry] = useState("");
  const [jobFunction, setJobFunction] = useState("");
  const [workRegime, setWorkRegime] = useState("");
  const [serviceEntryDate, setServiceEntryDate] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Financial Information
  const [salary, setSalary] = useState("");
  const [iban, setIban] = useState("");
  const [jointCommittee, setJointCommittee] = useState("");

  // Reset dependent fields when parent field changes
  useEffect(() => {
    if (civilStatus === "SINGLE") {
      setCivilStatusDate("");
      setPartnerName("");
      setPartnerBirthDate("");
    }
  }, [civilStatus]);

  useEffect(() => {
    if (workDurationType === WorkDurationType.VARIABLE) {
      setTypicalSchedule({
        [Day.MONDAY]: "",
        [Day.TUESDAY]: "",
        [Day.WEDNESDAY]: "",
        [Day.THURSDAY]: "",
        [Day.FRIDAY]: "",
        [Day.SATURDAY]: "",
        [Day.SUNDAY]: "",
      });
    }
  }, [workDurationType]);

  // Pre-fill company if user has one
  useEffect(() => {
    if (user?.companyId && !companyId) {
      setCompanyId(user.companyId);
    }
  }, [user, companyId]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyService.getAllCompanies();
        setCompanies(response || []);
        
        // If user has a company, pre-select it
        if (user?.companyId && !companyId) {
          setCompanyId(user.companyId);
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des entreprises");
        console.error(error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [user]);

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!nationalNumber.trim()) {
      newErrors.nationalNumber = "Le numéro national est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!jobFunction.trim()) {
      newErrors.jobFunction = "La fonction est requise";
    }

    if (!serviceEntryDate) {
      newErrors.serviceEntryDate = "La date d'entrée en service est requise";
    }

    if (!companyId) {
      newErrors.companyId = "L'entreprise est requise";
    }

    if (!type) {
      newErrors.type = "Le type de collaborateur est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    // Step 3 has no required fields, always valid
    setErrors({});
    return true;
  };

  const validateStep4 = (): boolean => {
    // Step 4 has no required fields, always valid
    setErrors({});
    return true;
  };

  // Step validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(firstName && lastName && nationalNumber);
      case 2:
        return !!(jobFunction && serviceEntryDate && companyId && type);
      case 3:
        return true; // No required fields
      case 4:
        return true; // No required fields
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
      let isValid = false;
      switch (currentStep) {
        case 1:
          isValid = validateStep1();
          break;
        case 2:
          isValid = validateStep2();
          break;
        case 3:
          isValid = validateStep3();
          break;
        case 4:
          isValid = validateStep4();
          break;
        default:
          isValid = true;
      }
      
      if (!isValid) {
        toast.error("Veuillez corriger les erreurs avant de continuer");
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

  const handleSubmit = async () => {
    // Validate all steps
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) {
      toast.error("Veuillez corriger toutes les erreurs avant de soumettre");
      return;
    }

    try {
      setIsSubmitting(true);
      const collaborator = await collaboratorService.createCollaborator({
        gender,
        civilStatus,
        civilStatusDate: civilStatus !== "SINGLE" ? civilStatusDate : undefined,
        partnerName: civilStatus !== "SINGLE" ? partnerName : undefined,
        partnerBirthDate:
          civilStatus !== "SINGLE" ? partnerBirthDate : undefined,
        dependents,
        firstName,
        lastName,
        birthDate,
        birthPlace,
        nationality,
        language,
        nationalNumber,
        address: {
          street,
          number,
          box,
          postalCode,
          city,
          country,
        },
        type,
        jobFunction,
        workRegime,
        serviceEntryDate,
        companyId,
        workDurationType,
        taskDescription,
        extraLegalBenefits,
        contractType,
        typicalSchedule:
          workDurationType === WorkDurationType.FIXED
            ? typicalSchedule
            : undefined,
        establishmentUnitAddress: {
          street: establishmentStreet,
          number: establishmentNumber,
          box: establishmentBox,
          postalCode: establishmentPostalCode,
          city: establishmentCity,
          country: establishmentCountry,
        },
        salary: salary ? parseFloat(salary) : undefined,
        iban,
        jointCommittee,
      });

      setCreatedCollaboratorId(collaborator.id);
      setShowSuccessModal(true);
      toast.success("Collaborateur créé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la création du collaborateur");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate(ROUTES.COLLABORATOR_DETAILS(createdCollaboratorId));
  };

  // National number and birth date handlers
  const handleNationalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNationalNumber(e.target.value);
    setNationalNumber(formatted);
    
    // Clear validation errors when typing
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.nationalNumber;
      delete newErrors.birthDate; // Also clear birth date errors when national number changes
      return newErrors;
    });
    
    // Auto-fill birth date if national number is complete and birth date is empty
    if (formatted.length === 15 && !birthDate) { // Full format: XX.XX.XX-XXX.XX
      const extractedDate = extractBirthDateFromNationalNumber(formatted);
      if (extractedDate) {
        setBirthDate(extractedDate);
        toast.success("Date de naissance remplie automatiquement à partir du numéro national");
      }
    }
    
    // Re-validate coherence if birth date is already filled
    if (formatted.length === 15 && birthDate) {
      const isCoherent = validateNationalNumberWithBirthDate(formatted, birthDate);
      if (!isCoherent) {
        setErrors(prev => ({ 
          ...prev, 
          birthDate: "La date de naissance ne correspond pas au numéro national" 
        }));
      }
    }
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBirthDate = e.target.value;
    setBirthDate(newBirthDate);
    
    // Clear any existing birth date error first
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.birthDate;
      return newErrors;
    });
    
    // Validate coherence with national number if both are filled
    if (nationalNumber && newBirthDate) {
      const isCoherent = validateNationalNumberWithBirthDate(nationalNumber, newBirthDate);
      if (!isCoherent) {
        setErrors(prev => ({ 
          ...prev, 
          birthDate: "La date de naissance ne correspond pas au numéro national" 
        }));
        toast.error("La date de naissance ne correspond pas au numéro national");
      }
    }
  };

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIban = e.target.value;
    setIban(newIban);
    
    // Clear any existing IBAN error first
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.iban;
      return newErrors;
    });
    
    // Validate IBAN format if not empty
    if (newIban) {
      const ibanError = validateIban(newIban);
      if (ibanError) {
        setErrors(prev => ({ 
          ...prev, 
          iban: ibanError 
        }));
      }
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.COLLABORATORS);
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
          <User className="h-5 w-5 text-blue-600" />
          Informations personnelles
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="lastName" className="block">Nom *</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`bg-white ${errors.lastName ? "border-red-500" : ""}`}
              placeholder="Nom de famille"
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="firstName" className="block">Prénom *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`bg-white ${errors.firstName ? "border-red-500" : ""}`}
              placeholder="Prénom"
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="nationalNumber" className="block">Numéro national *</Label>
            <Input
              id="nationalNumber"
              value={nationalNumber}
              onChange={handleNationalNumberChange}
              className={`bg-white ${errors.nationalNumber ? "border-red-500" : ""}`}
              placeholder="XX.XX.XX-XXX.XX"
              maxLength={15}
            />
            {errors.nationalNumber && (
              <p className="text-sm text-red-500">{errors.nationalNumber}</p>
            )}
            <p className="text-xs text-gray-500">
              Le format sera automatiquement appliqué pendant la saisie
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="birthDate" className="block">
              Date de naissance
              {birthDate && nationalNumber && (
                <Badge variant="secondary" className="ml-2">Auto-rempli</Badge>
              )}
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={handleBirthDateChange}
              className={`bg-white ${errors.birthDate ? "border-red-500" : ""}`}
            />
            {errors.birthDate && (
              <p className="text-sm text-red-500">{errors.birthDate}</p>
            )}
            {birthDate && nationalNumber && validateNationalNumberWithBirthDate(nationalNumber, birthDate) && (
              <p className="text-xs text-green-600">
                ✓ Date cohérente avec le numéro national
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="birthPlace" className="block">Lieu de naissance</Label>
            <Input
              id="birthPlace"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              className="bg-white"
              placeholder="Ville, Pays"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="gender" className="block">Genre</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Sélectionnez un genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculin</SelectItem>
                <SelectItem value="F">Féminin</SelectItem>
                <SelectItem value="X">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="nationality" className="block">Nationalité</Label>
            <Input
              id="nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="bg-white"
              placeholder="Belge, Française, etc."
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="language" className="block">Langue</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Sélectionnez une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="nl">Néerlandais</SelectItem>
                <SelectItem value="en">Anglais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="civilStatus" className="block">État civil</Label>
            <Select value={civilStatus} onValueChange={setCivilStatus}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Sélectionnez l'état civil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE">Célibataire</SelectItem>
                <SelectItem value="MARRIED">Marié(e)</SelectItem>
                <SelectItem value="DIVORCED">Divorcé(e)</SelectItem>
                <SelectItem value="WIDOWED">Veuf/Veuve</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {civilStatus && civilStatus !== "SINGLE" && (
            <>
              <div className="space-y-3">
                <Label htmlFor="civilStatusDate" className="block">Date de l'état civil</Label>
                <Input
                  id="civilStatusDate"
                  type="date"
                  value={civilStatusDate}
                  onChange={(e) => setCivilStatusDate(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="partnerName" className="block">Nom du partenaire</Label>
                <Input
                  id="partnerName"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="bg-white"
                  placeholder="Nom complet du partenaire"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="partnerBirthDate" className="block">Date de naissance du partenaire</Label>
                <Input
                  id="partnerBirthDate"
                  type="date"
                  value={partnerBirthDate}
                  onChange={(e) => setPartnerBirthDate(e.target.value)}
                  className="bg-white"
                />
              </div>
            </>
          )}
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Les champs marqués d'un astérisque (*) sont obligatoires pour continuer.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          Informations professionnelles
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

        {/* Pre-filled company info */}
        {user?.companyId && user?.companyName && (
          <Alert className="bg-blue-50 border-blue-200 mb-6">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Le collaborateur sera automatiquement assigné à votre entreprise : <strong>{user.companyName}</strong>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="companyId" className="block">
              Entreprise * 
              {user?.companyId && (
                <Badge variant="secondary" className="ml-2">Pré-rempli</Badge>
              )}
            </Label>
            <Select
              value={companyId}
              onValueChange={setCompanyId}
              disabled={loadingCompanies || !!user?.companyId}
            >
              <SelectTrigger className={`${user?.companyId ? "bg-gray-50" : "bg-white"} ${errors.companyId ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Sélectionnez une entreprise" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingCompanies && (
              <p className="text-sm text-slate-500">Chargement des entreprises...</p>
            )}
            {user?.companyId && (
              <p className="text-sm text-blue-600">Entreprise automatiquement sélectionnée</p>
            )}
            {errors.companyId && (
              <p className="text-sm text-red-500">{errors.companyId}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="type" className="block">Type de collaborateur *</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as CollaboratorType)}
            >
              <SelectTrigger className={`bg-white ${errors.type ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CollaboratorType.EMPLOYEE}>Employé</SelectItem>
                <SelectItem value={CollaboratorType.WORKER}>Ouvrier</SelectItem>
                <SelectItem value={CollaboratorType.FREELANCE}>Indépendant</SelectItem>
                <SelectItem value={CollaboratorType.INTERN}>Stagiaire</SelectItem>
                <SelectItem value={CollaboratorType.STUDENT}>Étudiant</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="jobFunction" className="block">Fonction *</Label>
            <Input
              id="jobFunction"
              value={jobFunction}
              onChange={(e) => setJobFunction(e.target.value)}
              className={`bg-white ${errors.jobFunction ? "border-red-500" : ""}`}
              placeholder="Titre du poste"
            />
            {errors.jobFunction && (
              <p className="text-sm text-red-500">{errors.jobFunction}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="serviceEntryDate" className="block">Date d'entrée en service *</Label>
            <Input
              id="serviceEntryDate"
              type="date"
              value={serviceEntryDate}
              onChange={(e) => setServiceEntryDate(e.target.value)}
              className={`bg-white ${errors.serviceEntryDate ? "border-red-500" : ""}`}
            />
            {errors.serviceEntryDate && (
              <p className="text-sm text-red-500">{errors.serviceEntryDate}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="contractType" className="block">Type de contrat</Label>
            <Select value={contractType} onValueChange={setContractType}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Sélectionnez le type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
                <SelectItem value="INTERIM">Intérim</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="workRegime" className="block">Régime de travail</Label>
            <Select value={workRegime} onValueChange={setWorkRegime}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Sélectionnez le régime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_TIME">Temps plein</SelectItem>
                <SelectItem value="PART_TIME">Temps partiel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="workDurationType" className="block">Type d'horaire</Label>
            <Select
              value={workDurationType}
              onValueChange={(value) => setWorkDurationType(value as WorkDurationType)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Sélectionnez le type d'horaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WorkDurationType.FIXED}>Fixe</SelectItem>
                <SelectItem value={WorkDurationType.VARIABLE}>Variable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="taskDescription" className="block">Description des tâches</Label>
            <Input
              id="taskDescription"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="bg-white"
              placeholder="Description du poste"
            />
          </div>
        </div>

        {workDurationType === WorkDurationType.FIXED && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Horaire type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.values(Day).map((day) => (
                <div key={day} className="space-y-2">
                  <Label htmlFor={`schedule-${day}`} className="text-sm">
                    {day === "MONDAY" ? "Lundi" :
                     day === "TUESDAY" ? "Mardi" :
                     day === "WEDNESDAY" ? "Mercredi" :
                     day === "THURSDAY" ? "Jeudi" :
                     day === "FRIDAY" ? "Vendredi" :
                     day === "SATURDAY" ? "Samedi" : "Dimanche"}
                  </Label>
                  <Input
                    id={`schedule-${day}`}
                    value={typicalSchedule[day]}
                    onChange={(e) =>
                      setTypicalSchedule({
                        ...typicalSchedule,
                        [day]: e.target.value,
                      })
                    }
                    placeholder="9:00-17:00"
                    className="bg-white text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Adresse personnelle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="street" className="block">Rue</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="bg-white"
                placeholder="Nom de la rue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="number" className="block">Numéro</Label>
                <Input
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="bg-white"
                  placeholder="123"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="box" className="block">Boîte</Label>
                <Input
                  id="box"
                  value={box}
                  onChange={(e) => setBox(e.target.value)}
                  className="bg-white"
                  placeholder="A"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="postalCode" className="block">Code postal</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="bg-white"
                placeholder="1000"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="city" className="block">Ville</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-white"
                placeholder="Bruxelles"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="country" className="block">Pays</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-white"
                placeholder="Belgique"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Adresse de l'unité d'établissement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="establishmentStreet" className="block">Rue</Label>
              <Input
                id="establishmentStreet"
                value={establishmentStreet}
                onChange={(e) => setEstablishmentStreet(e.target.value)}
                className="bg-white"
                placeholder="Nom de la rue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="establishmentNumber" className="block">Numéro</Label>
                <Input
                  id="establishmentNumber"
                  value={establishmentNumber}
                  onChange={(e) => setEstablishmentNumber(e.target.value)}
                  className="bg-white"
                  placeholder="123"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="establishmentBox" className="block">Boîte</Label>
                <Input
                  id="establishmentBox"
                  value={establishmentBox}
                  onChange={(e) => setEstablishmentBox(e.target.value)}
                  className="bg-white"
                  placeholder="A"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="establishmentPostalCode" className="block">Code postal</Label>
              <Input
                id="establishmentPostalCode"
                value={establishmentPostalCode}
                onChange={(e) => setEstablishmentPostalCode(e.target.value)}
                className="bg-white"
                placeholder="1000"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="establishmentCity" className="block">Ville</Label>
              <Input
                id="establishmentCity"
                value={establishmentCity}
                onChange={(e) => setEstablishmentCity(e.target.value)}
                className="bg-white"
                placeholder="Bruxelles"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="establishmentCountry" className="block">Pays</Label>
              <Input
                id="establishmentCountry"
                value={establishmentCountry}
                onChange={(e) => setEstablishmentCountry(e.target.value)}
                className="bg-white"
                placeholder="Belgique"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Informations financières
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="salary" className="block">Salaire</Label>
            <Input
              id="salary"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="bg-white"
              placeholder="2500.00"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="iban" className="block">IBAN</Label>
            <Input
              id="iban"
              value={iban}
              onChange={handleIbanChange}
              className={`bg-white ${errors.iban ? "border-red-500" : ""}`}
              placeholder="BE68 5390 0754 7034"
            />
            {errors.iban && (
              <p className="text-sm text-red-500">{errors.iban}</p>
            )}
            <p className="text-xs text-gray-500">
              Format belge requis (ex: BE12 3456 7890 1234)
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="jointCommittee" className="block">Commission paritaire</Label>
            <Input
              id="jointCommittee"
              value={jointCommittee}
              onChange={(e) => setJointCommittee(e.target.value)}
              className="bg-white"
              placeholder="CP 200"
            />
          </div>
        </div>

        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Toutes les informations sont maintenant complètes. Vous pouvez créer le collaborateur.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer un collaborateur"
        description="Processus en 4 étapes pour ajouter un nouveau collaborateur"
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
              disabled={isSubmitting || !isStepValid(1) || !isStepValid(2)}
            >
              {isSubmitting ? "Création en cours..." : "Créer le collaborateur"}
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
              Collaborateur créé avec succès !
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Le collaborateur a été ajouté au système avec succès. Vous allez être redirigé vers sa page de détails.
            </p>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Vous pouvez maintenant consulter et modifier les informations du collaborateur si nécessaire.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSuccessModalClose}>
                Voir le collaborateur
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

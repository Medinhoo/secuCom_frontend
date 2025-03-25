import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function CreateCollaboratorPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form step tracking
  const [currentTab, setCurrentTab] = useState("personal");
  const tabs = ["personal", "professional", "contact", "financial"];

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

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await companyService.getAllCompanies();
        setCompanies(response || []);
      } catch (error) {
        toast.error("Erreur lors du chargement des entreprises");
        console.error(error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Step validation
  const isPersonalStepValid = useMemo(() => {
    return firstName && lastName;
  }, [firstName, lastName]);

  const isProfessionalStepValid = useMemo(() => {
    return jobFunction && serviceEntryDate && companyId && type;
  }, [jobFunction, serviceEntryDate, companyId, type]);

  const isContactStepValid = useMemo(() => {
    return nationalNumber;
  }, [nationalNumber]);

  const canProceedToNextStep = () => {
    switch (currentTab) {
      case "personal":
        return isPersonalStepValid;
      case "professional":
        return isProfessionalStepValid;
      case "contact":
        return isContactStepValid;
      default:
        return true;
    }
  };

  const handleTabChange = (tab: string) => {
    const currentIndex = tabs.indexOf(currentTab);
    const targetIndex = tabs.indexOf(tab);

    if (targetIndex > currentIndex) {
      // Moving forward - check if all previous steps are valid
      for (let i = 0; i <= targetIndex - 1; i++) {
        switch (tabs[i]) {
          case "personal":
            if (!isPersonalStepValid) return;
            break;
          case "professional":
            if (!isProfessionalStepValid) return;
            break;
          case "contact":
            if (!isContactStepValid) return;
            break;
        }
      }
    }
    setCurrentTab(tab);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all steps are valid
    if (
      !isPersonalStepValid ||
      !isProfessionalStepValid ||
      !isContactStepValid
    ) {
      toast.error(
        "Veuillez remplir tous les champs obligatoires de chaque étape"
      );
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

      toast.success("Collaborateur créé avec succès");
      navigate(ROUTES.COLLABORATOR_DETAILS(collaborator.id));
    } catch (error) {
      toast.error("Erreur lors de la création du collaborateur");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-blue-700">
          Ajouter un collaborateur
        </h1>
        <p className="text-slate-500">
          Remplissez les informations du nouveau collaborateur
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs
          value={currentTab}
          className="space-y-4"
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="personal">
              Informations personnelles
            </TabsTrigger>
            <TabsTrigger value="professional">
              Informations professionnelles
            </TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="financial">
              Informations financières
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            {!isPersonalStepValid && (
              <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
                Veuillez remplir tous les champs obligatoires avant de passer à
                l'étape suivante
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace">Lieu de naissance</Label>
                    <Input
                      id="birthPlace"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Genre</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationalité</Label>
                    <Input
                      id="nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="civilStatus">État civil</Label>
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
                      <div className="space-y-2">
                        <Label htmlFor="civilStatusDate">
                          Date de l'état civil
                        </Label>
                        <Input
                          id="civilStatusDate"
                          type="date"
                          value={civilStatusDate}
                          onChange={(e) => setCivilStatusDate(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="partnerName">Nom du partenaire</Label>
                        <Input
                          id="partnerName"
                          value={partnerName}
                          onChange={(e) => setPartnerName(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="partnerBirthDate">
                          Date de naissance du partenaire
                        </Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional">
            {!isProfessionalStepValid && (
              <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
                Veuillez remplir tous les champs obligatoires avant de passer à
                l'étape suivante
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Informations professionnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type de collaborateur *</Label>
                    <Select
                      value={type}
                      onValueChange={(value) =>
                        setType(value as CollaboratorType)
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CollaboratorType.EMPLOYEE}>
                          Employé
                        </SelectItem>
                        <SelectItem value={CollaboratorType.WORKER}>
                          Ouvrier
                        </SelectItem>
                        <SelectItem value={CollaboratorType.FREELANCE}>
                          Indépendant
                        </SelectItem>
                        <SelectItem value={CollaboratorType.INTERN}>
                          Stagiaire
                        </SelectItem>
                        <SelectItem value={CollaboratorType.STUDENT}>
                          Étudiant
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobFunction">Fonction *</Label>
                    <Input
                      id="jobFunction"
                      value={jobFunction}
                      onChange={(e) => setJobFunction(e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceEntryDate">
                      Date d'entrée en service *
                    </Label>
                    <Input
                      id="serviceEntryDate"
                      type="date"
                      value={serviceEntryDate}
                      onChange={(e) => setServiceEntryDate(e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Type de contrat</Label>
                    <Select
                      value={contractType}
                      onValueChange={setContractType}
                    >
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
                  <div className="space-y-2">
                    <Label htmlFor="workRegime">Régime de travail</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="workDurationType">Type d'horaire</Label>
                    <Select
                      value={workDurationType}
                      onValueChange={(value) =>
                        setWorkDurationType(value as WorkDurationType)
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Sélectionnez le type d'horaire" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={WorkDurationType.FIXED}>
                          Fixe
                        </SelectItem>
                        <SelectItem value={WorkDurationType.VARIABLE}>
                          Variable
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskDescription">
                      Description des tâches
                    </Label>
                    <Input
                      id="taskDescription"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  {workDurationType === WorkDurationType.FIXED && (
                    <div className="col-span-2">
                      <Label>Horaire type</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        {Object.values(Day).map((day) => (
                          <div key={day} className="space-y-2">
                            <Label htmlFor={`schedule-${day}`}>
                              {day === "MONDAY"
                                ? "Lundi"
                                : day === "TUESDAY"
                                ? "Mardi"
                                : day === "WEDNESDAY"
                                ? "Mercredi"
                                : day === "THURSDAY"
                                ? "Jeudi"
                                : day === "FRIDAY"
                                ? "Vendredi"
                                : day === "SATURDAY"
                                ? "Samedi"
                                : "Dimanche"}
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
                              placeholder="ex: 9:00-17:00"
                              className="bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="companyId">Entreprise *</Label>
                    <Select
                      value={companyId}
                      onValueChange={setCompanyId}
                      disabled={loadingCompanies}
                    >
                      <SelectTrigger className="bg-white">
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
                      <p className="text-sm text-slate-500">
                        Chargement des entreprises...
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            {!isContactStepValid && (
              <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
                Veuillez remplir tous les champs obligatoires avant de passer à
                l'étape suivante
              </div>
            )}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nationalNumber">Numéro national *</Label>
                      <Input
                        id="nationalNumber"
                        value={nationalNumber}
                        onChange={(e) => setNationalNumber(e.target.value)}
                        className="bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street">Rue</Label>
                      <Input
                        id="street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="number">Numéro</Label>
                        <Input
                          id="number"
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="box">Boîte</Label>
                        <Input
                          id="box"
                          value={box}
                          onChange={(e) => setBox(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Adresse de l'unité d'établissement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="establishmentStreet">Rue</Label>
                      <Input
                        id="establishmentStreet"
                        value={establishmentStreet}
                        onChange={(e) => setEstablishmentStreet(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="establishmentNumber">Numéro</Label>
                        <Input
                          id="establishmentNumber"
                          value={establishmentNumber}
                          onChange={(e) =>
                            setEstablishmentNumber(e.target.value)
                          }
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="establishmentBox">Boîte</Label>
                        <Input
                          id="establishmentBox"
                          value={establishmentBox}
                          onChange={(e) => setEstablishmentBox(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="establishmentPostalCode">
                        Code postal
                      </Label>
                      <Input
                        id="establishmentPostalCode"
                        value={establishmentPostalCode}
                        onChange={(e) =>
                          setEstablishmentPostalCode(e.target.value)
                        }
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="establishmentCity">Ville</Label>
                      <Input
                        id="establishmentCity"
                        value={establishmentCity}
                        onChange={(e) => setEstablishmentCity(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="establishmentCountry">Pays</Label>
                      <Input
                        id="establishmentCountry"
                        value={establishmentCountry}
                        onChange={(e) =>
                          setEstablishmentCountry(e.target.value)
                        }
                        className="bg-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Informations financières</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salaire</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jointCommittee">Commission paritaire</Label>
                    <Input
                      id="jointCommittee"
                      value={jointCommittee}
                      onChange={(e) => setJointCommittee(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.COLLABORATORS)}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              currentTab !== "financial" ||
              !isPersonalStepValid ||
              !isProfessionalStepValid ||
              !isContactStepValid
            }
          >
            {isSubmitting ? "Création en cours..." : "Créer le collaborateur"}
          </Button>
        </div>
      </form>
    </div>
  );
}

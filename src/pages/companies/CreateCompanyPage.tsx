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
import { companyService } from "@/services/api/companyService";
import { ROUTES } from "@/config/routes.config";
import { toast } from "sonner";

const ACTIVITY_SECTORS = [
  "Construction",
  "Transport",
  "Horeca",
  "Commerce",
  "Services",
];

const LEGAL_FORMS = [
  "SA",
  "SRL",
  "SPRL",
  "SC",
  "SNC",
  "SCS",
  "ASBL",
  "Indépendant",
];

const SUBSCRIPTION_FORMULAS = ["Standard", "Premium", "Enterprise"];

export function CreateCompanyPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form step tracking
  const [currentTab, setCurrentTab] = useState("general");
  const tabs = ["general", "contact", "legal", "subscription"];

  // General Information
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [activitySector, setActivitySector] = useState("");
  const [category, setCategory] = useState("");
  const [workCalendar, setWorkCalendar] = useState("");

  // Contact Information
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [iban, setIban] = useState("");

  // Legal Information
  const [bceNumber, setBceNumber] = useState("");
  const [onssNumber, setOnssNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [legalForm, setLegalForm] = useState("");
  const [creationDate, setCreationDate] = useState("");
  const [jointCommittees, setJointCommittees] = useState<string[]>([]);

  // Subscription Information
  const [subscriptionFormula, setSubscriptionFormula] = useState("");
  const [collaborationStartDate, setCollaborationStartDate] = useState("");
  const [declarationFrequency, setDeclarationFrequency] = useState("");
  const [workRegime, setWorkRegime] = useState("");
  const [salaryReduction, setSalaryReduction] = useState("");
  const [securityFund, setSecurityFund] = useState("");
  const [workAccidentInsurance, setWorkAccidentInsurance] = useState("");

  // Step validation
  const isGeneralStepValid = useMemo(() => {
    return name && activitySector;
  }, [name, activitySector]);

  const isLegalStepValid = useMemo(() => {
    return bceNumber && onssNumber && legalForm;
  }, [bceNumber, onssNumber, legalForm]);

  const isContactStepValid = useMemo(() => {
    return email;
  }, [email]);

  const handleTabChange = (tab: string) => {
    const currentIndex = tabs.indexOf(currentTab);
    const targetIndex = tabs.indexOf(tab);

    if (targetIndex > currentIndex) {
      // Moving forward - check if all previous steps are valid
      for (let i = 0; i <= targetIndex - 1; i++) {
        switch (tabs[i]) {
          case "general":
            if (!isGeneralStepValid) return;
            break;
          case "legal":
            if (!isLegalStepValid) return;
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
    if (!isGeneralStepValid || !isLegalStepValid || !isContactStepValid) {
      toast.error(
        "Veuillez remplir tous les champs obligatoires de chaque étape"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const company = await companyService.createCompany({
        name,
        companyName,
        activitySector,
        category,
        workCalendar,
        email,
        phoneNumber,
        iban,
        bceNumber,
        onssNumber,
        vatNumber,
        legalForm,
        creationDate: creationDate ? new Date(creationDate) : undefined,
        jointCommittees,
        subscriptionFormula,
        collaborationStartDate: collaborationStartDate
          ? new Date(collaborationStartDate)
          : undefined,
        declarationFrequency,
        workRegime,
        salaryReduction,
        securityFund,
        workAccidentInsurance,
      });

      toast.success("Entreprise créée avec succès");
      navigate(ROUTES.COMPANY_DETAILS(company.id));
    } catch (error) {
      toast.error("Erreur lors de la création de l'entreprise");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-blue-700">
          Ajouter une entreprise
        </h1>
        <p className="text-slate-500">
          Remplissez les informations de la nouvelle entreprise
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs
          value={currentTab}
          className="space-y-4"
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="legal">Informations légales</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="subscription">Souscription</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {!isGeneralStepValid && (
              <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
                Veuillez remplir tous les champs obligatoires avant de passer à
                l'étape suivante
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'entreprise *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Dénomination sociale</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activitySector">Secteur d'activité *</Label>
                    <Select
                      value={activitySector}
                      onValueChange={setActivitySector}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Sélectionnez un secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workCalendar">Calendrier de travail</Label>
                    <Input
                      id="workCalendar"
                      value={workCalendar}
                      onChange={(e) => setWorkCalendar(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal">
            {!isLegalStepValid && (
              <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
                Veuillez remplir tous les champs obligatoires avant de passer à
                l'étape suivante
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Informations légales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bceNumber">Numéro BCE *</Label>
                    <Input
                      id="bceNumber"
                      value={bceNumber}
                      onChange={(e) => setBceNumber(e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="onssNumber">Numéro ONSS *</Label>
                    <Input
                      id="onssNumber"
                      value={onssNumber}
                      onChange={(e) => setOnssNumber(e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">Numéro TVA</Label>
                    <Input
                      id="vatNumber"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalForm">Forme juridique *</Label>
                    <Select value={legalForm} onValueChange={setLegalForm}>
                      <SelectTrigger className="bg-white">
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creationDate">Date de création</Label>
                    <Input
                      id="creationDate"
                      type="date"
                      value={creationDate}
                      onChange={(e) => setCreationDate(e.target.value)}
                      className="bg-white"
                    />
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
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Informations de souscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionFormula">Formule</Label>
                    <Select
                      value={subscriptionFormula}
                      onValueChange={setSubscriptionFormula}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Sélectionnez une formule" />
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
                    <Label htmlFor="collaborationStartDate">
                      Date de début de collaboration
                    </Label>
                    <Input
                      id="collaborationStartDate"
                      type="date"
                      value={collaborationStartDate}
                      onChange={(e) =>
                        setCollaborationStartDate(e.target.value)
                      }
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="declarationFrequency">
                      Fréquence de déclaration
                    </Label>
                    <Input
                      id="declarationFrequency"
                      value={declarationFrequency}
                      onChange={(e) => setDeclarationFrequency(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workRegime">Régime de travail</Label>
                    <Input
                      id="workRegime"
                      value={workRegime}
                      onChange={(e) => setWorkRegime(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryReduction">Réduction salariale</Label>
                    <Input
                      id="salaryReduction"
                      value={salaryReduction}
                      onChange={(e) => setSalaryReduction(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="securityFund">
                      Fonds de sécurité d'existence
                    </Label>
                    <Input
                      id="securityFund"
                      value={securityFund}
                      onChange={(e) => setSecurityFund(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workAccidentInsurance">
                      Assurance accident de travail
                    </Label>
                    <Input
                      id="workAccidentInsurance"
                      value={workAccidentInsurance}
                      onChange={(e) => setWorkAccidentInsurance(e.target.value)}
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
            onClick={() => navigate(ROUTES.COMPANIES)}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              currentTab !== "subscription" ||
              !isGeneralStepValid ||
              !isLegalStepValid ||
              !isContactStepValid
            }
          >
            {isSubmitting ? "Création en cours..." : "Créer l'entreprise"}
          </Button>
        </div>
      </form>
    </div>
  );
}

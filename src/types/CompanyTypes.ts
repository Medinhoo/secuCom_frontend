export interface Address {
  street: string;
  number: string;
  box?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface CompanyDto {
  id: string;
  name: string; // nom
  phoneNumber?: string; // numeroTel
  email?: string;
  iban?: string;
  address?: Address; // adresse
  securityFund?: string; // fondDeSecuriteDexistance
  workAccidentInsurance?: string; // assuranceAccidentDeTravail
  bceNumber: string; // numeroBCE
  onssNumber: string; // numeroONSS
  legalForm?: string; // formeJuridique
  companyName?: string; // denominationSociale
  creationDate?: Date; // dateCreation
  vatNumber?: string; // numeroTVA
  workRegime?: string; // regimeTravail
  salaryReduction?: string; // reductionSalaire
  activitySector?: string; // secteurActivite
  jointCommittees?: string[]; // commissionParitaire
  category?: string; // categorie
  workCalendar?: string; // calendrierTravail
  collaborationStartDate?: Date; // dateDebutCollaboration
  subscriptionFormula?: string; // formuleSouscrite
  declarationFrequency?: string; // frequenceDeclarationPP
}

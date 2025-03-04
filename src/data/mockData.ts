// src/data/mockData.ts

// Types et enums
export interface Entreprise {
  id: string;
  nom: string;
  adresse: string;
  numeroTVA: string;
  secteurActivite: string;
  utilisateurId: string;
  employesCount?: number;
}

export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  email: string;
  dateEmbauche: string;
  telephone?: string;
  adresse?: string;
  entrepriseId: string;
}

export interface Document {
  id: string;
  nom: string;
  type: string;
  dateUpload: string;
  taille: string;
}

export enum WorkStatus {
  WORKING_DAY = "WORKING_DAY",
  PAID_LEAVE = "PAID_LEAVE",
  UNPAID_LEAVE = "UNPAID_LEAVE",
  PUBLIC_HOLIDAY = "PUBLIC_HOLIDAY",
  SICK_LEAVE = "SICK_LEAVE",
  WEEKEND = "WEEKEND",
  TRAINING = "TRAINING",
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  status: WorkStatus;
  hours?: number;
}

// Types pour Dimona
export enum DimonaType {
  IN = "IN",
  OUT = "OUT",
  UPDATE = "UPDATE",
}

export enum DimonaStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface Dimona {
  id: string;
  employee: {
    id: string;
    nom: string;
    prenom: string;
  };
  entreprise: {
    id: string;
    nom: string;
  };
  type: DimonaType;
  dateDeclaration: string;
  dateDebut: string;
  dateFin: string | null;
  statut: DimonaStatus;
  refNumber: string;
}

// Données des entreprises
export const demoEntreprises: Entreprise[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    nom: "TechSolutions SPRL",
    adresse: "15 Rue de la Loi, 1000 Bruxelles",
    numeroTVA: "BE0123456789",
    secteurActivite: "Informatique",
    utilisateurId: "987e6543-e21b-12d3-a456-426614174111",
    employesCount: 12,
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    nom: "Construction Dupont SA",
    adresse: "24 Avenue Louise, 1050 Bruxelles",
    numeroTVA: "BE0987654321",
    secteurActivite: "Construction",
    utilisateurId: "887e6543-e21b-12d3-a456-426614174112",
    employesCount: 28,
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174002",
    nom: "Resto Gourmand",
    adresse: "8 Place du Marché, 4000 Liège",
    numeroTVA: "BE0567891234",
    secteurActivite: "Restauration",
    utilisateurId: "787e6543-e21b-12d3-a456-426614174113",
    employesCount: 7,
  },
  {
    id: "423e4567-e89b-12d3-a456-426614174003",
    nom: "Transports Express",
    adresse: "112 Chaussée de Namur, 5000 Namur",
    numeroTVA: "BE0345678912",
    secteurActivite: "Transport",
    utilisateurId: "687e6543-e21b-12d3-a456-426614174114",
    employesCount: 15,
  },
  {
    id: "523e4567-e89b-12d3-a456-426614174004",
    nom: "Média & Communications",
    adresse: "45 Boulevard Anspach, 1000 Bruxelles",
    numeroTVA: "BE0234567891",
    secteurActivite: "Médias",
    utilisateurId: "587e6543-e21b-12d3-a456-426614174115",
    employesCount: 9,
  },
];

// Données des employés
export const demoEmployees: Employee[] = [
  {
    id: "emp1",
    nom: "Dubois",
    prenom: "Jean",
    poste: "Développeur Senior",
    email: "jean.dubois@techsolutions.be",
    dateEmbauche: "15/03/2020",
    telephone: "+32 470 12 34 56",
    adresse: "10 Rue de la Paix, 1000 Bruxelles",
    entrepriseId: "123e4567-e89b-12d3-a456-426614174000",
  },
  {
    id: "emp2",
    nom: "Martin",
    prenom: "Sophie",
    poste: "Designer UX",
    email: "sophie.martin@techsolutions.be",
    dateEmbauche: "21/09/2021",
    telephone: "+32 471 23 45 67",
    adresse: "25 Avenue Louise, 1050 Bruxelles",
    entrepriseId: "123e4567-e89b-12d3-a456-426614174000",
  },
  {
    id: "emp3",
    nom: "Laurent",
    prenom: "Michel",
    poste: "Chef de chantier",
    email: "michel.laurent@construction-dupont.be",
    dateEmbauche: "03/05/2018",
    telephone: "+32 472 34 56 78",
    adresse: "5 Rue du Commerce, 1040 Bruxelles",
    entrepriseId: "223e4567-e89b-12d3-a456-426614174001",
  },
  {
    id: "emp4",
    nom: "Leroy",
    prenom: "Émilie",
    poste: "Comptable",
    email: "emilie.leroy@mediascom.be",
    dateEmbauche: "12/01/2022",
    telephone: "+32 473 45 67 89",
    adresse: "18 Rue de la Bourse, 1000 Bruxelles",
    entrepriseId: "523e4567-e89b-12d3-a456-426614174004",
  },
  {
    id: "emp5",
    nom: "Petit",
    prenom: "Thomas",
    poste: "Chauffeur",
    email: "thomas.petit@transportsexpress.be",
    dateEmbauche: "07/08/2019",
    telephone: "+32 474 56 78 90",
    adresse: "42 Rue du Transport, 5000 Namur",
    entrepriseId: "423e4567-e89b-12d3-a456-426614174003",
  },
  {
    id: "emp6",
    nom: "Dupont",
    prenom: "Claire",
    poste: "Chef cuisinière",
    email: "claire.dupont@resto-gourmand.be",
    dateEmbauche: "22/11/2020",
    telephone: "+32 475 67 89 01",
    adresse: "7 Place du Marché, 4000 Liège",
    entrepriseId: "323e4567-e89b-12d3-a456-426614174002",
  },
];

// Documents par employé
export const demoEmployeeDocuments: Record<string, Document[]> = {
  emp1: [
    {
      id: "doc1",
      nom: "Contrat de travail",
      type: "PDF",
      dateUpload: "15/03/2020",
      taille: "750 KB",
    },
    {
      id: "doc2",
      nom: "CV",
      type: "PDF",
      dateUpload: "10/03/2020",
      taille: "1.2 MB",
    },
  ],
  emp2: [
    {
      id: "doc3",
      nom: "Contrat de travail",
      type: "PDF",
      dateUpload: "21/09/2021",
      taille: "720 KB",
    },
    {
      id: "doc4",
      nom: "Attestation de formation",
      type: "PDF",
      dateUpload: "05/11/2021",
      taille: "1.5 MB",
    },
  ],
  emp3: [
    {
      id: "doc5",
      nom: "Contrat de travail",
      type: "PDF",
      dateUpload: "03/05/2018",
      taille: "800 KB",
    },
  ],
};

// Documents par entreprise
export const demoCompanyDocuments: Record<string, Document[]> = {
  "123e4567-e89b-12d3-a456-426614174000": [
    {
      id: "doc1",
      nom: "Contrat de service",
      type: "PDF",
      dateUpload: "10/01/2023",
      taille: "1.2 MB",
    },
    {
      id: "doc2",
      nom: "Facture Q1 2023",
      type: "PDF",
      dateUpload: "15/04/2023",
      taille: "850 KB",
    },
  ],
  "223e4567-e89b-12d3-a456-426614174001": [
    {
      id: "doc3",
      nom: "Plan de chantier",
      type: "PDF",
      dateUpload: "22/03/2023",
      taille: "3.5 MB",
    },
  ],
};

// Données de calendrier par employé
export const demoCalendarData: Record<string, CalendarDay[]> = {
  emp1: [
    { date: "2025-03-01", status: WorkStatus.WEEKEND },
    { date: "2025-03-02", status: WorkStatus.WEEKEND },
    { date: "2025-03-03", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-04", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-05", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-06", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-07", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-08", status: WorkStatus.WEEKEND },
    { date: "2025-03-09", status: WorkStatus.WEEKEND },
    { date: "2025-03-10", status: WorkStatus.SICK_LEAVE },
    { date: "2025-03-11", status: WorkStatus.SICK_LEAVE },
    { date: "2025-03-12", status: WorkStatus.SICK_LEAVE },
    { date: "2025-03-13", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-14", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-15", status: WorkStatus.WEEKEND },
    { date: "2025-03-16", status: WorkStatus.WEEKEND },
    { date: "2025-03-17", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-18", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-19", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-20", status: WorkStatus.TRAINING },
    { date: "2025-03-21", status: WorkStatus.TRAINING },
    { date: "2025-03-22", status: WorkStatus.WEEKEND },
    { date: "2025-03-23", status: WorkStatus.WEEKEND },
    { date: "2025-03-24", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-25", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-26", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-27", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-28", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-29", status: WorkStatus.WEEKEND },
    { date: "2025-03-30", status: WorkStatus.WEEKEND },
    { date: "2025-03-31", status: WorkStatus.WORKING_DAY, hours: 8 },
    // April data
    { date: "2025-04-01", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-02", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-03", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-04", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-05", status: WorkStatus.WEEKEND },
    { date: "2025-04-06", status: WorkStatus.WEEKEND },
    { date: "2025-04-07", status: WorkStatus.PAID_LEAVE },
    { date: "2025-04-08", status: WorkStatus.PAID_LEAVE },
    { date: "2025-04-09", status: WorkStatus.PAID_LEAVE },
    { date: "2025-04-10", status: WorkStatus.PAID_LEAVE },
    { date: "2025-04-11", status: WorkStatus.PAID_LEAVE },
    { date: "2025-04-12", status: WorkStatus.WEEKEND },
    { date: "2025-04-13", status: WorkStatus.WEEKEND },
    { date: "2025-04-14", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-15", status: WorkStatus.PUBLIC_HOLIDAY },
    { date: "2025-04-16", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-17", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-04-18", status: WorkStatus.WORKING_DAY, hours: 8 },
  ],
  emp2: [
    { date: "2025-03-01", status: WorkStatus.WEEKEND },
    { date: "2025-03-02", status: WorkStatus.WEEKEND },
    { date: "2025-03-03", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-04", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-05", status: WorkStatus.WORKING_DAY, hours: 8 },
    { date: "2025-03-06", status: WorkStatus.PAID_LEAVE },
    { date: "2025-03-07", status: WorkStatus.PAID_LEAVE },
  ],
  emp3: [
    { date: "2025-03-01", status: WorkStatus.WEEKEND },
    { date: "2025-03-02", status: WorkStatus.WEEKEND },
    { date: "2025-03-03", status: WorkStatus.UNPAID_LEAVE },
    { date: "2025-03-04", status: WorkStatus.UNPAID_LEAVE },
    { date: "2025-03-05", status: WorkStatus.WORKING_DAY, hours: 8 },
  ],
};

// Données des déclarations Dimona
export const demoDimonas: Dimona[] = [
  {
    id: "dimona1",
    employee: {
      id: "emp1",
      nom: "Dubois",
      prenom: "Jean",
    },
    entreprise: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      nom: "TechSolutions SPRL",
    },
    type: DimonaType.IN,
    dateDeclaration: "12/02/2023",
    dateDebut: "15/02/2023",
    dateFin: null,
    statut: DimonaStatus.ACCEPTED,
    refNumber: "DIMONA20230212001",
  },
  {
    id: "dimona2",
    employee: {
      id: "emp2",
      nom: "Martin",
      prenom: "Sophie",
    },
    entreprise: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      nom: "TechSolutions SPRL",
    },
    type: DimonaType.IN,
    dateDeclaration: "18/09/2023",
    dateDebut: "21/09/2023",
    dateFin: null,
    statut: DimonaStatus.ACCEPTED,
    refNumber: "DIMONA20230918002",
  },
  {
    id: "dimona3",
    employee: {
      id: "emp3",
      nom: "Laurent",
      prenom: "Michel",
    },
    entreprise: {
      id: "223e4567-e89b-12d3-a456-426614174001",
      nom: "Construction Dupont SA",
    },
    type: DimonaType.IN,
    dateDeclaration: "01/05/2023",
    dateDebut: "03/05/2023",
    dateFin: null,
    statut: DimonaStatus.ACCEPTED,
    refNumber: "DIMONA20230501003",
  },
  {
    id: "dimona4",
    employee: {
      id: "emp1",
      nom: "Dubois",
      prenom: "Jean",
    },
    entreprise: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      nom: "TechSolutions SPRL",
    },
    type: DimonaType.UPDATE,
    dateDeclaration: "25/05/2023",
    dateDebut: "01/06/2023",
    dateFin: null,
    statut: DimonaStatus.PENDING,
    refNumber: "DIMONA20230525004",
  },
  {
    id: "dimona5",
    employee: {
      id: "emp3",
      nom: "Laurent",
      prenom: "Michel",
    },
    entreprise: {
      id: "223e4567-e89b-12d3-a456-426614174001",
      nom: "Construction Dupont SA",
    },
    type: DimonaType.OUT,
    dateDeclaration: "10/11/2023",
    dateDebut: "03/05/2023",
    dateFin: "30/11/2023",
    statut: DimonaStatus.ACCEPTED,
    refNumber: "DIMONA20231110005",
  },
];

export const statusLabels: Record<WorkStatus, string> = {
  [WorkStatus.WORKING_DAY]: "Jour de travail",
  [WorkStatus.PAID_LEAVE]: "Congé payé",
  [WorkStatus.UNPAID_LEAVE]: "Congé sans solde",
  [WorkStatus.PUBLIC_HOLIDAY]: "Jour férié",
  [WorkStatus.SICK_LEAVE]: "Congé maladie",
  [WorkStatus.WEEKEND]: "Weekend",
  [WorkStatus.TRAINING]: "Formation",
};

export const statusColors: Record<WorkStatus, string> = {
  [WorkStatus.WORKING_DAY]: "bg-green-100",
  [WorkStatus.PAID_LEAVE]: "bg-blue-100",
  [WorkStatus.UNPAID_LEAVE]: "bg-orange-100",
  [WorkStatus.PUBLIC_HOLIDAY]: "bg-purple-100",
  [WorkStatus.SICK_LEAVE]: "bg-red-100",
  [WorkStatus.WEEKEND]: "bg-gray-100",
  [WorkStatus.TRAINING]: "bg-yellow-100",
};

// Utilitaires pour les couleurs des secteurs d'activité
export const getSectorLightColor = (sector: string): string => {
  const colors = {
    Informatique: "bg-blue-100 text-blue-700",
    Construction: "bg-amber-100 text-amber-700",
    Restauration: "bg-rose-100 text-rose-700",
    Transport: "bg-emerald-100 text-emerald-700",
    Médias: "bg-violet-100 text-violet-700",
  };
  return colors[sector as keyof typeof colors] || "bg-slate-100 text-slate-700";
};

// Données des employés enrichies pour l'affichage
export const getEmployeesWithCompanyName = (): (Employee & {
  entrepriseNom: string;
})[] => {
  return demoEmployees.map((employee) => {
    const company = getCompanyById(employee.entrepriseId);
    return {
      ...employee,
      entrepriseNom: company ? company.nom : "Inconnu",
    };
  });
};

// Fonctions utilitaires pour accéder aux données
export const getEmployeesByCompany = (companyId: string): Employee[] => {
  return demoEmployees.filter(
    (employee) => employee.entrepriseId === companyId
  );
};

export const getEmployeeById = (employeeId: string): Employee | undefined => {
  return demoEmployees.find((employee) => employee.id === employeeId);
};

export const getCompanyById = (companyId: string): Entreprise | undefined => {
  return demoEntreprises.find((company) => company.id === companyId);
};

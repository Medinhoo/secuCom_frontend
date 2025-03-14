import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Calendar,
  PieChart,
  Search,
  Bell,
  UserPlus,
  FileUp,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-700">
                SecretariatPro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  3
                </Badge>
              </Button>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                MP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-700">
              Tableau de bord
            </h1>
            <p className="text-slate-500 mt-1">
              Bienvenue sur votre espace de gestion des secrétariats sociaux
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau travailleur
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <FileUp className="h-4 w-4 mr-2" />
              Nouvelles prestations
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Travailleurs actifs</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">42</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Demandes en attente</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">7</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Documents à traiter</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">12</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Prestations ce mois</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">156</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="actifs" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-lg mb-4 shadow-sm">
            <TabsTrigger
              value="actifs"
              className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Travailleurs actifs
              <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200">
                42
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="demandes"
              className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Demandes récentes
              <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200">
                7
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Documents
              <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200">
                12
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Analytiques
            </TabsTrigger>
          </TabsList>

          {/* Tab content: Travailleurs actifs */}
          <TabsContent value="actifs" className="mt-0">
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-blue-700">
                    Liste des travailleurs
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher un travailleur..."
                      className="pl-9 border-slate-200 focus-visible:ring-blue-500 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-4 text-blue-700 font-medium border-b border-slate-100">
                          Nom
                        </th>
                        <th className="text-left p-4 text-blue-700 font-medium border-b border-slate-100">
                          Fonction
                        </th>
                        <th className="text-left p-4 text-blue-700 font-medium border-b border-slate-100">
                          Statut
                        </th>
                        <th className="text-left p-4 text-blue-700 font-medium border-b border-slate-100">
                          Dernière prestation
                        </th>
                        <th className="text-right p-4 text-blue-700 font-medium border-b border-slate-100">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: "Martin Dubois",
                          role: "Développeur",
                          status: "Actif",
                          lastActivity: "12/02/2025",
                        },
                        {
                          name: "Sophie Lefèvre",
                          role: "Designer UX/UI",
                          status: "Actif",
                          lastActivity: "01/03/2025",
                        },
                        {
                          name: "Thomas Lambert",
                          role: "Chef de projet",
                          status: "En congé",
                          lastActivity: "25/02/2025",
                        },
                        {
                          name: "Céline Mercier",
                          role: "Analyste",
                          status: "Actif",
                          lastActivity: "03/03/2025",
                        },
                        {
                          name: "Antoine Bernard",
                          role: "Support client",
                          status: "Actif",
                          lastActivity: "02/03/2025",
                        },
                      ].map((worker, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 border-b border-slate-100 group"
                        >
                          <td className="p-4">
                            <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                              {worker.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              ID: TR-{1000 + index}
                            </div>
                          </td>
                          <td className="p-4">{worker.role}</td>
                          <td className="p-4">
                            <Badge
                              className={
                                worker.status === "Actif"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }
                            >
                              {worker.status}
                            </Badge>
                          </td>
                          <td className="p-4">{worker.lastActivity}</td>
                          <td className="p-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 border-0"
                            >
                              Détails
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab content: Demandes récentes */}
          <TabsContent value="demandes" className="mt-0">
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl font-bold text-blue-700">
                  Demandes récentes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-4 text-blue-700 font-medium border-b border-slate-100">
                          Type
                        </th>
                        <th className="text-left p-4 text-blue-700 font-medium border-b border-slate-100">
                          Description
                        </th>
                        <th className="text-left p-4 text-blue-700 font-medium border-b border-slate-100">
                          Statut
                        </th>
                        <th className="text-left p-4 text-blue-700 font-medium border-b border-slate-100">
                          Date
                        </th>
                        <th className="text-right p-4 text-blue-700 font-medium border-b border-slate-100">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          type: "DIMONA",
                          description:
                            "Déclaration d'entrée pour Martin Dubois",
                          status: "En attente",
                          date: "03/03/2025",
                        },
                        {
                          type: "Document salarial",
                          description:
                            "Attestation de revenu pour Sophie Lefèvre",
                          status: "Traité",
                          date: "02/03/2025",
                        },
                        {
                          type: "DIMONA",
                          description: "Déclaration de sortie pour Jean Petit",
                          status: "En attente",
                          date: "01/03/2025",
                        },
                        {
                          type: "Contrat",
                          description: "Avenant au contrat de Céline Mercier",
                          status: "Traité",
                          date: "28/02/2025",
                        },
                      ].map((request, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 border-b border-slate-100 group"
                        >
                          <td className="p-4">
                            <Badge className="bg-blue-100 text-blue-700">
                              {request.type}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                              {request.description}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Réf: DEM-{2000 + index}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={
                                request.status === "Traité"
                                  ? "bg-green-100 text-green-700 flex items-center"
                                  : "bg-amber-100 text-amber-700 flex items-center"
                              }
                            >
                              {request.status === "Traité" ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {request.status}
                            </Badge>
                          </td>
                          <td className="p-4">{request.date}</td>
                          <td className="p-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 border-0"
                            >
                              Voir
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab content: Documents */}
          <TabsContent value="documents" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-700">
                    Documents récents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Fiche de paie - Février 2025",
                        type: "PDF",
                        date: "01/03/2025",
                      },
                      {
                        name: "Attestation employeur",
                        type: "PDF",
                        date: "28/02/2025",
                      },
                      {
                        name: "Déclaration DIMONA - Martin Dubois",
                        type: "PDF",
                        date: "25/02/2025",
                      },
                      {
                        name: "Contrat CDI - Antoine Bernard",
                        type: "PDF",
                        date: "20/02/2025",
                      },
                    ].map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 border-b border-slate-100 last:border-0"
                      >
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-800">
                            {doc.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {doc.type} • {doc.date}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 border-0"
                        >
                          Télécharger
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-700">
                    Documents à soumettre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Prestations - Mars 2025",
                        date: "Avant le 05/04/2025",
                        status: "À venir",
                      },
                      {
                        name: "Justificatifs frais professionnels",
                        date: "Avant le 15/03/2025",
                        status: "Urgent",
                      },
                      {
                        name: "Attestation de congé parental",
                        date: "Avant le 10/03/2025",
                        status: "Urgent",
                      },
                    ].map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 border-b border-slate-100 last:border-0"
                      >
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                          <FileUp className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-800">
                            {doc.name}
                          </p>
                          <div className="flex items-center text-xs text-slate-500 mt-0.5">
                            <Clock className="h-3 w-3 mr-1" /> {doc.date}
                          </div>
                        </div>
                        <Badge
                          className={
                            doc.status === "Urgent"
                              ? "bg-red-100 text-red-700 flex items-center"
                              : "bg-blue-100 text-blue-700 flex items-center"
                          }
                        >
                          {doc.status === "Urgent" ? (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <FileUp className="h-4 w-4 mr-2" />
                    Soumettre un document
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab content: Analytiques */}
          <TabsContent value="analytics" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-700">
                    Aperçu analytique
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-6 h-64">
                  <div className="text-center space-y-2">
                    <PieChart className="h-12 w-12 text-blue-600 mx-auto" />
                    <h3 className="text-lg font-medium text-blue-700">
                      Données analytiques
                    </h3>
                    <p className="text-slate-500 max-w-sm">
                      Les graphiques et statistiques détaillées seraient
                      disponibles ici.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-700">
                    Activités récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: "Document ajouté",
                        detail: "Fiche de paie - Février 2025",
                        time: "Aujourd'hui, 14:32",
                      },
                      {
                        action: "Demande traitée",
                        detail: "Attestation de revenu pour Sophie Lefèvre",
                        time: "Aujourd'hui, 11:15",
                      },
                      {
                        action: "Nouvelle demande",
                        detail: "Déclaration d'entrée pour Martin Dubois",
                        time: "Aujourd'hui, 09:23",
                      },
                      {
                        action: "Prestations encodées",
                        detail: "Février 2025 - 156 prestations",
                        time: "Hier, 17:05",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-0"
                      >
                        <div className="mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            {activity.action}
                          </p>
                          <p className="text-sm text-slate-600">
                            {activity.detail}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Lock, User, Shield, Building, Save } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">
            Paramètres
          </h1>
          <p className="text-slate-500">
            Gérez les paramètres de votre compte et de l'application
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
          >
            <Lock className="mr-2 h-4 w-4" /> Sécurité
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Save className="mr-2 h-4 w-4" /> Sauvegarder
          </Button>
        </div>
      </div>

      {/* Tabs pour les différentes sections des paramètres */}
      <Tabs defaultValue="profil" className="mt-6">
        <TabsList className="bg-white p-1 rounded-lg mb-4 shadow-sm">
          <TabsTrigger
            value="profil"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <User className="mr-2 h-4 w-4" />
            Profil
            <Badge
              variant="secondary"
              className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              1
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="entreprise"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Building className="mr-2 h-4 w-4" />
            Entreprise
          </TabsTrigger>
          <TabsTrigger
            value="securite"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Lock className="mr-2 h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="permissions"
            className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Shield className="mr-2 h-4 w-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Contenu de l'onglet Profil */}
        <TabsContent value="profil" className="mt-0">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-blue-700 mb-4">
                Informations personnelles
              </h2>
              <p className="text-slate-500 mb-6">
                Mettez à jour vos informations personnelles
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom" className="text-slate-700">
                      Nom
                    </Label>
                    <Input
                      id="nom"
                      placeholder="Dupont"
                      className="border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prenom" className="text-slate-700">
                      Prénom
                    </Label>
                    <Input
                      id="prenom"
                      placeholder="Jean"
                      className="border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean.dupont@example.com"
                      className="pl-9 py-2 border-slate-200 rounded-md bg-white shadow-sm focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-slate-700">
                    Numéro de téléphone
                  </Label>
                  <Input
                    id="telephone"
                    placeholder="+32 123 456 789"
                    className="border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="langue" className="text-slate-700">
                    Langue préférée
                  </Label>
                  <select
                    id="langue"
                    className="w-full rounded-md border border-slate-200 p-2 focus-visible:ring-blue-500"
                  >
                    <option value="fr">Français</option>
                    <option value="nl">Néerlandais</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu de l'onglet Entreprise */}
        <TabsContent value="entreprise" className="mt-0">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-blue-700 mb-4">
                Informations de l'entreprise
              </h2>
              <p className="text-slate-500 mb-6">
                Gérez les informations relatives à votre entreprise
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom-entreprise" className="text-slate-700">
                    Nom de l'entreprise
                  </Label>
                  <Input
                    id="nom-entreprise"
                    placeholder="Entreprise SA"
                    className="border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tva" className="text-slate-700">
                    Numéro de TVA
                  </Label>
                  <Input
                    id="tva"
                    placeholder="BE0123456789"
                    className="border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onss" className="text-slate-700">
                    Numéro ONSS
                  </Label>
                  <Input
                    id="onss"
                    placeholder="12345-67-89"
                    className="border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adresse" className="text-slate-700">
                      Adresse
                    </Label>
                    <Input
                      id="adresse"
                      placeholder="Rue des Exemples 123"
                      className="border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ville" className="text-slate-700">
                      Ville
                    </Label>
                    <Input
                      id="ville"
                      placeholder="Bruxelles"
                      className="border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code-postal" className="text-slate-700">
                      Code postal
                    </Label>
                    <Input
                      id="code-postal"
                      placeholder="1000"
                      className="border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pays" className="text-slate-700">
                      Pays
                    </Label>
                    <Input
                      id="pays"
                      placeholder="Belgique"
                      className="border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu de l'onglet Sécurité */}
        <TabsContent value="securite" className="mt-0">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-blue-700 mb-4">
                Sécurité du compte
              </h2>
              <p className="text-slate-500 mb-6">
                Modifiez votre mot de passe et les paramètres de sécurité
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-slate-700">
                    Mot de passe actuel
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-slate-700">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-slate-700">
                    Confirmer le nouveau mot de passe
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="pt-4">
                  <div className="flex items-center space-x-2 py-2 border-b border-slate-100">
                    <Switch id="2fa" />
                    <Label htmlFor="2fa" className="text-slate-700">
                      Activer l'authentification à deux facteurs
                    </Label>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="session" />
                    <Label htmlFor="session" className="text-slate-700">
                      Déconnexion automatique après 60 min d'inactivité
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu de l'onglet Notifications */}
        <TabsContent value="notifications" className="mt-0">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-blue-700 mb-4">
                Préférences de notifications
              </h2>
              <p className="text-slate-500 mb-6">
                Configurez comment et quand vous recevez des notifications
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <h4 className="font-medium text-slate-800">
                      Notifications par email
                    </h4>
                    <p className="text-sm text-slate-500">
                      Recevoir les notifications par email
                    </p>
                  </div>
                  <Switch id="email-notif" />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <h4 className="font-medium text-slate-800">
                      Notifications dans l'application
                    </h4>
                    <p className="text-sm text-slate-500">
                      Afficher les notifications dans l'application
                    </p>
                  </div>
                  <Switch id="app-notif" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <h4 className="font-medium text-slate-800">
                      Nouvelles demandes DIMONA
                    </h4>
                    <p className="text-sm text-slate-500">
                      Être notifié des nouvelles demandes DIMONA
                    </p>
                  </div>
                  <Switch id="dimona-notif" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <h4 className="font-medium text-slate-800">
                      Documents disponibles
                    </h4>
                    <p className="text-sm text-slate-500">
                      Être notifié quand de nouveaux documents sont disponibles
                    </p>
                  </div>
                  <Switch id="doc-notif" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-medium text-slate-800">
                      Rappels de prestations
                    </h4>
                    <p className="text-sm text-slate-500">
                      Recevoir des rappels pour l'encodage des prestations
                    </p>
                  </div>
                  <Switch id="prestations-notif" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu de l'onglet Permissions */}
        <TabsContent value="permissions" className="mt-0">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="text-blue-700 font-medium">
                      Rôle
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      Description
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium">
                      Statut
                    </TableHead>
                    <TableHead className="text-blue-700 font-medium text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-slate-50 border-b border-slate-100 group">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                          Administration complète
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Rôle administrateur
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      Accès à tous les paramètres et fonctionnalités
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        Votre rôle
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50 border-b border-slate-100 group">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                          Gestion DIMONA
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Rôle standard
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      Autoriser la création et modification des DIMONA
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                        Actif
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                      >
                        Gérer
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50 border-b border-slate-100 group">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                          Gestion des documents
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Rôle standard
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      Autoriser l'accès et le téléchargement des documents
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                        Actif
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                      >
                        Gérer
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50 border-b border-slate-100 group">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                          Encodage des prestations
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Rôle standard
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      Autoriser l'encodage et la modification des prestations
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                        Actif
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                      >
                        Gérer
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50 group">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-blue-800 group-hover:text-blue-600 transition-colors">
                          Consultation des données salariales
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Rôle restreint
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      Autoriser l'accès aux données salariales des travailleurs
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                        Limité
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                      >
                        Gérer
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;

import { useState, useEffect } from 'react';
import { X, Mail, Send, Users, Copy, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { documentService } from '@/services/api/documentService';
import { toast } from 'sonner';
import type { EmailTemplate, EmailFormData, SendEmailRequest } from '@/types/DocumentTypes';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentGenerationId: string;
  documentName: string;
  templateDisplayName: string;
}

export function EmailModal({
  isOpen,
  onClose,
  documentGenerationId,
  documentName,
  templateDisplayName,
}: EmailModalProps) {
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<EmailFormData>({
    recipients: [],
    ccRecipients: [],
    subject: '',
    body: '',
    includePdf: true,
    includeDocx: false,
  });
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentCcEmail, setCurrentCcEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Charger le template d'email
  useEffect(() => {
    if (isOpen && documentGenerationId) {
      loadEmailTemplate();
    }
  }, [isOpen, documentGenerationId]);

  const loadEmailTemplate = async () => {
    try {
      setIsLoading(true);
      const template = await documentService.getEmailTemplate(documentGenerationId);
      setEmailTemplate(template);
      
      // Pré-remplir le formulaire avec les valeurs par défaut
      setFormData(prev => ({
        ...prev,
        subject: template.defaultSubject || `Document généré - ${templateDisplayName}`,
        body: template.defaultBody || 'Bonjour,\n\nVeuillez trouver ci-joint le document généré.\n\nCordialement',
        recipients: template.defaultRecipients || [],
        ccRecipients: template.defaultCcRecipients || [],
      }));
    } catch (error) {
      console.error('Erreur lors du chargement du template email:', error);
      toast.error('Erreur lors du chargement des paramètres email');
      
      // Valeurs par défaut en cas d'erreur
      setFormData(prev => ({
        ...prev,
        subject: `Document généré - ${templateDisplayName}`,
        body: 'Bonjour,\n\nVeuillez trouver ci-joint le document généré.\n\nCordialement',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const addRecipient = () => {
    if (currentEmail && isValidEmail(currentEmail) && !formData.recipients.includes(currentEmail)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, currentEmail],
      }));
      setCurrentEmail('');
    } else if (!isValidEmail(currentEmail)) {
      toast.error('Veuillez entrer une adresse email valide');
    } else if (formData.recipients.includes(currentEmail)) {
      toast.error('Cette adresse email est déjà dans la liste');
    }
  };

  const removeRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email),
    }));
  };

  const addCcRecipient = () => {
    if (currentCcEmail && isValidEmail(currentCcEmail) && !formData.ccRecipients.includes(currentCcEmail)) {
      setFormData(prev => ({
        ...prev,
        ccRecipients: [...prev.ccRecipients, currentCcEmail],
      }));
      setCurrentCcEmail('');
    } else if (!isValidEmail(currentCcEmail)) {
      toast.error('Veuillez entrer une adresse email valide');
    } else if (formData.ccRecipients.includes(currentCcEmail)) {
      toast.error('Cette adresse email est déjà dans la liste');
    }
  };

  const removeCcRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      ccRecipients: prev.ccRecipients.filter(r => r !== email),
    }));
  };

  const handleSendEmail = async () => {
    if (formData.recipients.length === 0) {
      toast.error('Veuillez ajouter au moins un destinataire');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Veuillez saisir un objet');
      return;
    }

    try {
      setIsSending(true);

      const request: SendEmailRequest = {
        documentGenerationId,
        recipients: formData.recipients,
        ccRecipients: formData.ccRecipients.length > 0 ? formData.ccRecipients : undefined,
        subject: formData.subject,
        body: formData.body,
        includePdf: formData.includePdf,
        includeDocx: formData.includeDocx,
      };

      const response = await documentService.sendEmail(request);

      if (response.success) {
        toast.success('Email envoyé avec succès !', {
          description: `Envoyé à ${response.recipients?.join(', ')}`,
        });
        onClose();
      } else {
        toast.error('Erreur lors de l\'envoi', {
          description: response.message,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Envoyer le document par email
              </h2>
              <p className="text-sm text-gray-500">{documentName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Chargement...</span>
            </div>
          ) : (
            <Tabs defaultValue="compose" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compose">Composer</TabsTrigger>
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
              </TabsList>

              <TabsContent value="compose" className="space-y-6 mt-6">
                {/* Destinataires */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Destinataires *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Ajouter une adresse email..."
                      value={currentEmail}
                      onChange={(e) => setCurrentEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addRecipient)}
                      className="flex-1"
                    />
                    <Button onClick={addRecipient} size="sm">
                      Ajouter
                    </Button>
                  </div>
                  {formData.recipients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.recipients.map((email) => (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <button
                            onClick={() => removeRecipient(email)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destinataires en copie */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Destinataires en copie (CC)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Ajouter une adresse email en copie..."
                      value={currentCcEmail}
                      onChange={(e) => setCurrentCcEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addCcRecipient)}
                      className="flex-1"
                    />
                    <Button onClick={addCcRecipient} size="sm" variant="outline">
                      Ajouter
                    </Button>
                  </div>
                  {formData.ccRecipients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.ccRecipients.map((email) => (
                        <Badge key={email} variant="outline" className="flex items-center gap-1">
                          {email}
                          <button
                            onClick={() => removeCcRecipient(email)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Objet */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Objet *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Objet de l'email"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Contenu de l'email"
                    rows={6}
                  />
                </div>

                {/* Pièces jointes */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Pièces jointes
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includePdf"
                        checked={formData.includePdf}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, includePdf: checked as boolean }))
                        }
                      />
                      <label htmlFor="includePdf" className="text-sm text-gray-700">
                        Inclure le fichier PDF
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeDocx"
                        checked={formData.includeDocx}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, includeDocx: checked as boolean }))
                        }
                      />
                      <label htmlFor="includeDocx" className="text-sm text-gray-700">
                        Inclure le fichier DOCX
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Aperçu de l'email</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">À : </span>
                      <span className="text-gray-900">
                        {formData.recipients.length > 0 ? formData.recipients.join(', ') : 'Aucun destinataire'}
                      </span>
                    </div>
                    {formData.ccRecipients.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">CC : </span>
                        <span className="text-gray-900">{formData.ccRecipients.join(', ')}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">Objet : </span>
                      <span className="text-gray-900">{formData.subject || 'Aucun objet'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Message :</span>
                      <div className="mt-2 p-3 bg-gray-50 rounded border whitespace-pre-wrap text-gray-900">
                        {formData.body || 'Aucun message'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Pièces jointes :</span>
                      <div className="mt-2 space-y-1">
                        {formData.includePdf && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Paperclip className="h-4 w-4" />
                            {documentName.replace('.docx', '.pdf')}
                          </div>
                        )}
                        {formData.includeDocx && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Paperclip className="h-4 w-4" />
                            {documentName}
                          </div>
                        )}
                        {!formData.includePdf && !formData.includeDocx && (
                          <span className="text-sm text-gray-500">Aucune pièce jointe</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Annuler
          </Button>
          <Button 
            onClick={handleSendEmail} 
            disabled={isSending || isLoading || formData.recipients.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

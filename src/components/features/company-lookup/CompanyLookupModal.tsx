import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  formatDate, 
  formatAddress, 
  displayValue 
} from '@/utils/companyLookupUtils';
import type { CompanyLookupDto } from '@/types/CompanyLookupTypes';

interface CompanyLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: CompanyLookupDto | null;
}

export function CompanyLookupModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  data 
}: CompanyLookupModalProps) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] min-w-[800px] h-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-green-700 mb-2">
            🎉 Entreprise trouvée !
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600">
            Parfait ! Nous avons trouvé les informations de cette entreprise dans la base CBE.
            <br />
            <span className="text-green-600 font-medium">Confirmez pour pré-remplir automatiquement le formulaire.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Informations générales */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">Informations générales</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <span className="block font-medium text-blue-600 text-xs uppercase tracking-wide mb-2">Entreprise</span>
                      <span className="text-sm font-semibold text-gray-900">{data.companyName}</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <span className="block font-medium text-blue-600 text-xs uppercase tracking-wide mb-2">Numéro BCE</span>
                      <span className="text-sm font-mono font-semibold text-gray-900">{data.bceNumberFormatted}</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <span className="block font-medium text-blue-600 text-xs uppercase tracking-wide mb-2">Forme juridique</span>
                      <span className="text-sm font-semibold text-gray-900">{data.legalForm} ({data.legalFormShort})</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <span className="block font-medium text-blue-600 text-xs uppercase tracking-wide mb-2">Statut</span>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        data.status === 'active' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {data.status === 'active' ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow col-span-2">
                      <span className="block font-medium text-blue-600 text-xs uppercase tracking-wide mb-2">Date de création</span>
                      <span className="text-sm font-semibold text-gray-900">{formatDate(data.startDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Coordonnées */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">Coordonnées</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <span className="block font-medium text-green-600 text-xs uppercase tracking-wide mb-2">Adresse</span>
                      <div className="text-sm font-semibold text-gray-900">
                        <div>{data.address.street} {data.address.number}</div>
                        {data.address.box && (
                          <div>Boîte {data.address.box}</div>
                        )}
                        <div>{data.address.postalCode} {data.address.city}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <span className="block font-medium text-green-600 text-xs uppercase tracking-wide mb-2">Email</span>
                        <span className="text-sm font-semibold text-gray-900 break-all">{displayValue(data.email)}</span>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <span className="block font-medium text-green-600 text-xs uppercase tracking-wide mb-2">Téléphone</span>
                        <span className="text-sm font-semibold text-gray-900">{displayValue(data.phoneNumber)}</span>
                      </div>
                    </div>
                    {data.website && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <span className="block font-medium text-green-600 text-xs uppercase tracking-wide mb-2">Site web</span>
                        <span className="text-sm font-semibold text-gray-900 break-all">{data.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Confirmer et pré-remplir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

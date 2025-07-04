import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { 
  EntityMetadata, 
  VariableMapping, 
  EntityFieldInfo
} from '@/types/TemplateTypes';

interface VariableMappingFormProps {
  variables: string[];
  entityMetadata: EntityMetadata;
  mappings: VariableMapping[];
  onMappingsChange: (mappings: VariableMapping[]) => void;
}

const MANUAL_FIELD_TYPES = [
  { value: 'string', label: 'Texte' },
  { value: 'text', label: 'Texte long' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Nombre' },
  { value: 'decimal', label: 'Décimal' },
  { value: 'boolean', label: 'Oui/Non' },
] as const;

export function VariableMappingForm({ 
  variables, 
  entityMetadata, 
  mappings, 
  onMappingsChange 
}: VariableMappingFormProps) {
  const [expandedVariable, setExpandedVariable] = useState<string | null>(null);

  const updateMapping = (variableName: string, updates: Partial<VariableMapping>) => {
    const newMappings = mappings.map(mapping => 
      mapping.variableName === variableName 
        ? { ...mapping, ...updates }
        : mapping
    );
    onMappingsChange(newMappings);
  };

  const getFieldsForEntity = (entity: 'Company' | 'Collaborator'): EntityFieldInfo[] => {
    return entityMetadata[entity] || [];
  };

  const renderVariableCard = (variable: string) => {
    const mapping = mappings.find(m => m.variableName === variable);
    if (!mapping) return null;

    const isExpanded = expandedVariable === variable;
    const availableFields = mapping.entity !== 'manual' ? getFieldsForEntity(mapping.entity) : [];

    return (
      <Card key={variable} className="border-l-4 border-l-blue-500">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedVariable(isExpanded ? null : variable)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">
                {`{{${variable}}}`}
              </Badge>
              <div>
                <CardTitle className="text-base">{mapping.displayName}</CardTitle>
                <p className="text-sm text-gray-500">
                  {mapping.entity === 'manual' ? 'Saisie manuelle' : 
                   mapping.entity === 'Company' ? 'Champ entreprise' : 
                   'Champ collaborateur'}
                  {mapping.field && ` • ${mapping.field}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mapping.required && (
                <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
              )}
              <Badge variant={mapping.entity === 'manual' ? 'secondary' : 'default'} className="text-xs">
                {mapping.type}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom d'affichage */}
              <div className="space-y-2">
                <Label htmlFor={`displayName-${variable}`}>Nom d'affichage</Label>
                <Input
                  id={`displayName-${variable}`}
                  value={mapping.displayName}
                  onChange={(e) => updateMapping(variable, { displayName: e.target.value })}
                  placeholder="Nom affiché dans le formulaire"
                />
              </div>

              {/* Source des données */}
              <div className="space-y-2">
                <Label htmlFor={`entity-${variable}`}>Source des données</Label>
                <Select
                  value={mapping.entity}
                  onValueChange={(value: 'Company' | 'Collaborator' | 'manual') => 
                    updateMapping(variable, { 
                      entity: value, 
                      field: value === 'manual' ? undefined : '',
                      type: value === 'manual' ? 'string' : 'string'
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Saisie manuelle</SelectItem>
                    <SelectItem value="Company">Données entreprise</SelectItem>
                    <SelectItem value="Collaborator">Données collaborateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Champ spécifique (si Company ou Collaborator) */}
              {mapping.entity !== 'manual' && (
                <div className="space-y-2">
                  <Label htmlFor={`field-${variable}`}>Champ</Label>
                  <Select
                    value={mapping.field || ''}
                    onValueChange={(value) => {
                      const selectedField = availableFields.find(f => f.fieldPath === value);
                      updateMapping(variable, { 
                        field: value,
                        type: selectedField?.type || 'string'
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un champ" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map((field) => (
                        <SelectItem key={field.fieldPath} value={field.fieldPath}>
                          {field.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Type (si manuel) */}
              {mapping.entity === 'manual' && (
                <div className="space-y-2">
                  <Label htmlFor={`type-${variable}`}>Type de champ</Label>
                  <Select
                    value={mapping.type}
                    onValueChange={(value) => updateMapping(variable, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MANUAL_FIELD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Champ obligatoire */}
              <div className="flex items-center space-x-2">
                <Switch
                  id={`required-${variable}`}
                  checked={mapping.required}
                  onCheckedChange={(checked) => updateMapping(variable, { required: checked })}
                />
                <Label htmlFor={`required-${variable}`}>Champ obligatoire</Label>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 space-y-2">
              <Label htmlFor={`description-${variable}`}>Description (optionnelle)</Label>
              <Textarea
                id={`description-${variable}`}
                value={mapping.description || ''}
                onChange={(e) => updateMapping(variable, { description: e.target.value })}
                placeholder="Description ou aide pour ce champ"
                rows={2}
              />
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configuration des variables</h3>
        <p className="text-sm text-gray-500">
          {variables.length} variable(s) à configurer
        </p>
      </div>

      <div className="space-y-3">
        {variables.map(renderVariableCard)}
      </div>

      {variables.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucune variable trouvée dans le template.
        </div>
      )}
    </div>
  );
}

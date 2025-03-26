import { Download, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description: string;
  onExport?: () => void;
  addNewButton?: {
    label: string;
    route: string;
  };
}

export function PageHeader({
  title,
  description,
  onExport,
  addNewButton,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-blue-700">
          {title}
        </h1>
        <p className="text-slate-500">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {onExport && (
          <Button
            variant="outline"
            className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
            onClick={onExport}
          >
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
        )}
        {addNewButton && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            asChild
          >
            <Link to={addNewButton.route}>
              <Plus className="mr-2 h-4 w-4" /> {addNewButton.label}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

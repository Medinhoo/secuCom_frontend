import {
  Search,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  width?: string;
  minWidth?: string;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<void>;
  detailsRoute?: (id: string) => string;
  emptyStateMessage?: {
    title?: string;
    description?: string;
  };
  rowClassName?: string;
  detailsButtonLabel?: string;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  onDelete,
  detailsRoute,
  emptyStateMessage = {
    title: "Aucun élément trouvé",
    description: "Essayez de modifier vos critères de recherche",
  },
  rowClassName = "hover:bg-slate-50/50 border-b border-slate-100",
  detailsButtonLabel = "Voir détails",
}: DataTableProps<T>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerHeight, setContainerHeight] = useState<number>(600);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic height to fill viewport
  useEffect(() => {
    const calculateHeight = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Calculate available height: viewport height minus distance from top minus some margin
      const availableHeight = window.innerHeight - rect.top - 20;
      
      // Minimum height for usability
      const minHeight = 400;
      const calculatedHeight = Math.max(minHeight, availableHeight);
      
      setContainerHeight(calculatedHeight);
    };

    // Calculate on mount
    calculateHeight();
    
    // Recalculate on window resize
    const handleResize = () => {
      setTimeout(calculateHeight, 100); // Small delay to ensure layout is updated
    };
    
    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver for more precise detection
    const resizeObserver = new ResizeObserver(calculateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  // Reset to first page when pageSize changes
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!itemToDelete || !onDelete) return;

    try {
      await onDelete(itemToDelete);
      toast.success("Élément supprimé avec succès");
    } catch (error) {
      toast.error("Échec de la suppression");
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const renderCell = (item: T, column: Column<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(item);
    }
    return item[column.accessor] as React.ReactNode;
  };

  const hasActions = !!onDelete || !!detailsRoute;

  // Generate grid template columns with custom widths
  const generateGridColumns = () => {
    const columnWidths = columns.map(column => {
      if (column.width) {
        return column.width;
      }
      return '1fr';
    });
    
    const columnsTemplate = columnWidths.join(' ');
    return hasActions ? `${columnsTemplate} auto` : columnsTemplate;
  };

  const gridTemplateColumns = generateGridColumns();

  return (
    <div 
      ref={containerRef}
      className="flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
      style={{ height: `${containerHeight}px` }}
    >
      {/* Table Container with Sticky Header */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 sticky top-0 z-20">
          <div className="grid gap-4" style={{ gridTemplateColumns }}>
            {columns.map((column, index) => (
              <div
                key={index}
                className={`text-sm font-medium text-slate-700 ${column.className || ''}`}
              >
                {column.header}
              </div>
            ))}
            {hasActions && (
              <div className="text-sm font-medium text-slate-700 text-right min-w-[120px]">
                Actions
              </div>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-slate-500">Chargement...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Search className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-slate-500">{emptyStateMessage.title}</p>
              <p className="text-sm text-slate-400 mt-1">
                {emptyStateMessage.description}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedData.map((item) => (
                <div
                  key={item.id}
                  className={`px-4 py-3 transition-colors ${rowClassName}`}
                >
                  <div className="grid gap-4 items-center" style={{ gridTemplateColumns }}>
                    {columns.map((column, index) => (
                      <div
                        key={index}
                        className={`text-sm text-slate-900 ${column.className || ''}`}
                      >
                        {renderCell(item, column)}
                      </div>
                    ))}
                    {hasActions && (
                      <div className="flex justify-end gap-2 min-w-[120px]">
                        {detailsRoute && (
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                          >
                            <Link to={detailsRoute(item.id)}>
                              {detailsButtonLabel}
                            </Link>
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700"
                            onClick={() => {
                              setItemToDelete(item.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer - Always visible at bottom */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="h-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Lignes par page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-slate-600">
            {startIndex + 1}-{Math.min(endIndex, data.length)} sur {data.length}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

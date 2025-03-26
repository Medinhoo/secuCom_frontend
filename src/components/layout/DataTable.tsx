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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
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
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<void>;
  detailsRoute: (id: string) => string;
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
  rowClassName = "hover:bg-slate-50 border-b border-slate-100 group",
  detailsButtonLabel = "Voir détails",
}: DataTableProps<T>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <Card className="border-0 shadow-sm bg-white overflow-hidden h-full">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="h-[calc(100vh-400px)] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={`text-blue-700 font-medium ${
                      column.className || ""
                    }`}
                  >
                    {column.header}
                  </TableHead>
                ))}
                {(!!onDelete || !!detailsRoute) && (
                  <TableHead className="text-blue-700 font-medium text-right">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length + (!!onDelete || !!detailsRoute ? 1 : 0)
                    }
                    className="text-center py-10"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                      <p className="text-slate-500">Chargement...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length + (!!onDelete || !!detailsRoute ? 1 : 0)
                    }
                    className="text-center py-10 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-slate-300 mb-2" />
                      <p>{emptyStateMessage.title}</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {emptyStateMessage.description}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id} className={rowClassName}>
                    {columns.map((column, index) => (
                      <TableCell key={index} className={column.className}>
                        {renderCell(item, column)}
                      </TableCell>
                    ))}
                    {(!!onDelete || !!detailsRoute) && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-500">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">Lignes par page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[100px]">
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
        <div className="text-sm text-slate-500">
          {startIndex + 1}-{Math.min(endIndex, data.length)} sur {data.length}
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
    </Card>
  );
}

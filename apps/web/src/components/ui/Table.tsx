import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  // Box,
  Typography,
} from "@mui/material";
import { useState } from "react";

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  pagination?: boolean;
  rowsPerPageOptions?: number[];
}

export function Table<T extends { _id?: string; id?: string }>({
  columns,
  rows,
  loading,
  pagination = true,
  rowsPerPageOptions = [10, 25, 100],
}: TableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  const handleChangePage = (_unknown: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (loading) {
    return <Typography sx={{ p: 2 }}>Carregando dados...</Typography>;
  }

  if (rows.length === 0) {
    return <Typography sx={{ p: 2 }}>Nenhum registro encontrado.</Typography>;
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <MuiTable stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const rowKey = row._id || row.id || index;
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={rowKey}>
                    {columns.map((column) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const value = (row as any)[column.id];
                      return (
                        <TableCell key={String(column.id)} align={column.align}>
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
        />
      )}
    </Paper>
  );
}

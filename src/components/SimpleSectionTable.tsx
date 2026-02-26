import { Button, HStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  title: string;
  render?: (item: T) => ReactNode;
};

type RowAction<T> = {
  key: string;
  label: string;
  onClick: (item: T) => void;
  colorScheme?: string;
  variant?: "solid" | "outline" | "ghost" | "link";
  isDisabled?: (item: T) => boolean;
  isHidden?: (item: T) => boolean;
};

interface SimpleSectionTableProps<T> {
  title: string;
  items: T[];
  columns: Column<T>[];
  onOpenDetails?: (item: T) => void;
  detailsButtonText?: string;
  emptyText?: string;
  getRowKey?: (item: T, index: number) => string | number;
  rowActions?: RowAction<T>[];
}

function getSafeDefaultKey(index: number): string {
  return `row-${index}`;
}

export default function SimpleSectionTable<T>({
  title,
  items,
  columns,
  onOpenDetails,
  detailsButtonText = "Подробнее",
  emptyText = "Список пуст",
  getRowKey,
  rowActions = [],
}: SimpleSectionTableProps<T>) {
  const hasActionColumn = Boolean(onOpenDetails) || rowActions.length > 0;

  return (
    <div className="border border-app-border bg-app-panel p-4 shadow-panel rounded-none">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-app-text">{title}</h2>
        <span className="text-sm text-app-muted">Всего: {items.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-app-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-app-muted"
                >
                  {column.title}
                </th>
              ))}
              {hasActionColumn && (
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-app-muted">
                  Действия
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActionColumn ? 1 : 0)}
                  className="px-3 py-8 text-center text-sm text-app-muted"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              items.map((item, rowIndex) => {
                const rowKey =
                  getRowKey?.(item, rowIndex) ?? getSafeDefaultKey(rowIndex);

                const visibleRowActions = rowActions.filter(
                  (action) => !action.isHidden?.(item),
                );

                return (
                  <tr
                    key={String(rowKey)}
                    className="border-b border-app-border/60 transition-colors hover:bg-app-accentSoft/15"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-3 py-3 text-sm text-app-text"
                      >
                        {column.render
                          ? column.render(item)
                          : (item as Record<string, ReactNode>)[column.key]}
                      </td>
                    ))}

                    {hasActionColumn && (
                      <td className="px-3 py-3 text-right">
                        <HStack justify="flex-end" spacing={2}>
                          {visibleRowActions.map((action) => (
                            <Button
                              key={action.key}
                              size="sm"
                              colorScheme={action.colorScheme ?? "gray"}
                              variant={action.variant ?? "outline"}
                              onClick={() => action.onClick(item)}
                              isDisabled={action.isDisabled?.(item) ?? false}
                            >
                              {action.label}
                            </Button>
                          ))}

                          {onOpenDetails && (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => onOpenDetails(item)}
                            >
                              {detailsButtonText}
                            </Button>
                          )}
                        </HStack>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DEFAULT_MAX_COLUMN_WIDTH = 1200;

export type ResizableTableColumn = {
  readonly id: string;
  readonly defaultWidth: number;
  readonly minWidth: number;
  readonly maxWidth?: number;
};

type WidthMap = Record<string, number>;

type HeaderCellResizeProps = {
  readonly isResizable: boolean;
  readonly isResizing: boolean;
  readonly onResizeReset: () => void;
  readonly onResizeStart: (event: ReactMouseEvent<HTMLElement>) => void;
};

type UseResizableTableColumnsOptions = {
  readonly allowHorizontalOverflow?: boolean;
  readonly columns: readonly ResizableTableColumn[];
  readonly storageKey: string;
};

export function useResizableTableColumns({
  allowHorizontalOverflow = false,
  columns,
  storageKey,
}: UseResizableTableColumnsOptions) {
  const defaultWidths = useMemo(() => getDefaultWidths(columns), [columns]);
  const columnsById = useMemo(
    () => new Map(columns.map((column) => [column.id, column])),
    [columns],
  );
  const [widths, setWidths] = useState<WidthMap>(() =>
    readStoredWidths(storageKey, columns),
  );
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
    },
    [],
  );

  useLayoutEffect(() => {
    const element = tableContainerRef.current;
    if (!element || typeof window === "undefined") {
      return;
    }

    const updateContainerWidth = () => {
      setContainerWidth(Math.floor(element.clientWidth));
    };

    updateContainerWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateContainerWidth);

      return () => {
        window.removeEventListener("resize", updateContainerWidth);
      };
    }

    const resizeObserver = new ResizeObserver(updateContainerWidth);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const displayWidths = useMemo(
    () => {
      const targetWidth = allowHorizontalOverflow
        ? Math.max(containerWidth, getMinimumColumnWidthTotal(columns))
        : containerWidth;

      return fitWidthsToContainer(widths, columns, targetWidth);
    },
    [allowHorizontalOverflow, columns, containerWidth, widths],
  );

  const gridTemplateColumns = useMemo(
    () =>
      columns
        .map((column) => {
          const width = Math.max(
            1,
            Math.round(displayWidths[column.id] ?? column.defaultWidth),
          );

          return `${width}px`;
        })
        .join(" "),
    [columns, displayWidths],
  );

  const tableContainerStyle = useMemo(
    () =>
      ({
        "--list-table-grid-template": gridTemplateColumns,
      }) as CSSProperties,
    [gridTemplateColumns],
  );

  const resetColumnWidths = useCallback(() => {
    resizeCleanupRef.current?.();
    resizeCleanupRef.current = null;
    setResizingColumnId(null);
    setWidths(defaultWidths);
    removeStoredWidths(storageKey);
  }, [defaultWidths, storageKey]);

  const startColumnResize = useCallback(
    (
      columnId: string,
      columnIndex: number,
      event: ReactMouseEvent<HTMLElement>,
    ) => {
      if (event.button !== 0) {
        return;
      }

      const column = columnsById.get(columnId);
      const nextColumn = columns[columnIndex + 1];
      if (!column || !nextColumn) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      resizeCleanupRef.current?.();

      const startX = event.clientX;
      const startWidth = clampColumnWidth(
        displayWidths[columnId] ?? column.defaultWidth,
        column,
      );
      const nextStartWidth = clampColumnWidth(
        displayWidths[nextColumn.id] ?? nextColumn.defaultWidth,
        nextColumn,
      );
      const originalCursor = document.body.style.cursor;
      const originalUserSelect = document.body.style.userSelect;

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      setResizingColumnId(columnId);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = getBoundedPairDelta(
          moveEvent.clientX - startX,
          column,
          nextColumn,
          startWidth,
          nextStartWidth,
        );
        const nextWidth = startWidth + delta;
        const adjustedNextWidth = nextStartWidth - delta;

        setWidths(() => {
          const next = normalizeWidths(
            {
              ...displayWidths,
              [columnId]: nextWidth,
              [nextColumn.id]: adjustedNextWidth,
            },
            columns,
          );

          writeStoredWidths(storageKey, next);

          return next;
        });
      };

      const cleanupResize = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", cleanupResize);
        document.body.style.cursor = originalCursor;
        document.body.style.userSelect = originalUserSelect;
        setResizingColumnId(null);

        if (resizeCleanupRef.current === cleanupResize) {
          resizeCleanupRef.current = null;
        }
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", cleanupResize);
      resizeCleanupRef.current = cleanupResize;
    },
    [columns, columnsById, displayWidths, storageKey],
  );

  const getHeaderCellResizeProps = useCallback(
    (columnId: string, columnIndex: number): HeaderCellResizeProps => ({
      isResizable: columnIndex < columns.length - 1,
      isResizing: resizingColumnId === columnId,
      onResizeReset: resetColumnWidths,
      onResizeStart: (event) => startColumnResize(columnId, columnIndex, event),
    }),
    [columns.length, resetColumnWidths, resizingColumnId, startColumnResize],
  );

  return {
    getHeaderCellResizeProps,
    resetColumnWidths,
    tableContainerRef,
    tableContainerStyle,
  };
}

function getDefaultWidths(columns: readonly ResizableTableColumn[]): WidthMap {
  return Object.fromEntries(
    columns.map((column) => [
      column.id,
      clampColumnWidth(column.defaultWidth, column),
    ]),
  );
}

function readStoredWidths(
  storageKey: string,
  columns: readonly ResizableTableColumn[],
): WidthMap {
  if (typeof window === "undefined") {
    return getDefaultWidths(columns);
  }

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) {
    return getDefaultWidths(columns);
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!isWidthMap(parsed)) {
      return getDefaultWidths(columns);
    }

    return normalizeWidths(parsed, columns);
  } catch {
    return getDefaultWidths(columns);
  }
}

function writeStoredWidths(storageKey: string, widths: WidthMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(widths));
}

function removeStoredWidths(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);
}

function normalizeWidths(
  source: WidthMap,
  columns: readonly ResizableTableColumn[],
): WidthMap {
  return Object.fromEntries(
    columns.map((column) => {
      const width = source[column.id];
      const nextWidth =
        typeof width === "number" && Number.isFinite(width)
          ? width
          : column.defaultWidth;

      return [column.id, clampColumnWidth(nextWidth, column)];
    }),
  );
}

function clampColumnWidth(width: number, column: ResizableTableColumn) {
  return Math.round(
    Math.min(
      Math.max(width, column.minWidth),
      column.maxWidth ?? DEFAULT_MAX_COLUMN_WIDTH,
    ),
  );
}

function fitWidthsToContainer(
  source: WidthMap,
  columns: readonly ResizableTableColumn[],
  containerWidth: number,
) {
  const normalizedWidths = normalizeWidths(source, columns);
  const targetWidth = Math.floor(containerWidth);
  if (targetWidth <= 0 || columns.length === 0) {
    return normalizedWidths;
  }

  const nextWidths = columns.map(
    (column) => normalizedWidths[column.id] ?? column.defaultWidth,
  );
  const currentTotalWidth = sum(nextWidths);
  if (currentTotalWidth === targetWidth) {
    return normalizedWidths;
  }

  if (currentTotalWidth > targetWidth) {
    shrinkWidthsToTarget(nextWidths, columns, targetWidth);
  } else {
    growWidthsToTarget(nextWidths, columns, targetWidth);
  }

  return widthsArrayToMap(
    columns,
    roundWidthsToAvailableTotal(nextWidths, targetWidth),
  );
}

function shrinkWidthsToTarget(
  widths: number[],
  columns: readonly ResizableTableColumn[],
  targetWidth: number,
) {
  let overflowWidth = sum(widths) - targetWidth;
  if (overflowWidth <= 0) {
    return;
  }

  const minimumWidths = getEffectiveMinimumWidths(columns, targetWidth);
  while (overflowWidth > 0.01) {
    const capacities = widths.map((width, index) => {
      const minimumWidth = minimumWidths[index] ?? 0;

      return Math.max(0, width - minimumWidth);
    });
    const totalCapacity = sum(capacities);
    if (totalCapacity <= 0) {
      return;
    }

    let removedWidth = 0;
    for (let index = 0; index < widths.length; index += 1) {
      const capacity = capacities[index] ?? 0;
      if (capacity <= 0) {
        continue;
      }

      const widthToRemove = Math.min(
        capacity,
        overflowWidth * (capacity / totalCapacity),
      );
      widths[index] = (widths[index] ?? 0) - widthToRemove;
      removedWidth += widthToRemove;
    }

    if (removedWidth <= 0) {
      return;
    }
    overflowWidth -= removedWidth;
  }
}

function growWidthsToTarget(
  widths: number[],
  columns: readonly ResizableTableColumn[],
  targetWidth: number,
) {
  let remainingWidth = targetWidth - sum(widths);
  if (remainingWidth <= 0) {
    return;
  }

  while (remainingWidth > 0.01) {
    const capacities = widths.map((width, index) => {
      const column = columns[index];
      const maxWidth = column?.maxWidth ?? DEFAULT_MAX_COLUMN_WIDTH;

      return Math.max(0, maxWidth - width);
    });
    const totalCapacity = sum(capacities);
    if (totalCapacity <= 0) {
      return;
    }

    let addedWidth = 0;
    for (let index = 0; index < widths.length; index += 1) {
      const capacity = capacities[index] ?? 0;
      if (capacity <= 0) {
        continue;
      }

      const widthToAdd = Math.min(
        capacity,
        remainingWidth * (capacity / totalCapacity),
      );
      widths[index] = (widths[index] ?? 0) + widthToAdd;
      addedWidth += widthToAdd;
    }

    if (addedWidth <= 0) {
      return;
    }
    remainingWidth -= addedWidth;
  }
}

function getEffectiveMinimumWidths(
  columns: readonly ResizableTableColumn[],
  targetWidth: number,
) {
  const minimumWidths = columns.map((column) => column.minWidth);
  const minimumTotalWidth = sum(minimumWidths);
  if (targetWidth >= minimumTotalWidth) {
    return minimumWidths;
  }

  const scale = targetWidth / minimumTotalWidth;
  return minimumWidths.map((width) => width * scale);
}

function getMinimumColumnWidthTotal(columns: readonly ResizableTableColumn[]) {
  return sum(columns.map((column) => column.minWidth));
}

function getBoundedPairDelta(
  delta: number,
  column: ResizableTableColumn,
  nextColumn: ResizableTableColumn,
  startWidth: number,
  nextStartWidth: number,
) {
  const minDelta = Math.max(
    column.minWidth - startWidth,
    nextStartWidth - (nextColumn.maxWidth ?? DEFAULT_MAX_COLUMN_WIDTH),
  );
  const maxDelta = Math.min(
    (column.maxWidth ?? DEFAULT_MAX_COLUMN_WIDTH) - startWidth,
    nextStartWidth - nextColumn.minWidth,
  );

  return Math.min(Math.max(delta, minDelta), maxDelta);
}

function widthsArrayToMap(
  columns: readonly ResizableTableColumn[],
  widths: readonly number[],
): WidthMap {
  return Object.fromEntries(
    columns.map((column, index) => [
      column.id,
      widths[index] ?? column.defaultWidth,
    ]),
  );
}

function roundWidthsToAvailableTotal(
  widths: readonly number[],
  availableWidth: number,
) {
  const roundedWidths = widths.map((width) => Math.max(1, Math.floor(width)));
  const desiredTotalWidth = Math.min(availableWidth, Math.round(sum(widths)));
  let remainingWidth = desiredTotalWidth - sum(roundedWidths);

  for (
    let index = 0;
    remainingWidth > 0 && index < roundedWidths.length;
    index += 1
  ) {
    roundedWidths[index] = (roundedWidths[index] ?? 1) + 1;
    remainingWidth -= 1;
  }

  return roundedWidths;
}

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function isWidthMap(value: unknown): value is WidthMap {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === "number");
}

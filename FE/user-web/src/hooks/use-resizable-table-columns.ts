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

// 기능 : Resizable Table Columns hook으로 상태와 동작을 제공합니다.
export function useResizableTableColumns({
  allowHorizontalOverflow = false,
  columns,
  storageKey,
}: UseResizableTableColumnsOptions) {
  // 1. 화면 상태와 동작에 필요한 defaultWidths 값을 준비한다.
  const defaultWidths = useMemo(() => getDefaultWidths(columns), [columns]);
  // 2. 화면 상태와 동작에 필요한 columnsById 값을 준비한다.
  const columnsById = useMemo(
    () => new Map(columns.map((column) => [column.id, column])),
    [columns],
  );
  // 3. 화면 상태와 동작에 필요한 [widths, setWidths] 값을 준비한다.
  const [widths, setWidths] = useState<WidthMap>(() =>
    readStoredWidths(storageKey, columns),
  );
  // 4. 화면 상태와 동작에 필요한 [resizingColumnId, setResizingColumnId] 값을 준비한다.
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);
  // 5. 화면 상태와 동작에 필요한 [containerWidth, setContainerWidth] 값을 준비한다.
  const [containerWidth, setContainerWidth] = useState(0);
  // 6. 화면 상태와 동작에 필요한 tableContainerRef 값을 준비한다.
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  // 7. 화면 상태와 동작에 필요한 resizeCleanupRef 값을 준비한다.
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  // 8. 현재 단계에서 필요한 side effect를 실행한다.
  useEffect(
    () => () => {
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
    },
    [],
  );

  // 9. 현재 단계에서 필요한 side effect를 실행한다.
  useLayoutEffect(() => {
    // 1. 이후 처리에 사용할 element을 계산한다.
    const element = tableContainerRef.current;
    // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!element || typeof window === "undefined") {
      return;
    }

    // 기능 : update Container Width 정보를 수정합니다.
    // 3. 이후 처리에 사용할 updateContainerWidth을 계산한다.
    const updateContainerWidth = () => {
      setContainerWidth(Math.floor(element.clientWidth));
    };

    // 4. 현재 단계에서 필요한 side effect를 실행한다.
    updateContainerWidth();

    // 5. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateContainerWidth);

      return () => {
        window.removeEventListener("resize", updateContainerWidth);
      };
    }

    // 6. 이후 처리에 사용할 resizeObserver을 계산한다.
    const resizeObserver = new ResizeObserver(updateContainerWidth);
    // 7. 현재 단계에서 필요한 side effect를 실행한다.
    resizeObserver.observe(element);

    // 8. 계산된 결과를 호출자에게 반환한다.
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 10. 화면 상태와 동작에 필요한 displayWidths 값을 준비한다.
  const displayWidths = useMemo(
    () => {
      const targetWidth = allowHorizontalOverflow
        ? Math.max(containerWidth, getMinimumColumnWidthTotal(columns))
        : containerWidth;

      return fitWidthsToContainer(widths, columns, targetWidth);
    },
    [allowHorizontalOverflow, columns, containerWidth, widths],
  );

  // 11. 화면 상태와 동작에 필요한 gridTemplateColumns 값을 준비한다.
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

  // 12. 화면 상태와 동작에 필요한 tableContainerStyle 값을 준비한다.
  const tableContainerStyle = useMemo(
    () =>
      ({
        "--list-table-grid-template": gridTemplateColumns,
      }) as CSSProperties,
    [gridTemplateColumns],
  );

  // 13. 화면 상태와 동작에 필요한 resetColumnWidths 값을 준비한다.
  const resetColumnWidths = useCallback(() => {
    // 1. 현재 단계에서 필요한 side effect를 실행한다.
    resizeCleanupRef.current?.();
    // 2. 현재 단계에서 필요한 side effect를 실행한다.
    resizeCleanupRef.current = null;
    // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setResizingColumnId(null);
    // 4. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setWidths(defaultWidths);
    // 5. 현재 단계에서 필요한 side effect를 실행한다.
    removeStoredWidths(storageKey);
  }, [defaultWidths, storageKey]);

  // 14. 화면 상태와 동작에 필요한 startColumnResize 값을 준비한다.
  const startColumnResize = useCallback(
    (
      columnId: string,
      columnIndex: number,
      event: ReactMouseEvent<HTMLElement>,
    ) => {
      // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
      if (event.button !== 0) {
        return;
      }

      // 2. 이후 처리에 사용할 column을 계산한다.
      const column = columnsById.get(columnId);
      // 3. 이후 처리에 사용할 nextColumn을 계산한다.
      const nextColumn = columns[columnIndex + 1];
      // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
      if (!column || !nextColumn) {
        return;
      }

      // 5. 현재 단계에서 필요한 side effect를 실행한다.
      event.preventDefault();
      // 6. 현재 단계에서 필요한 side effect를 실행한다.
      event.stopPropagation();
      // 7. 현재 단계에서 필요한 side effect를 실행한다.
      resizeCleanupRef.current?.();

      // 8. 이후 처리에 사용할 startX을 계산한다.
      const startX = event.clientX;
      // 9. 이후 처리에 사용할 startWidth을 계산한다.
      const startWidth = clampColumnWidth(
        displayWidths[columnId] ?? column.defaultWidth,
        column,
      );
      // 10. 이후 처리에 사용할 nextStartWidth을 계산한다.
      const nextStartWidth = clampColumnWidth(
        displayWidths[nextColumn.id] ?? nextColumn.defaultWidth,
        nextColumn,
      );
      // 11. 이후 처리에 사용할 originalCursor을 계산한다.
      const originalCursor = document.body.style.cursor;
      // 12. 이후 처리에 사용할 originalUserSelect을 계산한다.
      const originalUserSelect = document.body.style.userSelect;

      // 13. 현재 단계에서 필요한 side effect를 실행한다.
      document.body.style.cursor = "col-resize";
      // 14. 현재 단계에서 필요한 side effect를 실행한다.
      document.body.style.userSelect = "none";
      // 15. 화면 상태를 현재 흐름에 맞게 갱신한다.
      setResizingColumnId(columnId);

      // 기능 : handle Mouse Move 이벤트를 처리합니다.
      // 16. 화면 상태와 동작에 필요한 handleMouseMove 값을 준비한다.
      const handleMouseMove = (moveEvent: MouseEvent) => {
        // 1. 이후 처리에 사용할 delta을 계산한다.
        const delta = getBoundedPairDelta(
          moveEvent.clientX - startX,
          column,
          nextColumn,
          startWidth,
          nextStartWidth,
        );
        // 2. 이후 처리에 사용할 nextWidth을 계산한다.
        const nextWidth = startWidth + delta;
        // 3. 이후 처리에 사용할 adjustedNextWidth을 계산한다.
        const adjustedNextWidth = nextStartWidth - delta;

        // 4. 화면 상태를 현재 흐름에 맞게 갱신한다.
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

      // 기능 : cleanup Resize 기능을 수행합니다.
      // 17. 화면 상태와 동작에 필요한 cleanupResize 값을 준비한다.
      const cleanupResize = () => {
        // 1. 브라우저 이벤트 listener를 등록하거나 정리한다.
        window.removeEventListener("mousemove", handleMouseMove);
        // 2. 브라우저 이벤트 listener를 등록하거나 정리한다.
        window.removeEventListener("mouseup", cleanupResize);
        // 3. 현재 단계에서 필요한 side effect를 실행한다.
        document.body.style.cursor = originalCursor;
        // 4. 현재 단계에서 필요한 side effect를 실행한다.
        document.body.style.userSelect = originalUserSelect;
        // 5. 화면 상태를 현재 흐름에 맞게 갱신한다.
        setResizingColumnId(null);

        // 6. 조건을 확인해 필요한 분기 처리를 수행한다.
        if (resizeCleanupRef.current === cleanupResize) {
          resizeCleanupRef.current = null;
        }
      };

      // 18. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.addEventListener("mousemove", handleMouseMove);
      // 19. 브라우저 이벤트 listener를 등록하거나 정리한다.
      window.addEventListener("mouseup", cleanupResize);
      // 20. 현재 단계에서 필요한 side effect를 실행한다.
      resizeCleanupRef.current = cleanupResize;
    },
    [columns, columnsById, displayWidths, storageKey],
  );

  // 15. 화면 상태와 동작에 필요한 getHeaderCellResizeProps 값을 준비한다.
  const getHeaderCellResizeProps = useCallback(
    (columnId: string, columnIndex: number): HeaderCellResizeProps => ({
      isResizable: columnIndex < columns.length - 1,
      isResizing: resizingColumnId === columnId,
      onResizeReset: resetColumnWidths,
      onResizeStart: (event) => startColumnResize(columnId, columnIndex, event),
    }),
    [columns.length, resetColumnWidths, resizingColumnId, startColumnResize],
  );

  // 16. 계산된 결과를 호출자에게 반환한다.
  return {
    getHeaderCellResizeProps,
    resetColumnWidths,
    tableContainerRef,
    tableContainerStyle,
  };
}

// 기능 : get Default Widths 값을 조회합니다.
function getDefaultWidths(columns: readonly ResizableTableColumn[]): WidthMap {
  return Object.fromEntries(
    columns.map((column) => [
      column.id,
      clampColumnWidth(column.defaultWidth, column),
    ]),
  );
}

// 기능 : read Stored Widths 값을 읽습니다.
function readStoredWidths(
  storageKey: string,
  columns: readonly ResizableTableColumn[],
): WidthMap {
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (typeof window === "undefined") {
    return getDefaultWidths(columns);
  }

  // 2. 브라우저 저장소에서 필요한 값을 준비한다.
  const rawValue = window.localStorage.getItem(storageKey);
  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!rawValue) {
    return getDefaultWidths(columns);
  }

  // 4. 실패 가능성이 있는 작업을 실행하고 오류를 처리한다.
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

// 기능 : write Stored Widths 값을 저장소에 기록합니다.
function writeStoredWidths(storageKey: string, widths: WidthMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(widths));
}

// 기능 : remove Stored Widths 값을 제거합니다.
function removeStoredWidths(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);
}

// 기능 : normalize Widths 값을 내부 기준으로 정규화합니다.
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

// 기능 : clamp Column Width 기능을 수행합니다.
function clampColumnWidth(width: number, column: ResizableTableColumn) {
  return Math.round(
    Math.min(
      Math.max(width, column.minWidth),
      column.maxWidth ?? DEFAULT_MAX_COLUMN_WIDTH,
    ),
  );
}

// 기능 : fit Widths To Container 기능을 수행합니다.
function fitWidthsToContainer(
  source: WidthMap,
  columns: readonly ResizableTableColumn[],
  containerWidth: number,
) {
  // 1. 이후 처리에 사용할 normalizedWidths을 계산한다.
  const normalizedWidths = normalizeWidths(source, columns);
  // 2. 이후 처리에 사용할 targetWidth을 계산한다.
  const targetWidth = Math.floor(containerWidth);
  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (targetWidth <= 0 || columns.length === 0) {
    return normalizedWidths;
  }

  // 4. 이후 처리에 사용할 nextWidths을 계산한다.
  const nextWidths = columns.map(
    (column) => normalizedWidths[column.id] ?? column.defaultWidth,
  );
  // 5. 이후 처리에 사용할 currentTotalWidth을 계산한다.
  const currentTotalWidth = sum(nextWidths);
  // 6. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (currentTotalWidth === targetWidth) {
    return normalizedWidths;
  }

  // 7. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (currentTotalWidth > targetWidth) {
    shrinkWidthsToTarget(nextWidths, columns, targetWidth);
  } else {
    growWidthsToTarget(nextWidths, columns, targetWidth);
  }

  // 8. 계산된 결과를 호출자에게 반환한다.
  return widthsArrayToMap(
    columns,
    roundWidthsToAvailableTotal(nextWidths, targetWidth),
  );
}

// 기능 : shrink Widths To Target 기능을 수행합니다.
function shrinkWidthsToTarget(
  widths: number[],
  columns: readonly ResizableTableColumn[],
  targetWidth: number,
) {
  // 1. 이후 처리에 사용할 overflowWidth을 계산한다.
  let overflowWidth = sum(widths) - targetWidth;
  // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (overflowWidth <= 0) {
    return;
  }

  // 3. 이후 처리에 사용할 minimumWidths을 계산한다.
  const minimumWidths = getEffectiveMinimumWidths(columns, targetWidth);
  // 4. 현재 처리 흐름의 다음 단계를 수행한다.
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

// 기능 : grow Widths To Target 기능을 수행합니다.
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

// 기능 : get Effective Minimum Widths 값을 조회합니다.
function getEffectiveMinimumWidths(
  columns: readonly ResizableTableColumn[],
  targetWidth: number,
) {
  // 1. 이후 처리에 사용할 minimumWidths을 계산한다.
  const minimumWidths = columns.map((column) => column.minWidth);
  // 2. 이후 처리에 사용할 minimumTotalWidth을 계산한다.
  const minimumTotalWidth = sum(minimumWidths);
  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (targetWidth >= minimumTotalWidth) {
    return minimumWidths;
  }

  // 4. 이후 처리에 사용할 scale을 계산한다.
  const scale = targetWidth / minimumTotalWidth;
  // 5. 계산된 결과를 호출자에게 반환한다.
  return minimumWidths.map((width) => width * scale);
}

// 기능 : get Minimum Column Width Total 값을 조회합니다.
function getMinimumColumnWidthTotal(columns: readonly ResizableTableColumn[]) {
  return sum(columns.map((column) => column.minWidth));
}

// 기능 : get Bounded Pair Delta 값을 조회합니다.
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

// 기능 : widths Array To Map 기능을 수행합니다.
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

// 기능 : round Widths To Available Total 기능을 수행합니다.
function roundWidthsToAvailableTotal(
  widths: readonly number[],
  availableWidth: number,
) {
  // 1. 이후 처리에 사용할 roundedWidths을 계산한다.
  const roundedWidths = widths.map((width) => Math.max(1, Math.floor(width)));
  // 2. 이후 처리에 사용할 desiredTotalWidth을 계산한다.
  const desiredTotalWidth = Math.min(availableWidth, Math.round(sum(widths)));
  // 3. 이후 처리에 사용할 remainingWidth을 계산한다.
  let remainingWidth = desiredTotalWidth - sum(roundedWidths);

  // 4. 대상 목록을 순회하며 필요한 값을 처리한다.
  for (
    let index = 0;
    remainingWidth > 0 && index < roundedWidths.length;
    index += 1
  ) {
    roundedWidths[index] = (roundedWidths[index] ?? 1) + 1;
    remainingWidth -= 1;
  }

  // 5. 계산된 결과를 호출자에게 반환한다.
  return roundedWidths;
}

// 기능 : sum 기능을 수행합니다.
function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0);
}

// 기능 : is Width Map 여부를 판별합니다.
function isWidthMap(value: unknown): value is WidthMap {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === "number");
}

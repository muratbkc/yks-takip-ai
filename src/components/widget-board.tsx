"use client";

import {
  MouseSensor,
  TouchSensor,
  DndContext,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useMemo,
  useState,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useStudyStore } from "@/store/use-study-store";
import type { MockExam, StudyEntry, WidgetConfig, WidgetSize } from "@/types";
import { TimeSeriesCard } from "./charts/time-series-card";
import { LessonRadarCard } from "./charts/radar-distribution-card";
import { NetTrendCard } from "./charts/net-trend-card";
import { PlanSuggestion } from "./plan-suggestion";
import { BadgeCheck, Ruler, Palette, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { chartInfo } from "@/lib/chart-info";

interface WidgetBoardProps {
  entries: StudyEntry[];
  exams: MockExam[];
}

const componentMap = (
  entries: StudyEntry[],
  exams: MockExam[],
): Record<string, ReactNode> => ({
  timeSeries: <TimeSeriesCard entries={entries} />,
  lessonRadar: <LessonRadarCard entries={entries} />,
  mockPerformance: <NetTrendCard exams={exams} />,
  planSuggestion: <PlanSuggestion />,
});

function SortableWidget({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={className}
    >
      {children}
    </div>
  );
}

const sizeClasses: Record<WidgetSize, string> = {
  md: "md:col-span-6",
  lg: "md:col-span-12",
};

const heightClasses: Record<WidgetSize, string> = {
  md: "min-h-[320px]",
  lg: "min-h-[380px]",
};

const sizeOptions: Array<{ label: string; value: WidgetSize }> = [
  { label: "M", value: "md" },
  { label: "L", value: "lg" },
];

const BOARD_CAPACITY = 4;

const chunkWidgets = (items: WidgetConfig[], chunkSize: number) => {
  if (chunkSize <= 0) return [items];
  const chunks: WidgetConfig[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
};

function WidgetFrame({
  widget,
  children,
  onSizeChange,
}: {
  widget: WidgetConfig;
  children: ReactNode;
  onSizeChange: (size: WidgetSize) => void;
}) {
  const info =
    chartInfo[widget.component as keyof typeof chartInfo] || null;

  return (
    <div className="relative flex h-full flex-col rounded-[32px] border border-white/10 bg-emerald-900/50 p-4 text-white shadow-[0_20px_45px_rgba(4,12,9,0.45)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <div className="relative z-10 mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-100">
        <div className="flex items-center gap-2">
          <span>{widget.title}</span>
          {info && (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-white/50 transition hover:text-white"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="text-slate-900 dark:text-slate-50">
                <DialogHeader>
                  <DialogTitle>{info.title}</DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    {info.description}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] font-bold text-white">
          {sizeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSizeChange(option.value)}
              className={cn(
                "h-6 w-6 rounded-full transition focus:outline-none",
                option.value === widget.size
                  ? "bg-white text-emerald-900 shadow"
                  : "text-white/70 hover:bg-white/10",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative z-10 flex flex-1 rounded-2xl border border-white/10 bg-white/95 p-2 shadow-inner">
        <div className="h-full w-full overflow-hidden rounded-2xl bg-white">
          {children}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 h-px bg-white/10" />
    </div>
  );
}

export function WidgetBoard({ entries, exams }: WidgetBoardProps) {
  const widgets = useStudyStore((state) => state.widgets);
  const reorderWidgets = useStudyStore((state) => state.reorderWidgets);
  const updateWidgetSize = useStudyStore((state) => state.updateWidgetSize);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor),
  );

  const components = useMemo(
    () => componentMap(entries, exams),
    [entries, exams],
  );

  const visibleWidgets = widgets.filter((widget) => widget.visible);
  const boardChunks = chunkWidgets(visibleWidgets, BOARD_CAPACITY);
  const boards = boardChunks.length ? boardChunks : [[]];

  const renderBoardShell = (
    boardIndex: number,
    content: ReactNode,
  ): ReactNode => (
    <div
      key={`board-${boardIndex}`}
      className="relative overflow-hidden rounded-[28px] border-8 border-amber-900 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 px-6 py-6 shadow-[0_25px_60px_rgba(6,15,9,0.6)]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-[20px] border border-white/10 opacity-60" />
      <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[repeating-linear-gradient(0deg,transparent,transparent_48px,rgba(255,255,255,0.04)_50px)]" />
      <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.1),transparent_65%)]" />
      <div className="relative z-10 mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100">
        <span>Tahta {boardIndex + 1}</span>
        <span className="flex items-center gap-2 text-[10px] text-emerald-50/70">
          <Ruler className="h-3 w-3" />
          Kartları sürükle, boyutlandır
        </span>
      </div>
      <div className="relative z-10">{content}</div>
    </div>
  );

  // Hydration hatasını önlemek için DndContext'i sadece client-side render et
  if (!isMounted) {
    return (
      <div className="space-y-8">
        {boards.map((group, boardIndex) =>
          renderBoardShell(
            boardIndex,
            <div className="grid auto-rows-[minmax(220px,auto)] grid-cols-12 gap-4">
              {group.map((widget) => {
                const spanClass = cn(
                  "col-span-12",
                  sizeClasses[widget.size],
                  heightClasses[widget.size],
                );
                return (
                  <div key={widget.id} className={spanClass}>
                    <WidgetFrame widget={widget} onSizeChange={() => {}}>
                      {components[widget.component]}
                    </WidgetFrame>
                  </div>
                );
              })}
            </div>,
          ),
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3 text-[12px] font-medium uppercase tracking-[0.35em] text-emerald-900">
        <span className="inline-flex items-center gap-2 text-slate-600">
          <Palette className="h-4 w-4" />
          Sınıf Tahtası Duvarı
        </span>
        <span className="inline-flex items-center gap-2 text-slate-500">
          <Ruler className="h-4 w-4" />
          Kart Boyutu: M • L
        </span>
        <span className="inline-flex items-center gap-2 text-slate-500">
          <BadgeCheck className="h-3 w-3" />
          Sürükle-bırak ile yerleştir
        </span>
      </div>
      <DndContext
        sensors={sensors}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          reorderWidgets(String(active.id), String(over.id));
        }}
      >
        <SortableContext
          items={visibleWidgets.map((widget) => widget.id)}
          strategy={rectSortingStrategy}
        >
          <div className="space-y-8">
            {boards.map((group, boardIndex) =>
              renderBoardShell(
                boardIndex,
                <div className="grid auto-rows-[minmax(220px,auto)] grid-cols-12 gap-4">
                  {group.length === 0 ? (
                    <div className="col-span-12 rounded-2xl border border-white/10 bg-white/10 p-6 text-center text-sm text-white/80">
                      Bu tahtada görüntülenecek kart yok.
                    </div>
                  ) : (
                    group.map((widget) => {
                      const spanClass = cn(
                        "col-span-12",
                        sizeClasses[widget.size],
                        heightClasses[widget.size],
                      );
                      return (
                        <SortableWidget
                          key={widget.id}
                          id={widget.id}
                          className={spanClass}
                        >
                          <WidgetFrame
                            widget={widget}
                            onSizeChange={(size) =>
                              updateWidgetSize(widget.id, size)
                            }
                          >
                            {components[widget.component]}
                          </WidgetFrame>
                        </SortableWidget>
                      );
                    })
                  )}
                </div>,
              ),
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}


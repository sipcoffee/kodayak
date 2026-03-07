"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { GifPhoto } from "@/lib/gif-generator/types";

interface SortablePhotoProps {
  photo: GifPhoto;
  index: number;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

function SortablePhoto({ photo, index, onRemove, disabled }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex-shrink-0 group"
    >
      <div className="relative h-20 w-20 rounded-md overflow-hidden border bg-muted">
        <Image
          src={photo.thumbnailUrl || photo.url}
          alt={`Photo ${index + 1}`}
          fill
          className="object-cover"
        />
        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
          {index + 1}
        </div>
        {!disabled && (
          <>
            <button
              onClick={() => onRemove(photo.id)}
              className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
            <div
              {...attributes}
              {...listeners}
              className="absolute bottom-1 left-1/2 -translate-x-1/2 p-1 bg-black/60 text-white rounded cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="h-3 w-3" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface GifPreviewStripProps {
  photos: GifPhoto[];
  onReorder: (photos: GifPhoto[]) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function GifPreviewStrip({
  photos,
  onReorder,
  onRemove,
  disabled,
}: GifPreviewStripProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const photoIds = useMemo(() => photos.map((p) => p.id), [photos]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      onReorder(arrayMove(photos, oldIndex, newIndex));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {photos.length} photo{photos.length !== 1 ? "s" : ""} selected
        </p>
        {!disabled && (
          <p className="text-xs text-muted-foreground">
            Drag to reorder
          </p>
        )}
      </div>
      <div className="overflow-x-auto pb-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photoIds}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-2 min-w-max">
              {photos.map((photo, index) => (
                <SortablePhoto
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onRemove={onRemove}
                  disabled={disabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

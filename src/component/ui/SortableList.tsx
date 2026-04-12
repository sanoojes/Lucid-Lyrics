import { type Component, For, Show, createMemo } from "solid-js";
import { GripVertical, X } from "lucide-solid";
import { Button } from "~/component/ui/Button";
import { Select, type SelectOption } from "~/component/ui/Select";
import { toast } from "~/lib/sonner";
import "~/styles/component/sortable-list.scss";

export interface SortableItem {
  id: string;
  label: string;
}

export interface SortableListProps {
  items: SortableItem[];
  availableItems?: SortableItem[];
  minItems?: number;
  addPlaceholder?: string;
  emptyMessage?: string;
  removeTitle?: string;
  onReorder?: (items: SortableItem[]) => void;
  onRemove?: (id: string) => void;
  onAdd?: (id: string) => void;
}

export const SortableList: Component<SortableListProps> = (props) => {
  const minItems = () => props.minItems ?? 0;

  // const canRemove = () => props.items.length > minItems();

  const handleDragStart = (e: DragEvent, index: number) => {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    }
    const target = e.target as HTMLElement;
    target.classList.add("dragging");
  };

  const handleDragEnd = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    target.classList.remove("dragging");
  };

  const handleDragOver = (e: DragEvent, _targetIndex: number) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDrop = (e: DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer?.getData("text/plain"));
    if (isNaN(sourceIndex)) return;

    const items = props.items;
    if (sourceIndex === targetIndex) return;
    if (sourceIndex < 0 || sourceIndex >= items.length) return;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, moved);

    props.onReorder?.(newItems);
  };

  const handleRemove = (id: string) => {
    if (props.items.length <= minItems()) {
      toast.error(props.emptyMessage ?? "Cannot remove the last item");
      return;
    }
    props.onRemove?.(id);
  };

  const handleAdd = (value: string) => {
    if (value) {
      props.onAdd?.(value);
    }
  };

  const selectOptions = createMemo<SelectOption[]>(() => {
    const available = props.availableItems ?? [];
    const currentIds = new Set(props.items.map((i) => i.id));
    const filtered = available.filter((item) => !currentIds.has(item.id));
    return filtered.map((item) => ({ label: item.label, value: item.id }));
  });

  return (
    <div class="sortable-list">
      <For each={props.items}>
        {(item, index) => (
          <div
            class="sortable-item"
            draggable={true}
            onDragStart={(e) => handleDragStart(e, index())}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index())}
            onDrop={(e) => handleDrop(e, index())}
          >
            <GripVertical size={16} class="drag-handle" />
            <span class="item-label">{item.label}</span>
            <span class="item-badge">{index() + 1}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              // disabled={!canRemove()}
              title={props.removeTitle ?? "Remove"}
              onClick={() => handleRemove(item.id)}
            >
              <X size={14} />
            </Button>
          </div>
        )}
      </For>
      <Show when={selectOptions().length > 0}>
        <Select
          value=""
          onChange={handleAdd}
          options={[{ label: props.addPlaceholder ?? "Add", value: "" }, ...selectOptions()]}
        />
      </Show>
    </div>
  );
};

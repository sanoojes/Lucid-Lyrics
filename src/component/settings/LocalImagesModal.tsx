import "@/styles/modal/local-images.scss";
import { useDialog } from "@/lib/modal/component/Dialog";
import { showAlert, showModal } from "@/lib/modal";
import { X, Upload, Trash2, Image as ImageIcon, ImageOff } from "lucide-solid";
import { Button } from "@/component/ui/Button";
import { createSignal, For, Show, onMount, onCleanup } from "solid-js";
import {
  saveLocalImage,
  getAllLocalImages,
  deleteLocalImage,
  deleteAllLocalImages,
  createBlobUrl,
  revokeBlobUrl,
  type LocalImage,
} from "@/stores/idb/images";
import { updateLocalSelectedId } from "@/stores/background";
import { useStore } from "@nanostores/solid";
import { $background } from "@/stores/background";
import { t } from "@/i18n";
import SolidLenis from "@/component/ui/Lenis";

function LocalImagesModal() {
  const { close } = useDialog();
  const bg = useStore($background);
  const [images, setImages] = createSignal<LocalImage[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isDragging, setIsDragging] = createSignal(false);

  const selectedId = () => bg().options.image.local.selectedId;

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processImageFiles = async (files?: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    const savePromises = imageFiles.map((file) => saveLocalImage(file));
    const savedImages = await Promise.all(savePromises);

    setImages((prev) => [...prev, ...savedImages]);

    const lastSavedId = savedImages[savedImages.length - 1].id;
    updateLocalSelectedId(lastSavedId);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processImageFiles(e.dataTransfer?.files);
  };

  const handleFileUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    await processImageFiles(input.files);
    input.value = "";
  };

  onMount(async () => {
    const imgs = await getAllLocalImages();
    setImages(imgs);
    setIsLoading(false);
  });

  const handleDelete = async (id: string) => {
    const currentImages = images();
    const deletedIndex = currentImages.findIndex((img) => img.id === id);

    await deleteLocalImage(id);

    if (selectedId() === id) {
      let nextId;
      if (currentImages.length > 1) {
        if (deletedIndex > 0) {
          nextId = currentImages[deletedIndex - 1].id;
        } else {
          nextId = currentImages[1].id;
        }
      }

      updateLocalSelectedId(nextId);
    }

    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDeleteAll = () => {
    showAlert(t("bg.deleteAllConfirm"), async () => {
      await deleteAllLocalImages();
      updateLocalSelectedId(undefined);
      setImages([]);
    });
  };

  const handleSelect = (id: string) => {
    updateLocalSelectedId(id);
  };

  return (
    <div class="settings-modal l-img-modal">
      <header>
        <h2 class="title">{t("bg.localImages")}</h2>
        <Button onClick={close} variant="ghost" size="icon" shape="rounded">
          <X size={20} />
        </Button>
      </header>

      <SolidLenis onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <main class="content" classList={{ "drag-over": isDragging() }}>
          <div class="upload-section">
            <label class="l-btn l-btn--outline l-btn--default upload-button">
              <input type="file" accept="image/*" multiple onChange={handleFileUpload} hidden />
              <Upload size={20} />
              <span>{t("bg.uploadImages")}</span>
            </label>
            <Show when={images().length > 0}>
              <Button variant="destructive" onClick={handleDeleteAll}>
                <Trash2 size={16} />
                <span>{t("bg.deleteAll")}</span>
              </Button>
            </Show>
          </div>
          <Show when={!isLoading()} fallback={<div class="loading">{t("common.loading")}</div>}>
            <Show
              when={images().length > 0}
              fallback={
                <div class="empty-state">
                  <ImageIcon size={48} />
                  <p>{t("bg.noLocalImages")}</p>
                </div>
              }
            >
              <div class="image-grid">
                <For each={images()}>
                  {(image) => {
                    const isSelected = () => image.id === selectedId();
                    const hasFailed = () => image.thumbnailFailed || !image.thumbnail;

                    let imgUrl = "";
                    if (image.thumbnail) {
                      imgUrl = createBlobUrl(image.thumbnail);
                      onCleanup(() => revokeBlobUrl(imgUrl));
                    }

                    return (
                      <div
                        class="image-item"
                        classList={{ selected: isSelected() }}
                        onClick={() => handleSelect(image.id)}
                      >
                        <Show
                          when={image.thumbnail}
                          fallback={
                            <div class="thumbnail-error">
                              <ImageOff size={24} />
                            </div>
                          }
                        >
                          <img src={imgUrl} alt={image.name} />
                        </Show>
                        <Show when={hasFailed()}>
                          <div class="thumbnail-error">
                            <ImageOff size={24} />
                          </div>
                        </Show>
                        <div class="image-overlay">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(image.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        <Show when={isSelected()}>
                          <div class="selected-badge">{t("bg.selected")}</div>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Show>
        </main>
      </SolidLenis>
    </div>
  );
}

export const showLocalImagesModal = () => showModal(() => <LocalImagesModal />);

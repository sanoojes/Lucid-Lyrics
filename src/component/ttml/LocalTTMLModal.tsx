import "@/styles/modal/ttml-modal.scss";
import { useDialog } from "@/lib/modal/component/Dialog";
import { showModal, showAlert } from "@/lib/modal";
import { X, Upload, Trash2, FileText, Music, Download, Copy, Check } from "lucide-solid";
import { Button } from "@/component/ui/Button";
import { createSignal, createResource, createMemo, createEffect, For, Show } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import {
  saveLocalTTML,
  getAllLocalTTML,
  deleteLocalTTML,
  type LocalTTML,
  type SaveTTMLResult,
} from "@/stores/idb/ttml";
import { useStore } from "@nanostores/solid";
import { $player_data } from "@/stores/player";
import { $ttml_mode } from "@/stores/ttml";
import { $lyrics_status } from "@/stores";
import { t } from "@/i18n";
import { getProviderName, type LyricsProviders } from "@/constants";
import { toast } from "@/lib/sonner";
import SolidLenis from "@/component/ui/Lenis";
import { lyricsResource, refetchLyrics } from "@/api/solid";
import { build } from "@/lib/ttml/builder";
import { Toggle } from "@/component/ui/Toggle";
import { SongInfo } from "@/component/ttml/SongInfo";
import { TTMLItem } from "@/component/ttml/TTMLItem";

const isValidTTMLFile = (file: File) =>
  file.name.endsWith(".ttml") || file.type === "application/ttml+xml" || file.type === "text/xml";

const getTTMLFileName = (songName: string, artistNames: string) =>
  `${songName} by ${artistNames}.ttml`;

function LocalTTMLModal() {
  const { close } = useDialog();
  const playerData = useStore($player_data);
  const ttmlMode = useStore($ttml_mode);
  const lyricsStatus = useStore($lyrics_status);

  const [ttmlFiles, { refetch: refetchTtmlFiles }] = createResource(getAllLocalTTML);

  const [ttmlList, setTtmlList] = createStore<LocalTTML[]>([]);

  createEffect(() => {
    const data = ttmlFiles();
    if (data) {
      setTtmlList(reconcile(data, { key: "id" }));
    }
  });

  const [isDragging, setIsDragging] = createSignal(false);

  const currentSongId = createMemo(() => {
    const uri = playerData()?.uri;
    return uri?.split(":")[2] ?? playerData()?.uid ?? uri;
  });

  const currentSongName = createMemo(
    () => playerData()?.name ?? playerData()?.metadata?.title ?? "",
  );

  const currentArtistNames = createMemo(() => {
    const artists = playerData()?.artists;
    if (artists?.length) {
      return artists.map((a: any) => a.name).join(", ");
    }
    return playerData()?.metadata?.artist_name ?? "";
  });

  const currentAlbumName = createMemo(
    () => playerData()?.album?.name ?? playerData()?.metadata?.album_title ?? "",
  );

  const currentSongTTML = createMemo(() => {
    const songId = currentSongId();
    if (!songId) return null;
    return ttmlList.find((f) => f.songId === songId);
  });

  const currentLyrics = createMemo(() => lyricsResource()?.data);
  const isLocalTTMLLyrics = createMemo(() => currentLyrics()?.Provider === "user");
  const canDownloadLyrics = createMemo(
    () =>
      currentLyrics() && lyricsStatus() === "success" && !currentSongTTML() && !isLocalTTMLLyrics(),
  );

  const handleDownloadCurrentLyrics = () => {
    try {
      const lyrics = currentLyrics();
      if (!lyrics) return;
      const ttmlStr = build(lyrics, { mode: ttmlMode() });
      const fileName = getTTMLFileName(currentSongName(), currentArtistNames());
      const blob = new Blob([ttmlStr], { type: "application/ttml+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("ttml.downloadSuccess", { fileName }));
    } catch {
      toast.error(t("ttml.downloadError"));
    }
  };

  const handleCopyCurrentLyrics = () => {
    try {
      const lyrics = currentLyrics();
      if (!lyrics) return;
      const ttmlStr = build(lyrics, { mode: ttmlMode() });
      copyToClipboard(ttmlStr);
    } catch {
      toast.error(t("ttml.copyError"));
    }
  };

  const handleSave = async (file: File): Promise<SaveTTMLResult | null> => {
    if (!currentSongId()) return null;
    const result = await saveLocalTTML(
      currentSongId()!,
      currentSongName(),
      currentArtistNames(),
      currentAlbumName(),
      file,
      ttmlMode(),
    );

    if (result.parseError) {
      toast.error(`${t("ttml.parseError")}: ${result.parseError}`);
    } else {
      if (result.isOverwrite) {
        toast.success(t("ttml.overwriteSuccess"));
      } else {
        toast.success(t("ttml.uploadSuccess"));
      }
    }

    return result;
  };

  const processFiles = async (files: FileList | null) => {
    const songId = currentSongId();
    if (!files || !songId) return;

    let validFile: File | null = null;
    for (const file of files) {
      if (isValidTTMLFile(file)) {
        validFile = file;
        break;
      }
    }

    if (validFile) {
      await handleSave(validFile);
      await refetchLyrics();
      await refetchTtmlFiles();
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processFiles(e.dataTransfer?.files ?? null);
  };

  const handleFileUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    await processFiles(input.files);
    input.value = "";
  };

  const handleDelete = async (ttml: LocalTTML) => {
    showAlert({
      title: t("ttml.deleteConfirm", { songName: ttml.songName }),
      description: t("ttml.deleteDescription"),
      onConfirm: async () => {
        await deleteLocalTTML(ttml.id);
        await refetchLyrics();
        await refetchTtmlFiles();
        toast.success(t("ttml.deleteSuccess"));
      },
      variant: "destructive",
      icon: <Trash2 />,
    });
  };

  const copyToClipboard = (rawTTML: string) => {
    navigator.clipboard.writeText(rawTTML);
    toast.success(t("ttml.copySuccess"));
  };

  const handleDownload = (ttml: LocalTTML) => {
    const fileName = getTTMLFileName(ttml.songName, ttml.artistNames);
    showAlert({
      title: t("ttml.downloadConfirm", {
        songName: ttml.songName,
        artistName: ttml.artistNames,
      }),
      onConfirm: () => {
        const blob = new Blob([ttml.rawTTML], { type: "application/ttml+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(t("ttml.downloadSuccess", { fileName }));
      },
      variant: "default",
      description: t("ttml.downloadPath"),
      confirmLabel: t("ttml.downloadTTML"),
      secondaryAction: {
        label: t("ttml.copyTTML"),
        onClick: () => copyToClipboard(ttml.rawTTML),
      },
      icon: <Download size={24} />,
    });
  };

  const handleApplyTTML = (ttml: LocalTTML) => {
    const songId = currentSongId();
    if (!songId) return;

    showAlert({
      title: t("ttml.applyConfirm", {
        songName: ttml.songName,
        artistName: ttml.artistNames,
      }),
      onConfirm: async () => {
        copyToClipboard(ttml.rawTTML);
        const blob = new Blob([ttml.rawTTML], { type: "application/ttml+xml" });
        const file = new File([blob], `${ttml.songName}.ttml`, {
          type: "application/ttml+xml",
        });
        await saveLocalTTML(
          songId,
          currentSongName(),
          currentArtistNames(),
          currentAlbumName(),
          file,
          ttmlMode(),
        );
        await refetchLyrics();
        await refetchTtmlFiles();
        toast.success(t("ttml.applySuccess"));
      },
      variant: "default",
      icon: <Check size={24} />,
    });
  };

  return (
    <div class="settings-modal ttml-modal">
      <header>
        <h2 class="title">{t("ttml.title")}</h2>
        <Button
          onClick={close}
          variant="ghost"
          size="icon"
          shape="rounded"
          title={t("common.close")}
        >
          <X size={20} />
        </Button>
      </header>

      <SolidLenis onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <main class="content" classList={{ "drag-over": isDragging() }}>
          <Show
            when={currentSongId()}
            fallback={
              <div class="empty-state">
                <Music size={48} />
                <p>{t("ttml.noSongPlaying")}</p>
              </div>
            }
          >
            <div class="upload-section">
              <label class="l-btn l-btn--outline l-btn--default upload-button">
                <input type="file" accept=".ttml,.xml" onChange={handleFileUpload} hidden />
                <Upload size={20} />
                <span>{currentSongTTML() ? t("ttml.overwriteTTML") : t("ttml.uploadTTML")}</span>
              </label>
            </div>

            <label class="ttml-mode-toggle" for="l-toggle">
              <span class="ttml-mode-label">{t("ttml.mode")}:</span>
              <span class="ttml-mode-value">
                {ttmlMode() === "amll" ? t("ttml.modeAmll") : t("ttml.modeApple")}
              </span>
              <Toggle
                checked={ttmlMode() === "amll"}
                onChange={(checked) => $ttml_mode.set(checked ? "amll" : "apple")}
              />
            </label>

            <SongInfo
              icon={
                currentSongTTML() ? (
                  <FileText size={20} class="icon" />
                ) : (
                  <Music size={20} class="icon" />
                )
              }
              label={
                currentSongTTML()
                  ? t("ttml.currentSongTTML")
                  : canDownloadLyrics()
                    ? t("ttml.currentLyrics")
                    : t("ttml.currentSong")
              }
              songName={currentSongTTML()?.songName ?? currentSongName()}
              artistNames={currentSongTTML()?.artistNames ?? currentArtistNames()}
              albumName={currentSongTTML()?.albumName ?? currentAlbumName()}
              buttons={
                currentSongTTML() ? (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleDownload(currentSongTTML()!)}
                      title={t("ttml.downloadTTML")}
                    >
                      <Download size={16} />
                      <span>{t("ttml.downloadTTML")}</span>
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => copyToClipboard(currentSongTTML()!.rawTTML)}
                      title={t("ttml.copyTTML")}
                    >
                      <Copy size={16} />
                      <span>{t("ttml.copyTTML")}</span>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(currentSongTTML()!)}
                      title={t("ttml.delete")}
                    >
                      <Trash2 size={16} />
                      <span>{t("ttml.delete")}</span>
                    </Button>
                  </>
                ) : canDownloadLyrics() ? (
                  <>
                    <Button
                      variant="default"
                      onClick={handleDownloadCurrentLyrics}
                      title={t("ttml.downloadTTML")}
                    >
                      <Download size={16} />
                      <span>{t("ttml.downloadTTML")}</span>
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleCopyCurrentLyrics}
                      title={t("ttml.copyTTML")}
                    >
                      <Copy size={16} />
                      <span>{t("ttml.copyTTML")}</span>
                    </Button>
                  </>
                ) : null
              }
              providerLabel={
                currentSongTTML()
                  ? undefined
                  : canDownloadLyrics()
                    ? getProviderName(currentLyrics()!.Provider as LyricsProviders)
                    : undefined
              }
              animationDelay="0.1s"
              isLoading={lyricsStatus() === "loading" && !currentSongTTML()}
            />
          </Show>

          <Show
            when={ttmlFiles.state !== "pending"}
            fallback={<div class="loading">{t("common.loading")}</div>}
          >
            <Show
              when={ttmlList.length > 0}
              fallback={
                <div class="empty-state">
                  <FileText size={48} />
                  <p>{t("ttml.noLocalTTML")}</p>
                </div>
              }
            >
              <div class="ttml-list">
                <h3 class="list-header">{t("ttml.allUploadedTTML")}</h3>
                <For each={ttmlList}>
                  {(ttml) => (
                    <TTMLItem
                      ttml={ttml}
                      currentSongId={currentSongId()}
                      onApply={handleApplyTTML}
                      onDownload={handleDownload}
                      onCopy={copyToClipboard}
                      onDelete={handleDelete}
                    />
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </main>
      </SolidLenis>
    </div>
  );
}

export const showLocalTTMLModal = () => showModal(() => <LocalTTMLModal />);

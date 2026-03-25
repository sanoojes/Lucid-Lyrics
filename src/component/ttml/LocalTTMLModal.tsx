import "@/styles/modal/ttml-modal.scss";
import { useDialog } from "@/lib/modal/component/Dialog";
import { showModal, showAlert } from "@/lib/modal";
import { X, Upload, Trash2, FileText, Music, Download, Copy, Check } from "lucide-solid";
import { Button } from "@/component/ui/Button";
import { createSignal, createResource, createMemo, For, Show, Suspense } from "solid-js";
import {
  saveLocalTTML,
  getAllLocalTTML,
  deleteLocalTTML,
  type LocalTTML,
  type SaveTTMLResult,
} from "@/stores/idb/ttml";
import { useStore } from "@nanostores/solid";
import { $player_data } from "@/stores/player";
import { t } from "@/i18n";
import { getProviderName, type LyricsProviders } from "@/constants";
import { toast } from "@/lib/sonner";
import SolidLenis from "@/component/ui/Lenis";
import { lyricsResource, refetchLyrics } from "@/api/solid";
import { build } from "@/lib/ttml/builder";
import Marquee from "@/component/ui/Marquee";

const isValidTTMLFile = (file: File) =>
  file.name.endsWith(".ttml") || file.type === "application/ttml+xml" || file.type === "text/xml";


const getTTMLFileName = (songName: string, artistNames: string) =>
  `${songName} by ${artistNames}.ttml`;

function LocalTTMLModal() {
  const { close } = useDialog();
  const playerData = useStore($player_data);
  const [ttmlFiles, { refetch: refetchTtmlFiles }] = createResource(getAllLocalTTML);
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
    return ttmlFiles()?.find((f) => f.songId === songId);
  });

  const currentLyrics = createMemo(() => lyricsResource()?.data);
  const isLocalTTMLLyrics = createMemo(
    () => currentLyrics()?.Provider === "user",
  );
  const canDownloadLyrics = createMemo(
    () => currentLyrics() && !currentSongTTML() && !isLocalTTMLLyrics(),
  );

  const handleDownloadCurrentLyrics = () => {
    try {
      const lyrics = currentLyrics();
      if (!lyrics) return;
      const ttmlStr = build(lyrics);
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
      const ttmlStr = build(lyrics);
      copyToClipboard(ttmlStr);
    } catch {
      toast.error(t("ttml.copyError"));
    }
  };

  const renderSongInfo = (
    icon: any,
    label: string,
    songName: string,
    artistNames: string,
    albumName: string,
    buttons: any,
    providerLabel?: string,
  ) => (
    <div class="current-song-ttml">
      <div class="current-song-header">
        {icon}
        <span class="label">{label}</span>
        <Show when={providerLabel}>
          <span class="provider-badge">{providerLabel}</span>
        </Show>
      </div>
      <div class="song-info">
        <div class="song-name">
          <Marquee>{songName}</Marquee>
        </div>
        <div class="song-artist">
          <Marquee>{artistNames}</Marquee>
        </div>
        <div class="song-album">
          <Marquee>{albumName}</Marquee>
        </div>
      </div>
      <div class="song-buttons">{buttons}</div>
    </div>
  );

  const handleSave = async (file: File): Promise<SaveTTMLResult | null> => {
    if (!currentSongId()) return null;
    const result = await saveLocalTTML(
      currentSongId()!,
      currentSongName(),
      currentArtistNames(),
      currentAlbumName(),
      file,
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

    for (const file of files) {
      if (isValidTTMLFile(file)) {
        await handleSave(file);
        await refetchLyrics();
      }
    }

    await refetchTtmlFiles();
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
        );
        await refetchLyrics();
        await refetchTtmlFiles();
        toast.success(t("ttml.applySuccess"));
      },
      variant: "default",
      icon: <Check size={24} />,
    });
  };

  const renderTTMLItem = (ttml: LocalTTML) => {
    const isCurrentSong = () => ttml.songId === currentSongId();
    return (
      <div class="ttml-item" classList={{ "is-current": isCurrentSong() }}>
        <div class="ttml-info">
          <div class="ttml-song-name">
            <Music size={16} />
            <Marquee>{ttml.songName}</Marquee>
          </div>
          <div class="ttml-artist">
            <Marquee>{ttml.artistNames}</Marquee>
          </div>
          <div class="ttml-album">
            <Marquee>{ttml.albumName}</Marquee>
          </div>
        </div>
        <div class="ttml-actions">
          <Show when={isCurrentSong()}>
            <span class="current-badge">{t("ttml.current")}</span>
          </Show>
          <Show when={!isCurrentSong() && currentSongId()}>
            <Button variant="default" size="icon" onClick={() => handleApplyTTML(ttml)}>
              <Check size={16} />
            </Button>
          </Show>
          <Button variant="default" size="icon" onClick={() => handleDownload(ttml)}>
            <Download size={16} />
          </Button>
          <Button variant="default" size="icon" onClick={() => copyToClipboard(ttml.rawTTML)}>
            <Copy size={16} />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => handleDelete(ttml)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div class="settings-modal ttml-modal">
      <header>
        <h2 class="title">{t("ttml.title")}</h2>
        <Button onClick={close} variant="ghost" size="icon" shape="rounded">
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

            <Show when={canDownloadLyrics()}>
              {renderSongInfo(
                <Music size={20} class="icon" />,
                t("ttml.currentLyrics"),
                currentSongName(),
                currentArtistNames(),
                currentAlbumName(),
                <>
                  <Button variant="default" onClick={handleDownloadCurrentLyrics}>
                    <Download size={16} />
                    <span>{t("ttml.downloadTTML")}</span>
                  </Button>
                  <Button variant="default" onClick={handleCopyCurrentLyrics}>
                    <Copy size={16} />
                    <span>{t("ttml.copyTTML")}</span>
                  </Button>
                </>,
                getProviderName(currentLyrics()!.Provider as LyricsProviders)
              )}
            </Show>

            <Show when={currentSongTTML()}>
              {(ttml) =>
                renderSongInfo(
                  <FileText size={20} class="icon" />,
                  t("ttml.currentSongTTML"),
                  ttml().songName,
                  ttml().artistNames,
                  ttml().albumName,
                  <>
                    <Button variant="default" onClick={() => handleDownload(ttml())}>
                      <Download size={16} />
                      <span>{t("ttml.downloadTTML")}</span>
                    </Button>
                    <Button variant="default" onClick={() => copyToClipboard(ttml().rawTTML)}>
                      <Copy size={16} />
                      <span>{t("ttml.copyTTML")}</span>
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(ttml())}>
                      <Trash2 size={16} />
                      <span>{t("ttml.delete")}</span>
                    </Button>
                  </>,
                )
              }
            </Show>
          </Show>

          <Suspense fallback={<div class="loading">{t("common.loading")}</div>}>
            <Show
              when={(ttmlFiles()?.length ?? 0) > 0}
              fallback={
                <div class="empty-state">
                  <FileText size={48} />
                  <p>{t("ttml.noLocalTTML")}</p>
                </div>
              }
            >
              <div class="ttml-list">
                <h3 class="list-header">{t("ttml.allUploadedTTML")}</h3>
                <For each={ttmlFiles()}>{(ttml) => renderTTMLItem(ttml)}</For>
              </div>
            </Show>
          </Suspense>
        </main>
      </SolidLenis>
    </div>
  );
}

export const showLocalTTMLModal = () => showModal(() => <LocalTTMLModal />);

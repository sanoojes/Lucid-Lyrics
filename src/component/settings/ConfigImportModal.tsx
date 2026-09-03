import "~/styles/modal/config-import.scss";
import { useDialog } from "~/lib/modal/component/Dialog";
import { showModal } from "~/lib/modal";
import { Button } from "~/component/ui/Button";
import { ClipboardPaste, Import, X, FileBraces, CircleAlert, CircleCheck } from "lucide-solid";
import { createSignal, createMemo, onMount, Show } from "solid-js";
import { importConfig, getConfigFileString, validateConfig } from "~/lib/config";
import { t } from "~/i18n";
import { toast } from "~/lib/sonner";

function ConfigImportModal() {
  const { close } = useDialog();
  const [json, setJson] = createSignal("");
  const [showErrors, setShowErrors] = createSignal(false);
  let fileInputRef: HTMLInputElement | undefined;
  let errorRef: HTMLDivElement | undefined;

  const CONFIG_IMPORT_ERROR_TOAST = "config-import-error";

  const validation = createMemo(() => {
    const val = json().trim();
    if (!val) return { state: "empty" as const, message: "" };

    const result = validateConfig(val);

    if (result.success) {
      return { state: "valid" as const, message: "" };
    }

    if (result.type === "invalid_json") {
      return {
        state: "invalid_json" as const,
        message: t("configImport.jsonSyntaxError"),
      };
    }

    return {
      state: "schema_error" as const,
      message: result.issues.slice(0, 2).join("; "),
    };
  });

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setJson(text);
        dismissError();
        toast.success(t("backup.importPasteSuccess"));
      }
    } catch {
      toast.error(t("backup.copyFailed"));
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setJson(String(reader.result ?? ""));
      dismissError();
    };
    reader.readAsText(file);
  };

  const dismissError = () => {
    setShowErrors(false);
    toast.dismiss(CONFIG_IMPORT_ERROR_TOAST);
  };

  const handleImport = () => {
    const state = validation();
    if (state.state !== "valid") {
      setShowErrors(true);
      restartErrorAnimation();
      toast.error(t("backup.importFailed"), {
        id: CONFIG_IMPORT_ERROR_TOAST,
        description: state.state === "empty" ? t("configImport.empty") : state.message,
      });
      return;
    }

    toast.dismiss(CONFIG_IMPORT_ERROR_TOAST);

    const result = importConfig(json());
    if (result.success) {
      toast.success(t("backup.importSuccess"));
      close();
    } else {
      toast.error(t("backup.importFailed"), {
        description: t("backup.importFailedDesc"),
      });
    }
  };

  const restartErrorAnimation = () => {
    if (!errorRef) return;
    errorRef.style.animation = "none";
    void errorRef.offsetHeight;
    errorRef.style.animation = "";
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleImport();
    }
  };

  onMount(() => {
    setJson(getConfigFileString());
  });

  return (
    <div class="settings-modal l-config-import">
      <header>
        <h2 class="title">{t("backup.importConfig")}</h2>
        <Button onClick={close} variant="ghost" size="icon" shape="rounded">
          <X size={18} />
        </Button>
      </header>

      <div class="content">
        <div class="l-config-import__actions-wrapper">
          <p class="l-config-import__desc">{t("backup.importEditDesc")}</p>
          <div class="l-config-import__actions">
            <Button variant="outline" size="sm" onClick={handlePaste}>
              <ClipboardPaste size={14} />
              {t("backup.importPaste")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef?.click()}>
              <FileBraces size={14} />
              {t("backup.importOpenFile")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                handleFile(e.currentTarget.files?.[0]);
                e.currentTarget.value = "";
              }}
              hidden
            />
          </div>
        </div>

        <div class="l-config-import__textarea-wrapper">
          <textarea
            class="l-config-import__textarea"
            classList={{
              "l-config-import__textarea--valid": validation().state === "valid",
              "l-config-import__textarea--error":
                validation().state === "invalid_json" || validation().state === "schema_error",
            }}
            value={json()}
            onInput={(e) => {
              setJson(e.currentTarget.value);
              dismissError();
            }}
            onKeyDown={handleKeyDown}
            placeholder={t("backup.importEditPlaceholder")}
            spellcheck={false}
          />
          <Show when={validation().state !== "empty"}>
            <span
              class="l-config-import__status"
              classList={{
                "l-config-import__status--valid": validation().state === "valid",
                "l-config-import__status--error": validation().state !== "valid",
              }}
            >
              <Show when={validation().state === "valid"} fallback={<CircleAlert size={14} />}>
                <CircleCheck size={14} />
              </Show>
            </span>
          </Show>
        </div>

        <Show
          when={showErrors() && validation().state !== "empty" && validation().state !== "valid"}
        >
          <div ref={errorRef} class="l-config-import__error">
            <CircleAlert size={14} />
            <span>{validation().message}</span>
          </div>
        </Show>

        <footer class="l-config-import__footer">
          <Button variant="destructive" shape="rounded" onClick={close}>
            {t("common.cancel")}
          </Button>
          <Button shape="rounded" variant="glass" onClick={handleImport}>
            <Import size={16} />
            {t("backup.importConfig")}
          </Button>
        </footer>
      </div>
    </div>
  );
}

export const showConfigImportModal = () => showModal(() => <ConfigImportModal />);

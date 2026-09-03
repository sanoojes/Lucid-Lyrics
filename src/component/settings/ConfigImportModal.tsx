import "~/styles/modal/config-import.scss";
import { useDialog } from "~/lib/modal/component/Dialog";
import { showModal, showAlert } from "~/lib/modal";
import { Button } from "~/component/ui/Button";
import {
  ClipboardPaste,
  Import,
  X,
  FileBraces,
  CircleAlert,
  CircleCheck,
  WandSparkles,
} from "lucide-solid";
import { createSignal, createMemo, onMount, Show } from "solid-js";
import { applyConfig, getConfigFileString, prepareImport } from "~/lib/config";
import type { Config } from "~/lib/config/schemas";
import { t } from "~/i18n";
import { toast } from "~/lib/sonner";
import { Tippy } from "~/component/ui/Tippy";

function ConfigImportModal() {
  const { close } = useDialog();
  const [json, setJson] = createSignal("");
  const [showErrors, setShowErrors] = createSignal(false);
  let fileInputRef: HTMLInputElement | undefined;
  let errorRef: HTMLDivElement | undefined;

  const CONFIG_IMPORT_ERROR_TOAST = "config-import-error";

  const validation = createMemo(() => {
    const val = json().trim();
    if (!val) return { state: "empty" as const };

    const prepared = prepareImport(val);

    if (prepared.success) {
      if (prepared.needsVersionConfirmation || prepared.migratedMissing) {
        return { state: "migratable" as const, title: t("configImport.migratable") };
      }
      return { state: "valid" as const, title: t("configImport.valid") };
    }

    let isJson: boolean;
    try {
      JSON.parse(val);
      isJson = true;
    } catch {
      isJson = false;
    }

    if (!isJson) {
      return {
        state: "invalid_json" as const,
        title: t("configImport.jsonSyntaxError"),
      };
    }

    return {
      state: "schema_error" as const,
      message: prepared.error,
      title: t("configImport.invalid"),
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
    if (state.state === "invalid_json") {
      setShowErrors(true);
      restartErrorAnimation();
      toast.error(t("backup.importFailed"), {
        id: CONFIG_IMPORT_ERROR_TOAST,
        description: t("configImport.jsonSyntaxError"),
      });
      return;
    }

    toast.dismiss(CONFIG_IMPORT_ERROR_TOAST);

    const initialResult = prepareImport(json());

    if (!initialResult.success) {
      setShowErrors(true);
      restartErrorAnimation();
      toast.error(t("backup.importFailed"), {
        id: CONFIG_IMPORT_ERROR_TOAST,
        description: initialResult.error || t("backup.importFailedDesc"),
      });
      return;
    }

    const finish = (config: Config, migrated: boolean) => {
      try {
        applyConfig(config);
        if (migrated) {
          toast.success(t("backup.migratedSuccess"), {
            description: t("backup.migratedMissingDesc"),
          });
        } else {
          toast.success(t("backup.importSuccess"));
        }
        close();
      } catch {
        toast.error(t("backup.importFailed"));
      }
    };

    if (initialResult.needsVersionConfirmation) {
      showAlert({
        title: t("backup.migrateVersionTitle"),
        description: t("backup.migrateVersionDesc"),
        confirmLabel: t("backup.migrate"),
        variant: "warning",
        onConfirm: () => finish(initialResult.config, true),
      });
      return;
    }

    finish(initialResult.config, initialResult.migratedMissing);
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
              "l-config-import__textarea--migratable": validation().state === "migratable",
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
                "l-config-import__status--migratable": validation().state === "migratable",
                "l-config-import__status--error":
                  validation().state === "invalid_json" || validation().state === "schema_error",
              }}
            >
              <Tippy title={validation().title}>
                <Show
                  when={validation().state === "valid"}
                  fallback={
                    <Show
                      when={validation().state === "migratable"}
                      fallback={<CircleAlert size={14} />}
                    >
                      <WandSparkles size={14} />
                    </Show>
                  }
                >
                  <CircleCheck size={14} />
                </Show>
              </Tippy>
            </span>
          </Show>
        </div>

        <Show
          when={
            showErrors() &&
            (validation().state === "invalid_json" || validation().state === "schema_error")
          }
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

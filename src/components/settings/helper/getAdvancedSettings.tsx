import { AppStateSchema } from '@/schemas/appStoreSchema.ts';
import type appStore from '@/store/appStore.ts';
import type { SectionProps } from '@/types/settingSchema.ts';
import resetExtension from '@/utils/resetExtension.ts';
import { showNotification } from '@utils/notification';

export const getAdvancedSettings = (state: ReturnType<typeof appStore.getState>): SectionProps =>
  ({
    id: 'advanced-settings',
    sectionName: 'Advanced',
    groups: [
      {
        id: 'advanced-actions',
        components: [
          {
            id: 'export-settings',
            type: 'Button',
            variant: 'primary',
            label: 'Export Configuration',
            tippy: 'Copy all settings as JSON.',
            buttonText: 'Copy',
            onClick: () => {
              const config = state.exportConfig();
              if (!config) {
                showNotification({
                  id: 'export',
                  message: 'Failed to export configuration.',
                  isError: true,
                });
                return;
              }
              try {
                navigator.clipboard
                  .writeText(config)
                  .then(() => {
                    showNotification({
                      id: 'export',
                      message: 'Copied Successfully !',
                      timeout: 999999,
                    });
                  })
                  .catch(() => {
                    showNotification({
                      id: 'export',
                      message: 'Failed to Copy Config.',
                      isError: true,
                    });
                  });
              } catch {}
            },
          },
          {
            id: 'import-settings',
            type: 'Input',
            label: 'Import Configuration',
            tippy: 'Paste valid JSON to import settings.',
            inputType: 'text',
            placeholder: 'Paste JSON here...',
            textArea: true,
            onChange: (value) => {
              try {
                const parsed = JSON.parse(value);
                const result = AppStateSchema.safeParse(parsed);

                if (result.success) {
                  state.importConfig(result.data);
                  showNotification({
                    id: 'import-success',
                    message: 'Settings imported successfully!',
                  });
                } else {
                  const errorMessages = result.error.issues
                    .map((issue) => `• ${issue.path.join('.') || 'root'}: ${issue.message}`)
                    .join('\n');

                  showNotification({
                    id: 'import-invalid',
                    message: (
                      <div>
                        <strong>Invalid configuration:</strong>
                        <pre style={{ marginTop: 4 }}>{errorMessages}</pre>
                      </div>
                    ),
                    isError: true,
                  });
                }
              } catch {
                showNotification({
                  id: 'import-parse-error',
                  message: 'Error parsing JSON input.',
                  isError: true,
                });
              }
            },
          },
          {
            id: 'reset-store',
            type: 'Button',
            variant: 'danger',
            label: 'Reset Settings',
            tippy: 'Restore extension settings to default.',
            buttonText: 'Reset',
            onClick: () => {
              resetExtension();
              showNotification({
                id: 'extension-reset',
                message: 'Extension reset to default.',
              });
            },
          },
        ],
      },
    ],
  }) satisfies SectionProps;

import Modal from '@/components/Modal.tsx';
import { Button, Tippy } from '@/components/ui/index.ts';
import type { ColorPickerProps } from '@/types/uiSchema.ts';
import { ArrowResetRegular } from '@fluentui/react-icons';
import { type CSSProperties, type FC, useState } from 'react';
import { ColorPicker as CP, useColor } from 'react-color-palette';

const getContrastColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000' : '#fff';
};

const resolveCssVariable = (cssVar: string): string | null => {
  const match = cssVar.match(/var\((--[^)]+)\)/);
  return match
    ? getComputedStyle(document.documentElement).getPropertyValue(match[1])?.trim() || null
    : null;
};

const isCssVar = (val?: string) => val?.startsWith('var(');
const getResolvedColor = (val: string) =>
  isCssVar(val) ? (resolveCssVariable(val) ?? '#000000') : (val ?? '#000000');

const ColorPicker: FC<ColorPickerProps> = ({
  color,
  initialColor,
  onChange,
  onChangeComplete,
  hideAlpha,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useColor(getResolvedColor(color));

  const handleClose = () => setIsOpen(false);

  const resetToDefaultColor = () => {
    if (!initialColor) return;
    onChange?.(initialColor);
    onChangeComplete?.(initialColor);
    handleClose();
  };

  const resetButton = initialColor ? (
    <Tippy hasIcon={false} label="Reset Color">
      <Button variant="icon" onClick={resetToDefaultColor}>
        <ArrowResetRegular />
      </Button>
    </Tippy>
  ) : null;

  return (
    <>
      <div className="btn-wrapper">
        <Button onClick={() => setIsOpen(true)}>Open Color Picker</Button>
        {resetButton}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Color Picker"
        headerChildren={resetButton}
        hasSocialButton={false}
      >
        <div className="color-picker-content-wrapper">
          <CP
            color={currentColor}
            onChange={(newColor) => {
              setCurrentColor(newColor);
              onChange?.(newColor.hex);
            }}
            onChangeComplete={(finalColor) => {
              onChangeComplete?.(finalColor.hex);
            }}
            hideAlpha={hideAlpha ?? false}
          />
          <div
            className="rcp-current-color"
            style={{ '--current-color': currentColor.hex } as CSSProperties}
          >
            <p
              className="encore-text encore-text-body-small-bold"
              style={{ color: getContrastColor(currentColor.hex) }}
            >
              Preview
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ColorPicker;

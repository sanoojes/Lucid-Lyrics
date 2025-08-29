import {
  Button,
  ColorPicker,
  DropdownAction,
  Input,
  TextArea,
  Tippy,
  Toggle,
} from '@/components/ui/index.ts';
import type { Component } from '@/types/settingSchema.ts';
import React, { type FC } from 'react';

const Row: FC<{ data: Component }> = ({ data }) => {
  const isVisible = data.visible ? data.visible() : true;

  return (
    <div className="setting-row" style={{ display: isVisible ? '' : 'none' }}>
      <div className="col first">
        <p className="encore-text encore-text-body-small encore-internal-color-text-base">
          {data.label}
        </p>
        {data.tippy ? <Tippy label={data.tippy} /> : null}
      </div>
      <div className="col second">
        {data.type === 'Dropdown' ? (
          <DropdownAction {...data} />
        ) : data.type === 'Toggle' ? (
          <Toggle {...data} />
        ) : data.type === 'Button' ? (
          <Button {...data} />
        ) : data.type === 'Input' ? (
          data.textArea && data.inputType === 'text' ? (
            <TextArea {...data} />
          ) : (
            <Input {...data} />
          )
        ) : data.type === 'Color' ? (
          <ColorPicker {...data} />
        ) : (
          'Component Not Found'
        )}
      </div>
    </div>
  );
};

export default Row;

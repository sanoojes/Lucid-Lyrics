import Row from '@/components/settings/ui/Row.tsx';
import type { GroupProps } from '@/types/settingSchema.ts';
import React, { type FC } from 'react';

const Group: FC<GroupProps> = ({ groupName, components, visible }) => {
  const isVisible = visible ? visible() : true;
  return (
    <div className={`section${!isVisible ? ' hidden' : ''}`}>
      {groupName ? (
        <h3 className="e-9890-text encore-text-body-medium-bold encore-internal-color-text-base">
          {groupName}
        </h3>
      ) : null}
      {components.map((v) => (
        <Row data={v} key={v.id} />
      ))}
    </div>
  );
};

export default Group;

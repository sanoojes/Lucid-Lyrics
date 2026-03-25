import { deepmerge } from "@fastify/deepmerge";

function replaceByClonedSource(options: { clone: (value: any) => any }) {
  const clone = options.clone;
  return function (_target: any[], source: any[]) {
    return clone(source);
  };
}
export default deepmerge({ onlyDefinedProperties: true, mergeArray: replaceByClonedSource });

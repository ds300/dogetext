export type Cursor = {
  line: number,
  offset: number
};

export type Selection = {
  from: Cursor,
  to: Cursor
};

export type Buffer = {
  offset: number,
  cursors: Cursor[],
  selections: Selection[],
  lines: string[]
};

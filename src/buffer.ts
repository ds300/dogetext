import { namespace } from './FactHub'

const define = namespace('dogetext.buffer').define;

export type Cursor = {
  line: number,
  offset: number
};

export type CursorRange = {
  from: Cursor,
  to: Cursor
};

export type Buffer = {
  offset: number,
  cursors: Cursor[],
  selections: CursorRange[],
  lines: string[]
};

export type TextObject = {
  parts: string[]
};

export const TextInserted = define(
  function TextInserted (strings: string[]) {
    return strings;
  }
);

export const TextRemoved = define(
  function TextRemoved (ranges: CursorRange[]) {
    return ranges;
  }
);

export const CursorAdded = define(
  function CursorAdded (line: number, offset: number): Cursor {
    return {line, offset};
  }
);

export const CursorRemoved = define(
  function CursorRemoved (id) {
    return id;
  }
);

export const AllExtraCursorsRemoved = define(
  function AllExtraCursorsRemoved () {}
);

export const CursorMoved = define(
  function CursorMoved (id: number, to: Cursor) {
    return {id, to};
  }
);

export const AllCursorsMoved = define (
  function AllCursorsMoved (lines: number, chars: number) {
    return {lines, chars}
  }
);

/* Strapi 5 "blocks" rich-text JSON structure. */
export interface TextNode {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}
export interface LinkInline {
  type: "link";
  url: string;
  children: TextNode[];
}
export type InlineNode = TextNode | LinkInline;

export interface ListItemBlock {
  type: "list-item";
  children: (InlineNode | ListBlock)[];
}
export interface ListBlock {
  type: "list";
  format: "ordered" | "unordered";
  indentLevel?: number;
  children: (ListItemBlock | ListBlock)[];
}
export interface ImageBlock {
  type: "image";
  image: {
    url: string;
    alternativeText?: string | null;
    width?: number | null;
    height?: number | null;
    caption?: string | null;
    name?: string;
  };
  children: TextNode[];
}
export type Block =
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: "quote"; children: InlineNode[] }
  | { type: "code"; language?: string; children: TextNode[] }
  | ListBlock
  | ImageBlock;

export type BlocksContent = Block[];

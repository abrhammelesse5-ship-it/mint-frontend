import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { mediaUrl } from "@/lib/media";
import { cn, isExternalUrl } from "@/lib/utils";
import type { Block, BlocksContent, InlineNode, ListBlock, ListItemBlock, TextNode } from "./types";

/**
 * Renders Strapi 5 "blocks" rich text as semantic HTML.
 * Self-contained (no runtime dependency) and server-component friendly.
 */
export function BlocksRenderer({ content, className }: { content?: BlocksContent | null; className?: string }) {
  if (!content || !Array.isArray(content) || content.length === 0) return null;
  return <div className={cn("prose-mint", className)}>{content.map((block, i) => renderBlock(block, i))}</div>;
}

export function hasBlocks(content?: BlocksContent | null): content is BlocksContent {
  return Array.isArray(content) && content.some((b) => blockText(b).trim().length > 0 || b.type === "image");
}

/** Plain-text extraction (meta descriptions, excerpts). */
export function blocksToText(content?: BlocksContent | null, max = 300): string {
  if (!Array.isArray(content)) return "";
  const text = content.map(blockText).join(" ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function blockText(block: Block | ListItemBlock | InlineNode | ListBlock): string {
  if ("text" in block && typeof block.text === "string") return block.text;
  if ("children" in block && Array.isArray(block.children)) {
    return (block.children as (InlineNode | ListItemBlock | ListBlock)[]).map(blockText).join(" ");
  }
  return "";
}

function renderText(node: TextNode, key: number) {
  let el: React.ReactNode = node.text;
  if (!node.text) return <Fragment key={key} />;
  if (node.code) el = <code>{el}</code>;
  if (node.bold) el = <strong>{el}</strong>;
  if (node.italic) el = <em>{el}</em>;
  if (node.underline) el = <u>{el}</u>;
  if (node.strikethrough) el = <s>{el}</s>;
  return <Fragment key={key}>{splitLines(el)}</Fragment>;
}

function splitLines(el: React.ReactNode): React.ReactNode {
  if (typeof el !== "string" || !el.includes("\n")) return el;
  return el.split("\n").map((part, i, arr) => (
    <Fragment key={i}>
      {part}
      {i < arr.length - 1 && <br />}
    </Fragment>
  ));
}

function renderInline(nodes: InlineNode[] = []) {
  return nodes.map((node, i) => {
    if (node.type === "link") {
      const external = isExternalUrl(node.url);
      const children = node.children.map((c, j) => renderText(c, j));
      return external ? (
        <a key={i} href={node.url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <Link key={i} href={node.url}>
          {children}
        </Link>
      );
    }
    return renderText(node, i);
  });
}

function renderList(block: ListBlock, key: number): React.ReactNode {
  const Tag = block.format === "ordered" ? "ol" : "ul";
  return (
    <Tag key={key}>
      {block.children.map((item, i) => {
        if (item.type === "list") return <li key={i}>{renderList(item, i)}</li>;
        return (
          <li key={i}>
            {item.children.map((child, j) =>
              child.type === "list" ? renderList(child, j) : <Fragment key={j}>{renderInline([child])}</Fragment>,
            )}
          </li>
        );
      })}
    </Tag>
  );
}

function renderBlock(block: Block, key: number): React.ReactNode {
  switch (block.type) {
    case "paragraph": {
      const isEmpty = block.children.every((c) => c.type === "text" && !c.text);
      return isEmpty ? null : <p key={key}>{renderInline(block.children)}</p>;
    }
    case "heading": {
      // Page titles are h1, so CMS headings start at h2.
      const level = Math.min(6, Math.max(2, block.level));
      const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";
      return <Tag key={key}>{renderInline(block.children)}</Tag>;
    }
    case "quote":
      return <blockquote key={key}>{renderInline(block.children)}</blockquote>;
    case "code":
      return (
        <pre key={key}>
          <code>{block.children.map((c) => c.text).join("")}</code>
        </pre>
      );
    case "list":
      return renderList(block, key);
    case "image": {
      const src = mediaUrl(block.image?.url);
      if (!src) return null;
      return (
        <figure key={key}>
          <Image
            src={src}
            alt={block.image.alternativeText || ""}
            width={block.image.width || 1200}
            height={block.image.height || 800}
            sizes="(min-width: 1024px) 800px, 100vw"
            className="h-auto w-full"
          />
          {block.image.caption && <figcaption>{block.image.caption}</figcaption>}
        </figure>
      );
    }
    default:
      return null;
  }
}

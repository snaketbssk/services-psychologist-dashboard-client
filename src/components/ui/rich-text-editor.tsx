"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState, useRef, useEffect } from "react";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Undo2Icon,
  Redo2Icon,
  Heading2Icon,
  Heading3Icon,
  SeparatorHorizontalIcon,
  Link2Icon,
  Link2OffIcon,
  ImageIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Toolbar button ────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex items-center justify-center size-7 rounded-md text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "disabled:opacity-40 disabled:pointer-events-none",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

// ─── Inline URL input panel ────────────────────────────────────────────────────

function UrlInputPanel({
  label,
  placeholder,
  initialValue,
  onConfirm,
  onCancel,
}: {
  label: string;
  placeholder: string;
  initialValue: string;
  onConfirm: (url: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div className="flex items-center gap-1.5 border-t border-border px-2 py-1.5 bg-muted/40">
      <span className="text-xs text-muted-foreground shrink-0 font-medium">
        {label}
      </span>
      <input
        ref={inputRef}
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onConfirm(value); }
          if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        className="flex-1 h-6 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
      />
      <button
        type="button"
        onClick={() => onConfirm(value)}
        title="Confirm"
        className="inline-flex items-center justify-center size-6 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <CheckIcon className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        title="Cancel"
        className="inline-flex items-center justify-center size-6 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

type ActivePanel = "link" | "image" | null;

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something…",
  className,
  disabled = false,
}: RichTextEditorProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      if (value && editor.getHTML() !== value) {
        editor.commands.setContent(value, false);
      }
    },
  });

  if (!editor) return null;

  const currentLinkHref = editor.getAttributes("link").href ?? "";
  const isLinkActive = editor.isActive("link");

  function openLinkPanel() {
    setActivePanel((p) => (p === "link" ? null : "link"));
  }

  function confirmLink(url: string) {
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setActivePanel(null);
  }

  function confirmImage(url: string) {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setActivePanel(null);
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background text-sm text-foreground",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2Icon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3Icon className="size-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <BoldIcon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <ItalicIcon className="size-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <ListIcon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered list"
        >
          <ListOrderedIcon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <QuoteIcon className="size-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <SeparatorHorizontalIcon className="size-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          onClick={openLinkPanel}
          active={isLinkActive || activePanel === "link"}
          title={isLinkActive ? "Edit link" : "Insert link"}
        >
          <Link2Icon className="size-3.5" />
        </ToolbarButton>
        {isLinkActive && (
          <ToolbarButton
            onClick={() => { editor.chain().focus().unsetLink().run(); setActivePanel(null); }}
            title="Remove link"
          >
            <Link2OffIcon className="size-3.5" />
          </ToolbarButton>
        )}

        {/* Image */}
        <ToolbarButton
          onClick={() => setActivePanel((p) => (p === "image" ? null : "image"))}
          active={activePanel === "image"}
          title="Insert image"
        >
          <ImageIcon className="size-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2Icon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2Icon className="size-3.5" />
        </ToolbarButton>
      </div>

      {/* ── URL input panels ── */}
      {activePanel === "link" && (
        <UrlInputPanel
          label="URL"
          placeholder="https://example.com"
          initialValue={currentLinkHref}
          onConfirm={confirmLink}
          onCancel={() => setActivePanel(null)}
        />
      )}
      {activePanel === "image" && (
        <UrlInputPanel
          label="Image URL"
          placeholder="https://example.com/image.png"
          initialValue=""
          onConfirm={confirmImage}
          onCancel={() => setActivePanel(null)}
        />
      )}

      {/* ── Editor area ── */}
      <EditorContent
        editor={editor}
        className="rich-text-content min-h-[280px] max-h-[480px] overflow-y-auto px-3 py-2.5"
      />
    </div>
  );
}

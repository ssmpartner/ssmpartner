import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Link2, Image as ImageIcon, Undo, Redo, Code, Minus,
} from "lucide-react";
import MediaPickerModal from "@/components/MediaPickerModal";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: Props) => {
  const [picker, setPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl my-3 max-w-full" } }),
      Placeholder.configure({ placeholder: placeholder || "Schreibe hier den Inhalt…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3 leading-relaxed",
      },
    },
  });

  if (!editor) return null;

  const Btn = ({ onClick, active, disabled, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md hover:bg-muted transition-colors ${active ? "bg-muted text-primary" : "text-muted-foreground"} disabled:opacity-30`}
    >
      {children}
    </button>
  );

  const setLink = () => {
    const previous = editor.getAttributes("link").href;
    const url = window.prompt("Link-URL:", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rounded-lg border bg-background overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Überschrift 1"><Heading1 size={16} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Überschrift 2"><Heading2 size={16} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Überschrift 3"><Heading3 size={16} /></Btn>
        <div className="w-px h-5 bg-border mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Fett"><Bold size={16} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Kursiv"><Italic size={16} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Durchgestrichen"><Strikethrough size={16} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code"><Code size={16} /></Btn>
        <div className="w-px h-5 bg-border mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Aufzählung"><List size={16} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Nummerierung"><ListOrdered size={16} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Zitat"><Quote size={16} /></Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Trennlinie"><Minus size={16} /></Btn>
        <div className="w-px h-5 bg-border mx-1" />
        <Btn onClick={setLink} active={editor.isActive("link")} title="Link"><Link2 size={16} /></Btn>
        <Btn onClick={() => setPicker(true)} title="Bild einfügen"><ImageIcon size={16} /></Btn>
        <div className="ml-auto flex gap-0.5">
          <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Rückgängig"><Undo size={16} /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Wiederholen"><Redo size={16} /></Btn>
        </div>
      </div>
      <EditorContent editor={editor} />
      <MediaPickerModal
        open={picker}
        onClose={() => setPicker(false)}
        accept="image"
        title="Bild einfügen"
        onSelect={(url) => {
          editor.chain().focus().setImage({ src: url }).run();
          setPicker(false);
        }}
      />
    </div>
  );
};

export default RichTextEditor;

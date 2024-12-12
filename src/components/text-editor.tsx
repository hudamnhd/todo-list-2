"use client";
import {
  type Editor,
  BubbleMenu,
  FloatingMenu,
  EditorContent,
  useEditor,
} from "@tiptap/react";
import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import Placeholder from "@tiptap/extension-placeholder";
const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "min-h-[60px] max-h-[150px] w-full bg-transparent py-1 px-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-auto",
      },
    },
    immediatelyRender: true,
    /**
     * This option gives us the control to disable the default behavior of re-rendering the editor on every transaction.
     */
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        italic: {
          HTMLAttributes: {
            class: "italic",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
        heading: false,
      }),
      Placeholder.configure({
        placeholder: "Untitled",
      }),
      Heading.configure({ levels: [1, 2] }).extend({
        levels: [1, 2],
        renderHTML({ node, HTMLAttributes }) {
          const level = this.options.levels.includes(node.attrs.level)
            ? node.attrs.level
            : this.options.levels[0];
          const classes = {
            1: "text-4xl",
            2: "text-2xl",
          };
          return [
            `h${level}`,
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
              class: `${classes[level]}`,
            }),
            0,
          ];
        },
      }),
    ],
    content: value, // Set the initial content with the provided value
    // onUpdate: ({ editor }) => {
    //   onChange(editor.getHTML()); // Call the onChange callback with the updated HTML content
    // },
    onBlur: ({ editor }) => {
      const content = editor.getHTML();
      onChange(content);
    },
  });

  return (
    <>
      {editor && (
        <BubbleMenu
          className=""
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <div className="border border-input bg-background rounded-md rounded-md p-1 flex flex-row items-center gap-1">
            <Toggle
              size="sm"
              pressed={editor.isActive("bold")}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("italic")}
              onPressedChange={() =>
                editor.chain().focus().toggleItalic().run()
              }
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("strike")}
              onPressedChange={() =>
                editor.chain().focus().toggleStrike().run()
              }
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Separator orientation="vertical" className="w-[1px] h-8" />
            <Toggle
              size="sm"
              pressed={editor.isActive("bulletList")}
              onPressedChange={() =>
                editor.chain().focus().toggleBulletList().run()
              }
            >
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("orderedList")}
              onPressedChange={() =>
                editor.chain().focus().toggleOrderedList().run()
              }
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="w-[1px] h-8" />
            {/*<Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 1 })}
              onPressedChange={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              <Heading1 className="h-4 w-4" />
            </Toggle>*/}
            <Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 2 })}
              onPressedChange={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <Heading2 className="h-4 w-4" />
            </Toggle>
            <Separator orientation="vertical" className="w-[1px] h-8" />
            <Toggle
              size="sm"
              pressed={editor.isActive("undo")}
              onPressedChange={() => editor.chain().focus().undo().run()}
            >
              <Undo />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("redo")}
              onPressedChange={() => editor.chain().focus().redo().run()}
            >
              <Redo />
            </Toggle>
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </>
  );
};

const RichTextEditorToolbar = ({ editor }: { editor: Editor }) => {
  return (
    <div className="border border-input bg-transparent rounded-tr-md rounded-tl-md p-1 flex flex-row items-center gap-1">
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="w-[1px] h-8" />
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
    </div>
  );
};

export default RichTextEditor;

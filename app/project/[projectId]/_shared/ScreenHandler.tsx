"use client";

import { Button } from '@/components/ui/button';
import { ScreenConfig } from '@/type/type';
import {
  Code2Icon,
  Copy,
  Download,
  GripVertical,
  Loader2Icon,
  MoreVertical,
  Sparkle,
  SparkleIcon,
  Trash
} from 'lucide-react';
import React, { useContext, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { toast } from "sonner";
import { HtmlWrapper } from '@/data/constant';
import html2canvas from 'html2canvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import axios from 'axios';
import { RefreshDataContext } from '@/context/RefreshDataContext';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  screen: ScreenConfig | undefined;
  theme: any;
  iframeRef: any;
  projectId: string | undefined;
};

function ScreenHandler({ screen, theme, iframeRef, projectId }: Props) {

  const htmlCode = HtmlWrapper(theme, screen?.code || "");
  const { setRefreshData } = useContext(RefreshDataContext);

  const [editUserInput, setEditUserInput] = useState<string>("");
  const [loading, setLoading] = useState(false);

  /* ================= SCREENSHOT ================= */
  const takeIframeScreenshot = async () => {
    const iframe = iframeRef?.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const body = doc.body;

      await new Promise((res) => requestAnimationFrame(res));

      const canvas = await html2canvas(body, {
        backgroundColor: null,
        useCORS: true,
        scale: window.devicePixelRatio || 1,
      });

      const image = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = image;
      link.download = `${screen?.screenName || "screen"}.png`;
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
      toast.error("Screenshot failed");
    }
  };

  /* ================= COPY ================= */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      toast.success("Code copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  /* ================= DELETE ================= */
  const onDelete = async () => {
    if (!projectId || !screen?.screenId) {
      toast.error("Missing data");
      return;
    }

    try {
      await axios.delete(
        `/api/generateScreenConfig?projectId=${projectId}&screenId=${screen.screenId}`
      );

      toast.success('Screen Deleted');

      setRefreshData({
        method: 'screenConfig',
        date: Date.now()
      });

    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete screen");
    }
  };

  /* ================= EDIT ================= */
  const editScreen = async () => {
    if (!editUserInput.trim()) {
      toast.error("Please enter instructions");
      return;
    }

    if (!projectId || !screen?.screenId) {
      toast.error("Missing project or screen");
      return;
    }

    setLoading(true);
    toast.info('Regenerating screen please wait...')
    try {
      const result = await axios.post('/api/edit-screen', {
        projectId,
        screenId: screen.screenId,
        userInput: editUserInput,
        oldCode: screen?.code || ""
      });

      console.log("✅ EDIT RESULT:", result.data);

      toast.success('Screen updated ✨');

      setRefreshData({
        method: 'screenConfig',
        date: Date.now()
      });

      setEditUserInput("");

    } catch (err) {
      console.error("❌ EDIT ERROR:", err);
      toast.error("Failed to update screen");
    }

    setLoading(false);
  };

  return (
    <div className='flex items-center w-full gap-2'>

      {/* LEFT */}
      <div className='flex items-center gap-2 flex-1 min-w-0'>
        <GripVertical className="text-gray-500 h-4 w-4 shrink-0" />

        <h2 className="truncate text-sm font-medium">
          {screen?.screenName || "No Screen Name"}
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1 shrink-0">

        {/* CODE VIEW */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='ghost' size="icon">
              <Code2Icon />
            </Button>
          </DialogTrigger>

          <DialogContent className="w-[92vw] h-[85vh] max-w-5xl p-0 flex flex-col rounded-2xl shadow-2xl">

            <DialogHeader className="p-5 border-b flex flex-row items-center justify-between">
              <DialogTitle>HTML + TailwindCSS Code</DialogTitle>

              <Button size="sm" variant="secondary" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </DialogHeader>

            <div className="flex-1 p-6 overflow-hidden">
              <div className="w-full h-full overflow-auto rounded-lg border bg-muted">

                <SyntaxHighlighter
                  language="html"
                  style={docco}
                  customStyle={{
                    margin: 0,
                    padding: 20,
                    background: "transparent",
                    whiteSpace: "pre",
                    minWidth: "max-content",
                  }}
                >
                  {htmlCode || "// No code available"}
                </SyntaxHighlighter>

              </div>
            </div>

          </DialogContent>
        </Dialog>

        {/* DOWNLOAD */}
        <Button variant='ghost' size="icon" onClick={takeIframeScreenshot}>
          <Download />
        </Button>

        {/* AI EDIT */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='ghost'>
              <SparkleIcon />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-72">
            <div>
              <Textarea
                placeholder='What changes you want to make?'
                value={editUserInput}
                onChange={(e) => setEditUserInput(e.target.value)}
              />

              <Button
                size='sm'
                className='mt-2 w-full'
                disabled={loading}
                onClick={editScreen}
              >
                {loading ? (
                  <Loader2Icon className='animate-spin' />
                ) : (
                  <>
                    <Sparkle className="mr-1 h-4 w-4" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost'>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-red-500"
              onClick={onDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}

export default ScreenHandler;
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileType, FileText } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { fetchApi, Meeting } from "@/lib/api";
import { Alert } from "@/components/ui/alert";
import { SectionHeader } from "@/components/ui/section-header";

export default function UploadMeetingPage() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      
      // Auto-fill title if empty
      if (!title) {
        let name = e.target.files[0].name;
        name = name.substring(0, name.lastIndexOf('.')) || name;
        setTitle(name);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
      
      // Auto-fill title if empty
      if (!title) {
        let name = e.dataTransfer.files[0].name;
        name = name.substring(0, name.lastIndexOf('.')) || name;
        setTitle(name);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!title.trim()) {
      setError("Please provide a meeting title.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      
      const meeting = await fetchApi<Meeting>("/meetings/upload", {
        method: "POST",
        body: formData,
      });

      router.push(`/dashboard/meetings/${meeting.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to upload meeting. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <SectionHeader 
        title="Upload Meeting" 
        description="Ingest a meeting transcript or document for AI extraction."
      />

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <CardTitle className="text-base font-semibold flex items-center">
            <UploadCloud className="w-4 h-4 mr-2 text-slate-500" />
            File Upload
          </CardTitle>
          <CardDescription>
            Upload a transcript (.txt, .vtt, .srt, .docx, .pdf).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Meeting Title</label>
            <Input 
              placeholder="e.g. Q3 Roadmap Planning" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".txt,.pdf,.docx,.vtt,.srt"
            onChange={handleFileChange}
          />
          
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
              file ? "border-indigo-300 bg-indigo-50/50 shadow-inner" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${file ? "bg-indigo-100" : "bg-slate-100"}`}>
               <UploadCloud className={`h-8 w-8 ${file ? "text-indigo-600" : "text-slate-400"}`} />
            </div>
            <p className="text-sm font-medium text-slate-900">
              {file ? file.name : "Click to select a file or drag and drop"}
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Maximum file size: 10MB"}
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-start">
            <FileText className="h-5 w-5 text-slate-400 mt-0.5 mr-3 shrink-0" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold mb-1">Supported formats:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Plain text transcripts (.txt, .vtt, .srt)</li>
                <li>Document transcripts (.pdf, .docx)</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 p-6">
          <Link href="/dashboard/meetings">
            <Button variant="ghost" disabled={isUploading} className="text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-sm">Cancel</Button>
          </Link>
          <Button onClick={handleUpload} disabled={!file || isUploading || !title.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm">
            {isUploading ? <Spinner className="mr-2 h-4 w-4 text-white" /> : null}
            {isUploading ? "Processing..." : "Upload & Process"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

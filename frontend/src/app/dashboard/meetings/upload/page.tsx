"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileType, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { fetchApi, Meeting } from "@/lib/api";
import { Alert } from "@/components/ui/alert";

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upload Meeting</h1>
        <p className="text-slate-500 mt-1">Ingest a meeting transcript or document for AI extraction.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Upload a transcript (.txt, .vtt, .srt, .docx, .pdf).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Meeting Title</label>
            <Input 
              placeholder="e.g. Q3 Roadmap Planning" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
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
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
              file ? "border-indigo-300 bg-indigo-50" : "border-slate-300 hover:bg-slate-50"
            }`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadCloud className={`mx-auto h-12 w-12 mb-4 ${file ? "text-indigo-600" : "text-slate-400"}`} />
            <p className="text-sm font-medium text-slate-900">
              {file ? file.name : "Click to select a file or drag and drop"}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Maximum file size: 10MB"}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-start">
            <FileType className="h-5 w-5 text-blue-500 mt-0.5 mr-3 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Supported formats:</p>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li>Plain text (.txt, .vtt, .srt)</li>
                <li>Documents (.pdf, .docx)</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
          <Link href="/dashboard/meetings">
            <Button variant="ghost" disabled={isUploading}>Cancel</Button>
          </Link>
          <Button onClick={handleUpload} disabled={!file || isUploading || !title.trim()}>
            {isUploading ? <Spinner className="mr-2 h-4 w-4 text-white" /> : null}
            {isUploading ? "Uploading..." : "Upload and Process"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

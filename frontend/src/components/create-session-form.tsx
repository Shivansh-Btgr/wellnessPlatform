import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";

export function CreateSessionForm({ className, onSuccess, ...props }: React.ComponentProps<"div"> & { onSuccess?: () => void }) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [jsonFileUrl, setJsonFileUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Auto-save related state
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<{title: string, tags: string[], jsonFileUrl: string} | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const draftIdRef = useRef<string | null>(null);

  // Auto-save draft function
  const saveDraft = useCallback(async () => {
    if (!title.trim() && tags.length === 0 && !jsonFileUrl.trim()) {
      return; // Don't save empty drafts
    }

    setAutoSaveStatus("saving");
    
    try {
      const token = localStorage.getItem('accessToken');
      const userRes = await fetch('http://localhost:8000/api/users/me/', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!userRes.ok) throw new Error('Failed to fetch user info');
      const userData = await userRes.json();
      const userId = userData.id;

      const draftPayload = {
        title,
        tags,
        ...(jsonFileUrl.trim() && { json_file_url: jsonFileUrl }),
        status: "draft",
        user: userId,
        ...(draftIdRef.current && { id: draftIdRef.current })
      };

      console.log("Auto-save payload:", draftPayload);

      const endpoint = 'http://localhost:8000/api/my-sessions/save-draft/';

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(draftPayload),
      });

      if (res.ok) {
        const data = await res.json();
        if (!draftIdRef.current && data.id) {
          draftIdRef.current = data.id;
        }
        
        setLastSavedData({ title, tags: [...tags], jsonFileUrl });
        setHasUnsavedChanges(false);
        setAutoSaveStatus("saved");
        
        // Clear the "saved" status after 3 seconds
        setTimeout(() => setAutoSaveStatus("idle"), 3000);
      } else {
        // Get the error details for debugging
        const errorData = await res.json().catch(() => ({}));
        console.error("Auto-save failed:", {
          status: res.status,
          statusText: res.statusText,
          errorData,
          sentPayload: draftPayload
        });
        setAutoSaveStatus("error");
        setTimeout(() => setAutoSaveStatus("idle"), 3000);
      }
    } catch (err) {
      console.error("Auto-save error:", err);
      setAutoSaveStatus("error");
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    }
  }, [title, tags, jsonFileUrl]);

  // Check if data has changed
  const hasDataChanged = useCallback((): boolean => {
    if (!lastSavedData) return !!(title.trim() || tags.length > 0 || jsonFileUrl.trim());
    
    return (
      lastSavedData.title !== title ||
      JSON.stringify(lastSavedData.tags) !== JSON.stringify(tags) ||
      lastSavedData.jsonFileUrl !== jsonFileUrl
    );
  }, [title, tags, jsonFileUrl, lastSavedData]);

  // Auto-save logic with debouncing
  useEffect(() => {
    const dataChanged = hasDataChanged();
    setHasUnsavedChanges(dataChanged);

    if (dataChanged) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for 5 seconds
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, 5000);
    }

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, tags, jsonFileUrl, hasDataChanged, saveDraft]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      // Fetch user id
      const userRes = await fetch('http://localhost:8000/api/users/me/', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!userRes.ok) throw new Error('Failed to fetch user info');
      const userData = await userRes.json();
      const userId = userData.id;

      const endpoint = 'http://localhost:8000/api/my-sessions/save-draft/';
      const sessionPayload = {
        title,
        tags,
        json_file_url: jsonFileUrl,
        status,
        user: userId
      };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(sessionPayload),
      });
      if (res.ok) {
        setSuccess("Session created successfully!");
        setTitle("");
        setTags([]);
        setJsonFileUrl("");
        setStatus("draft");
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        console.error("Backend error:", data);
        setError(JSON.stringify(data) || "Failed to create session");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create Session</CardTitle>
            {/* Auto-save status indicator */}
            <div className="text-sm">
              {autoSaveStatus === "saving" && (
                <span className="text-blue-600">💾 Saving draft...</span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="text-green-600">✅ Draft saved</span>
              )}
              {autoSaveStatus === "error" && (
                <span className="text-red-600">❌ Save failed</span>
              )}
              {autoSaveStatus === "idle" && hasUnsavedChanges && (
                <span className="text-gray-500">📝 Unsaved changes</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  type="text"
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
                <div style={{ marginTop: 4 }}>
                  {tags.map(tag => (
                    <span key={tag} style={{
                      display: 'inline-block',
                      background: '#e0e7ff',
                      color: '#3730a3',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 12,
                      marginRight: 6,
                      marginBottom: 4,
                      cursor: 'pointer'
                    }} onClick={() => handleRemoveTag(tag)}>
                      {tag} &times;
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="jsonFileUrl">JSON File URL</Label>
                <Input
                  id="jsonFileUrl"
                  type="text"
                  value={jsonFileUrl}
                  onChange={e => setJsonFileUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value as "draft" | "published")}
                  style={{ padding: '8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 15 }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-center text-sm">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-center text-sm">{success}</div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

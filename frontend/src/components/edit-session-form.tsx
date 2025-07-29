import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function EditSessionForm({ session, onSuccess, onCancel }: { session: any, onSuccess?: () => void, onCancel?: () => void }) {
  const [title, setTitle] = useState(session.title || "");
  const [tags, setTags] = useState<string[]>(session.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [jsonFileUrl, setJsonFileUrl] = useState(session.json_file_url || "");
  const [status, setStatus] = useState<"draft" | "published">(session.status || "draft");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
      // Use different endpoints based on the target status
      const endpoint = status === 'published' 
        ? 'http://localhost:8000/api/my-sessions/publish/'
        : 'http://localhost:8000/api/my-sessions/save-draft/';
      
      const sessionPayload = {
        id: session.id,
        title,
        tags,
        json_file_url: jsonFileUrl,
        status,
        user: session.user
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
        setSuccess("Session updated successfully!");
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        console.error("Backend error:", data);
        setError(JSON.stringify(data) || "Failed to update session");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", "edit-session-form")}> 
      <Card>
        <CardHeader>
          <CardTitle>Edit Session</CardTitle>
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
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" className="w-full" variant="secondary" onClick={onCancel}>
                  Cancel
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

export default EditSessionForm;

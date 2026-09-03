"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import {
  listLinks,
  createLinkAction,
  updateLinkAction,
  deleteLinkAction,
  revalidateYoutubeLinksCache,
  type LinkRecord,
} from "@/app/admin/links-actions";

const LINK_TYPES = ["youtube", "instagram"];

export default function LinksManager() {
  const [links, setLinks] = useState<LinkRecord[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("youtube");
  const [error, setError] = useState("");
  const [revalidateMessage, setRevalidateMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      setLinks(await listLinks());
    });
  };

  useEffect(refresh, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setUrl("");
    setType("youtube");
    setError("");
  };

  const startEdit = (link: LinkRecord) => {
    setEditingId(link.id);
    setName(link.name);
    setUrl(link.url);
    setType(link.type);
    setError("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("url", url);
    formData.set("type", type);

    startTransition(async () => {
      try {
        if (editingId) {
          await updateLinkAction(editingId, formData);
        } else {
          await createLinkAction(formData);
        }
        resetForm();
        refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this link?")) return;
    startTransition(async () => {
      await deleteLinkAction(id);
      if (editingId === id) resetForm();
      refresh();
    });
  };

  const handleRevalidate = () => {
    startTransition(async () => {
      await revalidateYoutubeLinksCache();
      setRevalidateMessage("Cache revalidated.");
      setTimeout(() => setRevalidateMessage(""), 3000);
    });
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Links</h1>
        <div className="flex items-center gap-3">
          {revalidateMessage && (
            <span className="text-sm text-gray-500">{revalidateMessage}</span>
          )}
          <button
            onClick={handleRevalidate}
            disabled={isPending}
            className="rounded-full border border-gray-400 px-3 py-1 text-sm transition-opacity hover:opacity-60 disabled:opacity-40"
            title="YouTube links are already revalidated automatically on any change — use this to force it manually."
          >
            Revalidate homepage cache
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-10 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          URL
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            type="url"
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          >
            {LINK_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-60 disabled:opacity-40"
        >
          {editingId ? "Save changes" : "Add link"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="text-sm text-gray-500 transition-opacity hover:opacity-60"
          >
            Cancel
          </button>
        )}
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {!links ? (
        <p className="text-gray-500">Loading…</p>
      ) : links.length === 0 ? (
        <p className="text-gray-500">No links yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">URL</th>
                <th className="py-2 pr-4">Clicks</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4">{link.name}</td>
                  <td className="py-2 pr-4">{link.type}</td>
                  <td className="max-w-[200px] truncate py-2 pr-4">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {link.url}
                    </a>
                  </td>
                  <td className="py-2 pr-4">{link.clickCount}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => startEdit(link)}
                      className="mr-3 text-sm underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="text-sm text-red-600 underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import {
  listLinks,
  createLinkAction,
  updateLinkAction,
  deleteLinkAction,
  toggleLinkHiddenAction,
  type LinkRecord,
} from "@/app/admin/links-actions";

const LINK_TYPES = ["youtube", "instagram", "soundcloud"];

export default function LinksManager() {
  const [links, setLinks] = useState<LinkRecord[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("youtube");
  const [hidden, setHidden] = useState(false);
  const [order, setOrder] = useState(1);
  const [error, setError] = useState("");
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
    setHidden(false);
    setOrder(1);
    setError("");
  };

  const startEdit = (link: LinkRecord) => {
    setEditingId(link.id);
    setName(link.name);
    setUrl(link.url);
    setType(link.type);
    setHidden(link.hidden);
    setOrder(link.order);
    setError("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("url", url);
    formData.set("type", type);
    formData.set("order", String(order));
    if (hidden) formData.set("hidden", "on");

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

  const handleToggleHidden = (link: LinkRecord) => {
    startTransition(async () => {
      await toggleLinkHiddenAction(link.id, !link.hidden);
      refresh();
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

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Links</h1>

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

        <label className="flex flex-col gap-1 text-sm">
          Order
          <input
            type="number"
            min={1}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 1)}
            className="w-20 rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => setHidden(e.target.checked)}
          />
          Hidden (won&apos;t show on the homepage)
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
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">URL</th>
                <th className="py-2 pr-4">Clicks</th>
                <th className="py-2 pr-4">Visible</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4">{link.order}</td>
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
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => handleToggleHidden(link)}
                      className="underline"
                    >
                      {link.hidden ? "Hidden" : "Visible"}
                    </button>
                  </td>
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

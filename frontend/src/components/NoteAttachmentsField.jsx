import React, { useRef } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/api";
import "./NoteAttachmentsField.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // per file; no limit on file count
const ACCEPT = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt";

/**
 * Attachments of a note as [{ id, url, name }].
 * Notes saved before multi-file support only have attachment_url/name; that
 * single file is exposed with id "legacy" (the API does the same).
 */
export const getNoteAttachments = (note) => {
  if (!note) return [];
  if (Array.isArray(note.attachments)) return note.attachments;
  if (note.attachment_url) {
    return [
      {
        id: "legacy",
        url: note.attachment_url,
        name: note.attachment_name || "Attachment",
      },
    ];
  }
  return [];
};

const fileUrl = (url) =>
  /^https?:\/\//i.test(url || "") ? url : `${API_BASE_URL}${url}`;

const formatSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Read-only links to every attachment of a note (note list rows). */
export function NoteAttachmentLinks({ note }) {
  return getNoteAttachments(note).map((att) => (
    <a
      key={att.id}
      href={fileUrl(att.url)}
      target="_blank"
      rel="noopener noreferrer"
      className="note-attachment"
    >
      <i className="fas fa-paperclip"></i>
      {att.name || "Attachment"}
    </a>
  ));
}

/**
 * Attachment picker for the note form: any number of files, 10MB each.
 *
 * existing          attachments already saved on the note ({ id, url, name })
 * onRemoveExisting  called with an existing attachment the user removes
 * files / onFilesChange  File objects picked but not uploaded yet
 */
export default function NoteAttachmentsField({
  existing = [],
  onRemoveExisting,
  files = [],
  onFilesChange,
}) {
  const inputRef = useRef(null);

  const handlePick = (e) => {
    const picked = Array.from(e.target.files || []);
    // Clear the input so the same file can be picked again after removing it
    e.target.value = "";
    if (!picked.length) return;

    const accepted = [];
    picked.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.warning(`${file.name} is larger than 10MB and was skipped`);
        return;
      }
      accepted.push(file);
    });
    if (accepted.length) onFilesChange([...files, ...accepted]);
  };

  const removeNewFile = (index) =>
    onFilesChange(files.filter((_, i) => i !== index));

  const total = existing.length + files.length;

  return (
    <div className="form-group note-attachments-field">
      <label>
        Attachments (Images/Files - Max 10MB each, any number of files)
      </label>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handlePick}
        accept={ACCEPT}
        style={{ display: "none" }}
      />
      <button
        type="button"
        className="note-attachments-add"
        onClick={() => inputRef.current?.click()}
      >
        <i className="fas fa-upload"></i> {total ? "Add more files" : "Choose files"}
      </button>

      {total > 0 && (
        <ul className="note-attachments-list">
          {existing.map((att) => (
            <li key={`existing-${att.id}`}>
              <i className="fas fa-paperclip"></i>
              <a
                href={fileUrl(att.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="note-attachments-name"
              >
                {att.name || "Attachment"}
              </a>
              <button
                type="button"
                title="Remove attachment"
                onClick={() => onRemoveExisting(att)}
              >
                <i className="fas fa-times"></i>
              </button>
            </li>
          ))}
          {files.map((file, index) => (
            <li key={`new-${index}-${file.name}`} className="is-new">
              <i className="fas fa-file"></i>
              <span className="note-attachments-name">{file.name}</span>
              <span className="note-attachments-size">
                {formatSize(file.size)}
              </span>
              <button
                type="button"
                title="Remove file"
                onClick={() => removeNewFile(index)}
              >
                <i className="fas fa-times"></i>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Append note attachments to a multipart form.
 *
 * files: a File, an array of Files or a FileList (any number of files)
 * removeAttachmentIds: ids of saved attachments to delete ("legacy" = the
 *   single file stored on notes created before multi-file support)
 */
export function appendNoteAttachments(
  formData,
  files = null,
  removeAttachmentIds = [],
) {
  const list = !files
    ? []
    : files instanceof File
      ? [files]
      : Array.from(files);
  list.forEach((file) => formData.append("attachments", file));

  if (removeAttachmentIds && removeAttachmentIds.length > 0) {
    formData.append(
      "remove_attachment_ids",
      JSON.stringify(removeAttachmentIds),
    );
  }
}

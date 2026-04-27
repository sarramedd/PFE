export interface AttachmentItem {
  id: number;
  fileName: string;
  filePath: string;
  uploadedAt?: string;
  task?: {
    id: number;
    title?: string;
  };
}

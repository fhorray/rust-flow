
import { readFile } from "node:fs/promises";
import { BACKEND_URL } from "./paths.ts";
import { loadToken } from "./config.ts";

export class CoursePublisher {
  static async publish(courseId: string, version: string, filePath: string, metadata: any = {}, guardSnapshot?: any): Promise<{ success: boolean; message?: string }> {
    const token = await loadToken();
    if (!token) {
      return { success: false, message: "Not authenticated. Please run 'progy login' first." };
    }

    try {
      const fileBuffer = await readFile(filePath);
      const blob = new Blob([fileBuffer]);

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("version", version);
      formData.append("metadata", JSON.stringify(metadata));
      if (guardSnapshot) {
        formData.append("guardSnapshot", JSON.stringify(guardSnapshot));
      }
      formData.append("file", blob, "course.progy");

      const response = await fetch(`${BACKEND_URL}/registry/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorText = await response.text();
        return { success: false, message: `Publish failed: ${response.status} ${response.statusText} - ${errorText}` };
      }
    } catch (e: any) {
      return { success: false, message: `Network error: ${e.message}` };
    }
  }
}

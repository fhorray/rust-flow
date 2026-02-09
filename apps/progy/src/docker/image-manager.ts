import { join } from "node:path";
import { DockerClient } from "./client";

export class ImageManager {
  private docker: DockerClient;

  constructor() {
    this.docker = new DockerClient();
  }

  /**
   * Ensures the image is built and up-to-date.
   * If the image does not exist, it builds it using the provided context and Dockerfile.
   */
  async ensureImage(tag: string, contextPath: string, dockerfileRel: string): Promise<void> {
    const dockerfileAbs = join(contextPath, dockerfileRel);

    // 1. Check if image exists
    const exists = await this.docker.imageExists(tag);
    if (!exists) {
      console.log("Image not found locally. Building...");
      await this.docker.buildImage(tag, contextPath, dockerfileAbs);
      return;
    }

    // TODO: Implement staleness check based on file hash or mtime.
    // For now, we assume existing image is sufficient.
  }

  /**
   * Generates a unique tag based on course ID.
   */
  generateTag(courseId: string): string {
    // Sanitize ID to be Docker-compatible (lowercase, alphanumeric, dashes)
    const safeId = courseId.toLowerCase().replace(/[^a-z0-9]/g, "-");
    return `progy-course-${safeId}:latest`;
  }
}

"use client";

import { useState } from "react";

function toPrettyJson(value) {
  if (!value) {
    return "";
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (_error) {
    return String(value);
  }
}

function makeDefaultPath(prefix, suffix) {
  return `${prefix}/test-app-${Date.now()}${suffix}`;
}

export default function MediaExamples() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePath, setImagePath] = useState(() => makeDefaultPath("images", ".jpg"));
  const [imageFetchPath, setImageFetchPath] = useState("");
  const [imageResult, setImageResult] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [videoPath, setVideoPath] = useState(() => makeDefaultPath("videos", ".mp4"));
  const [videoFetchPath, setVideoFetchPath] = useState("");
  const [videoResult, setVideoResult] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");

  const [multipartFile, setMultipartFile] = useState(null);
  const [multipartPath, setMultipartPath] = useState(() => makeDefaultPath("videos", ".mp4"));
  const [multipartPartSizeMb, setMultipartPartSizeMb] = useState("8");
  const [multipartResult, setMultipartResult] = useState(null);
  const [multipartPreviewUrl, setMultipartPreviewUrl] = useState("");
  const [multipartLoading, setMultipartLoading] = useState(false);
  const [multipartError, setMultipartError] = useState("");

  async function handleImageUpload(event) {
    event.preventDefault();
    setImageError("");
    setImageResult(null);
    if (!imageFile) {
      setImageError("Choose an image file first.");
      return;
    }
    if (!imagePath.trim()) {
      setImageError("Path is required.");
      return;
    }

    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("path", imagePath.trim());
      formData.append("content_type", imageFile.type || "image/jpeg");

      const response = await fetch("/api/media/examples/image-upload", {
        method: "POST",
        body: formData
      });
      const payload = await response.json().catch(() => ({}));
      setImageResult(payload);

      if (!response.ok) {
        setImageError(payload?.error || "Image upload failed.");
        return;
      }

      const key = String(payload?.key || imagePath).trim();
      setImageFetchPath(key);
      setImagePreviewUrl(String(payload?.fetch_url || ""));
    } catch (_error) {
      setImageError("Network error while uploading image.");
    } finally {
      setImageLoading(false);
    }
  }

  async function handleImageFetch() {
    const path = imageFetchPath.trim() || imagePath.trim();
    if (!path) {
      setImageError("Provide an image path to fetch.");
      return;
    }

    setImageError("");
    setImageLoading(true);
    try {
      const response = await fetch(`/api/media/images/fetch-url?path=${encodeURIComponent(path)}`, {
        method: "GET"
      });
      const payload = await response.json().catch(() => ({}));
      setImageResult(payload);
      if (!response.ok) {
        setImageError(payload?.error || "Could not fetch image URL.");
        return;
      }
      setImagePreviewUrl(String(payload?.fetch_url || ""));
    } catch (_error) {
      setImageError("Network error while fetching image URL.");
    } finally {
      setImageLoading(false);
    }
  }

  async function handleVideoUpload(event) {
    event.preventDefault();
    setVideoError("");
    setVideoResult(null);
    if (!videoFile) {
      setVideoError("Choose a video file first.");
      return;
    }
    if (!videoPath.trim()) {
      setVideoError("Path is required.");
      return;
    }

    setVideoLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("path", videoPath.trim());
      formData.append("content_type", videoFile.type || "video/mp4");

      const response = await fetch("/api/media/examples/video-upload", {
        method: "POST",
        body: formData
      });
      const payload = await response.json().catch(() => ({}));
      setVideoResult(payload);

      if (!response.ok) {
        setVideoError(payload?.error || "Video upload failed.");
        return;
      }

      const key = String(payload?.key || videoPath).trim();
      setVideoFetchPath(key);
      setVideoPreviewUrl(String(payload?.fetch_url || ""));
    } catch (_error) {
      setVideoError("Network error while uploading video.");
    } finally {
      setVideoLoading(false);
    }
  }

  async function handleVideoFetch() {
    const path = videoFetchPath.trim() || videoPath.trim();
    if (!path) {
      setVideoError("Provide a video path to fetch.");
      return;
    }

    setVideoError("");
    setVideoLoading(true);
    try {
      const response = await fetch(`/api/media/videos/fetch-url?path=${encodeURIComponent(path)}`, {
        method: "GET"
      });
      const payload = await response.json().catch(() => ({}));
      setVideoResult(payload);
      if (!response.ok) {
        setVideoError(payload?.error || "Could not fetch video URL.");
        return;
      }
      setVideoPreviewUrl(String(payload?.fetch_url || ""));
    } catch (_error) {
      setVideoError("Network error while fetching video URL.");
    } finally {
      setVideoLoading(false);
    }
  }

  async function handleMultipartUpload(event) {
    event.preventDefault();
    setMultipartError("");
    setMultipartResult(null);
    if (!multipartFile) {
      setMultipartError("Choose a video file first.");
      return;
    }
    if (!multipartPath.trim()) {
      setMultipartError("Path is required.");
      return;
    }

    setMultipartLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", multipartFile);
      formData.append("path", multipartPath.trim());
      formData.append("content_type", multipartFile.type || "video/mp4");
      formData.append("part_size_mb", multipartPartSizeMb || "8");

      const response = await fetch("/api/media/examples/video-upload-multipart", {
        method: "POST",
        body: formData
      });
      const payload = await response.json().catch(() => ({}));
      setMultipartResult(payload);
      if (!response.ok) {
        setMultipartError(payload?.error || "Multipart upload failed.");
        return;
      }

      setMultipartPreviewUrl(String(payload?.fetch_url || ""));
    } catch (_error) {
      setMultipartError("Network error while uploading video with multipart.");
    } finally {
      setMultipartLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Media Endpoint Examples</h2>
      <p className="muted">
        These forms call the new media endpoints through local test-app routes and upload to S3 using
        signed URLs.
      </p>
      <div className="media-grid">
        <article className="media-block">
          <h3>Image Upload + Fetch</h3>
          <form onSubmit={handleImageUpload}>
            <input
              type="text"
              value={imagePath}
              onChange={(event) => setImagePath(event.target.value)}
              placeholder="images/custom/demo.jpg"
            />
            <div className="spacer-sm" />
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
            <div className="spacer-sm" />
            <div className="row">
              <button type="submit" disabled={imageLoading}>
                {imageLoading ? "Uploading..." : "Upload Image"}
              </button>
              <button className="secondary" type="button" onClick={handleImageFetch} disabled={imageLoading}>
                Fetch by Path
              </button>
            </div>
          </form>
          <div className="spacer-sm" />
          <input
            type="text"
            value={imageFetchPath}
            onChange={(event) => setImageFetchPath(event.target.value)}
            placeholder="images/custom/demo.jpg"
          />
          <div className="spacer-sm" />
          {imageError ? <p className="error">{imageError}</p> : null}
          {imagePreviewUrl ? <img className="preview-image" src={imagePreviewUrl} alt="Uploaded preview" /> : null}
          <pre className="small-pre">{toPrettyJson(imageResult) || "{ }"}</pre>
        </article>

        <article className="media-block">
          <h3>Video Upload + Fetch</h3>
          <form onSubmit={handleVideoUpload}>
            <input
              type="text"
              value={videoPath}
              onChange={(event) => setVideoPath(event.target.value)}
              placeholder="videos/custom/demo.mp4"
            />
            <div className="spacer-sm" />
            <input
              type="file"
              accept="video/*"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
            />
            <div className="spacer-sm" />
            <div className="row">
              <button type="submit" disabled={videoLoading}>
                {videoLoading ? "Uploading..." : "Upload Video"}
              </button>
              <button className="secondary" type="button" onClick={handleVideoFetch} disabled={videoLoading}>
                Fetch by Path
              </button>
            </div>
          </form>
          <div className="spacer-sm" />
          <input
            type="text"
            value={videoFetchPath}
            onChange={(event) => setVideoFetchPath(event.target.value)}
            placeholder="videos/custom/demo.mp4"
          />
          <div className="spacer-sm" />
          {videoError ? <p className="error">{videoError}</p> : null}
          {videoPreviewUrl ? (
            <video className="preview-video" controls src={videoPreviewUrl}>
              <track kind="captions" />
            </video>
          ) : null}
          <pre className="small-pre">{toPrettyJson(videoResult) || "{ }"}</pre>
        </article>
      </div>

      <div className="spacer" />
      <article className="media-block">
        <h3>Large Video Multipart Upload Example</h3>
        <p className="muted">
          Uses `/api/media/videos/multipart/init`, `part-url`, `complete`, and `abort` under the hood.
        </p>
        <form onSubmit={handleMultipartUpload}>
          <input
            type="text"
            value={multipartPath}
            onChange={(event) => setMultipartPath(event.target.value)}
            placeholder="videos/custom/large-demo.mp4"
          />
          <div className="spacer-sm" />
          <div className="media-grid">
            <input
              type="file"
              accept="video/*"
              onChange={(event) => setMultipartFile(event.target.files?.[0] || null)}
            />
            <input
              type="number"
              min="5"
              max="128"
              value={multipartPartSizeMb}
              onChange={(event) => setMultipartPartSizeMb(event.target.value)}
              placeholder="Part size MB"
            />
          </div>
          <div className="spacer-sm" />
          <button type="submit" disabled={multipartLoading}>
            {multipartLoading ? "Uploading in Parts..." : "Run Multipart Upload"}
          </button>
        </form>
        <div className="spacer-sm" />
        {multipartError ? <p className="error">{multipartError}</p> : null}
        {multipartPreviewUrl ? (
          <video className="preview-video" controls src={multipartPreviewUrl}>
            <track kind="captions" />
          </video>
        ) : null}
        <pre className="small-pre">{toPrettyJson(multipartResult) || "{ }"}</pre>
      </article>
    </section>
  );
}

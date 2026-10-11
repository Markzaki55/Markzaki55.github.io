/* Browser-side video inspection and poster capture; loaded only by the local studio. */
(function (root) {
  "use strict";
  async function frame(source, time = 0.5) {
    const temporary = source instanceof Blob;
    const url = temporary ? URL.createObjectURL(source) : await PortfolioMedia.resolve(source);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    try {
      return await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Video inspection timed out. Try an H.264 MP4 or VP9 WebM.")), 20000);
        const fail = () => { clearTimeout(timer); reject(new Error("This video cannot be decoded in this browser. Try an H.264 MP4 or VP9 WebM.")); };
        video.onerror = fail;
        video.onloadedmetadata = () => {
          if (!Number.isFinite(video.duration) || !video.videoWidth) { fail(); return; }
          video.currentTime = Math.min(Math.max(0, time), Math.max(0, video.duration - 0.05));
        };
        let captured = false;
        function capture() {
          if (captured || video.readyState < 2) return;
          captured = true;
          const canvas = document.createElement("canvas");
          const scale = Math.min(1, 960 / video.videoWidth);
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);
          try {
            canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((poster) => {
              clearTimeout(timer);
              if (!poster) { reject(new Error("Could not capture a poster.")); return; }
              resolve({ poster, duration: video.duration, width: video.videoWidth, height: video.videoHeight });
            }, "image/jpeg", 0.82);
          } catch (error) { clearTimeout(timer); reject(error); }
        }
        video.onseeked = capture;
        video.onloadeddata = () => { if (video.currentTime === 0) capture(); };
        video.src = url;
      });
    } finally {
      video.pause(); video.removeAttribute("src"); video.load();
      if (temporary) URL.revokeObjectURL(url);
    }
  }
  function describe(info) {
    const details = [info.name, info.size != null ? `${(info.size / 1048576).toFixed(1)} MB` : ""];
    if (info.duration != null) details.push(`${info.duration.toFixed(1)}s`, `${info.width} × ${info.height}`);
    return details.filter(Boolean).join(" · ");
  }
  root.StudioMedia = { frame, describe };
})(globalThis);

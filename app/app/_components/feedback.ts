export function triggerHaptic() {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate([50]);
  }
}

export function playSuccessSound() {
  if (typeof window !== "undefined") {
    try {
      const audio = new Audio("/sounds/success.mp3");
      audio.volume = 0.5;
      audio.play().catch((err) => {
        console.warn("Audio playback blocked by browser:", err);
      });
    } catch (err) {
      console.warn("Failed to play audio:", err);
    }
  }
}

import { useCallback, useEffect, useState } from "react";
import volumeImg from "../../../assets/volume.svg";
import { sound } from "@pixi/sound";
import Button from "./Button";

export default function MusicButton() {
  const [isPlaying, setPlaying] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);

  // // Load selected music from localStorage
  // useEffect(() => {
  //   try {
  //     const storedMusic = JSON.parse(localStorage.getItem("selectedMusic") || "null");
  //     if (storedMusic && storedMusic.file) {
  //       setSelectedMusic(storedMusic.file);
  //     }
  //   } catch (error) {
  //     console.error("Error reading from localStorage:", error);
  //   }
  // }, []);

  // // Add music to Pixi sound system
  // useEffect(() => {
  //   if (selectedMusic) {
  //     // Ensure correct path
  //     const musicPath = selectedMusic;

  //     // Avoid duplicate audio loading
  //     if (!sound.exists("background")) {
  //       sound.add("background", {
  //         url: musicPath,
  //         loop: true,
  //         preload: true,
  //         autoPlay: false,
  //       });
  //     }
  //   }
  // }, [selectedMusic]);

  useEffect(() => {
    // Stop any existing background music
    if (sound.exists("background")) {
      sound.stop("background");
      sound.remove("background");
    }

    try {
      const storedMusic = JSON.parse(localStorage.getItem("selectedMusic") || "null");
      if (storedMusic && storedMusic.file) {
        setSelectedMusic(storedMusic.file);
        // Add new music but don't autoplay
        sound.add("background", {
          url: storedMusic.file,
          loop: true,
          preload: true,
          autoPlay: false,
        });
        setPlaying(false); // Ensure button shows "Music" initially
      } else {
        // If no stored music, use default
        const defaultMusicPath = '/ai-town/assets/background.mp3';
        sound.add("background", {
          url: defaultMusicPath,
          loop: true,
          preload: true,
          autoPlay: false,
        });
        setPlaying(false);
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
  }, []);





  // Play/Pause music
  const flipSwitch = async () => {
    if (!selectedMusic) {
      console.warn("No music selected.");
      return;
    }

    if (isPlaying) {
      sound.stop("background");
    } else {
      await sound.play("background");
    }
    setPlaying(!isPlaying);
  };

  // Handle keyboard shortcut (press 'm' to play/mute)
  const handleKeyPress = useCallback(
    (event: { key: string }) => {
      if (event.key === "m" || event.key === "M") {
        void flipSwitch();
      }
    },
    [flipSwitch]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return (
    <>
      <Button
        onClick={() => void flipSwitch()}
        className="hidden lg:block"
        title="press M to play/mute"
        imgUrl={volumeImg}
      >
        {isPlaying ? "Mute" : "Music"}
      </Button>
    </>
  );
}

import type React from "react"
import { useState,useEffect } from "react"
import "./SelectMusic.css"
import { sound } from "@pixi/sound";

const songs: Song[] = [
  { id: 1, name: "Calming Piano ", file: "music1.mp3" },
  { id: 2, name: "Ready for Battle", file: "music2.mp3" },
  { id: 3, name: "Happy Adventure", file: "music3.mp3" },
]

type Song = {
  id: number
  name: string
  file: string
}

type SelectMusicProps = {
  selectedMusic: number | null
  setSelectedMusic: (id: number) => void
  onBack: () => void
  onSave: () => void
}

export const SelectMusic: React.FC<SelectMusicProps> = ({ selectedMusic, setSelectedMusic, onBack, onSave }) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  // when enter the music selection page, stops any music.
  useEffect(() => {
    if (sound.exists("background")) {
      sound.stop("background");
    }
    
    return () => {
      //when leaving the music selection page, stop any music
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);
  const handleMusicClick = (song: Song) => {
    setSelectedMusic(song.id)

    // Stop the current audio if playing
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }

    // Create and play new audio from /public/assets/
    const newAudio = new Audio(`/assets/${song.file}`)
    newAudio.play()
    setAudio(newAudio)
  }


  const handleSave = () => {
    // Stop audio when saving
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    onSave();
  };

  const handleBack = () => {
    // Stop audio when going back
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    onBack();
  };

  return (
    <div className="pixel-container">
      <h1 className="pixel-title">Choose Your Music</h1>
      <div className="pixel-content">
        <div className="pixel-list">
          {songs.map((song) => (
            <div
              key={song.id}
              className={`pixel-item ${selectedMusic === song.id ? "selected" : ""}`}
              onClick={() => handleMusicClick(song)}
            >
              <span>{song.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="pixel-actions">
        <button className="pixel-btn" onClick={handleBack}>
          Back
        </button>
        <button className="pixel-btn" onClick={handleSave} disabled={!selectedMusic}>
          Save
        </button>
      </div>
    </div>
  )
}



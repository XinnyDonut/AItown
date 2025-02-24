import type React from "react"
import { Check, X } from "lucide-react"// 
import "./MultiSelectModal.css"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api";

//this Modal is the Modal when you click "ADD TO WORLD" on the UI, 
//it handles save template and user can select agents that will be add to actually add to the world:)
type Character = {
  id: string
  name: string
  preview: string
  description: string
  goals: string
  character: string
}

type MultiSelectModalProps = {
  characters: Character[]
  selectedCharacters: string[]
  onSelect: (id: string) => void
  onClose: () => void
  onSave: () => void
}

export const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
  characters,
  selectedCharacters,
  onSelect,
  onClose,
  onSave,
}) => {
  const saveTemplateMutation= useMutation(api["customizeAgents/mutations"].saveTemplate) 

  // in add to the world, user can save template
  const handleSaveWithTemplate =async () => {
    if (selectedCharacters.length === 0) return;
    const name = window.prompt("Enter template name");
    if (name === null) return; 

    console.log("Characters:", characters);
    console.log("Selected IDs:", selectedCharacters);

    const selectAgents =characters
      .filter(char=>selectedCharacters.includes(char.id))
      .map(char=>{
        console.log("Character being mapped:", char);
        const spriteCharacter = char.preview
        .replace("/sprites/", "")
        .replace(".png", "");
        return{
          name:char.name,
          character:spriteCharacter,
          identity:char.description,
          plan:char.goals,
          }
      })
      console.log("Mapped agents:", selectAgents);
    try {
      await saveTemplateMutation({
        name:name,
        agents:selectAgents,
      })
      console.log(`saved Template: template name:${name} , agentIncludes: ${selectAgents}`)
    }catch(error){
      console.error("Failed to save Template",error)
    }
  }
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="pixel-subtitle">Select Multiple Characters</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="character-grid">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`character-card ${selectedCharacters.includes(character.id) ? "selected" : ""}`}
              onClick={() => onSelect(character.id)}
            >
              <img src={character.preview || "/placeholder.svg"} alt={character.name} className="character-avatar" />
              <span className="character-name">{character.name}</span>
              {selectedCharacters.includes(character.id) && <Check className="check-icon" size={24} />}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="pixel-btn" onClick={onClose}>
            Cancel
          </button>
          {/* handleSaveWithTemplate let user save template in this Modal*/}
          <button className="pixel-btn" onClick={handleSaveWithTemplate} disabled={selectedCharacters.length === 0}>
            Save Template
          </button>
          {/* onSave handles which agents get actually added to the world, it's passed in EditCharacter*/}
          <button className="pixel-btn" onClick={onSave} disabled={selectedCharacters.length === 0}>
            Save Selection
          </button>  
        </div>
      </div>
    </div>
  )
}


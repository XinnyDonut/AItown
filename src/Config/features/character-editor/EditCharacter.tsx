import type React from "react"
import { useState } from "react"
import { Upload, X } from "lucide-react"
import "./EditCharacter.css"
import { MultiSelectModal } from "./MultiSelectModal"
import { SpriteSelectionModal } from "./SpriteSelectionModal"
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AgentTemplateLoadModal } from './AgentTemplateLoadModal';
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

type Character = {
  id: string //convex db id must be string
  name: string //name is name
  description: string //actually identity in db
  goals: string //hmmm.. =plans for backend!
  preview: string //not my thing but returns f*. Change ticked
  isCustom?: boolean //not my thing
}

type EditCharacterProps = {
  selectedCharacter: string | null
  setSelectedCharacter: (id: string) => void
  onBack: () => void
  onNext: () => void
}

export const EditCharacter: React.FC<EditCharacterProps> = ({
  selectedCharacter,
  setSelectedCharacter,
  onBack,
  onNext,
}) => {
  
  const agentDocs = useQuery(api["customizeAgents/queries"].getAgents) ?? []; //must do this. Convex thing. hate it.
  const predefinedCharacters = agentDocs.map((doc) => ({
  id: doc._id,
  name: doc.name,
  description: doc.identity,
  goals: doc.plan,
  preview: doc.character
    ? `/sprites/${doc.character}.png`
    : "/placeholder.svg?height=200&width=200",
  isCustom: true,
  }));
  const [isCreating, setIsCreating] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [showMultiSelectModal, setShowMultiSelectModal] = useState(false)
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [showSpriteModal, setShowSpriteModal] = useState(false)
  const [showTemplateLoadModal, setShowTemplateLoadModal] = useState(false)
  const [addedToWorld, setAddedToWorld] = useState<boolean>(false);
  //add delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  //add isDeleting status
  const [isDeleting, setIsDeleting] = useState(false)

  const handleImageUpload = () => {
    setShowSpriteModal(true)
  }

  const handleSpriteSelect = (sprite: string) => {
    if (editingCharacter) {
      setEditingCharacter((prev) => ({
        ...prev!,
        preview: `/sprites/${sprite}.png`,
      }))
    }
    setShowSpriteModal(false)
  }

  const createAgentMutation = useMutation(api["customizeAgents/mutations"].createAgent); //I want to mutate too. Damn.
  const updateAgentMutation = useMutation(api["customizeAgents/mutations"].updateAgent); //doesn't like my docker environment. Hate it more.
  const deleteAgentMutation =useMutation(api["customizeAgents/mutations"].deleteAgent);
  const selectAgentForWorldMutation = useMutation(api["customizeAgents/mutations"].selectAgentForWorld);
  const updateSelectedAgentsMutation = useMutation(api["customizeAgents/mutations"].updateSelectedAgents)
  
  const handleLoadTemplate = async (template: Template) => {
    try {
      if (!confirm("Loading a template will remove all existing agents. Continue?")) {
        return;
      }
      //when load a template, clear any existing agents in the agentTable
      await Promise.all(
        agentDocs.map(agent => deleteAgentMutation({ id: agent._id }))
      );
  
      // then create new agents with the agent in templates,and insert in the agentsTable
      const createdAgents = await Promise.all(
        template.agents.map(agent => createAgentMutation(agent))
      );
      
      //though now, we haven't select any agents to acutally add to the world, we are simply loading the template for user to see
      setAddedToWorld(false)
      setSelectedCharacters([])
      setShowTemplateLoadModal(false);
    
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template. Please try again.');
    }
  };

// previous implementation, delete all the agents table--not ideal
// const handleMultiSelectSave = async () => {
//   if (selectedCharacters.length === 0) return

//   try {
//     // delete all agents that are not selected using agent id
//     const agentsToDelete = agentDocs
//       .filter(agent => !selectedCharacters.includes(agent._id))
//       .map(agent => agent._id)

//     await Promise.all(
//       agentsToDelete.map(id => deleteAgentMutation({ id }))
//     )

//     // Update selectedAgents in backend
//     await updateSelectedAgentsMutation({
//       agentIds: selectedCharacters
//     })

//     setShowMultiSelectModal(false)
//     setAddedToWorld(true)
//   } catch (error) {
//     console.error('Error saving selection:', error)
//     alert('Failed to save selection. Please try again.')
//   }
// }

//this is the function that actually select which agents to add to the world, when click the save selection btn on add to world
const handleMultiSelectSave = async () => {
  if (selectedCharacters.length === 0) return

  try {
    // Verify all selected agents still exist
    const selectedAgentsExist = await Promise.all(
      selectedCharacters.map(async id => {
        const agent = agentDocs.find(a => a._id === id)
        return !!agent
      })
    )

    if (!selectedAgentsExist.every(exists => exists)) {
      throw new Error("One or more selected agents no longer exist")
    }

    // Update selectedAgents with valid selections
    await updateSelectedAgentsMutation({
      agentIds: selectedCharacters 
    })

    setShowMultiSelectModal(false)
    setAddedToWorld(true)

  } catch (error) {
    console.error('Error saving selection:', error)
    alert('Failed to save selection. Please try again.')
  }
}



  // determine if Next button should be enabled--only enable the btn when there is at least one agent added to the world
  const isNextEnabled = addedToWorld && selectedCharacters.length > 0

  //when deleting character from the thumbnail, both state and database will update---not ideal
  // const handleRemoveCharacter = async (id: string) => {
  //   try {
  //     //  update selectedCharacters state
  //     setSelectedCharacters((prev) => {
  //       const newSelected = prev.filter((charId) => charId !== id);
        
  //       // Update selectedAgents in backend with new selection
  //       updateSelectedAgentsMutation({
  //         agentIds: newSelected  //sending  updated list to backend
  //       }).catch(error => {
  //         console.error('Error updating selected agents:', error);
  //       });
        
  //       return newSelected;
  //     });
      
  //     // remove from agents database
  //     await deleteAgentMutation({ id });
  
  //     // if no characters left, reset addedToWorld --noOne added to the world
  //     if (selectedCharacters.length <= 1) {
  //       setAddedToWorld(false);
  //     }
  //   } catch (error) {
  //     console.error('Error removing character:', error);
  //     alert('Failed to remove character. Please try again.');
  //   }
  // };

  //this is the function that handle deleting 
  const handleRemoveCharacter = async (id: string) => {
    try {
      // only update selectedCharacters state and selectedAgents in backend--keep the agent database!
      setSelectedCharacters((prev) => {
        const newSelected = prev.filter((charId) => charId !== id);
        
        // update selectedAgents table with new selection
        updateSelectedAgentsMutation({
          agentIds: newSelected
        }).catch(error => {
          console.error('Error updating selected agents:', error);
        });
        
        return newSelected;
      });
  
      // if no characters left, reset addedToWorld--no one is added to the world, cannot go to next stpe
      if (selectedCharacters.length <= 1) {
        setAddedToWorld(false);
      }
    } catch (error) {
      console.error('Error removing character from selection:', error);
      alert('Failed to remove character from selection. Please try again.');
    }
  };
  

  
  const handleSave = async () => {
    if (!editingCharacter) return;
  
    //判断新建还是eedit
    const existing = agentDocs.find((doc) => doc._id === editingCharacter.id);
    if (!existing) {
      // 新建
      await createAgentMutation({
        name: editingCharacter.name,
        //  还原成 "f*"()，目前用的predefined spritesheet template，改的粗
        character: editingCharacter.preview
          .replace("/sprites/", "")
          .replace(".png", ""),
        identity: editingCharacter.description,
        plan: editingCharacter.goals,
      });
    } else {
      // edit
      await updateAgentMutation({
        id: { tableName: "agents", id: editingCharacter.id },
        name: editingCharacter.name,
        character: editingCharacter.preview
          .replace("/sprites/", "")
          .replace(".png", ""),
        identity: editingCharacter.description,
        plan: editingCharacter.goals,
      });
    }
  
    setIsDeleting(false);
    setIsCreating(false);
    setEditingCharacter(null);
    // await updateDescriptions();
  };
  

  const handleCancel = () => {
    setIsDeleting(false)
    setIsCreating(false)
    setEditingCharacter(null)
  }

  const currentCharacter = predefinedCharacters.find((char) => char.id === selectedCharacter)

  const renderCharacterForm = () => (
    <div className="character-details">  
      <div className="character-header">
        <input
          type="text"
          className="pixel-input"
          placeholder={isCreating ? "Agent Name" : "Character Name"}
          value={editingCharacter?.name || ""}
          onChange={(e) => setEditingCharacter((prev) => ({ ...prev!, name: e.target.value }))}
        />
      </div>
      <div className="character-preview">
        <div className="preview-upload">
          <img
            src={editingCharacter?.preview || "/placeholder.svg"}
            alt="Character preview"
            className="preview-image"
          />
          <button className="upload-btn pixel-btn" onClick={handleImageUpload}>
            <Upload size={16} />
            Choose Sprite
          </button>
        </div>
      </div>
      <div className="character-info">
        <div className="info-section">
          <h3>Description</h3>
          <textarea
            className="pixel-textarea"
            value={editingCharacter?.description || ""}
            onChange={(e) => setEditingCharacter((prev) => ({ ...prev!, description: e.target.value }))}
            placeholder="Enter character description..."
          />
        </div>
        <div className="info-section">
          <h3>Goals</h3>
          <textarea
            className="pixel-textarea"
            value={editingCharacter?.goals || ""}
            onChange={(e) => setEditingCharacter((prev) => ({ ...prev!, goals: e.target.value }))}
            placeholder="Enter character goals..."
          />
        </div>
      </div>
      <div className="edit-actions">
        <button className="pixel-btn" onClick={handleCancel}>
          Cancel
        </button>
        <button className="pixel-btn" onClick={handleSave} disabled={!editingCharacter?.name}>
          Save
        </button>
      </div>
    </div>
  )

  // const handleDeleteCharacter = async () => {
  //   if (selectedCharacter) {
  //     try {
  //       setIsDeleting(true);
  //       await deleteAgentMutation({ id: selectedCharacter });  // 直接调用，传入正确的参数
        
  //       setSelectedCharacter(null);
  //       setShowDeleteConfirmation(false);
  //       setIsDeleting(false);
        
  //       // 不需要手动更新 predefinedCharacters，因为 useQuery 会自动刷新
  //     } catch (error) {
  //       console.error("Error deleting character:", error);
  //       setIsDeleting(false);
  //     }
  //   }
  // };
  

  const handleDeleteCharacter = async () => {
    if (selectedCharacter) {
      try {
        setIsDeleting(true);
        await deleteAgentMutation({ id: selectedCharacter });
        
        // Also remove from selectedCharacters if it was there
        setSelectedCharacters(prev => prev.filter(id => id !== selectedCharacter));
        
        // Update selectedAgents in backend with remaining agents
        const remainingAgentIds = selectedCharacters.filter(id => id !== selectedCharacter);
        await updateSelectedAgentsMutation({
          agentIds: remainingAgentIds
        });
        
        // Reset states
        setSelectedCharacter(null);
        setShowDeleteConfirmation(false);
        setIsDeleting(false);
        
        // Reset addedToWorld if no agents left
        if (remainingAgentIds.length === 0) {
          setAddedToWorld(false);
        }
      } catch (error) {
        console.error("Error deleting character:", error);
        setIsDeleting(false);
      }
    }
  };

  //agent详情列表(右侧)
  const renderCharacterDetails = () => (
    <div className="character-details">
      {selectedCharacter ? (
        <>
          <div className="character-header">
            <h2 className="character-name">{currentCharacter?.name}</h2>
          </div>
          <div className="character-preview-container">
            <img
              src={currentCharacter?.preview || "/placeholder.svg"}
              alt={`${currentCharacter?.name} preview`}
              className="preview-image"
            />
            <div className="character-actions">
              <button
                className="pixel-btn delete-btn"
                onClick={() => setShowDeleteConfirmation(true)}
              >
                Delete
              </button>
              <button className="pixel-btn advanced-btn">Advanced</button>
            </div>
      
          </div>
          <div className="character-info">
            <div className="info-section">
              <h3>Description</h3>
              <div className="scrollable-text">{currentCharacter?.description}</div>
            </div>
            <div className="info-section">
              <h3>Goals</h3>
              <div className="scrollable-text">{currentCharacter?.goals}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="character-placeholder">
          <p className="pixel-message">Select a character to view details</p>
        </div>
      )}
    </div>
  )

  //左侧的列表
  const renderCharacterList = () => (
    <div className="character-list-container">
      <div className="list-actions">
      <button className="pixel-btn" onClick={() => setShowTemplateLoadModal(true)}>
          Load Saved Template
        </button>
        <button
          className="pixel-btn"
          onClick={() => {
            setEditingCharacter({
              id: "temp-new-" + Date.now(), //placeholder id. yikes.
              name: "",
              description: "",
              goals: "",
              preview: "/placeholder.svg?height=200&width=200",
              isCustom: true,
            });
            setIsCreating(true);
          }}
        >
          Create Agent
        </button>
        <button className="pixel-btn" onClick={() => setShowMultiSelectModal(true)}>
          Add to World
        </button>
      </div>
      <div className="character-list">
        {predefinedCharacters.map((character) => (
          <div
            key={character.id}
            className={`pixel-item ${selectedCharacter === character.id ? "selected" : ""}`}
            onClick={() => setSelectedCharacter(character.id)}
          >
            <img src={character.preview || "/placeholder.svg"} alt={character.name} className="character-thumbnail" />
            <span>{character.name}</span>
            {character.isCustom && <span className="custom-badge">Custom</span>}
          </div>
          
        ))}
      </div>
    </div>
    
  )
  //最左下角选中角色的列表
  const renderSelectedCharactersThumbnails = () => (
    <div className="selected-characters-thumbnails">
      <h3 className="pixel-subtitle">Selected Characters</h3>
      <div className="thumbnails-container">
        {selectedCharacters.map((id) => {
          const character = predefinedCharacters.find((c) => c.id === id)
          return (
            <div key={id} className="selected-thumbnail">
              <img src={character?.preview || "/placeholder.svg"} alt={character?.name} className="thumbnail-image" />
              <button
                className="remove-thumbnail"
                onClick={() => handleRemoveCharacter(id)}
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )


  return (
    <div className="pixel-container">
      <h1 className="pixel-title">Edit Character</h1>
      <div className="pixel-content character-editor">
        <div className="character-list-container">
          {renderCharacterList()}
          {selectedCharacters.length > 0 && renderSelectedCharactersThumbnails()}
        </div>
        {isCreating ? renderCharacterForm() : renderCharacterDetails()}
      </div>
      <div className="pixel-actions">
        <button className="pixel-btn" onClick={onBack}>
          Back
        </button>
        <button className="pixel-btn" onClick={onNext} disabled={!addedToWorld || selectedCharacters.length === 0}>
          Next
        </button>
      </div>
      {/*******/}
      {showTemplateLoadModal && (
        <AgentTemplateLoadModal
          onClose={() => setShowTemplateLoadModal(false)}
          onLoadTemplate={handleLoadTemplate}
        />
      )}
      {/*******/}
      {showMultiSelectModal && (
        <MultiSelectModal
          characters={predefinedCharacters}
          selectedCharacters={selectedCharacters}
          onSelect={(id) => {
            setSelectedCharacters((prev) =>
              prev.includes(id) ? prev.filter((charId) => charId !== id) : [...prev, id],
            )
          }}
          onClose={() => {
            setShowMultiSelectModal(false)
            setSelectedCharacters([])
            setAddedToWorld(false)
          }}
          onSave={handleMultiSelectSave}//here in "ADD TO WORLD" when you click "save selection", the agents will be added to world
        />
      )}
      {showSpriteModal && (
        <SpriteSelectionModal onSelect={handleSpriteSelect} onClose={() => setShowSpriteModal(false)} />
      )}
      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          characterName={currentCharacter?.name || ""}
          onConfirm={handleDeleteCharacter}
          onCancel={() => setShowDeleteConfirmation(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
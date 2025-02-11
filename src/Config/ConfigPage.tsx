import { useState } from "react"
import { Layout } from "./components/Layout/Layout"
import { SelectMap } from "./features/map-selection/SelectMap"
import { EditCharacter } from "./features/character-editor/EditCharacter"
import { SelectMusic } from "./features/music-selection/SelectMusic"
import { StepProgress } from "./components/StepProgress/StepProgress"
import { useMutation,useQuery } from "convex/react"
import mapConfig from "../../data/maps/mapConfig";
import{ api }from "../../convex/_generated/api"
import { useNavigate } from 'react-router-dom';
import "./styles/global.css"

type Page = "selectMap" | "editCharacter" | "selectMusic"

function ConfigPage() {
  const [currentPage, setCurrentPage] = useState<Page>("selectMap")
  const [selectedMap, setSelectedMap] = useState<string | undefined>(mapConfig.defaultMap)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null)
  const agentDocs = useQuery(api["customizeAgents/queries"].getAgents) ?? []
  const nav = useNavigate();

  const steps = ["Select Map", "Edit Character", "Select Music"]

  // Note: In a real application, you would fetch the initial game setup from the backend
  // useEffect(() => {
  //   const loadGameSetup = async () => {
  //     const setup = await fetchGameSetup()
  //     setSelectedMap(setup.mapId)
  //     setSelectedCharacter(setup.characterId)
  //     setSelectedMusic(setup.musicId)
  //   }
  //   loadGameSetup()
  // }, [])

  const handleNext = () => {
    if (currentPage === "selectMap" && selectedMap) {
      setCurrentPage("editCharacter")
    } else if (currentPage === "editCharacter") {
      setCurrentPage("selectMusic")
    }
  }

  const handleBack = () => {
    if (currentPage === "editCharacter") {
      setCurrentPage("selectMap")
    } else if (currentPage === "selectMusic") {
      setCurrentPage("editCharacter")
    }
  }

  const resetWorld=useMutation(api.testing.resetWorldForNewMap)
  const initWorld=useMutation(api.init.default)
  const resumeWorld = useMutation(api.testing.resume);
 
  const handleSave = async () => {
    try {
      await resetWorld();
      await initWorld({
        // numAgents: undefined,
        numAgents: agentDocs.length, //only initialize the world with the amount of agent ins the doc, a double save 
        mapId: selectedMap
      });
  
      setSelectedMap(selectedMap);
  
      if (selectedMusic !== null) {
        // Store selected music in localStorage
        const storedMusic = {
          id: selectedMusic,
          file: `/assets/music${selectedMusic}.mp3`,
        };
  
        localStorage.setItem("selectedMusic", JSON.stringify(storedMusic));
        alert(`Save successful: Map and Music updated.\nMusic: music${selectedMusic}.mp3`);

        nav('/');
      } else {
        alert("Save successful: Map updated. No music selected.");
      }
    } catch (error) {
      console.error("Failed to save selection", error);
      alert(`Failed to save: ${error}`);
    }
  };
  
  

  const getCurrentStep = () => {
    switch (currentPage) {
      case "selectMap":
        return 0
      case "editCharacter":
        return 1
      case "selectMusic":
        return 2
    }
  }

  return (
    <Layout>
      <StepProgress currentStep={getCurrentStep()} steps={steps} />
      {currentPage === "selectMap" && (
        <SelectMap selectedMap={selectedMap} setSelectedMap={setSelectedMap} onNext={handleNext} />
      )}
      {currentPage === "editCharacter" && (
        <EditCharacter
          selectedCharacter={selectedCharacter}
          setSelectedCharacter={setSelectedCharacter}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}
      {currentPage === "selectMusic" && (
        <SelectMusic
          selectedMusic={selectedMusic}
          setSelectedMusic={setSelectedMusic}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </Layout>
  )
}

export default ConfigPage

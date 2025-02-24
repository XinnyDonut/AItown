import { useRef, useState } from "react";
import PixiGame from "./PixiGame.tsx";
import { Stage } from "@pixi/react";
import { ConvexProvider, useConvex, useQuery } from "convex/react";
import PlayerDetails from "./PlayerDetails.tsx";
import { api } from "../../convex/_generated/api";
import { useWorldHeartbeat } from "../hooks/useWorldHeartbeat.ts";
import { useHistoricalTime } from "../hooks/useHistoricalTime.ts";
import { DebugTimeManager } from "./DebugTimeManager.tsx";
import { GameId } from "../../convex/aiTown/ids.ts";
import { useServerGame } from "../hooks/serverGame.ts";

export const SHOW_DEBUG_UI = !!import.meta.env.VITE_SHOW_DEBUG_UI;

export default function Game() {
  const convex = useConvex();
  const [selectedElement, setSelectedElement] = useState<{
    kind: "player";
    id: GameId<"players">;
  }>();

  const worldStatus = useQuery(api.world.defaultWorldStatus);
  const worldId = worldStatus?.worldId;
  const engineId = worldStatus?.engineId;
  const game = useServerGame(worldId);

  // Send a periodic heartbeat to keep the world alive.
  useWorldHeartbeat();

  const worldState = useQuery(api.world.worldState, worldId ? { worldId } : "skip");
  const { historicalTime, timeManager } = useHistoricalTime(worldState?.engine);

  const scrollViewRef = useRef<HTMLDivElement>(null);

  // 🔹 Resizable Frame State
  const [gameFrameWidth, setGameFrameWidth] = useState(1400);
  const [gameFrameHeight, setGameFrameHeight] = useState(800);
  const isResizing = useRef(false);

  // 🔹 Mouse Down: Start Resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 🔹 Mouse Move: Adjust Size
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    setGameFrameWidth(prev => Math.max(800, prev + e.movementX)); // Min width = 800px
    setGameFrameHeight(prev => Math.max(600, prev + e.movementY)); // Min height = 600px
  };

  // 🔹 Mouse Up: Stop Resizing
  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  if (!worldId || !engineId || !game) {
    return null;
  }

  return (
    <>
      {SHOW_DEBUG_UI && <DebugTimeManager timeManager={timeManager} width={200} height={100} />}
      
      {/* 🔹 Resizable Game Frame */}
      <div
        className="mx-auto w-full min-h-[480px] grid grid-rows-[240px_1fr] lg:grid-rows-[1fr] lg:grid-cols-[1fr_auto] game-frame border-8 border-brown-900 bg-brown-800 relative"
        style={{ width: gameFrameWidth, height: gameFrameHeight }}
      >
        {/* Left: Game Area */}
        <div className="relative overflow-hidden bg-brown-900">
          <div className="absolute inset-0">
            <div className="container">
              <Stage width={gameFrameWidth - 320} height={gameFrameHeight - 100} options={{ backgroundColor: 0x7ab5ff }}>
                <ConvexProvider client={convex}>
                  <PixiGame
                    game={game}
                    worldId={worldId}
                    engineId={engineId}
                    width={gameFrameWidth - 320}
                    height={gameFrameHeight - 100}
                    historicalTime={historicalTime}
                    setSelectedElement={setSelectedElement}
                  />
                </ConvexProvider>
              </Stage>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div
          className="flex flex-col overflow-y-auto shrink-0 px-4 py-6 sm:px-6 lg:w-96 xl:pr-6 border-l-8 border-brown-900 bg-brown-800 text-brown-100"
          ref={scrollViewRef}
        >
          <PlayerDetails
            worldId={worldId}
            engineId={engineId}
            game={game}
            playerId={selectedElement?.id}
            setSelectedElement={setSelectedElement}
            scrollViewRef={scrollViewRef}
          />
        </div>

        {/* 🔹 Resize Handles */}
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "20px",
            height: "20px",
            background: "gray",
            cursor: "nwse-resize",
          }}
        />

      </div>
    </>
  );
}

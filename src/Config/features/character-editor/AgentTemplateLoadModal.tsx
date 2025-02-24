import type React from "react"
import { X } from "lucide-react" 
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import "./AgentTemplateLoadModal.css"
import {useState} from 'react'

type Template = {
  _id: string
  name: string
  agents: Array<{
    name: string
    character: string
    identity: string
    plan: string
  }>
}

type AgentTemplateLoadModalProps = {
  onClose: () => void
  onLoadTemplate: (template: Template) => void
}

export const AgentTemplateLoadModal: React.FC<AgentTemplateLoadModalProps> = ({
  onClose,
  onLoadTemplate
}) => {
  const templates = useQuery(api["customizeAgents/queries"].getRecentTemplates) //useQuery to get all the saved templates
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const TemplatePreview = ({ template }: { template: Template }) => (
    <div className="template-preview">
      <h3 className="pixel-subtitle">Template Preview</h3>
      <div className="preview-details">
        <p className="template-info">Total Agents: {template.agents.length}</p>
        <p className="template-info">Created: {new Date(template.createdAt).toLocaleString()}</p>
      </div>
      <div className="agents-preview">
        {template.agents.map((agent, index) => (
          <div key={index} className="agent-preview-card">
            <img 
              src={`/sprites/${agent.character}.png`} 
              alt={agent.name} 
              className="agent-preview-image"
            />
            <div className="agent-preview-details">
              <h4 className="agent-name">{agent.name}</h4>
              <p className="agent-identity">{agent.identity}</p>
              <details className="agent-goals">
                <summary>Goals</summary>
                <p>{agent.plan}</p>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="pixel-subtitle">Load Template</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="template-grid">
          {templates?.map((template) => (
            <div
              key={template._id}
              className={`template-card ${selectedTemplate?._id === template._id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <h3 className="template-name">{template.name}</h3>
              <p>Agents: {template.agents.length}</p>
            </div>
          ))}
        </div>

        {selectedTemplate && <TemplatePreview template={selectedTemplate} />}

        <div className="modal-actions">
          <button className="pixel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="pixel-btn"
            onClick={() => selectedTemplate && onLoadTemplate(selectedTemplate)}
            disabled={!selectedTemplate}
          >
            Load Template
          </button>
        </div>
      </div>
    </div>
  )
}
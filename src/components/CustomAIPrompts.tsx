
import React, { useState, useEffect } from "react";
import { Plus, Trash, Save, Edit } from "lucide-react";
import { toast } from "sonner";

interface SavedPrompt {
  id: string;
  name: string;
  prompt: string;
  createdAt: Date;
}

interface CustomAIPromptsProps {
  onSelect: (prompt: string) => void;
}

const CustomAIPrompts: React.FC<CustomAIPromptsProps> = ({ onSelect }) => {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [newPromptName, setNewPromptName] = useState("");
  const [newPromptText, setNewPromptText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load saved prompts from localStorage on component mount
  useEffect(() => {
    const savedPromptsData = localStorage.getItem("excelAssistantSavedPrompts");
    if (savedPromptsData) {
      try {
        const parsedData = JSON.parse(savedPromptsData);
        // Convert string dates back to Date objects
        const prompts = parsedData.map((prompt: any) => ({
          ...prompt,
          createdAt: new Date(prompt.createdAt)
        }));
        setSavedPrompts(prompts);
      } catch (error) {
        console.error("Error parsing saved prompts:", error);
      }
    }
  }, []);

  // Save prompts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("excelAssistantSavedPrompts", JSON.stringify(savedPrompts));
  }, [savedPrompts]);

  const handleSavePrompt = () => {
    if (!newPromptName.trim() || !newPromptText.trim()) {
      toast.error("Please provide both a name and prompt text");
      return;
    }

    if (editingId) {
      // Update existing prompt
      setSavedPrompts(savedPrompts.map(prompt => 
        prompt.id === editingId 
          ? { ...prompt, name: newPromptName, prompt: newPromptText } 
          : prompt
      ));
      toast.success("Prompt updated successfully");
    } else {
      // Add new prompt
      const newPrompt: SavedPrompt = {
        id: Date.now().toString(),
        name: newPromptName,
        prompt: newPromptText,
        createdAt: new Date()
      };
      setSavedPrompts([...savedPrompts, newPrompt]);
      toast.success("Prompt saved successfully");
    }

    // Reset form
    setNewPromptName("");
    setNewPromptText("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEditPrompt = (prompt: SavedPrompt) => {
    setNewPromptName(prompt.name);
    setNewPromptText(prompt.prompt);
    setEditingId(prompt.id);
    setIsAdding(true);
  };

  const handleDeletePrompt = (id: string) => {
    setSavedPrompts(savedPrompts.filter(prompt => prompt.id !== id));
    toast.success("Prompt deleted");
  };

  const handleSelectPrompt = (prompt: string) => {
    onSelect(prompt);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Saved AI Prompts
        </h3>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
            setNewPromptName("");
            setNewPromptText("");
          }}
          className="text-xs flex items-center gap-1 text-primary hover:underline"
        >
          {isAdding ? "Cancel" : (
            <>
              <Plus className="w-3 h-3" />
              Add Custom Prompt
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md space-y-3">
          <input
            type="text"
            value={newPromptName}
            onChange={(e) => setNewPromptName(e.target.value)}
            placeholder="Prompt name"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            value={newPromptText}
            onChange={(e) => setNewPromptText(e.target.value)}
            placeholder="Enter your custom AI prompt"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSavePrompt}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-md transition-colors"
          >
            <Save className="w-4 h-4" />
            {editingId ? "Update Prompt" : "Save Prompt"}
          </button>
        </div>
      )}

      {savedPrompts.length === 0 && !isAdding ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
          <p>No saved prompts yet</p>
          <p className="mt-1">Save your frequently used prompts for quick access</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {savedPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {prompt.name}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditPrompt(prompt)}
                    className="p-1 text-gray-500 hover:text-primary"
                    title="Edit prompt"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(prompt.id)}
                    className="p-1 text-gray-500 hover:text-red-500"
                    title="Delete prompt"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {new Date(prompt.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {prompt.prompt}
              </p>
              <button
                onClick={() => handleSelectPrompt(prompt.prompt)}
                className="mt-2 w-full text-center text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-1.5 rounded transition-colors"
              >
                Use This Prompt
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomAIPrompts;

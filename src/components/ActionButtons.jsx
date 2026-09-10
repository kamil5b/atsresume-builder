import React, { useContext } from "react";
import { ResumeContext } from "./builder";
import DefaultResumeData from "./utility/DefaultResumeData";
import { saveToCache, clearCache } from "./utility/cacheUtils";
import { FaTrash, FaUndo, FaSave } from "react-icons/fa";

const ActionButtons = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const handleSaveToCache = () => {
    saveToCache(resumeData);
    alert('Resume saved to browser cache!');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all resume data?')) {
      setResumeData({
        name: "",
        position: "",
        contactInformation: "",
        email: "",
        address: "",
        profilePicture: "",
        socialMedia: [],
        summary: "",
        education: [],
        workExperience: [],
        projects: [],
        skills: [],
        languages: [],
        certifications: [],
      });
      clearCache();
    }
  };

  const handleDefaultTemplate = () => {
    if (window.confirm('Reset to default template? Current data will be lost.')) {
      setResumeData(DefaultResumeData);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4 justify-center">
      <button
        type="button"
        onClick={handleSaveToCache}
        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        <FaSave /> Save
      </button>
      <button
        type="button"
        onClick={handleClearAll}
        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        <FaTrash /> Clear All
      </button>
      <button
        type="button"
        onClick={handleDefaultTemplate}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <FaUndo /> Default Template
      </button>
    </div>
  );
};

export default ActionButtons;

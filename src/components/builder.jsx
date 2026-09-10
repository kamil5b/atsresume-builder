import React, {createContext, useState, useEffect} from "react";
import FormCloseOpenBtn from "../components/FormCloseOpenBtn";
import Preview from "../components/preview/ui/Preview";
import DefaultResumeData from "../components/utility/DefaultResumeData";
import WinPrint from "../components/utility/WinPrint";
import Form from "../components/form/ui/Form";
import { saveToCache, loadFromCache } from "../components/utility/cacheUtils";

const ResumeContext = createContext(DefaultResumeData);

export default function Builder() {
  // resume data - load from cache or use default
  const [resumeData, setResumeData] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadFromCache() || DefaultResumeData;
    }
    return DefaultResumeData;
  });

  // form hide/show
  const [formClose, setFormClose] = useState(false);

  // auto-save to cache when data changes
  useEffect(() => {
    saveToCache(resumeData);
  }, [resumeData]);

  // profile picture
  const handleProfilePicture = (e) => {
    const file = e.target.files[0];

    if (file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeData({...resumeData, profilePicture: event.target.result});
      };
      reader.readAsDataURL(file);
    } else {
      console.error("Invalid file type");
    }
  };

  const handleChange = (e) => {
    setResumeData({...resumeData, [e.target.name]: e.target.value});
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        handleProfilePicture,
        handleChange,
      }}
    >
      <div className="f-col gap-4 md:flex-row justify-evenly max-w-7xl md:mx-auto md:h-screen">
        {!formClose && (
          <Form/>
        )}
        <Preview/>
      </div>
      <FormCloseOpenBtn formClose={formClose} setFormClose={setFormClose}/>
      <WinPrint/>
    </ResumeContext.Provider>
  );
}
export {ResumeContext};

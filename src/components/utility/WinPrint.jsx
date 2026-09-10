import React, {useState, useEffect} from "react";
import { MdPictureAsPdf, MdSettings } from "react-icons/md";

const PADDING_KEY = "atsresume_print_padding";
const COLOR_KEY = "atsresume_print_color";

const WinPrint = () => {
  const [padding, setPadding] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(PADDING_KEY);
      return saved ? JSON.parse(saved) : { top: "10", side: "15" };
    }
    return { top: "10", side: "15" };
  });
  const [color, setColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(COLOR_KEY) || "#c026d3";
    }
    return "#c026d3";
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem(PADDING_KEY, JSON.stringify(padding));
    document.documentElement.style.setProperty("--print-top", `${padding.top}mm`);
    document.documentElement.style.setProperty("--print-side", `${padding.side}mm`);
  }, [padding]);

  useEffect(() => {
    localStorage.setItem(COLOR_KEY, color);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty("--primary-500", `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`);
    document.documentElement.style.setProperty("--primary-600", color);
    document.documentElement.style.setProperty("--primary-700", `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`);
  }, [color]);

  const print = () => {
    window.print();
  };

  return (
    <div className="exclude-print fixed bottom-5 right-10 flex flex-row items-end gap-1">
      {showSettings && (
        <div className="bg-white rounded-lg shadow-lg p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 whitespace-nowrap">Top:</label>
            <input
              type="number"
              min="0"
              max="30"
              value={padding.top}
              onChange={(e) => setPadding({...padding, top: e.target.value})}
              className="w-16 p-1 border rounded text-center text-sm"
            />
            <span className="text-xs text-gray-500">mm</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 whitespace-nowrap">Side:</label>
            <input
              type="number"
              min="0"
              max="30"
              value={padding.side}
              onChange={(e) => setPadding({...padding, side: e.target.value})}
              className="w-16 p-1 border rounded text-center text-sm"
            />
            <span className="text-xs text-gray-500">mm</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 whitespace-nowrap">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
      <button
        aria-label="Print Settings"
        className="font-bold rounded-full bg-white text-primary-600 shadow-lg border-2 border-white p-1"
        onClick={() => setShowSettings(!showSettings)}
      >
        <MdSettings className="w-6 h-6" />
      </button>
      <button
        aria-label="Download Resume"
        className="font-bold rounded-full bg-white text-primary-600 shadow-lg border-2 border-white"
        onClick={print}
      >
        <MdPictureAsPdf className="w-10 h-10" title="Download Resume" />
      </button>
      </div>
    </div>
  );
};

export default WinPrint;

import { MdPictureAsPdf } from "react-icons/md";

const WinPrint = () => {
  const [padding, setPadding] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(PADDING_KEY);
      return saved ? JSON.parse(saved) : { top: "10", side: "15" };
    }
    return { top: "10", side: "15" };
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem(PADDING_KEY, JSON.stringify(padding));
    document.documentElement.style.setProperty("--print-top", `${padding.top}mm`);
    document.documentElement.style.setProperty("--print-side", `${padding.side}mm`);
  }, [padding]);

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
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
        <button
          aria-label="Print Settings"
          className="font-bold rounded-full bg-white text-fuchsia-600 shadow-lg border-2 border-white p-1"
          onClick={() => setShowSettings(!showSettings)}
        >
          <MdSettings className="w-6 h-6" />
        </button>
        <button
          aria-label="Download Resume"
          className="font-bold rounded-full bg-white text-fuchsia-600 shadow-lg border-2 border-white"
          onClick={print}
        >
          <MdPictureAsPdf className="w-10 h-10" title="Download Resume" />
        </button>
      </div>
    </div>
  );
};

export default WinPrint;

import { Github } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import RichTextEditor from "@/components/text-editor";
import { Button } from "@/components/ui/button";
import React from "react";
import { MainNav } from "./components/main-nav";
import { Search } from "./components/search";
import { UserNav } from "./components/user-nav";
import ThemeSwitch from "@/components/custom/theme-switch";

export default function DashboardPage() {
  return (
    <div className="flex-col flex">
      <div className="border-b sticky top-0 w-full z-10 bg-background">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <ThemeSwitch />
            <UserNav />
          </div>
        </div>
      </div>
      <App />
    </div>
  );
}
function App() {
  return (
    <>
      <div className="flex flex-col m-10">
        <main className="mx-4 flex flex-col gap-6 max-w-6xl mx-auto text-center">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Drag and Drop Kanban Board
          </h1>
          <Calculator />
          <AppRichTextEditor />
          <AppCalculator />
          <KanbanBoard />
        </main>
      </div>
    </>
  );
}

function AppRichTextEditor() {
  const [value, setValue] = React.useState("Example tiptap");
  const [quran, setQuran] = React.useState("");
  async function get_data() {
    const res = await fetch("/quran/surah/112.json");
    const data = await res.json();
    setQuran(data.bismillah.arab);
    return data;
  }

  React.useEffect(() => {
    get_data();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/*<img src="https://media.qurankemenag.net/khat2/QK_001.webp" />*/}
      <div className="font-lpmq text-5xl">{quran}</div>
    </div>
  );
}
import { useState } from "react";

function AppCalculator() {
  const [date, setDate] = useState(new Date());
  const [number, setNumber] = useState("45 + (1250 x 100) / 100");
  const [sum, setSum] = useState("12,545");

  return (
    <div className="bg-gray-200 w-screen h-screen flex justify-center items-center">
      <div className="w-64 h-auto bg-white rounded-2xl shadow-xl border-4 border-gray-100">
        <div className="w-auto mx-3 my-2 h-6 flex justify-between">
          <div className="text-sm">
            {date.getHours() + ":" + date.getMinutes()}
          </div>
          <div className="flex items-center text-xs space-x-1">
            <i class="fas fa-signal"></i>
            <i class="fas fa-wifi"></i>
            <i class="fas fa-battery-three-quarters text-sm"></i>
          </div>
        </div>
        <div className="w-auto m-3 h-28 text-right space-y-2 py-2">
          <div className="text-gray-700">{number}</div>
          <div className="text-black font-bold text-3xl">{sum}</div>
        </div>
        <div className="w-auto m-1 h-auto mb-2">
          <div className="m-2 flex justify-between">
            <div className="btn-yellow">C</div>
            <div className="btn-grey">(</div>
            <div className="btn-grey">)</div>
            <div className="btn-orange">/</div>
          </div>
          <div className="m-2 flex justify-between">
            <div className="btn-grey">7</div>
            <div className="btn-grey">8</div>
            <div className="btn-grey">9</div>
            <div className="btn-orange">x</div>
          </div>
          <div className="m-2 flex justify-between">
            <div className="btn-grey">4</div>
            <div className="btn-grey">5</div>
            <div className="btn-grey">6</div>
            <div className="btn-orange">-</div>
          </div>
          <div className="m-2 flex justify-between">
            <div className="btn-grey">1</div>
            <div className="btn-grey">2</div>
            <div className="btn-grey">3</div>
            <div className="btn-orange">+</div>
          </div>
          <div className="m-2 flex justify-between">
            <div className="btn-grey-jumbo">0</div>
            <div className="flex w-full ml-3 justify-between">
              <div className="btn-grey">.</div>
              <div className="btn-green">=</div>
            </div>
          </div>
          <div className="flex justify-center mt-5">
            <div className="w-20 h-1 bg-gray-100 rounded-l-xl rounded-r-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tipe untuk riwayat kalkulator
interface HistoryItem {
  expression: string;
  result: string;
}

const Calculator: React.FC = () => {
  const [currentInput, setCurrentInput] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Fungsi untuk menambahkan input ke kalkulator
  const handleButtonClick = (value: string) => {
    setCurrentInput((prev) => prev + value);
  };

  // Fungsi untuk menghapus input
  const handleClear = () => {
    setCurrentInput("");
  };

  // Fungsi untuk menghapus karakter terakhir
  const handleBackspace = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  // Fungsi untuk mengevaluasi hasil
  const handleEvaluate = () => {
    try {
      // Menghitung ekspresi dan menyimpan hasil
      const result = eval(currentInput); // Gunakan dengan hati-hati, untuk demo saja
      const newHistory: HistoryItem = {
        expression: currentInput,
        result: result.toString(),
      };
      setHistory([newHistory, ...history].slice(0, 5)); // Menampilkan maksimal 5 history
      setCurrentInput(result.toString());
    } catch (error) {
      setCurrentInput("Error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Kalkulator</h1>

        {/* History */}
        <div className="mb-4 text-gray-600 h-32 overflow-y-auto p-4 border-b border-gray-300 text-lg">
          {history.map((item, index) => (
            <div key={index} className="text-sm text-gray-800 my-1">
              {item.expression} = {item.result}
            </div>
          ))}
        </div>

        {/* Display */}
        <div className="text-right mb-4 text-2xl font-semibold">
          {currentInput || "0"}
        </div>

        {/* Calculator Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={handleClear}
          >
            C
          </button>
          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={handleBackspace}
          >
            ←
          </button>
          <button
            className="bg-yellow-500 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("/")}
          >
            /
          </button>
          <button
            className="bg-yellow-500 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("*")}
          >
            x
          </button>

          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("7")}
          >
            7
          </button>
          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("8")}
          >
            8
          </button>
          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("9")}
          >
            9
          </button>
          <button
            className="bg-yellow-500 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("-")}
          >
            -
          </button>

          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("4")}
          >
            4
          </button>
          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("5")}
          >
            5
          </button>
          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("6")}
          >
            6
          </button>
          <button
            className="bg-yellow-500 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("+")}
          >
            +
          </button>

          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("1")}
          >
            1
          </button>
          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("2")}
          >
            2
          </button>
          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick("3")}
          >
            3
          </button>
          <button
            className="bg-yellow-500 p-4 rounded-lg text-xl"
            onClick={handleEvaluate}
          >
            =
          </button>

          <button
            className="bg-gray-200 p-4 rounded-lg text-xl col-span-2"
            onClick={() => handleButtonClick("0")}
          >
            0
          </button>
          <button
            className="bg-gray-200 p-4 rounded-lg text-xl"
            onClick={() => handleButtonClick(".")}
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
};

import { Equal, Plus, Minus, History, Delete, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/custom/theme-provider.tsx";

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  /* Update theme-color meta tag
   * when theme is updated */
  React.useEffect(() => {
    const themeColor = theme === "dark" ? "#020817" : "#fff";
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    metaThemeColor && metaThemeColor.setAttribute("content", themeColor);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="link" size="icon">
          <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          Light{" "}
          <Check
            size={14}
            className={cn("ml-auto", theme !== "light" && "hidden")}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          Dark
          <Check
            size={14}
            className={cn("ml-auto", theme !== "dark" && "hidden")}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="h-4 w-4 mr-2" />
          System
          <Check
            size={14}
            className={cn("ml-auto", theme !== "system" && "hidden")}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function DashboardPage() {
  return (
    <>
      <div class="absolute top-0 z-[-2] h-screen w-screen bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <Calculator />
      {/*<CalculatorSequence />
      <XCalculator />*/}
    </>
  );
}
// Tipe untuk riwayat kalkulator
interface HistoryItem {
  expression: string;
  result: string;
}

const Calculator: React.FC = () => {
  const [currentInput, setCurrentInput] = useState<string>("");
  const [total, setTotal] = useState<number>(0); // Total kumulatif
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    // Ambil history dari localStorage jika ada
    const savedHistory = localStorage.getItem("calcHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Referensi ke elemen container yang berisi daftar ekspresi
  const expressionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Setelah currentInput berubah, gulir ke bawah
    if (expressionRef.current) {
      expressionRef.current.scrollTop = expressionRef.current.scrollHeight;
    }
  }, [currentInput]); //

  const getLastOperator = (input: string): string | null => {
    // Cari operator terakhir di dalam input
    const operators = ["+", "-", "*", "/"];

    // Membalik input dan mencari operator pertama
    for (let i = input.length - 1; i >= 0; i--) {
      if (operators.includes(input[i])) {
        switch (input[i]) {
          case "*":
            return "×"; // Tanda perkalian
          case "/":
            return "÷"; // Tanda pembagian
          default:
            return input[i]; // Operator terakhir yang ditemukan
        }
      } else {
        return "";
      }
    }

    return ""; // Tidak ada operator yang ditemukan
  };

  const lastOperator = getLastOperator(currentInput);
  // Fungsi untuk menambahkan input ke kalkulator
  const handleButtonClick = (value: string) => {
    setCurrentInput((prev) => prev + value);
  };

  // Fungsi untuk menghapus input
  const handleClear = () => {
    setCurrentInput("");
    setTotal(0); // Reset total ketika Clear
  };

  // Fungsi untuk menghapus karakter terakhir
  const handleBackspace = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  // Fungsi untuk mengevaluasi hasil dan update total
  const handleEvaluate = () => {
    try {
      // Menghitung ekspresi dan menyimpan hasil
      const result = evaluateInput(currentInput); // Gunakan dengan hati-hati, untuk demo saja
      const newHistory: HistoryItem = {
        expression: currentInput,
        result: result.toString(),
      };

      // Update history, simpan hingga 5 item terakhir
      const updatedHistory = [newHistory, ...history].slice(0, 5);

      // Simpan ke localStorage
      localStorage.setItem("calcHistory", JSON.stringify(updatedHistory));

      setHistory(updatedHistory);
      toast({
        title: "Sukses",
        description: `Sukses tersimpan dalam riwayat`,
      });
      // setCurrentInput(result.toString());
      // setTotal(result); // Update total dengan hasil terakhir
    } catch (error) {
      setCurrentInput("Error");
    }
  };

  // Menangani klik operator
  const handleOperatorClick = (operator: string) => {
    if (currentInput === "" && operator === "-") {
      // Jika input kosong, anggap ini adalah angka negatif
      setCurrentInput("-");
    } else if (
      currentInput !== "" &&
      !["+", "-", "*", "/"].includes(currentInput.slice(-1))
    ) {
      // Menambahkan operator jika belum ada operator di akhir
      setCurrentInput((prev) => prev + operator);
    }
  };

  function processInput(input) {
    // Menghapus operator yang tidak ada angka sebelumnya di akhir input
    input = input.replace(/[+\-*/]$/, "");

    return input;
  }

  function evaluateInput(input) {
    const processedInput = processInput(input);
    const currentResult = eval(processedInput); // Menilai ekspresi
    return currentResult;
  }
  // Menangani tombol "=" untuk menghitung total secara kumulatif
  const handleEquals = () => {
    try {
      const currentResult = eval(currentInput); // Menilai ekspresi
      setTotal((prev) => prev + currentResult); // Menambahkan ke total sebelumnya
      setCurrentInput(""); // Reset input setelah "="

      // Menyimpan ke history dengan total kumulatif
      const newHistory: HistoryItem = {
        expression: `${currentInput} =`,
        result: total.toString(),
      };
      const updatedHistory = [newHistory, ...history].slice(0, 5);
      localStorage.setItem("calcHistory", JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      setCurrentInput("Error");
    }
  };
  // Fungsi untuk memecah input menjadi bagian-bagian ekspresi

  const splitExpression = (input: string) => {
    // Pecah ekspresi berdasarkan angka dan operator (+, -, *, /)
    const regex = /(\d+|[+\-*/])/g;
    const result = input.match(regex) || [];

    return result.map((operator) => {
      switch (operator) {
        case "*":
          return "×"; // Tanda perkalian
        case "/":
          return "÷"; // Tanda pembagian
        default:
          return operator;
      }
    });
  };

  const findLastEvenIndex = (arr) => {
    // Menentukan indeks terakhir
    let lastIndex = arr.length - 1;

    // Jika indeks terakhir adalah ganjil, cari indeks genap sebelumnya
    if (lastIndex % 2 !== 0) {
      lastIndex -= 1; // Mengurangi 1 agar menjadi genap
    }

    return lastIndex;
  };
  const formatRupiah = (amount: number) => {
    if (!amount) return 0;
    return amount.toLocaleString("id-ID", {
      // style: "currency",
      // currency: "IDR",
      minimumFractionDigits: 0, // Tanpa desimal
      maximumFractionDigits: 0, // Tanpa desimal
    });
  };

  const is_equal_window = window.innerHeight === window.outerHeight;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 justify-between bg-background w-full p-2.5 sm:p-4 shadow-lg sm:h-screen sm:max-w-sm mx-auto",
        "h-screen",
      )}
    >
      <Popover>
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-blue-500 via-green-500 to-orange-500 inline-block text-transparent bg-clip-text uppercase text-xl my-2 font-sans font-bold">
              MHDA
            </h1>
            <ThemeSwitch />
          </div>
          <PopoverTrigger className="flex items-center gap-x-2">
            <History className="w-5 h-5" /> Riwayat
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-full mb-4 overflow-y-auto divide-y divide-gray-300 max-h-[80vh]">
          {history.map((d, index) => (
            <div key={index} className="grid break-words py-2">
              <Collapsible>
                <CollapsibleTrigger className="w-full [&[data-state=open]>div.chev]:hidden">
                  <div className="text-muted-foreground text-pretty font-medium text-start w-[300px]">
                    {splitExpression(processInput(d.expression)).map(
                      (dt, index) => (
                        <React.Fragment key={index}>{dt}</React.Fragment>
                      ),
                    )}
                  </div>
                  <div className="chev text-xl text-right font-semibold">
                    {d.result && `${formatRupiah(parseInt(d.result))}`}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="text-xl font-semibold max-h-[calc(100vh-340px)] overflow-y-auto pr-3 my-3">
                    {splitExpression(processInput(d.expression)).map(
                      (item, index, arr) => {
                        const lastIndex = findLastEvenIndex(arr);
                        // Menampilkan angka
                        if (index % 2 === 0) {
                          return (
                            <div key={index} className="text-right">
                              {index === 0 ? (
                                // Menampilkan angka pertama dengan warna biru
                                <div className="flex items-center justify-between border-b border-dashed border-gray-400">
                                  <div className="gap-x-6 flex items-center text-[16px] w-4 text-start text-muted-foreground">
                                    <span>{index === 0 && "1."}</span>
                                  </div>
                                  <span className="text-xl font-semibold">
                                    {formatRupiah(parseInt(item))}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  {/* Menampilkan operator setelah angka */}
                                  <div
                                    className={`${index === lastIndex ? "" : "bg-red-100 border-b border-dashed border-muted-foreground"} flex items-center justify-between gap-2 items-center justify-end py-0.5`}
                                  >
                                    <div className="gap-x-3 flex items-center">
                                      <span className="text-[16px] w-4 text-start text-muted-foreground">
                                        {index === 0 ? "" : index / 2 + 1}.
                                      </span>
                                      <span className="text-xl px-2">
                                        {
                                          splitExpression(
                                            processInput(d.expression),
                                          )[index - 1]
                                        }
                                      </span>
                                    </div>
                                    <span className="text-xl font-semibold">
                                      {formatRupiah(parseInt(item))}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        } else {
                          return null;
                        }
                      },
                    )}

                    <div className="bg-background text-primary flex items-center justify-between sticky bottom-0 z-10 border-t-2 border-primary">
                      <div className="py-1 text-xl font-semibold text-right">
                        TOTAL{" "}
                      </div>
                      <div className="flex items-center gap-2 py-1">
                        {d.result && (
                          <span className="text-2xl font-semibold text-right">
                            {formatRupiah(parseInt(d.result))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </PopoverContent>
      </Popover>
      <div>
        <div
          ref={expressionRef}
          className={cn(
            "space-y-1 text-2xl font-semibold  overflow-y-auto pr-3 mb-2",
            "max-h-[calc(100vh-350px)]",
          )}
        >
          {splitExpression(currentInput).map((item, index, arr) => {
            const lastIndex = findLastEvenIndex(arr);
            // Menampilkan angka
            if (index % 2 === 0) {
              return (
                <div key={index} className="text-right">
                  {index === 0 ? (
                    // Menampilkan angka pertama dengan warna biru
                    <div className="flex items-center justify-between border-b border-dashed border-gray-400">
                      <div className="gap-x-6 flex items-center text-[16px] w-4 text-start text-muted-foreground">
                        <span>{index === 0 && "1."}</span>
                      </div>
                      <span className="text-2xl font-semibold">
                        {formatRupiah(parseInt(item))}
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Menampilkan operator setelah angka */}
                      <div
                        className={`${index === lastIndex ? "" : " border-b border-dashed border-muted-foreground"} flex items-center justify-between gap-2 items-center justify-end py-0.5`}
                      >
                        <div className="gap-x-3 flex items-center">
                          <span className="text-[16px] w-4 text-start text-muted-foreground">
                            {index === 0 ? "" : index / 2 + 1}.
                          </span>
                          <span className="text-2xl px-2">
                            {splitExpression(currentInput)[index - 1]}
                          </span>
                        </div>
                        <span
                          className={`${index === lastIndex ? "relative" : ""} text-2xl font-semibold `}
                        >
                          {index === lastIndex ? (
                            <span className="relative flex justify-end">
                              <span className="animate-ping absolute inline-flex h-[23px] w-[12px] rounded bg-sky-400 opacity-90"></span>
                              <span className="text-2xl font-semibold">
                                {formatRupiah(parseInt(item))}
                              </span>
                            </span>
                          ) : (
                            formatRupiah(parseInt(item))
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            } else {
              return null;
            }
          })}

          <div className="bg-background text-primary flex items-center justify-between sticky bottom-0 z-10 border-t-2 border-primary">
            <div className="py-2 text-xl font-semibold text-right">TOTAL </div>
            <div className="flex items-center gap-2 py-1">
              {lastOperator !== "" && (
                <Badge className="text-xl p-0 px-2">{lastOperator}</Badge>
              )}
              <span className="text-2xl font-bold text-right">
                {formatRupiah(evaluateInput(currentInput))}
              </span>
            </div>
          </div>
        </div>
        {/*{JSON.stringify(currentInput, null, 2)}*/}

        {/* Calculator Buttons */}
        {/*biome-ignore format: the code should not be formatted*/}
        <div className="grid grid-cols-4 gap-2">
            <Button size="lg" className="font-bold text-xl" onClick={handleClear}>C</Button>
            <Button size="lg" className="[&_svg]:size-6"  onClick={() => handleOperatorClick("*")}><X strokeWidth={3} /></Button>
            <Button size="lg" onClick={() => handleOperatorClick("/")}><div className="text-3xl scale-[110%] pb-1">÷</div></Button>
            <Button size="lg" variant="destructive" className="[&_svg]:size-6"  onClick={handleBackspace}><Delete strokeWidth={2} /></Button>

            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("7")}>7</Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("8")}>8</Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("9")}>9</Button>
            <Button className="[&_svg]:size-6"  size="lg"  onClick={() => handleOperatorClick("-")}><Minus strokeWidth={3} /></Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("4")}>4</Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("5")}>5</Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("6")}>6</Button>
            <Button className="[&_svg]:size-6 duration-300"  size="lg"  onClick={() => handleOperatorClick("+")}><Plus strokeWidth={3} /></Button>

            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("1")}>1</Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("2")}>2</Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("3")}>3</Button>
            <Button className="[&_svg]:size-6"  size="lg"   onClick={handleEvaluate}><Equal strokeWidth={3} /></Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("0")}>0</Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("00")}>00</Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick("000")}>000</Button>
            <Button className="font-bold text-2xl" size="lg" variant="outline" onClick={() => handleButtonClick(".")}>.</Button>
        </div>
        {/*biome-ignore format: the code should not be formatted*/}
      </div>
    </div>
  );
};

// import React, { useState, useEffect } from 'react';

// Tipe untuk riwayat kalkulator
interface HistoryItem {
  expression: string;
  result: string;
}

const XCalculator: React.FC = () => {
  const [currentInput, setCurrentInput] = useState<string>("");
  const [total, setTotal] = useState<number>(0); // Total kumulatif
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    // Ambil history dari localStorage jika ada
    const savedHistory = localStorage.getItem("calcHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Fungsi untuk menambahkan input ke kalkulator
  const handleButtonClick = (value: string) => {
    setCurrentInput((prev) => prev + value);
  };

  // Fungsi untuk menghapus input
  const handleClear = () => {
    setCurrentInput("");
    setTotal(0); // Reset total ketika Clear
  };

  // Fungsi untuk menghapus karakter terakhir
  const handleBackspace = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  // Fungsi untuk mengevaluasi hasil dan update total
  const handleEvaluate = () => {
    try {
      // Menghitung ekspresi dan menyimpan hasil
      const result = eval(currentInput); // Gunakan dengan hati-hati, untuk demo saja
      const newHistory: HistoryItem = {
        expression: currentInput,
        result: result.toString(),
      };

      // Update history, simpan hingga 5 item terakhir
      const updatedHistory = [newHistory, ...history].slice(0, 5);

      // Simpan ke localStorage
      localStorage.setItem("calcHistory", JSON.stringify(updatedHistory));

      setHistory(updatedHistory);
      setCurrentInput(result.toString());
      setTotal(result); // Update total dengan hasil terakhir
    } catch (error) {
      setCurrentInput("Error");
    }
  };

  // Menangani klik operator
  const handleOperatorClick = (operator: string) => {
    if (currentInput === "" && operator === "-") {
      // Jika input kosong, anggap ini adalah angka negatif
      setCurrentInput("-");
    } else if (
      currentInput !== "" &&
      !["+", "-", "*", "/"].includes(currentInput.slice(-1))
    ) {
      // Menambahkan operator jika belum ada operator di akhir
      setCurrentInput((prev) => prev + operator);
    }
  };

  // Menangani tombol "=" untuk menghitung total secara kumulatif

  function processInput(input) {
    // Menghapus operator yang tidak ada angka sebelumnya di akhir input
    input = input.replace(/([+\-*/])\s*([+\-*/])$/, "$1"); // Hapus operator terakhir jika ada operator di belakang

    return input;
  }

  function evaluateInput(input) {
    const processedInput = processInput(input);
    const currentResult = eval(processedInput); // Menilai ekspresi
    return currentResult;
  }
  const handleEquals = () => {
    try {
      const currentResult = evaluateInput(currentInput); // Menilai ekspresi
      setTotal((prev) => prev + currentResult); // Menambahkan ke total sebelumnya
      setCurrentInput(""); // Reset input setelah "="

      // Menyimpan ke history dengan total kumulatif
      const newHistory: HistoryItem = {
        expression: `${currentInput} =`,
        result: total.toString(),
      };
      const updatedHistory = [newHistory, ...history].slice(0, 5);
      localStorage.setItem("calcHistory", JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      setCurrentInput("Error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Kalkulator</h1>

        {/* Live History */}
        <div className="mb-4 h-32 overflow-y-auto p-4 border-b border-gray-300 text-lg">
          {history.map((item, index) => (
            <div key={index} className="  my-1">
              {item.expression} {item.result && `= ${item.result}`}
            </div>
          ))}
        </div>

        {/* Total Kumulatif */}
        <div className="text-right mb-4 text-2xl font-semibold">
          <span>Total: {total}</span>
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
            onClick={() => handleOperatorClick("/")}
          >
            /
          </button>
          <button
            className="bg-yellow-500 p-4 rounded-lg text-xl"
            onClick={() => handleOperatorClick("*")}
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
            onClick={() => handleOperatorClick("-")}
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
            onClick={() => handleOperatorClick("+")}
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
            onClick={handleEquals}
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

const CalculatorSequence = () => {
  const data = [
    "1000", // pertama adalah angka
    "+", // operator pertama
    "200", // angka kedua
    "-", // operator kedua
    "100", // angka ketiga
    "+", // operator ketiga
    "0", // angka keempat
    "+", // operator keempat
    "400", // angka kelima
  ];

  // State untuk menyimpan hasil perhitungan
  const [result, setResult] = useState<number>(parseInt(data[0]));

  // Fungsi untuk menghitung berdasarkan data yang diberikan
  const calculate = () => {
    let currentResult = parseInt(data[0]);

    // Mengiterasi setiap operator dan angka
    for (let i = 1; i < data.length; i += 2) {
      const operator = data[i];
      const number = parseInt(data[i + 1]);

      // Melakukan perhitungan sesuai dengan operator
      if (operator === "+") {
        currentResult += number;
      } else if (operator === "-") {
        currentResult -= number;
      } else if (operator === "x") {
        currentResult *= number;
      } else if (operator === "/") {
        currentResult /= number;
      }
    }

    setResult(currentResult);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-2xl font-bold">Calculator Sequence</div>

      {/* Menampilkan array dengan angka dan operator */}
      <div className="space-y-1">
        {data.map((item, index) => {
          // Menampilkan angka
          if (index % 2 === 0) {
            return (
              <div key={index} className="text-xl">
                {index === 0 ? (
                  // Menampilkan angka pertama dengan warna biru
                  <span className="text-blue-500">{item}</span>
                ) : (
                  <>
                    {/* Menampilkan operator setelah angka */}
                    <div className="flex items-center">
                      <span className="text-lg">{data[index - 1]}</span>
                      <span className="text-blue-500 mx-2">{item}</span>
                    </div>
                  </>
                )}
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>

      {/* Tombol untuk menghitung hasil */}
      <button
        onClick={calculate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Calculate
      </button>

      {/* Menampilkan hasil perhitungan */}
      <div className="mt-4">
        <div className="text-xl">Result: {result}</div>
      </div>
    </div>
  );
};

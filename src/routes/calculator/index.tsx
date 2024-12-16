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
        <Button variant="outline" size="icon">
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
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <Calculator />
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
    setCurrentInput((prev) => {
      // Jika input kosong dan value "0", "00", atau "000", hanya tambahkan satu "0"
      if (prev === "" && /^[0]+$/.test(value)) return "0";
      if (prev === "0" && /^[0]+$/.test(value)) return "0";

      // Jika input hanya "0", ganti dengan nilai baru
      if (prev === "0") return value;

      // Normal concatenation
      return prev + value;
    });
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
      const result = evaluateInputSequential(currentInput); // Gunakan dengan hati-hati, untuk demo saja
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

  function evaluateInputSequential(input) {
    // Langkah 1: Pisahkan angka dan operator
    const processedInput = processInput(input);

    // Perbaiki regex agar dapat menangkap angka desimal
    const tokens = processedInput.match(/(\d*\.?\d+|\+|\-|\*|\/)/g);
    if (!tokens) return 0;

    // Langkah 2: Mulai evaluasi secara berurutan
    let result = parseFloat(tokens[0]); // Ambil angka pertama sebagai nilai awal

    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i]; // Ambil operator
      const nextNumber = parseFloat(tokens[i + 1]); // Ambil angka berikutnya

      // Langkah 3: Lakukan operasi secara berurutan
      switch (operator) {
        case "+":
          result += nextNumber;
          break;
        case "-":
          result -= nextNumber;
          break;
        case "*":
          result *= nextNumber;
          break;
        case "/":
          result /= nextNumber;
          break;
        default:
          throw new Error(`Operator tidak dikenali: ${operator}`);
      }
    }

    return result;
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
    const regex = /(\d*\.?\d+|[+\-*/])/g; // Menggunakan regex untuk angka desimal dan operator
    const result = input.match(regex) || [];

    return result.map((operator) => {
      switch (operator) {
        case "*":
          return "×"; // Tanda perkalian
        case "/":
          return "÷"; // Tanda pembagian
        default:
          return operator; // Menjaga operator lainnya seperti + dan -
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
    if (!amount && amount !== 0) return "0"; // Cek jika amount invalid atau null
    // Gunakan toLocaleString untuk memformat angka
    return amount.toLocaleString("id-ID", {
      style: "decimal", // Menggunakan format desimal
      minimumFractionDigits: 0, // Tidak menampilkan desimal jika 0
      maximumFractionDigits: 2, // Maksimal 2 digit desimal
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
            <h1 className="mr-2 bg-gradient-to-r from-blue-500 via-green-500 to-orange-500 inline-block text-transparent bg-clip-text uppercase text-xl my-2 font-sans font-bold">
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
                  <div className="text-pretty text-xl font-medium text-start w-[300px]">
                    {splitExpression(processInput(d.expression)).map(
                      (dt, index) => (
                        <React.Fragment key={index}>{dt}</React.Fragment>
                      ),
                    )}
                  </div>
                  <div className="chev text-2xl text-right font-semibold">
                    {d.result && `${formatRupiah(parseFloat(d.result))}`}
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
                                <div className="flex items-center justify-between border-b border-dashed border-gray-400 px-2 bg-green-50 dark:bg-green-950">
                                  <div className="gap-x-6 flex items-center text-[16px] w-4 text-start">
                                    <span>{index === 0 && "1."}</span>
                                  </div>
                                  <span className="text-xl font-semibold">
                                    {formatRupiah(parseFloat(item))}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  {/* Menampilkan operator setelah angka */}
                                  <div
                                    className={cn(
                                      "flex items-center justify-between gap-2 items-center justify-between px-2 py-0.5 border-b border-dashed border-muted-foreground",
                                      splitExpression(
                                        processInput(d.expression),
                                      )[index - 1] === "+" &&
                                        "bg-green-50 dark:bg-green-950",
                                      splitExpression(
                                        processInput(d.expression),
                                      )[index - 1] === "-" &&
                                        "bg-red-50 dark:bg-red-950",
                                      splitExpression(
                                        processInput(d.expression),
                                      )[index - 1] === "÷" &&
                                        "bg-orange-50 dark:bg-orange-950",
                                      splitExpression(
                                        processInput(d.expression),
                                      )[index - 1] === "×" &&
                                        "bg-blue-50 dark:bg-blue-950",
                                    )}
                                  >
                                    <div className="gap-x-3 flex items-center">
                                      <span className="text-[16px] w-4 text-start">
                                        {index === 0 ? "" : index / 2 + 1}.
                                      </span>
                                      <span className="text-2xl px-2">
                                        {
                                          splitExpression(
                                            processInput(d.expression),
                                          )[index - 1]
                                        }
                                      </span>
                                    </div>
                                    <span className="text-xl font-semibold">
                                      {formatRupiah(parseFloat(item))}
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

                    <div className="bg-background flex items-center justify-between sticky bottom-0 z-10 border-t-2 border-primary px-2">
                      <div className="py-1 text-xl font-semibold text-right">
                        TOTAL{" "}
                      </div>
                      <div className="flex items-center gap-2 py-1">
                        {d.result && (
                          <span className="text-2xl font-semibold text-right">
                            {formatRupiah(parseFloat(d.result))}
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
                    <div className="flex items-center justify-between border-b border-dashed border-gray-400 px-1">
                      <div className="gap-x-4 flex items-center text-[16px] w-3 text-start text-muted-foreground">
                        <span>{index === 0 && "1."}</span>
                      </div>
                      <span className="text-2xl font-semibold">
                        {formatRupiah(parseFloat(item))}
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Menampilkan operator setelah angka */}
                      <div
                        className={`${index === lastIndex ? "" : " border-b border-dashed border-muted-foreground"} flex items-center justify-between gap-2 items-center justify-end py-0.5 px-1`}
                      >
                        <div className="gap-x-3 flex items-center">
                          <span className="text-[16px] w-3 text-start text-muted-foreground">
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
                                {formatRupiah(parseFloat(item))}
                              </span>
                            </span>
                          ) : (
                            formatRupiah(parseFloat(item))
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

          <div className="bg-background sticky bottom-0 z-10 border-t-2 border-primary">
            <div className="bg-background flex items-center justify-between border-t-2 border-primary">
              <div className="py-2 text-xl font-bold text-right">TOTAL </div>
              <div className="flex items-center gap-3 py-1">
                {lastOperator !== "" && (
                  <span className="relative flex justify-end">
                    <span className="text-2xl font-semibold pb-1">
                      {lastOperator}
                    </span>
                  </span>
                )}
                <span className="text-2xl font-bold text-right">
                  {/*{formatRupiah(evaluateInput(currentInput))}*/}
                  {formatRupiah(evaluateInputSequential(currentInput))}
                </span>
              </div>
            </div>
            <div className="bg-background flex items-center justify-between bg-muted px-2">
              <span className="text-xl font-bold text-right text-foreground/80">
                {currentInput?.slice(-29)}
              </span>
            </div>
          </div>
        </div>
        {/*{JSON.stringify(currentInput, null, 2)}*/}
        {/* Calculator Buttons */}
        {/*biome-ignore format: the code should not be formatted*/}
        <div className="grid grid-cols-4 gap-2">
            <Button size="lg" className="font-normal text-3xl" onClick={handleClear}>C</Button>
            <Button size="lg" className="[&_svg]:size-7"  onClick={() => handleOperatorClick("*")}><X strokeWidth={2} /></Button>
            <Button size="lg" onClick={() => handleOperatorClick("/")}><div className="text-3xl font-medium pb-1">÷</div></Button>
            <Button size="lg" variant="destructive" className="[&_svg]:size-6"  onClick={handleBackspace}><Delete strokeWidth={2} /></Button>

            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("7")}>7</Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("8")}>8</Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("9")}>9</Button>
            <Button className="[&_svg]:size-7"  size="lg"  onClick={() => handleOperatorClick("-")}><Minus strokeWidth={2} /></Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("4")}>4</Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("5")}>5</Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("6")}>6</Button>
            <Button className="[&_svg]:size-7 duration-300"  size="lg"  onClick={() => handleOperatorClick("+")}><Plus strokeWidth={2} /></Button>

            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("1")}>1</Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("2")}>2</Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("3")}>3</Button>
            <Button className="[&_svg]:size-7"  size="lg"   onClick={handleEvaluate}><Equal strokeWidth={2} /></Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("0")}>0</Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("00")}>00</Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick("000")}>000</Button>
            <Button className="font-medium text-3xl" size="lg" variant="outline" onClick={() => handleButtonClick(".")}>.</Button>
        </div>
        {/*biome-ignore format: the code should not be formatted*/}
      </div>
    </div>
  );
};

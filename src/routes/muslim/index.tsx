import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Debug } from "@/components/debug";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { DialogClose } from "@/components/ui/dialog";
import {
  useLoaderData,
  useParams,
  useNavigate,
  useNavigation,
  useLocation,
  Outlet,
  NavLink,
  json,
} from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import ThemeSwitch from "@/components/custom/theme-switch";
import DAFTARSURATJSON from "@/constants/data/daftar-surat.json";
import SHOLAWAT from "@/constants/data/sholawat.json";
import TAHLIL from "@/constants/data/tahlil.json";
import DOAHARIAN from "@/constants/data/doaharian.json";
import { data as DZIKR } from "@/constants/data/dzikr.ts";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  Search,
  Github,
  Star,
  BookOpen,
  BookOpenText,
  Feather,
  Scroll,
  Bookmark,
  Heart,
  Ellipsis,
  Check,
  CircleCheckBig,
  X,
  Dot,
  Sun,
  Moon,
  Monitor,
  Settings2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fontOptions = [
  { value: "100", label: "Thin" },
  { value: "200", label: "Extralight" },
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extrabold" },
];
const fontSizeOpt = [
  {
    label: "text-xl",
    fontSize: "1.25rem",
    lineHeight: "2.75rem",
  },
  {
    label: "text-2xl",
    fontSize: "1.5rem",
    lineHeight: "3.5rem",
  },
  {
    label: "text-3xl",
    fontSize: "1.875rem",
    lineHeight: "4rem",
  },
  {
    label: "text-4xl",
    fontSize: "2.25rem",
    lineHeight: "5rem",
  },
  {
    label: "text-5xl",
    fontSize: "3rem",
    lineHeight: "6.5rem",
  },
  {
    label: "text-6xl",
    fontSize: "3.75rem",
    lineHeight: "7.5rem",
  },
];

export const loaderSuratId = async ({ params }) => {
  const res = await fetch(`/quran/surat/${params.id}.json`);
  const result = await res.json();
  const initialPage = Array.from(
    new Set(result.data.map((ayat) => ayat.page_number)),
  );
  return json({ data: result.data, initialPage: initialPage[0] });
};

export const SuratView = () => {
  const { data, initialPage } = useLoaderData();
  return (
    <div className="flex flex-1 flex-col">
      <SuratInfo />
      <Tabs defaultValue="baca">
        <TabsList className="flex items-center justify-center w-fit mx-auto">
          <TabsTrigger value="baca">Baca</TabsTrigger>
          <TabsTrigger value="hafalan">Hafalan</TabsTrigger>
          <TabsTrigger value="puzzle">Puzzle</TabsTrigger>
        </TabsList>
        <TabsContent value="baca">
          <AyatListWithFavorites data={data} initialPage={initialPage} />
        </TabsContent>
        <TabsContent value="hafalan">
          <AyatListHafalan
            value="hafalan"
            data={data}
            initialPage={initialPage}
          />
        </TabsContent>
        <TabsContent value="puzzle">
          <AyatListPuzzle data={data} initialPage={initialPage} />
        </TabsContent>
      </Tabs>
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
    </div>
  );
};

// Fungsi untuk memecah teks menjadi bagian-bagian
const sliceText = (text: string, sliceLength: number) => {
  const slices: string[] = [];
  for (let i = 0; i < text.length; i += sliceLength) {
    slices.push(text.slice(i, i + sliceLength));
  }
  return slices;
};

// Fungsi untuk mengacak array
const shuffleArray = (array: string[]) => {
  const shuffled = [...array]; // Membuat salinan array agar tidak memodifikasi yang asli
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Tukar elemen
  }
  return shuffled;
};
interface PuzzleProps {
  ayat_text: string;
}

const PuzzleGame: React.FC<PuzzleProps> = ({
  ayat_text,
  ayat_number,
  index,
}) => {
  const [slices, setSlices] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean>(null);

  useEffect(() => {
    // Membagi teks menjadi bagian dan mengacak urutannya
    const parts = sliceText(ayat_text, 15); // Potong setiap 15 karakter
    const shuffledParts = shuffleArray(parts); // Acak urutan potongan
    setSlices(shuffledParts); // Set bagian yang sudah diacak
  }, [ayat_text]);

  const handleClickSlice = (slice: string) => {
    // Jika bagian sudah ada di userAnswer, hapus dari urutan
    if (userAnswer.includes(slice)) {
      setUserAnswer(userAnswer.filter((item) => item !== slice));
      setSlices([slice, ...slices]); // Kembalikan slice ke dalam slices
    } else {
      // Pindahkan slice ke urutan yang sudah disusun
      setUserAnswer([slice, ...userAnswer]);
      setSlices(slices.filter((item) => item !== slice)); // Hapus slice dari slices
    }
  };

  const checkAnswer = () => {
    const correctAnswer = sliceText(ayat_text, 15).reverse();
    setIsCorrect(JSON.stringify(userAnswer) === JSON.stringify(correctAnswer));
  };

  return (
    <div
      style={{ animationDelay: `${index * 0.1}s` }}
      className={cn(
        "transition-all duration-300 relative flex flex-col items-end justify-end gap-2 animate-slide-top [animation-fill-mode:backwards] group relative py-5 pr-4 pl-2 sm:px-5 rounded-md mb-2",
        isCorrect &&
          "bg-green-100 dark:bg-green-900 bg-gradient-to-l via-white dark:via-black from-green-100 dark:from-green-950",
        isCorrect === false &&
          "bg-red-100 dark:bg-red-900 bg-gradient-to-l via-white dark:via-black from-red-100 dark:from-red-950",
      )}
    >
      {isCorrect && (
        <CircleCheckBig className="absolute top-3 inset-0 left-3 w-28 h-28 text-green-500 dark:text-green-400 opacity-20 dark:opacity-30" />
      )}
      {isCorrect === false && (
        <X className="absolute top-3 inset-0 left-3 w-28 h-28 text-red-500 dark:text-red-400 opacity-20 dark:opacity-30" />
      )}
      <div className="space-y-2 text-right">
        <Label>Soal ayat {ayat_number}</Label>
        <div className="flex flex-wrap gap-2 justify-end">
          {/* Menampilkan potongan teks */}
          {slices.length === 0 ? (
            // Menampilkan pesan jika slices kosong
            <div className="text-center text-sm text-muted-foreground w-full">
              Cek Jawaban
            </div>
          ) : (
            slices.map((slice, index) => (
              <Button
                variant="outline"
                size="lg"
                style={{ animationDelay: `${index * 0.1}s` }}
                className="font-lpmq text-2xl animate-roll-reveal [animation-fill-mode:backwards]"
                key={index}
                onClick={() => handleClickSlice(slice)}
              >
                {slice}
              </Button>
            ))
          )}
        </div>

        <Collapsible>
          <CollapsibleTrigger className="text-sm">
            Ayat lengkap
          </CollapsibleTrigger>
          <CollapsibleContent className="transition-all duration-300 space-y-2 text-text font-base mt-1 bg-background">
            <span className="font-lpmq text-right">{ayat_text}</span>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="space-y-2 text-right">
        <Label>Jawaban</Label>
        <div className="flex flex-wrap gap-2 justify-end">
          {userAnswer.length === 0 ? (
            // Menampilkan pesan jika userAnswer kosong
            <div className="text-center text-sm text-muted-foreground w-full">
              Belum ada Jawaban
            </div>
          ) : (
            userAnswer.map((slice, index) => (
              <Button
                variant="outline"
                size="lg"
                style={{ animationDelay: `${index * 0.1}s` }}
                className="font-lpmq text-2xl animate-roll-reveal [animation-fill-mode:backwards]"
                key={index}
                onClick={() => handleClickSlice(slice)}
              >
                {slice}
              </Button>
            ))
          )}
        </div>
      </div>

      <Button
        variant={
          isCorrect === true
            ? "default"
            : isCorrect === false
              ? "destructive"
              : "secondary"
        }
        className="mt-3 transition-all duration-300"
        onClick={checkAnswer}
      >
        {isCorrect === null ? (
          "Cek Jawaban"
        ) : isCorrect ? (
          <>
            <Check /> Correct
          </>
        ) : (
          <>
            <X /> Wrong
          </>
        )}
      </Button>
    </div>
  );
};

interface Ayat {
  aya_id: number;
  aya_number: number;
  aya_text: string;
  sura_id: number;
  juz_id: number;
  page_number: number;
  translation_aya_text: string;
}

interface AyatListProps {
  ayatData: Ayat[];
}

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
function SuratInfo() {
  const { data } = DAFTARSURATJSON;
  const params = useParams();
  const surat_name = params?.id
    ? data.find((d) => d.id === parseInt(params.id))
    : null;

  return (
    <div className=" text-center flex items-center justify-center bg-background mb-3">
      <Collapsible>
        <CollapsibleTrigger className="font-extrabold pt-1 text-2xl">
          Surat {surat_name.surat_name}
        </CollapsibleTrigger>
        <CollapsibleContent className="transition-all duration-300 space-y-2 text-text font-base mt-1 bg-background">
          <div className="font-lpmq text-md"> ( {surat_name.surat_text} )</div>
          <h2 className="text-base font-semibold tracking-wide uppercase">
            {surat_name.surat_terjemahan}{" "}
          </h2>

          <p className="text-sm text-muted-foreground">
            ( {surat_name.count_ayat} Ayat )
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

import localforage from "localforage";

interface Ayat {
  aya_id: number;
  aya_number: number;
  aya_text: string;
  sura_id: number;
  juz_id: number;
  page_number: number;
  translation_aya_text: string;
}

interface AyatListProps {
  data: Ayat[];
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AyatListHafalan: React.FC<AyatListProps> = ({
  value,
  data,
  initialPage,
}) => {
  const [favorites, setFavorites] = useState<Array>([]);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const navigate = useNavigate();

  // Ambil semua nomor halaman unik dari data ayat
  const allPageNumbers = Array.from(
    new Set(data.map((ayat) => ayat.page_number)),
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  // allPageNumbers?.length > 0 ? allPageNumbers[0] : 1,
  const totalPagesSurat = allPageNumbers.length;
  const totalPages = 604;

  // Filter ayat berdasarkan halaman yang dipilih
  const filteredData = data.filter((ayat) => ayat.page_number === currentPage);
  useEffect(() => {
    const loadFavorites = async () => {
      const storedFavorites = await localforage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(storedFavorites);
      }
    };

    const loadLastRead = async () => {
      const storedLastRead = await localforage.getItem("lastRead");
      if (storedLastRead !== null) {
        setLastRead(storedLastRead);
      }
    };

    loadFavorites();
    loadLastRead();
  }, []);

  // Simpan data favorit ke localForage
  useEffect(() => {
    const persistedValue = window.localStorage.getItem("page_number");
    setCurrentPage(
      persistedValue !== null ? JSON.parse(persistedValue) : initialPage,
    );
    if (persistedValue) {
      window.localStorage.removeItem("page_number");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [initialPage]);
  // Simpan data favorit ke localForage
  useEffect(() => {
    const saveFavorites = async (favorites) => {
      await localforage.setItem<Set<number>>("favorites", favorites);
    };
    saveFavorites(favorites);
  }, [favorites]);

  // Simpan ayat terakhir dibaca ke localForage

  useEffect(() => {
    if (lastRead !== null) {
      const saveLastRead = async (lastRead) => {
        await localforage.setItem<Set<number>>("lastRead", lastRead);
      };
      saveLastRead(lastRead);
    }
  }, [lastRead]);

  // Fungsi untuk toggle favorit
  const toggleFavorite = (ayat: Ayat) => {
    const isFavorite = favorites.some((fav) => fav.aya_id === ayat.aya_id);

    if (isFavorite) {
      // Hapus ayat dari favorites
      setFavorites(favorites.filter((fav) => fav.aya_id !== ayat.aya_id));
    } else {
      // Tambahkan ayat ke favorites
      setFavorites([...favorites, ayat]);
    }
  };

  // Tandai ayat sebagai terakhir dibaca
  const handleRead = (ayat) => {
    setLastRead(ayat); // Set ayat yang terakhir dibaca
  };

  // Fungsi untuk pindah ke halaman berikutnya
  const nextPage = () => {
    if (totalPagesSurat === currentPage) {
      navigate(`/muslim/quran-surat/${currentPage + 1}`, {
        preventScrollReset: false,
      });
    }
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fungsi untuk pindah ke halaman sebelumnya
  const prevPage = () => {
    if (initialPage === currentPage) {
      navigate(`/muslim/quran-surat/${currentPage - 1}`, {
        preventScrollReset: false,
      });
    }
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  return (
    <ul role="list" className="">
      {filteredData.map((ayat, index) => {
        const isFavorite = favorites.some((fav) => fav.aya_id === ayat.aya_id);
        const isLastRead = lastRead?.aya_id === ayat.aya_id;

        return (
          <li
            key={ayat.aya_id}
            style={{ animationDelay: `${index * 0.1}s` }}
            className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 pr-4 pl-2 sm:px-5 hover:bg-accent rounded-md ${
              isLastRead ? "bg-muted" : ""
            }`}
          >
            <div className=" w-full text-right flex gap-x-2.5 items-center justify-end">
              <div className="flex items-center relative mt-2 ">
                {ayat.aya_text && ayat.aya_text.length > 15 ? (
                  <>
                    <p className="text-2xl font-lpmq text-right">
                      {ayat.aya_text.slice(-15)}
                    </p>
                    <div className="mx-4 flex text-muted-foreground">
                      {new Array(4).fill(null).map((_, index) => (
                        <Dot key={index} className="h-5" />
                      ))}
                    </div>
                    <p className="text-2xl font-lpmq text-right">
                      {ayat.aya_text.slice(0, 15)}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-lpmq text-right">
                    {ayat.aya_text}
                  </p>
                )}
              </div>
              <Badge className="px-2 font-lpmq">{ayat.aya_number}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger className="group-hover:visible invisible h-auto absolute bottom-3">
                  <Ellipsis className="fill-primary w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Action</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleFavorite(ayat)}>
                    <Heart className="w-4 h-4" /> Favorite
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRead(ayat)}>
                    <Bookmark className="w-4 h-4" /> Last read
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>
        );
      })}
      {/* Pagination Controls */}
      <div className="ml-auto flex items-center justify-center gap-3 my-3">
        <Button
          onClick={prevPage}
          disabled={currentPage === 1}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </ul>
  );
};

const AyatListPuzzle: React.FC<AyatListProps> = ({ data, initialPage }) => {
  const navigate = useNavigate();

  // Ambil semua nomor halaman unik dari data ayat
  const allPageNumbers = Array.from(
    new Set(data.map((ayat) => ayat.page_number)),
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  // allPageNumbers?.length > 0 ? allPageNumbers[0] : 1,
  const totalPagesSurat = allPageNumbers.length;
  const totalPages = 604;

  // Filter ayat berdasarkan halaman yang dipilih
  const filteredData = data.filter((ayat) => ayat.page_number === currentPage);

  // Fungsi untuk pindah ke halaman berikutnya
  const nextPage = () => {
    if (totalPagesSurat === currentPage) {
      navigate(`/muslim/quran-surat/${currentPage + 1}`, {
        preventScrollReset: false,
      });
    }
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fungsi untuk pindah ke halaman sebelumnya
  const prevPage = () => {
    if (initialPage === currentPage) {
      navigate(`/muslim/quran-surat/${currentPage - 1}`, {
        preventScrollReset: false,
      });
    }
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  return (
    <ul role="list" className="">
      {filteredData.map((ayat, index) => {
        return (
          <li key={ayat.aya_id}>
            <PuzzleGame
              ayat_text={ayat.aya_text}
              ayat_number={ayat.aya_number}
              index={index}
            />
          </li>
        );
      })}
      {/* Pagination Controls */}
      <div className="ml-auto flex items-center justify-center gap-3 my-3">
        <Button
          onClick={prevPage}
          disabled={currentPage === 1}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </ul>
  );
};

const AyatListWithFavorites: React.FC<AyatListProps> = ({
  data,
  initialPage,
}) => {
  const [favorites, setFavorites] = useState<Array>([]);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const navigate = useNavigate();

  // Ambil semua nomor halaman unik dari data ayat
  const allPageNumbers = Array.from(
    new Set(data.map((ayat) => ayat.page_number)),
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  // allPageNumbers?.length > 0 ? allPageNumbers[0] : 1,
  const totalPagesSurat = allPageNumbers.length;
  const totalPages = 604;

  // Filter ayat berdasarkan halaman yang dipilih
  const filteredData = data.filter((ayat) => ayat.page_number === currentPage);
  useEffect(() => {
    const loadFavorites = async () => {
      const storedFavorites = await localforage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(storedFavorites);
      }
    };

    const loadLastRead = async () => {
      const storedLastRead = await localforage.getItem("lastRead");
      if (storedLastRead !== null) {
        setLastRead(storedLastRead);
      }
    };

    loadFavorites();
    loadLastRead();
  }, []);

  // Simpan data favorit ke localForage
  useEffect(() => {
    const persistedValue = window.localStorage.getItem("page_number");
    setCurrentPage(
      persistedValue !== null ? JSON.parse(persistedValue) : initialPage,
    );
    if (persistedValue) {
      window.localStorage.removeItem("page_number");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [initialPage]);
  // Simpan data favorit ke localForage
  useEffect(() => {
    const saveFavorites = async (favorites) => {
      await localforage.setItem<Set<number>>("favorites", favorites);
    };
    saveFavorites(favorites);
  }, [favorites]);

  // Simpan ayat terakhir dibaca ke localForage

  useEffect(() => {
    if (lastRead !== null) {
      const saveLastRead = async (lastRead) => {
        await localforage.setItem<Set<number>>("lastRead", lastRead);
      };
      saveLastRead(lastRead);
    }
  }, [lastRead]);

  // Fungsi untuk toggle favorit
  const toggleFavorite = (ayat: Ayat) => {
    const isFavorite = favorites.some((fav) => fav.aya_id === ayat.aya_id);

    if (isFavorite) {
      // Hapus ayat dari favorites
      setFavorites(favorites.filter((fav) => fav.aya_id !== ayat.aya_id));
    } else {
      // Tambahkan ayat ke favorites
      setFavorites([...favorites, ayat]);
    }
  };

  // Tandai ayat sebagai terakhir dibaca
  const handleRead = (ayat) => {
    setLastRead(ayat); // Set ayat yang terakhir dibaca
  };

  // Fungsi untuk pindah ke halaman berikutnya
  const nextPage = () => {
    if (totalPagesSurat === currentPage) {
      navigate(`/muslim/quran-surat/${currentPage + 1}`, {
        preventScrollReset: false,
      });
    }
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fungsi untuk pindah ke halaman sebelumnya
  const prevPage = () => {
    if (initialPage === currentPage) {
      navigate(`/muslim/quran-surat/${currentPage - 1}`, {
        preventScrollReset: false,
      });
    }
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  return (
    <ul role="list" className="">
      <DisplayTrigger key={currentPage} />
      {filteredData.map((ayat, index) => {
        const isFavorite = favorites.some((fav) => fav.aya_id === ayat.aya_id);
        const isLastRead = lastRead?.aya_id === ayat.aya_id;

        return (
          <li
            key={ayat.aya_id}
            style={{ animationDelay: `${index * 0.1}s` }}
            className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 pr-4 pl-2 sm:px-5 hover:bg-accent rounded-md ${
              isLastRead ? "bg-muted" : ""
            }`}
          >
            <div className=" w-full text-right flex gap-x-2.5 items-start justify-end">
              <div className="grid gap-1">
                <Badge className="rounded px-2">{ayat.aya_number}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger className="group-hover:visible invisible h-auto">
                    <Ellipsis className="fill-primary w-5 h-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Action</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toggleFavorite(ayat)}>
                      <Heart className="w-4 h-4" /> Favorite
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRead(ayat)}>
                      <Bookmark className="w-4 h-4" /> Last read
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="relative mt-2 font-lpmq text-right">
                {ayat.aya_text}
              </p>
            </div>
            <div className="translation-text mt-3 flex items-end justify-end">
              <div
                className="text-sm text-muted-foreground text-right sm:max-w-[80%] "
                dangerouslySetInnerHTML={{
                  __html: ayat.translation_aya_text,
                }}
              />
            </div>

            {(isLastRead || isFavorite) && (
              <div className="w-full text-right flex gap-x-2.5 items-center justify-end mt-2">
                {isLastRead && <Bookmark className="fill-primary w-5 h-5" />}
                {isFavorite && (
                  <Heart className="fill-destructive text-destructive w-5 h-5" />
                )}
              </div>
            )}
          </li>
        );
      })}
      {/* Pagination Controls */}
      <div className="ml-auto flex items-center justify-center gap-3 my-3">
        <Button
          onClick={prevPage}
          disabled={currentPage === 1}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </ul>
  );
};

import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/muslim/sholawat", label: "Sholawat" },
  { to: "/muslim/doaharian", label: "Do'a Harian" },
  { to: "/muslim/dzikr", label: "Dzikr" },
  { to: "/muslim/tahlil", label: "Tahlil" },
  { to: "/muslim/quran-surat", label: "Qur'an" },
];

export default function Layout() {
  return (
    <React.Fragment>
      <div className="flex h-14 items-center px-4 border-b sticky top-0 bg-transparent backdrop-blur-md z-10">
        <div className="mr-4 hidden md:flex">
          <a className="mr-4 flex items-center gap-2 lg:mr-6" href="/">
            <BookOpenText className="w-5 h-5" />
            <span className="hidden font-bold lg:inline-block">Muslim</span>
          </a>
          <nav className="flex items-center gap-4 text-sm xl:gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    isActive ? "text-primary" : "text-muted-foreground/80",
                    "text-sm font-medium transition-colors hover:text-primary",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <NavbarMobile />
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
          <CommandMenu />
          <nav className="flex items-center gap-0.5">
            {/*<Button size="icon" variant="ghost">
              <Github />
            </Button>*/}
            <ThemeSwitch />
            <DisplaySetting />
          </nav>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 sm:p-4">
        <Outlet />
      </div>
    </React.Fragment>
  );
}
function NavbarMobile() {
  const [open, setOpen] = React.useState(false);
  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground py-2 -ml-2 mr-2 h-8 w-8 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="!size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9h16.5m-16.5 6.75h16.5"
          />
        </svg>
      </DrawerTrigger>
      <DrawerContent>
        <nav className="flex flex-col items-center gap-4 text-sm xl:gap-6 py-2">
          {navItems.map((item) => (
            <NavLink
              onClick={() => setOpen(false)}
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  isActive ? "text-primary" : "text-muted-foreground/80",
                  "text-sm font-medium transition-colors hover:text-primary",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {/*<DrawerHeader>
              <DrawerTitle>Muslim App</DrawerTitle>
              <DrawerDescription>
                This action cannot be undone.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>*/}
      </DrawerContent>
    </Drawer>
  );
}

function getWaktuSekarang(): string {
  const currentHour = new Date().getHours(); // Mendapatkan jam saat ini (0-23)

  if (currentHour >= 3 && currentHour < 15) {
    return "pagi"; // Jam 3 pagi hingga jam 3 sore
  } else {
    return "petang"; // Jam 3 sore hingga jam 3 pagi
  }
}

const selectedIds = [67, 36, 75, 18, 48, 55, 78]; // Daftar ID yang ingin ditampilkan
export const IndexQuranId: React.FC<AyatListProps> = () => {
  const [favorites, setFavorites] = useState<Array>([]);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const { data } = DAFTARSURATJSON;
  // Filter ayat berdasarkan halaman yang dipilih
  useEffect(() => {
    const loadFavorites = async () => {
      const storedFavorites = await localforage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(storedFavorites);
      }
    };

    const loadLastRead = async () => {
      const storedLastRead = await localforage.getItem("lastRead");
      if (storedLastRead !== null) {
        setLastRead(storedLastRead);
      }
    };

    loadFavorites();
    loadLastRead();
  }, []);

  // Simpan data favorit ke localForage
  useEffect(() => {
    const saveFavorites = async (favorites) => {
      await localforage.setItem<Set<number>>("favorites", favorites);
    };
    saveFavorites(favorites);
  }, [favorites]);

  // Simpan ayat terakhir dibaca ke localForage

  useEffect(() => {
    if (lastRead !== null) {
      const saveLastRead = async (lastRead) => {
        await localforage.setItem<Set<number>>("lastRead", lastRead);
      };
      saveLastRead(lastRead);
    }
  }, [lastRead]);

  // Fungsi untuk toggle favorit
  const toggleFavorite = (ayat: Ayat) => {
    const isFavorite = favorites.some((fav) => fav.aya_id === ayat.aya_id);

    if (isFavorite) {
      // Hapus ayat dari favorites
      setFavorites(favorites.filter((fav) => fav.aya_id !== ayat.aya_id));
    } else {
      // Tambahkan ayat ke favorites
      setFavorites([...favorites, ayat]);
    }
  };

  // Tandai ayat sebagai terakhir dibaca
  const handleRead = (ayat) => {
    setLastRead(ayat); // Set ayat yang terakhir dibaca
  };

  // Fungsi untuk pindah ke halaman berikutnya
  const arrayLastRead = lastRead ? [lastRead] : [];
  const navigate = useNavigate();

  return (
    <div className="relative h-full">
      <Tabs defaultValue="listsurat">
        <TabsList className="flex gap-1.5 items-center justify-center w-fit mx-auto">
          <TabsTrigger value="favorite">Favorite</TabsTrigger>
          <TabsTrigger value="lastread">Terakhir Baca</TabsTrigger>
          <TabsTrigger value="listsurat">Surat</TabsTrigger>
        </TabsList>
        <TabsContent value="lastread">
          <div className="md:flex md:items-center md:justify-between text-center">
            <div className="flex-1 min-w-0 mb-2">
              <h2 className="font-bold leading-7 sm:text-3xl sm:truncate">
                Terakhir dibaca
              </h2>
            </div>
          </div>
          <ul role="list" className="">
            {arrayLastRead.length === 0 ? (
              <li className="text-center text-sm text-muted-foreground">
                Belum pernah baca quran
              </li>
            ) : (
              arrayLastRead.map((ayat, index) => {
                const isFavorite = favorites.some(
                  (fav) => fav.aya_id === ayat.aya_id,
                );
                const isLastRead = lastRead?.aya_id === ayat.aya_id;

                return (
                  <li
                    onClick={() => {
                      navigate(`/muslim/quran-surat/${ayat.sura_id}`, {
                        preventScrollReset: false,
                      });

                      window.localStorage.setItem(
                        "page_number",
                        JSON.stringify(ayat.page_number),
                      );
                    }}
                    key={ayat.aya_id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent rounded-md ${
                      isLastRead ? "" : ""
                    }`}
                  >
                    <div className=" w-full text-right flex gap-x-2.5 items-start justify-end">
                      <div className="flex items-center gap-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="group-hover:visible invisible">
                            <Ellipsis className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Action</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => toggleFavorite(ayat)}
                            >
                              <Heart className="w-4 h-4" /> Favorite
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRead(ayat)}>
                              <Bookmark className="w-4 h-4" /> Last read
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Badge className="rounded px-2">
                          {ayat.aya_number}
                        </Badge>
                      </div>
                      <p className="relative mt-2 font-lpmq text-right">
                        {ayat.aya_text}
                      </p>
                    </div>
                    <div className="translation-text mt-3">
                      <div
                        className="text-sm text-muted-foreground text-right"
                        dangerouslySetInnerHTML={{
                          __html: ayat.translation_aya_text,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-x-2">
                      {isFavorite && (
                        <Heart className="fill-destructive text-destructive mt-2 w-5 h-5" />
                      )}
                      {isLastRead && (
                        <Bookmark className="fill-primary w-5 h-5 mt-2" />
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </TabsContent>
        <TabsContent value="favorite">
          <div className="md:flex md:items-center md:justify-between text-center">
            <div className="flex-1 min-w-0 mb-2">
              <h2 className="font-bold leading-7 sm:text-3xl sm:truncate">
                Favorites
              </h2>
            </div>
          </div>
          <ul role="list" className="">
            {favorites.length === 0 ? (
              <li className="text-center text-sm text-muted-foreground">
                Belum ada ayat favorit
              </li>
            ) : (
              favorites.map((ayat, index) => {
                const isFavorite = favorites.some(
                  (fav) => fav.aya_id === ayat.aya_id,
                );
                const isLastRead = lastRead?.aya_id === ayat.aya_id;

                return (
                  <li
                    onClick={() => {
                      navigate(`/muslim/quran-surat/${ayat.sura_id}`, {
                        preventScrollReset: false,
                      });

                      window.localStorage.setItem(
                        "page_number",
                        JSON.stringify(ayat.page_number),
                      );
                    }}
                    key={ayat.aya_id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent rounded-md ${
                      isLastRead ? "bg-muted" : ""
                    }`}
                  >
                    <div className=" w-full text-right flex gap-x-2.5 items-start justify-end">
                      <div className="flex items-center gap-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="group-hover:visible invisible">
                            <Ellipsis className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Action</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => toggleFavorite(ayat)}
                            >
                              <Heart className="w-4 h-4" /> Favorite
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRead(ayat)}>
                              <Bookmark className="w-4 h-4" /> Last read
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Badge className="rounded px-2">
                          {ayat.aya_number}
                        </Badge>
                      </div>
                      <p className="relative mt-2 font-lpmq text-right">
                        {ayat.aya_text}
                      </p>
                    </div>
                    <div className="translation-text mt-3">
                      <div
                        className="text-sm text-muted-foreground text-right"
                        dangerouslySetInnerHTML={{
                          __html: ayat.translation_aya_text,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-x-2">
                      {isFavorite && (
                        <Heart className="fill-destructive text-destructive mt-2 w-5 h-5" />
                      )}
                      {isLastRead && (
                        <Bookmark className="fill-primary w-5 h-5 mt-2" />
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </TabsContent>
        <TabsContent value="listsurat">
          <div className="md:flex md:items-center md:justify-between text-center">
            <div className="flex-1 min-w-0 mb-2">
              <h2 className="font-bold leading-7 sm:text-3xl sm:truncate">
                Daftar Surat
              </h2>
            </div>
          </div>
          <Command className="rounded-lg border shadow-md max-w-sm mx-auto">
            <CommandInput placeholder="Cari surat..." />
            <CommandList className="max-h-[60vh]">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandSeparator />
              <CommandGroup heading="Surat Favorit">
                {data
                  .filter((navItem) => selectedIds.includes(navItem.id))
                  .map((navItem) => (
                    <CommandItem
                      key={navItem.id}
                      value={navItem.id}
                      className="flex items-center gap-1.5"
                      onSelect={() => {
                        navigate(`/muslim/quran-surat/${navItem.id}` as string);
                      }}
                    >
                      <Star className="h-5 w-5" />
                      <span>{navItem.id}. </span>
                      <span>{navItem.surat_name}</span>
                      <CommandShortcut>
                        {navItem.count_ayat} ayat
                      </CommandShortcut>
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Daftar Surat">
                {data
                  .filter((navItem) => !selectedIds.includes(navItem.id))
                  .map((navItem) => (
                    <CommandItem
                      key={navItem.id}
                      value={navItem.id}
                      className="flex items-center gap-1.5"
                      onSelect={() => {
                        navigate(`/muslim/quran-surat/${navItem.id}` as string);
                      }}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>{navItem.id}. </span>
                      <span>{navItem.surat_name}</span>
                      <CommandShortcut>
                        {navItem.count_ayat} ayat
                      </CommandShortcut>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const DoaHarianView = () => {
  const { data: doaharian } = DOAHARIAN;
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between text-center">
        <div className="flex-1 min-w-0 mb-2">
          <h2 className="font-bold leading-7 sm:text-3xl sm:truncate">
            Do'a Harian
          </h2>
        </div>
      </div>
      <ul role="list" className="">
        {doaharian.map((ayat, index) => {
          const arabicContent = ayat?.arabic;
          const translateContent = ayat?.translation;
          return (
            <li
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
              className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent rounded-md `}
            >
              <div>
                <div className="space-y-1 mb-2">
                  <h4 className="font-medium leading-none">{ayat.title}</h4>
                </div>
              </div>
              <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                <p
                  className="relative mt-2 text-right font-lpmq"
                  dangerouslySetInnerHTML={{
                    __html: arabicContent,
                  }}
                />
              </div>
              <div className="mt-3 space-y-3">
                <div
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: ayat.latin,
                  }}
                />
                <div
                  className="text-sm text-muted-foreground/80"
                  dangerouslySetInnerHTML={{
                    __html: translateContent,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export const SholawatView = () => {
  const sholawat = SHOLAWAT;
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between text-center">
        <div className="flex-1 min-w-0 mb-2">
          <h2 className="font-bold leading-7 sm:text-3xl sm:truncate">
            Sholawat
          </h2>
        </div>
      </div>
      <ul role="list" className="">
        {sholawat.map((ayat, index) => {
          return (
            <li
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
              className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent rounded-md `}
            >
              <h2 className="font-bold mb-2">{ayat.nama}</h2>
              <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                <p className="relative mt-2 font-lpmq text-right">
                  {ayat.arab}
                </p>
              </div>
              <div className="">
                <div
                  className="latin-text mt-3 text-sm text-muted-foreground text-right"
                  dangerouslySetInnerHTML={{
                    __html: ayat.latin,
                  }}
                />
                <div
                  className="translation-text mt-3 text-sm text-muted-foreground/80 text-right italic"
                  dangerouslySetInnerHTML={{
                    __html: ayat.arti,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export const DzikrView = () => {
  const { dzikr } = DZIKR;
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between text-center">
        <div className="flex-1 min-w-0 mb-2">
          <h2 className="font-bold leading-7 sm:text-3xl sm:truncate">
            Dzikir {getWaktuSekarang()}
          </h2>
        </div>
      </div>

      {getWaktuSekarang() === "pagi" ? (
        <ul role="list" className="">
          {dzikr
            .filter((d) => d.time === "" || d.time === "pagi")
            .map((ayat, index) => {
              const arabicContent = ayat?.arabic
                .replace(/@/g, "\n")
                .replace(/<p>/g, '<p class="font-lpmq">'); // Menambahkan kelas 'font-lpmq' pada tag <p>
              const translateContent = ayat?.translated_id
                .replace(/@/g, "<br/><br/>")
                .replace(/(\.)(\s|$)/g, "$1<br />");
              return (
                <li
                  key={index}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent rounded-md `}
                >
                  <div>
                    <div className="space-y-1 mb-2">
                      <h4 className="font-medium leading-none">{ayat.title}</h4>
                      <div className="flex items-center gap-x-1 text-sm text-muted-foreground italic">
                        {ayat?.note && (
                          <span className="italic">{ayat.note}</span>
                        )}

                        {ayat.time !== "" && "Setiap "}
                        {ayat.time === "pagi" ? (
                          <span className="flex items-center gap-x-1.5 text-sm">
                            <span className="italic">Pagi</span>
                            <Sun className="w-4 h-4 rotate-0 transition-all" />
                          </span>
                        ) : (
                          ayat.time === "petang" && (
                            <span className="flex items-center gap-x-1.5 text-sm">
                              <span className="italic">Petang</span>
                              <Moon className="w-4 h-4 rotate-0 transition-all" />
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                    <div
                      className="relative mt-2 text-right font-lpmq"
                      dangerouslySetInnerHTML={{
                        __html: arabicContent,
                      }}
                    />
                  </div>
                  <div className="mt-3 space-y-3">
                    <div
                      className="translation-text text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: translateContent,
                      }}
                    />
                    <div
                      className="text-sm text-muted-foreground italic"
                      dangerouslySetInnerHTML={{
                        __html: ayat.faedah,
                      }}
                    />
                    <div
                      className="text-sm text-muted-foreground italic"
                      dangerouslySetInnerHTML={{
                        __html: ayat.narrator,
                      }}
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      ) : (
        <ul role="list" className="">
          {dzikr
            .filter((d) => d.time === "" || d.time === "petang")
            .map((ayat, index) => {
              const arabicContent = ayat?.arabic
                .replace(/@/g, "\n")
                .replace(/<p>/g, '<p class="font-lpmq">'); // Menambahkan kelas 'font-lpmq' pada tag <p>
              const translateContent = ayat?.translated_id
                .replace(/@/g, "<br/><br/>")
                .replace(/(\.)(\s|$)/g, "$1<br />");
              return (
                <li
                  key={index}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent rounded-md `}
                >
                  <div>
                    <div className="space-y-1 mb-2">
                      <h4 className="font-medium leading-none">{ayat.title}</h4>
                      <div className="flex items-center gap-x-1 text-sm text-muted-foreground italic">
                        {ayat?.note && (
                          <span className="italic">{ayat.note}</span>
                        )}

                        {ayat.time !== "" && "Setiap "}
                        {ayat.time === "pagi" ? (
                          <span className="flex items-center gap-x-1.5 text-sm">
                            <span className="italic">Pagi</span>
                            <Sun className="w-4 h-4 rotate-0 transition-all" />
                          </span>
                        ) : (
                          ayat.time === "petang" && (
                            <span className="flex items-center gap-x-1.5 text-sm">
                              <span className="italic">Petang</span>
                              <Moon className="w-4 h-4 rotate-0 transition-all" />
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                    <p
                      className="relative mt-2 text-right font-lpmq"
                      dangerouslySetInnerHTML={{
                        __html: arabicContent,
                      }}
                    />
                  </div>
                  <div className="mt-3 space-y-3">
                    <div
                      className="translation-text text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: translateContent,
                      }}
                    />
                    <div
                      className="text-sm text-muted-foreground italic"
                      dangerouslySetInnerHTML={{
                        __html: ayat.faedah,
                      }}
                    />
                    <div
                      className="text-sm text-muted-foreground italic"
                      dangerouslySetInnerHTML={{
                        __html: ayat.narrator,
                      }}
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};
export const TahlilView = () => {
  const { data: tahlil } = TAHLIL;
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between text-center">
        <div className="flex-1 min-w-0 mb-2">
          <h2 className="font-bold leading-7 sm:text-3xl sm:truncate">
            Tahlil
          </h2>
          <div className="text-sm italic text-muted-foreground italic">
            <p>Based {TAHLIL.based_on}</p>
            <p>
              Source <a href={TAHLIL.source}>{TAHLIL.source}</a>
            </p>
          </div>
        </div>
      </div>
      <ul role="list" className="">
        {tahlil.map((ayat, index) => {
          const arabicContent = ayat?.arabic;
          const translateContent = ayat?.translation;
          return (
            <li
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
              className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-accent rounded-md `}
            >
              <div>
                <div className="space-y-1 mb-2">
                  <h4 className="font-medium leading-none">{ayat.title}</h4>
                </div>
              </div>
              <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                <p
                  className="relative mt-2 text-right font-lpmq"
                  dangerouslySetInnerHTML={{
                    __html: arabicContent,
                  }}
                />
              </div>
              <div className="mt-3 space-y-3">
                <div
                  className="translation-text text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: translateContent,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// import * as React from "react"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";

// import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog";
import { Circle, File, Laptop } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { Button } from "@/registry/new-york/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandShortcut,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

function CommandMenu({ ...props }: DialogProps) {
  const navigate = useNavigate();

  const { data } = DAFTARSURATJSON;
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64",
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">Search surat...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Cari..." />

        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandSeparator />
          <CommandGroup heading="Surat Favorit">
            {data
              .filter((navItem) => selectedIds.includes(navItem.id))
              .map((navItem) => (
                <CommandItem
                  key={navItem.id}
                  value={navItem.id}
                  className="flex items-center gap-1.5"
                  onSelect={() => {
                    runCommand(() =>
                      navigate(`/muslim/quran-surat/${navItem.id}` as string),
                    );
                  }}
                >
                  <Star className="h-5 w-5" />
                  <span>{navItem.id}. </span>
                  <span>{navItem.surat_name}</span>
                  <CommandShortcut>{navItem.count_ayat} ayat</CommandShortcut>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandGroup heading="Daftar Surat">
            {data
              .filter((navItem) => !selectedIds.includes(navItem.id))
              .map((navItem) => (
                <CommandItem
                  key={navItem.id}
                  value={navItem.id}
                  className="flex items-center gap-1.5"
                  onSelect={() => {
                    runCommand(() =>
                      navigate(`/muslim/quran-surat/${navItem.id}` as string),
                    );
                  }}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>{navItem.id}. </span>
                  <span>{navItem.surat_name}</span>
                  <CommandShortcut>{navItem.count_ayat} ayat</CommandShortcut>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

function DisplaySetting() {
  // Daftar variasi font dengan nama dan font-weight yang sesuai

  // Mengelola state untuk font weight
  const location = useLocation();
  const [fontWeight, setFontWeight] = useState<string>(400); // Default ke "Normal"
  const [fontSize, setFontSize] = useState<string>(""); // Default ke "Normal"
  const [showTranslation, setShowTranslation] = useState<boolean>(true); // Default ke "Normal"
  const [showLatin, setShowLatin] = useState<boolean>(true); // Default ke "Normal"

  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSize");
    const savedFontWeight = localStorage.getItem("fontWeight");
    const savedShowTranslation = localStorage.getItem("showTranslation");
    const savedShowLatin = localStorage.getItem("showLatin");

    if (savedFontSize) handleFontSizeChange(JSON.parse(savedFontSize));
    if (savedFontWeight) handleFontChange(JSON.parse(savedFontWeight));
    if (savedShowTranslation)
      handleTranslationToggle(JSON.parse(savedShowTranslation));
    if (savedShowLatin) handleLatinToggle(JSON.parse(savedShowLatin));
  }, [location.key]);
  // Fungsi untuk menangani perubahan radio button
  const handleFontChange = (value: string) => {
    setFontWeight(value);

    const timerFields = document.querySelectorAll(".font-lpmq");
    for (const timerField of timerFields) {
      if (timerField instanceof HTMLParagraphElement) {
        timerField.style.fontWeight = value;
      }
    }
    localStorage.setItem("fontWeight", JSON.stringify(value));
  };
  const handleFontSizeChange = (value: number) => {
    const finder = fontSizeOpt.find((d) => d.label === value);
    if (!finder) return;
    setFontSize(value);
    const timerFields = document.querySelectorAll(".font-lpmq");
    for (const timerField of timerFields) {
      if (timerField instanceof HTMLParagraphElement) {
        timerField.style.fontSize = finder.fontSize;
        timerField.style.lineHeight = finder.lineHeight;
      }
    }
    localStorage.setItem("fontSize", JSON.stringify(value));
  };
  const handleTranslationToggle = (value: boolean) => {
    const timerFields = document.querySelectorAll(".translation-text");
    for (const timerField of timerFields) {
      if (timerField instanceof HTMLDivElement) {
        timerField.style.display = value ? "block" : "none";
      }
    }
    setShowTranslation(value);
    localStorage.setItem("showTranslation", JSON.stringify(value));
  };
  const handleLatinToggle = (value: boolean) => {
    const timerFields = document.querySelectorAll(".latin-text");
    for (const timerField of timerFields) {
      if (timerField instanceof HTMLDivElement) {
        timerField.style.display = value ? "block" : "none";
      }
    }
    setShowLatin(value);
    localStorage.setItem("showLatin", JSON.stringify(value));
  };

  return (
    <Popover>
      <div className="flex items-center gap-1">
        <PopoverTrigger>
          <Settings2 size={16} />
        </PopoverTrigger>
      </div>
      <PopoverContent
        side="left"
        className="p-0 rounded-lg shadow-none  my-2 w-full"
      >
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>
              Manage your display settings here.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-3 w-full">
              <div className="space-y-1 w-full">
                <Label>Font Weight</Label>
                <Select value={fontWeight} onValueChange={handleFontChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Font Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span style={{ fontWeight: option.value }}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 w-full">
                <Label>Font Size</Label>
                <Select value={fontSize} onValueChange={handleFontSizeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Font Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOpt.map((option) => (
                      <SelectItem key={option.label} value={option.label}>
                        <span
                          className="capitalize"
                          // style={{
                          //   fontSize: option.fontSize,
                          //   lineHeight: option.lineHeight,
                          // }}
                        >
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="translationtext"
                  className="flex flex-col space-y-1"
                >
                  <span>Display translation text</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Display or hide translation text.
                  </span>
                </Label>
                <Switch
                  id="translationtext"
                  defaultChecked={showTranslation}
                  onCheckedChange={handleTranslationToggle}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="latintext" className="flex flex-col space-y-1">
                  <span>Display latin text</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Display or hide latin text.
                  </span>
                </Label>
                <Switch
                  id="latintext"
                  defaultChecked={showLatin}
                  onCheckedChange={handleLatinToggle}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

function DisplayTrigger() {
  // Daftar variasi font dengan nama dan font-weight yang sesuai
  // Mengelola state untuk font weight
  const location = useLocation();

  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSize");
    const savedFontWeight = localStorage.getItem("fontWeight");
    const savedShowTranslation = localStorage.getItem("showTranslation");
    const savedShowLatin = localStorage.getItem("showLatin");

    if (savedFontSize) handleFontSizeChange(JSON.parse(savedFontSize));
    if (savedFontWeight) handleFontChange(JSON.parse(savedFontWeight));
    if (savedShowTranslation)
      handleTranslationToggle(JSON.parse(savedShowTranslation));
    if (savedShowLatin) handleLatinToggle(JSON.parse(savedShowLatin));
  }, [location.key]);
  // Fungsi untuk menangani perubahan radio button
  const handleFontChange = (value: string) => {
    const timerFields = document.querySelectorAll(".font-lpmq");
    for (const timerField of timerFields) {
      if (timerField instanceof HTMLParagraphElement) {
        timerField.style.fontWeight = value;
      }
    }
    localStorage.setItem("fontWeight", JSON.stringify(value));
  };
  const handleFontSizeChange = (value: number) => {
    const finder = fontSizeOpt.find((d) => d.label === value);
    if (!finder) return;
    const timerFields = document.querySelectorAll(".font-lpmq");
    for (const timerField of timerFields) {
      if (timerField instanceof HTMLParagraphElement) {
        timerField.style.fontSize = finder.fontSize;
        timerField.style.lineHeight = finder.lineHeight;
      }
    }
    localStorage.setItem("fontSize", JSON.stringify(value));
  };
  const handleTranslationToggle = (value: boolean) => {
    const timerFields = document.querySelectorAll(".translation-text");
    for (const timerField of timerFields) {
      if (timerField instanceof HTMLDivElement) {
        timerField.style.display = value ? "block" : "none";
      }
    }
    localStorage.setItem("showTranslation", JSON.stringify(value));
  };
  const handleLatinToggle = (value: boolean) => {
    const timerFields = document.querySelectorAll(".latin-text");
    for (const timerField of timerFields) {
      if (timerField instanceof HTMLDivElement) {
        timerField.style.display = value ? "block" : "none";
      }
    }
    localStorage.setItem("showLatin", JSON.stringify(value));
  };

  return null;
}

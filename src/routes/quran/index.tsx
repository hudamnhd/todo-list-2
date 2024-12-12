import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Debug } from "@/components/debug";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import {
  useLoaderData,
  useParams,
  useNavigate,
  useNavigation,
  Outlet,
  NavLink,
  json,
} from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import ThemeSwitch from "@/components/custom/theme-switch";
import DAFTARSURATJSON from "/public/quran/daftar-surat.json";
import SHOLAWAT from "/public/data/sholawat.json";
import TAHLIL from "/public/data/tahlil.json";
import DOAHARIAN from "/public/data/doaharian.json";
import { data as DZIKR } from "/public/data/dzikr.ts";
import {
  Search,
  Heart,
  Ellipsis,
  Bookmark,
  Check,
  CircleCheckBig,
  X,
  Dot,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          <AyatListHafalan data={data} initialPage={initialPage} />
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
          <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down transition-all duration-300 space-y-2 text-text font-base mt-1 bg-background">
            <span className="text-2xl font-lpmq text-right leading-[55px]">
              {ayat_text}
            </span>
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
        <CollapsibleTrigger className="text-2xl font-extrabold pt-1">
          Surat {surat_name.surat_name}
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down transition-all duration-300 space-y-2 text-text font-base mt-1 bg-background">
          <p className="font-lpmq text-md"> ( {surat_name.surat_text} )</p>
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

const AyatListHafalan: React.FC<AyatListProps> = ({ data, initialPage }) => {
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
      navigate(`/quran/${currentPage + 1}`, {
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
      navigate(`/quran/${currentPage - 1}`, {
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
            className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 pr-4 pl-2 sm:px-5 hover:bg-sidebar-accent rounded-md ${
              isLastRead ? "bg-muted" : ""
            }`}
          >
            <div className=" w-full text-right flex gap-x-2.5 items-center justify-end">
              <div className="flex items-center relative mt-2 ">
                {ayat.aya_text && ayat.aya_text.length > 15 ? (
                  <>
                    <span className="text-2xl font-lpmq text-right leading-[55px]">
                      {ayat.aya_text.slice(-15)}
                    </span>
                    <div className="mx-4 flex text-muted-foreground">
                      {new Array(4).fill(null).map((_, index) => (
                        <Dot key={index} className="h-5" />
                      ))}
                    </div>
                    <span className="text-2xl font-lpmq text-right leading-[55px]">
                      {ayat.aya_text.slice(0, 15)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-lpmq text-right leading-[55px]">
                    {ayat.aya_text}
                  </span>
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
      navigate(`/quran/${currentPage + 1}`, {
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
      navigate(`/quran/${currentPage - 1}`, {
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
      navigate(`/quran/${currentPage + 1}`, {
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
      navigate(`/quran/${currentPage - 1}`, {
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
            className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 pr-4 pl-2 sm:px-5 hover:bg-sidebar-accent rounded-md ${
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
              <p className="relative text-2xl mt-2 font-lpmq text-right leading-[55px]">
                {ayat.aya_text}
              </p>
            </div>
            <div className="mt-3 flex items-end justify-end">
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

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function AppSidebar() {
  const { data } = DAFTARSURATJSON;

  const [searchTerm, setSearchTerm] = useState<string>("");

  // Menggunakan useMemo untuk optimasi pencarian
  const filteredSurat = useMemo(() => {
    return data.filter(
      (surat) =>
        surat.surat_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surat.id.toString().includes(searchTerm),
    );
  }, [searchTerm]);
  return (
    <Sidebar>
      <SidebarHeader>
        <SearchForm value={searchTerm} onChange={setSearchTerm} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Daftar Surat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSurat?.length > 0 ? (
                filteredSurat.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <NavLink to={`/quran/${item.id}`}>
                      {({ isActive }) => (
                        <SidebarMenuButton
                          {...(isActive ? { isActive } : {})}
                          className={isActive ? "font-bold" : ""}
                        >
                          <span>{item.id}. </span>
                          <span>{item.surat_name}</span>
                          <SidebarMenuBadge>{item.count_ayat}</SidebarMenuBadge>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem className="text-center">
                  Surat tidak ditemukan
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 bg-background z-10 flex  border-b h-16 items-center justify-between pr-3">
          <div className="flex h-16 shrink-0 items-center gap-2 px-4 ">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbInfo />
          </div>
          <ThemeSwitch />
        </header>
        <div className="flex flex-1 flex-col gap-4 sm:p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
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

export const IndexQuranId: React.FC<AyatListProps> = () => {
  const [favorites, setFavorites] = useState<Array>([]);
  const [lastRead, setLastRead] = useState<number | null>(null);
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
  const sholawat = SHOLAWAT;
  const { dzikr } = DZIKR;
  const { data: tahlil } = TAHLIL;
  const { data: doaharian } = DOAHARIAN;
  const class_tab =
    "data-[state=active]:bg-foreground data-[state=active]:text-background sm:data-[state=active]:bg-background sm:data-[state=active]:text-foreground";
  return (
    <div>
      <Tabs defaultValue="sholawat">
        <TabsList className="bg-background sm:bg-muted h-[80px] sm:h-9 flex gap-1.5 flex-wrap items-center justify-center w-fit mx-auto overflow-x-auto my-2 sm:my-0 ">
          <TabsTrigger className={class_tab} value="doaharian">
            Do'a Harian
          </TabsTrigger>
          <TabsTrigger className={class_tab} value="sholawat">
            Sholawat
          </TabsTrigger>
          <TabsTrigger className={class_tab} value="dzikr">
            Dzikir
          </TabsTrigger>
          <TabsTrigger className={class_tab} value="tahlil">
            Tahlil
          </TabsTrigger>
          <TabsTrigger className={class_tab} value="quran">
            Qur'an
          </TabsTrigger>
        </TabsList>
        <TabsContent value="doaharian">
          <div className="md:flex md:items-center md:justify-between text-center">
            <div className="flex-1 min-w-0 mb-2">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
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
                  className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-sidebar-accent rounded-md `}
                >
                  <div>
                    <div className="space-y-1 mb-2">
                      <h4 className="font-medium leading-none">{ayat.title}</h4>
                    </div>
                  </div>
                  <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                    <div
                      className="relative text-2xl mt-2 text-right leading-[55px] font-lpmq"
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
        </TabsContent>
        <TabsContent value="dzikr">
          <div className="md:flex md:items-center md:justify-between text-center">
            <div className="flex-1 min-w-0 mb-2">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Dzikir
              </h2>
            </div>
          </div>

          <Tabs defaultValue={getWaktuSekarang()}>
            <TabsList className="flex items-center justify-center w-fit mx-auto">
              <TabsTrigger value="pagi">
                <Sun className="w-4 h-4 mr-1" /> Pagi
              </TabsTrigger>
              <TabsTrigger value="petang">
                <Moon className="w-4 h-4 mr-1" /> Petang
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pagi">
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
                        className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-sidebar-accent rounded-md `}
                      >
                        <div>
                          <div className="space-y-1 mb-2">
                            <h4 className="font-medium leading-none">
                              {ayat.title}
                            </h4>
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
                            className="relative text-2xl mt-2 text-right leading-[55px] font-lpmq"
                            dangerouslySetInnerHTML={{
                              __html: arabicContent,
                            }}
                          />
                        </div>
                        <div className="mt-3 space-y-3">
                          <div
                            className="text-sm text-muted-foreground"
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
            </TabsContent>
            <TabsContent value="petang">
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
                        className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-sidebar-accent rounded-md `}
                      >
                        <div>
                          <div className="space-y-1 mb-2">
                            <h4 className="font-medium leading-none">
                              {ayat.title}
                            </h4>
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
                            className="relative text-2xl mt-2 text-right leading-[55px] font-lpmq"
                            dangerouslySetInnerHTML={{
                              __html: arabicContent,
                            }}
                          />
                        </div>
                        <div className="mt-3 space-y-3">
                          <div
                            className="text-sm text-muted-foreground"
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
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="sholawat">
          <div className="md:flex md:items-center md:justify-between text-center">
            <div className="flex-1 min-w-0 mb-2">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
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
                  className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-sidebar-accent rounded-md `}
                >
                  <h2 className="font-bold mb-2">{ayat.nama}</h2>
                  <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                    <p className="relative text-2xl mt-2 font-lpmq text-right leading-[55px]">
                      {ayat.arab}
                    </p>
                  </div>
                  <div className="mt-3 space-y-3">
                    <div
                      className="text-sm text-muted-foreground text-right"
                      dangerouslySetInnerHTML={{
                        __html: ayat.latin,
                      }}
                    />
                    <div
                      className="text-sm text-muted-foreground/80 text-right italic"
                      dangerouslySetInnerHTML={{
                        __html: ayat.arti,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </TabsContent>
        <TabsContent value="tahlil">
          <div className="md:flex md:items-center md:justify-between text-center">
            <div className="flex-1 min-w-0 mb-2">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
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
                  className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-sidebar-accent rounded-md `}
                >
                  <div>
                    <div className="space-y-1 mb-2">
                      <h4 className="font-medium leading-none">{ayat.title}</h4>
                    </div>
                  </div>
                  <div className="w-full text-right flex gap-x-2.5 items-start justify-end">
                    <div
                      className="relative text-2xl mt-2 text-right leading-[55px] font-lpmq"
                      dangerouslySetInnerHTML={{
                        __html: arabicContent,
                      }}
                    />
                  </div>
                  <div className="mt-3 space-y-3">
                    <div
                      className="text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: translateContent,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </TabsContent>
        <TabsContent value="quran">
          <div className="md:flex md:items-center md:justify-between text-center">
            <div className="flex-1 min-w-0 mb-2">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Last Read
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
                      navigate(`/quran/${ayat.sura_id}`, {
                        preventScrollReset: false,
                      });

                      window.localStorage.setItem(
                        "page_number",
                        JSON.stringify(ayat.page_number),
                      );
                    }}
                    key={ayat.aya_id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-sidebar-accent rounded-md ${
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
                      <p className="relative text-2xl mt-2 font-lpmq text-right leading-[55px]">
                        {ayat.aya_text}
                      </p>
                    </div>
                    <div className="mt-3">
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
          <div className="md:flex md:items-center md:justify-between text-center mt-5">
            <div className="flex-1 min-w-0 mb-2">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
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
                      navigate(`/quran/${ayat.sura_id}`, {
                        preventScrollReset: false,
                      });

                      window.localStorage.setItem(
                        "page_number",
                        JSON.stringify(ayat.page_number),
                      );
                    }}
                    key={ayat.aya_id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className={`animate-slide-top [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-sidebar-accent rounded-md ${
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
                      <p className="relative text-2xl mt-2 font-lpmq text-right leading-[55px]">
                        {ayat.aya_text}
                      </p>
                    </div>
                    <div className="mt-3">
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
      </Tabs>
    </div>
  );
};

function BreadcrumbInfo() {
  const { data } = DAFTARSURATJSON;
  const params = useParams();
  const surat_name = params?.id
    ? data.find((d) => d.id === parseInt(params.id))
    : null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <NavLink to="/quran">Quran</NavLink>
        </BreadcrumbItem>
        {surat_name && (
          <React.Fragment>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{surat_name.surat_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </React.Fragment>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

import { Label } from "@/components/ui/label";
import {
  // SidebarGroup,
  // SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";

function SearchForm({ value, onChange }) {
  return (
    <SidebarGroup className="py-0 mt-3">
      <SidebarGroupContent className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Cari Surat..."
          className="pl-8"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

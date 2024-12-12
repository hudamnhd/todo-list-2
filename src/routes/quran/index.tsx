import { Button } from "@/components/ui/button";
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
import { Search, Heart, Ellipsis, Bookmark } from "lucide-react";

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
      <AyatListWithFavorites data={data} initialPage={initialPage} />
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
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
          <p className="text-lpmq text-md">( {surat_name.surat_text} )</p>
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

const AyatListWithFavorites: React.FC<AyatListProps> = ({
  data,
  initialPage,
}) => {
  const [favorites, setFavorites] = useState<Array>([]);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const navigate = useNavigate();
  const navigation = useNavigation();
  console.warn("DEBUGPRINT[2]: index.tsx:118: navigation=", navigation);

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
            className={`animate-roll-reveal [animation-fill-mode:backwards] group relative py-5 pr-4 pl-2 sm:px-5 hover:bg-sidebar-accent rounded-md ${
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
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0 mb-2">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Last Read
          </h2>
        </div>
      </div>
      <ul role="list" className="">
        {arrayLastRead.map((ayat, index) => {
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
              className={`animate-roll-reveal [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-sidebar-accent rounded-md ${
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
                      <DropdownMenuItem onClick={() => toggleFavorite(ayat)}>
                        <Heart className="w-4 h-4" /> Favorite
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRead(ayat)}>
                        <Bookmark className="w-4 h-4" /> Last read
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Badge className="rounded px-2">{ayat.aya_number}</Badge>
                </div>
                <p className="relative text-2xl mt-2 font-lpmq text-right font-bold leading-[55px]">
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
        })}
      </ul>
      <div className="md:flex md:items-center md:justify-between mt-5">
        <div className="flex-1 min-w-0 mb-2">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Favorites
          </h2>
        </div>
      </div>
      <ul role="list" className="">
        {favorites.map((ayat, index) => {
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
              className={`animate-roll-reveal [animation-fill-mode:backwards] group relative py-5 px-3 sm:px-5 hover:bg-sidebar-accent rounded-md ${
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
                      <DropdownMenuItem onClick={() => toggleFavorite(ayat)}>
                        <Heart className="w-4 h-4" /> Favorite
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRead(ayat)}>
                        <Bookmark className="w-4 h-4" /> Last read
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Badge className="rounded px-2">{ayat.aya_number}</Badge>
                </div>
                <p className="relative text-2xl mt-2 font-lpmq text-right font-bold leading-[55px]">
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
        })}
      </ul>
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
        <BreadcrumbItem className="hidden md:block">
          <NavLink to="/quran">Quran</NavLink>
        </BreadcrumbItem>
        {surat_name && (
          <React.Fragment>
            <BreadcrumbSeparator className="hidden md:block" />
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

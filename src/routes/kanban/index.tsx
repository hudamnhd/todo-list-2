import { Github } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import RichTextEditor from "@/components/text-editor";
import { Button } from "@/components/ui/button";
import React from "react";
import { MainNav } from "./components/main-nav";
// import { Search } from "./components/search";
import { UserNav } from "./components/user-nav";
import ThemeSwitch from "@/components/custom/theme-switch";

// export default function DashboardPage() {
//   return (
//     <div className="flex-col flex">
//       <div className="border-b sticky top-0 w-full z-10 bg-background">
//         <div className="flex h-16 items-center px-4">
//           <MainNav className="mx-6" />
//           <div className="ml-auto flex items-center space-x-4">
//             <Search />
//             <ThemeSwitch />
//             <UserNav />
//           </div>
//         </div>
//       </div>
//       <App />
//     </div>
//   );
// }
function App() {
  return (
    <>
      <div className="flex flex-col m-10">
        <main className="mx-4 flex flex-col gap-6 max-w-6xl mx-auto text-center">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Drag and Drop Kanban Board
          </h1>
          <AppRichTextEditor />
          <KanbanBoard />
        </main>
      </div>
    </>
  );
}

import { Debug } from "@/components/debug";
import DAFTARSURATJSON from "/public/quran/daftar-surat.json";
function AppRichTextEditor() {
  const [value, setValue] = React.useState("Example tiptap");
  const [quran, setQuran] = React.useState(null);
  async function get_data() {
    const res = await fetch("/quran/daftar-surat.json");
    const data = await res.json();
    setQuran(data.data);
    return data;
  }

  React.useEffect(() => {
    get_data();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto my-2">
      {/*<img src="https://media.qurankemenag.net/khat2/QK_001.webp" />*/}

      {/*<div className="font-lpmq text-5xl">{JSON.stringify(quran, null, 2)}</div>*/}
      {/*<Debug data={quran} />*/}
      <SuratList suratData={quran} />
    </div>
  );
}

const SuratList = ({ suratData }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Daftar Surat
        </h1>
        {suratData.map((surat) => (
          <div
            key={surat.id}
            className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-6 mb-6 rounded-lg shadow-md hover:shadow-xl transform transition duration-300 hover:scale-105"
          >
            <h2 className="text-2xl font-semibold text-white">
              {surat.surat_name}
            </h2>
            <p className="text-xl text-gray-100 font-lpmq">
              {surat.surat_text}
            </p>
            <p className="text-lg text-white mt-2">
              <span className="font-semibold">{surat.surat_terjemahan}</span>
            </p>
            <p className="text-sm text-gray-200 mt-2">
              <span className="font-semibold">{surat.count_ayat}</span> Ayat
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

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
  return (
    <Sidebar>
      <SidebarHeader>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Daftar Surat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton>
                    <span>{item.id}. </span>
                    <span>{item.surat_name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{item.count_ayat}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
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
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
      {children}
    </SidebarProvider>
  );
}

import { Label } from "@/components/ui/label";
import {
  // SidebarGroup,
  // SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";

function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search the docs..."
            className="pl-8"
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}

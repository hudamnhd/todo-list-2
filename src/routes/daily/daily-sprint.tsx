export default function Route() {
  return (
    <div>
      <div className="flex w-full flex-col items-start gap-2 border-t-4 bg-gradient-to-t from-gray-100 to-gray-200 p-5 pb-10 dark:from-gray-800 dark:to-gray-900 md:rounded-lg xl:flex-row border-red-400">
        <div className="flex min-h-[100px] shrink-0 flex-col items-center justify-center rounded-xl border-t-4 bg-gradient-to-t p-1 px-3 border-red-600 from-red-300 to-red-500 text-white">
          <div className="text-3xl font-bold">1.9%</div>
          <div className="mt-1 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-crosshair"
            >
              <circle cx={12} cy={12} r={10} />
              <line x1={22} x2={18} y1={12} y2={12} />
              <line x1={6} x2={2} y1={12} y2={12} />
              <line x1={12} x2={12} y1={6} y2={2} />
              <line x1={12} x2={12} y1={22} y2={18} />
            </svg>
            <div className="text-sm">Focus Rate</div>
          </div>
        </div>
        <div className="w-full">
          <div className="-mb-[7px] w-full text-xl font-bold">
            <div className="group mb-[7px] w-full px-0">
              Untitled Sprint
              <span className="invisible text-gray-400 group-hover:visible hidden">
                Add label
              </span>
            </div>
          </div>
          <div className="-mb-[7px] w-full">
            <div className="group mb-[7px] w-full px-0">
              <span className="text-gray-400 group-hover:visible visible">
                Write your reason here why it's important to finish this sprint.
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 pr-2 text-sm capitalize bg-blue-500 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-target stroke-1"
            >
              <circle cx={12} cy={12} r={10} />
              <circle cx={12} cy={12} r={6} />
              <circle cx={12} cy={12} r={2} />
            </svg>
            focus
          </div>
          <div className="mt-2" />
          <div className="mt-3" />
        </div>
        <div className="hidden w-full">
          <div
            className="recharts-responsive-container"
            style={{ width: "100%", height: 300, minWidth: 0 }}
            width={0}
            height={0}
          />
        </div>
        <div className="mt-5 flex w-full items-start xl:mt-0 xl:max-w-md">
          <div className="w-full gap-5 xl:ml-auto xl:max-w-2xl" id="stats">
            <div className="relative mt-5">
              <div className="h-4 w-full overflow-hidden rounded-xl bg-gray-400">
                <div className="h-4 bg-green-400" style={{ width: "50%" }} />
              </div>
              <div className="absolute -top-8 w-full">
                <div
                  className="absolute flex items-center justify-end"
                  style={{ width: 28 }}
                >
                  <div className="shrink-0 rounded-lg bg-indigo-400 p-0.5 px-1 shadow-lg dark:bg-indigo-600">
                    🙂
                  </div>
                </div>
                <div
                  className="absolute flex items-center justify-end"
                  style={{ width: "30%" }}
                >
                  <div className="shrink-0 rounded-lg bg-indigo-400 p-0.5 px-1 shadow-lg dark:bg-indigo-600">
                    😀
                  </div>
                </div>
                <div
                  className="absolute flex items-center justify-end grayscale"
                  style={{ width: "55%" }}
                >
                  <div className="shrink-0 rounded-lg bg-indigo-400 p-0.5 px-1 shadow-lg dark:bg-indigo-600">
                    😎
                  </div>
                </div>
                <div
                  className="absolute flex items-center justify-end grayscale"
                  style={{ width: "77%" }}
                >
                  <div className="shrink-0 rounded-lg bg-indigo-400 p-0.5 px-1 shadow-lg dark:bg-indigo-600">
                    🤩
                  </div>
                </div>
                <div
                  className="absolute flex items-center justify-end grayscale"
                  style={{ width: "100%" }}
                >
                  <div className="shrink-0 rounded-lg bg-indigo-400 p-0.5 px-1 shadow-lg dark:bg-indigo-600">
                    🎉
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="text-sm">50.0% tasks done</div>
                <div className="ml-auto text-sm">2/4</div>
              </div>
            </div>
            <div className="mt-2 w-full xl:max-w-md">
              <div className="">
                <div className="mt-1 px-1 text-sm" />
                <div className="">
                  <div className="text-sm">
                    <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                      <div className="">2 Weeks</div>
                      <div className="ml-auto">
                        <div>04 Dec 2024</div>
                      </div>
                      <div className="shrink-0 px-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-arrow-right"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                      <div>
                        <div>18 Dec 2024</div>
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <div className="flex h-2 w-full justify-end overflow-hidden rounded-xl bg-gray-400">
                      <div
                        className="h-2 bg-green-400"
                        style={{ width: "71.4286%" }}
                      />
                    </div>
                    <div className="flex items-center text-sm">
                      <div>Day 5</div>
                      <div className="ml-auto">10 days remaining</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 md:flex md:grid-cols-4 md:justify-end">
              <div className="flex items-center justify-center p-2">
                <button data-state="closed">
                  <div className="flex items-center justify-center text-4xl">
                    🌼
                  </div>
                </button>
              </div>
              <div className="flex shrink-0 flex-col items-center rounded-lg border-t-4 border-gray-300 bg-gradient-to-t from-gray-100 to-gray-200 p-1 px-3 text-gray-900">
                <div className="text-center text-base font-bold">5 mins</div>
                <div className="mt-1 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-clock"
                  >
                    <circle cx={12} cy={12} r={10} />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div className="text-sm">Total time</div>
                </div>
              </div>
              <div className="flex flex-col items-center rounded-lg border-t-4 border-green-300 bg-gradient-to-t from-green-100 to-green-200 p-1 px-3 text-green-900">
                <div className="text-xl font-bold">2</div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <div className="text-sm">Done</div>
                </div>
              </div>
              <div className="flex flex-col items-center rounded-lg border-t-4 border-orange-300 bg-gradient-to-t from-orange-100 to-orange-200 p-1 px-3 text-orange-900">
                <div className="text-xl font-bold">2</div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-square"
                  >
                    <rect width={18} height={18} x={3} y={3} rx={2} />
                  </svg>
                  <div className="text-sm">Todo</div>
                </div>
              </div>
              <div className="flex flex-col items-center rounded-lg border-t-4 border-blue-300 bg-gradient-to-t from-blue-100 to-blue-200 p-1 px-3 text-blue-900">
                <div className="text-xl font-bold">4</div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-list-todo"
                  >
                    <rect x={3} y={5} width={6} height={6} rx={1} />
                    <path d="m3 17 2 2 4-4" />
                    <path d="M13 6h8" />
                    <path d="M13 12h8" />
                    <path d="M13 18h8" />
                  </svg>
                  <div className="text-sm">All</div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            id="radix-:rdr:"
            aria-haspopup="menu"
            aria-expanded="false"
            data-state="closed"
            className="ml-5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-ellipsis-vertical text-gray-600"
            >
              <circle cx={12} cy={12} r={1} />
              <circle cx={12} cy={5} r={1} />
              <circle cx={12} cy={19} r={1} />
            </svg>
          </button>
        </div>
      </div>

      <div
        data-rfd-droppable-id="droppable-column"
        data-rfd-droppable-context-id=":rdt:"
        className="flex w-max items-start"
      >
        <div
          data-rfd-draggable-context-id=":rdt:"
          data-rfd-draggable-id="column-ea6bc7e5-b099-4506-bc2e-844f196cc436"
          className="w-screen shrink-0 rounded-lg px-5 md:min-w-[350px] md:max-w-md"
        >
          <div className="group mb-5 flex w-full items-center gap-2 rounded-lg bg-gradient-to-l from-white/50 to-white p-2 dark:from-gray-800 dark:to-gray-950">
            <div
              tabIndex={0}
              role="button"
              aria-describedby="rfd-hidden-text-:rdt:-hidden-text-:rdu:"
              data-rfd-drag-handle-draggable-id="column-ea6bc7e5-b099-4506-bc2e-844f196cc436"
              data-rfd-drag-handle-context-id=":rdt:"
              draggable="false"
              className="group-hover:visible"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-grip-vertical text-gray-400"
              >
                <circle cx={9} cy={12} r={1} />
                <circle cx={9} cy={5} r={1} />
                <circle cx={9} cy={19} r={1} />
                <circle cx={15} cy={12} r={1} />
                <circle cx={15} cy={5} r={1} />
                <circle cx={15} cy={19} r={1} />
              </svg>
            </div>
            <div className="-mb-[7px] w-full">
              <div className="group mb-[7px] w-full px-0">
                aaaaaa
                <span className="invisible text-gray-400 group-hover:visible hidden">
                  Add label
                </span>
              </div>
            </div>
            <button
              className="ml-auto text-gray-500"
              type="button"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="radix-:re5:"
              data-state="closed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-trash2 stroke-1"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1={10} x2={10} y1={11} y2={17} />
                <line x1={14} x2={14} y1={11} y2={17} />
              </svg>
            </button>
          </div>
          <div className="w-full">
            <div
              data-rfd-droppable-id="droppable-column-ea6bc7e5-b099-4506-bc2e-844f196cc436"
              data-rfd-droppable-context-id=":rdt:"
              className=""
            >
              <div
                data-rfd-draggable-context-id=":rdt:"
                data-rfd-draggable-id="page-entry-c1d1bf4a-ede0-425b-b138-432e659155b7"
                className="mb-10 w-full rounded-lg border-t-4 bg-gradient-to-t px-5 pb-10 pt-2 dark:via-dark-900/20 border-green-200 from-transparent via-green-50 to-green-100 dark:border-green-900 dark:from-transparent dark:to-gray-950/80"
              >
                <div className="mb-2 flex w-full ">
                  <div
                    tabIndex={0}
                    role="button"
                    aria-describedby="rfd-hidden-text-:rdt:-hidden-text-:rdu:"
                    data-rfd-drag-handle-draggable-id="page-entry-c1d1bf4a-ede0-425b-b138-432e659155b7"
                    data-rfd-drag-handle-context-id=":rdt:"
                    draggable="false"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-grip-vertical text-gray-400"
                    >
                      <circle cx={9} cy={12} r={1} />
                      <circle cx={9} cy={5} r={1} />
                      <circle cx={9} cy={19} r={1} />
                      <circle cx={15} cy={12} r={1} />
                      <circle cx={15} cy={5} r={1} />
                      <circle cx={15} cy={19} r={1} />
                    </svg>
                  </div>
                  <div className="w-full">
                    <div className="-mb-[7px] w-full">
                      <div className="group mb-[7px] w-full px-0">
                        TodoTask List
                        <span className="invisible text-gray-400 group-hover:visible hidden">
                          Add label
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="ml-auto text-gray-500"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ren:"
                    data-state="closed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-trash2 stroke-1"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1={10} x2={10} y1={11} y2={17} />
                      <line x1={14} x2={14} y1={11} y2={17} />
                    </svg>
                  </button>
                </div>
                <div>
                  <div>
                    <div className="">
                      <ol>
                        <li
                          className=""
                          data-testid="entry-card-"
                          style={{ opacity: 1, transform: "none" }}
                        >
                          <div className="invisible relative z-10 h-0.5 w-0.5" />
                          <div
                            className="h-0 w-full overflow-hidden transition-all"
                            style={{ height: 0 }}
                          />
                          <span data-state="closed" data-disabled="">
                            <div className="relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 rounded-lg py-2 mb-3 shadow-sm bg-white">
                              <div
                                className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
                                style={{ touchAction: "none" }}
                                draggable="true"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={18}
                                  height={18}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-grip-vertical"
                                >
                                  <circle cx={9} cy={12} r={1} />
                                  <circle cx={9} cy={5} r={1} />
                                  <circle cx={9} cy={19} r={1} />
                                  <circle cx={15} cy={12} r={1} />
                                  <circle cx={15} cy={5} r={1} />
                                  <circle cx={15} cy={19} r={1} />
                                </svg>
                              </div>
                              <div className="">
                                <div className="flex gap-2 pl-0 pt-1">
                                  <button className="">
                                    <div
                                      data-testid="type-event"
                                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={16}
                                        height={16}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-calendar"
                                      >
                                        <path d="M8 2v4" />
                                        <path d="M16 2v4" />
                                        <rect
                                          width={18}
                                          height={18}
                                          x={3}
                                          y={4}
                                          rx={2}
                                        />
                                        <path d="M3 10h18" />
                                      </svg>
                                    </div>
                                  </button>
                                  <button className="shrink-0 rounded-full bg-orange-300 p-1 text-white hidden">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={18}
                                      height={18}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-pause"
                                    >
                                      <rect
                                        x={14}
                                        y={4}
                                        width={4}
                                        height={16}
                                        rx={1}
                                      />
                                      <rect
                                        x={6}
                                        y={4}
                                        width={4}
                                        height={16}
                                        rx={1}
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div className="w-full">
                                <div className="relative flex w-full items-center">
                                  <textarea
                                    autoComplete="off"
                                    id="4e718344-b248-4992-8a83-6bf7eafb5abc"
                                    className="w-full bg-transparent p-1 outline-none"
                                    placeholder="Untitled"
                                    style={{
                                      resize: "none",
                                      height: "32px !important",
                                    }}
                                    defaultValue={""}
                                  />
                                  <div className="ml-auto flex items-center">
                                    <button
                                      className="z-10 text-gray-400"
                                      id="expand-collapse"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-circle-chevron-down hidden"
                                      >
                                        <circle cx={12} cy={12} r={10} />
                                        <path d="m16 10-4 4-4-4" />
                                      </svg>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-circle-chevron-up"
                                      >
                                        <circle cx={12} cy={12} r={10} />
                                        <path d="m8 14 4-4 4 4" />
                                      </svg>
                                    </button>
                                    <div className="">
                                      <button
                                        type="button"
                                        id="radix-:rfp:"
                                        aria-haspopup="menu"
                                        aria-expanded="false"
                                        data-state="closed"
                                        className="cursor-pointer outline-none"
                                        data-testid="entry-more-button"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={20}
                                          height={20}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-ellipsis-vertical text-gray-400 dark:text-gray-500"
                                        >
                                          <circle cx={12} cy={12} r={1} />
                                          <circle cx={12} cy={5} r={1} />
                                          <circle cx={12} cy={19} r={1} />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex">
                                    <div className="ml-auto px-2">
                                      <div>
                                        <button
                                          type="button"
                                          aria-haspopup="dialog"
                                          aria-expanded="false"
                                          aria-controls="radix-:rfr:"
                                          data-state="closed"
                                          className="w-full border-0 text-sm px-0 text-foreground/90 block md:hidden"
                                        >
                                          <div
                                            className="block md:hidden"
                                            role="button"
                                            tabIndex={0}
                                          >
                                            <div className="flex items-center gap-1">
                                              <div>uncategorized</div>
                                              <div className="h-4 w-4 rounded bg-gray-200" />
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          type="button"
                                          aria-haspopup="dialog"
                                          aria-expanded="false"
                                          aria-controls="radix-:rfu:"
                                          data-state="closed"
                                          className="w-full rounded border-0 text-sm px-0 text-foreground/90 hidden md:block"
                                        >
                                          <div className="flex items-center gap-1">
                                            <div>uncategorized</div>
                                            <div className="h-4 w-4 rounded bg-gray-200" />
                                          </div>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </span>
                          <div className="" />
                          <div
                            className="mt-2 overflow-hidden pl-8"
                            style={{ height: "auto" }}
                          >
                            <div className="">
                              <ol>
                                <li
                                  className=""
                                  data-testid="entry-card-"
                                  style={{ opacity: 1, transform: "none" }}
                                >
                                  <div className="invisible relative z-10 h-0.5 w-0.5" />
                                  <div
                                    className="h-0 w-full overflow-hidden transition-all"
                                    style={{ height: 0 }}
                                  />
                                  <span data-state="closed" data-disabled="">
                                    <div className="relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 rounded-lg py-2 mb-3 shadow-sm bg-white/40 text-gray-300 dark:text-gray-700 dark:bg-gray-800/20">
                                      <div
                                        className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
                                        style={{ touchAction: "none" }}
                                        draggable="true"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={18}
                                          height={18}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-grip-vertical"
                                        >
                                          <circle cx={9} cy={12} r={1} />
                                          <circle cx={9} cy={5} r={1} />
                                          <circle cx={9} cy={19} r={1} />
                                          <circle cx={15} cy={12} r={1} />
                                          <circle cx={15} cy={5} r={1} />
                                          <circle cx={15} cy={19} r={1} />
                                        </svg>
                                      </div>
                                      <div className="">
                                        <div className="flex gap-2 pl-0 pt-1">
                                          <button className="">
                                            <div
                                              data-testid="type-checklist-done"
                                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-500"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={23}
                                                height={23}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-square-check-big"
                                              >
                                                <path d="m9 11 3 3L22 4" />
                                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                              </svg>
                                            </div>
                                          </button>
                                          <button className="shrink-0 rounded-full bg-orange-300 p-1 text-white hidden">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width={18}
                                              height={18}
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="lucide lucide-pause"
                                            >
                                              <rect
                                                x={14}
                                                y={4}
                                                width={4}
                                                height={16}
                                                rx={1}
                                              />
                                              <rect
                                                x={6}
                                                y={4}
                                                width={4}
                                                height={16}
                                                rx={1}
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                      <div className="w-full">
                                        <div className="relative flex w-full items-center">
                                          <textarea
                                            autoComplete="off"
                                            id="bdf34d55-4204-456f-a5f8-0baf347a2daf"
                                            className="w-full bg-transparent p-1 outline-none"
                                            placeholder="Untitled"
                                            style={{
                                              resize: "none",
                                              height: "32px !important",
                                            }}
                                            defaultValue={""}
                                          />
                                          <div className="ml-auto flex items-center">
                                            <button
                                              className="z-10 text-gray-400 hidden"
                                              id="expand-collapse"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-circle-chevron-down hidden"
                                              >
                                                <circle
                                                  cx={12}
                                                  cy={12}
                                                  r={10}
                                                />
                                                <path d="m16 10-4 4-4-4" />
                                              </svg>
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-circle-chevron-up"
                                              >
                                                <circle
                                                  cx={12}
                                                  cy={12}
                                                  r={10}
                                                />
                                                <path d="m8 14 4-4 4 4" />
                                              </svg>
                                            </button>
                                            <div className="">
                                              <button
                                                type="button"
                                                id="radix-:rg2:"
                                                aria-haspopup="menu"
                                                aria-expanded="false"
                                                data-state="closed"
                                                className="cursor-pointer outline-none"
                                                data-testid="entry-more-button"
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width={20}
                                                  height={20}
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth={2}
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  className="lucide lucide-ellipsis-vertical text-gray-400 dark:text-gray-500"
                                                >
                                                  <circle
                                                    cx={12}
                                                    cy={12}
                                                    r={1}
                                                  />
                                                  <circle
                                                    cx={12}
                                                    cy={5}
                                                    r={1}
                                                  />
                                                  <circle
                                                    cx={12}
                                                    cy={19}
                                                    r={1}
                                                  />
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <div className="flex">
                                            <div className="ml-auto px-2">
                                              <div>
                                                <button
                                                  type="button"
                                                  aria-haspopup="dialog"
                                                  aria-expanded="false"
                                                  aria-controls="radix-:rg4:"
                                                  data-state="closed"
                                                  className="w-full border-0 text-sm px-0 text-foreground/90 block md:hidden"
                                                >
                                                  <div
                                                    className="block md:hidden"
                                                    role="button"
                                                    tabIndex={0}
                                                  >
                                                    <div className="flex items-center gap-1">
                                                      <div>uncategorized</div>
                                                      <div className="h-4 w-4 rounded bg-gray-200" />
                                                    </div>
                                                  </div>
                                                </button>
                                                <button
                                                  type="button"
                                                  aria-haspopup="dialog"
                                                  aria-expanded="false"
                                                  aria-controls="radix-:rg7:"
                                                  data-state="closed"
                                                  className="w-full rounded border-0 text-sm px-0 text-foreground/90 hidden md:block"
                                                >
                                                  <div className="flex items-center gap-1">
                                                    <div>uncategorized</div>
                                                    <div className="h-4 w-4 rounded bg-gray-200" />
                                                  </div>
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </span>
                                  <div className="" />
                                  <div
                                    className="h-0 w-full overflow-hidden rounded-lg transition-all"
                                    style={{ height: 0 }}
                                  />
                                </li>
                              </ol>
                            </div>
                          </div>
                          <div
                            className="h-0 w-full overflow-hidden rounded-lg transition-all hidden"
                            style={{ height: 0 }}
                          />
                        </li>
                        <li
                          className=""
                          data-testid="entry-card-"
                          style={{ opacity: 1, transform: "none" }}
                        >
                          <div className="invisible relative z-10 h-0.5 w-0.5" />
                          <div
                            className="h-0 w-full overflow-hidden transition-all"
                            style={{ height: 0 }}
                          />
                          <span data-state="closed" data-disabled="">
                            <div className="relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 rounded-lg py-2 mb-3 shadow-sm bg-white/40 text-gray-300 dark:text-gray-700 dark:bg-gray-800/20">
                              <div
                                className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
                                style={{ touchAction: "none" }}
                                draggable="true"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={18}
                                  height={18}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-grip-vertical"
                                >
                                  <circle cx={9} cy={12} r={1} />
                                  <circle cx={9} cy={5} r={1} />
                                  <circle cx={9} cy={19} r={1} />
                                  <circle cx={15} cy={12} r={1} />
                                  <circle cx={15} cy={5} r={1} />
                                  <circle cx={15} cy={19} r={1} />
                                </svg>
                              </div>
                              <div className="">
                                <div className="flex gap-2 pl-0 pt-1">
                                  <button className="">
                                    <div
                                      data-testid="type-checklist-done"
                                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-500"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={23}
                                        height={23}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-square-check-big"
                                      >
                                        <path d="m9 11 3 3L22 4" />
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                      </svg>
                                    </div>
                                  </button>
                                  <button className="shrink-0 rounded-full bg-orange-300 p-1 text-white hidden">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={18}
                                      height={18}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-pause"
                                    >
                                      <rect
                                        x={14}
                                        y={4}
                                        width={4}
                                        height={16}
                                        rx={1}
                                      />
                                      <rect
                                        x={6}
                                        y={4}
                                        width={4}
                                        height={16}
                                        rx={1}
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div className="w-full">
                                <div className="relative flex w-full items-center">
                                  <textarea
                                    autoComplete="off"
                                    id="eac07b9e-7530-4ab2-a36e-2933c88becea"
                                    className="w-full bg-transparent p-1 outline-none"
                                    placeholder="Untitled"
                                    style={{
                                      resize: "none",
                                      height: "32px !important",
                                    }}
                                    defaultValue={""}
                                  />
                                  <div className="ml-auto flex items-center">
                                    <button
                                      className="z-10 text-gray-400 hidden"
                                      id="expand-collapse"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-circle-chevron-down hidden"
                                      >
                                        <circle cx={12} cy={12} r={10} />
                                        <path d="m16 10-4 4-4-4" />
                                      </svg>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-circle-chevron-up"
                                      >
                                        <circle cx={12} cy={12} r={10} />
                                        <path d="m8 14 4-4 4 4" />
                                      </svg>
                                    </button>
                                    <div className="">
                                      <button
                                        type="button"
                                        id="radix-:rgh:"
                                        aria-haspopup="menu"
                                        aria-expanded="false"
                                        data-state="closed"
                                        className="cursor-pointer outline-none"
                                        data-testid="entry-more-button"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={20}
                                          height={20}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-ellipsis-vertical text-gray-400 dark:text-gray-500"
                                        >
                                          <circle cx={12} cy={12} r={1} />
                                          <circle cx={12} cy={5} r={1} />
                                          <circle cx={12} cy={19} r={1} />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex">
                                    <div className="ml-auto px-2">
                                      <div>
                                        <button
                                          type="button"
                                          aria-haspopup="dialog"
                                          aria-expanded="false"
                                          aria-controls="radix-:rgj:"
                                          data-state="closed"
                                          className="w-full border-0 text-sm px-0 text-foreground/90 block md:hidden"
                                        >
                                          <div
                                            className="block md:hidden"
                                            role="button"
                                            tabIndex={0}
                                          >
                                            <div className="flex items-center gap-1">
                                              <div>uncategorized</div>
                                              <div className="h-4 w-4 rounded bg-gray-200" />
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          type="button"
                                          aria-haspopup="dialog"
                                          aria-expanded="false"
                                          aria-controls="radix-:rgm:"
                                          data-state="closed"
                                          className="w-full rounded border-0 text-sm px-0 text-foreground/90 hidden md:block"
                                        >
                                          <div className="flex items-center gap-1">
                                            <div>uncategorized</div>
                                            <div className="h-4 w-4 rounded bg-gray-200" />
                                          </div>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </span>
                          <div className="" />
                          <div
                            className="h-0 w-full overflow-hidden rounded-lg transition-all"
                            style={{ height: 0 }}
                          />
                        </li>
                      </ol>
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline h-10 px-4 py-2 cursor-pointer"
                        data-testid="add-entry"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-5" />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              className="flex items-center justify-between gap-1 rounded-lg bg-gray-200/50 p-2 text-sm hover:bg-gray-200 hover:shadow-lg dark:bg-gray-600 dark:hover:bg-gray-700"
              type="button"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="radix-:re9:"
              data-state="closed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus stroke-1"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add item
            </button>
          </div>
        </div>
        <div
          data-rfd-draggable-context-id=":rdt:"
          data-rfd-draggable-id="column-c6db5ae1-c1a8-4af6-ab8b-ee0b992299b1"
          className="w-screen shrink-0 rounded-lg px-5 md:min-w-[350px] md:max-w-md"
        >
          <div className="group mb-5 flex w-full items-center gap-2 rounded-lg bg-gradient-to-l from-white/50 to-white p-2 dark:from-gray-800 dark:to-gray-950">
            <div
              tabIndex={0}
              role="button"
              aria-describedby="rfd-hidden-text-:rdt:-hidden-text-:rdu:"
              data-rfd-drag-handle-draggable-id="column-c6db5ae1-c1a8-4af6-ab8b-ee0b992299b1"
              data-rfd-drag-handle-context-id=":rdt:"
              draggable="false"
              className="group-hover:visible"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-grip-vertical text-gray-400"
              >
                <circle cx={9} cy={12} r={1} />
                <circle cx={9} cy={5} r={1} />
                <circle cx={9} cy={19} r={1} />
                <circle cx={15} cy={12} r={1} />
                <circle cx={15} cy={5} r={1} />
                <circle cx={15} cy={19} r={1} />
              </svg>
            </div>
            <div className="-mb-[7px] w-full">
              <div className="group mb-[7px] w-full px-0">
                <span className="invisible text-gray-400 group-hover:visible">
                  Add label
                </span>
              </div>
            </div>
            <button
              className="ml-auto text-gray-500"
              type="button"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="radix-:reb:"
              data-state="closed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-trash2 stroke-1"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1={10} x2={10} y1={11} y2={17} />
                <line x1={14} x2={14} y1={11} y2={17} />
              </svg>
            </button>
          </div>
          <div className="w-full">
            <div
              data-rfd-droppable-id="droppable-column-c6db5ae1-c1a8-4af6-ab8b-ee0b992299b1"
              data-rfd-droppable-context-id=":rdt:"
              className=""
            >
              <div
                data-rfd-draggable-context-id=":rdt:"
                data-rfd-draggable-id="page-entry-22b35184-0284-41e0-b41d-32faffdf3bfe"
                className="mb-10 w-full rounded-lg border-t-4 bg-gradient-to-t px-5 pb-10 pt-2 border-rose-200 from-transparent via-rose-50 to-rose-100 dark:border-rose-800 dark:from-transparent dark:to-rose-950/50"
              >
                <div className="mb-2 flex w-full ">
                  <div
                    tabIndex={0}
                    role="button"
                    aria-describedby="rfd-hidden-text-:rdt:-hidden-text-:rdu:"
                    data-rfd-drag-handle-draggable-id="page-entry-22b35184-0284-41e0-b41d-32faffdf3bfe"
                    data-rfd-drag-handle-context-id=":rdt:"
                    draggable="false"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-grip-vertical text-gray-400"
                    >
                      <circle cx={9} cy={12} r={1} />
                      <circle cx={9} cy={5} r={1} />
                      <circle cx={9} cy={19} r={1} />
                      <circle cx={15} cy={12} r={1} />
                      <circle cx={15} cy={5} r={1} />
                      <circle cx={15} cy={19} r={1} />
                    </svg>
                  </div>
                  <div className="w-full">
                    <div className="-mb-[7px] w-full">
                      <div className="group mb-[7px] w-full px-0">
                        Goal
                        <span className="invisible text-gray-400 group-hover:visible hidden">
                          Add label
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="ml-auto text-gray-500"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:rer:"
                    data-state="closed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-trash2 stroke-1"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1={10} x2={10} y1={11} y2={17} />
                      <line x1={14} x2={14} y1={11} y2={17} />
                    </svg>
                  </button>
                </div>
                <div>
                  <div className="">
                    <div className="">
                      <ol>
                        <li
                          className=""
                          data-testid="entry-card-Your Goal In This Focus"
                          style={{ opacity: 1, transform: "none" }}
                        >
                          <div className="invisible relative z-10 h-0.5 w-0.5" />
                          <div
                            className="h-0 w-full overflow-hidden transition-all"
                            style={{ height: 0 }}
                          />
                          <span data-state="closed" data-disabled="">
                            <div className="relative flex items-start overflow-hidden dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 shadow-sm rounded bg-white p-2 mb-3">
                              <div
                                className="-mt-0 h-full cursor-pointer px-1 py-1 text-gray-300 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-400"
                                style={{ touchAction: "none" }}
                                draggable="true"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={18}
                                  height={18}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-grip-vertical"
                                >
                                  <circle cx={9} cy={12} r={1} />
                                  <circle cx={9} cy={5} r={1} />
                                  <circle cx={9} cy={19} r={1} />
                                  <circle cx={15} cy={12} r={1} />
                                  <circle cx={15} cy={5} r={1} />
                                  <circle cx={15} cy={19} r={1} />
                                </svg>
                              </div>
                              <div className="">
                                <div className="flex gap-2 pl-0 pt-1">
                                  <button className="">
                                    <div
                                      data-testid="type-checklist"
                                      className="mx-0.5 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 border-gray-500 bg-transparent text-gray-400"
                                    />
                                  </button>
                                  <button className="shrink-0 rounded-full bg-orange-300 p-1 text-white hidden">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={18}
                                      height={18}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-pause"
                                    >
                                      <rect
                                        x={14}
                                        y={4}
                                        width={4}
                                        height={16}
                                        rx={1}
                                      />
                                      <rect
                                        x={6}
                                        y={4}
                                        width={4}
                                        height={16}
                                        rx={1}
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div className="w-full">
                                <div className="relative flex w-full items-center">
                                  <textarea
                                    autoComplete="off"
                                    id="22b35184-0284-41e0-b41d-32faffdf3bfe"
                                    className="w-full bg-transparent p-1 outline-none"
                                    placeholder="Untitled"
                                    style={{
                                      resize: "none",
                                      height: "32px !important",
                                    }}
                                    defaultValue={"Your Goal In This Focus"}
                                  />
                                  <div className="ml-auto flex items-center">
                                    <button
                                      className="z-10 text-gray-400 hidden"
                                      id="expand-collapse"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-circle-chevron-down hidden"
                                      >
                                        <circle cx={12} cy={12} r={10} />
                                        <path d="m16 10-4 4-4-4" />
                                      </svg>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-circle-chevron-up"
                                      >
                                        <circle cx={12} cy={12} r={10} />
                                        <path d="m8 14 4-4 4 4" />
                                      </svg>
                                    </button>
                                    <div className="">
                                      <div className="ml-1 flex gap-1">
                                        <button
                                          type="button"
                                          id="radix-:rfa:"
                                          aria-haspopup="menu"
                                          aria-expanded="false"
                                          data-state="closed"
                                          className="outline-none"
                                          data-testid="entry-more-button"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={20}
                                            height={20}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-ellipsis-vertical text-gray-400 dark:text-gray-500"
                                          >
                                            <circle cx={12} cy={12} r={1} />
                                            <circle cx={12} cy={5} r={1} />
                                            <circle cx={12} cy={19} r={1} />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="mt-3 flex items-center gap-5">
                                    <div className="w-full">
                                      <div className="flex items-center gap-1">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-goal text-gray-500"
                                        >
                                          <path d="M12 13V2l8 4-8 4" />
                                          <path d="M20.561 10.222a9 9 0 1 1-12.55-5.29" />
                                          <path d="M8.002 9.997a5 5 0 1 0 8.9 2.02" />
                                        </svg>
                                        <div
                                          aria-valuemax={100}
                                          aria-valuemin={0}
                                          role="progressbar"
                                          data-state="indeterminate"
                                          data-max={100}
                                          className="relative h-4 w-full overflow-hidden rounded-full bg-secondary"
                                          indicatorcolor="bg-green-500"
                                        >
                                          <div
                                            data-state="indeterminate"
                                            data-max={100}
                                            className="h-full w-full flex-1 transition-all bg-green-500"
                                            style={{
                                              transform: "translateX(-20%)",
                                            }}
                                          />
                                        </div>
                                        <div>80.0%</div>
                                      </div>
                                      <div className="mt-2 flex items-center gap-2 text-xs">
                                        <div>
                                          Target
                                          <input
                                            type="number"
                                            className="flex w-full border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-8 rounded border-0 border-b outline-none focus-visible:outline-none focus-visible:ring-0 active:outline-none dark:bg-gray-900"
                                            size={12}
                                            defaultValue={10}
                                          />
                                        </div>
                                        <div>
                                          Current
                                          <input
                                            type="number"
                                            className="flex w-full border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-8 rounded border-0 border-b outline-none focus-visible:outline-none focus-visible:ring-0 active:outline-none dark:bg-gray-900"
                                            size={2}
                                            defaultValue={8}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="ml-auto flex shrink-0 items-center gap-2 text-sm text-gray-600 invisible">
                                      <div className="mr-2 h-14 w-14">
                                        <svg
                                          className="CircularProgressbar "
                                          viewBox="0 0 100 100"
                                          data-test-id="CircularProgressbar"
                                        >
                                          <path
                                            className="CircularProgressbar-trail"
                                            d="
M 50,50
m 0,-44
a 44,44 0 1 1 0,88
a 44,44 0 1 1 0,-88
    "
                                            strokeWidth={12}
                                            fillOpacity={0}
                                            style={{
                                              strokeDasharray:
                                                "276.46px, 276.46px",
                                              strokeDashoffset: 0,
                                            }}
                                          />
                                          <path
                                            className="CircularProgressbar-path"
                                            d="
M 50,50
m 0,-44
a 44,44 0 1 1 0,88
a 44,44 0 1 1 0,-88
    "
                                            strokeWidth={12}
                                            fillOpacity={0}
                                            style={{
                                              strokeDasharray:
                                                "276.46px, 276.46px",
                                            }}
                                          />
                                          <text
                                            className="CircularProgressbar-text"
                                            x={50}
                                            y={50}
                                            style={{
                                              fill: "rgb(90, 191, 159)",
                                              fontSize: 28,
                                            }}
                                          >
                                            0/0
                                          </text>
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </span>
                          <div className="" />
                          <div
                            className="h-0 w-full overflow-hidden rounded-lg transition-all"
                            style={{ height: 0 }}
                          />
                        </li>
                      </ol>
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline h-10 px-4 py-2 cursor-pointer"
                        data-testid="add-entry"
                      >
                        Add goal action item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                data-rfd-draggable-context-id=":rdt:"
                data-rfd-draggable-id="page-entry-4e1aece3-b64f-4620-b549-c0c772cd5eb4"
                className="mb-10 w-full rounded-lg border-t-4 bg-gradient-to-t px-5 pb-10 pt-2 dark:via-dark-900/20 border-green-200 from-transparent via-green-50 to-green-100 dark:border-green-900 dark:from-transparent dark:to-gray-950/80"
              >
                <div className="mb-2 flex w-full ">
                  <div
                    tabIndex={0}
                    role="button"
                    aria-describedby="rfd-hidden-text-:rdt:-hidden-text-:rdu:"
                    data-rfd-drag-handle-draggable-id="page-entry-4e1aece3-b64f-4620-b549-c0c772cd5eb4"
                    data-rfd-drag-handle-context-id=":rdt:"
                    draggable="false"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-grip-vertical text-gray-400"
                    >
                      <circle cx={9} cy={12} r={1} />
                      <circle cx={9} cy={5} r={1} />
                      <circle cx={9} cy={19} r={1} />
                      <circle cx={15} cy={12} r={1} />
                      <circle cx={15} cy={5} r={1} />
                      <circle cx={15} cy={19} r={1} />
                    </svg>
                  </div>
                  <div className="w-full">
                    <div className="-mb-[7px] w-full">
                      <div className="group mb-[7px] w-full px-0">
                        Task List
                        <span className="invisible text-gray-400 group-hover:visible hidden">
                          Add label
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="ml-auto text-gray-500"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:rev:"
                    data-state="closed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-trash2 stroke-1"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1={10} x2={10} y1={11} y2={17} />
                      <line x1={14} x2={14} y1={11} y2={17} />
                    </svg>
                  </button>
                </div>
                <div>
                  <div>
                    <div className="">
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline h-10 px-4 py-2 cursor-pointer"
                        data-testid="add-first-entry"
                      >
                        Add first item
                      </button>
                      <ol />
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-5" />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              className="flex items-center justify-between gap-1 rounded-lg bg-gray-200/50 p-2 text-sm hover:bg-gray-200 hover:shadow-lg dark:bg-gray-600 dark:hover:bg-gray-700"
              type="button"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="radix-:ref:"
              data-state="closed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus stroke-1"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add item
            </button>
          </div>
        </div>
        <div
          data-rfd-draggable-context-id=":rdt:"
          data-rfd-draggable-id="column-a6a89734-6498-4a4b-aa0a-7169ae939295"
          className="w-screen shrink-0 rounded-lg px-5 md:min-w-[350px] md:max-w-md"
        >
          <div className="group mb-5 flex w-full items-center gap-2 rounded-lg bg-gradient-to-l from-white/50 to-white p-2 dark:from-gray-800 dark:to-gray-950">
            <div
              tabIndex={0}
              role="button"
              aria-describedby="rfd-hidden-text-:rdt:-hidden-text-:rdu:"
              data-rfd-drag-handle-draggable-id="column-a6a89734-6498-4a4b-aa0a-7169ae939295"
              data-rfd-drag-handle-context-id=":rdt:"
              draggable="false"
              className="group-hover:visible"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-grip-vertical text-gray-400"
              >
                <circle cx={9} cy={12} r={1} />
                <circle cx={9} cy={5} r={1} />
                <circle cx={9} cy={19} r={1} />
                <circle cx={15} cy={12} r={1} />
                <circle cx={15} cy={5} r={1} />
                <circle cx={15} cy={19} r={1} />
              </svg>
            </div>
            <div className="-mb-[7px] w-full">
              <div className="group mb-[7px] w-full px-0">
                <span className="invisible text-gray-400 group-hover:visible">
                  Add label
                </span>
              </div>
            </div>
            <button
              className="ml-auto text-gray-500"
              type="button"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="radix-:reh:"
              data-state="closed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-trash2 stroke-1"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1={10} x2={10} y1={11} y2={17} />
                <line x1={14} x2={14} y1={11} y2={17} />
              </svg>
            </button>
          </div>
          <div className="w-full">
            <div
              data-rfd-droppable-id="droppable-column-a6a89734-6498-4a4b-aa0a-7169ae939295"
              data-rfd-droppable-context-id=":rdt:"
              className=""
            >
              <div
                data-rfd-draggable-context-id=":rdt:"
                data-rfd-draggable-id="page-entry-b5b5c181-eb8a-414b-9240-4558716333c1"
                className="mb-10 w-full rounded-lg border-t-4 bg-gradient-to-t px-5 pb-10 pt-2 dark:via-dark-900/20 border-green-200 from-transparent via-green-50 to-green-100 dark:border-green-900 dark:from-transparent dark:to-gray-950/80"
              >
                <div className="mb-2 flex w-full ">
                  <div
                    tabIndex={0}
                    role="button"
                    aria-describedby="rfd-hidden-text-:rdt:-hidden-text-:rdu:"
                    data-rfd-drag-handle-draggable-id="page-entry-b5b5c181-eb8a-414b-9240-4558716333c1"
                    data-rfd-drag-handle-context-id=":rdt:"
                    draggable="false"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-grip-vertical text-gray-400"
                    >
                      <circle cx={9} cy={12} r={1} />
                      <circle cx={9} cy={5} r={1} />
                      <circle cx={9} cy={19} r={1} />
                      <circle cx={15} cy={12} r={1} />
                      <circle cx={15} cy={5} r={1} />
                      <circle cx={15} cy={19} r={1} />
                    </svg>
                  </div>
                  <div className="w-full">
                    <div className="-mb-[7px] w-full">
                      <div className="group mb-[7px] w-full px-0">
                        Task List
                        <span className="invisible text-gray-400 group-hover:visible hidden">
                          Add label
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="ml-auto text-gray-500"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:rf3:"
                    data-state="closed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-trash2 stroke-1"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1={10} x2={10} y1={11} y2={17} />
                      <line x1={14} x2={14} y1={11} y2={17} />
                    </svg>
                  </button>
                </div>
                <div>
                  <div>
                    <div className="">
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline h-10 px-4 py-2 cursor-pointer"
                        data-testid="add-first-entry"
                      >
                        Add first item
                      </button>
                      <ol />
                    </div>
                  </div>
                </div>
              </div>
              <div
                data-rfd-draggable-context-id=":rdt:"
                data-rfd-draggable-id="page-entry-869a0370-df80-4bb5-99ac-c14ac44de3df"
                className="mb-10 w-full rounded-lg border-t-4 bg-gradient-to-t px-5 pb-10 pt-2 border-gray-300 from-transparent to-white dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
              >
                <div className="mb-2 flex w-full ">
                  <div
                    tabIndex={0}
                    role="button"
                    aria-describedby="rfd-hidden-text-:rdt:-hidden-text-:rdu:"
                    data-rfd-drag-handle-draggable-id="page-entry-869a0370-df80-4bb5-99ac-c14ac44de3df"
                    data-rfd-drag-handle-context-id=":rdt:"
                    draggable="false"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-grip-vertical text-gray-400"
                    >
                      <circle cx={9} cy={12} r={1} />
                      <circle cx={9} cy={5} r={1} />
                      <circle cx={9} cy={19} r={1} />
                      <circle cx={15} cy={12} r={1} />
                      <circle cx={15} cy={5} r={1} />
                      <circle cx={15} cy={19} r={1} />
                    </svg>
                  </div>
                  <div className="w-full">
                    <div className="-mb-[7px] w-full">
                      <div className="group mb-[7px] w-full px-0">
                        Note
                        <span className="invisible text-gray-400 group-hover:visible hidden">
                          Add label
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="ml-auto text-gray-500"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:rf7:"
                    data-state="closed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-trash2 stroke-1"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1={10} x2={10} y1={11} y2={17} />
                      <line x1={14} x2={14} y1={11} y2={17} />
                    </svg>
                  </button>
                </div>
                <div>
                  <div className="rounded-lg bg-transparent">
                    <style
                      data-mantine-styles="true"
                      dangerouslySetInnerHTML={{
                        __html:
                          '.bn-container{--mantine-scale: 1;--mantine-cursor-type: default;--mantine-color-scheme: light dark;--mantine-webkit-font-smoothing: antialiased;--mantine-moz-font-smoothing: grayscale;--mantine-color-white: #fff;--mantine-color-black: #000;--mantine-line-height: 1.55;--mantine-font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;--mantine-font-family-monospace: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;--mantine-font-family-headings: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;--mantine-heading-font-weight: 700;--mantine-heading-text-wrap: wrap;--mantine-radius-default: calc(0.25rem * var(--mantine-scale));--mantine-primary-color-filled: var(--mantine-color-blue-filled);--mantine-primary-color-filled-hover: var(--mantine-color-blue-filled-hover);--mantine-primary-color-light: var(--mantine-color-blue-light);--mantine-primary-color-light-hover: var(--mantine-color-blue-light-hover);--mantine-primary-color-light-color: var(--mantine-color-blue-light-color);--mantine-breakpoint-xs: 36em;--mantine-breakpoint-sm: 48em;--mantine-breakpoint-md: 62em;--mantine-breakpoint-lg: 75em;--mantine-breakpoint-xl: 88em;--mantine-spacing-xs: calc(0.625rem * var(--mantine-scale));--mantine-spacing-sm: calc(0.75rem * var(--mantine-scale));--mantine-spacing-md: calc(1rem * var(--mantine-scale));--mantine-spacing-lg: calc(1.25rem * var(--mantine-scale));--mantine-spacing-xl: calc(2rem * var(--mantine-scale));--mantine-font-size-xs: calc(0.75rem * var(--mantine-scale));--mantine-font-size-sm: calc(0.875rem * var(--mantine-scale));--mantine-font-size-md: calc(1rem * var(--mantine-scale));--mantine-font-size-lg: calc(1.125rem * var(--mantine-scale));--mantine-font-size-xl: calc(1.25rem * var(--mantine-scale));--mantine-line-height-xs: 1.4;--mantine-line-height-sm: 1.45;--mantine-line-height-md: 1.55;--mantine-line-height-lg: 1.6;--mantine-line-height-xl: 1.65;--mantine-shadow-xs: 0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, 0.05), 0 calc(0.0625rem * var(--mantine-scale)) calc(0.125rem * var(--mantine-scale)) rgba(0, 0, 0, 0.1);--mantine-shadow-sm: 0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 calc(0.625rem * var(--mantine-scale)) calc(0.9375rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale)), rgba(0, 0, 0, 0.04) 0 calc(0.4375rem * var(--mantine-scale)) calc(0.4375rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale));--mantine-shadow-md: 0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 calc(1.25rem * var(--mantine-scale)) calc(1.5625rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale)), rgba(0, 0, 0, 0.04) 0 calc(0.625rem * var(--mantine-scale)) calc(0.625rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale));--mantine-shadow-lg: 0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 calc(1.75rem * var(--mantine-scale)) calc(1.4375rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale)), rgba(0, 0, 0, 0.04) 0 calc(0.75rem * var(--mantine-scale)) calc(0.75rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale));--mantine-shadow-xl: 0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 calc(2.25rem * var(--mantine-scale)) calc(1.75rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale)), rgba(0, 0, 0, 0.04) 0 calc(1.0625rem * var(--mantine-scale)) calc(1.0625rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale));--mantine-radius-xs: calc(0.125rem * var(--mantine-scale));--mantine-radius-sm: calc(0.25rem * var(--mantine-scale));--mantine-radius-md: calc(0.5rem * var(--mantine-scale));--mantine-radius-lg: calc(1rem * var(--mantine-scale));--mantine-radius-xl: calc(2rem * var(--mantine-scale));--mantine-primary-color-0: var(--mantine-color-blue-0);--mantine-primary-color-1: var(--mantine-color-blue-1);--mantine-primary-color-2: var(--mantine-color-blue-2);--mantine-primary-color-3: var(--mantine-color-blue-3);--mantine-primary-color-4: var(--mantine-color-blue-4);--mantine-primary-color-5: var(--mantine-color-blue-5);--mantine-primary-color-6: var(--mantine-color-blue-6);--mantine-primary-color-7: var(--mantine-color-blue-7);--mantine-primary-color-8: var(--mantine-color-blue-8);--mantine-primary-color-9: var(--mantine-color-blue-9);--mantine-color-dark-0: #C9C9C9;--mantine-color-dark-1: #b8b8b8;--mantine-color-dark-2: #828282;--mantine-color-dark-3: #696969;--mantine-color-dark-4: #424242;--mantine-color-dark-5: #3b3b3b;--mantine-color-dark-6: #2e2e2e;--mantine-color-dark-7: #242424;--mantine-color-dark-8: #1f1f1f;--mantine-color-dark-9: #141414;--mantine-color-gray-0: #f8f9fa;--mantine-color-gray-1: #f1f3f5;--mantine-color-gray-2: #e9ecef;--mantine-color-gray-3: #dee2e6;--mantine-color-gray-4: #ced4da;--mantine-color-gray-5: #adb5bd;--mantine-color-gray-6: #868e96;--mantine-color-gray-7: #495057;--mantine-color-gray-8: #343a40;--mantine-color-gray-9: #212529;--mantine-color-red-0: #fff5f5;--mantine-color-red-1: #ffe3e3;--mantine-color-red-2: #ffc9c9;--mantine-color-red-3: #ffa8a8;--mantine-color-red-4: #ff8787;--mantine-color-red-5: #ff6b6b;--mantine-color-red-6: #fa5252;--mantine-color-red-7: #f03e3e;--mantine-color-red-8: #e03131;--mantine-color-red-9: #c92a2a;--mantine-color-pink-0: #fff0f6;--mantine-color-pink-1: #ffdeeb;--mantine-color-pink-2: #fcc2d7;--mantine-color-pink-3: #faa2c1;--mantine-color-pink-4: #f783ac;--mantine-color-pink-5: #f06595;--mantine-color-pink-6: #e64980;--mantine-color-pink-7: #d6336c;--mantine-color-pink-8: #c2255c;--mantine-color-pink-9: #a61e4d;--mantine-color-grape-0: #f8f0fc;--mantine-color-grape-1: #f3d9fa;--mantine-color-grape-2: #eebefa;--mantine-color-grape-3: #e599f7;--mantine-color-grape-4: #da77f2;--mantine-color-grape-5: #cc5de8;--mantine-color-grape-6: #be4bdb;--mantine-color-grape-7: #ae3ec9;--mantine-color-grape-8: #9c36b5;--mantine-color-grape-9: #862e9c;--mantine-color-violet-0: #f3f0ff;--mantine-color-violet-1: #e5dbff;--mantine-color-violet-2: #d0bfff;--mantine-color-violet-3: #b197fc;--mantine-color-violet-4: #9775fa;--mantine-color-violet-5: #845ef7;--mantine-color-violet-6: #7950f2;--mantine-color-violet-7: #7048e8;--mantine-color-violet-8: #6741d9;--mantine-color-violet-9: #5f3dc4;--mantine-color-indigo-0: #edf2ff;--mantine-color-indigo-1: #dbe4ff;--mantine-color-indigo-2: #bac8ff;--mantine-color-indigo-3: #91a7ff;--mantine-color-indigo-4: #748ffc;--mantine-color-indigo-5: #5c7cfa;--mantine-color-indigo-6: #4c6ef5;--mantine-color-indigo-7: #4263eb;--mantine-color-indigo-8: #3b5bdb;--mantine-color-indigo-9: #364fc7;--mantine-color-blue-0: #e7f5ff;--mantine-color-blue-1: #d0ebff;--mantine-color-blue-2: #a5d8ff;--mantine-color-blue-3: #74c0fc;--mantine-color-blue-4: #4dabf7;--mantine-color-blue-5: #339af0;--mantine-color-blue-6: #228be6;--mantine-color-blue-7: #1c7ed6;--mantine-color-blue-8: #1971c2;--mantine-color-blue-9: #1864ab;--mantine-color-cyan-0: #e3fafc;--mantine-color-cyan-1: #c5f6fa;--mantine-color-cyan-2: #99e9f2;--mantine-color-cyan-3: #66d9e8;--mantine-color-cyan-4: #3bc9db;--mantine-color-cyan-5: #22b8cf;--mantine-color-cyan-6: #15aabf;--mantine-color-cyan-7: #1098ad;--mantine-color-cyan-8: #0c8599;--mantine-color-cyan-9: #0b7285;--mantine-color-teal-0: #e6fcf5;--mantine-color-teal-1: #c3fae8;--mantine-color-teal-2: #96f2d7;--mantine-color-teal-3: #63e6be;--mantine-color-teal-4: #38d9a9;--mantine-color-teal-5: #20c997;--mantine-color-teal-6: #12b886;--mantine-color-teal-7: #0ca678;--mantine-color-teal-8: #099268;--mantine-color-teal-9: #087f5b;--mantine-color-green-0: #ebfbee;--mantine-color-green-1: #d3f9d8;--mantine-color-green-2: #b2f2bb;--mantine-color-green-3: #8ce99a;--mantine-color-green-4: #69db7c;--mantine-color-green-5: #51cf66;--mantine-color-green-6: #40c057;--mantine-color-green-7: #37b24d;--mantine-color-green-8: #2f9e44;--mantine-color-green-9: #2b8a3e;--mantine-color-lime-0: #f4fce3;--mantine-color-lime-1: #e9fac8;--mantine-color-lime-2: #d8f5a2;--mantine-color-lime-3: #c0eb75;--mantine-color-lime-4: #a9e34b;--mantine-color-lime-5: #94d82d;--mantine-color-lime-6: #82c91e;--mantine-color-lime-7: #74b816;--mantine-color-lime-8: #66a80f;--mantine-color-lime-9: #5c940d;--mantine-color-yellow-0: #fff9db;--mantine-color-yellow-1: #fff3bf;--mantine-color-yellow-2: #ffec99;--mantine-color-yellow-3: #ffe066;--mantine-color-yellow-4: #ffd43b;--mantine-color-yellow-5: #fcc419;--mantine-color-yellow-6: #fab005;--mantine-color-yellow-7: #f59f00;--mantine-color-yellow-8: #f08c00;--mantine-color-yellow-9: #e67700;--mantine-color-orange-0: #fff4e6;--mantine-color-orange-1: #ffe8cc;--mantine-color-orange-2: #ffd8a8;--mantine-color-orange-3: #ffc078;--mantine-color-orange-4: #ffa94d;--mantine-color-orange-5: #ff922b;--mantine-color-orange-6: #fd7e14;--mantine-color-orange-7: #f76707;--mantine-color-orange-8: #e8590c;--mantine-color-orange-9: #d9480f;--mantine-h1-font-size: calc(2.125rem * var(--mantine-scale));--mantine-h1-line-height: 1.3;--mantine-h1-font-weight: 700;--mantine-h2-font-size: calc(1.625rem * var(--mantine-scale));--mantine-h2-line-height: 1.35;--mantine-h2-font-weight: 700;--mantine-h3-font-size: calc(1.375rem * var(--mantine-scale));--mantine-h3-line-height: 1.4;--mantine-h3-font-weight: 700;--mantine-h4-font-size: calc(1.125rem * var(--mantine-scale));--mantine-h4-line-height: 1.45;--mantine-h4-font-weight: 700;--mantine-h5-font-size: calc(1rem * var(--mantine-scale));--mantine-h5-line-height: 1.5;--mantine-h5-font-weight: 700;--mantine-h6-font-size: calc(0.875rem * var(--mantine-scale));--mantine-h6-line-height: 1.5;--mantine-h6-font-weight: 700;}.bn-container[data-mantine-color-scheme="dark"]{--mantine-primary-color-contrast: var(--mantine-color-white);--mantine-color-bright: var(--mantine-color-white);--mantine-color-text: var(--mantine-color-dark-0);--mantine-color-body: var(--mantine-color-dark-7);--mantine-color-error: var(--mantine-color-red-8);--mantine-color-placeholder: var(--mantine-color-dark-3);--mantine-color-anchor: var(--mantine-color-blue-4);--mantine-color-default: var(--mantine-color-dark-6);--mantine-color-default-hover: var(--mantine-color-dark-5);--mantine-color-default-color: var(--mantine-color-white);--mantine-color-default-border: var(--mantine-color-dark-4);--mantine-color-dimmed: var(--mantine-color-dark-2);--mantine-color-dark-text: var(--mantine-color-dark-4);--mantine-color-dark-filled: var(--mantine-color-dark-8);--mantine-color-dark-filled-hover: var(--mantine-color-dark-9);--mantine-color-dark-light: rgba(46, 46, 46, 0.15);--mantine-color-dark-light-hover: rgba(46, 46, 46, 0.2);--mantine-color-dark-light-color: var(--mantine-color-dark-3);--mantine-color-dark-outline: var(--mantine-color-dark-4);--mantine-color-dark-outline-hover: rgba(66, 66, 66, 0.05);--mantine-color-gray-text: var(--mantine-color-gray-4);--mantine-color-gray-filled: var(--mantine-color-gray-8);--mantine-color-gray-filled-hover: var(--mantine-color-gray-9);--mantine-color-gray-light: rgba(134, 142, 150, 0.15);--mantine-color-gray-light-hover: rgba(134, 142, 150, 0.2);--mantine-color-gray-light-color: var(--mantine-color-gray-3);--mantine-color-gray-outline: var(--mantine-color-gray-4);--mantine-color-gray-outline-hover: rgba(206, 212, 218, 0.05);--mantine-color-red-text: var(--mantine-color-red-4);--mantine-color-red-filled: var(--mantine-color-red-8);--mantine-color-red-filled-hover: var(--mantine-color-red-9);--mantine-color-red-light: rgba(250, 82, 82, 0.15);--mantine-color-red-light-hover: rgba(250, 82, 82, 0.2);--mantine-color-red-light-color: var(--mantine-color-red-3);--mantine-color-red-outline: var(--mantine-color-red-4);--mantine-color-red-outline-hover: rgba(255, 135, 135, 0.05);--mantine-color-pink-text: var(--mantine-color-pink-4);--mantine-color-pink-filled: var(--mantine-color-pink-8);--mantine-color-pink-filled-hover: var(--mantine-color-pink-9);--mantine-color-pink-light: rgba(230, 73, 128, 0.15);--mantine-color-pink-light-hover: rgba(230, 73, 128, 0.2);--mantine-color-pink-light-color: var(--mantine-color-pink-3);--mantine-color-pink-outline: var(--mantine-color-pink-4);--mantine-color-pink-outline-hover: rgba(247, 131, 172, 0.05);--mantine-color-grape-text: var(--mantine-color-grape-4);--mantine-color-grape-filled: var(--mantine-color-grape-8);--mantine-color-grape-filled-hover: var(--mantine-color-grape-9);--mantine-color-grape-light: rgba(190, 75, 219, 0.15);--mantine-color-grape-light-hover: rgba(190, 75, 219, 0.2);--mantine-color-grape-light-color: var(--mantine-color-grape-3);--mantine-color-grape-outline: var(--mantine-color-grape-4);--mantine-color-grape-outline-hover: rgba(218, 119, 242, 0.05);--mantine-color-violet-text: var(--mantine-color-violet-4);--mantine-color-violet-filled: var(--mantine-color-violet-8);--mantine-color-violet-filled-hover: var(--mantine-color-violet-9);--mantine-color-violet-light: rgba(121, 80, 242, 0.15);--mantine-color-violet-light-hover: rgba(121, 80, 242, 0.2);--mantine-color-violet-light-color: var(--mantine-color-violet-3);--mantine-color-violet-outline: var(--mantine-color-violet-4);--mantine-color-violet-outline-hover: rgba(151, 117, 250, 0.05);--mantine-color-indigo-text: var(--mantine-color-indigo-4);--mantine-color-indigo-filled: var(--mantine-color-indigo-8);--mantine-color-indigo-filled-hover: var(--mantine-color-indigo-9);--mantine-color-indigo-light: rgba(76, 110, 245, 0.15);--mantine-color-indigo-light-hover: rgba(76, 110, 245, 0.2);--mantine-color-indigo-light-color: var(--mantine-color-indigo-3);--mantine-color-indigo-outline: var(--mantine-color-indigo-4);--mantine-color-indigo-outline-hover: rgba(116, 143, 252, 0.05);--mantine-color-blue-text: var(--mantine-color-blue-4);--mantine-color-blue-filled: var(--mantine-color-blue-8);--mantine-color-blue-filled-hover: var(--mantine-color-blue-9);--mantine-color-blue-light: rgba(34, 139, 230, 0.15);--mantine-color-blue-light-hover: rgba(34, 139, 230, 0.2);--mantine-color-blue-light-color: var(--mantine-color-blue-3);--mantine-color-blue-outline: var(--mantine-color-blue-4);--mantine-color-blue-outline-hover: rgba(77, 171, 247, 0.05);--mantine-color-cyan-text: var(--mantine-color-cyan-4);--mantine-color-cyan-filled: var(--mantine-color-cyan-8);--mantine-color-cyan-filled-hover: var(--mantine-color-cyan-9);--mantine-color-cyan-light: rgba(21, 170, 191, 0.15);--mantine-color-cyan-light-hover: rgba(21, 170, 191, 0.2);--mantine-color-cyan-light-color: var(--mantine-color-cyan-3);--mantine-color-cyan-outline: var(--mantine-color-cyan-4);--mantine-color-cyan-outline-hover: rgba(59, 201, 219, 0.05);--mantine-color-teal-text: var(--mantine-color-teal-4);--mantine-color-teal-filled: var(--mantine-color-teal-8);--mantine-color-teal-filled-hover: var(--mantine-color-teal-9);--mantine-color-teal-light: rgba(18, 184, 134, 0.15);--mantine-color-teal-light-hover: rgba(18, 184, 134, 0.2);--mantine-color-teal-light-color: var(--mantine-color-teal-3);--mantine-color-teal-outline: var(--mantine-color-teal-4);--mantine-color-teal-outline-hover: rgba(56, 217, 169, 0.05);--mantine-color-green-text: var(--mantine-color-green-4);--mantine-color-green-filled: var(--mantine-color-green-8);--mantine-color-green-filled-hover: var(--mantine-color-green-9);--mantine-color-green-light: rgba(64, 192, 87, 0.15);--mantine-color-green-light-hover: rgba(64, 192, 87, 0.2);--mantine-color-green-light-color: var(--mantine-color-green-3);--mantine-color-green-outline: var(--mantine-color-green-4);--mantine-color-green-outline-hover: rgba(105, 219, 124, 0.05);--mantine-color-lime-text: var(--mantine-color-lime-4);--mantine-color-lime-filled: var(--mantine-color-lime-8);--mantine-color-lime-filled-hover: var(--mantine-color-lime-9);--mantine-color-lime-light: rgba(130, 201, 30, 0.15);--mantine-color-lime-light-hover: rgba(130, 201, 30, 0.2);--mantine-color-lime-light-color: var(--mantine-color-lime-3);--mantine-color-lime-outline: var(--mantine-color-lime-4);--mantine-color-lime-outline-hover: rgba(169, 227, 75, 0.05);--mantine-color-yellow-text: var(--mantine-color-yellow-4);--mantine-color-yellow-filled: var(--mantine-color-yellow-8);--mantine-color-yellow-filled-hover: var(--mantine-color-yellow-9);--mantine-color-yellow-light: rgba(250, 176, 5, 0.15);--mantine-color-yellow-light-hover: rgba(250, 176, 5, 0.2);--mantine-color-yellow-light-color: var(--mantine-color-yellow-3);--mantine-color-yellow-outline: var(--mantine-color-yellow-4);--mantine-color-yellow-outline-hover: rgba(255, 212, 59, 0.05);--mantine-color-orange-text: var(--mantine-color-orange-4);--mantine-color-orange-filled: var(--mantine-color-orange-8);--mantine-color-orange-filled-hover: var(--mantine-color-orange-9);--mantine-color-orange-light: rgba(253, 126, 20, 0.15);--mantine-color-orange-light-hover: rgba(253, 126, 20, 0.2);--mantine-color-orange-light-color: var(--mantine-color-orange-3);--mantine-color-orange-outline: var(--mantine-color-orange-4);--mantine-color-orange-outline-hover: rgba(255, 169, 77, 0.05);}.bn-container[data-mantine-color-scheme="light"]{--mantine-primary-color-contrast: var(--mantine-color-white);--mantine-color-bright: var(--mantine-color-black);--mantine-color-text: #000;--mantine-color-body: #fff;--mantine-color-error: var(--mantine-color-red-6);--mantine-color-placeholder: var(--mantine-color-gray-5);--mantine-color-anchor: var(--mantine-color-blue-6);--mantine-color-default: var(--mantine-color-white);--mantine-color-default-hover: var(--mantine-color-gray-0);--mantine-color-default-color: var(--mantine-color-black);--mantine-color-default-border: var(--mantine-color-gray-4);--mantine-color-dimmed: var(--mantine-color-gray-6);--mantine-color-dark-text: var(--mantine-color-dark-filled);--mantine-color-dark-filled: var(--mantine-color-dark-6);--mantine-color-dark-filled-hover: var(--mantine-color-dark-7);--mantine-color-dark-light: rgba(46, 46, 46, 0.1);--mantine-color-dark-light-hover: rgba(46, 46, 46, 0.12);--mantine-color-dark-light-color: var(--mantine-color-dark-6);--mantine-color-dark-outline: var(--mantine-color-dark-6);--mantine-color-dark-outline-hover: rgba(46, 46, 46, 0.05);--mantine-color-gray-text: var(--mantine-color-gray-filled);--mantine-color-gray-filled: var(--mantine-color-gray-6);--mantine-color-gray-filled-hover: var(--mantine-color-gray-7);--mantine-color-gray-light: rgba(134, 142, 150, 0.1);--mantine-color-gray-light-hover: rgba(134, 142, 150, 0.12);--mantine-color-gray-light-color: var(--mantine-color-gray-6);--mantine-color-gray-outline: var(--mantine-color-gray-6);--mantine-color-gray-outline-hover: rgba(134, 142, 150, 0.05);--mantine-color-red-text: var(--mantine-color-red-filled);--mantine-color-red-filled: var(--mantine-color-red-6);--mantine-color-red-filled-hover: var(--mantine-color-red-7);--mantine-color-red-light: rgba(250, 82, 82, 0.1);--mantine-color-red-light-hover: rgba(250, 82, 82, 0.12);--mantine-color-red-light-color: var(--mantine-color-red-6);--mantine-color-red-outline: var(--mantine-color-red-6);--mantine-color-red-outline-hover: rgba(250, 82, 82, 0.05);--mantine-color-pink-text: var(--mantine-color-pink-filled);--mantine-color-pink-filled: var(--mantine-color-pink-6);--mantine-color-pink-filled-hover: var(--mantine-color-pink-7);--mantine-color-pink-light: rgba(230, 73, 128, 0.1);--mantine-color-pink-light-hover: rgba(230, 73, 128, 0.12);--mantine-color-pink-light-color: var(--mantine-color-pink-6);--mantine-color-pink-outline: var(--mantine-color-pink-6);--mantine-color-pink-outline-hover: rgba(230, 73, 128, 0.05);--mantine-color-grape-text: var(--mantine-color-grape-filled);--mantine-color-grape-filled: var(--mantine-color-grape-6);--mantine-color-grape-filled-hover: var(--mantine-color-grape-7);--mantine-color-grape-light: rgba(190, 75, 219, 0.1);--mantine-color-grape-light-hover: rgba(190, 75, 219, 0.12);--mantine-color-grape-light-color: var(--mantine-color-grape-6);--mantine-color-grape-outline: var(--mantine-color-grape-6);--mantine-color-grape-outline-hover: rgba(190, 75, 219, 0.05);--mantine-color-violet-text: var(--mantine-color-violet-filled);--mantine-color-violet-filled: var(--mantine-color-violet-6);--mantine-color-violet-filled-hover: var(--mantine-color-violet-7);--mantine-color-violet-light: rgba(121, 80, 242, 0.1);--mantine-color-violet-light-hover: rgba(121, 80, 242, 0.12);--mantine-color-violet-light-color: var(--mantine-color-violet-6);--mantine-color-violet-outline: var(--mantine-color-violet-6);--mantine-color-violet-outline-hover: rgba(121, 80, 242, 0.05);--mantine-color-indigo-text: var(--mantine-color-indigo-filled);--mantine-color-indigo-filled: var(--mantine-color-indigo-6);--mantine-color-indigo-filled-hover: var(--mantine-color-indigo-7);--mantine-color-indigo-light: rgba(76, 110, 245, 0.1);--mantine-color-indigo-light-hover: rgba(76, 110, 245, 0.12);--mantine-color-indigo-light-color: var(--mantine-color-indigo-6);--mantine-color-indigo-outline: var(--mantine-color-indigo-6);--mantine-color-indigo-outline-hover: rgba(76, 110, 245, 0.05);--mantine-color-blue-text: var(--mantine-color-blue-filled);--mantine-color-blue-filled: var(--mantine-color-blue-6);--mantine-color-blue-filled-hover: var(--mantine-color-blue-7);--mantine-color-blue-light: rgba(34, 139, 230, 0.1);--mantine-color-blue-light-hover: rgba(34, 139, 230, 0.12);--mantine-color-blue-light-color: var(--mantine-color-blue-6);--mantine-color-blue-outline: var(--mantine-color-blue-6);--mantine-color-blue-outline-hover: rgba(34, 139, 230, 0.05);--mantine-color-cyan-text: var(--mantine-color-cyan-filled);--mantine-color-cyan-filled: var(--mantine-color-cyan-6);--mantine-color-cyan-filled-hover: var(--mantine-color-cyan-7);--mantine-color-cyan-light: rgba(21, 170, 191, 0.1);--mantine-color-cyan-light-hover: rgba(21, 170, 191, 0.12);--mantine-color-cyan-light-color: var(--mantine-color-cyan-6);--mantine-color-cyan-outline: var(--mantine-color-cyan-6);--mantine-color-cyan-outline-hover: rgba(21, 170, 191, 0.05);--mantine-color-teal-text: var(--mantine-color-teal-filled);--mantine-color-teal-filled: var(--mantine-color-teal-6);--mantine-color-teal-filled-hover: var(--mantine-color-teal-7);--mantine-color-teal-light: rgba(18, 184, 134, 0.1);--mantine-color-teal-light-hover: rgba(18, 184, 134, 0.12);--mantine-color-teal-light-color: var(--mantine-color-teal-6);--mantine-color-teal-outline: var(--mantine-color-teal-6);--mantine-color-teal-outline-hover: rgba(18, 184, 134, 0.05);--mantine-color-green-text: var(--mantine-color-green-filled);--mantine-color-green-filled: var(--mantine-color-green-6);--mantine-color-green-filled-hover: var(--mantine-color-green-7);--mantine-color-green-light: rgba(64, 192, 87, 0.1);--mantine-color-green-light-hover: rgba(64, 192, 87, 0.12);--mantine-color-green-light-color: var(--mantine-color-green-6);--mantine-color-green-outline: var(--mantine-color-green-6);--mantine-color-green-outline-hover: rgba(64, 192, 87, 0.05);--mantine-color-lime-text: var(--mantine-color-lime-filled);--mantine-color-lime-filled: var(--mantine-color-lime-6);--mantine-color-lime-filled-hover: var(--mantine-color-lime-7);--mantine-color-lime-light: rgba(130, 201, 30, 0.1);--mantine-color-lime-light-hover: rgba(130, 201, 30, 0.12);--mantine-color-lime-light-color: var(--mantine-color-lime-6);--mantine-color-lime-outline: var(--mantine-color-lime-6);--mantine-color-lime-outline-hover: rgba(130, 201, 30, 0.05);--mantine-color-yellow-text: var(--mantine-color-yellow-filled);--mantine-color-yellow-filled: var(--mantine-color-yellow-6);--mantine-color-yellow-filled-hover: var(--mantine-color-yellow-7);--mantine-color-yellow-light: rgba(250, 176, 5, 0.1);--mantine-color-yellow-light-hover: rgba(250, 176, 5, 0.12);--mantine-color-yellow-light-color: var(--mantine-color-yellow-6);--mantine-color-yellow-outline: var(--mantine-color-yellow-6);--mantine-color-yellow-outline-hover: rgba(250, 176, 5, 0.05);--mantine-color-orange-text: var(--mantine-color-orange-filled);--mantine-color-orange-filled: var(--mantine-color-orange-6);--mantine-color-orange-filled-hover: var(--mantine-color-orange-7);--mantine-color-orange-light: rgba(253, 126, 20, 0.1);--mantine-color-orange-light-hover: rgba(253, 126, 20, 0.12);--mantine-color-orange-light-color: var(--mantine-color-orange-6);--mantine-color-orange-outline: var(--mantine-color-orange-6);--mantine-color-orange-outline-hover: rgba(253, 126, 20, 0.05);}\n  .bn-container[data-mantine-color-scheme="dark"] { --mantine-color-scheme: dark; }\n  .bn-container[data-mantine-color-scheme="light"] { --mantine-color-scheme: light; }\n',
                      }}
                    />
                    <style
                      data-mantine-styles="classes"
                      dangerouslySetInnerHTML={{
                        __html:
                          "@media (max-width: 35.99375em) {.mantine-visible-from-xs {display: none !important;}}@media (min-width: 36em) {.mantine-hidden-from-xs {display: none !important;}}@media (max-width: 47.99375em) {.mantine-visible-from-sm {display: none !important;}}@media (min-width: 48em) {.mantine-hidden-from-sm {display: none !important;}}@media (max-width: 61.99375em) {.mantine-visible-from-md {display: none !important;}}@media (min-width: 62em) {.mantine-hidden-from-md {display: none !important;}}@media (max-width: 74.99375em) {.mantine-visible-from-lg {display: none !important;}}@media (min-width: 75em) {.mantine-hidden-from-lg {display: none !important;}}@media (max-width: 87.99375em) {.mantine-visible-from-xl {display: none !important;}}@media (min-width: 88em) {.mantine-hidden-from-xl {display: none !important;}}",
                      }}
                    />
                    <div className="bn-container" data-color-scheme="light">
                      <div
                        contentEditable="true"
                        tabIndex={0}
                        translate="no"
                        className="ProseMirror bn-editor bn-default-styles"
                      >
                        <div
                          className="bn-block-group"
                          data-node-type="blockGroup"
                        >
                          <div
                            className="bn-block-outer"
                            data-node-type="blockOuter"
                            data-id="e8e1bcfd-c379-4641-a951-6f0ecaf84455"
                          >
                            <div
                              className="bn-block"
                              data-node-type="blockContainer"
                              data-id="e8e1bcfd-c379-4641-a951-6f0ecaf84455"
                            >
                              <div
                                className="bn-block-content"
                                data-content-type="paragraph"
                              >
                                <p className="bn-inline-content">
                                  Type something ssssssssssssssssssssssssshere
                                </p>
                              </div>
                            </div>
                          </div>
                          <div
                            className="bn-block-outer"
                            data-node-type="blockOuter"
                            data-id="da99bc10-7e1e-4b7a-8b4c-41c11d00dea7"
                          >
                            <div
                              className="bn-block"
                              data-node-type="blockContainer"
                              data-id="da99bc10-7e1e-4b7a-8b4c-41c11d00dea7"
                            >
                              <div
                                className="bn-block-content"
                                data-content-type="paragraph"
                              >
                                <p className="bn-inline-content">
                                  <br className="ProseMirror-trailingBreak" />
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-5" />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              className="flex items-center justify-between gap-1 rounded-lg bg-gray-200/50 p-2 text-sm hover:bg-gray-200 hover:shadow-lg dark:bg-gray-600 dark:hover:bg-gray-700"
              type="button"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="radix-:rel:"
              data-state="closed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus stroke-1"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add item
            </button>
          </div>
        </div>
        <button className="flex w-full max-w-xs shrink-0 items-center justify-start gap-1 rounded-lg bg-gray-200 p-2 px-5 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-plus shrink-0 stroke-1"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Add section
        </button>
      </div>
      {/*BATAS*/}

      <div className="min-h-screen bg-gray-200 p-3 dark:bg-gradient-to-tl dark:from-gray-950 dark:to-gray-900">
        <div className="mx-auto max-w-2xl">
          <section className="md:mb-5" id="breadcrumb">
            <div className="mb-2 flex w-full items-center gap-1">
              <a
                className="rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-500 dark:hover:text-gray-100"
                href="/mindfulday"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-left"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </a>
              <div className="flex items-center gap-2 text-2xl font-bold md:mb-0 ">
                <div className="flex items-center gap-2 text-2xl font-bold md:mb-0 ">
                  <div className="flex items-center rounded bg-gradient-to-tr from-yellow-200 to-yellow-400 p-1 text-yellow-900 shadow-sm hover:from-yellow-100 hover:to-yellow-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-badge"
                    >
                      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                    </svg>
                  </div>
                  Lencana Mingguan
                </div>
              </div>
            </div>
          </section>
          <div>
            <div className="flex items-center">
              <div className="mr-2 text-base font-bold">Pekan 49, 2024</div>
              <div className="mb-5 ml-auto flex items-center gap-2">
                <button className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-left"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mb-10 text-sm">
              Lencana mingguan akan direset setiap awal pekan. Mari lihat
              seberapa jauh kamu bisa fokus setiap minggunya.
            </div>
            <div className="mb-10 flex flex-col items-center">
              <div className="mb-2 text-xl">Lencana selanjutnya:</div>
              <div className="w-44">
                <img
                  alt="Weekly Marathoner"
                  loading="lazy"
                  width={180}
                  height={200}
                  decoding="async"
                  data-nimg={1}
                  src="/achievements/weekly-focus-prodigy.png"
                  style={{ color: "transparent" }}
                />
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-4 w-full overflow-hidden rounded-lg bg-gray-300">
                    <div
                      className="h-4 bg-gradient-to-tr from-green-300 to-green-500"
                      style={{ width: "20%" }}
                    />
                  </div>
                  <div>12/20</div>
                </div>
              </div>
            </div>
            <hr className="my-10 border-gray-300" />
            <div className="flex flex-wrap justify-center gap-4 gap-y-10">
              <div className="flex w-44 flex-col items-center">
                <img
                  alt="/mindfulday/achievements/weekly-focus-pioneer.png"
                  loading="lazy"
                  width={180}
                  height={200}
                  decoding="async"
                  data-nimg={1}
                  className=""
                  src="/achievements/weekly-focus-pioneer.png"
                  style={{ color: "transparent" }}
                />
                <div className="mt-2 text-sm">1 sesi fokus</div>
                <div className="mt-2 flex items-center">
                  <div className="rounded-full bg-green-400 p-1 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex w-44 flex-col items-center">
                <img
                  alt="/mindfulday/achievements/weekly-focus-apprentice.png"
                  loading="lazy"
                  width={180}
                  height={200}
                  decoding="async"
                  data-nimg={1}
                  className=""
                  src="/achievements/weekly-focus-apprentice.png"
                  style={{ color: "transparent" }}
                />
                <div className="mt-2 text-sm">10 sesi fokus</div>
                <div className="mt-2 flex items-center">
                  <div className="rounded-full bg-green-400 p-1 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex w-44 flex-col items-center">
                <img
                  alt="/mindfulday/achievements/weekly-focus-prodigy.png"
                  loading="lazy"
                  width={180}
                  height={200}
                  decoding="async"
                  data-nimg={1}
                  className="opacity-40 grayscale"
                  src="/achievements/weekly-focus-prodigy.png"
                  style={{ color: "transparent" }}
                />
                <div className="mt-2 text-sm">20 sesi fokus</div>
                <div className="mt-2 flex items-center invisible">
                  <div className="rounded-full bg-green-400 p-1 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex w-44 flex-col items-center">
                <img
                  alt="/mindfulday/achievements/weekly-focus-expert.png"
                  loading="lazy"
                  width={180}
                  height={200}
                  decoding="async"
                  data-nimg={1}
                  className="opacity-40 grayscale"
                  src="/achievements/weekly-focus-expert.png"
                  style={{ color: "transparent" }}
                />
                <div className="mt-2 text-sm">40 sesi fokus</div>
                <div className="mt-2 flex items-center invisible">
                  <div className="rounded-full bg-green-400 p-1 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex w-44 flex-col items-center">
                <img
                  alt="/mindfulday/achievements/weekly-focus-marathoner.png"
                  loading="lazy"
                  width={180}
                  height={200}
                  decoding="async"
                  data-nimg={1}
                  className="opacity-40 grayscale"
                  src="/achievements/weekly-focus-marathoner.png"
                  style={{ color: "transparent" }}
                />
                <div className="mt-2 text-sm">60 sesi fokus</div>
                <div className="mt-2 flex items-center invisible">
                  <div className="rounded-full bg-green-400 p-1 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex w-44 flex-col items-center">
                <img
                  alt="/mindfulday/achievements/weekly-focus-maestro.png"
                  loading="lazy"
                  width={180}
                  height={200}
                  decoding="async"
                  data-nimg={1}
                  className="opacity-40 grayscale"
                  src="/achievements/weekly-focus-maestro.png"
                  style={{ color: "transparent" }}
                />
                <div className="mt-2 text-sm">75 sesi fokus</div>
                <div className="mt-2 flex items-center invisible">
                  <div className="rounded-full bg-green-400 p-1 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex w-44 flex-col items-center">
                <img
                  alt="/mindfulday/achievements/weekly-haunted-by-burnout.png"
                  loading="lazy"
                  width={180}
                  height={200}
                  decoding="async"
                  data-nimg={1}
                  className="opacity-40 grayscale"
                  src="/achievements/weekly-haunted-by-burnout.png"
                  style={{ color: "transparent" }}
                />
                <div className="mt-2 text-sm">Lebih dari 80 sesi fokus</div>
                <div className="mt-2 flex items-center invisible">
                  <div className="rounded-full bg-green-400 p-1 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*BATAS*/}

      <div className="break-all pb-20 md:pb-0">
        <div className="w-full p-0">
          <div
            className="mb-2 flex items-center bg-gradient-to-r from-black to-red-400 bg-clip-text uppercase text-transparent dark:from-gray-300"
            style={{ opacity: 1, transform: "none" }}
          >
            <div>
              <div className="text-xs">Tasks Breakdown</div>
              <div className="">by parent task</div>
            </div>
            <div className="ml-auto flex gap-2 text-black dark:text-white">
              <button className="rounded p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-layout-grid stroke-1"
                >
                  <rect width={7} height={7} x={3} y={3} rx={1} />
                  <rect width={7} height={7} x={14} y={3} rx={1} />
                  <rect width={7} height={7} x={14} y={14} rx={1} />
                  <rect width={7} height={7} x={3} y={14} rx={1} />
                </svg>
              </button>
              <button className="rounded p-1 bg-gray-300 dark:bg-gray-400 dark:text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-list-collapse stroke-1"
                >
                  <path d="m3 10 2.5-2.5L3 5" />
                  <path d="m3 19 2.5-2.5L3 14" />
                  <path d="M10 6h11" />
                  <path d="M10 12h11" />
                  <path d="M10 18h11" />
                </svg>
              </button>
              <button className="rounded p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={22}
                  height={22}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-list-tree stroke-1"
                >
                  <path d="M21 12h-8" />
                  <path d="M21 6H8" />
                  <path d="M21 18h-8" />
                  <path d="M3 6v4c0 1.1.9 2 2 2h3" />
                  <path d="M3 10v6c0 1.1.9 2 2 2h3" />
                </svg>
              </button>
            </div>
          </div>
          <div className="hidden text-xs" style={{ opacity: 1 }}>
            No task breakdown.
          </div>
          <div
            className="mb-2 flex w-full flex-col flex-wrap rounded bg-gradient-to-r p-2 dark:from-indigo-950/80 dark:to-gray-800 from-indigo-100/80 to-gray-300 bg-orange-300"
            style={{ opacity: 1, transform: "none" }}
          >
            <div className="flex items-start gap-2">
              <div className="mt-1 h-4 w-4 shrink-0 rounded bg-orange-300" />
              <div className="">
                <div>Todo</div>
                <div className="text-xs">4 hrs 21 mins</div>
              </div>
              <div className="ml-auto shrink-0">82%</div>
            </div>
          </div>
          <div
            className="mb-2 flex w-full flex-col flex-wrap rounded bg-gradient-to-r p-2 dark:from-indigo-950/80 dark:to-gray-800 from-indigo-100/80 to-gray-300 bg-green-300"
            style={{ opacity: 1, transform: "none" }}
          >
            <div className="flex items-start gap-2">
              <div className="mt-1 h-4 w-4 shrink-0 rounded bg-green-300" />
              <div className="">
                <div>
                  Todo
                  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                </div>
                <div className="text-xs">50 mins</div>
              </div>
              <div className="ml-auto shrink-0">16%</div>
            </div>
          </div>
          <div
            className="mb-2 flex w-full flex-col flex-wrap rounded bg-gradient-to-r p-2 dark:from-indigo-950/80 dark:to-gray-800 from-indigo-100/80 to-gray-300 bg-blue-300"
            style={{ opacity: 1, transform: "none" }}
          >
            <div className="flex items-start gap-2">
              <div className="mt-1 h-4 w-4 shrink-0 rounded bg-blue-300" />
              <div className="">
                <div />
                <div className="text-xs">5 mins</div>
              </div>
              <div className="ml-auto shrink-0">2%</div>
            </div>
          </div>
        </div>
      </div>
      {/*BATAS*/}

      <div
        data-radix-scroll-area-viewport=""
        className="h-full w-full rounded-[inherit]"
        style={{ overflow: "hidden scroll" }}
      >
        <div style={{ minWidth: "100%", display: "table" }}>
          <table className="w-full border-l bg-white bg-gradient-to-r from-gray-100/70 to-white p-2 backdrop-blur dark:bg-blue-900 dark:from-gray-900/80 dark:to-gray-900 md:to-transparent">
            <thead className="sticky top-0 z-20 border-b bg-gradient-to-r from-gray-50/70 to-white backdrop-blur-sm dark:from-gray-900/80 dark:to-gray-950">
              <tr>
                <th className="w-20 p-3" colSpan={2}>
                  Time
                </th>
                <th className="border align-top text-sm font-normal">
                  <div className="flex flex-col justify-start p-2">
                    <div className="text-sm capitalize">Mon</div>
                    <div className="text-xs">02/12</div>
                  </div>
                </th>
                <th className="border align-top text-sm font-normal">
                  <div className="flex flex-col justify-start p-2">
                    <div className="text-sm capitalize">Tue</div>
                    <div className="text-xs">03/12</div>
                  </div>
                </th>
                <th className="border align-top text-sm font-normal">
                  <div className="flex flex-col justify-start p-2">
                    <div className="text-sm capitalize">Wed</div>
                    <div className="text-xs">04/12</div>
                  </div>
                </th>
                <th className="border align-top text-sm font-normal">
                  <div className="flex flex-col justify-start p-2">
                    <div className="text-sm capitalize">Thu</div>
                    <div className="text-xs">05/12</div>
                  </div>
                </th>
                <th className="border align-top text-sm font-normal">
                  <div className="flex flex-col justify-start p-2">
                    <div className="text-sm capitalize">Fri</div>
                    <div className="text-xs">06/12</div>
                  </div>
                </th>
                <th className="border align-top text-sm font-normal">
                  <div className="flex flex-col justify-start p-2 bg-gray-600/10">
                    <div className="text-sm capitalize">Sat</div>
                    <div className="text-xs">07/12</div>
                  </div>
                </th>
                <th className="border align-top text-sm font-normal">
                  <div className="flex flex-col justify-start p-2 bg-gray-600/10">
                    <div className="text-sm capitalize">Sun</div>
                    <div className="text-xs">08/12</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="">
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-00">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        00:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-00">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        00:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-01">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        01:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-01">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        01:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:rnt:"
                    data-state="closed"
                    style={{
                      top: "96%",
                      height: "30.6667%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-02">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        02:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:rnu:"
                    data-state="closed"
                    style={{
                      top: "66%",
                      height: "6.44444%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-blue-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:rnv:"
                    data-state="closed"
                    style={{
                      top: "73%",
                      height: "19.6111%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-green-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ro0:"
                    data-state="closed"
                    style={{
                      top: "23%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-02">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        02:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-03">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        03:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-03">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        03:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-04">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        04:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-04">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        04:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-05">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        05:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-05">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        05:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-sun"
                  >
                    <circle cx={12} cy={12} r={4} />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                </td>
                <td className="w-8">
                  <div className="hour-06">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        06:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-06">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        06:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-07">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        07:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ro1:"
                    data-state="closed"
                    style={{
                      top: "30%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-07">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        07:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-briefcase"
                  >
                    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    <rect width={20} height={14} x={2} y={6} rx={2} />
                  </svg>
                </td>
                <td className="w-8">
                  <div className="hour-08">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        08:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-08">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        08:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-09">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        09:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ro2:"
                    data-state="closed"
                    style={{
                      top: "26%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-09">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        09:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ro3:"
                    data-state="closed"
                    style={{
                      top: "20%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ro4:"
                    data-state="closed"
                    style={{
                      top: "16%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-10">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        10:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ro5:"
                    data-state="closed"
                    style={{
                      top: "46%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ro6:"
                    data-state="closed"
                    style={{
                      top: "3%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-10">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        10:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ro7:"
                    data-state="closed"
                    style={{
                      top: "70%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-11">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        11:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ro8:"
                    data-state="closed"
                    style={{
                      top: "16%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-11">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        11:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-utensils"
                  >
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                    <path d="M7 2v20" />
                    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                  </svg>
                </td>
                <td className="w-8">
                  <div className="hour-12">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        12:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-12">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        12:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-13">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        13:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-13">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        13:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:ro9:"
                    data-state="closed"
                    style={{
                      top: "80%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-14">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        14:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-14">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        14:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-green-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:roa:"
                    data-state="closed"
                    style={{
                      top: "93%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-15">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        15:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border">
                  <div
                    className="absolute mx-auto ml-[0.120rem] w-[93%] text-sm font-bold flex items-center gap-2 cursor-pointer rounded-[0.05rem] z-10 bg-gradient-to-l from-gray-900/10 to-gray-950/20 text-white bg-orange-300"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:rob:"
                    data-state="closed"
                    style={{
                      top: "46%",
                      height: "83.3333%",
                      opacity: 1,
                      transform: "none",
                    }}
                  >
                    <div className="line-clamp-1" />
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-sm text-xs font-normal">
                      <div className="text-xs" />
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-15">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        15:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-16">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        16:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-16">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        16:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-briefcase"
                  >
                    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    <rect width={20} height={14} x={2} y={6} rx={2} />
                  </svg>
                </td>
                <td className="w-8">
                  <div className="hour-17">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        17:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10">
                  <div className="absolute left-0 top-0 w-full border-t border-gray-400" />
                </td>
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-17">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        17:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-18">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        18:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-18">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        18:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-19">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        19:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-19">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        19:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-20">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        20:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-20">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        20:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-21">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        21:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-21">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        21:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-moon"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                </td>
                <td className="w-8">
                  <div className="hour-22">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        22:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-22">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        22:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-23">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200">
                        23:00
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
              <tr className="">
                <td className="w-5 shrink-0 px-1" />
                <td className="w-8">
                  <div className="hour-23">
                    <div className="z-40 -mt-0.5 flex w-20 flex-col items-start justify-end pb-0 pr-2 text-gray-500">
                      <div className="w-1/3 border-t border-gray-500 dark:border-gray-600" />
                      <div className="w-full border-t border-gray-500 pb-1 text-right text-xs dark:border-gray-600 dark:text-gray-200 invisible">
                        23:30
                      </div>
                    </div>
                  </div>
                </td>
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
                <td className="relative border border-gray-200 dark:border-border bg-gray-600/10" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/*BATAS*/}
      {/*BATAS*/}

      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl pb-20">
          <div className="mb-10 flex items-center pt-5">
            <div className="text-2xl font-bold">Daily Activity</div>
            <div className="ml-auto flex gap-2">
              <button className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-left"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-right"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
          <div id="main-card" className="sm:flex">
            <div
              className="flex w-full shrink-0 flex-col items-center justify-center rounded-lg bg-white p-5 shadow dark:bg-gray-950 dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 sm:w-64"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="mb-5">Thu 05/12/2024</div>
              <div
                className=" text-5xl font-bold"
                style={{ opacity: 1, transform: "none" }}
              >
                4
              </div>
              <div
                className="text-xl"
                style={{ opacity: 1, transform: "none" }}
              >
                sessions
              </div>
              <div className="mt-5 flex h-10 gap-1" />
              <div className="mt-5 text-center">M Nurhuda</div>
              <div style={{ opacity: 1, transform: "none" }}>2 hours</div>
            </div>
            <div className="relative w-full overflow-hidden py-3">
              <div
                className="h-full rounded-lg bg-gray-300 p-5 dark:bg-gradient-to-l dark:from-gray-950/80 dark:to-gray-800 md:max-w-xs md:rounded-l-none md:rounded-r-lg"
                style={{
                  opacity: 1,
                  transform: "translateX(0%) translateZ(0px)",
                }}
              >
                <div className="mb-5 gap-2 hidden">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white shadow-sm bg-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={32}
                      height={32}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-arrow-down"
                    >
                      <path d="M12 5v14" />
                      <path d="m19 12-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="">
                    Down 1 session compared to yesterday in the same hour.
                  </div>
                </div>
                <div className="">
                  <div className="mb-1 flex items-center gap-2 rounded px-2">
                    <div className="rounded bg-blue-400 p-1 text-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={18}
                        height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-list-todo"
                      >
                        <rect x={3} y={5} width={6} height={6} rx={1} />
                        <path d="m3 17 2 2 4-4" />
                        <path d="M13 6h8" />
                        <path d="M13 12h8" />
                        <path d="M13 18h8" />
                      </svg>
                    </div>
                    <div>3 planned</div>
                  </div>
                  <div className="mb-1 flex items-center gap-2 rounded px-2">
                    <div className="rounded bg-orange-400 p-1 text-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={18}
                        height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-clock"
                      >
                        <circle cx={12} cy={12} r={10} />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>1 worked on</div>
                  </div>
                  <div className="mb-1 flex items-center gap-2 rounded px-2">
                    <div className="rounded bg-green-400 p-1 text-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={18}
                        height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-square-check-big"
                      >
                        <path d="m9 11 3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    </div>
                    <div>0 marked as done</div>
                  </div>
                  <div className="mb-1 flex items-center gap-2 rounded px-2">
                    <div className="rounded bg-yellow-400 p-1 text-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={18}
                        height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-scroll"
                      >
                        <path d="M19 17V5a2 2 0 0 0-2-2H4" />
                        <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
                      </svg>
                    </div>
                    <div>0 notes taken</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="hour-indicator"
            className="mt-10 flex w-full gap-2 py-2 pb-10"
          >
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                0
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                3
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                6
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "48%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm block">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                9
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "52%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm block">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "50%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm block">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                12
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm block">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm block">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "50%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm block">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                15
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm block">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                18
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                21
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
            <div
              className="relative h-16 w-full"
              style={{ opacity: 1, transform: "none" }}
            >
              <div className="flex h-16 w-full items-end overflow-hidden rounded-xl bg-gray-300 dark:bg-gray-800">
                <div
                  className="h-full w-full bg-green-400"
                  style={{ height: "0%" }}
                />
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-power"
                >
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-utensils"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div className="absolute -top-6 w-full text-center text-xs md:text-sm hidden">
                <span>·</span>
              </div>
              <div className="absolute -bottom-5 w-full text-center text-xs text-black dark:text-gray-300 md:text-sm">
                <span>·</span>
              </div>
              <div className="absolute -bottom-7 w-full text-center text-xs md:text-sm hidden">
                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-green-400">
                  <div className="mx-auto h-1.5 w-1.5 animate-ping rounded-full bg-green-400" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex">
              <div className="ml-auto text-sm">Total: 4 sessions / 2 hours</div>
            </div>
            <ol>
              <li className="mb-5" style={{ opacity: 1, transform: "none" }}>
                <div className="relative flex rounded p-4 shadow-sm bg-gradient-to-r dark:from-indigo-950/80 dark:to-gray-800 from-indigo-100/80 to-gray-300 bg-orange-300">
                  <div>
                    <div className="text font-normal">Todo</div>
                    <div className="flex gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="h-3 w-3 shrink-0 rounded-full bg-green-400" />
                        4 sessions
                      </div>
                      <div className="flex items-center text-sm">(2 hrs)</div>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <div className="absolute right-3 text-lg font-bold text-gray-600 dark:text-gray-400 md:text-2xl">
                      100%
                    </div>
                  </div>
                </div>
                <div className="w-full px-1">
                  <div className="rounded-b bg-gray-100 py-3 dark:bg-gray-900">
                    <div className="w-32 pl-5 text-sm">
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <div className="mr-1 h-1 w-1 shrink-0 rounded-full bg-black dark:bg-gray-400" />
                        <div className="w-10 shrink-0">09:35</div>
                        <div className="w-5 shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={18}
                            height={18}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-arrow-right"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </div>
                        <div className="text-pretty w-10 shrink-0">10:00</div>
                      </div>
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <div className="mr-1 h-1 w-1 shrink-0 rounded-full bg-black dark:bg-gray-400" />
                        <div className="w-10 shrink-0">10:01</div>
                        <div className="w-5 shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={18}
                            height={18}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-arrow-right"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </div>
                        <div className="text-pretty w-10 shrink-0">10:26</div>
                      </div>
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <div className="mr-1 h-1 w-1 shrink-0 rounded-full bg-black dark:bg-gray-400" />
                        <div className="w-10 shrink-0">11:05</div>
                        <div className="w-5 shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={18}
                            height={18}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-arrow-right"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </div>
                        <div className="text-pretty w-10 shrink-0">11:30</div>
                      </div>
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <div className="mr-1 h-1 w-1 shrink-0 rounded-full bg-black dark:bg-gray-400" />
                        <div className="w-10 shrink-0">15:14</div>
                        <div className="w-5 shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={18}
                            height={18}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-arrow-right"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </div>
                        <div className="text-pretty w-10 shrink-0">15:39</div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ol>
            <div>
              <button
                className="items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 flex gap-2"
                type="button"
                aria-haspopup="dialog"
                aria-expanded="false"
                aria-controls="radix-:rm9:"
                data-state="closed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-download"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1={12} x2={12} y1={15} y2={3} />
                </svg>
                .TXT
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*BATAS*/}
      {/*BATAS*/}
      <>
        <div className="w-full max-w-full overflow-scroll bg-gray-100 pl-2 dark:bg-gray-900 md:grow md:pl-0">
          <div className="z-20 absolute left-1/2 top-0 -translate-x-1/2">
            <button
              data-state="closed"
              className="flex w-max items-center gap-1 rounded-b-lg bg-green-400 p-1 px-2 text-sm text-white md:p-1"
            >
              <a
                target="_blank"
                className="flex items-center gap-1"
                href="https://www.youtube.com/watch?v=KSGhkcfYgpE"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-play ml-1"
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
                Watch tutorial
              </a>
              <div className="ml-auto flex items-center" />
            </button>
            <button className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mx-auto p-5 pb-20 md:max-w-2xl">
          <div>
            <div className="flex items-center gap-2 pb-5">
              <a
                className="flex items-center gap-1 rounded-lg p-1.5 px-2 text-sm hover:bg-gray-200/50 dark:hover:bg-gray-700 bg-gray-200 dark:bg-gray-600"
                href="/mindfulday/focus-sprints"
              >
                <div className="rounded-xl bg-yellow-500 bg-gradient-to-tr from-orange-200 via-orange-200/50 to-orange-100/50 p-1 text-yellow-900 shadow hover:via-orange-300/60 hover:to-orange-200/50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-target"
                  >
                    <circle cx={12} cy={12} r={10} />
                    <circle cx={12} cy={12} r={6} />
                    <circle cx={12} cy={12} r={2} />
                  </svg>
                </div>
                <div className="text-sm font-bold">Sprints</div>
              </a>
              <a
                className="ml-auto flex items-center gap-1 rounded-lg p-1.5 px-2 text-sm hover:bg-gray-200/50 dark:hover:bg-gray-700"
                href="/mindfulday/focus-sprints/later"
              >
                <div className="rounded-xl bg-red-500 p-1 text-yellow-100 shadow hover:bg-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-alarm-clock-off"
                  >
                    <path d="M6.87 6.87a8 8 0 1 0 11.26 11.26" />
                    <path d="M19.9 14.25a8 8 0 0 0-9.15-9.15" />
                    <path d="m22 6-3-3" />
                    <path d="M6.26 18.67 4 21" />
                    <path d="m2 2 20 20" />
                    <path d="M4 4 2 6" />
                  </svg>
                </div>
                <div className="text-sm font-bold">Later</div>
              </a>
              <a
                className="flex items-center gap-1 rounded-lg p-1.5 px-2 text-sm hover:bg-gray-200/50 dark:hover:bg-gray-700"
                href="/mindfulday/focus-sprints/completed"
              >
                <div className="rounded-xl bg-lime-500 bg-gradient-to-tr from-lime-200 via-lime-200/50 to-lime-100/50 p-1 text-green-900 shadow hover:via-lime-300/60 hover:to-lime-200/50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-circle-check-big"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                </div>
                <div className="text-sm font-bold">Completed</div>
              </a>
            </div>
            <hr className="mb-5" />
          </div>
          <div>
            <div className="rounded-lg bg-background p-5">
              <div className="text-2xl font-bold">Active</div>
              <p className="text-muted-foreground">
                Sprint that you have committed to focus on right now until done!
              </p>
              <div className="mt-5" />
              <div className="mb-2 flex items-start gap-2 rounded-lg bg-gray-200 bg-gradient-to-l from-blue-50 to-indigo-100 p-2 text-black shadow">
                <div className="relative rounded-full bg-indigo-500 p-1 text-white">
                  <div className="relative z-20 rounded-full bg-indigo-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-goal"
                    >
                      <path d="M12 13V2l8 4-8 4" />
                      <path d="M20.561 10.222a9 9 0 1 1-12.55-5.29" />
                      <path d="M8.002 9.997a5 5 0 1 0 8.9 2.02" />
                    </svg>
                  </div>
                  <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center p-0.5">
                    <div className="h-full w-full animate-ping rounded-full bg-indigo-400 p-2" />
                  </div>
                </div>
                <div className="w-full">
                  <div>
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      aria-expanded="false"
                      aria-controls="radix-:rif:"
                      data-state="closed"
                    >
                      <div className="flex gap-1 text-sm text-black/60">
                        <div>Add to indicator</div>
                      </div>
                    </button>
                  </div>
                  <div className="flex">
                    <div className="">
                      <div>Untitled Sprint</div>
                      <div className="inline rounded bg-indigo-200 px-2 py-0.5 text-sm">
                        2/4 completed
                      </div>
                    </div>
                    <div className="ml-auto text-3xl">
                      <button data-state="closed">
                        <div className="flex items-center justify-center text-4xl">
                          🌼
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex w-full items-end">
                    <div>
                      <div className="flex gap-1 text-xs">
                        <div>
                          <div>Start date</div>
                          <div>04 Dec 2024</div>
                        </div>
                        <div>
                          {" "}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={18}
                            height={18}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-arrow-right"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </div>
                        <div>
                          <div>End date</div>
                          <div>18 Dec 2024</div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="mr-2 text-sm">10 days remaining</div>
                      <a
                        className="block rounded-xl bg-gray-800 px-2 text-sm text-white hover:bg-gray-900"
                        href="/mindfulday/focus-sprints/cc8d8eee-b216-4f21-84d1-c90d91add8c1"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-10" />
          </div>
          <div className="text-2xl font-bold">Upcoming</div>
          <p className="text-muted-foreground">
            Upcoming sprints are sprint that you plan to work on one after
            another.
          </p>
          <div className="mt-5 flex items-center">
            <div className="flex">
              <div>2 / 10</div>
              <button data-state="closed" className="mx-1 flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-info text-muted-foreground"
                >
                  <circle cx={12} cy={12} r={10} />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </button>
            </div>
            <button
              className="ml-auto flex cursor-pointer gap-1 rounded-full px-3 py-1.5 pr-4 transition-all hover:bg-gray-200 disabled:text-muted-foreground disabled:hover:bg-gray-100 dark:hover:bg-gray-700"
              data-state="delayed-open"
              aria-describedby="radix-:rii:"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              New sprint
            </button>
          </div>
          <div className="mt-5" />
          <ul>
            <div
              data-rfd-droppable-id="upcoming-list"
              data-rfd-droppable-context-id=":rij:"
              className="max-w-2xl"
            >
              <li
                data-rfd-draggable-context-id=":rij:"
                data-rfd-draggable-id="sprint-0"
              >
                <div style={{ opacity: 1, transform: "none" }}>
                  <div className="mb-2 rounded-lg bg-gray-200 bg-gradient-to-l from-white via-white to-orange-100 p-2 text-black shadow">
                    <div className="flex items-start gap-2">
                      <button
                        tabIndex={0}
                        role="button"
                        aria-describedby="rfd-hidden-text-:rij:-hidden-text-:rik:"
                        data-rfd-drag-handle-draggable-id="sprint-0"
                        data-rfd-drag-handle-context-id=":rij:"
                        draggable="false"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-grip-vertical text-gray-500"
                        >
                          <circle cx={9} cy={12} r={1} />
                          <circle cx={9} cy={5} r={1} />
                          <circle cx={9} cy={19} r={1} />
                          <circle cx={15} cy={12} r={1} />
                          <circle cx={15} cy={5} r={1} />
                          <circle cx={15} cy={19} r={1} />
                        </svg>
                      </button>
                      <div className="shrink-0 grow-0 rounded-full bg-orange-400 p-0.5 text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-target"
                        >
                          <circle cx={12} cy={12} r={10} />
                          <circle cx={12} cy={12} r={6} />
                          <circle cx={12} cy={12} r={2} />
                        </svg>
                      </div>
                      <div className="w-full">
                        <div>
                          <button
                            type="button"
                            aria-haspopup="dialog"
                            aria-expanded="false"
                            aria-controls="radix-:rin:"
                            data-state="closed"
                          >
                            <div className="flex gap-1 text-sm text-black/60">
                              <div>Add to indicator</div>
                            </div>
                          </button>
                        </div>
                        <div className="flex w-full">
                          <div className="-mb-[7px] w-full">
                            <div className="group mb-[7px] w-full px-0">
                              Untitled Sprint
                              <span className="invisible text-gray-400 group-hover:visible hidden">
                                Add label
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            id="radix-:rio:"
                            aria-haspopup="menu"
                            aria-expanded="false"
                            data-state="closed"
                            className="ml-auto"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={18}
                              height={18}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-ellipsis-vertical ml-auto text-gray-500"
                            >
                              <circle cx={12} cy={12} r={1} />
                              <circle cx={12} cy={5} r={1} />
                              <circle cx={12} cy={19} r={1} />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-3" />
                        <div className="flex w-full items-end">
                          <div className="text-xs">
                            Created at 04/12/2024 02:06
                          </div>
                          <div className="ml-auto">
                            <button
                              role="combobox"
                              className="flex items-center justify-between border-0 border-b border-gray-300 bg-transparent p-0.5 px-1 text-sm hover:bg-transparent hover:text-gray-900 dark:hover:text-gray-500"
                              aria-expanded="true"
                              aria-controls="content"
                              type="button"
                              aria-haspopup="dialog"
                              data-state="closed"
                            >
                              2 Weeks
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={18}
                                height={18}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevrons-up-down ml-2 shrink-0 opacity-50"
                              >
                                <path d="m7 15 5 5 5-5" />
                                <path d="m7 9 5-5 5 5" />
                              </svg>
                            </button>
                          </div>
                          <a
                            className="ml-2 block rounded-xl bg-gray-800 px-2 text-sm text-white hover:bg-gray-900"
                            href="/mindfulday/focus-sprints/1f283917-74b5-4247-b794-2c72e4fbea13"
                          >
                            Open
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex">
                      <div className="ml-auto" />
                    </div>
                  </div>
                </div>
              </li>
              <li
                data-rfd-draggable-context-id=":rij:"
                data-rfd-draggable-id="sprint-1"
              >
                <div style={{ opacity: 1, transform: "none" }}>
                  <div className="mb-2 rounded-lg bg-gray-200 bg-gradient-to-l from-white via-white to-orange-100 p-2 text-black shadow">
                    <div className="flex items-start gap-2">
                      <button
                        tabIndex={0}
                        role="button"
                        aria-describedby="rfd-hidden-text-:rij:-hidden-text-:rik:"
                        data-rfd-drag-handle-draggable-id="sprint-1"
                        data-rfd-drag-handle-context-id=":rij:"
                        draggable="false"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-grip-vertical text-gray-500"
                        >
                          <circle cx={9} cy={12} r={1} />
                          <circle cx={9} cy={5} r={1} />
                          <circle cx={9} cy={19} r={1} />
                          <circle cx={15} cy={12} r={1} />
                          <circle cx={15} cy={5} r={1} />
                          <circle cx={15} cy={19} r={1} />
                        </svg>
                      </button>
                      <div className="shrink-0 grow-0 rounded-full bg-orange-400 p-0.5 text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-target"
                        >
                          <circle cx={12} cy={12} r={10} />
                          <circle cx={12} cy={12} r={6} />
                          <circle cx={12} cy={12} r={2} />
                        </svg>
                      </div>
                      <div className="w-full">
                        <div>
                          <button
                            type="button"
                            aria-haspopup="dialog"
                            aria-expanded="false"
                            aria-controls="radix-:ris:"
                            data-state="closed"
                          >
                            <div className="flex gap-1 text-sm text-black/60">
                              <div>Add to indicator</div>
                            </div>
                          </button>
                        </div>
                        <div className="flex w-full">
                          <div className="-mb-[7px] w-full">
                            <div className="group mb-[7px] w-full px-0">
                              Untitled Sprint
                              <span className="invisible text-gray-400 group-hover:visible hidden">
                                Add label
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            id="radix-:rit:"
                            aria-haspopup="menu"
                            aria-expanded="false"
                            data-state="closed"
                            className="ml-auto"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={18}
                              height={18}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-ellipsis-vertical ml-auto text-gray-500"
                            >
                              <circle cx={12} cy={12} r={1} />
                              <circle cx={12} cy={5} r={1} />
                              <circle cx={12} cy={19} r={1} />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-3" />
                        <div className="flex w-full items-end">
                          <div className="text-xs">
                            Created at 04/12/2024 02:05
                          </div>
                          <div className="ml-auto">
                            <button
                              role="combobox"
                              className="flex items-center justify-between border-0 border-b border-gray-300 bg-transparent p-0.5 px-1 text-sm hover:bg-transparent hover:text-gray-900 dark:hover:text-gray-500"
                              aria-expanded="true"
                              aria-controls="content"
                              type="button"
                              aria-haspopup="dialog"
                              data-state="closed"
                            >
                              2 Weeks
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={18}
                                height={18}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevrons-up-down ml-2 shrink-0 opacity-50"
                              >
                                <path d="m7 15 5 5 5-5" />
                                <path d="m7 9 5-5 5 5" />
                              </svg>
                            </button>
                          </div>
                          <a
                            className="ml-2 block rounded-xl bg-gray-800 px-2 text-sm text-white hover:bg-gray-900"
                            href="/mindfulday/focus-sprints/3831cc02-e527-41a0-94b4-c7dd3a749177"
                          >
                            Open
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex">
                      <div className="ml-auto" />
                    </div>
                  </div>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </>
      {/*BATAS*/}
    </div>
  );
}

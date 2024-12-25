"use client"

import * as React from "react"
import {
  ChevronDownIcon,
} from "@radix-ui/react-icons"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BASE_URL } from "@/constants/appConfig"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Card,
} from "@/components/ui/card"

import {
  Link
} from "lucide-react"


import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatFileSize } from "@/lib/utils"






export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    // accessorKey: "doc",
    header: "Name",
    cell: ({ row }) => {
      const name: string = row.original?.data?.name as string;
      const iconLink: string = row.original?.data?.iconLink as string;
      const webViewLink: string = row.original?.data?.webViewLink as string;

      return (
        <a href={webViewLink} target="_blank"><div className="flex items-center space-x-2">

          {iconLink && (
            <img
              src={`${BASE_URL}/proxy-image?url=${iconLink}`}
              alt="Document icon"
              className="w-4 h-4 rounded"
              loading="lazy"
            />
          )}
          <span className="capitalize">{name}</span>
        </div></a>
      );
    },
  },
  {
    accessorKey: "Internal User",
    header: "Internal User",
    cell: ({ row }) => {
      const internalCount: number = (row.original?.data?.internalCount || []);
      const internalUsers: string[] = (row.original?.data?.internalUsers || []);
      return (
        <>
          {internalCount > 0
            ? <HoverCard>
              <HoverCardTrigger>
                <div className={`capitaliz cursor-pointer`}>{internalCount}</div>
              </HoverCardTrigger>
              <HoverCardContent>
                {internalUsers.map(item => (
                  <div className="capitaliz my-2">
                    {item}
                  </div>
                ))}
              </HoverCardContent>
            </HoverCard> : 0
          }
        </>
      );
    },
  },
  {
    accessorKey: "External User",
    header: "External User",
    cell: ({ row }) => {
      const externalCount: number = (row.original?.data?.externalCount || 0);
      const externalUsers: string[] = (row.original?.data?.externalUsers || []);
      return (
        <div className="mr-2">
          {externalCount > 0
            ? <HoverCard>
              <HoverCardTrigger>
                <div className={`capitalize text-rose-500 cursor-pointer font-bold`}>{externalCount}</div>
              </HoverCardTrigger>
              <HoverCardContent>
                {externalUsers.map(item => (
                  <div className="capitaliz text-yellow-600">
                    {item}
                  </div>
                ))}
              </HoverCardContent>
            </HoverCard> : 0
          }
        </div>
      );
    },
  },
  {
    accessorKey: "owners",
    header: "owners",
    cell: ({ row }) => {
      const userArray: any[] = (row.original?.data?.owners || []);
      const user = userArray[0]
      return (
        <div className="flex items-center space-x-2">
          {user?.photoLink && (
            <img
              src={`${BASE_URL}/proxy-image?url=${user?.photoLink}`}
              alt={user?.displayName}
              className="w-6 h-6 rounded-full"
              loading="lazy"
            />
          )}
          <span className="capitalize">{user?.displayName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "lastModifyingUser",
    header: "Last Modify",
    cell: ({ row }) => {
      const user: any = row.original?.data?.lastModifyingUser;
      return (
        <div className="flex items-center space-x-2">
          {user?.photoLink && (
            <img
              src={`${BASE_URL}/proxy-image?url=${user?.photoLink}`}
              alt={user?.displayName}
              className="w-6 h-6 rounded-full"
              loading="lazy"
            />
          )}
          <span className="capitalize">{user?.displayName}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const Filedata = row.original?.data


      // {
      //   "id": "16452530556112605674",
      //   "displayName": "ankit izardar",
      //   "type": "user",
      //   "kind": "drive#permission",
      //   "photoLink": "https://lh3.googleusercontent.com/a-/ALV-UjUaCmNaiEwcAYT0loaZAmvlgvnsc1oJy8Qcj3Gcyv5dj2ZN9wuuEg=s64",
      //   "emailAddress": "ankitizardar93@gmail.com",
      //   "role": "writer",
      //   "deleted": false,
      //   "pendingOwner": false
      // },

      return (
        <Sheet>
          <SheetTrigger>Details</SheetTrigger>
          <SheetContent className="w-[40vw] sm:w-[50vw]">
            <SheetHeader>
              <SheetTitle><a href={Filedata?.webViewLink} target="_blank"><div className="flex items-center space-x-2">
                {Filedata?.iconLink && (
                  <img
                    src={`${BASE_URL}/proxy-image?url=${Filedata?.iconLink}`}
                    alt="Document icon"
                    className="w-4 h-4 rounded"
                    loading="lazy"
                  />
                )}
                <span className="capitalize">{Filedata?.name}</span>
              </div></a></SheetTitle>
              <SheetDescription>
                <ScrollArea className="h-[85vh]">
                  <h5 className="my-3">Details</h5>
                  <div className="flex justify-center items-center">
                    <a href={Filedata?.webViewLink} target="_blank">
                      {
                        Filedata?.hasThumbnail &&
                        <img src={`${BASE_URL}/proxy-image?url=${Filedata?.thumbnailLink}&`} alt={Filedata.name} className="w-30 h-30 border border-white-600" />
                      }
                    </a>
                  </div>
                  <div className="my-3">
                    <div className="mt-2">
                      Version {Filedata?.version}
                    </div>
                    <div className="mt-2">
                      Size {formatFileSize(Filedata?.size)}
                    </div>
                    <div className="mt-2">
                      CreatedTime {(Filedata?.createdTime || "").split("T")[0]} {(Filedata?.createdTime || "").split("T")[1]}
                    </div>
                  </div>
                  <h5 className="my-3">Onwer</h5>
                  {(Filedata?.owners || []).map((editor: any) => (
                    <div key={editor.id} className="flex items-center space-x-4">
                      <img src={`${BASE_URL}/proxy-image?url=${editor.photoLink}`} alt={editor.displayName} className="w-6 h-6 rounded-full" />
                      <div>
                        <p className="text-sm font-semibold">{editor.displayName}</p>
                        <p className="text-xs text-gray-500">{editor.emailAddress}</p>
                        <p className="text-xs">{editor.role}</p>
                      </div>
                    </div>
                  ))}
                  <h5 className="my-3">Last Modifying User</h5>
                  {Filedata?.lastModifyingUser &&
                    <div className="flex items-center space-x-4">
                      <img src={`${BASE_URL}/proxy-image?url=${Filedata?.lastModifyingUser?.photoLink}`} alt={Filedata?.lastModifyingUser?.displayName} className="w-6 h-6 rounded-full" />
                      <div>
                        <p className="text-sm font-semibold">{Filedata?.lastModifyingUser?.displayName}</p>
                        <p className="text-xs text-gray-500">{Filedata?.lastModifyingUser?.emailAddress}</p>
                        <p className="text-xs">{Filedata?.lastModifyingUser?.role}</p>
                      </div>
                    </div>}
                  <h5 className="my-3">Permissions</h5>
                  {Filedata?.permissions?.length > 1 && <Card className="p-4">
                    <div className="space-y-4">
                      {(Filedata?.permissions || []).map((editor: any) => (
                        <>
                          {editor?.id == "anyoneWithLink" ?
                            <div key={editor.id} className="flex items-center space-x-2">
                              <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
                                <p className="font-bold flex items-center">Worrying <Link className="size-4 ms-2" /></p>
                                <p>Anyone with the link can {editor.role} this document.</p>
                              </div>
                            </div> : editor.role !== "owner" ?
                              <div key={editor.id} className="flex items-center space-x-4">
                                <img src={`${BASE_URL}/proxy-image?url=${editor.photoLink}`} alt={editor.displayName} className="w-6 h-6 rounded-full" />
                                <div>
                                  <p className="text-sm font-semibold">{editor.displayName}</p>
                                  <p className="text-xs text-gray-500">{editor.emailAddress}</p>
                                  <p className="text-xs">{editor.role}</p>
                                </div>
                              </div>
                              : <></>}
                        </>
                      ))}
                    </div>
                  </Card>}
                  {Object.entries(Filedata?.exportLinks || {})?.length && <h5 className="my-3 ">Export Links</h5>}
                  <div className="flex justify-center items-center flex-wrap gap-4">
                    {Object.entries(Filedata?.exportLinks || {}).map(([type, url], index) => (
                      <Button
                        key={type}
                        onClick={() => { window.open(url as string, '_blank') }}
                        className=""
                      >
                        {getExportFormat(url)}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )
    },
  },
]
interface DataTableProps {
  data: any[];
}

const getExportFormat = (url: any) => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("exportFormat");
};

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    // data: datalocal,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { EllipsisVertical } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BASE_URL } from "@/constants/appConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Link
} from "lucide-react"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";


const getExportFormat = (url: any) => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("exportFormat");
};


function CardCantainer({ data: Filedata }: any) {

    return (
        <div className="flex flex-col gap-x-4 gap-y-4">
            {(Filedata || []).map((file: any) => {
                const internalCount: number = (file?.data?.internalCount || []);
                const internalUsers: string[] = (file?.data?.internalUsers || []);


                const externalCount: number = (file?.data?.externalCount || 0);
                const externalUsers: string[] = (file?.data?.externalUsers || []);

                const name: string = file?.data?.name as string;
                const iconLink: string = file?.data?.iconLink as string;
                const webViewLink: string = file?.data?.webViewLink as string;
                const userArray: any[] = (file?.data?.owners || []);
                const user = userArray[0]

                const Modifyuser: any = file?.data?.lastModifyingUser;

                return <div className="flex w-full">
                    <div className="flex items-start space-x-4 w-12 ">
                        {user?.photoLink && (
                            <img
                                src={`${BASE_URL}/proxy-image?url=${user?.photoLink}`}
                                alt={user?.displayName}
                                className="w-10 h-10 rounded-full"
                                loading="lazy"
                            />
                        )}
                    </div>
                    <div className="w-full">
                        <div className="flex mb-2">
                            <h3 className="capitalize">{user?.displayName}</h3>
                            <div className="ms-2">
                                Lest Modify By
                            </div>
                            <div className="flex items-center space-x-2 ms-2">
                                {Modifyuser?.photoLink && (
                                    <img
                                        src={`${BASE_URL}/proxy-image?url=${Modifyuser?.photoLink}`}
                                        alt={Modifyuser?.displayName}
                                        className="w-5 h-5 rounded-full"
                                        loading="lazy"
                                    />
                                )}
                                <span className="capitalize">{Modifyuser?.displayName}</span>
                            </div>
                        </div>
                        <Card className="w-full">
                            <CardHeader className="p-4">
                                <div className="flex justify-between">
                                    <div>
                                        <CardTitle>
                                            <a href={webViewLink} target="_blank"><div className="flex items-center space-x-2 w-[70%]">
                                                {iconLink && (
                                                    <img
                                                        src={`${BASE_URL}/proxy-image?url=${iconLink}`}
                                                        alt="Document icon"
                                                        className="w-8 h-8 p-1 rounded-md border-2"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <div className="capitalize truncate" style={{ width: "60vw" }}>{name}</div>
                                            </div>
                                            </a>
                                        </CardTitle>
                                    </div>
                                    <div>
                                        <Sheet>
                                            <SheetTrigger><TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger><EllipsisVertical size={20} /></TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Details</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            </SheetTrigger>
                                            <SheetContent className="w-[40vw] sm:w-[50vw]">
                                                <SheetHeader>
                                                    <SheetTitle><a href={file?.data?.webViewLink} target="_blank"><div className="flex items-center space-x-2">
                                                        {file?.data?.iconLink && (
                                                            <img
                                                                src={`${BASE_URL}/proxy-image?url=${file?.data?.iconLink}`}
                                                                alt="Document icon"
                                                                className="w-4 h-4 rounded"
                                                                loading="lazy"
                                                            />
                                                        )}
                                                        <span className="capitalize">{file?.data?.name}</span>
                                                    </div></a></SheetTitle>
                                                    <SheetDescription>
                                                        <ScrollArea className="h-[85vh]">
                                                            <h5 className="my-3">Details</h5>
                                                            <div className="flex justify-center items-center">
                                                                <a href={file?.data?.webViewLink} target="_blank">
                                                                    {
                                                                        file?.data?.hasThumbnail &&
                                                                        <img src={`${BASE_URL}/proxy-image?url=${file?.data?.thumbnailLink}`} alt={file.name} className="w-30 h-30 border border-white-600" />
                                                                    }
                                                                </a>
                                                            </div>
                                                            <div className="my-3">
                                                                <div className="mt-2">
                                                                    Version {file?.data?.version}
                                                                </div>
                                                                <div className="mt-2">
                                                                    Size {formatFileSize(file?.data?.size)}
                                                                </div>
                                                                <div className="mt-2">
                                                                    CreatedTime {(file?.data?.createdTime || "").split("T")[0]} {(file?.data?.createdTime || "").split("T")[1]}
                                                                </div>
                                                            </div>
                                                            <h5 className="my-3">Onwer</h5>
                                                            {(file?.data?.owners || []).map((editor: any) => (
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
                                                            {file?.data?.lastModifyingUser &&
                                                                <div className="flex items-center space-x-4">
                                                                    <img src={`${BASE_URL}/proxy-image?url=${file?.data?.lastModifyingUser?.photoLink}`} alt={file?.data?.lastModifyingUser?.displayName} className="w-6 h-6 rounded-full" />
                                                                    <div>
                                                                        <p className="text-sm font-semibold">{file?.data?.lastModifyingUser?.displayName}</p>
                                                                        <p className="text-xs text-gray-500">{file?.data?.lastModifyingUser?.emailAddress}</p>
                                                                        <p className="text-xs">{file?.data?.lastModifyingUser?.role}</p>
                                                                    </div>
                                                                </div>}
                                                            <h5 className="my-3">Permissions</h5>
                                                            {file?.data?.permissions?.length > 1 && <Card className="p-4">
                                                                <div className="space-y-4">
                                                                    {(file?.data?.permissions || []).map((editor: any) => (
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
                                                            {Object.entries(file?.data?.exportLinks || {})?.length && <h5 className="my-3 ">Export Links</h5>}
                                                            <div className="flex justify-center items-center flex-wrap gap-4">
                                                                {Object.entries(file?.data?.exportLinks || {}).map(([type, url], index) => (
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
                                    </div>
                                </div>
                                <div>
                                    <div className="flex pe-8">
                                        <div className="flex pe-8">

                                            Internal User {internalCount > 0
                                                ? <HoverCard>
                                                    <HoverCardTrigger>
                                                        <div className={`capitaliz cursor-pointer px-2`}>{internalCount}</div>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent>
                                                        {internalUsers.map((item, index) => (
                                                            <div className="capitaliz my-2 px-2">
                                                                {index + 1 + "."} {item}
                                                            </div>
                                                        ))}
                                                    </HoverCardContent>
                                                </HoverCard> : <div className="px-2">0</div>
                                            }
                                        </div>
                                        <div className="flex pe-8">

                                            external User {externalCount > 0
                                                ? <HoverCard>
                                                    <HoverCardTrigger>
                                                        <div className={`capitalize text-rose-500 cursor-pointer font-bold px-2`}>{externalCount}</div>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent>
                                                        {externalUsers.map((item, index) => (
                                                            <div className="capitaliz text-yellow-600 px-2">
                                                                {index + 1 + "."} {item}
                                                            </div>
                                                        ))}
                                                    </HoverCardContent>
                                                </HoverCard> : <div className="px-2">0</div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            {/* <CardFooter className="p-4">

                            </CardFooter> */}
                        </Card>
                    </div>
                </div>
            })
            }
            {/* <div className="flex justify-between">
                 <div className="flex items-center space-x-2">
                          {user?.photoLink && (
                            <img
                              src={`${BASE_URL}/proxy-image?url=${user?.photoLink}`}
                              alt={user?.displayName}
                              className="w-6 h-6 rounded-full"
                              loading="lazy"
                            />
                          )}
                </div>
            </div>
            <span </span>
           */}
        </div>
    );
}

export default CardCantainer;

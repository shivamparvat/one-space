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
import Drive from "./Drive";
import Email from "./Email";


const getExportFormat = (url: any) => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("exportFormat");
};


function CardCantainer({ data: Filedata }: any) {

    return (
        <div className="flex flex-col gap-x-4 gap-y-4">
            {(Filedata || []).map((file: any) => {
                if(file?.app_name == "GOOGLE_DRIVE"){
                    return <Drive file={file}/>
                }else if(file?.app_name == "GMAIL"){
                    return <Email file={file}/>
                }else {
                    
                }
            })}
        </div>
    );
}

export default CardCantainer;

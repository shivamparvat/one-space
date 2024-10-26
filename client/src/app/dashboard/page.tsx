"use client"

import React, {useEffect, useState} from "react"

import {Avatar, AvatarFallback} from "@radix-ui/react-avatar"
// import initials from "initials"
import {DollarSign, Users, CreditCard, Activity} from "lucide-react"
import {DateRange} from "react-day-picker"
// import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

// import { DateRangePicker } from "@/components/DateRangePicker"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import axios from "axios"
import {DataTable} from "./components/table"
// import { salesData, overviewChartData } from "@/constants/dummyData"
interface FileMetadata {
  Name: string;
  Owner: string;
  OwnerEmail: string;
  MimeType: string;
  Size: number;
  CreatedTime: string;
  ModifiedTime: string;
  TotalUsers: number | null;
  InternalUsers: number | null;
  ExternalUsers: number | null;
}


export default function Page() {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(undefined)

  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchFiles = async () => {
  //     try {
  //       const response = await axios.get('http://localhost:5000/api/v1/file/list');
  //       setFiles((response.data?.data || [])); 
  //      } catch (err) {
  //       setError('Failed to fetch files');
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchFiles();
  // }, []);

  console.log(files[0]?.files || [], "filesfiles")
  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-4">
        <div className="flex-col items-center justify-between space-y-2 md:flex md:flex-row">
          <h2 className="text-3xl font-bold tracking-tight">Access Control</h2>
        </div>

        <DataTable data={files[0]?.files || []} />
      </div>
    </div>
  )
}
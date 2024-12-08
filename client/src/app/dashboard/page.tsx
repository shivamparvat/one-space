"use client"

import React, {useEffect, useState} from "react"

import {Avatar, AvatarFallback} from "@radix-ui/react-avatar"
// import initials from "initials"
import {DollarSign, Users, CreditCard, Activity, Bold, Turtle} from "lucide-react"
import {DateRange} from "react-day-picker"
// import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

// import { DateRangePicker } from "@/components/DateRangePicker"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import axios from "axios"
import {DataTable} from "./components/table"
import RagOutput from "./components/RagOutput"
import { useSelector, useStore } from "react-redux"
import { RootState } from "@/redux/store"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
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

export interface RagOutputType {
  query: string;
  answer: string;
  results: string[];
}

export default function Page() {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<RagOutputType| null>(null);
  const [files, setFiles] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.login.userToken);
  const [aiToggle, setAiToggle] = useState(false)

    
    const fetchFiles = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/file/list?search=${aiToggle?"":searchQuery}`,{}, {
          headers: {
            Authorization: `Bearer ${token?.token}`,
          },
        });
        setFiles((response.data?.data || [])); 
      } catch (err) {
        setError('Failed to fetch files');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  const AiSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL+`/api/v1/ai/search`, {
        params: { searchQuery },
      });
      setData(response?.data?.result);
      setFiles((response.data?.result?.results || [])); 
    } catch (error) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  function onSearch(){
    setData(null)
    setFiles([])
    if(aiToggle && searchQuery){
      AiSearch()
    }
    fetchFiles()
  }


  useEffect(() => {
    fetchFiles();
  }, [token]);



  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-4">
        <div className="flex-col items-center justify-between space-y-2 md:flex md:flex-row">
          <h2 className="text-3xl font-bold tracking-tight">Access Control</h2>
        </div>

        <div className="flex space-x-2">
       <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter your query..."
          className="flex-grow"
        />
       <Button onClick={()=>{onSearch()}} disabled={loading}>
         {loading ? 'Searching...' : 'Search'}
       </Button>
       <Toggle onPressedChange={()=>setAiToggle(pre=>!pre)} pressed={aiToggle} variant="outline" aria-label="Toggle italic" >
        AI
      </Toggle>
     </div>
        
        <RagOutput query={searchQuery} setQuery={setSearchQuery} data={data} setData={setData}/>
        <DataTable data={files|| []} />
      </div>
    </div>
  )
}
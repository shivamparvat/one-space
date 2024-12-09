"use client"

import React, {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import axios from "axios"
import {DataTable} from "./components/table"
import RagOutput from "./components/RagOutput"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { Card } from "@/components/ui/card"

export interface RagOutputType {
  query: string;
  answer: string;
  results: string[];
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<RagOutputType| null>(null);
  const [recommendation, setRecommendation] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
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
    
    const autocompleteSearch = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/file/autocomplete?query=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${token?.token}`,
          },
        });

        setRecommendation((response.data?.recommendations || [])); 
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
        headers: {
          Authorization: `Bearer ${token?.token}`,
        },
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


  useEffect(() => {
    if(searchQuery){ 
      autocompleteSearch();
    }
  }, [token,searchQuery]);


  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-4">
        <div className="flex-col items-center justify-between space-y-2 md:flex md:flex-row">
          <h2 className="text-3xl font-bold tracking-tight">Access Control</h2>
        </div>

        <div className="flex space-x-2">
          <div className="w-full relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your query..."
              className="flex-grow"
            />
            {recommendation.length > 0 && (
              <Card className="p-2 absolute bg-white" style={{backgroundColor:"#fff !important"}}>
                <ul className="divide-y divide-gray-1000">
                  {recommendation.map((item, index) => (
                    <li
                      key={item?._id}
                      className="p-2 bg-white hover:bg-gray-100 cursor-pointer"
                      onClick={() => setSearchQuery(item.filename)} // Set query when clicked
                    >
                      {item?.filename}
                    </li>
                  ))}
                </ul>
              </Card>
            )}      
          </div>

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
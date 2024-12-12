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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

    
    const fetchFiles = async (searchStr:string) => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/file/list?search=${searchStr}`,{}, {
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
    
    const autocompleteSearch = async (searchQuery:string) => {
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

  const AiSearch = async (searchQuery:string) => {
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
      AiSearch(searchQuery)
    }else{
      fetchFiles(searchQuery)
    }
  }


  useEffect(() => {
    fetchFiles("");
  }, [token]);


  useEffect(() => {
    if(searchQuery){ 
      autocompleteSearch(searchQuery);
    }
  }, [token,searchQuery]);



  const AiPermission = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL+`/api/v1/user/permission`, {
        headers: {
          Authorization: `Bearer ${token?.token}`,
        },
      });
    } catch (error) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-4">
        <div className="flex-col items-center justify-between space-y-2 md:flex md:flex-row">
          <div><h2 className="text-3xl font-bold tracking-tight">Access Control</h2></div>
          <div>{!(token?.user?.ai_permission || false)? <AlertDialog>
            <AlertDialogTrigger><Button variant="secondary">USE AI</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                Your data will be processed by our AI to improve your search. Proceed if you agree.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => AiPermission()}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>:""}</div>
        </div>

        <div className="flex space-x-2">
          <div className="w-full relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) =>{
                  if(!e.target.value){
                    fetchFiles("")
                  }
                 setSearchQuery(e.target.value)}}
              placeholder="Enter your query..."
              className="flex-grow"
            />
            {recommendation.length > 0 && (
              <Card className="p-2 absolute bg-white z-10" style={{backgroundColor:"#fff !important"}}>
                <ul className="divide-y ">
                  {recommendation.map((item, index) => (
                    <li
                      key={item?._id}
                      className="p-2 bg-white cursor-pointer"
                      onClick={() => {
                        setSearchQuery(item.filename)
                        if(aiToggle){
                          AiSearch(item.filename)
                        }else{
                          fetchFiles(item.filename)
                        }
                        setRecommendation([])
                      }} // Set query when clicked
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
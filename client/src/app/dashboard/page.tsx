"use client"

import React, {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import axios from "axios"
import {DataTable} from "./components/table"
import RagOutput from "./components/RagOutput"
import { useSelector } from "react-redux"
import { dispatch, RootState } from "@/redux/store"
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
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress";
import CardCantainer from "./components/cards/CardCantainer"
import { clearToken } from "@/redux/reducer/login"
import AutoSuggest from "react-autosuggest";
import { useAuth } from "../authProvider"

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
  const [eventData, setEventData] = useState<any>()
  const token = useSelector((state: RootState) => state.login.userToken);
  const [aiToggle, setAiToggle] = useState(false)
  const [connectedApp, setConnectedApp] = useState(true)
  const { isAuthenticated } = useAuth();

  const router = useRouter();
  
  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }
    
  const fetchFiles = async (searchStr:string) => {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/file/list?search=${searchStr}&page=1&limit=1000`,{}, {
            headers: {
              Authorization: `Bearer ${token?.token}`,
            },
          });
          setFiles((response.data?.data || [])); 
          setConnectedApp((response.data?.appIsEmpty || false)); 
        } catch (err:any) {
          setError('Failed to fetch files');
          if(err?.status == 401){
            dispatch(clearToken())
            router.replace("/login")
          }
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
      } catch (err:any) {
        setError('Failed to fetch files');
        if(err?.status == 401){
          router.replace("/login")
        }
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
    } catch (error:any) {
      setData(null);
      if(error?.status == 401){
        router.replace("/login")
      }
    } finally {
      setLoading(false);
    }
  };

  // console.log(eventData,error)
  function onSearch(){
    setData(null)
    // setFiles([])
    setRecommendation([])
    if(aiToggle && searchQuery){
      AiSearch(searchQuery)
    }else{
      fetchFiles(searchQuery)
    }
  }


  useEffect(() => {
    fetchFiles("");
  }, [token]);


  // useEffect(() => {
  //   if(searchQuery){ 
  //     ;
  //   }
  // }, [token,searchQuery]);



  // const AiPermission = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL+`/api/v1/user/permission`, {
  //       headers: {
  //         Authorization: `Bearer ${token?.token}`,
  //       },
  //     });
  //   } catch (error:any) {
  //     setData(null);
  //     if(error?.status == 401){
  //       router.replace("/login")
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const AiPermission = () => {
    
    const tokenString = token?.token; // Ensure your token is accessible
    if (!tokenString) {
      router.replace("/login");
      return;
    }
  
    // Start the SSE connection
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/user/permission?token=${tokenString}`
    );
  
    eventSource.onopen = () => {
      console.log("SSE connection established.");
    };
  
    eventSource.onmessage = (event) => {
      const response = JSON.parse(event.data);

      // console.log(response)
      if (response.status === 200) {
        console.log("Permission granted:", response.progress);
        setEventData(response); // Update state with response data
      } else if (response.status === 401) {
        console.log("Unauthorized:", response.message);
        router.replace("/login");
        eventSource.close();
      }
    };
  
    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setEventData(null); // Reset data on error
      eventSource.close();
    };
  
    // Close the SSE connection after use
    return () => {
      eventSource.close();
      setLoading(false);
    };
  };



  console.log("recommendation",recommendation)

  return (
    <div className="flex-col md:flex">
      <div className="flex justify-center items-center w-full">
     {eventData && 
     <div className="w-full">
        <Progress value={eventData?.progress} />
        <p className="text-xs leading-none text-muted-foreground mt-2 text-left">
          {eventData?.name}
        </p>
        <p className="text-xs font-medium leading-none text-left">
          {eventData?.fileId}
        </p>
      </div>}
    </div>

     {connectedApp ?<div className="flex justify-center items-center h-[80vh]">
          <div>
             <Button onClick={()=>router.push("/dashboard/connect")}>Connect APPS</Button>
          </div>
      </div>:
      <div className="flex-1 space-y-4">
        <div className="flex-col items-center justify-between space-y-2 md:flex md:flex-row">
          <div><h2 className="text-3xl font-bold tracking-tight">Access Control</h2></div>
          <div>{!(token?.user?.ai_permission || false)? <AlertDialog>
            <AlertDialogTrigger><Button variant="secondary">USE AI {eventData?.progress?eventData?.progress + "%":""} </Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                Your data will be processed by our AI to improve your search. Proceed if you agree.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 text-white" onClick={() => AiPermission()}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>:""}</div>
        </div>

        <div className="flex space-x-2">
          {/* <div className="w-full relative">
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
          </div> */}


          <AutoSuggest
            suggestions={recommendation}
            onSuggestionsClearRequested={() => setRecommendation([])}
            onSuggestionsFetchRequested={({ value }) => {
              console.log(value,"g fdgkf hgkfjg")
              autocompleteSearch(searchQuery)
              // setSearchQuery(value);
              // setRecommendation(value);
            }}
            onSuggestionSelected={(_, data) =>{
              setSearchQuery(data?.suggestion?.filename)
              console.log("Selected: " ,data?.suggestion)
              }
            }
            getSuggestionValue={suggestion => suggestion.filename}
            renderSuggestion={suggestion => <span>{suggestion.filename}</span>}
            inputProps={{
              placeholder: "search... ",
              value: searchQuery,
              onChange: (_, { newValue, method }) => {
                setSearchQuery(newValue);
              }
            }}
            highlightFirstSuggestion={true}
          />


       <Button onClick={()=>{onSearch()}} disabled={loading}>
         {loading ? 'Searching...' : 'Search'}
       </Button>
       <Toggle onPressedChange={()=>setAiToggle(pre=>!pre)} pressed={aiToggle} variant="outline" aria-label="Toggle italic" >
        AI
      </Toggle>
     </div>
        
        <RagOutput query={searchQuery} setQuery={setSearchQuery} data={data} setData={setData}/>
        <CardCantainer data={files}/>
        {/* <DataTable data={files|| []} /> */}
      </div>}
    </div>
  )
}
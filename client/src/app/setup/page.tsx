"use client";
import { use, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress"; // Import your shadcn ProgressBar component
import { Button } from "@/components/ui/button"; // Import your shadcn Button component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import your shadcn Tabs components
import OrganizationForm from "./components/orgeFrom";
import ConnectedApps from "../dashboard/connect/page";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const SetupPage = () => {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.login.userToken);
  const [progress, setProgress] = useState(0); // Adjust progress percentage as needed
  const [activeTab, setActiveTab] = useState("organization-details");
  

  useEffect(() => {
    const user  = token?.user
    if(user?.organization){
      setActiveTab("connect-application");
      setProgress(50)
    }
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-gray-100 py-4 px-6 flex justify-between items-center shadow-sm mx-[8%]">
        <h1 className="text-xl font-semibold">Setup Your Organization</h1>
        {/* <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button> */}
      </header>

      {/* Progress Bar */}
      <div className="bg-white py-4 flex justify-center">
        <Progress value={progress} className="w-[80%] h-2" />
      </div>

      {/* Main Content */}
      <main className="flex-grow p-6  mx-[6.5%]">
        <Tabs
          defaultValue="organization-details"
          value={activeTab}
          onValueChange={(value)=>{}}
        >
          <TabsList className="flex space-x-4">
            <TabsTrigger value="organization-details">
              Organization Details
            </TabsTrigger>
            <TabsTrigger value="connect-application">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="organization-details">
            <div className="mt-4">
              <h2 className="text-lg font-medium">Organization Details</h2>
              <OrganizationForm
                setProgress={setProgress}
                setActiveTab={setActiveTab}
              />
            </div>
          </TabsContent>
          <TabsContent value="connect-application">
            <div className="mt-4">
              <h2 className="text-lg font-medium">Applications</h2>
              <ConnectedApps />
              {/* Form elements go here */}
              <div className="flex justify-end" onClick={()=>router.replace("/dashboard")}>
                <Button>Done</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SetupPage;

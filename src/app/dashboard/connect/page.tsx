
"use client"
import {useState} from 'react';
import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {

} from "lucide-react"
import {Button} from '@/components/ui/button';
import appsList, {oauthUrls} from '@/constants/apps';
import Image from 'next/image';

const buildOAuthUrl = (appName: any) => {
  const {authUrl, params}: any = oauthUrls[appName as unknown as keyof typeof oauthUrls];

  const queryString = new URLSearchParams(params).toString();
  return `${authUrl}?${queryString}`; 
};



export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = appsList.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnect = async (app: any) => {
    const oauthWindow = window.open(buildOAuthUrl(app.name));

    const checkOAuthToken = setInterval(async () => {
      try {
        // Check if the window is closed
        if (oauthWindow && oauthWindow.closed) {
          clearInterval(checkOAuthToken);
          // Send the token to your backend after closing the OAuth window
          // const token = await getTokenFromLocalStorage(app); // Function to retrieve token
          // await sendTokenToBackend(app.id, token);
        }
      } catch (error) {
        console.error("Error while checking OAuth token:", error);
      }
    }, 1000);
  };


  return (
    <div className="flex h-screen">
      <div className="flex-1 p-8 bg-gray-100">
        {/* <h1 className="text-3xl font-bold mb-4">Welcome to the Dashboard</h1> */}
        <div className="flex justify-center mb-6">
          <Input
            type="text"
            placeholder="Search for apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/2 p-2 border rounded-md"
          />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {filteredApps.map((app) => (
            <Card key={app.id} className='p-3'>
              <div className='flex justify-between'>
                <div>
                  <Image src={app.logo} alt={app.name} width={50} height={50} />
                </div>
                <div><h2 className="text-xl font-semibold">{app.name}</h2>
                  <div className='mt-2 flex justify-end'>
                    <Button variant="outline" onClick={() => handleConnect(app)}>Connect</Button>
                  </div></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

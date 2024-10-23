
"use client"
import {useEffect, useState} from 'react';
import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {

} from "lucide-react"
import {Button} from '@/components/ui/button';
import appsList, {oauthUrls} from '@/constants/apps';
import Image from 'next/image';
import ConnectedApps from './components/ConnectedList';
import axios from 'axios';
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
} from "@/components/ui/alert-dialog"


const buildOAuthUrl = (appName: any) => {
  const {authUrl, params}: any = oauthUrls[appName as unknown as keyof typeof oauthUrls];

  const queryString = new URLSearchParams(params).toString();
  return `${authUrl}?${queryString}`;
};



export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [connectedApps, setConnectedApps] = useState<any[]>([]); // State to store connected apps
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch connected apps
  useEffect(() => {
    const fetchConnectedApps = async () => {
      try {
        const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + '/api/v1/token/list'); // Adjust the API endpoint as needed
        setConnectedApps((response.data && response.data.data) || []);
      } catch (error) {
        console.error('Error fetching connected apps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedApps();
  }, []);

  const filteredApps = appsList.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnect = async (app: any) => {
    window.location.href = buildOAuthUrl(app.name);
  };

  async function handleDisconnect(id: string) {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/token/disconnect/${id}`);

      console.log('Disconnect response:', response.data);


    } catch (error) {
      console.error('Error disconnecting app:', error);
    }
  }


  return (
    <div className="flex h-screen">
      <div className="flex-1 p-8 bg-gray-100">
        <div>
          {/* <ConnectedApps apps={filteredApps} onDisconnect={()=>{}}/> */}
        </div>
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
          {filteredApps.map((app) => {
            const connectedApp = connectedApps.find((connected) => connected.state === app.name);
            return (
              <Card key={app.id} className='p-3'>
                <div className='flex justify-between'>
                  <div>
                    <Image src={app.logo} alt={app.name} width={50} height={50} />
                  </div>
                  <div><h2 className="text-xl font-semibold">{app.name}</h2>
                    <div className='mt-2 flex justify-end'>
                      {connectedApp ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              Disconnect
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to disconnect?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will disconnect your app and remove access to your data. You can reconnect at any time.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDisconnect(connectedApp._id)} // Call disconnect here
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                      ) : (
                        <Button variant="outline" onClick={() => handleConnect(app)}>
                          Connect
                        </Button>
                      )}
                    </div></div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  );
}

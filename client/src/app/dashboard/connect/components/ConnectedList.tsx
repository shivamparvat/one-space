// ConnectedApps.tsx
import React from 'react';
import {Button} from '@/components/ui/button'; // Adjust the import according to your shadcn structure
import Image, {StaticImageData} from 'next/image';

interface App {
  id: number;
  name: string;
  logo: any;// URL for the app logo
}

interface ConnectedAppsProps {
  apps: App[];
  onDisconnect: (id: number) => void; // Callback for disconnecting an app
}

const ConnectedApps: React.FC<ConnectedAppsProps> = ({apps, onDisconnect}) => {
  console.log("g hfdjghf jdkgh fdjgh fdgfjg f")
  return (
    <div className="flex flex-col space-y-1 p-1">
      {apps.map((app) =>{
        console.log(app,"appappappappapp")
        return(
        <div key={app.id} className="flex items-center justify-between border p-2 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <Image src={app.logo} alt={`${app.name} logo`} width={20} height={20} className="h-12 w-12 object-cover" />
            {/* <h2 className="text-lg font-semibold">{app.name}</h2> */}
          </div>
          <Button
            variant="destructive"
            onClick={() => onDisconnect(app.id)}
            className="ml-4"
          >
            Disconnect
          </Button>
        </div>
      )})}
    </div>
  );
};

export default ConnectedApps;

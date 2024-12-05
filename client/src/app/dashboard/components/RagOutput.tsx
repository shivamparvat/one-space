'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { FC, useState } from 'react';

const RagOutput: FC<{query:string,setQuery: React.Dispatch<string>}> = ({query,setQuery}) => {
  const [data, setData] = useState<{
    query: string;
    answer: string;
    results: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BASE_URL+`/api/v1/ai/search`, {
        params: { query },
      });
      setData(response?.data?.result);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {data && (
        <Card>
          <CardHeader>
            <h4>Quetion: {data.query}</h4>
          </CardHeader>
          <CardContent>
            <div>
              <strong>Generated Answer:</strong>
              <div className="mt-2">
                <ReactMarkdown>{data.answer}</ReactMarkdown>
              </div>
            </div>
            {/* <div className="mt-4">
              <strong>Source Documents:</strong>
              <ul className="space-y-2">
                {(data.results||[]).map((doc, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    <ReactMarkdown>{doc}</ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div> */}
          </CardContent>
        </Card>
      )}

      {data && (
        <Button
          onClick={() => {
            setQuery('');
            setData(null);
          }}
          className="w-full"
          variant="outline"
        >
          Ask a New Question
        </Button>
      )}
    </div>
  );
};

export default RagOutput;

// components/RagOutput.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {  Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { FC } from 'react';

interface RagOutputProps {
  data: {
    query: string;
    generatedAnswer: string;
    sourceDocuments: string[];
  };

  onNewQuery: () => void;
}

const RagOutput: FC<RagOutputProps> = ({ data, onNewQuery }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
            <h4>
            Query: {data.query}
            </h4>
        </CardHeader>
        <CardContent>
          <div>
            <strong>Generated Answer:</strong>
            <div className="mt-2">
              <ReactMarkdown>{data.generatedAnswer}</ReactMarkdown>
            </div>
          </div>
          <div className="mt-4">
            <strong>Source Documents:</strong>
            <ul className="space-y-2">
              {data.sourceDocuments.map((doc, index) => (
                <li key={index} className="text-sm text-gray-600">
                  <ReactMarkdown>{doc}</ReactMarkdown>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      <Button onClick={onNewQuery} className="w-full" variant="outline">
        Ask a New Question
      </Button>
    </div>
  );
};

export default RagOutput;

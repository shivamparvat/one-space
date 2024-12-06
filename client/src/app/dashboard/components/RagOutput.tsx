"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { FC, useState } from "react";
import { RagOutputType } from "../page";

const RagOutput: FC<{
  query: string;
  setQuery: React.Dispatch<string>;
  data: RagOutputType | null;
  setData: React.Dispatch<RagOutputType | null>;
}> = ({ query, setQuery, data, setData }) => {
  return (
    <div className="space-y-4">
      {data &&
        <Card>
          <CardHeader>
            <h4>
              Quetion: {data.query}
            </h4>
          </CardHeader>
          <CardContent>
            <div>
              <strong>Generated Answer:</strong>
              <div className="mt-2">
                <ReactMarkdown>
                  {data.answer}
                </ReactMarkdown>
              </div>
            </div>
            {/* <div className="mt-4">
              <strong>Source Documents:</strong>
              <ul className="space-y-2">
                {(data.results || []).map((doc, index) =>
                  <li key={index} className="text-sm text-gray-600">
                    <ReactMarkdown>
                      {doc}
                    </ReactMarkdown>
                  </li>
                )}
              </ul>
            </div> */}
          </CardContent>
        </Card>}

      {data &&
        <Button
          onClick={() => {
            setQuery("");
            setData(null);
          }}
          className="w-full"
          variant="outline"
        >
          Ask a New Question
        </Button>}
    </div>
  );
};

export default RagOutput;

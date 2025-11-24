import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function Panel({ title, children, className = "" }) {
  return (
    <Card className={`bg-card border-border h-full flex flex-col overflow-hidden ${className}`}>
      <CardHeader className="py-3 px-4 border-b border-border flex-shrink-0">
        <CardTitle className="text-sm font-medium text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-auto">
        {children}
      </CardContent>
    </Card>
  );
}

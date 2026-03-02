'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Headline } from '@/components/ui/headline';
import { cn } from '@/lib/utils';
import { ArrowLeft, School, Trash2, Users } from 'lucide-react';
import Image from 'next/image';

interface AppSettingsProps {
  appName: string;
  createdAt: string;
  logoUrl?: string;
}

// @todo: Add state for when there is no configuration set!
// @todo: Add functionality!

export function AppSettings({ appName, createdAt, logoUrl }: AppSettingsProps) {
  const [activeTab, setActiveTab] = React.useState<'groups' | 'school'>('groups');

  return (
    <div className="relative min-h-screen pb-24">
      {/* Header-Box */}
      <div className="mb-8 flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit p-0 hover:bg-transparent">
          <ArrowLeft className="mr-2 size-4" />
          <span>Back</span>
        </Button>

        <div className="flex items-center gap-4">
          <div className="bg-muted size-16 overflow-hidden rounded-lg border">
            {logoUrl ? (
              <Image src={logoUrl} alt={appName} className={'size-full object-cover'} />
            ) : (
              <div className="flex size-full items-center justify-center">
                <School className="text-muted-foreground size-8" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{appName}</h1>
            <p className="text-muted-foreground text-sm">Freigabe erteilt am {createdAt}</p>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="space-y-8">
        <div>
          <Headline headline="App-Konfiguration" tag="h2" size="h2" className="mb-1" />
          <p className="text-muted-foreground">
            Verwalte die Einstellungen für diese App-Konfiguration.
          </p>
        </div>

        {/* Tab-Navigation */}
        <div className="space-y-4">
          <div className="flex border-b">
            <button
              onClick={() => {
                setActiveTab('groups');
              }}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'groups'
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              <Users className="size-4" />
              für Gruppen
            </button>
            <button
              onClick={() => {
                setActiveTab('school');
              }}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'school'
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              <School className="size-4" />
              ganze Schule
            </button>
          </div>

          <div className="mt-4 rounded-lg border p-6">
            {activeTab === 'groups' ? (
              <p className="text-sm">select a school...</p>
            ) : (
              <p className="text-sm">the whole school has access</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-background fixed bottom-8 right-8 flex items-center gap-3 rounded-lg border p-4 shadow-lg">
        <Button variant="destructive" className="flex items-center gap-2">
          Deine App-Konfiguration entfernen
          <Trash2 className="size-4" />
        </Button>
        <Button variant="outline">Abbrechen</Button>
        <Button variant="default">speichern</Button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DocsSidebar, MobileSidebarTrigger } from '@/components/docs/sidebar';
import { OnThisPage } from '@/components/docs/on-this-page';
import { navData } from '@/components/docs/nav-data';
import { tocMap } from '@/components/docs/toc-data';
import { IntroContent } from '@/components/docs/intro-content';
import { InstallationContent } from '@/components/docs/installation-content';
import { StudentTutorialContent } from '@/components/docs/student-tutorial-content';
import { StudentCLIContent } from '@/components/docs/student-cli-content';
import { InstructorCreateContent } from '@/components/docs/instructor-create-content';
import { InstructorStructureContent } from '@/components/docs/instructor-structure-content';
import { InstructorConfigContent } from '@/components/docs/instructor-config-content';
import { InstructorSRPContent } from '@/components/docs/instructor-srp-content';
import { InstructorRunnersContent } from '@/components/docs/instructor-runners-content';
import { InstructorContentContent } from '@/components/docs/instructor-content-content';
import { InstructorCLIContent } from '@/components/docs/instructor-cli-content';
import { InstructorExamplesContent } from '@/components/docs/instructor-examples-content';
import { UnderConstruction } from '@/components/docs/under-construction';

const DocsPage = () => {
  const [activeId, setActiveId] = useState('intro');

  const renderContent = () => {
    switch (activeId) {
      case 'intro':
        return <IntroContent setActiveId={setActiveId} />;
      case 'installation':
        return <InstallationContent />;
      case 'student-tutorial':
        return <StudentTutorialContent />;
      case 'student-cli':
        return <StudentCLIContent />;
      case 'instructor-create':
        return <InstructorCreateContent />;
      case 'instructor-structure':
        return <InstructorStructureContent />;
      case 'instructor-config':
        return <InstructorConfigContent />;
      case 'instructor-srp':
        return <InstructorSRPContent />;
      case 'instructor-runners':
        return <InstructorRunnersContent />;
      case 'instructor-content':
        return <InstructorContentContent />;
      case 'instructor-cli':
        return <InstructorCLIContent />;
      case 'instructor-examples':
        return <InstructorExamplesContent />;
      default:
        return <UnderConstruction />;
    }
  };

  const currentTitle =
    navData.navMain.flatMap((g) => g.items).find((i) => i.id === activeId)
      ?.title || 'Introduction';

  const tocItems = tocMap[activeId] || [];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DocsSidebar activeId={activeId} setActiveId={setActiveId} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md px-6">
          <MobileSidebarTrigger activeId={activeId} setActiveId={setActiveId} />
          <Separator
            orientation="vertical"
            className="mx-2 h-4 hidden md:block"
          />
          <div className="flex items-center gap-2 text-xs font-medium tracking-tight text-muted-foreground uppercase">
            <span>Docs</span>
            <ChevronRight size={12} />
            <span className="text-foreground">{currentTitle}</span>
          </div>
        </header>

        <div className="flex-1 flex">
          <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
            <div className="max-w-6xl mx-auto px-6 py-10 md:px-10">
              {renderContent()}
            </div>
          </main>

          <OnThisPage items={tocItems} />
        </div>
      </div>
    </div>
  );
};

export default DocsPage;

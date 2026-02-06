import React from 'react';
import { useStore } from '@nanostores/react';
import {
  BookOpen,
  Wand2,
  CheckCircle,
  CheckCircle2,
  XCircle,
  FileCode,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion';
import { Badge } from './ui/badge';
import {
  $exerciseGroups,
  $exerciseGroupsQuery,
  $selectedExercise,
  $results,
  setSelectedExercise,
} from '../stores/course-store';
import { $sidebarTab, setSidebarTab } from '../stores/ui-store';

export function Sidebar() {
  const exerciseGroups = useStore($exerciseGroups);
  const exerciseGroupsQuery = useStore($exerciseGroupsQuery);
  const selectedExercise = useStore($selectedExercise);
  const results = useStore($results);
  const sidebarTab = useStore($sidebarTab);

  return (
    <aside className="lg:col-span-3 h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm">
      <Tabs
        value={sidebarTab}
        onValueChange={(v) => setSidebarTab(v as any)}
        className="flex flex-col h-full"
      >
        <div className="p-2 border-b border-zinc-800/50 bg-zinc-900/50">
          <TabsList className="w-full bg-zinc-800/50">
            <TabsTrigger
              value="learning"
              className="flex-1 gap-2 data-[state=active]:bg-zinc-700 py-2"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Learning Path
            </TabsTrigger>
            <TabsTrigger
              value="practice"
              className="flex-1 gap-2 data-[state=active]:bg-rust py-2"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Practice
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="learning"
          className="flex-1 overflow-hidden m-0 text-zinc-100"
        >
          <ScrollArea className="h-full px-2 py-2">
            {exerciseGroupsQuery.loading &&
            Object.keys(exerciseGroups).length === 0 ? (
              <div className="space-y-4 p-2">
                <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
                <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
                <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full space-y-1">
                {Object.keys(exerciseGroups)
                  .filter((key) => key !== 'practice')
                  .map((moduleKey) => {
                    const exercises = exerciseGroups[moduleKey] || [];
                    const modulePassCount = exercises.filter(
                      (ex) => results[ex.id] === 'pass',
                    ).length;
                    const isModuleComplete =
                      modulePassCount === exercises.length &&
                      exercises.length > 0;

                    return (
                      <AccordionItem
                        key={moduleKey}
                        value={moduleKey}
                        className="border-none"
                      >
                        <AccordionTrigger className="hover:no-underline py-3 px-3 rounded-xl hover:bg-zinc-800/30 text-zinc-300 text-sm transition-colors [&[data-state=open]]:bg-zinc-800/50">
                          <div className="flex items-center gap-3 truncate">
                            {isModuleComplete ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-zinc-500">
                                  {modulePassCount}
                                </span>
                              </div>
                            )}
                            <span
                              className={`font-semibold truncate ${isModuleComplete ? 'text-zinc-500' : ''}`}
                            >
                              {exercises[0]?.moduleTitle ||
                                moduleKey
                                  .replace(/^\d+_/, '')
                                  .replace(/_/g, ' ')}
                            </span>
                          </div>
                          <Badge
                            variant={isModuleComplete ? 'outline' : 'secondary'}
                            className={`ml-auto mr-2 text-[10px] h-5 px-2 ${isModuleComplete ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : ''}`}
                          >
                            {modulePassCount}/{exercises.length}
                          </Badge>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2 pt-1 space-y-1">
                          {exercises.map((ex) => {
                            const status = results[ex.id];
                            const isSelected = selectedExercise?.id === ex.id;
                            return (
                              <button
                                key={ex.id}
                                onClick={() => setSelectedExercise(ex)}
                                className={`cursor-pointer w-full text-left pl-10 pr-3 py-2.5 text-xs rounded-lg transition-all flex items-center gap-2 group
                                ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-rust/20 to-transparent text-rust font-bold border-l-2 border-rust'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border-l-2 border-transparent'
                                }`}
                              >
                                <FileCode
                                  className={`w-3 h-3 ${isSelected ? 'text-rust' : 'text-zinc-600 group-hover:text-zinc-400'}`}
                                />
                                <span className="truncate flex-1">
                                  {ex.friendlyName || ex.exerciseName}
                                </span>
                                {status === 'pass' && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                {status === 'fail' && (
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                )}
                              </button>
                            );
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
              </Accordion>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="practice"
          className="flex-1 overflow-hidden m-0 text-zinc-100"
        >
          <ScrollArea className="h-full px-2 py-2">
            {exerciseGroups['practice'] &&
            Array.isArray(exerciseGroups['practice']) ? (
              <div className="space-y-1">
                {exerciseGroups['practice'].map((ex) => {
                  const status = results[ex.id];
                  const isSelected = selectedExercise?.id === ex.id;
                  return (
                    <button
                      key={ex.id}
                      onClick={() => setSelectedExercise(ex)}
                      className={`w-full text-left px-3 py-3 text-xs rounded-lg transition-all flex items-center gap-3 group
                        ${
                          isSelected
                            ? 'bg-gradient-to-r from-rust/20 to-transparent text-rust font-bold border-l-2 border-rust'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border-l-2 border-transparent'
                        }`}
                    >
                      <Wand2
                        className={`w-4 h-4 ${isSelected ? 'text-rust' : 'text-zinc-600'}`}
                      />
                      <span className="truncate flex-1">{ex.exerciseName}</span>
                      {status === 'pass' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {status === 'fail' && (
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <Wand2 className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                <p className="text-sm">Nenhum exercício gerado ainda</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Clique em "Gerar Desafio" para criar um!
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

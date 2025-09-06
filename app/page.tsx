'use client';

import { createGame } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Gamepad2, Eye, Zap, Users, MessageSquare, Search } from 'lucide-react';
import { DecorativeBackground } from '@/components/decorative-background';
import { PageHeader } from '@/components/page-header';
import { SectionHeader } from '@/components/section-header';
import { TipCard } from '@/components/tip-card';

export default function CreateGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 p-4">
      <DecorativeBackground />
      
      <PageHeader
        title="Impostor Game"
        subtitle="The ultimate social deduction experience"
        description="Create an engaging social experience for your Zoom meetings. Set up secrets and let the fun begin!"
        icon={<Gamepad2 className="h-8 w-8 text-primary-foreground" />}
      />

      {/* Main Form */}
      <main className="flex justify-center px-4 pb-12 relative z-10">
        <div className="w-full max-w-2xl space-y-6">
          {/* Game Setup Section */}
          <Card className="shadow-xl border-2 py-4 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <SectionHeader
                title="Game Setup"
                icon={<Settings className="h-6 w-6 text-primary" />}
              >
                <CardDescription className="text-base mt-1">
                  Configure your game settings and create a memorable experience for all players
                </CardDescription>
              </SectionHeader>
            </CardHeader>
            <CardContent>
              <form action={createGame} className="space-y-8">
                {/* Game Secrets Section */}
                <div className="space-y-5">
                  <SectionHeader title="Game Secrets" />
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <label htmlFor="playerSecret" className="text-base font-medium">
                          Player Secret
                        </label>
                      </div>
                      <Textarea
                        id="playerSecret"
                        name="playerSecret"
                        placeholder="e.g., 'You've all been to Japan recently. Share your favorite memory from your trip...'"
                        required
                        className="min-h-[100px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be shown to all regular players
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-destructive" />
                        <label htmlFor="impostorSecret" className="text-base font-medium">
                          Impostor Secret
                        </label>
                      </div>
                      <Textarea
                        id="impostorSecret"
                        name="impostorSecret"
                        placeholder="e.g., 'You haven't actually been to Japan, but you need to convince others you have...'"
                        required
                        className="min-h-[100px] resize-none border-destructive/20 focus:border-destructive/40"
                      />
                      <p className="text-xs text-muted-foreground">This will be shown only to impostors</p>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <TipCard
                  title="How to Create Great Secrets"
                  icon={<MessageSquare className="h-5 w-5 text-primary" />}
                  tips={[
                    {
                      icon: <MessageSquare className="h-5 w-5 text-primary" />,
                      title: "Personal & Relatable",
                      description: "Choose topics that players can connect with"
                    },
                    {
                      icon: <Search className="h-5 w-5 text-primary" />,
                      title: "Specific Details",
                      description: "Encourage sharing of unique experiences"
                    }
                  ]}
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 text-lg font-semibold h-12 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Create Game & Open Lobby
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

'use client';

import { createGame } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Eye, Users, Zap, User, MessageSquare, Search } from 'lucide-react';
import { useRef, useState } from 'react';

export default function CreateGamePage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [impostorCount, setImpostorCount] = useState(1);

  const handleReset = () => {
    if (formRef.current) {
      formRef.current.reset();
      setImpostorCount(1);
    }
  };

  const handleImpostorCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setImpostorCount(Math.max(1, Math.min(5, value)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <div className="py-10 text-center relative z-10">
        <div className="mb-6 inline-flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground">Impostor Game</h1>
            <p className="text-lg text-muted-foreground mt-2">The ultimate social deduction experience</p>
          </div>
        </div>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Create an engaging social experience for your Zoom meetings. Set up secrets, choose
          impostors, and let the fun begin!
        </p>
      </div>

      {/* Main Form */}
      <main className="flex justify-center px-4 pb-12 relative z-10">
        <div className="w-full max-w-2xl space-y-6">
          {/* Game Setup Section */}
          <Card className="shadow-xl border-2 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-serif">Game Setup</CardTitle>
                  <CardDescription className="text-base">
                    Configure your game settings and create a memorable experience for all players
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form ref={formRef} action={createGame} className="space-y-8">
                {/* Game Secrets Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-xl font-serif font-semibold text-foreground">Game Secrets</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-2 border-primary/20 bg-primary/5">
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <Label htmlFor="playerSecret" className="text-base font-medium">
                              Player Secret
                            </Label>
                          </div>
                          <Textarea
                            id="playerSecret"
                            name="playerSecret"
                            placeholder="e.g., 'You've all been to Japan recently. Share your favorite memory from your trip...'"
                            required
                            className="min-h-[120px] border-border focus:border-primary focus:ring-primary/20"
                          />
                          <p className="text-xs text-muted-foreground">
                            This will be shown to all regular players
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-destructive/20 bg-destructive/5">
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-destructive" />
                            <Label htmlFor="impostorSecret" className="text-base font-medium">
                              Impostor Secret
                            </Label>
                          </div>
                          <Textarea
                            id="impostorSecret"
                            name="impostorSecret"
                            placeholder="e.g., 'You haven't actually been to Japan, but you need to convince others you have...'"
                            required
                            className="min-h-[120px] border-border focus:border-destructive focus:ring-destructive/20"
                          />
                          <p className="text-xs text-muted-foreground">This will be shown only to impostors</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Game Settings Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-xl font-serif font-semibold text-foreground">Game Settings</h3>
                  </div>

                  <Card className="border border-border">
                    <CardContent className="p-5">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <Label htmlFor="impostorCount" className="text-base font-medium">
                            Number of Impostors
                          </Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id="impostorCount"
                              name="impostorCount"
                              type="number"
                              min="1"
                              max="5"
                              value={impostorCount}
                              onChange={handleImpostorCountChange}
                              className="w-20 text-center text-lg font-semibold border-border"
                            />
                            <div className="flex-1">
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={impostorCount}
                                onChange={(e) => setImpostorCount(parseInt(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Minimal players: {impostorCount + 2} (impostors + 2)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tips Section */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      How to Create Great Secrets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                        <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Personal & Relatable</p>
                          <p className="text-xs text-muted-foreground">Choose topics that players can connect with</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                        <Search className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Specific Details</p>
                          <p className="text-xs text-muted-foreground">Encourage sharing of unique experiences</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 text-lg font-semibold h-12 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Create Game & Open Lobby
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="sm:w-auto h-12 bg-transparent"
                    onClick={handleReset}
                  >
                    Reset
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

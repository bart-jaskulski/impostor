import { createGame } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Eye, Users } from 'lucide-react';

export default function CreateGamePage() {
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="py-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
            <span className="text-sm font-bold text-white">IG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Impostor Game</h1>
        </div>
        <p className="mx-auto max-w-md text-gray-600">
          Create an engaging social experience for your Zoom meetings. Set up secrets, choose
          impostors, and let the fun begin!
        </p>
      </div>

      {/* Main Form */}
      <main className="flex justify-center px-4">
        <div className="w-full max-w-lg space-y-6">
          {/* AIDEV-NOTE: Creation view shows no join URL; it's revealed in the lobby. */}
          {/* Game Setup Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">Game Setup</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Configure your game settings and create a memorable experience for all players
              </p>
            </CardHeader>
            <CardContent>
              <form action={createGame} className="space-y-6">
                {/* AIDEV-NOTE: Use Textarea for secrets; Lucide icons only (no emojis). */}
                {/* Game Secrets Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <h3 className="font-medium text-gray-800">Game Secrets</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-orange-500" />
                        <Label htmlFor="playerSecret" className="text-sm font-medium">
                          Player Secret
                        </Label>
                      </div>
                      <Textarea
                        id="playerSecret"
                        name="playerSecret"
                        placeholder="Enter the secret task or information for regular players"
                        required
                        className="min-h-[80px] focus:border-orange-300 focus:ring-orange-200"
                      />
                      <p className="text-xs text-gray-500">
                        This will be shown to all regular players
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-red-500"></span>
                        <Label htmlFor="impostorSecret" className="text-sm font-medium">
                          Impostor Secret
                        </Label>
                      </div>
                      <Textarea
                        id="impostorSecret"
                        name="impostorSecret"
                        placeholder="Enter the secret information for impostors"
                        required
                        className="min-h-[80px] focus:border-orange-300 focus:ring-orange-200"
                      />
                      <p className="text-xs text-gray-500">This will be shown only to impostors</p>
                    </div>
                  </div>
                </div>

                {/* Game Settings Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">Game Settings</h3>

                  <div className="space-y-2">
                    <Label htmlFor="impostorCount" className="text-sm font-medium">
                      Number of Impostors
                    </Label>
                    <Input
                      id="impostorCount"
                      name="impostorCount"
                      type="number"
                      min="1"
                      defaultValue="1"
                      required
                      className="focus:border-orange-300 focus:ring-orange-200"
                    />
                    <p className="text-xs text-gray-500">
                      Recommended: 1-2 impostors for 4-10 players
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Create Game & Open Lobby
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-gray-600 hover:bg-gray-50"
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

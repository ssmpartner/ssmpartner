import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Volume2, Bot } from "lucide-react";

const AdminOnlineCheck = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Online-Beratung</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie den KI-Chat und die Einstellungen der Online-Beratung.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot size={20} />
              KI-Chat Konfiguration
            </CardTitle>
            <CardDescription>
              Der Chat nutzt die gleiche Wissensbasis wie der Chat-Widget. Verwalten Sie diese unter "KI-Chat Wissen".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                ✅ Der KI-Chat ist aktiv und nutzt die Wissensbasis aus dem Bereich "KI-Chat Wissen".
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                💡 Um den Chat-Inhalt zu bearbeiten, gehen Sie zu <strong>KI-Chat Wissen</strong> in der Navigation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 size={20} />
              ElevenLabs Sprachausgabe
            </CardTitle>
            <CardDescription>
              Die Sprachausgabe ermöglicht es Besuchern, die KI-Antworten als Audio abzuspielen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                ✅ ElevenLabs TTS ist konfiguriert. Besucher können die Sprachausgabe im Chat aktivieren.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Versicherungs-Wizard
            </CardTitle>
            <CardDescription>
              Der interaktive Versicherungsassistent (kommt in Phase 2).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                🔜 Der Versicherungs-Wizard wird in der nächsten Phase hinzugefügt und hier verwaltbar sein.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOnlineCheck;

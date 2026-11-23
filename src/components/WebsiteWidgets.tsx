import { useState } from "react";
import ChatWidget from "@/components/ChatWidget";
import ConsultationWidget from "@/components/ConsultationWidget";
import { useConsultationWidgetEnabled } from "@/hooks/useConsultationWidgetEnabled";
import { widgetVisibility } from "@/lib/websiteWidgets";

export default function WebsiteWidgets() {
  const consultationEnabled = useConsultationWidgetEnabled();
  const [aiOpen, setAiOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const visibility = widgetVisibility(true, consultationEnabled, aiOpen, consultationOpen);
  return <>
    <ChatWidget open={aiOpen} onOpenChange={setAiOpen} hidden={!visibility.ai} dockLeft={visibility.aiOnLeft} />
    <ConsultationWidget enabled={consultationEnabled} visible={visibility.consultation} onPanelChange={setConsultationOpen} />
  </>;
}
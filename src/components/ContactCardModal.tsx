import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Download, Phone, Mail } from "lucide-react";

interface TeamMember {
  name: string;
  role_de?: string | null;
  phone?: string | null;
  email?: string | null;
  image_url?: string | null;
}

interface ContactCardModalProps {
  member: TeamMember;
  open: boolean;
  onClose: () => void;
}

const generateVCard = (member: TeamMember) => {
  const parts = member.name.split(" ");
  const lastName = parts.pop() || "";
  const firstName = parts.join(" ");
  let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName};;;\nFN:${member.name}\nORG:SSM Partner AG\n`;
  if (member.role_de) vcard += `TITLE:${member.role_de}\n`;
  if (member.phone) vcard += `TEL;TYPE=WORK,VOICE:${member.phone}\n`;
  if (member.email) vcard += `EMAIL;TYPE=WORK:${member.email}\n`;
  vcard += `END:VCARD`;
  return vcard;
};

const ContactCardModal = ({ member, open, onClose }: ContactCardModalProps) => {
  if (!open) return null;

  const vcard = generateVCard(member);

  const handleDownload = () => {
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${member.name.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-primary px-6 pt-6 pb-10">
          <button onClick={onClose} className="absolute top-3 right-3 text-primary-foreground/70 hover:text-primary-foreground">
            <X size={20} />
          </button>
          <p className="font-body text-xs text-primary-foreground/60 uppercase tracking-wider">Kontaktkarte</p>
        </div>

        {/* Avatar overlapping */}
        <div className="flex justify-center -mt-8">
          <div
            className="w-16 h-16 rounded-full border-4 border-card overflow-hidden bg-muted"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            {member.image_url ? (
              <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-xl">
                {member.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-6 pt-3 pb-2 text-center">
          <h3 className="font-heading text-lg font-bold text-foreground">{member.name}</h3>
          {member.role_de && <p className="font-body text-sm text-muted-foreground mt-0.5">{member.role_de}</p>}
          <p className="font-body text-xs text-primary mt-1">SSM Partner AG</p>
        </div>

        {/* Contact details */}
        {(member.phone || member.email) && (
          <div className="px-6 py-3 space-y-2">
            {member.phone && (
              <a href={`tel:${member.phone}`} className="flex items-center gap-3 text-sm font-body text-foreground hover:text-primary transition-colors">
                <Phone size={15} className="text-primary shrink-0" />
                {member.phone}
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-3 text-sm font-body text-foreground hover:text-primary transition-colors">
                <Mail size={15} className="text-primary shrink-0" />
                {member.email}
              </a>
            )}
          </div>
        )}

        {/* QR Code */}
        <div className="px-6 py-4 flex flex-col items-center">
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={vcard} size={160} level="M" />
          </div>
          <p className="font-body text-[10px] text-muted-foreground mt-2">QR-Code scannen, um Kontakt zu speichern</p>
        </div>

        {/* Download */}
        <div className="px-6 pb-6">
          <button
            onClick={handleDownload}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Download size={16} />
            Kontakt herunterladen (.vcf)
          </button>
        </div>
      </div>
    </div>
  );
};

export { ContactCardModal, generateVCard };
export type { TeamMember };

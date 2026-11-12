import { useAuth } from "@/context/AuthContext";
import TrashBin from "@/components/admin/TrashBin";

const AdminTrash = () => {
  const { isSuperadmin } = useAuth();
  if (!isSuperadmin) return <p className="text-sm text-muted-foreground">Nur für Superadmins verfügbar.</p>;
  return <TrashBin />;
};

export default AdminTrash;

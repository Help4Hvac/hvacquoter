import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  getAllPromoCodes, 
  addPromoCode, 
  updatePromoCode, 
  removePromoCode, 
  togglePromoStatus,
  type PromoCode 
} from "@/lib/promoCodeManager";
import { Pencil, Trash2, Plus, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PromoCodeManager() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState<PromoCode | null>(null);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    amount: "",
    description: ""
  });

  const refreshCodes = () => {
    setCodes(getAllPromoCodes());
  };

  useEffect(() => {
    refreshCodes();
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(formData.amount);
    if (!formData.code || isNaN(amount)) return;

    addPromoCode(formData.code, amount, formData.description);
    toast({
      title: "Promo Code Added",
      description: `${formData.code} has been created successfully.`
    });
    setIsAddOpen(false);
    setFormData({ code: "", amount: "", description: "" });
    refreshCodes();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCode) return;
    
    const amount = parseInt(formData.amount);
    if (isNaN(amount)) return;

    updatePromoCode(currentCode.code, amount, formData.description);
    toast({
      title: "Promo Code Updated",
      description: `${currentCode.code} has been updated.`
    });
    setIsEditOpen(false);
    setCurrentCode(null);
    refreshCodes();
  };

  const openEdit = (code: PromoCode) => {
    setCurrentCode(code);
    setFormData({
      code: code.code,
      amount: code.amount.toString(),
      description: code.description
    });
    setIsEditOpen(true);
  };

  const handleDelete = (code: string) => {
    removePromoCode(code);
    toast({
      title: "Promo Code Deleted",
      description: "The code has been removed permanently."
    });
    refreshCodes();
  };

  const handleToggle = (code: string) => {
    togglePromoStatus(code);
    refreshCodes();
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Tag className="w-8 h-8" />
            Promo Code Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage active rebates and discount codes for the pricing engine
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" /> Add New Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Promo Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code</Label>
                <Input 
                  id="code" 
                  placeholder="e.g. SUMMER2025" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Rebate Amount ($)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="Max $1000" 
                  max="1000"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
                <p className="text-xs text-muted-foreground">Maximum rebate capped at $1,000</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input 
                  id="desc" 
                  placeholder="Internal note about this promo" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Create Code</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Code</TableHead>
              <TableHead>Rebate Amount</TableHead>
              <TableHead className="min-w-[300px]">Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No promo codes found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              codes.map((code) => (
                <TableRow key={code.code}>
                  <TableCell className="font-mono font-bold text-primary">
                    {code.code}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    ${code.amount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {code.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={code.isActive}
                        onCheckedChange={() => handleToggle(code.code)}
                      />
                      <span className={`text-sm ${code.isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {code.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEdit(code)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Promo Code?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{code.code}</strong>? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(code.code)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code">Promo Code</Label>
              <Input 
                id="edit-code" 
                value={formData.code}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Rebate Amount ($)</Label>
              <Input 
                id="edit-amount" 
                type="number" 
                max="1000"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Input 
                id="edit-desc" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

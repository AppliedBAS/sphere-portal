import React, { FormEvent } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "@/models/Client";

interface NewBuildingDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  newBuilding: Building;
  setNewBuilding: (building: Building) => void;
  handleAddBuilding: (e: FormEvent) => void;
}

const NewBuildingDialog: React.FC<NewBuildingDialogProps> = ({
  open,
  setOpen,
  newBuilding,
  setNewBuilding,
  handleAddBuilding,
}) => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button type="button" variant="secondary" className="w-fit">
        + Add Building
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Building</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleAddBuilding} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="new_serviceAddress1">Service Address 1</Label>
          <Input
            id="new_serviceAddress1"
            value={newBuilding.serviceAddress1}
            onChange={(e) => setNewBuilding({
                ...newBuilding,
                serviceAddress1: e.target.value
            })}
            required
          />
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="new_serviceAddress2">Service Address 2</Label>
          <Input
            id="new_serviceAddress2"
            value={newBuilding.serviceAddress2}
            onChange={(e) => setNewBuilding({
                ...newBuilding,
                serviceAddress2: e.target.value
            })}
            placeholder="Optional"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="new_cityStateZip">City, State, ZIP</Label>
          <Input
            id="new_cityStateZip"
            value={newBuilding.cityStateZip}
            onChange={(e) => setNewBuilding({
                ...newBuilding,
                cityStateZip: e.target.value
            })}
            required
          />
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="new_contactName">Contact Name</Label>
          <Input
            id="new_contactName"
            value={newBuilding.contactName}
            onChange={(e) => setNewBuilding({
                ...newBuilding,
                contactName: e.target.value
            })}
            required
          />
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="new_contactEmail">Contact Email</Label>
          <Input
            id="new_contactEmail"
            value={newBuilding.contactEmail}
            onChange={(e) => setNewBuilding({
                ...newBuilding,
                contactEmail: e.target.value
            })}
            type="email"
            required
          />
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="new_contactPhone">Contact Phone</Label>
          <Input
            id="new_contactPhone"
            value={newBuilding.contactPhone}
            onChange={(e) => setNewBuilding({
                ...newBuilding,
                contactPhone: e.target.value
            })}
            required
          />
        </div>
        <DialogFooter>
          <Button type="submit" variant="default">Add Building</Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default NewBuildingDialog;

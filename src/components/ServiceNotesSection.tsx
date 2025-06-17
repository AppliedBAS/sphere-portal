import { FC } from "react";
import { UseControllerProps, useController } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServiceReportFormValues } from "@/schemas/serviceReportSchema";

interface Props extends UseControllerProps<ServiceReportFormValues, `serviceNotes.${number}`> {
  index: number;
  onRemove: () => void;
}

const ServiceNotesSection: FC<Props> = ({ name, control, index, onRemove }) => {
  const { field } = useController({ name, control });
  return (
    <div className="border p-4 rounded space-y-4">
      <div className="flex justify-between items-center">
        <Label>Day {index + 1}</Label>
        <button type="button" onClick={onRemove} className="text-red-500">Remove</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Date</Label>
          <Input type="date" value={field.value.date} onChange={e => field.onChange({ ...field.value, date: e.target.value })} />
        </div>
        <div>
          <Label>Technician Time</Label>
          <Input value={field.value.technicianTime} onChange={e => field.onChange({ ...field.value, technicianTime: e.target.value })} />
        </div>
        <div>
          <Label>Technician OT</Label>
          <Input value={field.value.technicianOvertime} onChange={e => field.onChange({ ...field.value, technicianOvertime: e.target.value })} />
        </div>
      </div>
      {/* Additional fields for helperTime, helperOvertime, remoteWork, notes... */}
    </div>
  );
};

export default ServiceNotesSection;
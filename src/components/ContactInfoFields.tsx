import { FC } from "react";
import { UseControllerProps, useController } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServiceReportFormValues } from "@/schemas/serviceReportSchema";

type Props = UseControllerProps<ServiceReportFormValues, "contact">;

const ContactInfoFields: FC<Props> = ({ name, control }) => {
  const { field } = useController({ name, control });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <Label>Name</Label>
        <Input value={field.value.name} onChange={e => field.onChange({ ...field.value, name: e.target.value })} />
      </div>
      <div>
        <Label>Email</Label>
        <Input value={field.value.email} onChange={e => field.onChange({ ...field.value, email: e.target.value })} />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={field.value.phone} onChange={e => field.onChange({ ...field.value, phone: e.target.value })} />
      </div>
    </div>
  );
};

export default ContactInfoFields;
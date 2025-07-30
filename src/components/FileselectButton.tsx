import React, { useRef, ChangeEvent } from 'react';
import { Button } from './ui/button';

interface FileSelectButtonProps {
  /** Handler called with the selected FileList (or null if the dialog is cancelled) */
  onFilesSelected: (files: FileList | null) => void;
  /** Whether to allow multiple file selection */
  multiple?: boolean;
  /** Accepted file types, e.g. ".png, .jpg, application/pdf" */
  accept?: string;
  /** Button label */
  label?: string;
}

export const FileSelectButton: React.FC<FileSelectButtonProps> = ({
  onFilesSelected,
  multiple = false,
  accept,
  label = 'Select File',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(e.target.files);
    // reset value so selecting the same file again still fires onChange
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-md">
      <Button variant="outline" onClick={handleButtonClick} type="button">
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        aria-label="File select input"
        className="w-full max-w-96"
      />
    </div>
  );
};
